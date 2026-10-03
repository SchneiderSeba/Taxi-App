import { createContext } from 'react';
import type { Trip, TripStatus } from '../../types';
import type { NewDriverTrip } from './trip.service';

export type TripsContextValue = {
  trips: Trip[];
  loading: boolean;
  error: string | null;
  refreshTrips: () => Promise<void>;
  addTrip: (trip: NewDriverTrip) => Promise<void>;
  updateTrip: (id: number, done: TripStatus, price?: number) => Promise<void>;
};

export const TripsContext = createContext<TripsContextValue | null>(null);
