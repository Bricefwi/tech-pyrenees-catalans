import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles, TrendingUp, Zap } from "lucide-react";

const ServiceSuggestions = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceType = searchParams.get("type") || "nocode";

  const suggestions: Record<string, any> = {
    repair_iphone: {
      title: "Optimisez votre activité de Réparation iPhone",
      subtitle: "Gagnez jusqu'à 15h par semaine avec l'automatisation",
      icon: "📱",
      color: "from-blue-500 to-cyan-400",
      suggestions: [
        {
          title: "Réservations automatiques 24/7",
          description: "Vos clients prennent rendez-vous à toute heure. Le système gère le planning, envoie les confirmations et rappels automatiquement.",
          benefits: ["Augmentation de 40% des prises de RDV", "Réduction de 80% des no-shows", "Gain de 8h par semaine"],
          impact: "ROI en moins de 2 mois",
          priority: "high"
        },
        {
          title: "Diagnostic IA pré-visite",
          description: "L'IA identifie 90% des pannes avant l'arrivée du client. Vous préparez les pièces, optimisez votre temps.",
          benefits: ["Préparation optimale", "Satisfaction client +35%", "Réduction de 50% des délais"],
          impact: "Service premium",
          priority: "high"
        }
      ]
    },
    repair_mac: {
      title: "Révolutionnez votre service Mac & iPad",
      subtitle: "Performance multipliée par 3",
      icon: "💻",
      color: "from-purple-500 to-pink-400",
      suggestions: [
        {
          title: "Portail client temps réel",
          description: "Vos clients suivent leur réparation minute par minute. Plus d'appels de suivi.",
          benefits: ["Réduction de 90% des appels", "Satisfaction: 4.8/5", "Fidélisation +45%"],
          impact: "Différenciation totale",
          priority: "high"
        }
      ]
    },
    development: {
      title: "Développement augmenté par l'IA",
      subtitle: "Livrez 3x plus vite",
      icon: "⚡",
      color: "from-emerald-500 to-teal-400",
      suggestions: [
        {
          title: "Code généré par IA",
          description: "GitHub Copilot et Claude transforment votre productivité. Code propre, testé, documenté.",
          benefits: ["Productivité +250%", "Réduction bugs 70%", "Livraison 3x rapide"],
          impact: "Compétitivité maximale",
          priority: "high"
        }
      ]
    },
    nocode: {
      title: "Automatisation No-Code intelligente",
      subtitle: "Libérez 20h par semaine",
      icon: "🔧",
      color: "from-orange-500 to-yellow-400",
      suggestions: [
        {
          title: "Marketing automatisé",
          description: "Campagnes email, posts sociaux, relances en pilote automatique avec personnalisation IA.",
          benefits: ["Taux ouverture +85%", "Conversion +40%", "Gain 12h/semaine"],
          impact: "Croissance automatisée",
          priority: "high"
        }
      ]
    },
    ai: {
      title: "IA sur-mesure pour votre métier",
      subtitle: "Intelligence qui comprend votre business",
      icon: "🤖",
      color: "from-violet-500 to-purple-400",
      suggestions: [
        {
          title: "Assistant IA expert métier",
          description: "Formé sur vos documents et processus. Répond à vos équipes 24/7.",
          benefits: ["Productivité +180%", "Formation 10x accélérée", "Expertise scalable"],
          impact: "Expertise scalable",
          priority: "high"
        }
      ]
    },
    formation: {
      title: "Formation digitale nouvelle génération",
      subtitle: "Montée en compétence 5x plus rapide",
      icon: "🎓",
      color: "from-pink-500 to-rose-400",
      suggestions: [
        {
          title: "Plateforme e-learning intelligente",
          description: "Parcours personnalisé par IA. Résultats mesurables, progression garantie.",
          benefits: ["Complétion +75%", "Temps -40%", "Satisfaction 4.7/5"],
          impact: "Formation efficace",
          priority: "high"
        }
      ]
    }
  };

  const currentService = suggestions[serviceType] || suggestions["nocode"];

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      high: "destructive",
      medium: "default",
      low: "secondary"
    };
    const labels: Record<string, string> = {
      high: "Priorité haute",
      medium: "Priorité moyenne",
      low: "Priorité basse"
    };
    return <Badge variant={variants[priority]}>{labels[priority]}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="text-center mb-12 space-y-4">
          <div className="text-6xl mb-4">{currentService.icon}</div>
          <h1 className="text-5xl font-bold">{currentService.title}</h1>
          <p className="text-xl text-muted-foreground">{currentService.subtitle}</p>
        </div>

        <div className="grid gap-8 mb-12">
          {currentService.suggestions.map((suggestion: any, index: number) => (
            <Card key={index} className="border-2 hover:border-primary transition-all hover:shadow-elevated group">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentService.color} flex items-center justify-center`}>
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{suggestion.title}</CardTitle>
                </div>
                <p className="text-muted-foreground leading-relaxed">{suggestion.description}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {suggestion.benefits.map((benefit: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
                <div className={`p-4 rounded-xl bg-gradient-to-br ${currentService.color} bg-opacity-10`}>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <span className="font-semibold">{suggestion.impact}</span>
                  </div>
                </div>
                <Button className="w-full" size="lg" onClick={() => navigate("/create-request")}>
                  Demander un devis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceSuggestions;
