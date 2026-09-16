import { useState, useEffect, useCallback } from 'react';
import {
  restoreSession,
  loginUser,
  registerUser,
  loginWithUsername,
  registerWithUsername,
  logoutUser,
} from '../services/firebase/auth.service';
import { UserProfile } from '../types/user.types';

export function useAuth() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const p = await restoreSession();
        if (!cancelled) setProfile(p);
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || 'Session restore failed');
          setProfile(null);
        }
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
    const fn = loginUser || loginWithUsername;
    const p = await fn(username, password);
    setProfile(p);
    return p;
  }, []);

  const register = useCallback(
    async (
      username: string,
      password: string,
      extra?: { referralCode?: string }
    ) => {
      setError(null);
      const fn = registerUser || registerWithUsername;
      const p = await fn(username, password, extra);
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
    login,
    register,
    logout,
  };
}
