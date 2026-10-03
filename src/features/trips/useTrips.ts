import { useContext } from 'react';
import { TripsContext } from './trips-context';

export function useTrips() {
  const context = useContext(TripsContext);
  if (!context) throw new Error('useTrips debe usarse dentro de TripsProvider');
  return context;
}
