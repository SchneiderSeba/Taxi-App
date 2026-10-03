import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { clientSupaBase } from '../../supabase/client';
import type { TablesInsert } from '../../supabase/database.types';
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

export async function ensureUserProfile(user: User): Promise<void> {
  const { data: profile, error } = await clientSupaBase
    .from('UsersProfile')
    .select('owner_id, displayName, pictureUrl')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (error) throw error;

  const fallbackName = user.email?.split('@')[0] || 'Usuario';
  const displayName = asOptionalString(user.user_metadata.full_name)
    ?? asOptionalString(user.user_metadata.name)
    ?? fallbackName;
  const avatarUrl = asOptionalString(user.user_metadata.avatar_url);

  if (!profile) {
    const payload: TablesInsert<'UsersProfile'> = {
      owner_id: user.id,
      email: user.email ?? '',
      username: fallbackName,
      displayName,
      carModel: '',
      carPlate: '',
      pictureUrl: avatarUrl ?? null,
    };
    const { error: insertError } = await clientSupaBase.from('UsersProfile').insert(payload);
    if (insertError) throw insertError;
    return;
  }

  if (!profile.displayName && displayName) {
    const { error: updateError } = await clientSupaBase
      .from('UsersProfile')
      .update({ displayName, pictureUrl: avatarUrl ?? profile.pictureUrl })
      .eq('owner_id', user.id);
    if (updateError) throw updateError;
  }
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}
