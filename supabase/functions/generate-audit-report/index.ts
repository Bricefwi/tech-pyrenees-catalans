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

Tu vas analyser un audit de maturité digitale et produire un rapport HTML5 détaillé et visuellement attractif avec :

1. **En-tête percutant** : Titre principal avec le nom de l'entreprise et une accroche commerciale
2. **Score global de maturité** : Calcul sur 100 et visualisation graphique (utilise des div avec des couleurs pour créer des barres de progression HTML/CSS)
3. **Synthèse exécutive** : Vue d'ensemble de la maturité digitale en 3-4 points clés
4. **Analyse détaillée par secteur** : 
   - Score par secteur avec visualisation graphique
   - Forces identifiées
   - Faiblesses et opportunités d'amélioration
   - Prendre en compte les commentaires libres de l'utilisateur
5. **Projets de solutions concrets** : 
   - 3-5 projets NoCode/IA/Automatisation adaptés
   - Pour chaque projet : description, gains potentiels (temps, productivité, CA), ROI estimé
6. **Plan de transformation** : Roadmap sur 6-12 mois avec phases et étapes
7. **Stack technologique recommandée** : Outils NoCode/IA adaptés au secteur avec justifications

Format HTML5 moderne avec :
- Structure sémantique (sections, articles)
- Style inline CSS professionnel avec couleurs modernes (#2563eb bleu principal, #10b981 vert succès, #f59e0b orange attention)
- Graphiques créés avec des div stylisées (barres de progression, indicateurs visuels)
- Typographie claire et hiérarchie visuelle
- Design épuré et professionnel adapté à un outil commercial
- Responsive et imprimable en PDF

Utilise un ton professionnel mais accessible. Sois concret, actionnable et commercial pour convertir le prospect.`;

    const sectorComments = auditData.sectorComments || [];
    
    const userPrompt = `Voici l'audit digital d'une entreprise :

**Informations entreprise :**
- Nom : ${companyInfo.name}
- Secteur : ${companyInfo.sector || 'Non spécifié'}
- Taille : ${companyInfo.size || 'Non spécifiée'}

**Réponses par secteur :**
${JSON.stringify(sectorsData, null, 2)}

**Commentaires et attentes du client par secteur :**
${sectorComments.map((c: any) => `- ${c.sector_name}: ${c.comment || 'Aucun commentaire'}`).join('\n')}

Génère un rapport HTML5 complet d'audit digital professionnel avec toutes les sections demandées. Le HTML doit être auto-suffisant avec CSS inline et prêt à être converti en PDF.`;

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
        max_tokens: 8000,
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
