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

  /** Master switch — OFF = কোনো নেটওয়ার্ক অ্যাড নয় */
  networkAdsEnabled: boolean;

  /** চ্যাট চলাকালীন ছোট ব্যানার সবসময় */
  bannerAlwaysOn: boolean;

  /** অ্যাপে প্রথম ঢোকার পর ফুলস্ক্রিন */
  interstitialOnEntry: boolean;

  /** প্রথম ফুলস্ক্রিন কত সেকেন্ড পর (ডিফল্ট ৮) */
  firstInterstitialAfterSec: number;

  /** পরের ফুলস্ক্রিন প্রতি কত সেকেন্ড (ডিফল্ট ৬০০ = ১০ মিনিট) */
  interstitialIntervalSec: number;

  /** এক সেশনে ম্যাক্স ফুলস্ক্রিন */
  maxInterstitialsPerSession: number;

  /** লেগেসি / রিওয়ার্ডেড টাইমিং (ব্যবহার না করলেও সেভ থাকে) */
  firstAdAfterSec: number;
  adIntervalSec: number;
  maxAdsPerSession: number;

  coinsPerAdView: number;
  hostPoolPercent: number;
  minWithdrawCoins: number;
}

export interface AdNetworkConfig {
  id: string;
  name: string;
  scriptUrl: string;
  /** Monetag zone id — dataset.zone */
  zoneId?: string;
  containerId?: string;
  /**
   * banner      = ছোট ব্যানার (চ্যাটে সবসময়)
   * interstitial = ফুলস্ক্রিন / ভিডিও / পপ
   * script      = জেনেরিক (ইন্টারস্টিশিয়াল ওয়াটারফলেও ব্যবহার)
   */
  type: 'banner' | 'interstitial' | 'script';
  enabled: boolean;
  /** ওয়াটারফল অর্ডার — ছোট সংখ্যা আগে (1 = Monetag, 2 = পরের কোম্পানি…) */
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
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  note?: string;
  createdAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
}

export interface RegisteredUserRow {
  uid: string;
  username: string;
  anonymousName: string;
  role?: string;
  hostCoins?: number;
  createdAt?: number;
  lastActiveAt?: number;
  gender?: string;
  city?: string;
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
