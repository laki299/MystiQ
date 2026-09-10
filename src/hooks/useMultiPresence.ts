import { useEffect, useRef } from 'react';
import { UserProfile } from '../types/user.types';
import {
  joinCategoryPresence,
  leaveCategoryPresence,
} from '../services/firebase/presence.service';
import { APP_CONFIG } from '../config/app.config';

export const useMultiPresence = (
  activeMap: Record<string, boolean>,
  profile: UserProfile | null
) => {
  const mapRef = useRef(activeMap);
  mapRef.current = activeMap;

  useEffect(
    function () {
      if (!profile) return;

      const categoryIds = APP_CONFIG.categories.map(function (c) {
        return c.id;
      });

      categoryIds.forEach(function (id) {
        if (activeMap[id]) {
          joinCategoryPresence(id, profile);
        } else {
          leaveCategoryPresence(id, profile.uid);
        }
      });

      const interval = setInterval(function () {
        const current = mapRef.current;
        categoryIds.forEach(function (id) {
          if (current[id]) {
            joinCategoryPresence(id, profile);
          }
        });
      }, APP_CONFIG.limits.presenceHeartbeatSeconds * 1000);

      return function () {
        clearInterval(interval);
        categoryIds.forEach(function (id) {
          leaveCategoryPresence(id, profile.uid);
        });
      };
    },
    [profile, activeMap]
  );
};
