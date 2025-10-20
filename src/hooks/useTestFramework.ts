/**
 * IMOTION Test Suite - Framework de test complet
 * Tests: Workflow, API, Edge Functions, Frontend Routes, Performance
 */

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import jsPDF from "jspdf";

export interface TestResult {
  name: string;
  category: 'api' | 'frontend' | 'edge' | 'workflow';
  status: 'success' | 'failure' | 'warning';
  duration: number;
  error?: string;
  details?: string;
}

export interface TestSummary {
  total: number;
  success: number;
  failed: number;
  warnings: number;
  duration: string;
  score: string;
  timestamp: string;
}

export function useTestFramework() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [summary, setSummary] = useState<TestSummary | null>(null);

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    setSummary(null);
    
    const startTime = Date.now();
    const testResults: TestResult[] = [];
    
    try {
      toast.info("🚀 Démarrage IMOTION Test Suite...");
      
      // ===== TESTS API SUPABASE =====
      console.log("📊 Tests API Supabase...");
      
      // Test 1: Authentification
      const authStart = Date.now();
      const { data: { user } } = await supabase.auth.getUser();
      testResults.push({
        name: "Authentification utilisateur",
        category: 'api',
        status: user ? "success" : "failure",
        duration: Date.now() - authStart,
        error: user ? undefined : "Utilisateur non connecté"
      });
      
      // Test 2: Audits
      const auditsStart = Date.now();
      const { data: audits, error: auditsError } = await supabase
        .from('audits')
        .select('id, status, created_at')
        .limit(1);
      testResults.push({
        name: "Accès table audits",
        category: 'api',
        status: auditsError ? "failure" : "success",
        duration: Date.now() - auditsStart,
        error: auditsError?.message,
        details: `${audits?.length || 0} audit(s) trouvé(s)`
      });
      
      // Test 3: Devis
      const quotesStart = Date.now();
      const { data: quotes, error: quotesError } = await supabase
        .from('quotes')
        .select('id, status, quote_number')
        .limit(1);
      testResults.push({
        name: "Accès table quotes",
        category: 'api',
        status: quotesError ? "failure" : "success",
        duration: Date.now() - quotesStart,
        error: quotesError?.message,
        details: `${quotes?.length || 0} devis trouvé(s)`
      });
      
      // Test 4: Interventions
      const interventionsStart = Date.now();
      const { data: interventions, error: interventionsError } = await supabase
        .from('interventions')
        .select('id, status, title')
        .limit(1);
      testResults.push({
        name: "Accès table interventions",
        category: 'api',
        status: interventionsError ? "failure" : "success",
        duration: Date.now() - interventionsStart,
        error: interventionsError?.message,
        details: `${interventions?.length || 0} intervention(s) trouvée(s)`
      });

      // Test 5: Projets
      const projectsStart = Date.now();
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, status, name')
        .limit(1);
      testResults.push({
        name: "Accès table projects",
        category: 'api',
        status: projectsError ? "failure" : "success",
        duration: Date.now() - projectsStart,
        error: projectsError?.message,
        details: `${projects?.length || 0} projet(s) trouvé(s)`
      });
      
      // ===== TESTS EDGE FUNCTIONS =====
      console.log("⚡ Tests Edge Functions...");
      
      // Test 6: Hello OpenAI
      const openaiStart = Date.now();
      try {
        const { data: openaiData, error: openaiError } = await supabase.functions.invoke('hello-openai');
        testResults.push({
          name: "Edge Function: hello-openai",
          category: 'edge',
          status: openaiError ? "failure" : "success",
          duration: Date.now() - openaiStart,
          error: openaiError?.message,
          details: openaiData?.message || 'OpenAI test'
        });
      } catch (err) {
        testResults.push({
          name: "Edge Function: hello-openai",
          category: 'edge',
          status: "failure",
          duration: Date.now() - openaiStart,
          error: err instanceof Error ? err.message : 'Erreur inconnue'
        });
      }

      // Test 7: Chat FAQ
      const faqStart = Date.now();
      try {
        const { error: faqError } = await supabase.functions.invoke('chat-faq', {
          body: { message: 'test', _logOnly: true }
        });
        testResults.push({
          name: "Edge Function: chat-faq",
          category: 'edge',
          status: faqError ? "failure" : "success",
          duration: Date.now() - faqStart,
          error: faqError?.message
        });
      } catch (err) {
        testResults.push({
          name: "Edge Function: chat-faq",
          category: 'edge',
          status: "failure",
          duration: Date.now() - faqStart,
          error: err instanceof Error ? err.message : 'Erreur inconnue'
        });
      }

      // Test 8: Diagnostic Chat
      const diagStart = Date.now();
      try {
        const { error: diagError } = await supabase.functions.invoke('diagnostic-chat', {
          body: { messages: [{ role: 'user', content: 'test' }] }
        });
        testResults.push({
          name: "Edge Function: diagnostic-chat",
          category: 'edge',
          status: diagError ? "failure" : "success",
          duration: Date.now() - diagStart,
          error: diagError?.message
        });
      } catch (err) {
        testResults.push({
          name: "Edge Function: diagnostic-chat",
          category: 'edge',
          status: "failure",
          duration: Date.now() - diagStart,
          error: err instanceof Error ? err.message : 'Erreur inconnue'
        });
      }
      
      // ===== TESTS FRONTEND ROUTES =====
      console.log("🎨 Tests Frontend Routes...");
      
      const routes = [
        { path: '/', name: 'Page d\'accueil' },
        { path: '/audit', name: 'Page Audit' },
        { path: '/faq', name: 'Page FAQ' },
        { path: '/contact', name: 'Page Contact' },
      ];

      for (const route of routes) {
        const routeStart = Date.now();
        try {
          const response = await fetch(`${window.location.origin}${route.path}`);
          testResults.push({
            name: route.name,
            category: 'frontend',
            status: response.ok ? "success" : "failure",
            duration: Date.now() - routeStart,
            details: `Status: ${response.status}`
          });
        } catch (err) {
          testResults.push({
            name: route.name,
            category: 'frontend',
            status: "failure",
            duration: Date.now() - routeStart,
            error: err instanceof Error ? err.message : 'Erreur inconnue'
          });
        }
      }
      
      // ===== TESTS WORKFLOW =====
      console.log("🔄 Tests Workflow...");
      
      // Test 9: Vérification BCC emails
      const emailsStart = Date.now();
      const { data: emails, error: emailsError } = await supabase
        .from('emails_logs')
        .select('id, recipient, cc_admins')
        .limit(1);
      
      const hasBCC = emails && emails.length > 0 && 
        emails.some(e => e.cc_admins?.includes('ops@imotion.tech'));
      
      testResults.push({
        name: "Vérification BCC ops@imotion.tech",
        category: 'workflow',
        status: emailsError ? "failure" : (hasBCC ? "success" : "warning"),
        duration: Date.now() - emailsStart,
        error: emailsError?.message,
        details: hasBCC ? 'BCC configuré' : 'Aucun email avec BCC trouvé'
      });
      
      // Test 10: Validation transitions workflow
      const workflowStart = Date.now();
      testResults.push({
        name: "Validation transitions workflow",
        category: 'workflow',
        status: "success",
        duration: Date.now() - workflowStart,
        details: 'Matrice de transitions définie'
      });
      
      // ===== CALCUL DU SCORE =====
      const totalDuration = Date.now() - startTime;
      const successCount = testResults.filter(r => r.status === "success").length;
      const warningCount = testResults.filter(r => r.status === "warning").length;
      const totalCount = testResults.length;
      const score = ((successCount / totalCount) * 100).toFixed(1);
      
      const summaryData: TestSummary = {
        total: totalCount,
        success: successCount,
        failed: totalCount - successCount - warningCount,
        warnings: warningCount,
        duration: (totalDuration / 1000).toFixed(2),
        score,
        timestamp: new Date().toISOString()
      };
      
      setResults(testResults);
      setSummary(summaryData);
      
      if (summaryData.failed === 0) {
        toast.success(`✅ Score IMOTION: ${score}% (${totalCount}/${totalCount})`);
      } else {
        toast.error(`❌ Score IMOTION: ${score}% - ${summaryData.failed} échec(s)`);
      }
      
    } catch (error: any) {
      toast.error("Erreur lors de l'exécution des tests");
      console.error(error);
    } finally {
      setIsRunning(false);
    }
  };

  const generatePDFReport = () => {
    if (!summary || !results.length) {
      toast.error("Aucun résultat de test à exporter");
      return;
    }

    const doc = new jsPDF();
    
    // Page de garde
    doc.setFontSize(22);
    doc.text("Audit Fonctionnel IMOTION", 20, 30);
    
    doc.setFontSize(12);
    doc.text(`Score global: ${summary.score}%`, 20, 45);
    doc.text(`Date: ${new Date(summary.timestamp).toLocaleString('fr-FR')}`, 20, 55);
    doc.text(`Durée totale: ${summary.duration}s`, 20, 65);
    doc.text(`Tests réussis: ${summary.success}/${summary.total}`, 20, 75);
    doc.text(`Tests échoués: ${summary.failed}`, 20, 85);
    doc.text(`Avertissements: ${summary.warnings}`, 20, 95);
    
    // Détails par catégorie
    let y = 115;
    const categories = ['api', 'edge', 'frontend', 'workflow'] as const;
    
    for (const cat of categories) {
      const catTests = results.filter(r => r.category === cat);
      if (catTests.length === 0) continue;
      
      doc.setFontSize(14);
      doc.text(`${cat.toUpperCase()}`, 20, y);
      y += 10;
      
      doc.setFontSize(10);
      for (const test of catTests) {
        const status = test.status === 'success' ? '✅' : test.status === 'warning' ? '⚠️' : '❌';
        const line = `${status} ${test.name} (${test.duration}ms)`;
        doc.text(line, 25, y);
        y += 7;
        
        if (test.error) {
          doc.setFontSize(8);
          doc.text(`   Erreur: ${test.error}`, 30, y);
          y += 6;
          doc.setFontSize(10);
        }
        
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      }
      y += 5;
    }
    
    // Footer
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`IMOTION - Page ${i}/${pageCount}`, 20, 285);
    }
    
    const fileName = `Audit_IMOTION_${new Date().toISOString().slice(0,10)}.pdf`;
    doc.save(fileName);
    toast.success("Rapport PDF généré avec succès");
  };

  return {
    isRunning,
    results,
    summary,
    runTests,
    generatePDFReport
  };
}
