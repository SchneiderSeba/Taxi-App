import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const url = new URL(req.url);
    const paymentId = url.searchParams.get("id");
    const topic = url.searchParams.get("topic");
    const ownerId = url.searchParams.get("owner_id");
    const clientId = url.searchParams.get("client_id");

    console.log("Webhook recibido:");
    console.log("topic:", topic);
    console.log("paymentId:", paymentId);

    if (!paymentId || topic !== "payment") {
      console.log("Ignorando webhook (no es payment o falta id)");
      return new Response("ok", { status: 200, headers: corsHeaders });
    }

    // Consultar detalles del pago a Mercado Pago
    const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN");
    const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      },
    });

    if (!paymentRes.ok) {
      console.error("Error al consultar pago:", await paymentRes.text());
      return new Response("Error fetching payment", { status: 500 });
    }

    const payment = await paymentRes.json();
    console.log("Payment data:", payment);

    // Insertar en Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Intentando insertar:", {
      mp_payment_id: payment.id.toString(),
      topic: topic,
      owner_id: ownerId,
      client_id: clientId
    });

    const { data: insertData, error: insertError } = await supabase.from("payments").upsert({
      mp_payment_id: payment.id.toString(),
      topic: topic,
      owner_id: ownerId || null,
      client_id: clientId || null,
      raw_query: payment, // Guardamos todo el objeto de MP como JSONB
    }, {
      onConflict: "mp_payment_id"
    });

    if (insertError) {
      console.error("Error insertando en Supabase:", JSON.stringify(insertError));
      return new Response(JSON.stringify({ error: "DB Error", details: insertError }), { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log("Insert result:", insertData);

    console.log("Pago guardado en Supabase correctamente");
    return new Response("ok", { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("Error webhook:", err);
    return new Response("Bad Request", { status: 400 });
  }
});
