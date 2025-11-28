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
