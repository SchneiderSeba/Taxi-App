import { clientSupaBase } from '../../supabase/client';

export type PaymentResult = {
  amount?: number;
  status?: string;
  mp_payment_id?: string;
};

export async function createPaymentPreference(tripId: number, customerId: string): Promise<string> {
  const { data, error } = await clientSupaBase.functions.invoke('create-preference-mp', {
    body: { trip_id: tripId, customer_id: customerId },
  });
  if (error) throw error;
  if (!isPreferenceResponse(data)) throw new Error('No se recibió un enlace de pago válido.');
  return data.init_point;
}

export async function getPaymentResult(paymentId: string): Promise<PaymentResult | null> {
  const { data, error } = await clientSupaBase
    .rpc('get_payment_result', { p_payment_id: paymentId })
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

function isPreferenceResponse(value: unknown): value is { init_point: string } {
  return typeof value === 'object'
    && value !== null
    && 'init_point' in value
    && typeof value.init_point === 'string'
    && value.init_point.startsWith('https://');
}
