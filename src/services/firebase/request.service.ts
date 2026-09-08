import { ref, push, set, update, onValue, get } from 'firebase/database';
import { rtdb } from '../../config/firebase.config';
import { ChatRequest } from '../../types/request.types';
import { APP_CONFIG } from '../../config/app.config';

export const sendChatRequest = async (
  fromUid: string,
  toUid: string,
  categoryId: string,
  fromName: string,
  fromAvatar: string
): Promise<string> => {
  // Prevent spam: check existing pending request between same pair+category
  const existingSnap = await get(ref(rtdb, 'chatRequests'));
  if (existingSnap.exists()) {
    const all = existingSnap.val();
    const now = Date.now();
    for (const key of Object.keys(all)) {
      const r = all[key];
      if (
        r.fromUid === fromUid &&
        r.toUid === toUid &&
        r.categoryId === categoryId &&
        r.status === 'pending' &&
        r.expiresAt > now
      ) {
        throw new Error('Request already pending');
      }
    }
  }

  const requestsRef = ref(rtdb, 'chatRequests');
  const newRef = push(requestsRef);
  const now = Date.now();

  const data: ChatRequest = {
    id: newRef.key as string,
    fromUid,
    toUid,
    categoryId,
    fromName,
    fromAvatar: fromAvatar || '',
    createdAt: now,
    expiresAt: now + APP_CONFIG.limits.requestExpirySeconds * 1000,
    status: 'pending',
  };

  await set(newRef, data);
  return data.id;
};

export const respondToChatRequest = async (
  requestId: string,
  status: 'accepted' | 'rejected'
): Promise<void> => {
  await update(ref(rtdb, `chatRequests/${requestId}`), { status });
};

export const subscribeToIncomingRequests = (
  uid: string,
  callback: (requests: ChatRequest[]) => void
) => {
  const requestsRef = ref(rtdb, 'chatRequests');

  return onValue(requestsRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }

    const data = snapshot.val();
    const now = Date.now();
    const list: ChatRequest[] = [];

    Object.values(data).forEach((r: any) => {
      if (
        r.toUid === uid &&
        r.status === 'pending' &&
        r.expiresAt > now
      ) {
        list.push(r as ChatRequest);
      }
    });

    list.sort((a, b) => b.createdAt - a.createdAt);
    callback(list);
  });
};

export const subscribeToOutgoingRequests = (
  uid: string,
  callback: (requests: ChatRequest[]) => void
) => {
  const requestsRef = ref(rtdb, 'chatRequests');

  return onValue(requestsRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }

    const data = snapshot.val();
    const now = Date.now();
    const list: ChatRequest[] = [];

    Object.values(data).forEach((r: any) => {
      if (r.fromUid === uid && r.expiresAt > now) {
        list.push(r as ChatRequest);
      }
    });

    list.sort((a, b) => b.createdAt - a.createdAt);
    callback(list);
  });
};
