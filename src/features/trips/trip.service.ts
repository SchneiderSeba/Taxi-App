import { clientSupaBase } from '../../supabase/client';
import type { TablesInsert, TablesUpdate } from '../../supabase/database.types';
import { parseTripRow } from '../../shared/lib/domainParsers';
import type { Trip, TripStatus } from '../../types';

export type NewDriverTrip = Omit<Trip, 'id' | 'owner_id' | 'created_at'>;

export async function listDriverTrips(ownerId: string): Promise<Trip[]> {
  const { data, error } = await clientSupaBase
    .from('Trips')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(parseTripRow);
}

export async function createDriverTrip(ownerId: string, trip: NewDriverTrip): Promise<Trip> {
  const payload: TablesInsert<'Trips'> = {
    owner_id: ownerId,
    name: trip.name,
    price: trip.price ?? null,
    done: trip.done ?? 'pending',
    address: trip.address ?? null,
    pickup: trip.pickup ?? null,
    destination: trip.destination ?? null,
  };
  const { data, error } = await clientSupaBase.from('Trips').insert(payload).select().single();
  if (error) throw error;
  return parseTripRow(data);
}

export async function updateDriverTrip(
  ownerId: string,
  id: number,
  changes: { done: TripStatus; price?: number },
): Promise<Trip> {
  const update: TablesUpdate<'Trips'> = {
    done: changes.done,
    ...(changes.price === undefined ? {} : { price: changes.price }),
  };
  const { data, error } = await clientSupaBase
    .from('Trips')
    .update(update)
    .eq('id', id)
    .eq('owner_id', ownerId)
    .select()
    .single();
  if (error) throw error;
  return parseTripRow(data);
}

export function subscribeToDriverTrips(ownerId: string, onChange: () => void) {
  const channel = clientSupaBase
    .channel(`driver-trips:${ownerId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'Trips',
      filter: `owner_id=eq.${ownerId}`,
    }, onChange)
    .subscribe();

  return () => {
    void clientSupaBase.removeChannel(channel);
  };
}
