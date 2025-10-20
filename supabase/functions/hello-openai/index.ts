// ------------------------------
// IMOTION - Test Cloud OpenAI API - Utilise Lovable AI
// Version cloud-ready avec logs et gestion d'erreurs
// ------------------------------

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const start = new Date();

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY non configurée");
    }

    const completion = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Tu es un assistant IMOTION en environnement cloud." },
          { role: "user", content: "Teste la connexion et réponds : Connexion AI IMOTION OK." }
        ],
        max_tokens: 30,
      }),
    });

    if (!completion.ok) {
      const errorText = await completion.text();
      throw new Error(`AI Error: ${completion.status} - ${errorText}`);
    }

    const data = await completion.json();

    const reply = data.choices[0]?.message?.content ?? "Réponse manquante";

    const end = new Date();

    // Log structuré (visible dans Supabase > Logs)
    console.log(JSON.stringify({
      event: "lovable_ai_connection_test",
      timestamp: end.toISOString(),
      duration_ms: end.getTime() - start.getTime(),
      status: "success",
      message: reply,
    }));

    return new Response(
      JSON.stringify({
        status: "success",
        message: reply,
        duration_ms: end.getTime() - start.getTime(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );

  } catch (err) {
    const end = new Date();
    const error = err as Error;

    console.error(JSON.stringify({
      event: "lovable_ai_connection_test",
      timestamp: end.toISOString(),
      duration_ms: end.getTime() - start.getTime(),
      status: "error",
      error: error.message ?? "Erreur inconnue",
    }));

    return new Response(
      JSON.stringify({
        status: "error",
        message: error.message ?? "Erreur inconnue",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
