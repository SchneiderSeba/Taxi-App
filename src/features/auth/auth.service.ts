import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { clientSupaBase } from '../../supabase/client';
import { getAuthRedirectUrl } from '../../shared/config/runtime';

export async function getCurrentSession(): Promise<Session | null> {
  const { data, error } = await clientSupaBase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function subscribeToAuthChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
  return clientSupaBase.auth.onAuthStateChange(callback).data.subscription;
}

export async function sendMagicLink(email: string): Promise<void> {
  const { error } = await clientSupaBase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: getAuthRedirectUrl() },
  });
  if (error) throw error;
}

export async function signInWithPassword(email: string, password: string): Promise<void> {
  const { error } = await clientSupaBase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUpCustomer(
  email: string,
  password: string,
  profile: { fullName: string; phone: string },
): Promise<{ requiresEmailConfirmation: boolean }> {
  const { data, error } = await clientSupaBase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getAuthRedirectUrl('/customer'),
      data: { full_name: profile.fullName.trim(), phone: profile.phone.trim() },
    },
  });
  if (error) throw error;
  return { requiresEmailConfirmation: !data.session };
}

export async function signInWithGoogle(): Promise<void> {
  const { error } = await clientSupaBase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: getAuthRedirectUrl() },
  });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const { error } = await clientSupaBase.auth.signOut();
  if (error) throw error;
}
