import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";

interface KeyPoint {
  icon: string;
  text: string;
}

interface Solution {
  id: string;
  title: string;
  description: string;
  highlight: string;
  image_url: string;
  full_content: string;
  key_points: KeyPoint[];
  cta_text: string;
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

        // Parse key_points from JSON to array
        const parsedData = data?.map(sol => ({
          ...sol,
          key_points: (sol.key_points && Array.isArray(sol.key_points) 
            ? sol.key_points as unknown as KeyPoint[]
            : [] as KeyPoint[])
        })) as Solution[] || [];

        setSolutions(parsedData);
        
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

          <div className="space-y-16 mb-12">
            {solutions.map((sol, i) => (
              <Card
                key={sol.id}
                className="overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all border-0 bg-card"
              >
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="relative h-64 md:h-auto">
                    <img 
                      src={sol.image_url} 
                      alt={sol.title} 
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop';
                      }}
                    />
                  </div>
                  <CardContent className="p-8 flex flex-col justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-3 text-foreground">{sol.title}</h2>
                      <div className="text-sm bg-primary/10 border border-primary/20 text-primary inline-block px-3 py-2 rounded-full mb-4 font-medium">
                        💡 {sol.highlight}
                      </div>
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        {sol.full_content || sol.description}
                      </p>
                      
                      {sol.key_points && sol.key_points.length > 0 && (
                        <div className="mb-6 space-y-3">
                          <h3 className="font-semibold text-foreground mb-3">Points clés :</h3>
                          {sol.key_points.map((point, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                              <span className="text-2xl flex-shrink-0">{point.icon}</span>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {point.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <Button
                      size="lg"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 w-full mt-4"
                      onClick={() => {
                        logEvent(sol.id, "click");
                        window.location.href = "/contact";
                      }}
                    >
                      {sol.cta_text || "Demander un Audit"}
                    </Button>
                  </CardContent>
                </div>
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
