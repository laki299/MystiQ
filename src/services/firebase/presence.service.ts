import { ref, set, onDisconnect, onValue, remove } from 'firebase/database';
import { rtdb } from '../../config/firebase.config';
import { UserProfile } from '../../types/user.types';
import { PresenceUser } from '../../types/room.types';
import { APP_CONFIG } from '../../config/app.config';

function presencePath(categoryId: string, uid: string) {
  return 'presence/' + categoryId + '/' + uid;
}

export const joinCategoryPresence = async (
  categoryId: string,
  profile: UserProfile
): Promise<void> => {
  const presenceRef = ref(rtdb, presencePath(categoryId, profile.uid));
  const now = Date.now();

  const presenceData: PresenceUser = {
    uid: profile.uid,
    anonymousName: profile.anonymousName,
    avatar: profile.avatar || '',
    age: profile.age || undefined,
    gender: profile.gender || undefined,
    city: profile.city || undefined,
    language: profile.language || undefined,
    status: 'online',
    lastHeartbeat: now,
    expiresAt: now + APP_CONFIG.limits.presenceStaleSeconds * 1000,
  };

  await onDisconnect(presenceRef).remove();
  await set(presenceRef, presenceData);
};

export const leaveCategoryPresence = async (
  categoryId: string,
  uid: string
): Promise<void> => {
  await remove(ref(rtdb, presencePath(categoryId, uid)));
};

export const subscribeToCategoryPresenceList = (
  categoryId: string,
  callback: (users: PresenceUser[]) => void
) => {
  const categoryPresenceRef = ref(rtdb, 'presence/' + categoryId);

  return onValue(categoryPresenceRef, function (snapshot) {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }

    const data = snapshot.val();
    const now = Date.now();
    const users: PresenceUser[] = [];

    Object.values(data).forEach(function (u: any) {
      if (u && u.expiresAt > now) {
        users.push(u as PresenceUser);
      }
    });

    callback(users);
  });
};

export const subscribeToCategoryPresenceCount = (
  categoryId: string,
  callback: (activeCount: number) => void
) => {
  return subscribeToCategoryPresenceList(categoryId, function (users) {
    callback(users.length);
  });
};
