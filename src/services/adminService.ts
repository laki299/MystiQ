import { rtdb } from '../config/firebase.config';
import { ref, get, query, orderByChild, endAt, remove, push, set, update } from 'firebase/database';
import { AuditLog, AdminRole, SystemAnalytics, AdItem, AppSettings, UserReport } from '../types/admin';

// Audit Log রেকর্ড তৈরি
export const logAdminAction = async (adminUid: string, role: AdminRole, action: string, details: string) => {
  const logRef = push(ref(rtdb, 'audit_logs'));
  const logData: AuditLog = {
    id: logRef.key!,
    adminUid,
    adminRole: role,
    action,
    details,
    timestamp: Date.now()
  };
  await set(logRef, logData);
};

// নিরাপদ Expired Data Cleanup Rule: expiresAt <= current server time
export const cleanupExpiredMessages = async (adminUid: string, role: AdminRole) => {
  const now = Date.now();
  const messagesQuery = query(ref(rtdb, 'messages'), orderByChild('expiresAt'), endAt(now));
  
  const snapshot = await get(messagesQuery);
  if (snapshot.exists()) {
    let deletedCount = 0;
    const promises: Promise<void>[] = [];
    
    snapshot.forEach((child) => {
      promises.push(remove(ref(rtdb, `messages/${child.key}`)));
      deletedCount++;
    });

    await Promise.all(promises);
    await logAdminAction(adminUid, role, 'CLEANUP_EXPIRED_MESSAGES', `Deleted ${deletedCount} expired messages`);
    return deletedCount;
  }
  return 0;
};

// System Analytics ফেচ করা
export const fetchSystemAnalytics = async (): Promise<SystemAnalytics> => {
  const [usersSnap, presenceSnap, chatsSnap, directSnap, reportsSnap] = await Promise.all([
    get(ref(rtdb, 'users')),
    get(ref(rtdb, 'presence')),
    get(ref(rtdb, 'chats')),
    get(ref(rtdb, 'direct_chats')),
    get(ref(rtdb, 'reports'))
  ]);

  const totalUsers = usersSnap.exists() ? Object.keys(usersSnap.val()).length : 0;
  
  let activeUsersNow = 0;
  if (presenceSnap.exists()) {
    const presenceData = presenceSnap.val();
    Object.keys(presenceData).forEach((cat) => {
      activeUsersNow += Object.keys(presenceData[cat] || {}).length;
    });
  }

  const activePublicChats = chatsSnap.exists() ? Object.keys(chatsSnap.val()).length : 0;
  const totalDirectConversations = directSnap.exists() ? Object.keys(directSnap.val()).length : 0;
  
  let totalReportsPending = 0;
  if (reportsSnap.exists()) {
    const reports = reportsSnap.val();
    Object.keys(reports).forEach((id) => {
      if (reports[id]?.status === 'pending') totalReportsPending++;
    });
  }

  const rawDataString = JSON.stringify({
    u: usersSnap.val() || {},
    p: presenceSnap.val() || {},
    c: chatsSnap.val() || {}
  });
  const estimatedRtdbSizeKb = parseFloat((new Blob([rawDataString]).size / 1024).toFixed(2));

  return {
    totalUsers,
    activeUsersNow,
    inactiveUsers: Math.max(0, totalUsers - activeUsersNow),
    activePublicChats,
    totalDirectConversations,
    totalReportsPending,
    estimatedRtdbSizeKb
  };
};

// ------------------- AD MANAGER SERVICES -------------------

export const fetchAllAds = async (): Promise<AdItem[]> => {
  const snapshot = await get(ref(rtdb, 'ads'));
  if (!snapshot.exists()) return [];

  const adsData = snapshot.val();
  const adsList: AdItem[] = Object.keys(adsData).map((key) => ({
    id: key,
    ...adsData[key]
  }));

  return adsList.sort((a, b) => (a.order || 0) - (b.order || 0));
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
    views: 0
  };

  await set(newAdRef, newAd);
  await logAdminAction(adminUid, role, 'CREATE_AD', `Created new ad: ${adData.title}`);
  return newAd;
};

export const updateAdStatus = async (
  adminUid: string,
  role: AdminRole,
  adId: string,
  status: 'active' | 'paused'
) => {
  await update(ref(rtdb, `ads/${adId}`), { status });
  await logAdminAction(adminUid, role, 'UPDATE_AD_STATUS', `Updated ad ${adId} status to ${status}`);
};

export const deleteAd = async (adminUid: string, role: AdminRole, adId: string) => {
  await remove(ref(rtdb, `ads/${adId}`));
  await logAdminAction(adminUid, role, 'DELETE_AD', `Deleted ad ID: ${adId}`);
};

// ------------------- APP SETTINGS SERVICES -------------------

export const fetchAppSettings = async (): Promise<AppSettings> => {
  const snapshot = await get(ref(rtdb, 'app_settings'));
  if (snapshot.exists()) {
    return snapshot.val() as AppSettings;
  }
  
  return {
    textExpiryMinutes: 60,
    voiceDailyLimit: 10,
    maxVoiceDurationSec: 30,
    presenceTimeoutSec: 120,
    requestExpirySec: 300,
    inactiveThresholdDays: 30,
    rewardDurationHours: 24,
    rewardedAdsEnabled: true
  };
};

export const updateAppSettings = async (
  adminUid: string,
  role: AdminRole,
  settings: AppSettings
) => {
  await set(ref(rtdb, 'app_settings'), settings);
  await logAdminAction(adminUid, role, 'UPDATE_APP_SETTINGS', 'Updated global application settings');
};

// ------------------- USER REPORTS SERVICES -------------------

// সব রিপোর্ট ফেচ করা
export const fetchUserReports = async (): Promise<UserReport[]> => {
  const snapshot = await get(ref(rtdb, 'reports'));
  if (!snapshot.exists()) return [];

  const reportsData = snapshot.val();
  const reportsList: UserReport[] = Object.keys(reportsData).map((key) => ({
    id: key,
    ...reportsData[key]
  }));

  return reportsList.sort((a, b) => b.createdAt - a.createdAt);
};

// রিপোর্ট রিভিউ ও মডারেশন অ্যাকশন নেওয়া
export const resolveUserReport = async (
  adminUid: string,
  role: AdminRole,
  reportId: string,
  targetUid: string,
  status: 'reviewed' | 'resolved' | 'dismissed',
  actionTaken: 'none' | 'warn' | 'suspend' | 'block'
) => {
  await update(ref(rtdb, `reports/${reportId}`), {
    status,
    actionTaken
  });

  // যদি অ্যাকশন হিসেবে ব্লক বা সাসপেন্ড করা হয় তবে ইউজার প্রোফাইলে আপডেট
  if (actionTaken === 'block' || actionTaken === 'suspend') {
    await update(ref(rtdb, `users/${targetUid}`), {
      accountStatus: actionTaken,
      updatedAt: Date.now()
    });
  }

  await logAdminAction(
    adminUid, 
    role, 
    'RESOLVE_REPORT', 
    `Report ${reportId} marked as ${status} with action: ${actionTaken} on target ${targetUid}`
  );
};
