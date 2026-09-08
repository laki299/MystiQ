export type ChatRequestStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export interface ChatRequest {
  id: string;
  fromUid: string;
  toUid: string;
  categoryId: string;
  fromName: string;
  fromAvatar: string;
  createdAt: number;
  expiresAt: number;
  status: ChatRequestStatus;
}
