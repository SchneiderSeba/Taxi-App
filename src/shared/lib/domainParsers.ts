import type { Expense, Profile, Trip, TripStatus, UserSettings } from '../../types';
import type { Tables } from '../../supabase/database.types';

const TRIP_STATUSES = new Set<TripStatus>(['pending', 'completed', 'cancelled']);

export function parseTripRow(row: Tables<'Trips'>): Trip {
  if (!TRIP_STATUSES.has(row.done as TripStatus)) {
    throw new Error(`Estado de viaje no reconocido: ${row.done}`);
  }

  return {
    id: row.id,
    owner_id: row.owner_id,
    name: row.name,
    done: row.done as TripStatus,
    address: row.address ?? undefined,
    price: row.price ?? undefined,
    created_at: row.created_at,
    customer_id: row.customer_id ?? undefined,
    pickup: row.pickup ?? undefined,
    destination: row.destination ?? undefined,
    passenger_phone: row.passenger_phone ?? undefined,
    preferred_time: row.preferred_time ?? undefined,
  };
}

export function parseExpenseRow(row: Tables<'Expenses'>): Expense {
  if (row.amount === null || row.date === null || row.type === null) {
    throw new Error(`Gasto incompleto: ${row.id}`);
  }

  return {
    id: row.id,
    owner_id: row.owner_id,
    type: row.type,
    amount: row.amount,
    date: row.date,
  };
}

export function parseProfileRow(row: Tables<'UsersProfile'>): Profile {
  return {
    id: row.id,
    owner_id: row.owner_id,
    username: row.username,
    displayName: row.displayName ?? undefined,
    email: row.email,
    phone: row.phone === null ? undefined : String(row.phone),
    carModel: row.carModel || undefined,
    carPlate: row.carPlate || undefined,
    pictureUrl: row.pictureUrl ?? undefined,
    created_at: row.created_at,
    available: row.available ?? false,
  };
}

export function isUserSettings(value: unknown): value is UserSettings {
  if (typeof value !== 'object' || value === null) return false;
  const settings = value as Record<string, unknown>;
  return ['gasUnitCost', 'insuranceMonthly', 'registrationMonthly'].every(
    (key) => typeof settings[key] === 'number' && Number.isFinite(settings[key]) && Number(settings[key]) >= 0,
  );
}
