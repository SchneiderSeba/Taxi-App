import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { serviceErrorMessage } from '../../lib/serviceError';
import type { Trip, TripStatus } from '../../types';
import { useAuth } from '../auth/useAuth';
import { createDriverTrip, listDriverTrips, subscribeToDriverTrips, updateDriverTrip, type NewDriverTrip } from './trip.service';
import { TripsContext } from './trips-context';

export function TripsProvider({ children }: { children: ReactNode }) {
  const { user, accountType } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTrips = useCallback(async () => {
    if (!user || accountType !== 'driver') {
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
  }, [accountType, user]);

  useEffect(() => {
    if (!user || accountType !== 'driver') {
      setTrips([]);
      return;
    }

    void refreshTrips();
    return subscribeToDriverTrips(user.id, () => {
      void refreshTrips();
    });
  }, [accountType, user, refreshTrips]);

  const addTrip = useCallback(async (trip: NewDriverTrip) => {
    if (!user || accountType !== 'driver') throw new Error('La sesión de conductor ya no está disponible.');
    const created = await createDriverTrip(user.id, trip);
    setTrips((current) => [created, ...current]);
  }, [accountType, user]);

  const updateTrip = useCallback(async (id: number, done: TripStatus, price?: number) => {
    if (!user || accountType !== 'driver') throw new Error('La sesión de conductor ya no está disponible.');
    const updated = await updateDriverTrip(user.id, id, { done, price });
    setTrips((current) => current.map((trip) => trip.id === id ? updated : trip));
  }, [accountType, user]);

  const value = useMemo(() => ({ trips, loading, error, refreshTrips, addTrip, updateTrip }), [trips, loading, error, refreshTrips, addTrip, updateTrip]);
  return <TripsContext.Provider value={value}>{children}</TripsContext.Provider>;
}
