export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: {
      customer_profiles: {
        Row: {
          created_at: string;
          full_name: string;
          phone: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          full_name?: string;
          phone?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          full_name?: string;
          phone?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      Expenses: {
        Row: {
          amount: number | null;
          created_at: string | null;
          date: string | null;
          id: number;
          owner_id: string;
          type: string | null;
        };
        Insert: {
          amount?: number | null;
          created_at?: string | null;
          date?: string | null;
          id?: number;
          owner_id?: string;
          type?: string | null;
        };
        Update: {
          amount?: number | null;
          created_at?: string | null;
          date?: string | null;
          id?: number;
          owner_id?: string;
          type?: string | null;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          amount: number | null;
          client_id: string | null;
          created_at: string;
          customer_id: string | null;
          id: number;
          mp_payment_id: string;
          owner_id: string | null;
          raw_query: Json | null;
          status: string | null;
          topic: string | null;
          trip_id: number | null;
          updated_at: string;
        };
        Insert: {
          amount?: number | null;
          client_id?: string | null;
          created_at?: string;
          customer_id?: string | null;
          id?: number;
          mp_payment_id: string;
          owner_id?: string | null;
          raw_query?: Json | null;
          status?: string | null;
          topic?: string | null;
          trip_id?: number | null;
          updated_at?: string;
        };
        Update: {
          amount?: number | null;
          client_id?: string | null;
          created_at?: string;
          customer_id?: string | null;
          id?: number;
          mp_payment_id?: string;
          owner_id?: string | null;
          raw_query?: Json | null;
          status?: string | null;
          topic?: string | null;
          trip_id?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'payments_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'UsersProfile';
            referencedColumns: ['owner_id'];
          },
          {
            foreignKeyName: 'payments_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'Trips';
            referencedColumns: ['id'];
          },
        ];
      };
      Trips: {
        Row: {
          address: string | null;
          created_at: string;
          customer_id: string | null;
          destination: string | null;
          done: string;
          done_by_customer: boolean | null;
          id: number;
          name: string;
          owner_id: string;
          passenger_phone: string | null;
          pickup: string | null;
          preferred_time: string | null;
          price: number | null;
        };
        Insert: {
          address?: string | null;
          created_at?: string;
          customer_id?: string | null;
          destination?: string | null;
          done: string;
          done_by_customer?: boolean | null;
          id?: number;
          name: string;
          owner_id?: string;
          passenger_phone?: string | null;
          pickup?: string | null;
          preferred_time?: string | null;
          price?: number | null;
        };
        Update: {
          address?: string | null;
          created_at?: string;
          customer_id?: string | null;
          destination?: string | null;
          done?: string;
          done_by_customer?: boolean | null;
          id?: number;
          name?: string;
          owner_id?: string;
          passenger_phone?: string | null;
          pickup?: string | null;
          preferred_time?: string | null;
          price?: number | null;
        };
        Relationships: [];
      };
      usersettings: {
        Row: {
          created_at: string;
          gas_unit_cost: number | null;
          id: number;
          insurance_monthly: number | null;
          owner_id: string;
          registration_monthly: number | null;
        };
        Insert: {
          created_at?: string;
          gas_unit_cost?: number | null;
          id?: number;
          insurance_monthly?: number | null;
          owner_id: string;
          registration_monthly?: number | null;
        };
        Update: {
          created_at?: string;
          gas_unit_cost?: number | null;
          id?: number;
          insurance_monthly?: number | null;
          owner_id?: string;
          registration_monthly?: number | null;
        };
        Relationships: [];
      };
      UsersProfile: {
        Row: {
          available: boolean | null;
          carModel: string;
          carPlate: string;
          created_at: string;
          displayName: string | null;
          email: string;
          id: number;
          owner_id: string;
          phone: number | null;
          pictureUrl: string | null;
          username: string;
        };
        Insert: {
          available?: boolean | null;
          carModel: string;
          carPlate: string;
          created_at?: string;
          displayName?: string | null;
          email: string;
          id?: number;
          owner_id: string;
          phone?: number | null;
          pictureUrl?: string | null;
          username: string;
        };
        Update: {
          available?: boolean | null;
          carModel?: string;
          carPlate?: string;
          created_at?: string;
          displayName?: string | null;
          email?: string;
          id?: number;
          owner_id?: string;
          phone?: number | null;
          pictureUrl?: string | null;
          username?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      get_payment_result: {
        Args: { p_payment_id: string };
        Returns: {
          amount: number;
          mp_payment_id: string;
          status: string;
        }[];
      };
      get_customer_last_trip: {
        Args: { p_customer_id: string };
        Returns: {
          created_at: string;
          destination: string;
          done: string;
          driver_available: boolean;
          driver_name: string;
          owner_id: string;
          pickup: string;
          preferred_time: string;
          price: number;
          trip_id: number;
        }[];
      };
      list_available_drivers: {
        Args: Record<PropertyKey, never>;
        Returns: {
          available: boolean;
          carModel: string;
          carPlate: string;
          created_at: string;
          displayName: string;
          id: number;
          owner_id: string;
          pictureUrl: string;
          username: string;
        }[];
      };
      request_trip: {
        Args: {
          p_customer_id: string;
          p_destination: string;
          p_name: string;
          p_owner_id: string;
          p_passenger_phone?: string;
          p_pickup: string;
          p_preferred_time?: string;
        };
        Returns: { created_at: string; trip_id: number }[];
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicSchema = Database['public'];

export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row'];
export type TablesInsert<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Update'];
