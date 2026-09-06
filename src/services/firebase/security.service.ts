import { ref, push, set, remove, onValue } from 'firebase/database';
import { rtdb } from '../../config/firebase.config';
import { UserReport } from '../../types/security.types';

// Report a user or specific message
export const reportUserOrMessage = async (
  reporterUid: string,
  reportedUid: string,
  reason: string,
  messageId?: string
): Promise<void> => {
  const reportsRef = ref(rtdb, 'reports');
  const newReportRef = push(reportsRef);

  const reportData: UserReport = {
    id: newReportRef.key as string,
    reporterUid,
    reportedUid,
    messageId,
    reason,
    createdAt: Date.now()
  };

  await set(newReportRef, reportData);
};

// Block a user
export const blockUser = async (
  reporterUid: string,
  targetUid: string,
  targetName: string
): Promise<void> => {
  const blockRef = ref(rtdb, `blocks/${reporterUid}/${targetUid}`);
  await set(blockRef, {
    blockedUid: targetUid,
    blockedName: targetName,
    blockedAt: Date.now()
  });
};

// Unblock a user
export const unblockUser = async (
  reporterUid: string,
  targetUid: string
): Promise<void> => {
  const blockRef = ref(rtdb, `blocks/${reporterUid}/${targetUid}`);
  await remove(blockRef);
};

// Subscribe to blocked users list
export const subscribeToBlockedUsers = (
  reporterUid: string,
  callback: (blockedUids: string[]) => void
) => {
  const blocksRef = ref(rtdb, `blocks/${reporterUid}`);

  return onValue(blocksRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      callback(Object.keys(data));
    } else {
      callback([]);
    }
  });
};

