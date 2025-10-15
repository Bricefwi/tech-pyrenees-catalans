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
    const { specifications, serviceType, clientInfo } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY non configurée');
    }

    console.log('Génération propositions commerciales pour service:', serviceType);

    // Prompt pour générer des propositions commerciales
    const systemPrompt = `Tu es un expert en transformation digitale, No-Code, et IA avec une approche commerciale et technique.

Ton rôle est d'analyser le cahier des charges client et de proposer des SOLUTIONS CONCRÈTES pour accompagner leur transformation digitale.

Tu dois générer un document de PROPOSITIONS COMMERCIALES au format suivant:

# PROPOSITIONS DE SOLUTIONS DIGITALES

## 1. ANALYSE DU BESOIN
- Résumé de la problématique client
- Enjeux identifiés
- Opportunités de transformation

## 2. SOLUTIONS PROPOSÉES

### Solution 1: [Nom de la solution]
**Type:** No-Code / IA / Développement Custom / Hybride
**Description:** Description détaillée de la solution
**Technologies/Outils suggérés:** Liste des outils (Make, Zapier, Bubble, GPT, etc.)
**Fonctionnalités clés:**
- Fonctionnalité 1
- Fonctionnalité 2
- ...

**Gains attendus:**
- Gain en temps: XX%
- Réduction coûts: XX%
- Autres bénéfices mesurables

**Budget estimatif:** Fourchette de prix
**Délai de mise en œuvre:** X semaines/mois

### Solution 2: [Alternative ou complémentaire]
[Même structure]

## 3. PLAN DE MISE EN ŒUVRE RECOMMANDÉ
### Phase 1: POC/Prototype (X semaines)
### Phase 2: Déploiement (X semaines)
### Phase 3: Optimisation et formation

## 4. ROI ESTIMÉ
- Investissement total estimé
- Gains annuels estimés
- ROI sur 12/24/36 mois

## 5. PROCHAINES ÉTAPES
- Actions recommandées
- Points à valider avec le client
- Opportunités d'audit approfondi

Sois CONCRET, COMMERCIAL et orienté RÉSULTATS. Propose des solutions réalistes qui génèrent de la valeur mesurable.`;

    const userPrompt = `Voici le cahier des charges client pour un projet "${serviceType}":

${specifications}

${clientInfo ? `Informations client:\n${clientInfo}\n` : ''}

Génère maintenant les propositions commerciales complètes avec des solutions No-Code, IA et/ou développement adaptées.`;

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
        max_tokens: 3000,
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
    const proposals = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ proposals }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur génération propositions:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erreur inconnue' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});