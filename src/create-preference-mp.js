import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("Ok", { status: 200, headers: corsHeaders });
  }

  try {
    const { title, price, quantity, owner_id, client_id } = await req.json();
    const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN");

    if (!MP_ACCESS_TOKEN) {
      return new Response(JSON.stringify({ error: "MP_ACCESS_TOKEN no configurado" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const preferenceRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // items: [
        //   {
        //     title: title || "Viaje",
        //     unit_price: Number(price),
        //     quantity: Number(quantity) || 1,
        //     currency_id: "ARS",
        //   },
        // ],
        items: [{
          title: title || "Viaje",
          unit_price: Number(price),
          quantity: Number(quantity) || 1,
          currency_id: "ARS",
        }],

        payer: {
          email: "seba_19_sc@hotmail.com",
          name: "Buyer",
          surname: "Test"
        },
        
        purpose: "wallet_purchase", // Evita verificación en pruebas
        
        binary_mode: true,
        installments: 1,

        back_urls: {
        // success: "https://4gb02f93-5174.brs.devtunnels.ms/payment",
        // failure: "https://4gb02f93-5174.brs.devtunnels.ms/payment",
        // pending: "https://4gb02f93-5174.brs.devtunnels.ms/payment",
        success: "https://taxi-app-production.up.railway.app/payment",
        failure: "https://taxi-app-production.up.railway.app/payment",
        pending: "https://taxi-app-production.up.railway.app/payment",
      },

        notification_url: `https://lzxlnqeokbzytnjgglte.supabase.co/functions/v1/mp-webhook?owner_id=${owner_id}&client_id=${client_id}`,
        
        metadata: {
          owner_id: owner_id,
          client_id: client_id
        },
        
        auto_return: "approved",
      }),
    });

    if (!preferenceRes.ok) {
      const errorText = await preferenceRes.text();
      console.error("Error MP:", errorText);
      return new Response(JSON.stringify({ error: "Error en Mercado Pago", details: errorText }), {
        status: preferenceRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await preferenceRes.json();

    return new Response(JSON.stringify({ init_point: data.init_point, id: data.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error en función:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});