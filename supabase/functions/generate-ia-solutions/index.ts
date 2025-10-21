import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { theme } = await req.json();

    if (!theme) {
      return new Response(
        JSON.stringify({ error: "Theme is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const prompt = `
Tu es un expert en stratégie commerciale B2B et communication visuelle.
Rédige un article court et vendeur (400-600 mots) sur le thème : "${theme}".

Structure requise :
- Introduction accrocheuse (2-3 phrases)
- Corps de l'article avec 3-4 bénéfices concrets
- Ton pédagogique et vendeur, orienté résultats business
- Style : professionnel mais accessible, sans jargon technique
- Langue : Français

Fournis aussi :
- Un highlight (une phrase percutante avec des chiffres clés)
- 3 points clés avec des emojis pertinents et des bénéfices mesurables

Format JSON :
{
  "content": "le contenu complet de l'article",
  "highlight": "phrase percutante avec chiffres",
  "key_points": [
    {"icon": "emoji", "text": "bénéfice mesurable"},
    {"icon": "emoji", "text": "bénéfice mesurable"},
    {"icon": "emoji", "text": "bénéfice mesurable"}
  ]
}
`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Tu es un expert en rédaction d\'articles marketing B2B orientés IA et automatisation.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const result = JSON.parse(aiData.choices[0].message.content);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Générer l'URL de l'image Napkin.ai
    const napkinImageUrl = `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000000000)}?w=800&h=600&fit=crop`;
    
    const { data, error } = await supabase
      .from("ia_solutions")
      .insert({
        title: theme,
        description: result.content.slice(0, 250) + "...",
        full_content: result.content,
        highlight: result.highlight || "Solution IA générée automatiquement",
        key_points: result.key_points || [],
        image_url: napkinImageUrl,
        cta_text: "Demander un Audit",
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ status: "success", theme, solution: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-ia-solutions:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
