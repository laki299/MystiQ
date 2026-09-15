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

function normalizeUsername(username: string) {
  return username
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

function toAuthEmail(username: string) {
  var key = normalizeUsername(username);
  return key + '@mystiq-b1a8c.firebaseapp.com';
}

function validateUsername(username: string) {
  var u = username.trim();
  if (u.length < 3) return 'Username must be at least 3 characters';
  if (u.length > 20) return 'Username max 20 characters';
  if (!/^[a-zA-Z0-9_]+$/.test(u)) return 'Only letters, numbers, underscore';
  return null;
}

function validatePassword(password: string) {
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise(function (resolve, reject) {
    var done = false;
    var timer = setTimeout(function () {
      if (done) return;
      done = true;
      reject(new Error(label + ' timed out. Check network and try again.'));
    }, ms);
    promise.then(
      function (v) {
        if (done) return;
        done = true;
        clearTimeout(timer);
        resolve(v);
      },
      function (err) {
        if (done) return;
        done = true;
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

async function loadProfile(uid: string) {
  var snap = await withTimeout(
    get(ref(rtdb, 'users/' + uid)),
    10000,
    'Profile load'
  );
  if (!snap.exists()) return null;
  var profile = snap.val() as UserProfile;
  try {
    await update(ref(rtdb, 'users/' + uid), { lastActiveAt: Date.now() });
  } catch (e) {
    console.warn(e);
  }
  return Object.assign({}, profile, { lastActiveAt: Date.now() });
}

export async function restoreSession() {
  try {
    await withTimeout(
      setPersistence(auth, browserLocalPersistence),
      8000,
      'Auth persistence'
    );
  } catch (e) {
    console.warn(e);
  }

  var user = await withTimeout(
    new Promise<User | null>(function (resolve) {
      var unsub = onAuthStateChanged(auth, function (u) {
        unsub();
        resolve(u);
      });
    }),
    12000,
    'Session restore'
  );

  if (!user) return null;
  return loadProfile(user.uid);
}

export async function registerWithUsername(
  username: string,
  password: string,
  displayName?: string
) {
  var userErr = validateUsername(username);
  if (userErr) throw new Error(userErr);
  var passErr = validatePassword(password);
  if (passErr) throw new Error(passErr);

  var key = normalizeUsername(username);
  var nameSnap = await get(ref(rtdb, 'usernames/' + key));
  if (nameSnap.exists()) throw new Error('Username already taken');

  await setPersistence(auth, browserLocalPersistence);

  var cred = await createUserWithEmailAndPassword(
    auth,
    toAuthEmail(username),
    password
  );
  var uid = cred.user.uid;
  var now = Date.now();

  var profile: UserProfile = {
    uid: uid,
    username: username.trim(),
    anonymousName:
      displayName && displayName.trim()
        ? displayName.trim()
        : username.trim(),
    avatar: '',
    age: 0,
    gender: 'unspecified',
    country: '',
    city: '',
    language: 'en',
    profession: '',
    interests: [],
    bio: '',
    role: 'user',
    createdAt: now,
    lastActiveAt: now,
    lastProfileUpdate: now,
    accountStatus: 'active',
  };

  await set(ref(rtdb, 'users/' + uid), profile);
  await set(ref(rtdb, 'usernames/' + key), uid);

  return profile;
}

export async function loginWithUsername(username: string, password: string) {
  if (!username.trim() || !password) {
    throw new Error('Enter username and password');
  }

  await setPersistence(auth, browserLocalPersistence);

  var cred = await signInWithEmailAndPassword(
    auth,
    toAuthEmail(username),
    password
  );

  var profile = await loadProfile(cred.user.uid);
  if (!profile) throw new Error('Profile not found');
  return profile;
}

export async function logoutUser() {
  await signOut(auth);
}

export async function changeLoginUsername(
  uid: string,
  oldUsername: string,
  newUsername: string
) {
  var userErr = validateUsername(newUsername);
  if (userErr) throw new Error(userErr);

  var oldKey = normalizeUsername(oldUsername);
  var newKey = normalizeUsername(newUsername);

  if (oldKey === newKey) {
    await update(ref(rtdb, 'users/' + uid), {
      username: newUsername.trim(),
      lastProfileUpdate: Date.now(),
    });
    return;
  }

  var taken = await get(ref(rtdb, 'usernames/' + newKey));
  if (taken.exists() && taken.val() !== uid) {
    throw new Error('Username already taken');
  }

  if (!auth.currentUser || auth.currentUser.uid !== uid) {
    throw new Error('Not logged in');
  }

  await updateEmail(auth.currentUser, toAuthEmail(newUsername));
  await remove(ref(rtdb, 'usernames/' + oldKey));
  await set(ref(rtdb, 'usernames/' + newKey), uid);
  await update(ref(rtdb, 'users/' + uid), {
    username: newUsername.trim(),
    lastProfileUpdate: Date.now(),
  });
}
