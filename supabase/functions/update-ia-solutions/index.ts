import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    if (!supabaseUrl || !supabaseKey || !openaiKey) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const prompt = `Génère 4 courtes fiches d'exemples concrets d'améliorations IA pour PME.
Chaque fiche contient :
- un titre (max 80 caractères)
- une explication simple (2-3 phrases, max 150 caractères)
- un bénéfice chiffré ou observable (court, max 80 caractères)
- un prompt pour Napkin.ai (description claire en anglais pour générer un visuel)
- une couleur (#E11932 ou #222 ou #555)

Format JSON strict :
{"solutions": [{"title":"","description":"","benefit":"","visual_prompt":"","color":""}]}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [{ 
          role: "user", 
          content: prompt 
        }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API error:", error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    const solutions = content.solutions || [];

    // Transformer les solutions pour ajouter les URLs Napkin.ai
    const transformedSolutions = solutions.map((sol: any) => ({
      title: sol.title,
      description: sol.description,
      benefit: sol.benefit,
      visual: `https://www.napkin.ai/api/render?prompt=${encodeURIComponent(sol.visual_prompt)}`,
      color: sol.color || '#E11932',
    }));

    // Supprimer anciennes solutions et insérer les nouvelles
    await supabase.from("ia_solutions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    const { error: insertError } = await supabase.from("ia_solutions").insert(transformedSolutions);

    if (insertError) {
      console.error("Insert error:", insertError);
      throw insertError;
    }

    console.log(`✅ Updated ${transformedSolutions.length} IA solutions`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: transformedSolutions.length,
        solutions: transformedSolutions 
      }), 
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error in update-ia-solutions:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }), 
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
