import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });

  try {
    const { trip_id, customer_id } = await request.json();
    if (!Number.isInteger(trip_id) || typeof customer_id !== 'string') {
      return json({ error: 'Datos de viaje inválidos' }, 400);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const mercadoPagoToken = Deno.env.get('MP_ACCESS_TOKEN');
    const appUrl = Deno.env.get('APP_URL');

    if (!supabaseUrl || !serviceRoleKey || !mercadoPagoToken || !appUrl) {
      return json({ error: 'La función de pago no está configurada' }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: trip, error: tripError } = await supabase
      .from('Trips')
      .select('id, owner_id, customer_id, price, done')
      .eq('id', trip_id)
      .eq('customer_id', customer_id)
      .eq('done', 'completed')
      .maybeSingle();

    if (tripError || !trip || !trip.price || Number(trip.price) <= 0) {
      return json({ error: 'El viaje no está listo para pagar' }, 400);
    }

    const preferenceResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${mercadoPagoToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [{
          title: `Viaje en Taxi #${trip.id}`,
          unit_price: Number(trip.price),
          quantity: 1,
          currency_id: 'ARS',
        }],
        external_reference: String(trip.id),
        metadata: {
          trip_id: trip.id,
          owner_id: trip.owner_id,
          customer_id: trip.customer_id,
        },
        back_urls: {
          success: `${appUrl}/payment`,
          failure: `${appUrl}/payment`,
          pending: `${appUrl}/payment`,
        },
        notification_url: `${supabaseUrl}/functions/v1/mp-webhook`,
        auto_return: 'approved',
      }),
    });

    const preference = await preferenceResponse.json();
    if (!preferenceResponse.ok) {
      console.error('Mercado Pago preference error', preference);
      return json({ error: 'Mercado Pago rechazó la preferencia' }, 502);
    }

    return json({ init_point: preference.init_point, id: preference.id });
  } catch (error) {
    console.error('create-preference-mp failed', error);
    return json({ error: 'No se pudo iniciar el pago' }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
