import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const { to, subject, html } = await req.json();
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY manquant");
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY manquant" }), 
        { 
          status: 500, 
          headers: { ...cors, "Content-Type": "application/json" } 
        }
      );
    }

    console.log(`Envoi email à ${to} - Sujet: ${subject}`);

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${RESEND_API_KEY}`, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        from: "Projets IA <noreply@votredomaine.com>",
        to: [to],
        subject,
        html
      })
    });

    if (!r.ok) {
      const errorText = await r.text();
      console.error("Erreur Resend:", errorText);
      return new Response(
        JSON.stringify({ error: errorText }), 
        { 
          status: 500, 
          headers: { ...cors, "Content-Type": "application/json" }
        }
      );
    }

    const data = await r.json();
    console.log("Email envoyé avec succès:", data);
    
    return new Response(
      JSON.stringify({ ok: true, data }), 
      { 
        headers: { ...cors, "Content-Type": "application/json" }
      }
    );
  } catch (e) {
    console.error("Erreur:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }), 
      { 
        status: 500, 
        headers: { ...cors, "Content-Type": "application/json" }
      }
    );
  }
});
