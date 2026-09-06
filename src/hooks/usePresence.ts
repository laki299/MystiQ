import { useEffect } from 'react';
import { UserProfile } from '../types/user.types';
import { joinCategoryPresence, leaveCategoryPresence } from '../services/firebase/presence.service';

export const usePresence = (activeCategoryId: string | null, profile: UserProfile | null) => {
  useEffect(() => {
    if (!activeCategoryId || !profile) return;

    // Send initial join presence
    joinCategoryPresence(activeCategoryId, profile);

    // Keep pulse active every 15 seconds
    const interval = setInterval(() => {
      joinCategoryPresence(activeCategoryId, profile);
    }, 15000);

    return () => {
      clearInterval(interval);
      leaveCategoryPresence(activeCategoryId, profile.uid);
    };
  }, [activeCategoryId, profile]);
};

