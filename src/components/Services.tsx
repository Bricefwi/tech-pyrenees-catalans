import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Laptop, Code, Workflow, Brain, GraduationCap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Services = () => {
  const navigate = useNavigate();

  const technicalServices = [
    {
      icon: Smartphone,
      title: "Réparation iPhone",
      description: "Écran, batterie, caméra, carte mère - Intervention rapide avec pièces d'origine",
      type: "repair_iphone"
    },
    {
      icon: Laptop,
      title: "Réparation Mac & iPad",
      description: "Diagnostics avancés, remplacement composants, optimisation performances",
      type: "repair_mac"
    },
    {
      icon: Code,
      title: "Développement",
      description: "Applications web, mobile, automatisations personnalisées",
      type: "development"
    }
  ];

  const digitalServices = [
    {
      icon: Workflow,
      title: "Solutions No-Code",
      description: "Automatisation de vos processus métier sans développement complexe",
      type: "nocode"
    },
    {
      icon: Brain,
      title: "Intégration IA",
      description: "Chatbots intelligents, analyse de données, automatisation cognitive",
      type: "ai"
    },
    {
      icon: GraduationCap,
      title: "Formation",
      description: "Montée en compétence de vos équipes sur les outils digitaux",
      type: "formation"
    }
  ];

  return (
    <section id="services" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Services <span className="text-primary">Premium</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            De la réparation hardware à la transformation digitale complète
          </p>
        </div>

        {/* Technical Services */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <div className="w-1 h-8 bg-primary rounded-full"></div>
            Expertise Apple
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {technicalServices.map((service, index) => (
              <Card 
                key={index}
                className="border-2 hover:border-primary transition-all duration-300 hover:shadow-elevated animate-slide-in group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-gradient-catalan flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <service.icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-base">{service.description}</CardDescription>
                  <Button 
                    variant="outline" 
                    className="w-full group/btn"
                    onClick={() => navigate(`/service-suggestions?type=${service.type}`)}
                  >
                    Voir les améliorations
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Digital Services */}
        <div>
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <div className="w-1 h-8 bg-secondary rounded-full"></div>
            Transformation Digitale
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {digitalServices.map((service, index) => (
              <Card 
                key={index}
                className="border-2 hover:border-secondary transition-all duration-300 hover:shadow-elevated animate-slide-in group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <service.icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-base">{service.description}</CardDescription>
                  <Button 
                    variant="outline" 
                    className="w-full group/btn"
                    onClick={() => navigate(`/service-suggestions?type=${service.type}`)}
                  >
                    Voir les améliorations
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
