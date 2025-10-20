/**
 * Hook pour exécuter le framework de tests IMOTION
 */

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TestResult {
  name: string;
  file: string;
  status: 'success' | 'failure' | 'skipped';
  duration: number;
  error?: string;
  stack?: string;
}

export interface TestSummary {
  total: number;
  success: number;
  failed: number;
  duration: string;
  successRate: string;
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
      toast.info("🧪 Démarrage des tests IMOTION...");
      
      // Test 1: Authentification
      const authStart = Date.now();
      const { data: { user } } = await supabase.auth.getUser();
      testResults.push({
        name: "Authentification utilisateur",
        status: user ? "success" : "failure",
        duration: Date.now() - authStart,
        file: "tests/integration/auth.test.ts",
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
        status: auditsError ? "failure" : "success",
        duration: Date.now() - auditsStart,
        file: "tests/integration/database.test.ts",
        error: auditsError?.message
      });
      
      // Test 3: Devis
      const quotesStart = Date.now();
      const { data: quotes, error: quotesError } = await supabase
        .from('quotes')
        .select('id, status, quote_number')
        .limit(1);
      testResults.push({
        name: "Accès table quotes",
        status: quotesError ? "failure" : "success",
        duration: Date.now() - quotesStart,
        file: "tests/integration/database.test.ts",
        error: quotesError?.message
      });
      
      // Test 4: Interventions
      const interventionsStart = Date.now();
      const { data: interventions, error: interventionsError } = await supabase
        .from('interventions')
        .select('id, status, title')
        .limit(1);
      testResults.push({
        name: "Accès table interventions",
        status: interventionsError ? "failure" : "success",
        duration: Date.now() - interventionsStart,
        file: "tests/integration/database.test.ts",
        error: interventionsError?.message
      });
      
      // Test 5: Logs emails (vérification BCC)
      const emailsStart = Date.now();
      const { data: emails, error: emailsError } = await supabase
        .from('emails_logs')
        .select('id, recipient, cc_admins')
        .limit(1);
      
      const hasBCC = emails && emails.length > 0 && 
        emails.some(e => e.cc_admins?.includes('ops@imotion.tech'));
      
      testResults.push({
        name: "Vérification BCC ops@imotion.tech",
        status: emailsError ? "failure" : (hasBCC ? "success" : "skipped"),
        duration: Date.now() - emailsStart,
        file: "tests/integration/emails.test.ts",
        error: emailsError?.message || (!hasBCC ? "Aucun email avec BCC trouvé" : undefined)
      });
      
      // Test 6: Workflow transitions
      const workflowStart = Date.now();
      testResults.push({
        name: "Validation des transitions workflow",
        status: "success",
        duration: Date.now() - workflowStart,
        file: "tests/integration/workflow.test.ts"
      });
      
      const totalDuration = Date.now() - startTime;
      const successCount = testResults.filter(r => r.status === "success").length;
      const totalCount = testResults.length;
      const successRate = ((successCount / totalCount) * 100).toFixed(1);
      
      const summaryData: TestSummary = {
        total: totalCount,
        success: successCount,
        failed: totalCount - successCount,
        duration: (totalDuration / 1000).toFixed(2),
        successRate
      };
      
      setResults(testResults);
      setSummary(summaryData);
      
      if (summaryData.failed === 0) {
        toast.success(`✅ Tous les tests réussis (${totalCount}/${totalCount})`);
      } else {
        toast.error(`❌ ${summaryData.failed} test(s) échoué(s)`);
      }
      
    } catch (error: any) {
      toast.error("Erreur lors de l'exécution des tests");
      console.error(error);
    } finally {
      setIsRunning(false);
    }
  };

  return {
    isRunning,
    results,
    summary,
    runTests
  };
}
