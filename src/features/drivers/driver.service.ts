import { clientSupaBase } from '../../supabase/client';
import type { Profile, TripStatus } from '../../types';

export type CustomerTrip = {
  tripId: number;
  driverName: string;
  pickup?: string;
  destination?: string;
  preferredTime?: string;
  createdAt: string;
  status: TripStatus;
  customerId: string;
  ownerId: string;
  price?: number;
  driverAvailable?: boolean;
};

export type CustomerTripRequest = {
  customerId: string;
  ownerId: string;
  passengerName: string;
  pickup: string;
  destination: string;
  phone?: string;
  preferredTime?: string;
};

export async function listAvailableDrivers(): Promise<Profile[]> {
  const { data, error } = await clientSupaBase.rpc('list_available_drivers', {});
  if (error) throw error;
  return data.map((driver) => ({
    id: driver.id,
    owner_id: driver.owner_id,
    username: driver.username,
    displayName: driver.displayName || undefined,
    carModel: driver.carModel || undefined,
    carPlate: driver.carPlate || undefined,
    pictureUrl: driver.pictureUrl || undefined,
    available: driver.available,
    created_at: driver.created_at,
  }));
}

export async function getLastCustomerTrip(customerId: string): Promise<CustomerTrip | null> {
  const { data, error } = await clientSupaBase
    .rpc('get_customer_last_trip', { p_customer_id: customerId })
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  if (!isTripStatus(data.done)) throw new Error(`Estado de viaje no reconocido: ${data.done}`);

  return {
    tripId: data.trip_id,
    driverName: data.driver_name || 'Conductor',
    pickup: data.pickup || undefined,
    destination: data.destination || undefined,
    preferredTime: data.preferred_time || 'N/D',
    createdAt: data.created_at,
    status: data.done,
    customerId,
    ownerId: data.owner_id,
    price: data.price ?? undefined,
    driverAvailable: data.driver_available ?? false,
  };
}

export async function requestCustomerTrip(request: CustomerTripRequest) {
  const { data, error } = await clientSupaBase.rpc('request_trip', {
    p_customer_id: request.customerId,
    p_owner_id: request.ownerId,
    p_name: request.passengerName.trim(),
    p_pickup: request.pickup.trim(),
    p_destination: request.destination.trim(),
    p_passenger_phone: request.phone?.trim() || undefined,
    p_preferred_time: request.preferredTime?.trim() || undefined,
  }).single();
  if (error) throw error;
  return data;
}

function isTripStatus(value: string): value is TripStatus {
  return value === 'pending' || value === 'completed' || value === 'cancelled';
}
