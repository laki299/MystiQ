import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  updateEmail,
  User,
} from 'firebase/auth';
import { ref, get, set, update, remove } from 'firebase/database';
import { auth, rtdb } from '../../config/firebase.config';
import { UserProfile } from '../../types/user.types';
import {
  ensureReferralCode,
  applyReferralOnRegister,
} from '../referral.service';
import { getOrCreateDeviceId } from '../../utils/deviceId';

const AUTH_DOMAIN = 'mystiq.app';

const normalizeUsername = (username: string) =>
  username.trim().toLowerCase().replace(/\s+/g, '_');

const toAuthEmail = (username: string) =>
  `\( {normalizeUsername(username)}@ \){AUTH_DOMAIN}`;

const validateUsername = (username: string): string | null => {
  const u = username.trim();
  if (u.length < 3) return 'Username must be at least 3 characters';
  if (u.length > 20) return 'Username max 20 characters';
  if (!/^[a-zA-Z0-9_]+$/.test(u)) return 'Only letters, numbers, underscore';
  return null;
};

const validatePassword = (password: string): string | null => {
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
};

const RANDOM_NAMES = [
  'Shadow Soul',
  'Moon Walker',
  'Silent Heart',
  'Mystic One',
  'Dark Rose',
  'Cosmic Nomad',
  'Ocean Breeze',
  'Velvet Echo',
];

const getRandomAnonymousName = (): string => {
  const i = Math.floor(Math.random() * RANDOM_NAMES.length);
  const n = Math.floor(1000 + Math.random() * 9000);
  return `\( {RANDOM_NAMES[i]} # \){n}`;
};

const loadProfile = async (uid: string): Promise<UserProfile | null> => {
  const snap = await get(ref(rtdb, `users/${uid}`));
  if (!snap.exists()) return null;
  const profile = snap.val() as UserProfile;
  await update(ref(rtdb, `users/${uid}`), { lastActiveAt: Date.now() });

  // রেফার কোড নিশ্চিত
  try {
    if (!profile.referralCode) {
      const code = await ensureReferralCode(uid, profile.username || 'user');
      profile.referralCode = code;
    }
  } catch (e) {
    console.warn(e);
  }

  return { ...profile, lastActiveAt: Date.now() };
};

export const restoreSession = async (): Promise<UserProfile | null> => {
  await setPersistence(auth, browserLocalPersistence);
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      unsub();
      if (!user) {
        resolve(null);
        return;
      }
      try {
        const profile = await loadProfile(user.uid);
        resolve(profile);
      } catch {
        resolve(null);
      }
    });
  });
};

export const registerUser = async (
  username: string,
  password: string,
  extra?: {
    referralCode?: string;
    age?: number;
    gender?: string;
  }
): Promise<UserProfile> => {
  const userErr = validateUsername(username);
  if (userErr) throw new Error(userErr);
  const passErr = validatePassword(password);
  if (passErr) throw new Error(passErr);

  const key = normalizeUsername(username);
  const taken = await get(ref(rtdb, `usernames/${key}`));
  if (taken.exists()) throw new Error('Username already taken');

  await setPersistence(auth, browserLocalPersistence);
  const cred = await createUserWithEmailAndPassword(
    auth,
    toAuthEmail(username),
    password
  );
  const uid = cred.user.uid;
  const deviceId = getOrCreateDeviceId();
  const now = Date.now();

  const profile: UserProfile = {
    uid,
    username: username.trim(),
    anonymousName: getRandomAnonymousName(),
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${uid}`,
    age: extra?.age || 18,
    gender: (extra?.gender as any) || 'unspecified',
    country: '',
    city: '',
    language: 'bn',
    profession: '',
    interests: [],
    bio: '',
    role: 'user',
    coins: 0,
    lifetimeCoins: 0,
    adsWatchedTotal: 0,
    activeReferralsCount: 0,
    qualifiedReferralsCount: 0,
    deviceId,
    createdAt: now,
    lastActiveAt: now,
    accountStatus: 'active',
  };

  await set(ref(rtdb, `users/${uid}`), profile);
  await set(ref(rtdb, `usernames/${key}`), uid);

  const code = await ensureReferralCode(uid, username);
  profile.referralCode = code;

  if (extra?.referralCode) {
    await applyReferralOnRegister(uid, extra.referralCode, deviceId);
  } else {
    // ডিভাইস মার্ক (মাল্টি অ্যাকাউন্ট কমাতে)
    try {
      await set(ref(rtdb, `devices/${deviceId}`), { uid, at: now });
    } catch (e) {
      console.warn(e);
    }
  }

  return profile;
};

export const loginUser = async (
  username: string,
  password: string
): Promise<UserProfile> => {
  if (!username.trim() || !password) {
    throw new Error('Enter username and password');
  }
  await setPersistence(auth, browserLocalPersistence);
  const cred = await signInWithEmailAndPassword(
    auth,
    toAuthEmail(username),
    password
  );
  const profile = await loadProfile(cred.user.uid);
  if (!profile) throw new Error('Profile not found');
  return profile;
};

export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

export const changeLoginUsername = async (
  uid: string,
  oldUsername: string,
  newUsername: string
): Promise<void> => {
  const userErr = validateUsername(newUsername);
  if (userErr) throw new Error(userErr);

  const oldKey = normalizeUsername(oldUsername);
  const newKey = normalizeUsername(newUsername);

  if (oldKey === newKey) {
    await update(ref(rtdb, `users/${uid}`), {
      username: newUsername.trim(),
      lastProfileUpdate: Date.now(),
    });
    return;
  }

  const taken = await get(ref(rtdb, `usernames/${newKey}`));
  if (taken.exists() && taken.val() !== uid) {
    throw new Error('Username already taken');
  }

  if (!auth.currentUser || auth.currentUser.uid !== uid) {
    throw new Error('Not logged in');
  }

  await updateEmail(auth.currentUser, toAuthEmail(newUsername));
  await remove(ref(rtdb, `usernames/${oldKey}`));
  await set(ref(rtdb, `usernames/${newKey}`), uid);
  await update(ref(rtdb, `users/${uid}`), {
    username: newUsername.trim(),
    lastProfileUpdate: Date.now(),
  });
};
