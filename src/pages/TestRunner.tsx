/**
 * IMOTION Test Suite - Interface de test complète
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTestFramework } from "@/hooks/useTestFramework";
import { CheckCircle2, XCircle, AlertCircle, Download, Play, Loader2 } from "lucide-react";

const TestRunner = () => {
  const { isRunning, results, summary, runTests, generatePDFReport } = useTestFramework();

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'api': return 'bg-blue-500';
      case 'edge': return 'bg-purple-500';
      case 'frontend': return 'bg-green-500';
      case 'workflow': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'failure': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">IMOTION Test Suite</h1>
        <p className="text-muted-foreground">
          Framework de test complet pour vérifier le workflow, les API, les Edge Functions et le frontend
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mb-6">
        <Button 
          onClick={runTests} 
          disabled={isRunning}
          size="lg"
          className="gap-2"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Tests en cours...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Lancer les tests
            </>
          )}
        </Button>

        {summary && (
          <Button 
            onClick={generatePDFReport}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <Download className="w-5 h-5" />
            Télécharger le rapport PDF
          </Button>
        )}
      </div>

      {/* Résumé */}
      {summary && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Résumé de l'audit</CardTitle>
            <CardDescription>
              Exécuté le {new Date(summary.timestamp).toLocaleString('fr-FR')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(parseFloat(summary.score))}`}>
                  {summary.score}%
                </div>
                <div className="text-sm text-muted-foreground">Score global</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{summary.success}</div>
                <div className="text-sm text-muted-foreground">Réussis</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{summary.failed}</div>
                <div className="text-sm text-muted-foreground">Échoués</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{summary.warnings}</div>
                <div className="text-sm text-muted-foreground">Avertissements</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{summary.duration}s</div>
                <div className="text-sm text-muted-foreground">Durée</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résultats détaillés */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Résultats détaillés</h2>
          
          {['api', 'edge', 'frontend', 'workflow'].map((category) => {
            const categoryTests = results.filter((r: any) => r.category === category);
            if (categoryTests.length === 0) return null;

            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getCategoryColor(category)}`} />
                    {category.toUpperCase()}
                    <Badge variant="outline">
                      {categoryTests.filter((t: any) => t.status === 'success').length}/{categoryTests.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryTests.map((test: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border">
                        {getStatusIcon(test.status)}
                        <div className="flex-1">
                          <div className="font-medium">{test.name}</div>
                          {test.details && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {test.details}
                            </div>
                          )}
                          {test.error && (
                            <div className="text-sm text-red-600 mt-1">
                              Erreur: {test.error}
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {test.duration}ms
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!isRunning && results.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Aucun test n'a encore été exécuté
            </p>
            <Button onClick={runTests} size="lg" className="gap-2">
              <Play className="w-5 h-5" />
              Lancer les tests
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TestRunner;
