import { clientSupaBase } from '../../supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '../../supabase/database.types';

export type CustomerProfile = Tables<'customer_profiles'>;

export async function hasDriverProfile(userId: string): Promise<boolean> {
  const { data, error } = await clientSupaBase
    .from('UsersProfile')
    .select('owner_id')
    .eq('owner_id', userId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function getCustomerProfile(userId: string): Promise<CustomerProfile | null> {
  const { data, error } = await clientSupaBase
    .from('customer_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function ensureCustomerProfile(
  userId: string,
  defaults: { fullName?: string; phone?: string } = {},
): Promise<CustomerProfile> {
  const existing = await getCustomerProfile(userId);
  if (existing) return existing;

  const payload: TablesInsert<'customer_profiles'> = {
    user_id: userId,
    full_name: defaults.fullName?.trim() ?? '',
    phone: defaults.phone?.trim() || null,
  };
  const { data, error } = await clientSupaBase
    .from('customer_profiles')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCustomerProfile(
  userId: string,
  profile: { fullName: string; phone: string },
): Promise<CustomerProfile> {
  const update: TablesUpdate<'customer_profiles'> = {
    full_name: profile.fullName.trim(),
    phone: profile.phone.trim() || null,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await clientSupaBase
    .from('customer_profiles')
    .update(update)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
