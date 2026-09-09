export type AdminRole = 'super_admin' | 'moderator' | 'ad_manager';

export interface AdminUser {
  uid: string;
  role: AdminRole;
  assignedAt: number;
  assignedBy?: string;
}

export interface AppSettings {
  textExpiryMinutes: number;
  voiceDailyLimit: number;
  maxVoiceDurationSec: number;
  presenceTimeoutSec: number;
  requestExpirySec: number;
  inactiveThresholdDays: number;
  rewardDurationHours: number;
  rewardedAdsEnabled: boolean;
  appDownloadUrl: string;
  shareMessage: string;
}

export interface AdItem {
  id: string;
  title: string;
  link: string;
  status: 'active' | 'paused';
  order: number;
  clicks: number;
  views: number;
}

export interface UserReport {
  id: string;
  reporterId?: string;
  reporterUid?: string;
  targetId?: string;
  targetUid?: string;
  reason: string;
  createdAt: number;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  actionTaken?: 'none' | 'warn' | 'suspend' | 'block';
}

export interface AuditLog {
  id: string;
  adminUid: string;
  adminRole: AdminRole;
  action: string;
  details: string;
  timestamp: number;
}

export interface SystemAnalytics {
  totalUsers: number;
  activeUsersNow: number;
  inactiveUsers: number;
  todayNewUsers: number;
  activePublicChats: number;
  totalDirectConversations: number;
  totalReportsPending: number;
  totalPendingRequests: number;
  estimatedRtdbSizeKb: number;
}
