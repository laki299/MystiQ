export interface DirectMessage {
  id: string;
  senderUid: string;
  text: string;
  createdAt: number;
  expiresAt: number;
}

export interface DMConversation {
  chatId: string;
  partnerUid: string;
  partnerName: string;
  partnerAvatar: string;
  lastMessage: string;
  lastMessageAt: number;
}

