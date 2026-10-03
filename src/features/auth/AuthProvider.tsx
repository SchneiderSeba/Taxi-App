import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { serviceErrorMessage } from '../../lib/serviceError';
import { AuthContext } from './auth-context';
import { ensureUserProfile, getCurrentSession, signOut, subscribeToAuthChanges } from './auth.service';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void getCurrentSession()
      .then((session) => {
        if (active) setUser(session?.user ?? null);
      })
      .catch((sessionError: unknown) => {
        if (active) setError(serviceErrorMessage(sessionError instanceof Error ? sessionError : null));
      })
      .finally(() => {
        if (active) setIsInitializing(false);
      });

    const subscription = subscribeToAuthChanges((_event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);
      setIsInitializing(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    void ensureUserProfile(user).catch((profileError: unknown) => {
      setError(serviceErrorMessage(profileError instanceof Error ? profileError : null));
    });
  }, [user]);

  const logout = useCallback(async () => {
    await signOut();
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    isInitializing,
    error,
    logout,
  }), [user, isInitializing, error, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
