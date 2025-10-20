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
        profiles!audits_client_id_fkey(full_name, email),
        companies(name),
        service_requests(title, description)
      `)
      .eq("id", audit_id)
      .single();

    if (auditError || !audit) {
      console.error("Audit not found:", auditError);
      return new Response(JSON.stringify({ error: "Audit not found" }), { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Construire le prompt pour l'IA
    const prompt = `
Vous êtes un expert en audit digital pour IMOTION, intégrateur Apple et solutions IA.

Contexte du projet:
- Titre: ${audit.title || audit.service_requests?.title || 'Sans titre'}
- Description: ${audit.service_requests?.description || 'Non spécifiée'}
- Périmètre: ${audit.scope || 'À définir'}
- Client: ${audit.profiles?.full_name || 'Non spécifié'}
- Entreprise: ${audit.companies?.name || 'Particulier'}

Générez un rapport d'audit structuré et actionnable comprenant:

1. SYNTHÈSE EXÉCUTIVE
   - Résumé en 3-4 points clés
   - Enjeux principaux identifiés

2. ANALYSE DÉTAILLÉE
   - État actuel de la situation
   - Points forts existants
   - Points d'amélioration prioritaires
   - Risques identifiés

3. SOLUTIONS PROPOSÉES
   - Recommandations techniques
   - Solutions Apple et IA adaptées
   - Quick wins (résultats rapides)
   - Améliorations à moyen terme

4. JALONS ET LIVRABLES PROPOSÉS
   - Phase 1: Diagnostic et planification (2 semaines)
   - Phase 2: Mise en œuvre (4-8 semaines)
   - Phase 3: Formation et accompagnement (2 semaines)
   - Phase 4: Optimisation continue

5. BÉNÉFICES ATTENDUS
   - Gains de productivité estimés
   - ROI prévisionnel
   - Impact sur l'organisation

Format: Markdown structuré, professionnel, orienté solutions IMOTION.
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
      <h1>Rapport d'Audit IMOTION</h1>
      <div class="subtitle">
        Client: ${audit.profiles?.full_name || 'Non spécifié'} ${audit.companies?.name ? `(${audit.companies.name})` : ''}<br>
        Date: ${new Date().toLocaleDateString('fr-FR')}
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

    // Uploader le rapport dans le storage
    const fileName = `report-${audit_id}-${Date.now()}.html`;
    const { error: uploadError } = await supabase.storage
      .from("audit-reports")
      .upload(fileName, new Blob([html], { type: "text/html" }), { 
        upsert: true,
        contentType: "text/html"
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    // Obtenir l'URL publique
    const { data: urlData } = supabase.storage
      .from("audit-reports")
      .getPublicUrl(fileName);

    const reportUrl = urlData.publicUrl;

    // Mettre à jour l'audit
    const { error: updateError } = await supabase
      .from("audits")
      .update({ 
        report_pdf_url: reportUrl, 
        status: "Prêt",
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
      action: "AUDIT_AI_READY",
      details: { report_url: reportUrl },
      performed_by: audit.client_id
    });

    console.log("Audit report generated successfully:", reportUrl);

    // Envoyer l'email (appel à send-proposal-email)
    try {
      await supabase.functions.invoke('send-proposal-email', {
        body: {
          to: audit.profiles?.email,
          subject: "Votre rapport d'audit IMOTION est prêt",
          html: `
            <h2>Votre rapport d'audit est disponible</h2>
            <p>Bonjour ${audit.profiles?.full_name || 'Client'},</p>
            <p>Nous avons analysé votre besoin en détail. Votre rapport d'audit personnalisé est maintenant disponible.</p>
            <p><a href="${reportUrl}" style="background:#111;color:#fff;padding:12px 24px;border-radius:8px;display:inline-block;text-decoration:none;margin:20px 0;">Consulter le rapport</a></p>
            <p>Notre équipe reste à votre disposition pour échanger sur les recommandations et prochaines étapes.</p>
            <p>Cordialement,<br>L'équipe IMOTION</p>
          `,
          ccAdmins: ['ops@imotion.tech'],
          relatedRequest: audit.request_id,
          relatedProfile: audit.client_id
        }
      });
    } catch (emailError) {
      console.error("Email sending error (non-blocking):", emailError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        report_url: reportUrl,
        audit_id: audit_id
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
