import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
export const supabaseKey = import.meta.env.VITE_PUBLIC_SUPABASE_KEY;
export const mercadoPagoKey = import.meta.env.VITE_PUBLIC_MERCADO_PAGO_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltan VITE_PUBLIC_SUPABASE_URL o VITE_PUBLIC_SUPABASE_KEY.');
}

export const clientSupaBase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
  },
});
