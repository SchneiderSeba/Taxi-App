import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { serviceErrorMessage } from '../../lib/serviceError';
import type { Trip, TripStatus } from '../../types';
import { useAuth } from '../auth/useAuth';
import { createDriverTrip, listDriverTrips, subscribeToDriverTrips, updateDriverTrip, type NewDriverTrip } from './trip.service';
import { TripsContext } from './trips-context';

export function TripsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTrips = useCallback(async () => {
    if (!user) {
      setTrips([]);
      return;
    }
    setLoading(true);
    try {
      setTrips(await listDriverTrips(user.id));
      setError(null);
    } catch (requestError) {
      setError(serviceErrorMessage(requestError instanceof Error ? requestError : null));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setTrips([]);
      return;
    }

    void refreshTrips();
    return subscribeToDriverTrips(user.id, () => {
      void refreshTrips();
    });
  }, [user, refreshTrips]);

  const addTrip = useCallback(async (trip: NewDriverTrip) => {
    if (!user) throw new Error('La sesión ya no está disponible.');
    const created = await createDriverTrip(user.id, trip);
    setTrips((current) => [created, ...current]);
  }, [user]);

  const updateTrip = useCallback(async (id: number, done: TripStatus, price?: number) => {
    if (!user) throw new Error('La sesión ya no está disponible.');
    const updated = await updateDriverTrip(user.id, id, { done, price });
    setTrips((current) => current.map((trip) => trip.id === id ? updated : trip));
  }, [user]);

  const value = useMemo(() => ({ trips, loading, error, refreshTrips, addTrip, updateTrip }), [trips, loading, error, refreshTrips, addTrip, updateTrip]);
  return <TripsContext.Provider value={value}>{children}</TripsContext.Provider>;
}
