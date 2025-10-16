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
    const { question, _logOnly } = await req.json();

    if (!question) {
      return new Response(
        JSON.stringify({ error: 'Question requise' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Si c'est juste pour logger (FAQ trouvée côté client)
    if (_logOnly) {
      const userId = req.headers.get('authorization')?.split('Bearer ')[1];
      await supabase.from('faq_logs').insert([{
        user_id: userId || null,
        question,
        reponse: 'Trouvée dans FAQ locale',
        source: 'faq'
      }]);
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Recherche dans la table FAQ
    const { data: faqs, error: faqError } = await supabase
      .from('faq')
      .select('question, reponse')
      .eq('is_active', true)
      .ilike('question', `%${question}%`)
      .limit(1);

    if (faqError) {
      console.error('Erreur FAQ:', faqError);
    }

    if (faqs && faqs.length > 0) {
      const answer = faqs[0].reponse;
      const userId = req.headers.get('authorization')?.split('Bearer ')[1];
      
      await supabase.from('faq_logs').insert([{
        user_id: userId || null,
        question,
        reponse: answer,
        source: 'faq'
      }]);

      return new Response(
        JSON.stringify({ reponse: answer, source: 'faq' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Fallback vers Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY non configurée');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: `Tu es l'assistant de Tech Catalan, expert en réparation Apple, transformation digitale, IA et no-code en Pays Catalan. Réponds de manière concise, professionnelle et utile. Zone d'intervention : Perpignan, Argelès, Céret, frontière espagnole. Services : réparation Apple, développement web/mobile, automatisation, audit digital, formations.`
          },
          {
            role: 'user',
            content: question
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Erreur Lovable AI:', aiResponse.status, errorText);
      throw new Error(`Erreur AI: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiAnswer = aiData?.choices?.[0]?.message?.content || "Je n'ai pas pu générer une réponse. Contactez-nous directement.";

    const userId = req.headers.get('authorization')?.split('Bearer ')[1];
    await supabase.from('faq_logs').insert([{
      user_id: userId || null,
      question,
      reponse: aiAnswer,
      source: 'ia'
    }]);

    return new Response(
      JSON.stringify({ reponse: aiAnswer, source: 'ia' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur chat-faq:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        reponse: "Désolé, une erreur s'est produite. Veuillez réessayer ou nous contacter directement."
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});