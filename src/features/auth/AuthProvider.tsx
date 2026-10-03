import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { serviceErrorMessage } from '../../lib/serviceError';
import { AuthContext } from './auth-context';
import { getCurrentSession, signOut, subscribeToAuthChanges } from './auth.service';
import { ensureCustomerProfile, hasDriverProfile } from '../customer/customer-profile.service';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accountType, setAccountType] = useState<'driver' | 'customer' | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [accountLoading, setAccountLoading] = useState(false);
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
        if (active) setSessionLoading(false);
      });

    const subscription = subscribeToAuthChanges((_event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);
      setSessionLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setAccountType(null);
      setAccountLoading(false);
      return;
    }

    let active = true;
    setAccountLoading(true);
    void hasDriverProfile(user.id)
      .then(async (isDriver) => {
        if (isDriver) return 'driver' as const;
        await ensureCustomerProfile(user.id, {
          fullName: typeof user.user_metadata.full_name === 'string' ? user.user_metadata.full_name : undefined,
          phone: typeof user.user_metadata.phone === 'string' ? user.user_metadata.phone : undefined,
        });
        return 'customer' as const;
      })
      .then((type) => {
        if (active) {
          setAccountType(type);
          setError(null);
        }
      })
      .catch((profileError: unknown) => {
        if (active) setError(serviceErrorMessage(profileError instanceof Error ? profileError : null));
      })
      .finally(() => {
        if (active) setAccountLoading(false);
      });

    return () => { active = false; };
  }, [user]);

  const logout = useCallback(async () => {
    await signOut();
    setUser(null);
    setAccountType(null);
  }, []);

  const isInitializing = sessionLoading || Boolean(user && accountLoading);

  const value = useMemo(() => ({
    accountType,
    user,
    isAuthenticated: Boolean(user),
    isInitializing,
    error,
    logout,
  }), [accountType, user, isInitializing, error, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
