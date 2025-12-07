import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
export const supabaseKey = import.meta.env.VITE_PUBLIC_SUPABASE_KEY;

// console.log('Supabase URL:', supabaseUrl);
// console.log('Supabase Key:', supabaseKey);

export const clientSupaBase = createClient(supabaseUrl, supabaseKey);