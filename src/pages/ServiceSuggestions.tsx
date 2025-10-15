import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Zap, TrendingUp } from "lucide-react";

const ServiceSuggestions = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceType = searchParams.get("type") || "nocode";

  const suggestions: Record<string, any> = {
    repair_iphone: {
      title: "Optimisations No-Code & IA - Réparation iPhone",
      icon: "📱",
      suggestions: [
        {
          title: "Système de prise de RDV automatisé",
          description: "Calendrier intelligent avec rappels SMS/Email automatiques",
          tools: ["Calendly", "Make.com", "Twilio"],
          priority: "high"
        },
        {
          title: "Diagnostic IA pré-intervention",
          description: "Chatbot IA pour identifier la panne avant visite",
          tools: ["Lovable AI", "ChatGPT API"],
          priority: "high"
        },
        {
          title: "Gestion stock pièces détachées",
          description: "Tracking automatique et alertes de réapprovisionnement",
          tools: ["Airtable", "Zapier"],
          priority: "medium"
        }
      ]
    },
    repair_mac: {
      title: "Optimisations No-Code & IA - Réparation Mac & iPad",
      icon: "💻",
      suggestions: [
        {
          title: "Plateforme de suivi réparation",
          description: "Portail client avec statut en temps réel",
          tools: ["Bubble", "Softr", "Airtable"],
          priority: "high"
        },
        {
          title: "Devis automatisés",
          description: "Génération de devis basée sur le diagnostic IA",
          tools: ["Make.com", "Google Sheets", "PDF API"],
          priority: "high"
        },
        {
          title: "Base de connaissances technique",
          description: "Documentation searchable avec IA pour diagnostics récurrents",
          tools: ["Notion AI", "Guru"],
          priority: "medium"
        }
      ]
    },
    development: {
      title: "Optimisations No-Code & IA - Développement",
      icon: "⚡",
      suggestions: [
        {
          title: "Génération de code assistée par IA",
          description: "Accélération du développement avec GitHub Copilot et Claude",
          tools: ["GitHub Copilot", "Cursor", "Claude API"],
          priority: "high"
        },
        {
          title: "Tests automatisés",
          description: "Framework de tests généré automatiquement",
          tools: ["Playwright", "Vitest", "AI Test Generator"],
          priority: "high"
        },
        {
          title: "Documentation auto-générée",
          description: "Documentation technique mise à jour automatiquement",
          tools: ["Mintlify", "Readme.so", "GPT-4"],
          priority: "medium"
        }
      ]
    },
    nocode: {
      title: "Optimisations No-Code & IA - Solutions No-Code",
      icon: "🔧",
      suggestions: [
        {
          title: "Automatisation marketing",
          description: "Campagnes email et réseaux sociaux automatisées",
          tools: ["HubSpot", "Make.com", "Buffer"],
          priority: "high"
        },
        {
          title: "CRM intelligent",
          description: "Gestion clients avec scoring IA et relances automatiques",
          tools: ["Pipedrive", "Airtable", "Zapier AI"],
          priority: "high"
        },
        {
          title: "Tableau de bord analytics",
          description: "Reporting automatisé avec insights IA",
          tools: ["Looker Studio", "Tableau", "Power BI"],
          priority: "medium"
        },
        {
          title: "Chatbot service client",
          description: "Support 24/7 avec IA conversationnelle",
          tools: ["Intercom", "Drift", "Lovable AI"],
          priority: "high"
        }
      ]
    },
    ai: {
      title: "Optimisations No-Code & IA - Intégration IA",
      icon: "🤖",
      suggestions: [
        {
          title: "Assistant IA personnalisé",
          description: "Agent IA formé sur vos données métier",
          tools: ["OpenAI GPT-5", "Claude", "Custom RAG"],
          priority: "high"
        },
        {
          title: "Analyse prédictive",
          description: "Prévision de tendances et recommandations automatiques",
          tools: ["TensorFlow", "Prophet", "AutoML"],
          priority: "high"
        },
        {
          title: "Reconnaissance d'images",
          description: "Classification et analyse visuelle automatique",
          tools: ["Google Vision AI", "AWS Rekognition"],
          priority: "medium"
        },
        {
          title: "Traitement automatique de documents",
          description: "Extraction et structuration de données depuis PDFs/images",
          tools: ["DocAI", "Nanonets", "Rossum"],
          priority: "high"
        }
      ]
    },
    formation: {
      title: "Optimisations No-Code & IA - Formation",
      icon: "🎓",
      suggestions: [
        {
          title: "Plateforme e-learning",
          description: "LMS avec parcours personnalisés par IA",
          tools: ["Teachable", "Thinkific", "AI Tutor"],
          priority: "high"
        },
        {
          title: "Évaluation automatique",
          description: "Correction et feedback IA sur exercices",
          tools: ["GPT-4", "Custom AI", "Quizlet AI"],
          priority: "medium"
        },
        {
          title: "Suivi progression",
          description: "Analytics d'apprentissage et recommandations adaptatives",
          tools: ["Airtable", "Notion", "Google Analytics"],
          priority: "medium"
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="text-center space-y-4">
          <div className="text-6xl">{currentService.icon}</div>
          <h1 className="text-4xl font-bold bg-gradient-catalan bg-clip-text text-transparent">
            {currentService.title}
          </h1>
          <p className="text-muted-foreground text-lg">
            Améliorez votre efficacité avec ces solutions No-Code et IA
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {currentService.suggestions.map((suggestion: any, index: number) => (
            <Card key={index} className="border-2 hover:border-primary transition-all duration-300 hover:shadow-elevated">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    {suggestion.title}
                  </CardTitle>
                  {getPriorityBadge(suggestion.priority)}
                </div>
                <CardDescription className="text-base">
                  {suggestion.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Outils recommandés :
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestion.tools.map((tool: string, i: number) => (
                      <Badge key={i} variant="outline">{tool}</Badge>
                    ))}
                  </div>
                </div>
                <Button className="w-full" onClick={() => navigate("/create-request")}>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Demander un devis
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
