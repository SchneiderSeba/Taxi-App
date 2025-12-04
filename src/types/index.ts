export type TripStatus = 'pending' | 'completed' | 'cancelled';

export interface Trip {
  id: number;
  owner_id: string;
  name: string;
  address?: string; // Solo para compatibilidad del frontend, no se usa en BD
  price?: number;
  done: TripStatus;
  date?: string;
  created_at?: string;
  customer_id?: string;
  pickup?: string;
  destination?: string;
}

export interface Expense {
  id?: number;
  owner_id: string;
  type: string;
  amount: number;
  date: string;
}

export interface UserSettings {
  gasUnitCost: number;
  insuranceMonthly: number;
  registrationMonthly: number;
}

export interface Profile {
  id: number;
  owner_id: string;
  username: string;
  displayName?: string;
  email: string;
  phone?: string;
  carModel?: string;
  carPlate?: string;
  pictureUrl?: string;
  created_at: string;
  available?: boolean;
}

export type ProfileEditableField = 'carModel' | 'carPlate' | 'pictureUrl' | 'available';
