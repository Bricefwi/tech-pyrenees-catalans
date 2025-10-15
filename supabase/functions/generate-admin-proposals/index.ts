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

    // Prompt pour générer des propositions commerciales orientées organisation
    const systemPrompt = `Tu es un expert en transformation digitale et conseil en organisation.
Ton rôle est d'analyser les besoins d'un client et de proposer des solutions organisationnelles et digitales concrètes.

IMPORTANT - Structure de la réponse:
- Utilise des titres et sous-titres clairs (##, ###)
- Utilise des puces (•) pour lister les éléments importants
- Crée une hiérarchie claire avec des paragraphes bien structurés
- Formate le texte pour qu'il soit professionnel et lisible

Format de réponse attendu:
Propose 2-3 solutions principales en te concentrant sur:

Pour chaque solution:
## [Titre de la Solution]

### Organisation et Processus
• Comment réorganiser les flux de travail
• Amélioration de l'efficacité opérationnelle
• Impact sur la collaboration

### Gains Organisationnels Estimés
• Productivité: [X% à Y%] d'amélioration potentielle
• Efficacité: réduction des tâches manuelles de [X% à Y%]
• Qualité: amélioration de [X% à Y%]

### Approche Technique
• Architecture et technologies recommandées (stratégique, sans noms d'outils)
• Infrastructure et intégrations nécessaires
• Sécurité et scalabilité

### Méthodologie de Mise en Œuvre
• Phase 1: [Description]
• Phase 2: [Description]
• Phase 3: [Description]

RÈGLES STRICTES:
- JAMAIS de chiffres absolus pour les gains (pas de "économie de 10000€" ou "50 heures économisées")
- TOUJOURS des pourcentages potentiels réalistes et prudents (ex: "15% à 25%", "20% à 35%")
- Focus sur l'ORGANISATION et la TRANSFORMATION des processus
- Reste générique sur la technique, évite les noms d'applications ou outils spécifiques
- Ton professionnel, factuel, orienté résultats mesurables
- Pas de promesses démesurées, sois réaliste et prudent

Ton ton doit être:
- Professionnel et stratégique
- Orienté valeur business et ROI organisationnel
- Concret avec des métriques en pourcentages
- Rassurant sur la méthodologie

Ne propose jamais de prix, de délais précis ou de gains chiffrés en valeur absolue.`;

    const userPrompt = `Voici le cahier des charges pour un projet "${serviceType}":

${specifications}

${clientInfo ? `Informations client:\n${clientInfo}\n` : ''}

Génère des propositions de solutions organisationnelles et digitales avec des gains exprimés en pourcentages potentiels réalistes et prudents.`;

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