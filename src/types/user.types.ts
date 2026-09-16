export type Gender = 'male' | 'female' | 'other' | 'unspecified';

export type UserRole = 'user' | 'host' | 'admin' | 'super_admin';

export interface UserProfile {
  uid: string;
  username: string;
  anonymousName: string;
  avatar: string;
  age: number;
  gender: Gender;
  country: string;
  city: string;
  language: string;
  profession: string;
  interests: string[];
  bio: string;
  role?: UserRole;
  hostCoins?: number;

  /** মেইন ওয়ালেট (সব রিওয়ার্ড এখানে) */
  coins?: number;
  lifetimeCoins?: number;

  /** রেফার */
  referralCode?: string;
  referredBy?: string;
  referredByCode?: string;
  adsWatchedTotal?: number;
  adsWatchedToday?: number;
  adsWatchedTodayDate?: string;
  activeReferralsCount?: number;
  qualifiedReferralsCount?: number;
  deviceId?: string;

  /** চ্যাট অ্যাক্টিভিটি (উইথড্র শর্ত) */
  chatActiveMinutesToday?: number;
  chatActiveDate?: string;
  totalChatMinutes?: number;

  preferences?: {
    showAge?: boolean;
    showCity?: boolean;
  };
  activeCategories?: Record<string, boolean>;
  createdAt: number;
  lastActiveAt: number;
  lastProfileUpdate?: number;
  accountStatus?: 'active' | 'warn' | 'suspend' | 'block';
}
