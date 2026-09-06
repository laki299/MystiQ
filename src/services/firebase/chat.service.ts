import { ref, push, set, onValue } from 'firebase/database';
import { rtdb } from '../../config/firebase.config';
import { ChatMessage } from '../../types/chat.types';
import { UserProfile } from '../../types/user.types';

const MESSAGE_TTL_HOURS = 2; // Messages automatically disappear after 2 hours

export const sendChatMessage = async (
  categoryId: string, 
  profile: UserProfile, 
  text: string
): Promise<void> => {
  const messagesRef = ref(rtdb, `chats/${categoryId}`);
  const newMessageRef = push(messagesRef);
  
  const now = Date.now();
  const messageData: ChatMessage = {
    id: newMessageRef.key as string,
    categoryId,
    senderUid: profile.uid,
    senderName: profile.anonymousName,
    senderAvatar: profile.avatar || '',
    text: text.trim(),
    createdAt: now,
    expiresAt: now + MESSAGE_TTL_HOURS * 3600 * 1000
  };

  await set(newMessageRef, messageData);
};

export const subscribeToCategoryChat = (
  categoryId: string, 
  callback: (messages: ChatMessage[]) => void
) => {
  const messagesRef = ref(rtdb, `chats/${categoryId}`);
  
  return onValue(messagesRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const now = Date.now();
      const messages: ChatMessage[] = [];

      Object.values(data).forEach((msg: any) => {
        // Filter out expired messages
        if (msg.expiresAt > now) {
          messages.push(msg);
        }
      });

      // Sort by chronological order (oldest to newest)
      messages.sort((a, b) => a.createdAt - b.createdAt);
      callback(messages);
    } else {
      callback([]);
    }
  });
};

