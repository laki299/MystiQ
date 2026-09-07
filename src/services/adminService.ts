import { rtdb } from '../config/firebase.config';
import { ref, get, query, orderByChild, endAt, remove, push, set } from 'firebase/database';
import { AuditLog, AdminRole, SystemAnalytics } from '../types/admin';

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
