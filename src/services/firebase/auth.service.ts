import {
  signInAnonymously,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  User,
} from 'firebase/auth';
import { ref, get, set, update } from 'firebase/database';
import { auth, rtdb } from '../../config/firebase.config';
import { UserProfile } from '../../types/user.types';

const RANDOM_NAMES = [
  'Shadow Soul',
  'Moon Walker',
  'Silent Heart',
  'Mystic One',
  'Dark Rose',
  'Cosmic Nomad',
  'Ocean Breeze',
  'Velvet Echo',
  'Night Whisper',
  'Crystal Drift',
];

const getRandomAnonymousName = (): string => {
  const name = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `\( {name} # \){num}`;
};

const loadOrCreateProfile = async (uid: string): Promise<UserProfile> => {
  const userRef = ref(rtdb, `users/${uid}`);
  const snapshot = await get(userRef);
  const now = Date.now();

  if (snapshot.exists()) {
    const existing = snapshot.val() as UserProfile;
    await update(userRef, { lastActiveAt: now });
    return { ...existing, lastActiveAt: now };
  }

  const newProfile: UserProfile = {
    uid,
    anonymousName: getRandomAnonymousName(),
    avatar: '',
    age: 0,
    gender: 'unspecified',
    country: '',
    city: '',
    language: 'en',
    profession: '',
    interests: [],
    bio: '',
    createdAt: now,
    lastActiveAt: now,
    lastProfileUpdate: now,
    accountStatus: 'active',
  };

  await set(userRef, newProfile);
  return newProfile;
};

/**
 * Persistent auth:
 * - First open → anonymous sign-in + new profile
 * - Next opens → same Firebase user restored from device storage
 */
export const autoAuthenticateAndSaveProfile = async (): Promise<UserProfile> => {
  await setPersistence(auth, browserLocalPersistence);

  // Already signed in on this device?
  if (auth.currentUser) {
    return loadOrCreateProfile(auth.currentUser.uid);
  }

  // Wait for Firebase to restore session from local storage
  const user = await new Promise<User | null>((resolve) => {
    const unsub = onAuthStateChanged(auth, (u) => {
      unsub();
      resolve(u);
    });
  });

  if (user) {
    return loadOrCreateProfile(user.uid);
  }

  // Truly first time on this device/browser/app
  const cred = await signInAnonymously(auth);
  return loadOrCreateProfile(cred.user.uid);
};
