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
    console.log("🚀 Lancement de l'agent marketing IMOTION");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    // Étape 1 : Générer 4 thèmes IA
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'Tu es un consultant marketing senior pour IMOTION, société experte en IA, Apple et automatisation. Ta mission : proposer 4 sujets à fort potentiel business pour des articles de 300 mots chacun, orientés PME et dirigeants. Les thèmes doivent être précis, inspirants et visuels.'
          },
          {
            role: 'user',
            content: 'Génère 4 thèmes d\'articles IA pour la période actuelle. Réponds avec un JSON contenant un array "themes" avec 4 strings.'
          }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const result = JSON.parse(aiData.choices[0].message.content);
    const themes = result.themes || [];

    console.log("🎯 Thèmes détectés :", themes);

    // Étape 2 : Nettoyer les anciennes solutions (plus de 60 jours)
    const supabase = createClient(SUPABASE_URL ?? "", SUPABASE_SERVICE_KEY ?? "");
    
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    await supabase
      .from("ia_solutions")
      .delete()
      .lt("created_at", sixtyDaysAgo.toISOString());

    // Étape 3 : Générer les 4 articles
    for (const theme of themes.slice(0, 4)) {
      try {
        await fetch(`${SUPABASE_URL}/functions/v1/generate-ia-solutions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ theme }),
        });
        
        // Pause entre chaque génération
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Erreur génération thème "${theme}":`, error);
      }
    }

    // Étape 4 : Notification email (optionnel)
    try {
      await supabase.functions.invoke('send-email', {
        body: {
          to: 'ops@imotion.tech',
          subject: '🧠 IMOTION – Mise à jour automatique des Solutions IA',
          html: `
            <h2>Nouvelles solutions IA publiées</h2>
            <p>Les 4 nouveaux articles ont été générés et publiés :</p>
            <ul>
              ${themes.slice(0, 4).map((t: string) => `<li>${t}</li>`).join('')}
            </ul>
            <p>📍 Page : <a href="https://votre-site.com/solutions-ia">Solutions IA</a></p>
          `
        }
      });
    } catch (emailError) {
      console.warn('Email notification failed:', emailError);
    }

    return new Response(
      JSON.stringify({
        status: "success",
        themes: themes.slice(0, 4),
        message: "Articles générés avec succès"
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in auto-marketing-agent:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
