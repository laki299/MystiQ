import { ref, push, set, update, onValue, get } from 'firebase/database';
import { rtdb } from '../../config/firebase.config';
import { ChatMessage, Conversation } from '../../types/chat.types';
import { APP_CONFIG } from '../../config/app.config';


  uid2: string,
  categoryId: string
): Promise<string> => {
  const conversationsRef = ref(rtdb, 'conversations');
  const newRef = push(conversationsRef);
  const now = Date.now();

  const data: Conversation = {
    id: newRef.key as string,
    participants: {
      [uid1]: true,
      [uid2]: true,
    },
    categoryId,
    createdAt: now,
    lastActivityAt: now,
    status: 'active',
  };

  await set(newRef, data);
  return data.id;
};

export const findExistingConversation = async (
  uid1: string,
  uid2: string,
  categoryId: string
): Promise<string | null> => {
  const snapshot = await get(ref(rtdb, 'conversations'));
  if (!snapshot.exists()) return null;

  const all = snapshot.val();
  for (const key of Object.keys(all)) {
    const c = all[key];
    if (
      c.status === 'active' &&
      c.categoryId === categoryId &&
      c.participants?.[uid1] &&
      c.participants?.[uid2]
    ) {
      return key;
    }
  }
  return null;
};

export const getOrCreateConversation = async (
  uid1: string,
  uid2: string,
  categoryId: string
): Promise<string> => {
  const existing = await findExistingConversation(uid1, uid2, categoryId);
  if (existing) return existing;
  return createConversation(uid1, uid2, categoryId);
};

export const sendTextMessage = async (
  conversationId: string,
  senderId: string,
  text: string
): Promise<void> => {
  const messagesRef = ref(rtdb, `messages/${conversationId}`);
  const newRef = push(messagesRef);
  const now = Date.now();

  const message: ChatMessage = {
    id: newRef.key as string,
    conversationId,
    senderId,
    type: 'text',
    text: text.trim(),
    createdAt: now,
    expiresAt: now + APP_CONFIG.limits.textExpirySeconds * 1000,
  };

  await set(newRef, message);
  await update(ref(rtdb, `conversations/${conversationId}`), {
    lastActivityAt: now,
  });
};

export const subscribeToMessages = (
  conversationId: string,
  callback: (messages: ChatMessage[]) => void
) => {
  const messagesRef = ref(rtdb, `messages/${conversationId}`);

  return onValue(messagesRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }

    const data = snapshot.val();
    const now = Date.now();
    const messages: ChatMessage[] = [];

    Object.values(data).forEach((msg: any) => {
      if (msg && msg.expiresAt > now) {
        messages.push(msg as ChatMessage);
      }
    });

    messages.sort((a, b) => a.createdAt - b.createdAt);
    callback(messages);
  });
};

export const subscribeToUserConversations = (
  uid: string,
  callback: (conversations: Conversation[]) => void
) => {
  const conversationsRef = ref(rtdb, 'conversations');

  return onValue(conversationsRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }

    const data = snapshot.val();
    const list: Conversation[] = [];

    Object.values(data).forEach((c: any) => {
      if (c?.participants?.[uid] && c.status === 'active') {
        list.push(c as Conversation);
      }
    });

    list.sort((a, b) => b.lastActivityAt - a.lastActivityAt);
    callback(list);
  });
};
