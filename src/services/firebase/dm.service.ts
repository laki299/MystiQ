import { ref, push, set, onValue } from 'firebase/database';
import { rtdb } from '../../config/firebase.config';
import { DirectMessage } from '../../types/dm.types';

const DM_TTL_HOURS = 24; // DMs expire in 24 hours

// Generate deterministic Chat ID for 2 users
export const getDMChatId = (uid1: string, uid2: string): string => {
  return [uid1, uid2].sort().join('_');
};

export const sendDirectMessage = async (
  senderUid: string,
  receiverUid: string,
  text: string
): Promise<void> => {
  const chatId = getDMChatId(senderUid, receiverUid);
  const messagesRef = ref(rtdb, `direct_chats/${chatId}/messages`);
  const newMessageRef = push(messagesRef);

  const now = Date.now();
  const messageData: DirectMessage = {
    id: newMessageRef.key as string,
    senderUid,
    text: text.trim(),
    createdAt: now,
    expiresAt: now + DM_TTL_HOURS * 3600 * 1000
  };

  await set(newMessageRef, messageData);
};

export const subscribeToDMMessages = (
  senderUid: string,
  receiverUid: string,
  callback: (messages: DirectMessage[]) => void
) => {
  const chatId = getDMChatId(senderUid, receiverUid);
  const messagesRef = ref(rtdb, `direct_chats/${chatId}/messages`);

  return onValue(messagesRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const now = Date.now();
      const messages: DirectMessage[] = [];

      Object.values(data).forEach((msg: any) => {
        if (msg.expiresAt > now) {
          messages.push(msg);
        }
      });

      messages.sort((a, b) => a.createdAt - b.createdAt);
      callback(messages);
    } else {
      callback([]);
    }
  });
};

