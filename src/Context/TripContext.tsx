import React, { createContext, useContext, useState, useEffect, Dispatch, SetStateAction } from 'react';
import { Trip } from '../types';
import { clientSupaBase } from '../supabase/client';
import { useUserContext } from './UserContext';

const TripContext = createContext<{ trips: Trip[]; setTrips: Dispatch<SetStateAction<Trip[]>> }>({ trips: [], setTrips: () => {} });

export const useTripContext = () => {
    const tripsContext = useContext(TripContext);
    if (!tripsContext) {
        throw new Error('useTripContext must be used within a TripProvider');
    }
    return tripsContext;
}

export const TripProvider = ({ children }: { children: React.ReactNode }) => {

  const { isAuthenticated } = useUserContext();

  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      setTrips([]);
      return;
    }

    let subscription: any = null;

    const setupRealtimeSubscription = async () => {
      const { data: userData } = await clientSupaBase.auth.getUser();
      const userId = userData?.user?.id;
      
      if (!userId) {
        setTrips([]);
        return;
      }

      // Cargar datos iniciales
      const { data, error } = await clientSupaBase
        .from('Trips')
        .select('*')
        .eq('owner_id', userId);
      
      if (!error && data) {
        setTrips(data);
      }

      console.log('User ID:', userId);
      console.log('Trips:', data);

      // Suscripción a cambios en tiempo real (solo escucha cuando hay cambios reales)
      subscription = clientSupaBase
        .channel('trips-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'Trips',
            filter: `owner_id=eq.${userId}`
          },
          async () => {
            console.log('Cambio detectado en Trips, recargando...');
            const { data: updatedData } = await clientSupaBase
              .from('Trips')
              .select('*')
              .eq('owner_id', userId);
            if (updatedData) {
              setTrips(updatedData);
            }
          }
        )
        .subscribe();
    };

    setupRealtimeSubscription();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [isAuthenticated]);

  return <TripContext.Provider value={{ trips, setTrips }}>
            {children}
         </TripContext.Provider>;
}