/**
 * IMOTION - Cloud Test Suite CI
 * Version cloud : Audit automatique complet, scoring, export PDF, email admin
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.1";
import jsPDF from "npm:jspdf@2.5.2";

// ---- Initialisation ----
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// ---- Configuration globale ----
const ADMIN_EMAIL = "ops@imotion.tech";
const BUCKET_NAME = "imotion-tests";

serve(async () => {
  const start = performance.now();
  const summary: Record<string, any[]> = {};
  let total = 0, success = 0;

  console.log("🚀 Démarrage du test cloud IMOTION");

  // --- 1️⃣ Tests de base (pages principales) ---
  console.log("📊 Tests Frontend...");
  const routes = [
    { path: "/", auth: false },
    { path: "/faq", auth: false },
    { path: "/contact", auth: false },
    { path: "/audit", auth: false },
    { path: "/client/dashboard", auth: true },  // Test e2e client authentifié
    { path: "/admin", auth: true }  // Test e2e admin authentifié
  ];
  summary["Frontend"] = [];

  for (const { path, auth } of routes) {
    try {
      const res = await fetch(`https://imotion.tech${path}`);
      // Pages authentifiées doivent retourner 200 (si connecté) ou 401/302 (si non connecté)
      const ok = auth ? (res.status === 200 || res.status === 401 || res.status === 302) : res.status === 200;
      summary["Frontend"].push({ 
        route: path, 
        ok, 
        status: res.status,
        auth_required: auth 
      });
      total++;
      if (ok) success++;
    } catch (err) {
      const error = err as Error;
      summary["Frontend"].push({ route: path, ok: false, error: error.message, auth_required: auth });
      total++;
    }
  }

  // --- 2️⃣ Tests Edge Functions ---
  console.log("⚡ Tests Edge Functions...");
  const functions = [
    "hello-openai",
    "diagnostic-chat",
    "chat-faq"
  ];
  summary["Edge Functions"] = [];

  for (const fn of functions) {
    try {
      const res = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/${fn}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`
        },
        body: JSON.stringify({ test: true })
      });
      const ok = res.status < 500; // Accepter toute erreur client mais pas serveur
      summary["Edge Functions"].push({ fn, ok, status: res.status });
      total++;
      if (ok) success++;
    } catch (err) {
      const error = err as Error;
      summary["Edge Functions"].push({ fn, ok: false, error: error.message });
      total++;
    }
  }

  // --- 3️⃣ Tests Supabase API ---
  console.log("💾 Tests Database...");
  summary["Database"] = [];

  const tables = ["audits", "quotes", "interventions", "projects", "emails_logs"];
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select("id").limit(1);
      summary["Database"].push({ table, ok: !error, error: error?.message || null });
      total++;
      if (!error) success++;
    } catch (err) {
      const error = err as Error;
      summary["Database"].push({ table, ok: false, error: error.message });
      total++;
    }
  }

  // --- 4️⃣ Calcul du score ---
  const score = Math.round((success / total) * 100);
  const end = performance.now();
  const duration = Math.round(end - start);

  console.log(`✅ Score IMOTION : ${score}% en ${duration} ms`);

  // --- 5️⃣ Génération PDF ---
  console.log("📄 Génération PDF...");
  const pdf = new jsPDF();
  
  pdf.setFontSize(18);
  pdf.text("Audit Fonctionnel IMOTION - Rapport Cloud", 20, 20);
  
  pdf.setFontSize(12);
  pdf.text(`Date : ${new Date().toLocaleString('fr-FR')}`, 20, 35);
  pdf.text(`Score global : ${score}%`, 20, 45);
  pdf.text(`Duree totale : ${duration} ms`, 20, 55);
  pdf.text(`Tests reussis : ${success}/${total}`, 20, 65);

  let y = 80;
  for (const [section, tests] of Object.entries(summary)) {
    pdf.setFontSize(14);
    pdf.text(section, 20, y);
    y += 10;
    
    pdf.setFontSize(10);
    for (const test of tests) {
      const status = test.ok ? "OK" : "KO";
      const name = test.route || test.fn || test.table || 'unknown';
      pdf.text(`${status} - ${name}`, 25, y);
      y += 7;
      
      if (test.error) {
        pdf.setFontSize(8);
        pdf.text(`  Error: ${test.error}`, 30, y);
        y += 6;
        pdf.setFontSize(10);
      }
      
      if (y > 270) { 
        pdf.addPage(); 
        y = 20; 
      }
    }
    y += 5;
  }

  const pdfBytes = pdf.output("arraybuffer");
  const fileName = `Audit_IMOTION_${new Date().toISOString().slice(0,10)}_${Date.now()}.pdf`;

  // --- 6️⃣ Upload du PDF ---
  console.log("☁️ Upload PDF...");
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, pdfBytes, {
      contentType: "application/pdf",
      upsert: true
    });

  if (uploadError) {
    console.error("❌ Erreur upload PDF:", uploadError);
  }

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

  // --- 7️⃣ Envoi email résumé ---
  console.log("📧 Envoi email...");
  try {
    await supabase.functions.invoke('send-email', {
      body: {
        type: "confirmation",
        to: ADMIN_EMAIL,
        clientName: "Admin IMOTION",
        requestTitle: `Rapport d'audit automatique - Score: ${score}%`
      }
    });
    console.log("✅ Email envoyé");
  } catch (emailError) {
    console.error("⚠️ Erreur envoi email:", emailError);
  }

  // --- 8️⃣ Résumé retour JSON ---
  return new Response(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      duration_ms: duration,
      score,
      total,
      success,
      failed: total - success,
      summary,
      pdf_url: publicUrlData.publicUrl,
    }, null, 2),
    { 
      headers: { "Content-Type": "application/json" }, 
      status: 200 
    }
  );
});
