import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, Code, BarChart3, Send } from "lucide-react";
import { toast } from "sonner";

const ContactDiagnostic = () => {
  const [activeService, setActiveService] = useState<"reparation" | "dev" | "audit">("reparation");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const servicePrompts = {
    reparation: `Tu es un expert en diagnostic de pannes Apple (iPhone, Mac, iPad). Pose des questions précises pour :
- Identifier l'appareil exact (modèle, année)
- Comprendre le problème (symptômes, quand ça a commencé)
- Évaluer l'urgence
- Proposer un diagnostic préliminaire
Reste concis et professionnel.`,
    dev: `Tu es un expert en développement et solutions digitales. Pose des questions pour :
- Comprendre le besoin métier
- Identifier les fonctionnalités clés
- Évaluer la complexité technique
- Proposer une approche no-code/low-code ou développement sur mesure
Reste concis et pratique.`,
    audit: `Tu es un consultant en transformation digitale. Pose des questions sectorielles pour auditer :
**Secteurs** : Commerce, Santé, Services, Industrie, Artisanat
**Axes d'audit** :
1. Infrastructure IT actuelle
2. Processus métier digitalisés
3. Outils collaboratifs
4. Sécurité & conformité
5. Besoins en automatisation
6. Maturité IA
Adapte tes questions au secteur de l'entreprise. Reste structuré et professionnel.`
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/diagnostic-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: servicePrompts[activeService] },
            ...updatedMessages
          ]
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Trop de requêtes. Veuillez réessayer dans quelques instants.");
          return;
        }
        if (response.status === 402) {
          toast.error("Service temporairement indisponible. Contactez-nous directement.");
          return;
        }
        throw new Error("Erreur réseau");
      }

      const data = await response.json();
      setMessages([...updatedMessages, { role: "assistant", content: data.message }]);
    } catch (error) {
      console.error("Erreur diagnostic:", error);
      toast.error("Erreur lors du diagnostic. Réessayez ou contactez-nous.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = (service: "reparation" | "dev" | "audit") => {
    setActiveService(service);
    setMessages([]);
    setInput("");
  };

  return (
    <section id="contact" className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-catalan bg-clip-text text-transparent">
            Démarrez votre projet
          </h2>
          <p className="text-muted-foreground text-lg">
            Diagnostic intelligent en temps réel
          </p>
        </div>

        <Tabs value={activeService} onValueChange={(v) => resetChat(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="reparation" className="gap-2">
              <Wrench className="w-4 h-4" />
              Réparation
            </TabsTrigger>
            <TabsTrigger value="dev" className="gap-2">
              <Code className="w-4 h-4" />
              Développement
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Audit Entreprise
            </TabsTrigger>
          </TabsList>

          {["reparation", "dev", "audit"].map((service) => (
            <TabsContent key={service} value={service}>
              <Card className="p-6">
                <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                  {messages.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      Décrivez votre besoin pour commencer le diagnostic
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-lg ${
                        msg.role === "user"
                          ? "bg-primary/10 ml-auto max-w-[80%]"
                          : "bg-muted mr-auto max-w-[80%]"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="bg-muted p-4 rounded-lg mr-auto max-w-[80%]">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSend()}
                    placeholder="Décrivez votre besoin..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={isLoading}
                  />
                  <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default ContactDiagnostic;
