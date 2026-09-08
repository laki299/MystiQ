import { ref, update, get } from 'firebase/database';
import { rtdb } from '../../config/firebase.config';
import { UserProfile } from '../../types/user.types';

export const updateUserProfile = async (
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> => {
  const userRef = ref(rtdb, `users/${uid}`);
  const payload = {
    ...updates,
    lastActiveAt: Date.now(),
    lastProfileUpdate: Date.now(),
  };
  await update(userRef, payload);
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const snapshot = await get(ref(rtdb, `users/${uid}`));
  if (!snapshot.exists()) return null;
  return snapshot.val() as UserProfile;
};

export const touchLastActive = async (uid: string): Promise<void> => {
  await update(ref(rtdb, `users/${uid}`), {
    lastActiveAt: Date.now(),
  });
};
