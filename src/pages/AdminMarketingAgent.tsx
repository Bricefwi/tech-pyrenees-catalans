import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminMarketingAgent() {
  const [themes, setThemes] = useState<Array<{ title: string; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadThemes();
  }, []);

  const loadThemes = async () => {
    try {
      const { data, error } = await supabase
        .from("ia_solutions")
        .select("title, created_at")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setThemes(data || []);
    } catch (error) {
      console.error("Erreur chargement thèmes:", error);
      toast.error("Erreur lors du chargement des thèmes");
    } finally {
      setLoading(false);
    }
  };

  const regenerate = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("auto-marketing-agent", {
        body: {},
      });

      if (error) throw error;

      toast.success("Nouvelle génération lancée avec succès !");
      
      // Recharger les thèmes après quelques secondes
      setTimeout(() => {
        loadThemes();
      }, 3000);
    } catch (error) {
      console.error("Erreur génération:", error);
      toast.error("Erreur lors de la génération automatique");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Agent Marketing IMOTION</h1>
          </div>
          <p className="text-muted-foreground">
            Cet agent génère automatiquement des articles et visuels IA pour la page "Solutions IA" toutes les deux semaines.
          </p>
        </div>

        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Actions de l'agent</span>
              <RefreshCw className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Déclenchez manuellement une nouvelle génération de 4 articles IA. Les anciens articles de plus de 60 jours seront archivés.
            </p>
            <Button
              onClick={regenerate}
              disabled={generating}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Forcer une génération manuelle
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Derniers thèmes générés</CardTitle>
          </CardHeader>
          <CardContent>
            {themes.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Aucun thème généré pour le moment.
              </p>
            ) : (
              <ul className="space-y-3">
                {themes.map((theme, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition">
                    <span className="text-primary font-semibold mt-0.5">#{i + 1}</span>
                    <div className="flex-1">
                      <p className="font-medium">{theme.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(theme.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Automatisation planifiée
          </h3>
          <p className="text-sm text-muted-foreground">
            L'agent s'exécute automatiquement tous les 1er et 15 du mois pour maintenir le contenu frais et pertinent.
            Vous recevrez une notification par email à chaque génération.
          </p>
        </div>
      </div>
    </div>
  );
}
