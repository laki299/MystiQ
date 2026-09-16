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
  maxConcurrentUsers: number;

  networkAdsEnabled: boolean;
  bannerAlwaysOn: boolean;
  interstitialOnEntry: boolean;
  firstInterstitialAfterSec: number;
  interstitialIntervalSec: number;
  maxInterstitialsPerSession: number;
  firstAdAfterSec: number;
  adIntervalSec: number;
  maxAdsPerSession: number;

  /** 10 coins = 1 poisha → 1000 coins = 1 BDT */
  coinsPerPoisha: number;

  /** প্রতি MultiTag ভিউ — 1000 coins = 1 BDT */
  coinsPerAdView: number;

  /** Adsterra rewarded (যদি চালু থাকে) */
  coinsPerRewardedVideo: number;
  rewardedAdsEnabledAdsterra: boolean;

  /** রেফার: 10 BDT = 10000 coins */
  referralBonusCoins: number;
  referralBonusAdsRequired: number;
  referralCommissionPercent: number;

  /** উইথড্র */
  minWithdrawBdt: number;
  minActiveReferralsForWithdraw: number;
  minChatMinutesPerDay: number;

  hostPoolPercent: number;
  minWithdrawCoins: number;
}

export interface AdNetworkConfig {
  id: string;
  name: string;
  scriptUrl: string;
  zoneId?: string;
  containerId?: string;
  type: 'banner' | 'interstitial' | 'script' | 'multitag' | 'rewarded';
  enabled: boolean;
  order: number;
  weight: number;
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

export interface CoinPool {
  totalCoins: number;
  updatedAt?: number;
}

export interface CoinLog {
  id: string;
  type: string;
  amount: number;
  uid?: string;
  note?: string;
  createdAt: number;
}

export interface WithdrawRequest {
  id: string;
  uid: string;
  anonymousName?: string;
  username?: string;
  amountBdt: number;
  amountCoins: number;
  method?: string;
  accountNumber?: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  note?: string;
  createdAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
  activeReferrals?: number;
  chatMinutesToday?: number;
}

export interface RegisteredUserRow {
  uid: string;
  username: string;
  anonymousName: string;
  role?: string;
  hostCoins?: number;
  coins?: number;
  createdAt?: number;
  lastActiveAt?: number;
  gender?: string;
  city?: string;
  referralCode?: string;
  adsWatchedTotal?: number;
  qualifiedReferralsCount?: number;
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
