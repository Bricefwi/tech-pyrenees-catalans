// supabase/functions/generate-audit-report/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.3";
import OpenAI from "npm:openai@4.52.5";

// ---------- Types & Helpers
type Sector = {
  sector_id: string;
  sector_name: string;
  weighting: number;
  score: number;
  comments: string | null;
};

type AuditDTO = {
  audit_id: string;
  title: string | null;
  created_at: string;
  status: string;
  company_name: string | null;
  client_name: string | null;
  client_email: string | null;
  generated_report: string | null;
  sectors: Sector[];
  responses: Array<{
    sector_id: string;
    sector_name: string;
    question: string;
    response_value: string | number | null;
    score: number | null;
    comment: string | null;
  }>;
};

const BRAND = {
  name: "IMOTION",
  color: "#E11932",
  dark: "#111111",
  light: "#f7f7f8",
  gray: "#6B7280",
  logoUrl: "https://nmlkqyhkygdajqaffzny.supabase.co/storage/v1/object/public/imotion-docs/logo-imotion.png",
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ---------- HTTP handler
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const auditId = url.searchParams.get("audit_id");
    if (!auditId) {
      return new Response(
        JSON.stringify({ error: "Missing audit_id parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[generate-audit-report] Processing audit: ${auditId}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY")! });

    // 1) Load audit metadata
    const { data: auditMeta, error: e1 } = await supabase
      .from("audits")
      .select(`
        id, created_at, status, 
        company:audited_companies(name),
        created_by, generated_report
      `)
      .eq("id", auditId)
      .single();

    if (e1 || !auditMeta) {
      console.error("[generate-audit-report] Audit not found:", e1?.message);
      return new Response(
        JSON.stringify({ error: "Audit not found", details: e1?.message }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get client info
    let clientName = "Client";
    let clientEmail = "";
    if (auditMeta.created_by) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("user_id", auditMeta.created_by)
        .single();
      if (profile) {
        clientName = profile.full_name || clientName;
        clientEmail = profile.email || "";
      }
    }

    // 2) Load sectors
    const { data: sectorsRaw, error: e2 } = await supabase
      .from("audit_sectors")
      .select("id, name, weighting")
      .order("order_index", { ascending: true });
    if (e2) {
      console.error("[generate-audit-report] Error loading sectors:", e2.message);
      throw e2;
    }

    // 3) Load responses
    const { data: respRaw, error: e3 } = await supabase
      .from("audit_responses")
      .select(`
        question_id,
        response_value,
        score,
        audit_questions!inner(
          id, question_text, sector_id, subdomain
        )
      `)
      .eq("audit_id", auditId);
    if (e3) {
      console.error("[generate-audit-report] Error loading responses:", e3.message);
      throw e3;
    }

    // 4) Load sector comments
    const { data: commentsRaw } = await supabase
      .from("sector_comments")
      .select("sector_id, comment")
      .eq("audit_id", auditId);

    // 5) Aggregate sectors with scores
    const sectors: Sector[] = (sectorsRaw ?? []).map((s) => {
      const scores = (respRaw ?? [])
        .filter((r: any) => r.audit_questions?.sector_id === s.id && r.score != null)
        .map((r: any) => Number(r.score));
      const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      const comment = (commentsRaw ?? []).find((c) => c.sector_id === s.id)?.comment ?? null;
      return {
        sector_id: s.id,
        sector_name: s.name,
        weighting: Number(s.weighting ?? 0),
        score: Number(avg.toFixed(2)),
        comments: comment,
      };
    });

    const responses = (respRaw ?? []).map((r: any) => ({
      sector_id: r.audit_questions?.sector_id!,
      sector_name: sectors.find((s) => s.sector_id === r.audit_questions?.sector_id)?.sector_name ?? "",
      question: r.audit_questions?.question_text ?? "",
      response_value: r.response_value,
      score: r.score,
      comment: null as string | null,
    }));

    // 6) Build DTO
    const dto: AuditDTO = {
      audit_id: auditMeta.id,
      title: "Audit de maturité numérique",
      created_at: auditMeta.created_at,
      status: auditMeta.status,
      company_name: (auditMeta.company as any)?.name ?? null,
      client_name: clientName,
      client_email: clientEmail,
      generated_report: auditMeta.generated_report,
      sectors,
      responses,
    };

    // 7) If report already exists and force is not set, return it
    if (dto.generated_report && url.searchParams.get("force") !== "1") {
      console.log("[generate-audit-report] Returning cached report");
      return new Response(dto.generated_report, {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // 8) Calculate weighted score and sector priorities
    const sectorBlocks = dto.sectors
      .map((s) => {
        const maturityPct = Math.round((s.score / 20) * 100);
        return {
          ...s,
          maturity_pct: maturityPct,
          deficit_weighted: Number(((20 - s.score) * (s.weighting / 100)).toFixed(2)),
        };
      })
      .sort((a, b) => b.deficit_weighted - a.deficit_weighted);

    const weightedScore = sectorBlocks.reduce((acc, s) => acc + (s.score / 20) * s.weighting, 0);

    console.log("[generate-audit-report] Calculated weighted score:", weightedScore.toFixed(1));

    // 9) Generate AI report with structured JSON output
    const prompt = `
Tu es un consultant senior IMOTION spécialisé en transformation numérique (Apple & IA). 
Analyse cet audit numérique et fournis un rapport structuré en JSON.

DONNÉES:
- Client: ${dto.client_name} / ${dto.company_name ?? "—"} / Email: ${dto.client_email}
- Score global pondéré: ${weightedScore.toFixed(1)}%
- Secteurs (ordre priorité = manque pondéré décroissant): 
${sectorBlocks.map((s) => `  - ${s.sector_name} (poids ${s.weighting}%, score ${s.score}/20, maturité ${s.maturity_pct}%)`).join("\n")}
- Réponses détaillées: ${JSON.stringify(dto.responses.slice(0, 50))}

INSTRUCTIONS:
1) **Rappel exhaustif** : Liste par secteur -> question -> réponse + score
2) **Analyse critique** : Pour chaque secteur, synthèse des faiblesses, risques, recommandations
   - Quick wins (≤4 semaines)
   - Chantiers (2-6 mois)
   - Gains estimés (prudents, bornés min-max) : temps admin, erreurs, ruptures stock, DSO, trafic, conversion
3) **Plan d'accompagnement** : 4 phases avec jalons, livrables, critères succès, risques, mitigations, Gantt JSON

FORMAT JSON STRICT:
{
  "recap": [
    { "sector": "nom", "weighting": 0-100, "maturity_pct": 0-100,
      "items": [{"question": "...", "response": "...", "score": 0-20}]
    }
  ],
  "improvements": [
    { "sector": "nom", 
      "quick_wins": ["..."], 
      "projects": ["..."], 
      "estimated_gains": {
        "admin_time": {"min": 0, "max": 0}, 
        "input_errors": {"min":0,"max":0},
        "stockouts": {"min":0,"max":0}, 
        "dso": {"min":0,"max":0},
        "traffic": {"min":0,"max":0}, 
        "conversion": {"min":0,"max":0}
      }
    }
  ],
  "roadmap": {
    "phases": [
      { "name": "Phase 1 – ...", "weeks": 0, "deliverables": ["..."], 
        "success_criteria": ["..."], "risks": ["..."], "mitigations": ["..."] }
    ],
    "gantt": [
      { "id": "T1", "name": "Cadrage", "start": "2025-11-04", "end": "2025-11-29", "progress": 0 },
      { "id": "T2", "name": "Quick wins", "start": "2025-12-02", "end": "2025-12-27", "progress": 0, "dependencies": "T1" }
    ],
    "effort_table": [
      { "workstream": "Automatisation", "effort_weeks": 4 }
    ]
  }
}
`;

    console.log("[generate-audit-report] Calling OpenAI for analysis...");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Tu es un consultant IMOTION, style concis, opérationnel, orienté ROI.",
        },
        { role: "user", content: prompt },
      ],
    });

    const json = JSON.parse(completion.choices[0].message.content ?? "{}");
    console.log("[generate-audit-report] AI analysis completed");

    // 10) Transform to branded HTML
    const html = renderReportHTML({
      brand: BRAND,
      meta: {
        reference: `AUD-${dto.audit_id.slice(0, 8)}`,
        date: new Date().toLocaleDateString("fr-FR"),
        client: dto.client_name || "Client",
        company: dto.company_name || "—",
        email: dto.client_email || "—",
        weightedScore: `${weightedScore.toFixed(1)}%`,
        tagline: "Accélérer sans casser : des gains mesurables, vite.",
      },
      recap: json.recap ?? [],
      improvements: json.improvements ?? [],
      roadmap: json.roadmap ?? { phases: [], gantt: [], effort_table: [] },
    });

    // 11) Save to database
    const { error: updateError } = await supabase
      .from("audits")
      .update({ 
        generated_report: html,
        global_score: weightedScore 
      })
      .eq("id", auditId);

    if (updateError) {
      console.error("[generate-audit-report] Error saving report:", updateError.message);
    } else {
      console.log("[generate-audit-report] Report saved successfully");
    }

    return new Response(html, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (e: any) {
    console.error("[generate-audit-report] Error:", e.message, e.stack);
    return new Response(
      JSON.stringify({ error: e?.message || "Unexpected error", stack: e?.stack }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ---------- HTML Renderer
function renderReportHTML({
  brand,
  meta,
  recap,
  improvements,
  roadmap,
}: {
  brand: typeof BRAND;
  meta: {
    reference: string;
    date: string;
    client: string;
    company: string;
    email: string;
    weightedScore: string;
    tagline: string;
  };
  recap: any[];
  improvements: any[];
  roadmap: { phases: any[]; gantt: any[]; effort_table: any[] };
}) {
  const css = `
    body { font-family: Inter, ui-sans-serif, system-ui, -apple-system; color:${brand.dark}; background:#fff; margin:0; padding:0; }
    .wrap { max-width: 860px; margin: 24px auto; padding: 16px 24px 48px; }
    .header { display:flex; align-items:flex-start; justify-content:space-between; border-bottom:2px solid ${brand.color}; padding-bottom:16px; margin-bottom:24px; }
    .brand { display:flex; gap:12px; align-items:center; }
    .brand img { height:50px; }
    .brand-text { font-size:24px; font-weight:700; color:${brand.color}; }
    .brand-subtitle { font-size:12px; color:${brand.gray}; margin-top:2px; }
    .meta { text-align:right; font-size:12px; color:${brand.gray}; line-height:1.6; }
    .meta div { margin-bottom:4px; }
    .meta b { color:${brand.dark}; font-weight:600; }
    h1 { font-size:28px; margin:24px 0 8px; color:${brand.dark}; }
    .tagline { color:${brand.gray}; margin-bottom:20px; font-size:15px; }
    .badge { display:inline-block; background:${brand.light}; border:1px solid #e5e7eb; padding:4px 10px; border-radius:6px; font-size:12px; margin:2px; }
    .kpi { background:#F8FAFC; border:1px solid #E5E7EB; border-left:4px solid ${brand.color}; padding:16px; margin:16px 0; border-radius:10px; }
    .kpi b { color:${brand.dark}; }
    .section { margin-top:32px; }
    .section h2 { font-size:22px; margin:0 0 12px; padding-top:12px; border-top:3px solid ${brand.color}; color:${brand.dark}; }
    .table { width:100%; border-collapse:collapse; font-size:13px; margin:12px 0; }
    .table th, .table td { border:1px solid #e5e7eb; padding:10px; text-align:left; }
    .table th { background:#F8FAFC; font-weight:600; color:${brand.dark}; }
    .table tbody tr:hover { background:#fafafa; }
    .table ul { margin:4px 0; padding-left:20px; }
    .table li { margin:4px 0; }
    .flex-container { display:flex; gap:24px; margin-top:12px; flex-wrap:wrap; }
    .flex-item { flex:1; min-width:200px; }
    .flex-item-title { font-weight:600; margin-bottom:6px; color:${brand.dark}; font-size:14px; }
    .flex-item ul { margin:4px 0; padding-left:20px; font-size:13px; }
    .flex-item li { margin:6px 0; line-height:1.5; }
    .gantt-json { background:#f1f5f9; border:1px solid #cbd5e1; padding:12px; border-radius:8px; margin:12px 0; }
    .gantt-json pre { margin:0; white-space:pre-wrap; word-wrap:break-word; font-size:12px; font-family:monospace; }
    .foot { margin-top:48px; padding-top:24px; border-top:1px solid #e5e7eb; font-size:12px; color:${brand.gray}; text-align:center; }
    @media print {
      .wrap { margin:0; padding:20px; }
      .kpi { page-break-inside:avoid; }
    }
  `;

  const recapTable = `
    <table class="table">
      <thead><tr><th>Secteur</th><th>Pondération</th><th>Maturité</th><th>Détails (échantillon)</th></tr></thead>
      <tbody>
        ${recap
          .map(
            (r: any) => `
          <tr>
            <td><b>${escapeHtml(r.sector)}</b></td>
            <td>${r.weighting}%</td>
            <td><span class="badge">${r.maturity_pct}%</span></td>
            <td>
              <ul style="margin:0;padding-left:18px">
                ${r.items
                  .slice(0, 5)
                  .map(
                    (i: any) =>
                      `<li><b>${escapeHtml(i.question)}</b> — ${escapeHtml(String(i.response ?? "—"))} <span class="badge">${i.score}/20</span></li>`
                  )
                  .join("")}
                ${r.items.length > 5 ? `<li>… ${r.items.length - 5} autres questions</li>` : ""}
              </ul>
            </td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;

  const improvBlocks = improvements
    .map(
      (i: any) => `
    <div class="kpi">
      <b style="font-size:16px">${escapeHtml(i.sector)}</b>
      <div class="flex-container">
        <div class="flex-item">
          <div class="flex-item-title">🚀 Quick wins (≤4 semaines)</div>
          <ul>${(i.quick_wins || []).map((q: string) => `<li>${escapeHtml(q)}</li>`).join("")}</ul>
        </div>
        <div class="flex-item">
          <div class="flex-item-title">🏗️ Chantiers (2–6 mois)</div>
          <ul>${(i.projects || []).map((q: string) => `<li>${escapeHtml(q)}</li>`).join("")}</ul>
        </div>
        <div class="flex-item">
          <div class="flex-item-title">📈 Gains attendus (prudence)</div>
          <ul>
            ${gainLine("Temps admin", i.estimated_gains?.admin_time)}
            ${gainLine("Erreurs de saisie", i.estimated_gains?.input_errors)}
            ${gainLine("Ruptures de stock", i.estimated_gains?.stockouts)}
            ${gainLine("DSO (encours clients)", i.estimated_gains?.dso)}
            ${gainLine("Trafic", i.estimated_gains?.traffic)}
            ${gainLine("Conversion", i.estimated_gains?.conversion)}
          </ul>
        </div>
      </div>
    </div>
  `
    )
    .join("");

  const phases = (roadmap.phases || [])
    .map(
      (p: any) => `
    <div class="kpi">
      <b style="font-size:16px">${escapeHtml(p.name)}</b> — ${p.weeks ?? "?"} semaines
      <div class="flex-container">
        <div class="flex-item">
          <div class="flex-item-title">📦 Livrables</div>
          <ul>${(p.deliverables || []).map((d: string) => `<li>${escapeHtml(d)}</li>`).join("")}</ul>
        </div>
        <div class="flex-item">
          <div class="flex-item-title">✅ Critères de succès</div>
          <ul>${(p.success_criteria || []).map((d: string) => `<li>${escapeHtml(d)}</li>`).join("")}</ul>
        </div>
        ${
          p.risks?.length
            ? `<div class="flex-item">
          <div class="flex-item-title">⚠️ Risques</div>
          <ul>${p.risks.map((r: string) => `<li>${escapeHtml(r)}</li>`).join("")}</ul>
        </div>`
            : ""
        }
        ${
          p.mitigations?.length
            ? `<div class="flex-item">
          <div class="flex-item-title">🛡️ Mitigations</div>
          <ul>${p.mitigations.map((r: string) => `<li>${escapeHtml(r)}</li>`).join("")}</ul>
        </div>`
            : ""
        }
      </div>
    </div>
  `
    )
    .join("");

  const ganttJson = JSON.stringify(roadmap.gantt ?? [], null, 2);
  const effortTable =
    roadmap.effort_table && roadmap.effort_table.length > 0
      ? `
    <table class="table" style="max-width:500px">
      <thead><tr><th>Chantier</th><th>Effort (semaines)</th></tr></thead>
      <tbody>
        ${roadmap.effort_table.map((e: any) => `<tr><td>${escapeHtml(e.workstream)}</td><td>${e.effort_weeks}</td></tr>`).join("")}
      </tbody>
    </table>
  `
      : "";

  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Rapport d'audit – ${escapeHtml(meta.client)}</title>
<style>${css}</style></head>
<body>
  <div class="wrap">
    <div class="header">
      <div class="brand">
        <img src="${brand.logoUrl}" alt="${brand.name}" onerror="this.style.display='none'">
        <div>
          <div class="brand-text">${brand.name}</div>
          <div class="brand-subtitle">Apple • Automatisation • IA</div>
        </div>
      </div>
      <div class="meta">
        <div><b>Référence</b> ${escapeHtml(meta.reference)}</div>
        <div><b>Date</b> ${escapeHtml(meta.date)}</div>
        <div><b>Client</b> ${escapeHtml(meta.client)}</div>
        <div><b>Société</b> ${escapeHtml(meta.company)}</div>
        <div><b>Email</b> ${escapeHtml(meta.email)}</div>
      </div>
    </div>

    <h1>Rapport d'audit & Plan d'accompagnement</h1>
    <div class="tagline">${escapeHtml(meta.tagline)}</div>
    <div class="kpi"><b>Score global pondéré :</b> ${escapeHtml(meta.weightedScore)}</div>

    <div class="section">
      <h2>1. Rappel détaillé des réponses (par secteur)</h2>
      ${recapTable}
    </div>

    <div class="section">
      <h2>2. Axes d'amélioration priorisés et gains attendus</h2>
      ${improvBlocks || '<div class="kpi">Aucune amélioration identifiée.</div>'}
    </div>

    <div class="section">
      <h2>3. Projet d'accompagnement (phases, jalons, Gantt)</h2>
      ${phases || '<div class="kpi">Phases à préciser en atelier de cadrage.</div>'}
      
      ${effortTable}
      
      <div class="kpi">
        <b>Gantt JSON (intégration ProjectGantt)</b>
        <div class="gantt-json"><pre>${escapeHtml(ganttJson)}</pre></div>
      </div>
    </div>

    <div class="foot">© ${new Date().getFullYear()} ${brand.name}. Document confidentiel — Ne pas diffuser.</div>
  </div>
</body></html>`;
}

function gainLine(label: string, v?: { min: number; max: number }) {
  if (!v || (v.min === 0 && v.max === 0)) return "";
  return `<li>${label} : <b>${v.min}% → ${v.max}%</b></li>`;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]!));
}
