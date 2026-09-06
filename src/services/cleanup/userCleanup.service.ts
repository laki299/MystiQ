import { ref, get, update } from 'firebase/database';
import { deleteObject, ref as storageRef } from 'firebase/storage';
import { rtdb, storage } from '../../config/firebase.config';

export interface ExpiredItemsCount {
  total: number;
  messagePaths: string[];
  voiceStoragePaths: string[];
  requestPaths: string[];
}

export const scanUserExpiredItems = async (uid: string): Promise<ExpiredItemsCount> => {
  const now = Date.now();
  const result: ExpiredItemsCount = {
    total: 0,
    messagePaths: [],
    voiceStoragePaths: [],
    requestPaths: []
  };

  try {
    const convsSnapshot = await get(ref(rtdb, 'conversations'));
    if (convsSnapshot.exists()) {
      const convs = convsSnapshot.val();
      
      for (const convId in convs) {
        if (convs[convId].participants && convs[convId].participants[uid]) {
          const msgSnapshot = await get(ref(rtdb, `messages/${convId}`));
          if (msgSnapshot.exists()) {
            const msgs = msgSnapshot.val();
            for (const msgId in msgs) {
              if (msgs[msgId].expiresAt <= now) {
                result.messagePaths.push(`messages/${convId}/${msgId}`);
                result.total++;
              }
            }
          }

          const voiceSnapshot = await get(ref(rtdb, `voiceMessages/${convId}`));
          if (voiceSnapshot.exists()) {
            const voices = voiceSnapshot.val();
            for (const msgId in voices) {
              if (voices[msgId].expiresAt <= now) {
                result.messagePaths.push(`voiceMessages/${convId}/${msgId}`);
                if (voices[msgId].senderId === uid && voices[msgId].storagePath) {
                  result.voiceStoragePaths.push(voices[msgId].storagePath);
                }
                result.total++;
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('[Scan Expired Data Error]:', err);
  }

  return result;
};

export const purgeUserExpiredData = async (uid: string, items: ExpiredItemsCount): Promise<boolean> => {
  try {
    const updates: Record<string, null> = {};

    items.messagePaths.forEach(path => { updates[path] = null; });
    items.requestPaths.forEach(path => { updates[path] = null; });

    if (Object.keys(updates).length > 0) {
      await update(ref(rtdb), updates);
    }

    for (const sPath of items.voiceStoragePaths) {
      try {
        await deleteObject(storageRef(storage, sPath));
      } catch (err) {
        console.warn(`[Storage Cleanup Warning] Failed to delete: ${sPath}`);
      }
    }

    return true;
  } catch (error) {
    console.error('[Purge Error]:', error);
    return false;
  }
};
              
