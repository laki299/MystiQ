import { ref, update } from 'firebase/database';
import { rtdb } from '../../config/firebase.config';
import { UserProfile } from '../../types/user.types';

export const updateUserProfile = async (
  uid: string, 
  updates: Partial<UserProfile>
): Promise<void> => {
  const userRef = ref(rtdb, `users/${uid}`);
  const payload = {
    ...updates,
    lastActiveAt: Date.now()
  };

  await update(userRef, payload);
};

