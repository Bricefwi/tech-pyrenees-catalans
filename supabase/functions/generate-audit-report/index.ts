// supabase/functions/generate-audit-report/index.ts
// Version IMOTION v3.0 – Audit Deep Think Senior

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.3";
import OpenAI from "npm:openai@4.52.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const auditId = url.searchParams.get("audit_id");
    const force = url.searchParams.get("force") === "1";
    
    if (!auditId) {
      return new Response(JSON.stringify({ error: "Missing audit_id" }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY")! });

    console.log(`[generate-audit-report v3.0] Processing audit ${auditId} (force: ${force})`);

    // --- Chargement des données audit
    const { data: auditMeta, error: e1 } = await supabase
      .from("audits")
      .select(`
        id, created_at, status, title,
        companies(name),
        profiles!audits_created_by_fkey(full_name, email),
        generated_report
      `)
      .eq("id", auditId)
      .single();
      
    if (e1 || !auditMeta) {
      console.error("[generate-audit-report] Audit not found:", e1);
      throw new Error("Audit introuvable");
    }

    // Si rapport déjà généré et pas de force, retourner l'existant
    if (auditMeta.generated_report && !force) {
      console.log("[generate-audit-report] Returning cached report");
      return new Response(auditMeta.generated_report, { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" } 
      });
    }

    const { data: sectorsRaw } = await supabase
      .from("audit_sectors")
      .select("id, name, weighting")
      .order("order_index", { ascending: true });

    const { data: respRaw } = await supabase
      .from("audit_responses")
      .select(`
        question_id,
        response_value,
        score,
        audit_questions!inner(id, question_text, sector_id)
      `)
      .eq("audit_id", auditId);

    const sectors = (sectorsRaw ?? []).map((s) => {
      const scores = (respRaw ?? [])
        .filter((r: any) => r.audit_questions?.sector_id === s.id && r.score != null)
        .map((r: any) => Number(r.score));
      const avg = scores.length ? (scores.reduce((a,b)=>a+b,0)/scores.length) : 0;
      const maturityPct = Math.round((avg / 20) * 100);
      return { 
        sector_id: s.id, 
        sector_name: s.name, 
        weighting: Number(s.weighting ?? 0), 
        score: Number(avg.toFixed(2)),
        maturity_pct: maturityPct
      };
    });

    const dto = {
      audit_id: auditMeta.id,
      company_name: (auditMeta.companies as any)?.name ?? null,
      client_name: (auditMeta.profiles as any)?.full_name ?? null,
      client_email: (auditMeta.profiles as any)?.email ?? null,
      sectors,
      responses: (respRaw ?? []).map((r: any) => ({
        sector_id: r.audit_questions?.sector_id!,
        sector_name: sectors.find(s => s.sector_id === r.audit_questions?.sector_id)?.sector_name ?? "",
        question: r.audit_questions?.question_text ?? "",
        response_value: r.response_value,
        score: r.score
      }))
    };

    const weightedScore = sectors.reduce((acc, s) => acc + (s.score/20) * (s.weighting), 0);

    console.log("[generate-audit-report v3.0] Calling OpenAI with Deep Think Senior prompt");

    // --- PROMPT IA VERSION SENIOR IMOTION (Deep Think Expert)
    const prompt = `
Tu es un **consultant senior IMOTION**, expert Apple, IA, et automatisation. 
Ta mission : rédiger un rapport d'audit complet, exploitable commercialement, sans jargon inutile.
Style : professionnel, structuré, orienté ROI, concret, crédible.

1️⃣ Diagnostic : liste exhaustive des réponses par secteur (forces/faiblesses, scores, synthèse).
2️⃣ Analyse stratégique : quick wins, chantiers structurants, risques, mesures correctives, gains chiffrés prudents.
3️⃣ Synthèse exécutive : 5 lignes maximum, ton consultant senior.
4️⃣ Plan d'accompagnement : 4 phases avec objectifs, livrables, risques/mitigation et Gantt JSON.
5️⃣ ROI global : estimation prudente (min–max %).

Format JSON strict :
{
  "executive_summary": "texte concis",
  "recap": [{"sector":"...","weighting":0,"maturity_pct":0,"items":[{"question":"...","response":"...","score":0}],"synthesis":{"strengths":"...","weaknesses":"..."}}],
  "improvements": [{"sector":"...","quick_wins":["..."],"projects":["..."],"risks":["..."],"mitigations":["..."],"estimated_gains":{"admin_time":{"min":0,"max":0},"input_errors":{"min":0,"max":0},"stockouts":{"min":0,"max":0},"dso":{"min":0,"max":0},"traffic":{"min":0,"max":0},"conversion":{"min":0,"max":0}}}],
  "roadmap": {"phases":[{"name":"Phase 1 – ...","weeks":0,"objectives":["..."],"deliverables":["..."],"success_criteria":["..."],"risks":["..."],"mitigations":["..."]}],"gantt":[{"id":"T1","name":"...","start":"AAAA-MM-JJ","end":"AAAA-MM-JJ","progress":0}],"effort_table":[{"workstream":"Automatisation","effort_weeks":0}]},
  "roi_summary": {"global_gain_pct":{"min":0,"max":0},"key_message":"..."}
}

Client: ${dto.client_name ?? "—"}
Entreprise: ${dto.company_name ?? "—"}
Email: ${dto.client_email ?? "—"}
Score global: ${weightedScore.toFixed(1)}%
Secteurs: ${JSON.stringify(dto.sectors).slice(0, 2000)}
Réponses: ${JSON.stringify(dto.responses).slice(0, 6000)}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.25,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Tu es un consultant IMOTION Senior : tu analyses, recommandes, conclus, structure." },
        { role: "user", content: prompt }
      ],
    });

    const json = JSON.parse(completion.choices[0].message.content ?? "{}");
    console.log("[generate-audit-report v3.0] AI analysis complete, generating HTML");

    // --- Génération HTML Premium IMOTION
    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Rapport d'Audit IMOTION - ${dto.client_name ?? "Client"}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #fff;
      color: #111;
      line-height: 1.6;
    }
    .container {
      max-width: 850px;
      margin: 0 auto;
      padding: 40px 24px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #E11932;
      padding-bottom: 16px;
      margin-bottom: 32px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-text {
      font-size: 24px;
      font-weight: 800;
      color: #E11932;
    }
    .tagline {
      font-size: 12px;
      color: #6B7280;
      margin-top: 2px;
    }
    .meta {
      text-align: right;
      font-size: 12px;
      color: #6B7280;
    }
    .meta strong {
      color: #111;
    }
    h1 {
      font-size: 28px;
      font-weight: 700;
      color: #111;
      margin-bottom: 8px;
    }
    h2 {
      font-size: 20px;
      font-weight: 700;
      color: #E11932;
      margin: 40px 0 16px;
      padding-top: 16px;
      border-top: 2px solid #E11932;
    }
    .executive-summary {
      background: linear-gradient(135deg, #FEF2F2 0%, #FFF 100%);
      border-left: 4px solid #E11932;
      padding: 20px;
      margin: 24px 0;
      border-radius: 8px;
      font-size: 15px;
      line-height: 1.7;
    }
    .executive-summary strong {
      display: block;
      font-size: 16px;
      color: #E11932;
      margin-bottom: 12px;
    }
    .kpi-card {
      background: #F8FAFC;
      border: 1px solid #E5E7EB;
      border-left: 4px solid #E11932;
      padding: 16px;
      border-radius: 8px;
      margin: 16px 0;
    }
    .kpi-card h3 {
      font-size: 16px;
      font-weight: 700;
      color: #111;
      margin-bottom: 12px;
    }
    .badge {
      display: inline-block;
      background: #E11932;
      color: #fff;
      font-size: 12px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 4px;
      margin-left: 8px;
    }
    ul {
      margin: 8px 0 8px 24px;
      list-style: disc;
    }
    ul li {
      margin: 4px 0;
      color: #4B5563;
    }
    .synthesis {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #E5E7EB;
    }
    .synthesis-item {
      margin: 8px 0;
    }
    .synthesis-label {
      font-weight: 600;
      color: #111;
      margin-right: 8px;
    }
    .phase-card {
      background: #fff;
      border: 1px solid #E5E7EB;
      padding: 16px;
      border-radius: 8px;
      margin: 12px 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .phase-title {
      font-size: 16px;
      font-weight: 700;
      color: #E11932;
      margin-bottom: 12px;
    }
    .roi-box {
      background: linear-gradient(135deg, #FEF2F2 0%, #FFF 100%);
      border: 2px solid #E11932;
      padding: 20px;
      border-radius: 12px;
      margin: 24px 0;
      text-align: center;
    }
    .roi-number {
      font-size: 32px;
      font-weight: 800;
      color: #E11932;
      margin: 12px 0;
    }
    .footer {
      margin-top: 60px;
      padding-top: 24px;
      border-top: 1px solid #E5E7EB;
      text-align: center;
      font-size: 12px;
      color: #6B7280;
    }
    @media print {
      body { background: #fff; }
      .container { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- En-tête -->
    <div class="header">
      <div class="brand">
        <div>
          <div class="brand-text">IMOTION</div>
          <div class="tagline">Apple • Automatisation • IA</div>
        </div>
      </div>
      <div class="meta">
        <div><strong>Ref.</strong> AUD-${auditId.slice(0, 8)}</div>
        <div><strong>Date</strong> ${new Date().toLocaleDateString("fr-FR")}</div>
        <div><strong>Client</strong> ${dto.client_name ?? "—"}</div>
        <div><strong>Société</strong> ${dto.company_name ?? "—"}</div>
        <div><strong>Score</strong> <span style="color:#E11932;font-weight:700">${weightedScore.toFixed(1)}%</span></div>
      </div>
    </div>

    <h1>Rapport d'Audit & Plan d'Accompagnement</h1>

    <!-- Résumé exécutif -->
    <div class="executive-summary">
      <strong>🎯 Résumé Exécutif</strong>
      ${json.executive_summary ?? "En cours d'analyse..."}
    </div>

    <!-- Section 1 : Diagnostic -->
    <h2>1. Diagnostic Détaillé par Secteur</h2>
    ${(json.recap || []).map((s: any) => `
      <div class="kpi-card">
        <h3>${s.sector || "Secteur"}<span class="badge">Maturité ${s.maturity_pct ?? 0}%</span></h3>
        ${s.items && s.items.length > 0 ? `
          <ul>
            ${s.items.slice(0, 5).map((item: any) => `
              <li><strong>${item.question}</strong> — ${item.response} <em>(${item.score}/20)</em></li>
            `).join("")}
            ${s.items.length > 5 ? `<li><em>... et ${s.items.length - 5} autres réponses</em></li>` : ""}
          </ul>
        ` : ""}
        ${s.synthesis ? `
          <div class="synthesis">
            ${s.synthesis.strengths ? `
              <div class="synthesis-item">
                <span class="synthesis-label">✅ Forces :</span>
                <span>${s.synthesis.strengths}</span>
              </div>
            ` : ""}
            ${s.synthesis.weaknesses ? `
              <div class="synthesis-item">
                <span class="synthesis-label">⚠️ Faiblesses :</span>
                <span>${s.synthesis.weaknesses}</span>
              </div>
            ` : ""}
          </div>
        ` : ""}
      </div>
    `).join("")}

    <!-- Section 2 : Recommandations -->
    <h2>2. Axes d'Amélioration & Gains Attendus</h2>
    ${(json.improvements || []).map((i: any) => `
      <div class="kpi-card">
        <h3>${i.sector || "Secteur"}</h3>
        ${i.quick_wins && i.quick_wins.length > 0 ? `
          <div style="margin:12px 0">
            <strong>⚡ Quick Wins (≤ 4 semaines) :</strong>
            <ul>${i.quick_wins.map((w: string) => `<li>${w}</li>`).join("")}</ul>
          </div>
        ` : ""}
        ${i.projects && i.projects.length > 0 ? `
          <div style="margin:12px 0">
            <strong>🏗️ Chantiers structurants (2-6 mois) :</strong>
            <ul>${i.projects.map((p: string) => `<li>${p}</li>`).join("")}</ul>
          </div>
        ` : ""}
        ${i.risks && i.risks.length > 0 ? `
          <div style="margin:12px 0">
            <strong>⚠️ Risques identifiés :</strong>
            <ul>${i.risks.map((r: string) => `<li>${r}</li>`).join("")}</ul>
          </div>
        ` : ""}
        ${i.mitigations && i.mitigations.length > 0 ? `
          <div style="margin:12px 0">
            <strong>🛡️ Mesures correctives :</strong>
            <ul>${i.mitigations.map((m: string) => `<li>${m}</li>`).join("")}</ul>
          </div>
        ` : ""}
        ${i.estimated_gains ? `
          <div style="margin:12px 0">
            <strong>📈 Gains estimés (prudent) :</strong>
            <ul>
              ${i.estimated_gains.admin_time ? `<li>Temps admin : ${i.estimated_gains.admin_time.min}% → ${i.estimated_gains.admin_time.max}%</li>` : ""}
              ${i.estimated_gains.input_errors ? `<li>Erreurs de saisie : ${i.estimated_gains.input_errors.min}% → ${i.estimated_gains.input_errors.max}%</li>` : ""}
              ${i.estimated_gains.stockouts ? `<li>Ruptures de stock : ${i.estimated_gains.stockouts.min}% → ${i.estimated_gains.stockouts.max}%</li>` : ""}
              ${i.estimated_gains.dso ? `<li>DSO (encours clients) : ${i.estimated_gains.dso.min}% → ${i.estimated_gains.dso.max}%</li>` : ""}
              ${i.estimated_gains.traffic ? `<li>Trafic web : ${i.estimated_gains.traffic.min}% → ${i.estimated_gains.traffic.max}%</li>` : ""}
              ${i.estimated_gains.conversion ? `<li>Conversion : ${i.estimated_gains.conversion.min}% → ${i.estimated_gains.conversion.max}%</li>` : ""}
            </ul>
          </div>
        ` : ""}
      </div>
    `).join("")}

    <!-- Section 3 : Plan d'accompagnement -->
    <h2>3. Plan d'Accompagnement Détaillé</h2>
    ${json.roadmap && json.roadmap.phases ? json.roadmap.phases.map((p: any) => `
      <div class="phase-card">
        <div class="phase-title">${p.name || "Phase"} <span class="badge">${p.weeks || 0} semaines</span></div>
        ${p.objectives && p.objectives.length > 0 ? `
          <div style="margin:8px 0">
            <strong>🎯 Objectifs :</strong>
            <ul>${p.objectives.map((o: string) => `<li>${o}</li>`).join("")}</ul>
          </div>
        ` : ""}
        ${p.deliverables && p.deliverables.length > 0 ? `
          <div style="margin:8px 0">
            <strong>📦 Livrables :</strong>
            <ul>${p.deliverables.map((d: string) => `<li>${d}</li>`).join("")}</ul>
          </div>
        ` : ""}
        ${p.success_criteria && p.success_criteria.length > 0 ? `
          <div style="margin:8px 0">
            <strong>✅ Critères de succès :</strong>
            <ul>${p.success_criteria.map((s: string) => `<li>${s}</li>`).join("")}</ul>
          </div>
        ` : ""}
        ${p.risks && p.risks.length > 0 ? `
          <div style="margin:8px 0">
            <strong>⚠️ Risques :</strong>
            <ul>${p.risks.map((r: string) => `<li>${r}</li>`).join("")}</ul>
          </div>
        ` : ""}
        ${p.mitigations && p.mitigations.length > 0 ? `
          <div style="margin:8px 0">
            <strong>🛡️ Mitigations :</strong>
            <ul>${p.mitigations.map((m: string) => `<li>${m}</li>`).join("")}</ul>
          </div>
        ` : ""}
      </div>
    `).join("") : "<p>Plan détaillé à préciser en atelier de cadrage.</p>"}

    ${json.roadmap && json.roadmap.gantt && json.roadmap.gantt.length > 0 ? `
      <div class="kpi-card" style="margin-top:24px">
        <h3>📅 Planning Gantt (JSON)</h3>
        <pre style="background:#F8FAFC;padding:12px;border-radius:6px;overflow-x:auto;font-size:11px">${JSON.stringify(json.roadmap.gantt, null, 2)}</pre>
      </div>
    ` : ""}

    <!-- Section 4 : ROI Global -->
    <h2>4. ROI Global & Impact Business</h2>
    <div class="roi-box">
      <div style="font-size:14px;font-weight:600;color:#111">Gains Globaux Estimés (Prudence)</div>
      <div class="roi-number">
        ${json.roi_summary?.global_gain_pct?.min ?? 0}% → ${json.roi_summary?.global_gain_pct?.max ?? 0}%
      </div>
      <div style="font-size:14px;color:#4B5563;font-style:italic">
        ${json.roi_summary?.key_message ?? "Des gains mesurables, vite, sans casser l'existant."}
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      © ${new Date().getFullYear()} IMOTION • Intégrateur Apple & IA<br>
      Document confidentiel — Ne pas diffuser sans autorisation
    </div>
  </div>
</body>
</html>`;

    // Enregistrement en base
    await supabase
      .from("audits")
      .update({ 
        generated_report: html,
        report_generated_at: new Date().toISOString(),
        global_score: weightedScore
      })
      .eq("id", auditId);

    console.log("[generate-audit-report v3.0] Report saved successfully");

    return new Response(html, { 
      status: 200, 
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" } 
    });
    
  } catch (e: any) {
    console.error("[generate-audit-report v3.0] Error:", e);
    return new Response(JSON.stringify({ error: e.message || "Unexpected error" }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
