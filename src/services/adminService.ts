import { rtdb } from '../config/firebase.config';
import { ref, get, query, orderByChild, endAt, remove, push, set } from 'firebase/database';
import { AuditLog, AdminRole } from '../types/admin';

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

