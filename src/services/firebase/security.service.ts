import { ref, push, set, remove, onValue, get } from 'firebase/database';
import { rtdb } from '../../config/firebase.config';
import { UserReport } from '../../types/security.types';

export const reportUserOrMessage = async (
  reporterId: string,
  targetId: string,
  reason: string,
  messageId?: string
): Promise<void> => {
  const reportsRef = ref(rtdb, 'reports');
  const newRef = push(reportsRef);

  const reportData = {
    id: newRef.key as string,
    reporterId,
    targetId,
    reason,
    messageId: messageId || null,
    createdAt: Date.now(),
    status: 'pending',
  };

  await set(newRef, reportData);
};

export const blockUser = async (
  uid: string,
  blockedUid: string
): Promise<void> => {
  await set(ref(rtdb, `blocks/\( {uid}/ \){blockedUid}`), true);
};

export const unblockUser = async (
  uid: string,
  blockedUid: string
): Promise<void> => {
  await remove(ref(rtdb, `blocks/\( {uid}/ \){blockedUid}`));
};

export const subscribeToBlockedUsers = (
  uid: string,
  callback: (blockedUids: string[]) => void
) => {
  const blocksRef = ref(rtdb, `blocks/${uid}`);

  return onValue(blocksRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    callback(Object.keys(snapshot.val()));
  });
};

export const isUserBlocked = async (
  uid: string,
  targetUid: string
): Promise<boolean> => {
  const snapshot = await get(ref(rtdb, `blocks/\( {uid}/ \){targetUid}`));
  return snapshot.exists();
};
