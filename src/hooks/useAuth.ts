import { useState, useEffect } from 'react';
import { initTelegramWebApp, getTelegramUser } from '../services/telegram/webapp.service';
import { autoAuthenticateAndSaveProfile } from '../services/firebase/auth.service';
import { UserProfile } from '../types/user.types';

export const useAuth = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        initTelegramWebApp();
        const userProfile = await autoAuthenticateAndSaveProfile();
        setProfile(userProfile);
      } catch (err: any) {
        console.error('[Auth Error]:', err);
        setError(err?.message || 'Authentication failed');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  return {
    profile,
    setProfile,
    isLoading,
    error,
    telegramUser: getTelegramUser(),
  };
};
