import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audit_id } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Récupérer l'audit avec toutes les infos nécessaires
    const { data: audit, error: auditError } = await supabase
      .from("audits")
      .select(`
        *,
        audited_companies(name, sector, contact_name, contact_email)
      `)
      .eq("id", audit_id)
      .single();

    if (auditError || !audit) {
      console.error("Audit not found:", auditError);
      return new Response(JSON.stringify({ error: "Audit not found", details: auditError }), { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Récupérer les secteurs, questions et réponses
    const { data: sectorsData } = await supabase
      .from("audit_sectors")
      .select("*")
      .order("order_index");

    const { data: questionsData } = await supabase
      .from("audit_questions")
      .select("*")
      .order("order_index");

    const { data: responsesData } = await supabase
      .from("audit_responses")
      .select("*")
      .eq("audit_id", audit_id);

    const { data: commentsData } = await supabase
      .from("sector_comments")
      .select(`
        comment,
        sector_id,
        audit_sectors!inner(name)
      `)
      .eq("audit_id", audit_id);

    // Analyser les réponses pour générer des insights
    const totalQuestions = questionsData?.length || 0;
    const answeredQuestions = responsesData?.length || 0;
    const averageScore = responsesData?.reduce((sum, r) => sum + (r.score || 0), 0) / answeredQuestions || 0;

    // Grouper les réponses par secteur
    const sectorScores = sectorsData?.map(sector => {
      const sectorQuestions = questionsData?.filter(q => q.sector_id === sector.id) || [];
      const sectorResponses = sectorQuestions.map(q => 
        responsesData?.find(r => r.question_id === q.id)
      ).filter(r => r);
      
      const sectorScore = sectorResponses.reduce((sum, r) => sum + (r?.score || 0), 0);
      const maxScore = sectorQuestions.reduce((sum, q) => sum + (q.weighting || 1), 0);
      
      return {
        name: sector.name,
        score: sectorScore,
        maxScore: maxScore,
        percentage: maxScore > 0 ? Math.round((sectorScore / maxScore) * 100) : 0
      };
    }) || [];

    // Construire le prompt pour l'IA
    const prompt = `
Vous êtes un expert en audit digital pour IMOTION, intégrateur Apple et solutions IA.

INFORMATIONS SUR L'ENTREPRISE AUDITÉE:
- Nom: ${audit.audited_companies?.name || 'Non spécifié'}
- Secteur d'activité: ${audit.audited_companies?.sector || 'Non spécifié'}
- Contact: ${audit.audited_companies?.contact_name || ''} (${audit.audited_companies?.contact_email || ''})

RÉSULTATS DE L'AUDIT:
- Questions posées: ${totalQuestions}
- Questions répondues: ${answeredQuestions}
- Score moyen global: ${Math.round(averageScore * 100)}%

SCORES PAR SECTEUR:
${sectorScores.map(s => `- ${s.name}: ${s.percentage}% (${s.score}/${s.maxScore})`).join('\n')}

COMMENTAIRES DU CLIENT:
${commentsData?.map((c: any) => `- ${c.audit_sectors?.name}: ${c.comment}`).join('\n') || 'Aucun commentaire'}

Générez un rapport d'audit structuré, professionnel et actionnable comprenant:

1. **SYNTHÈSE EXÉCUTIVE**
   - Résumé en 3-4 points clés
   - Score global de maturité digitale
   - Enjeux principaux identifiés

2. **ANALYSE PAR SECTEUR**
   Pour chaque secteur analysé, détaillez:
   - État actuel (score et constats)
   - Points forts existants
   - Points d'amélioration prioritaires
   - Risques identifiés

3. **SOLUTIONS PROPOSÉES PAR IMOTION**
   - Recommandations techniques concrètes
   - Solutions Apple et IA adaptées au contexte
   - Quick wins (résultats rapides en 1-2 mois)
   - Améliorations structurelles à moyen terme (3-6 mois)
   - Évolution stratégique à long terme

4. **PLAN D'ACCOMPAGNEMENT PROPOSÉ**
   - **Phase 1: Diagnostic approfondi et planification** (2-3 semaines)
     * Audit technique détaillé
     * Cartographie des processus
     * Définition des objectifs
   
   - **Phase 2: Mise en œuvre des solutions** (4-12 semaines selon périmètre)
     * Installation et configuration
     * Migration des données
     * Intégration des outils
   
   - **Phase 3: Formation et accompagnement** (2-4 semaines)
     * Formation des équipes
     * Documentation
     * Support dédié
   
   - **Phase 4: Optimisation continue**
     * Suivi des KPIs
     * Ajustements et améliorations
     * Support technique

5. **BÉNÉFICES ATTENDUS**
   - Gains de productivité estimés (en % ou en heures/jour)
   - ROI prévisionnel sur 12-24 mois
   - Impact sur l'organisation et les équipes
   - Avantages compétitifs

Format: Markdown structuré, professionnel, orienté solutions IMOTION. Soyez spécifique et actionnable.
`;

    // Appeler l'IA via Lovable Gateway
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log("Calling AI Gateway for audit report...");
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "Vous êtes un expert en audit digital et transformation numérique pour IMOTION. Vous rédigez des rapports structurés, actionnables et orientés solutions Apple et IA."
          },
          { role: "user", content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.7
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status} - ${errorText}`);
    }

    const aiJson = await aiResponse.json();
    const reportContent = aiJson?.choices?.[0]?.message?.content || "Rapport indisponible.";

    console.log("AI report generated successfully");

    // Générer le HTML du rapport avec le branding IMOTION
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport d'Audit IMOTION</title>
  <style>
    body { font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; color: #111; background: #F7F7F8; margin: 0; padding: 20px; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { border-bottom: 3px solid #D91E18; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { margin: 0; font-size: 28px; color: #111; }
    .header .subtitle { color: #666; font-size: 14px; margin-top: 8px; }
    .content { line-height: 1.8; }
    .content h2 { color: #D91E18; margin-top: 30px; font-size: 20px; }
    .content h3 { color: #111; margin-top: 20px; font-size: 16px; }
    .content ul, .content ol { margin: 10px 0; padding-left: 25px; }
    .content li { margin: 8px 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; text-align: center; color: #666; font-size: 12px; }
    pre { background: #F7F7F8; padding: 15px; border-radius: 8px; overflow-x: auto; white-space: pre-wrap; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Rapport d'Audit Digital IMOTION</h1>
      <div class="subtitle">
        Entreprise: ${audit.audited_companies?.name || 'Non spécifié'}<br>
        Contact: ${audit.audited_companies?.contact_name || ''}<br>
        Date: ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
      </div>
    </div>
    <div class="content">
      ${reportContent.split('\n').map(line => {
        if (line.startsWith('# ')) return `<h2>${line.substring(2)}</h2>`;
        if (line.startsWith('## ')) return `<h3>${line.substring(3)}</h3>`;
        if (line.startsWith('- ')) return `<li>${line.substring(2)}</li>`;
        if (line.trim() === '') return '<br>';
        return `<p>${line}</p>`;
      }).join('\n')}
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} IMOTION · Intégrateur Apple & IA · contact@imotion.tech
    </div>
  </div>
</body>
</html>
    `;

    // Stocker le rapport HTML directement dans la base de données
    const { error: updateError } = await supabase
      .from("audits")
      .update({ 
        generated_report: html,
        report_generated_at: new Date().toISOString(),
        status: "completed",
        global_score: Math.round(averageScore * 100),
        updated_at: new Date().toISOString()
      })
      .eq("id", audit_id);

    if (updateError) {
      console.error("Update error:", updateError);
      throw updateError;
    }

    // Logger l'action
    await supabase.from("workflow_logs").insert({
      entity_type: "audit",
      entity_id: audit_id,
      action: "AUDIT_REPORT_GENERATED",
      details: { score: Math.round(averageScore * 100) },
      performed_by: audit.created_by
    });

    console.log("Audit report generated successfully");

    return new Response(
      JSON.stringify({ 
        success: true,
        report: html,
        audit_id: audit_id,
        score: Math.round(averageScore * 100)
      }), 
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error("Error in generate-audit-report:", error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
