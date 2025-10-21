import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ExternalLink, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";

interface Solution {
  id: string;
  title: string;
  description: string;
  benefit: string;
  visual: string;
  color: string;
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

  return (
    <>
      <Helmet>
        <title>Solutions IA & Automatisation | IMOTION</title>
        <meta 
          name="description" 
          content="Découvrez comment l'IA peut transformer vos opérations — simplement, efficacement et sans rupture. Exemples concrets d'automatisation pour PME." 
        />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Solutions IA & Automatisation</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Découvrez comment l'IA peut transformer vos opérations — simplement, efficacement et sans rupture.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {solutions.map((sol, i) => (
                <motion.div
                  key={sol.id}
                  className="flex flex-col"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="rounded-2xl overflow-hidden shadow-lg border-0 h-full hover:shadow-xl transition-shadow">
                    <CardContent className="p-0">
                      <div className="relative bg-surface">
                        <img
                          src={sol.visual}
                          alt={sol.title}
                          className="w-full h-64 object-cover"
                          loading="lazy"
                        />
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                          }}
                        />
                      </div>
                      <div className="p-6">
                        <h2 
                          className="text-2xl font-semibold mb-3"
                          style={{ color: sol.color }}
                        >
                          {sol.title}
                        </h2>
                        <p className="text-muted-foreground mb-4 leading-relaxed">
                          {sol.description}
                        </p>
                        <p className="text-sm font-medium mb-6 flex items-start gap-2">
                          <span className="text-xl">💡</span>
                          <span>{sol.benefit}</span>
                        </p>
                        <Button
                          variant="outline"
                          className="w-full transition-all"
                          style={{
                            color: sol.color,
                            borderColor: sol.color,
                          }}
                          onClick={() => {
                            logEvent(sol.id, "click");
                            window.open("https://www.napkin.ai", "_blank");
                          }}
                        >
                          Visualiser sur Napkin.ai{" "}
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && solutions.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Aucune solution disponible pour le moment.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
