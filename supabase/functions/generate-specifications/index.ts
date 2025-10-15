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
    const { messages, serviceType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY non configurée');
    }

    console.log('Génération cahier des charges pour service:', serviceType);

    // Prompt pour générer un cahier des charges structuré
    const systemPrompt = `Tu es un expert en gestion de projet digital et cahier des charges.

Ton rôle est de synthétiser l'échange avec le client pour créer un CAHIER DES CHARGES structuré au format suivant:

# CAHIER DES CHARGES - [Type de projet]

## 1. CONTEXTE ET OBJECTIFS
- Contexte de l'entreprise
- Problématique identifiée
- Objectifs du projet

## 2. BESOINS FONCTIONNELS
- Liste détaillée des fonctionnalités attendues
- Processus à automatiser/digitaliser
- Résultats attendus

## 3. CONTRAINTES
- Contraintes techniques
- Contraintes budgétaires (si mentionnées)
- Contraintes de délai (si mentionnées)

## 4. UTILISATEURS ET USAGES
- Profils utilisateurs
- Cas d'usage principaux

## 5. ENVIRONNEMENT TECHNIQUE (si applicable)
- Systèmes existants
- Intégrations nécessaires

## 6. CRITÈRES DE SUCCÈS
- KPIs attendus
- Gains espérés

Base-toi sur la conversation pour extraire ces informations. Si certaines informations manquent, indique-le clairement dans la section concernée.`;

    const userPrompt = `Voici l'échange avec le client concernant un projet de type "${serviceType}". 
    
Génère un cahier des charges structuré et professionnel basé sur cet échange:

${messages.map((m: any) => `${m.role === 'user' ? 'CLIENT' : 'CONSEILLER'}: ${m.content}`).join('\n\n')}

Génère maintenant le cahier des charges complet.`;

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
        max_tokens: 2000,
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
    const specifications = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ specifications }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur génération CDC:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erreur inconnue' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});