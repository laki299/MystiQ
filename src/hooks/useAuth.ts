import { useState, useEffect, useCallback } from 'react';
import {
  restoreSession,
  loginWithUsername,
  registerWithUsername,
  logoutUser,
} from '../services/firebase/auth.service';
import { UserProfile } from '../types/user.types';

export const useAuth = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const existing = await restoreSession();
        if (!cancelled) setProfile(existing);
      } catch (err: any) {
        console.error(err);
        if (!cancelled) setError(err?.message || 'Session error');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setError(null);
    const p = await loginWithUsername(username, password);
    setProfile(p);
    return p;
  }, []);

  const register = useCallback(
    async (username: string, password: string, displayName?: string) => {
      setError(null);
      const p = await registerWithUsername(username, password, displayName);
      setProfile(p);
      return p;
    },
    []
  );

  const logout = useCallback(async () => {
    await logoutUser();
    setProfile(null);
  }, []);

  return {
    profile,
    setProfile,
    isLoading,
    error,
    setError,
    login,
    register,
    logout,
    isLoggedIn: !!profile,
  };
};
