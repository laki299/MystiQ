export interface UserProfile {
  uid: string;
  anonymousName: string;
  avatar: string;
  age: number;
  gender: 'male' | 'female' | 'other' | 'unspecified';
  country: string;
  city: string;
  language: string;
  profession: string;
  interests: string[];
  bio: string;
  createdAt: number;
  lastActiveAt: number;
}

