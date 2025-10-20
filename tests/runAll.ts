/**
 * IMOTION - Exécuteur principal de tests
 */

import { TestRunner } from './utils/testRunner';
import { runWorkflowTests } from './integration/workflow.test';

async function main() {
  const runner = new TestRunner();
  runner.start();
  
  // Exécuter les tests d'intégration
  const workflowSuite = await runWorkflowTests();
  runner.addSuite(workflowSuite);
  
  // Afficher le résumé
  console.log('\n' + '='.repeat(50));
  console.log(runner.generateSummary());
  console.log('='.repeat(50) + '\n');
  
  // Générer le rapport HTML
  const htmlReport = runner.generateHTMLReport();
  console.log('📄 Rapport HTML généré');
  console.log('Pour le visualiser, copiez le contenu dans un fichier .html');
  
  // Retourner le HTML pour utilisation ultérieure
  return htmlReport;
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main as runAllTests };
