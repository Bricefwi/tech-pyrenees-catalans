import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, CheckCircle2 } from "lucide-react";

const ZoneIntervention = () => {
  const cities = [
    "Perpignan", "Canet-en-Roussillon", "Saint-Cyprien", "Argelès-sur-Mer",
    "Céret", "Prades", "Rivesaltes", "Thuir", "Elne", "Cabestany"
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Zone d'intervention</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Tout le <span className="text-primary">Pays Catalan</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            De Perpignan à la frontière espagnole, interventions rapides sur l'ensemble du territoire
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Intervention Rapide</h3>
                  <p className="text-muted-foreground">Délai moyen de 24h pour diagnostic et prise en charge</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Déplacement Possible</h3>
                  <p className="text-muted-foreground">Service à domicile ou en entreprise selon vos besoins</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Garantie Qualité</h3>
                  <p className="text-muted-foreground">Pièces certifiées et garantie sur toutes interventions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cities Grid */}
        <div className="bg-muted/30 rounded-2xl p-8">
          <h3 className="text-xl font-semibold mb-6 text-center">Villes principales couvertes</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {cities.map((city, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 text-sm animate-slide-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                <span>{city}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-muted-foreground mt-6 text-sm">
            + Toute autre localité du Pays Catalan sur demande
          </p>
        </div>
      </div>
    </section>
  );
};

export default ZoneIntervention;
