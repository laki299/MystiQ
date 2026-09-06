import { ref, set, onDisconnect, onValue, remove } from 'firebase/database';
import { rtdb } from '../../config/firebase.config';
import { UserProfile } from '../../types/user.types';

// Join a category room & set heartbeat
export const joinCategoryPresence = async (categoryId: string, profile: UserProfile): Promise<void> => {
  const presenceRef = ref(rtdb, `presence/${categoryId}/${profile.uid}`);
  
  const presenceData = {
    uid: profile.uid,
    anonymousName: profile.anonymousName,
    avatar: profile.avatar || '',
    lastActiveAt: Date.now()
  };

  // Automatically remove user from room when app closes or internet drops
  await onDisconnect(presenceRef).remove();
  await set(presenceRef, presenceData);
};

// Leave room explicitly
export const leaveCategoryPresence = async (categoryId: string, uid: string): Promise<void> => {
  const presenceRef = ref(rtdb, `presence/${categoryId}/${uid}`);
  await remove(presenceRef);
};

// Listen to real-time active online user count per category
export const subscribeToCategoryPresence = (
  categoryId: string, 
  callback: (activeCount: number) => void
) => {
  const categoryPresenceRef = ref(rtdb, `presence/${categoryId}`);

  return onValue(categoryPresenceRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const now = Date.now();
      
      // Filter out stale presence nodes older than 45 seconds
      const activeCount = Object.values(data).filter(
        (u: any) => now - u.lastActiveAt < 45000
      ).length;
      
      callback(activeCount);
    } else {
      callback(0);
    }
  });
};

