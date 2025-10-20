/**
 * IMOTION Test Runner - Exécuteur de tests avec rapport HTML
 */

export interface TestResult {
  name: string;
  file: string;
  status: 'success' | 'failure' | 'skipped';
  duration: number;
  error?: string;
  stack?: string;
}

export interface TestSuite {
  name: string;
  results: TestResult[];
  totalDuration: number;
}

export class TestRunner {
  private suites: TestSuite[] = [];
  private startTime: number = 0;
  
  start() {
    this.startTime = Date.now();
    console.log('🧪 Démarrage des tests IMOTION...\n');
  }
  
  addSuite(suite: TestSuite) {
    this.suites.push(suite);
  }
  
  generateSummary(): string {
    const totalTests = this.suites.reduce((acc, s) => acc + s.results.length, 0);
    const successTests = this.suites.reduce(
      (acc, s) => acc + s.results.filter(r => r.status === 'success').length, 
      0
    );
    const failedTests = totalTests - successTests;
    const totalDuration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    
    return `
✅ Tests réussis : ${successTests}/${totalTests}
❌ Échecs : ${failedTests}
⚙️ Temps total d'exécution : ${totalDuration}s
📁 Rapport détaillé : /tests/reports/last-test-report.html
    `.trim();
  }
  
  generateHTMLReport(): string {
    const totalTests = this.suites.reduce((acc, s) => acc + s.results.length, 0);
    const successTests = this.suites.reduce(
      (acc, s) => acc + s.results.filter(r => r.status === 'success').length, 
      0
    );
    const failedTests = totalTests - successTests;
    const successRate = ((successTests / totalTests) * 100).toFixed(1);
    
    const failedTestsHTML = this.suites.flatMap(s => 
      s.results.filter(r => r.status === 'failure')
    ).map(test => `
      <div class="test-failure">
        <strong>${test.name}</strong>
        <p>Fichier: ${test.file}</p>
        <p>Erreur: ${test.error || 'Erreur inconnue'}</p>
        ${test.stack ? `<pre>${test.stack}</pre>` : ''}
      </div>
    `).join('');
    
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport de Tests IMOTION</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      background: #f5f5f5;
      padding: 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h1 { color: #2563eb; margin-bottom: 10px; }
    .date { color: #666; margin-bottom: 30px; }
    .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
    .summary-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; }
    .summary-card.success { background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); }
    .summary-card.failure { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
    .summary-card h3 { font-size: 14px; opacity: 0.9; margin-bottom: 10px; }
    .summary-card .value { font-size: 36px; font-weight: bold; }
    .progress-bar { height: 30px; background: #e5e7eb; border-radius: 15px; overflow: hidden; margin-bottom: 40px; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #10b981, #059669); transition: width 0.3s; }
    .section { margin-bottom: 40px; }
    .section h2 { color: #1f2937; margin-bottom: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
    .test-failure { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin-bottom: 15px; border-radius: 4px; }
    .test-failure strong { color: #dc2626; display: block; margin-bottom: 5px; }
    .test-failure p { color: #666; margin-bottom: 5px; font-size: 14px; }
    .test-failure pre { background: #1f2937; color: #f9fafb; padding: 10px; border-radius: 4px; overflow-x: auto; margin-top: 10px; font-size: 12px; }
    .no-errors { text-align: center; padding: 40px; color: #10b981; font-size: 18px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Rapport de Tests IMOTION</h1>
    <p class="date">Généré le ${new Date().toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}</p>
    
    <div class="summary">
      <div class="summary-card">
        <h3>Total de tests</h3>
        <div class="value">${totalTests}</div>
      </div>
      <div class="summary-card success">
        <h3>Tests réussis</h3>
        <div class="value">${successTests}</div>
      </div>
      <div class="summary-card failure">
        <h3>Tests échoués</h3>
        <div class="value">${failedTests}</div>
      </div>
    </div>
    
    <div class="progress-bar">
      <div class="progress-fill" style="width: ${successRate}%"></div>
    </div>
    
    <div class="section">
      <h2>Résumé</h2>
      <p><strong>Taux de réussite:</strong> ${successRate}%</p>
      <p><strong>Temps d'exécution total:</strong> ${((Date.now() - this.startTime) / 1000).toFixed(2)}s</p>
    </div>
    
    ${failedTests > 0 ? `
    <div class="section">
      <h2>❌ Échecs (${failedTests})</h2>
      ${failedTestsHTML}
    </div>
    ` : `
    <div class="no-errors">
      ✅ Tous les tests ont réussi !
    </div>
    `}
  </div>
</body>
</html>
    `.trim();
  }
}
