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

const normalizeUsername = (username: string) =>
  username
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');

/** Hidden synthetic email — user never sees this */
const toAuthEmail = (username: string) => {
  const key = normalizeUsername(username);
  return `${key}@mystiq-b1a8c.firebaseapp.com`;
};

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

const loadProfile = async (uid: string): Promise<UserProfile | null> => {
  const snap = await get(ref(rtdb, `users/${uid}`));
  if (!snap.exists()) return null;
  const profile = snap.val() as UserProfile;
  await update(ref(rtdb, `users/${uid}`), { lastActiveAt: Date.now() });
  return { ...profile, lastActiveAt: Date.now() };
};

export const restoreSession = async (): Promise<UserProfile | null> => {
  await setPersistence(auth, browserLocalPersistence);

  const user = await new Promise<User | null>((resolve) => {
    const unsub = onAuthStateChanged(auth, (u) => {
      unsub();
      resolve(u);
    });
  });

  if (!user) return null;
  return loadProfile(user.uid);
};

export const registerWithUsername = async (
  username: string,
  password: string,
  displayName?: string
): Promise<UserProfile> => {
  const userErr = validateUsername(username);
  if (userErr) throw new Error(userErr);
  const passErr = validatePassword(password);
  if (passErr) throw new Error(passErr);

  const key = normalizeUsername(username);
  const nameSnap = await get(ref(rtdb, `usernames/${key}`));
  if (nameSnap.exists()) throw new Error('Username already taken');

  await setPersistence(auth, browserLocalPersistence);

  const cred = await createUserWithEmailAndPassword(
    auth,
    toAuthEmail(username),
    password
  );
  const uid = cred.user.uid;
  const now = Date.now();

  const profile: UserProfile = {
    uid,
    username: username.trim(),
    anonymousName: displayName?.trim() || username.trim(),
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

  await set(ref(rtdb, `users/${uid}`), profile);
  await set(ref(rtdb, `usernames/${key}`), uid);

  return profile;
};

export const loginWithUsername = async (
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
