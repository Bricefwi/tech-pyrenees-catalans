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
Rédige un article court (300-500 mots) sur le thème : "${theme}".
Structure : introduction, 3 idées clés avec chiffres, conclusion action.
Style : professionnel, clair, orienté business, sans jargon technique.
Langue : Français.

Fournis aussi un highlight court (une phrase percutante avec des chiffres) qui résume le bénéfice principal.
Format JSON : {"content": "le contenu de l'article", "highlight": "le highlight"}
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
        description: result.content.slice(0, 450) + "...",
        highlight: result.highlight || "Solution IA générée automatiquement",
        image_url: napkinImageUrl,
        napkin_url: "https://www.napkin.ai",
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
