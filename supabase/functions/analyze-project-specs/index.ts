import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { specs, client } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY non configurée');
    }

    console.log('Analyse du cahier des charges pour:', client || 'Client non spécifié');

    const prompt = `
Tu es un consultant expert en transformation digitale et automatisation no-code.
Analyse le cahier des charges suivant :
---
${specs}
---
Client : ${client || "Non spécifié"}

Rédige :
1. Une synthèse claire du besoin.
2. Les points critiques et risques identifiés.
3. Trois axes de solutions technologiques possibles (NoCode, IA, Automatisation).
4. Un plan projet structuré en jalons (avec durées indicatives et livrables).
5. Les gains potentiels estimés en productivité, organisation et visibilité.
`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Tu réponds de manière structurée, claire et exploitable par un professionnel." },
          { role: "user", content: prompt },
        ],
        max_tokens: 1800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur AI Gateway:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit atteint' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Crédits insuffisants' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || "Analyse indisponible.";

    return new Response(JSON.stringify({ analysis: text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error('Erreur analyse specs:', err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Erreur inconnue' }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
