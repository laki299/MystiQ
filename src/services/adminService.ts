import { rtdb } from '../config/firebase.config';
import { ref, get, query, orderByChild, endAt, remove, push, set, update } from 'firebase/database';
import { AuditLog, AdminRole, SystemAnalytics, AdItem } from '../types/admin';

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

// সব অ্যাড ফেচ করা
export const fetchAllAds = async (): Promise<AdItem[]> => {
  const snapshot = await get(ref(rtdb, 'ads'));
  if (!snapshot.exists()) return [];

  const adsData = snapshot.val();
  const adsList: AdItem[] = Object.keys(adsData).map((key) => ({
    id: key,
    ...adsData[key]
  }));

  // অর্ডার অনুযায়ী সর্ট করা
  return adsList.sort((a, b) => (a.order || 0) - (b.order || 0));
};

// নতুন অ্যাড যোগ করা
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

// অ্যাড স্ট্যাটাস (Active/Paused) আপডেট
export const updateAdStatus = async (
  adminUid: string,
  role: AdminRole,
  adId: string,
  status: 'active' | 'paused'
) => {
  await update(ref(rtdb, `ads/${adId}`), { status });
  await logAdminAction(adminUid, role, 'UPDATE_AD_STATUS', `Updated ad ${adId} status to ${status}`);
};

// অ্যাড মুছে ফেলা
export const deleteAd = async (adminUid: string, role: AdminRole, adId: string) => {
  await remove(ref(rtdb, `ads/${adId}`));
  await logAdminAction(adminUid, role, 'DELETE_AD', `Deleted ad ID: ${adId}`);
};
