import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { auditData, companyInfo } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Préparer les données pour le prompt
    const sectorsData = auditData.sectors.map((sector: any) => {
      const questions = auditData.responses.filter((r: any) => 
        auditData.questions.find((q: any) => 
          q.id === r.question_id && q.sector_id === sector.id
        )
      );
      
      return {
        name: sector.name,
        weighting: sector.weighting,
        questions: questions.map((r: any) => {
          const question = auditData.questions.find((q: any) => q.id === r.question_id);
          return {
            subdomain: question?.subdomain,
            question: question?.question_text,
            response: r.response_value,
            score: r.score
          };
        })
      };
    });

    const systemPrompt = `Tu es un expert en transformation digitale et en conseil aux entreprises. 
    
Tu vas analyser un audit de maturité digitale et produire un rapport détaillé avec :

1. **Synthèse générale** : Vue d'ensemble de la maturité digitale
2. **Analyse par secteur** : Forces et faiblesses identifiées
3. **Score de maturité** : Calcul et interprétation (échelle 1-5)
4. **Recommandations prioritaires** : 3 à 5 actions concrètes à impact rapide
5. **Plan de transformation** : Roadmap sur 6-12 mois
6. **Gains attendus** : Estimation des bénéfices (temps économisé, productivité, chiffre d'affaires)
7. **Stack technologique recommandée** : Outils NoCode/IA adaptés au secteur

Utilise un ton professionnel mais accessible. Sois concret et actionnable.`;

    const userPrompt = `Voici l'audit digital d'une entreprise :

**Informations entreprise :**
- Nom : ${companyInfo.name}
- Secteur : ${companyInfo.sector || 'Non spécifié'}
- Taille : ${companyInfo.size || 'Non spécifiée'}

**Réponses par secteur :**
${JSON.stringify(sectorsData, null, 2)}

Génère un rapport complet d'audit digital professionnel avec toutes les sections demandées.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`Lovable AI error: ${response.status}`);
    }

    const data = await response.json();
    const report = data.choices?.[0]?.message?.content || 'Impossible de générer le rapport';

    return new Response(
      JSON.stringify({ report }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-audit-report:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
