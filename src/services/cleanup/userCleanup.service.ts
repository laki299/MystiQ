import { ref, get, update } from 'firebase/database';
import { rtdb } from '../../config/firebase.config';

export interface ExpiredItemsCount {
  total: number;
  messagePaths: string[];
  requestPaths: string[];
}

export const scanUserExpiredItems = async (
  uid: string
): Promise<ExpiredItemsCount> => {
  const now = Date.now();
  const result: ExpiredItemsCount = {
    total: 0,
    messagePaths: [],
    requestPaths: [],
  };

  try {
    // Expired messages in conversations where user is participant
    const convsSnap = await get(ref(rtdb, 'conversations'));
    if (convsSnap.exists()) {
      const convs = convsSnap.val();
      for (const convId of Object.keys(convs)) {
        if (!convs[convId]?.participants?.[uid]) continue;

        const msgSnap = await get(ref(rtdb, `messages/${convId}`));
        if (msgSnap.exists()) {
          const msgs = msgSnap.val();
          for (const msgId of Object.keys(msgs)) {
            if (msgs[msgId]?.expiresAt <= now) {
              result.messagePaths.push(`messages/\( {convId}/ \){msgId}`);
              result.total++;
            }
          }
        }
      }
    }

    // Expired chat requests involving user
    const reqSnap = await get(ref(rtdb, 'chatRequests'));
    if (reqSnap.exists()) {
      const reqs = reqSnap.val();
      for (const reqId of Object.keys(reqs)) {
        const r = reqs[reqId];
        if (
          (r.fromUid === uid || r.toUid === uid) &&
          r.expiresAt <= now
        ) {
          result.requestPaths.push(`chatRequests/${reqId}`);
          result.total++;
        }
      }
    }
  } catch (err) {
    console.error('[Scan Expired Data Error]:', err);
  }

  return result;
};

export const purgeUserExpiredData = async (
  uid: string,
  items: ExpiredItemsCount
): Promise<boolean> => {
  try {
    const updates: Record<string, null> = {};
    items.messagePaths.forEach((path) => {
      updates[path] = null;
    });
    items.requestPaths.forEach((path) => {
      updates[path] = null;
    });

    if (Object.keys(updates).length > 0) {
      await update(ref(rtdb), updates);
    }
    return true;
  } catch (error) {
    console.error('[Purge Error]:', error);
    return false;
  }
};
