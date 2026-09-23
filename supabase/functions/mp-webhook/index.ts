import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (request) => {
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const url = new URL(request.url);
    const body = await request.json().catch(() => ({}));
    const paymentId = url.searchParams.get('data.id') ?? url.searchParams.get('id') ?? body?.data?.id;
    if (!paymentId) return new Response('ok');

    const accessToken = Deno.env.get('MP_ACCESS_TOKEN');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!accessToken || !supabaseUrl || !serviceRoleKey) {
      return new Response('Function not configured', { status: 500 });
    }

    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!paymentResponse.ok) return new Response('Payment lookup failed', { status: 502 });

    const payment = await paymentResponse.json();
    const tripId = Number(payment.external_reference ?? payment.metadata?.trip_id);
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { error } = await supabase.from('payments').upsert({
      trip_id: Number.isFinite(tripId) ? tripId : null,
      owner_id: payment.metadata?.owner_id ?? null,
      customer_id: payment.metadata?.customer_id ?? null,
      mp_payment_id: String(payment.id),
      amount: payment.transaction_amount ?? null,
      status: payment.status ?? null,
      raw_query: payment,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'mp_payment_id' });

    if (error) {
      console.error('Payment persistence failed', error);
      return new Response('Database error', { status: 500 });
    }

    return new Response('ok');
  } catch (error) {
    console.error('mp-webhook failed', error);
    return new Response('Bad Request', { status: 400 });
  }
});
