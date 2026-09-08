export type MessageType = 'text' | 'voice';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  type: MessageType;
  text?: string;
  storagePath?: string;
  duration?: number;
  createdAt: number;
  expiresAt: number;
}

export interface Conversation {
  id: string;
  participants: Record<string, boolean>;
  categoryId: string;
  createdAt: number;
  lastActivityAt: number;
  status: 'active' | 'closed';
}
