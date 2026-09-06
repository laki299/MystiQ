export interface UserReport {
  id: string;
  reporterUid: string;
  reportedUid: string;
  messageId?: string;
  reason: string;
  createdAt: number;
}

export interface BlockedUser {
  blockedUid: string;
  blockedName: string;
  blockedAt: number;
}

