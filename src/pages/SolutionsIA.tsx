import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";

interface Solution {
  id: string;
  title: string;
  description: string;
  highlight: string;
  image_url: string;
  napkin_url: string;
}

export default function SolutionsIA() {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);

  const logEvent = async (solutionId: string, eventType: "view" | "click") => {
    try {
      await supabase.functions.invoke("log-ia-event", {
        body: { solution_id: solutionId, event_type: eventType },
      });
    } catch (error) {
      console.warn("Analytics event not logged:", error);
    }
  };

  useEffect(() => {
    const loadSolutions = async () => {
      try {
        const { data, error } = await supabase
          .from("ia_solutions")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        setSolutions(data || []);
        
        // Log view events for all solutions
        data?.forEach((sol) => logEvent(sol.id, "view"));
      } catch (error) {
        console.error("Error loading solutions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSolutions();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Solutions IA & Automatisation | IMOTION</title>
        <meta 
          name="description" 
          content="Découvrez comment l'IA peut transformer vos opérations — simplement, efficacement et sans rupture. Exemples concrets d'automatisation pour PME." 
        />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold">Solutions IA & Automatisation</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Découvrez comment l'intelligence artificielle peut transformer vos performances et stimuler votre croissance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
            {solutions.map((sol, i) => (
              <Card
                key={sol.id}
                className="overflow-hidden rounded-2xl shadow-sm hover:shadow-lg transition border-0 bg-card"
              >
                <img 
                  src={sol.image_url} 
                  alt={sol.title} 
                  className="h-56 w-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop';
                  }}
                />
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-2 text-foreground">{sol.title}</h2>
                  <p className="text-muted-foreground mb-4 leading-relaxed">{sol.description}</p>
                  <div className="text-sm bg-primary/10 border border-primary/20 text-primary inline-block px-3 py-1 rounded-full mb-4">
                    💡 {sol.highlight}
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-4">
                    <Button
                      variant="outline"
                      className="text-primary border-primary hover:bg-primary hover:text-primary-foreground transition flex-1"
                      onClick={() => {
                        logEvent(sol.id, "click");
                        window.open(sol.napkin_url, "_blank");
                      }}
                    >
                      Visualiser sur Napkin.ai
                    </Button>
                    <Button
                      className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1"
                      onClick={() => (window.location.href = "/contact")}
                    >
                      Demander un Audit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground text-lg mb-4">
              Ces solutions sont générées par notre agent IA IMOTION. Et si on en créait une pour votre entreprise ?
            </p>
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 rounded-xl shadow-lg"
              onClick={() => (window.location.href = "/audit")}
            >
              🚀 Lancer mon audit digital
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
