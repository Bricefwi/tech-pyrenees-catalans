import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

    // Fonction pour convertir le markdown en HTML
    function formatMarkdownToHTML(markdown: string): string {
      let html = markdown;
      
      // Titres
      html = html.replace(/### (.*?)(\n|$)/g, '<h4>$1</h4>');
      html = html.replace(/## (.*?)(\n|$)/g, '<h3>$1</h3>');
      html = html.replace(/# (.*?)(\n|$)/g, '<h2>$1</h2>');
      
      // Gras
      html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Listes
      const lines = html.split('\n');
      let inList = false;
      const processedLines: string[] = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.startsWith('- ') || line.startsWith('* ')) {
          if (!inList) {
            processedLines.push('<ul>');
            inList = true;
          }
          processedLines.push(`<li>${line.substring(2)}</li>`);
        } else {
          if (inList) {
            processedLines.push('</ul>');
            inList = false;
          }
          if (line && !line.startsWith('<h')) {
            processedLines.push(`<p>${line}</p>`);
          } else {
            processedLines.push(line);
          }
        }
      }
      
      if (inList) {
        processedLines.push('</ul>');
      }
      
      return processedLines.join('\n');
    }

    // Générer le HTML du rapport avec le branding IMOTION
    const formattedContent = formatMarkdownToHTML(reportContent);
    
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport d'Audit Digital IMOTION - ${audit.audited_companies?.name || 'Entreprise'}</title>
  <style>
    * { box-sizing: border-box; }
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
      color: #1F2937; 
      background: #F9FAFB; 
      margin: 0; 
      padding: 0;
      line-height: 1.6;
    }
    .page { 
      max-width: 900px; 
      margin: 0 auto; 
      background: white; 
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    
    /* Page de couverture */
    .cover-page {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #1F2937 0%, #374151 100%);
      color: white;
      text-align: center;
      padding: 60px 40px;
      page-break-after: always;
    }
    .cover-page .logo {
      font-size: 36px;
      font-weight: 800;
      color: #E31E24;
      margin-bottom: 40px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .cover-page h1 {
      font-size: 42px;
      font-weight: 700;
      margin: 0 0 20px 0;
      line-height: 1.2;
    }
    .cover-page .subtitle {
      font-size: 24px;
      font-weight: 300;
      margin-bottom: 60px;
      opacity: 0.9;
    }
    .cover-page .client-info {
      background: rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 30px 40px;
      backdrop-filter: blur(10px);
      margin-top: 40px;
    }
    .cover-page .client-info p {
      margin: 8px 0;
      font-size: 16px;
    }
    .cover-page .date {
      margin-top: 60px;
      font-size: 14px;
      opacity: 0.7;
    }
    
    /* Score global */
    .score-banner {
      background: linear-gradient(135deg, #E31E24 0%, #DC2626 100%);
      color: white;
      padding: 40px;
      text-align: center;
      margin-bottom: 40px;
    }
    .score-value {
      font-size: 72px;
      font-weight: 800;
      line-height: 1;
      margin-bottom: 10px;
    }
    .score-label {
      font-size: 18px;
      opacity: 0.95;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    /* Sections du contenu */
    .content-section {
      padding: 40px;
    }
    .section-header {
      border-left: 4px solid #E31E24;
      padding-left: 20px;
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 28px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 8px 0;
    }
    .section-subtitle {
      font-size: 14px;
      color: #6B7280;
      margin: 0;
    }
    
    /* Scores par secteur */
    .sector-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin: 30px 0;
    }
    .sector-card {
      border: 1px solid #E5E7EB;
      border-radius: 12px;
      padding: 24px;
      background: #FAFAFA;
    }
    .sector-card h3 {
      margin: 0 0 16px 0;
      font-size: 16px;
      color: #111827;
      font-weight: 600;
    }
    .sector-score {
      font-size: 36px;
      font-weight: 700;
      color: #E31E24;
      margin-bottom: 8px;
    }
    .sector-bar {
      height: 8px;
      background: #E5E7EB;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 12px;
    }
    .sector-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #E31E24 0%, #DC2626 100%);
      transition: width 0.3s ease;
    }
    
    /* Plan d'accompagnement */
    .timeline {
      position: relative;
      padding: 20px 0;
      margin: 40px 0;
    }
    .timeline::before {
      content: '';
      position: absolute;
      left: 30px;
      top: 0;
      bottom: 0;
      width: 3px;
      background: #E5E7EB;
    }
    .timeline-item {
      position: relative;
      padding-left: 80px;
      padding-bottom: 40px;
    }
    .timeline-marker {
      position: absolute;
      left: 18px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #E31E24;
      border: 4px solid white;
      box-shadow: 0 0 0 3px #E5E7EB;
    }
    .timeline-content {
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      border-radius: 12px;
      padding: 24px;
    }
    .timeline-content h4 {
      margin: 0 0 8px 0;
      font-size: 18px;
      color: #111827;
      font-weight: 600;
    }
    .timeline-content .duration {
      color: #E31E24;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 12px;
    }
    .timeline-content ul {
      margin: 12px 0 0 0;
      padding-left: 20px;
    }
    .timeline-content li {
      margin: 6px 0;
      color: #4B5563;
    }
    
    /* Recommandations */
    .recommendation-card {
      border-left: 4px solid #E31E24;
      background: #FEFCE8;
      border-radius: 8px;
      padding: 20px 24px;
      margin: 16px 0;
    }
    .recommendation-card.priority-high {
      border-left-color: #DC2626;
      background: #FEE2E2;
    }
    .recommendation-card.priority-medium {
      border-left-color: #F59E0B;
      background: #FEF3C7;
    }
    .recommendation-card.priority-low {
      border-left-color: #10B981;
      background: #D1FAE5;
    }
    .recommendation-card h4 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
      color: #111827;
    }
    .recommendation-card .priority-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 12px;
    }
    .priority-high .priority-badge {
      background: #DC2626;
      color: white;
    }
    .priority-medium .priority-badge {
      background: #F59E0B;
      color: white;
    }
    .priority-low .priority-badge {
      background: #10B981;
      color: white;
    }
    
    /* Bénéfices */
    .benefits-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
      margin: 30px 0;
    }
    .benefit-card {
      text-align: center;
      padding: 24px;
      background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%);
      border-radius: 12px;
      border: 1px solid #E5E7EB;
    }
    .benefit-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    .benefit-value {
      font-size: 32px;
      font-weight: 700;
      color: #E31E24;
      margin-bottom: 8px;
    }
    .benefit-label {
      font-size: 14px;
      color: #6B7280;
    }
    
    /* Contenu texte */
    .text-content h2 {
      font-size: 24px;
      color: #111827;
      margin: 32px 0 16px 0;
      font-weight: 600;
    }
    .text-content h3 {
      font-size: 18px;
      color: #374151;
      margin: 24px 0 12px 0;
      font-weight: 600;
    }
    .text-content h4 {
      font-size: 16px;
      color: #4B5563;
      margin: 20px 0 10px 0;
      font-weight: 600;
    }
    .text-content p {
      margin: 12px 0;
      color: #4B5563;
      line-height: 1.8;
    }
    .text-content ul, .text-content ol {
      margin: 12px 0;
      padding-left: 24px;
    }
    .text-content li {
      margin: 8px 0;
      color: #4B5563;
    }
    .text-content strong {
      color: #111827;
      font-weight: 600;
    }
    
    /* Footer */
    .footer {
      background: #1F2937;
      color: white;
      padding: 40px;
      text-align: center;
      margin-top: 60px;
    }
    .footer p {
      margin: 8px 0;
      opacity: 0.8;
    }
    .footer .contact {
      margin-top: 20px;
      font-size: 14px;
    }
    
    /* Impression */
    @media print {
      .page { box-shadow: none; }
      .cover-page { page-break-after: always; }
      .content-section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Page de couverture -->
    <div class="cover-page">
      <div class="logo">⚡ IMOTION</div>
      <h1>Rapport d'Audit Digital<br>et de Transformation Numérique</h1>
      <div class="subtitle">Analyse & Recommandations Personnalisées</div>
      
      <div class="client-info">
        <p><strong>Entreprise:</strong> ${audit.audited_companies?.name || 'Non spécifié'}</p>
        <p><strong>Secteur d'activité:</strong> ${audit.audited_companies?.sector || 'Non spécifié'}</p>
        ${audit.audited_companies?.contact_name ? `<p><strong>Contact:</strong> ${audit.audited_companies.contact_name}</p>` : ''}
      </div>
      
      <div class="date">
        **Date:** ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}<br>
        **Audit Réalisé par:** IMOTION - Expert en Audit Digital & Intégration Apple/IA
      </div>
    </div>
    
    <!-- Score global -->
    <div class="score-banner">
      <div class="score-value">${Math.round(averageScore * 100)}%</div>
      <div class="score-label">Score de Maturité Digitale</div>
    </div>
    
    <!-- Scores par secteur -->
    <div class="content-section">
      <div class="section-header">
        <h2 class="section-title">Analyse par Secteur</h2>
        <p class="section-subtitle">Évaluation détaillée de votre maturité digitale</p>
      </div>
      
      <div class="sector-grid">
        ${sectorScores.map(s => `
          <div class="sector-card">
            <h3>${s.name}</h3>
            <div class="sector-score">${s.percentage}%</div>
            <div class="sector-bar">
              <div class="sector-bar-fill" style="width: ${s.percentage}%"></div>
            </div>
            <p style="margin-top: 8px; font-size: 14px; color: #6B7280;">${s.score} / ${s.maxScore} points</p>
          </div>
        `).join('')}
      </div>
    </div>
    
    <!-- Contenu principal du rapport IA -->
    <div class="content-section text-content">
      ${formattedContent}
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p><strong>© ${new Date().getFullYear()} IMOTION</strong></p>
      <p>Intégrateur Apple & Solutions IA · Expert en Transformation Digitale</p>
      <div class="contact">
        <p>📧 contact@imotion.tech · 📱 +33 (0)X XX XX XX XX</p>
        <p>📍 Pyrénées Catalanes, France</p>
      </div>
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
