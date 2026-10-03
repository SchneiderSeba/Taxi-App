import { clientSupaBase } from '../../supabase/client';
import { isUserSettings } from '../../shared/lib/domainParsers';
import { readVersionedStorage, writeVersionedStorage } from '../../shared/lib/storage';
import type { UserSettings } from '../../types';

const STORAGE_KEY = 'taxi-app:driver-settings';
const STORAGE_VERSION = 1;
const LEGACY_KEY = 'settings';

export const DEFAULT_SETTINGS: UserSettings = {
  gasUnitCost: 50,
  insuranceMonthly: 100,
  registrationMonthly: 50,
};

export function loadCachedSettings(): UserSettings {
  const versioned = readVersionedStorage(STORAGE_KEY, STORAGE_VERSION, isUserSettings);
  if (versioned) return versioned;

  try {
    const legacyRaw = localStorage.getItem(LEGACY_KEY);
    const legacy: unknown = legacyRaw ? JSON.parse(legacyRaw) : null;
    if (isUserSettings(legacy)) {
      cacheSettings(legacy);
      localStorage.removeItem(LEGACY_KEY);
      return legacy;
    }
  } catch {
    localStorage.removeItem(LEGACY_KEY);
  }

  return DEFAULT_SETTINGS;
}

export async function getDriverSettings(ownerId: string): Promise<UserSettings | null> {
  const { data, error } = await clientSupaBase
    .from('usersettings')
    .select('gas_unit_cost, insurance_monthly, registration_monthly')
    .eq('owner_id', ownerId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const settings: UserSettings = {
    gasUnitCost: data.gas_unit_cost ?? DEFAULT_SETTINGS.gasUnitCost,
    insuranceMonthly: data.insurance_monthly ?? DEFAULT_SETTINGS.insuranceMonthly,
    registrationMonthly: data.registration_monthly ?? DEFAULT_SETTINGS.registrationMonthly,
  };
  cacheSettings(settings);
  return settings;
}

export async function saveDriverSettings(ownerId: string, settings: UserSettings): Promise<void> {
  const { error } = await clientSupaBase.from('usersettings').upsert({
    owner_id: ownerId,
    gas_unit_cost: settings.gasUnitCost,
    insurance_monthly: settings.insuranceMonthly,
    registration_monthly: settings.registrationMonthly,
  }, { onConflict: 'owner_id' });
  if (error) throw error;
  cacheSettings(settings);
}

function cacheSettings(settings: UserSettings) {
  writeVersionedStorage(STORAGE_KEY, STORAGE_VERSION, settings);
}
