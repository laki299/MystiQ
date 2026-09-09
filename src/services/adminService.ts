import { rtdb } from '../config/firebase.config';
import {
  ref,
  get,
  query,
  orderByChild,
  limitToLast,
  remove,
  push,
  set,
  update,
} from 'firebase/database';
import {
  AuditLog,
  AdminRole,
  SystemAnalytics,
  AdItem,
  AppSettings,
  UserReport,
} from '../types/admin';

export const logAdminAction = async (
  adminUid: string,
  role: AdminRole,
  action: string,
  details: string
) => {
  const logRef = push(ref(rtdb, 'audit_logs'));
  const logData: AuditLog = {
    id: logRef.key!,
    adminUid,
    adminRole: role,
    action,
    details,
    timestamp: Date.now(),
  };
  await set(logRef, logData);
};

export const fetchSystemAnalytics = async (): Promise<SystemAnalytics> => {
  const [usersSnap, presenceSnap, convSnap, reqSnap, reportsSnap] =
    await Promise.all([
      get(ref(rtdb, 'users')),
      get(ref(rtdb, 'presence')),
      get(ref(rtdb, 'conversations')),
      get(ref(rtdb, 'chatRequests')),
      get(ref(rtdb, 'reports')),
    ]);

  const now = Date.now();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todayStart = startOfDay.getTime();

  let totalUsers = 0;
  let todayNewUsers = 0;
  let inactiveUsers = 0;

  if (usersSnap.exists()) {
    const users = usersSnap.val();
    const uids = Object.keys(users);
    totalUsers = uids.length;

    uids.forEach((uid) => {
      const u = users[uid];
      if (u?.createdAt && u.createdAt >= todayStart) todayNewUsers++;
      if (u?.lastActiveAt && now - u.lastActiveAt > 30 * 24 * 60 * 60 * 1000) {
        inactiveUsers++;
      }
    });
  }

  let activeUsersNow = 0;
  if (presenceSnap.exists()) {
    const presenceData = presenceSnap.val();
    const unique = new Set<string>();
    Object.keys(presenceData).forEach((cat) => {
      const catUsers = presenceData[cat] || {};
      Object.keys(catUsers).forEach((uid) => {
        const p = catUsers[uid];
        if (p?.expiresAt > now) unique.add(uid);
      });
    });
    activeUsersNow = unique.size;
  }

  let totalDirectConversations = 0;
  if (convSnap.exists()) {
    totalDirectConversations = Object.keys(convSnap.val()).length;
  }

  let totalPendingRequests = 0;
  if (reqSnap.exists()) {
    const reqs = reqSnap.val();
    Object.keys(reqs).forEach((id) => {
      const r = reqs[id];
      if (r?.status === 'pending' && r.expiresAt > now) totalPendingRequests++;
    });
  }

  let totalReportsPending = 0;
  if (reportsSnap.exists()) {
    const reports = reportsSnap.val();
    Object.keys(reports).forEach((id) => {
      if (reports[id]?.status === 'pending') totalReportsPending++;
    });
  }

  const raw = JSON.stringify({
    u: usersSnap.val() || {},
    p: presenceSnap.val() || {},
    c: convSnap.val() || {},
  });
  const estimatedRtdbSizeKb = parseFloat((new Blob([raw]).size / 1024).toFixed(2));

  return {
    totalUsers,
    activeUsersNow,
    inactiveUsers,
    todayNewUsers,
    activePublicChats: 0,
    totalDirectConversations,
    totalReportsPending,
    totalPendingRequests,
    estimatedRtdbSizeKb,
  };
};

export const fetchAllAds = async (): Promise<AdItem[]> => {
  const snapshot = await get(ref(rtdb, 'ads'));
  if (!snapshot.exists()) return [];
  const adsData = snapshot.val();
  return Object.keys(adsData)
    .map((key) => ({ id: key, ...adsData[key] }))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
};

export const createAd = async (
  adminUid: string,
  role: AdminRole,
  adData: Omit<AdItem, 'id' | 'clicks' | 'views'>
) => {
  const newAdRef = push(ref(rtdb, 'ads'));
  const newAd: AdItem = {
    id: newAdRef.key!,
    title: adData.title,
    link: adData.link,
    status: adData.status || 'active',
    order: adData.order || 0,
    clicks: 0,
    views: 0,
  };
  await set(newAdRef, newAd);
  await logAdminAction(adminUid, role, 'CREATE_AD', `Created ad: ${adData.title}`);
  return newAd;
};

export const updateAdStatus = async (
  adminUid: string,
  role: AdminRole,
  adId: string,
  status: 'active' | 'paused'
) => {
  await update(ref(rtdb, `ads/${adId}`), { status });
  await logAdminAction(adminUid, role, 'UPDATE_AD_STATUS', `Ad ${adId} → ${status}`);
};

export const deleteAd = async (adminUid: string, role: AdminRole, adId: string) => {
  await remove(ref(rtdb, `ads/${adId}`));
  await logAdminAction(adminUid, role, 'DELETE_AD', `Deleted ad ${adId}`);
};

export const fetchAppSettings = async (): Promise<AppSettings> => {
  const snapshot = await get(ref(rtdb, 'app_settings'));
  const defaults: AppSettings = {
    textExpiryMinutes: 2.5,
    voiceDailyLimit: 25,
    maxVoiceDurationSec: 60,
    presenceTimeoutSec: 45,
    requestExpirySec: 300,
    inactiveThresholdDays: 30,
    rewardDurationHours: 8,
    rewardedAdsEnabled: false,
    appDownloadUrl: 'https://mysti-q-flame.vercel.app',
    shareMessage: 'MystiQ — Anonymous chat. Download / open here:',
  };
  if (!snapshot.exists()) return defaults;
  return { ...defaults, ...snapshot.val() };
};

export const updateAppSettings = async (
  adminUid: string,
  role: AdminRole,
  settings: AppSettings
) => {
  await set(ref(rtdb, 'app_settings'), settings);
  await logAdminAction(adminUid, role, 'UPDATE_APP_SETTINGS', 'Updated global settings');
};

export const fetchUserReports = async (): Promise<UserReport[]> => {
  const snapshot = await get(ref(rtdb, 'reports'));
  if (!snapshot.exists()) return [];
  const reportsData = snapshot.val();
  return Object.keys(reportsData)
    .map((key) => ({ id: key, ...reportsData[key] }))
    .sort((a, b) => b.createdAt - a.createdAt);
};

export const resolveUserReport = async (
  adminUid: string,
  role: AdminRole,
  reportId: string,
  targetUid: string,
  status: 'reviewed' | 'resolved' | 'dismissed',
  actionTaken: 'none' | 'warn' | 'suspend' | 'block'
) => {
  await update(ref(rtdb, `reports/${reportId}`), { status, actionTaken });

  if (actionTaken === 'block' || actionTaken === 'suspend' || actionTaken === 'warn') {
    await update(ref(rtdb, `users/${targetUid}`), {
      accountStatus: actionTaken === 'warn' ? 'warn' : actionTaken,
      lastProfileUpdate: Date.now(),
    });
  }

  await logAdminAction(
    adminUid,
    role,
    'RESOLVE_REPORT',
    `Report ${reportId} → ${status}, action: ${actionTaken}, target: ${targetUid}`
  );
};

export const fetchAuditLogs = async (limitCount: number = 100): Promise<AuditLog[]> => {
  const auditQuery = query(
    ref(rtdb, 'audit_logs'),
    orderByChild('timestamp'),
    limitToLast(limitCount)
  );
  const snapshot = await get(auditQuery);
  if (!snapshot.exists()) return [];
  const logsData = snapshot.val();
  return Object.keys(logsData)
    .map((key) => ({ id: key, ...logsData[key] }))
    .sort((a, b) => b.timestamp - a.timestamp);
};

export const adminDeleteExpiredMessages = async (
  adminUid: string,
  role: AdminRole
): Promise<number> => {
  const now = Date.now();
  let deleted = 0;
  const convSnap = await get(ref(rtdb, 'conversations'));
  if (!convSnap.exists()) return 0;

  const updates: Record<string, null> = {};
  const convs = convSnap.val();

  for (const convId of Object.keys(convs)) {
    const msgSnap = await get(ref(rtdb, `messages/${convId}`));
    if (!msgSnap.exists()) continue;
    const msgs = msgSnap.val();
    for (const msgId of Object.keys(msgs)) {
      if (msgs[msgId]?.expiresAt <= now) {
        updates[`messages/\( {convId}/ \){msgId}`] = null;
        deleted++;
      }
    }
  }

  if (deleted > 0) {
    await update(ref(rtdb), updates);
    await logAdminAction(
      adminUid,
      role,
      'CLEANUP_EXPIRED_MESSAGES',
      `Deleted ${deleted} expired messages`
    );
  }
  return deleted;
};
