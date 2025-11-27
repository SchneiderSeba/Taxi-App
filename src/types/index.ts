export type TripStatus = false | true ;

export interface Trip {
  id: number;
  owner_id: string;
  name: string;
  address: string;
  price: number;
  done: TripStatus;
  date: string;
}

export interface Expense {
  owner_id: string;
  type: 'gas' | 'insurance' | 'registration';
  amount: number;
  date: string;
}

export interface UserSettings {
  gasUnitCost: number;
  insuranceMonthly: number;
  registrationMonthly: number;
}
