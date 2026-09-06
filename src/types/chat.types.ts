export interface ChatMessage {
  id: string;
  categoryId: string;
  senderUid: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  createdAt: number;
  expiresAt: number;
}

