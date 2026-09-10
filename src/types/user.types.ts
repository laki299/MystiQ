export type Gender = 'male' | 'female' | 'other' | 'unspecified';

export type UserRole = 'user' | 'admin' | 'super_admin';

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
