import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting: max 10 requests per IP per hour
const RATE_LIMIT = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const requestCounts = new Map<string, { count: number; resetTime: number }>();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting check
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    const now = Date.now();
    const rateLimitData = requestCounts.get(clientIP);
    
    if (rateLimitData) {
      if (now < rateLimitData.resetTime) {
        if (rateLimitData.count >= RATE_LIMIT) {
          return new Response(
            JSON.stringify({ 
              error: 'Trop de requêtes. Veuillez réessayer dans quelques minutes.',
              reponse: 'Pour éviter les abus, nous limitons le nombre de questions. Veuillez patienter quelques minutes avant de réessayer.'
            }),
            { 
              status: 429, 
              headers: { 
                ...corsHeaders, 
                'Content-Type': 'application/json',
                'Retry-After': String(Math.ceil((rateLimitData.resetTime - now) / 1000))
              } 
            }
          );
        }
        rateLimitData.count++;
      } else {
        // Reset window
        requestCounts.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
      }
    } else {
      requestCounts.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    }
    
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
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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