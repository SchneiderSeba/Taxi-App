import { clientSupaBase } from '../../supabase/client';
import type { TablesUpdate } from '../../supabase/database.types';
import { parseProfileRow } from '../../shared/lib/domainParsers';
import type { Profile, ProfileEditableField } from '../../types';

export async function getDriverProfile(ownerId: string): Promise<Profile | null> {
  const { data, error } = await clientSupaBase
    .from('UsersProfile')
    .select('*')
    .eq('owner_id', ownerId)
    .maybeSingle();
  if (error) throw error;
  return data ? parseProfileRow(data) : null;
}

export async function updateDriverProfile(
  ownerId: string,
  field: ProfileEditableField,
  value: string | boolean | null,
): Promise<Profile> {
  const update = { [field]: value } as TablesUpdate<'UsersProfile'>;
  const { data, error } = await clientSupaBase
    .from('UsersProfile')
    .update(update)
    .eq('owner_id', ownerId)
    .select()
    .single();
  if (error) throw error;
  return parseProfileRow(data);
}
