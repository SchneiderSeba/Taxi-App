export type TripStatus = 'pending' | 'completed' | 'cancelled';

export interface Trip {
  id: string;
  name: string;
  address: string;
  price: number;
  status: TripStatus;
  date: string;
}

export interface Expense {
  id: string;
  type: 'gas' | 'insurance' | 'registration';
  amount: number;
  date: string;
}

export interface UserSettings {
  gasUnitCost: number;
  insuranceMonthly: number;
  registrationMonthly: number;
}
