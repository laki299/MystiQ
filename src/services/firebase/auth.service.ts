import { signInAnonymously } from 'firebase/auth';
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
  return `${name} #${num}`;
};

export const autoAuthenticateAndSaveProfile = async (): Promise<UserProfile> => {
  const userCredential = await signInAnonymously(auth);
  const uid = userCredential.user.uid;
  const now = Date.now();

  const userRef = ref(rtdb, `users/${uid}`);
  const snapshot = await get(userRef);

  if (!snapshot.exists()) {
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
  }

  const existingProfile = snapshot.val() as UserProfile;
  await update(userRef, { lastActiveAt: now });
  return { ...existingProfile, lastActiveAt: now };
};

