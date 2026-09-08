export interface UserReport {
  id: string;
  reporterId: string;
  targetId: string;
  messageId?: string;
  reason: string;
  createdAt: number;
  status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  actionTaken?: 'none' | 'warn' | 'suspend' | 'block';
}

export interface BlockedUser {
  blockedUid: string;
  blockedAt: number;
}
