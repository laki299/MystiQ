import { useEffect } from 'react';
import { UserProfile } from '../types/user.types';
import {
  joinCategoryPresence,
  leaveCategoryPresence,
} from '../services/firebase/presence.service';
import { APP_CONFIG } from '../config/app.config';

export const usePresence = (
  activeCategoryId: string | null,
  profile: UserProfile | null
) => {
  useEffect(() => {
    if (!activeCategoryId || !profile) return;

    joinCategoryPresence(activeCategoryId, profile);

    const interval = setInterval(() => {
      joinCategoryPresence(activeCategoryId, profile);
    }, APP_CONFIG.limits.presenceHeartbeatSeconds * 1000);

    return () => {
      clearInterval(interval);
      leaveCategoryPresence(activeCategoryId, profile.uid);
    };
  }, [activeCategoryId
