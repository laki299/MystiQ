import { useState, useEffect } from 'react';
import { autoAuthenticateAndSaveProfile } from '../services/firebase/auth.service';
import { UserProfile } from '../types/user.types';

export const useAuth = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const initAuth = async () => {
      try {
        const userProfile = await autoAuthenticateAndSaveProfile();
        if (!cancelled) setProfile(userProfile);
      } catch (err: any) {
        console.error('[Auth Error]:', err);
        if (!cancelled) setError(err?.message || 'Authentication failed');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    initAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    profile,
    setProfile,
    isLoading,
    error,
  };
};
