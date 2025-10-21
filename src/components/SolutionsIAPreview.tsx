import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Brain, Zap, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface Solution {
  id: string;
  title: string;
  highlight: string;
}

export default function SolutionsIAPreview() {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSolutions = async () => {
      try {
        const { data, error } = await supabase
          .from("ia_solutions")
          .select("id, title, highlight")
          .order("created_at", { ascending: false })
          .limit(3);

        if (error) throw error;
        setSolutions(data || []);
      } catch (error) {
        console.error("Error loading solutions preview:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSolutions();
  }, []);

  const icons = [Brain, Zap, TrendingUp, Sparkles];

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-background to-surface" aria-label="Aperçu Solutions IA">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Intelligence Artificielle</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Transformez vos opérations avec l'IA
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez des solutions concrètes d'automatisation et d'IA qui ont déjà fait leurs preuves.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {solutions.map((solution, index) => {
              const Icon = icons[index % icons.length];
              return (
                <motion.div
                  key={solution.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow border-0 shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <h3 className="font-semibold text-lg mb-3 line-clamp-2">
                        {solution.title}
                      </h3>
                <p className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-xl flex-shrink-0">💡</span>
                  <span className="line-clamp-2">{solution.highlight}</span>
                </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Link to="/solutions-ia">
            <Button 
              size="lg" 
              className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all"
            >
              Découvrir toutes les solutions IA
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            Cas concrets, chiffrés et adaptés à votre secteur
          </p>
        </motion.div>
      </div>
    </section>
  );
}
