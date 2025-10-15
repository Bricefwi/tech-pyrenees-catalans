import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Send, ArrowLeft } from "lucide-react";
import { toast as sonnerToast } from "sonner";

const CreateRequest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Form state
  const [serviceType, setServiceType] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  // Chat state
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [specifications, setSpecifications] = useState("");
  const [isGeneratingSpec, setIsGeneratingSpec] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
  };

  const getServicePrompt = () => {
    const prompts: Record<string, string> = {
      "repair_iphone": `Tu es un expert en diagnostic de pannes iPhone. Pose des questions pour identifier le modèle, comprendre le problème et proposer un diagnostic.`,
      "repair_mac": `Tu es un expert en diagnostic de pannes Mac et iPad. Pose des questions pour identifier l'appareil, comprendre le problème et proposer un diagnostic.`,
      "development": `Tu es un consultant en transformation digitale spécialisé en développement.

Ton objectif est de guider le client pour définir précisément son besoin et construire un cahier des charges.

Pose des questions progressives pour comprendre:
1. Le CONTEXTE: Quelle est son activité? Quelle problématique il rencontre?
2. Les OBJECTIFS: Que veut-il accomplir concrètement? Quels résultats mesurables attend-il?
3. Les FONCTIONNALITÉS: Quelles sont les fonctionnalités principales attendues? Les utilisateurs cibles?
4. Les CONTRAINTES: Budget estimé? Délais? Systèmes existants à intégrer?

Sois concret, orienté projet, et aide le client à formuler clairement son besoin. Pose 2-3 questions à la fois maximum.`,
      "nocode": `Tu es un consultant en transformation digitale spécialisé en solutions No-Code.

Ton objectif est de guider le client pour identifier ses processus à digitaliser et construire un cahier des charges.

Pose des questions progressives pour comprendre:
1. Le CONTEXTE: Quelle est son activité? Quels processus manuels lui font perdre du temps?
2. Les OBJECTIFS: Quels processus veut-il automatiser? Quels gains attend-il (temps, coûts, qualité)?
3. Les FLUX: Comment fonctionnent actuellement ses processus? Quels outils utilise-t-il?
4. Les BESOINS: Combien d'utilisateurs? Quelles données manipuler? Intégrations nécessaires?

Sois concret, identifie les opportunités No-Code (Make, Zapier, Airtable, etc.), pose 2-3 questions à la fois.`,
      "ai": `Tu es un consultant en transformation digitale spécialisé en Intelligence Artificielle.

Ton objectif est de guider le client pour identifier comment l'IA peut transformer son activité et construire un cahier des charges.

Pose des questions progressives pour comprendre:
1. Le CONTEXTE: Quelle est son activité? Quels processus chronophages ou répétitifs identifie-t-il?
2. Les OPPORTUNITÉS: Traitement de données? Automatisation? Service client? Aide à la décision?
3. Les CAS D'USAGE: Quels types de tâches veut-il automatiser avec l'IA? (chatbots, analyse, génération contenu, etc.)
4. Les DONNÉES: Quelles données disponibles? Volume? Qualité?

Sois concret, éducatif sur le potentiel de l'IA, propose des cas d'usage inspirants, pose 2-3 questions à la fois.`,
      "formation": `Tu es un consultant en transformation digitale spécialisé en Formation.

Ton objectif est de guider le client pour définir ses besoins en formation digitale/IA/No-Code et construire un cahier des charges.

Pose des questions progressives pour comprendre:
1. Le CONTEXTE: Quelle est la structure? Combien de personnes? Quels niveaux actuels?
2. Les OBJECTIFS: Quelles compétences développer? (No-Code, IA, digital, automatisation?)
3. Le PUBLIC: Profils à former? Niveau technique actuel? Disponibilité?
4. Les MODALITÉS: Présentiel, distanciel, hybride? Durée souhaitée? Mise en pratique sur projets réels?

Sois concret, propose des formats adaptés, identifie les besoins de montée en compétences, pose 2-3 questions à la fois.`
    };
    return prompts[serviceType] || prompts["development"];
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || !serviceType) return;

    const userMessage = { role: "user", content: chatInput };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/diagnostic-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: getServicePrompt() },
            ...updatedMessages
          ]
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          sonnerToast.error("Trop de requêtes. Veuillez réessayer dans quelques instants.");
          return;
        }
        if (response.status === 402) {
          sonnerToast.error("Service temporairement indisponible.");
          return;
        }
        throw new Error("Erreur réseau");
      }

      const data = await response.json();
      setMessages([...updatedMessages, { role: "assistant", content: data.message }]);
    } catch (error) {
      console.error("Erreur diagnostic:", error);
      sonnerToast.error("Erreur lors du diagnostic.");
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleGenerateSpecifications = async () => {
    if (messages.length < 4) {
      toast({
        title: "Échange insuffisant",
        description: "Continuez l'échange avec l'IA pour définir votre besoin avant de générer le cahier des charges",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingSpec(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-specifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages,
          serviceType
        }),
      });

      if (!response.ok) throw new Error("Erreur génération");

      const data = await response.json();
      setSpecifications(data.specifications);
      
      toast({
        title: "Cahier des charges généré",
        description: "Votre cahier des charges a été créé avec succès",
      });
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le cahier des charges",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSpec(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!serviceType || !title || !description) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    // Pour les services digitaux, encourager (mais ne pas bloquer) la génération du CDC
    const isDigitalService = ["development", "nocode", "ai", "formation"].includes(serviceType);
    if (isDigitalService && messages.length > 3 && !specifications) {
      // Simplement avertir l'utilisateur, sans bloquer
      console.log("Note: Le cahier des charges n'a pas été généré, mais la demande peut être soumise");
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("service_requests")
        .insert({
          client_user_id: user.id,
          service_type: serviceType,
          title,
          description,
          ai_specifications: specifications || null,
          status: "pending",
          priority: "medium"
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Votre demande a été créée avec succès",
      });

      setTimeout(() => {
        navigate("/client-dashboard");
      }, 1500);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <h1 className="text-3xl font-bold">Créer une nouvelle demande</h1>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Formulaire */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de la demande</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="serviceType">Type de service *</Label>
                  <Select value={serviceType} onValueChange={setServiceType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="repair_iphone">Réparation iPhone</SelectItem>
                      <SelectItem value="repair_mac">Réparation Mac & iPad</SelectItem>
                      <SelectItem value="development">Développement</SelectItem>
                      <SelectItem value="nocode">Solutions No-Code</SelectItem>
                      <SelectItem value="ai">Intégration IA</SelectItem>
                      <SelectItem value="formation">Formation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Titre de la demande *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Réparation écran iPhone 13"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Décrivez votre besoin en détail..."
                    rows={6}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Création..." : "Créer la demande"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Chat de diagnostic */}
          <Card>
            <CardHeader>
              <CardTitle>
                {["development", "nocode", "ai", "formation"].includes(serviceType)
                  ? "Définition du cahier des charges avec IA"
                  : "Diagnostic assisté par IA"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!serviceType ? (
                <div className="text-center text-muted-foreground py-8">
                  Sélectionnez d'abord un type de service pour commencer
                </div>
              ) : (
                <>
                  <div className="space-y-4 max-h-96 overflow-y-auto border rounded-lg p-4">
                    {messages.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        {["development", "nocode", "ai", "formation"].includes(serviceType)
                          ? "Échangez avec l'IA pour définir précisément votre projet et créer un cahier des charges"
                          : "Décrivez votre besoin pour obtenir un diagnostic personnalisé"}
                      </div>
                    )}
                    {messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg ${
                          msg.role === "user"
                            ? "bg-primary/10 ml-auto max-w-[85%]"
                            : "bg-muted mr-auto max-w-[85%]"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    ))}
                    {isChatLoading && (
                      <div className="bg-muted p-3 rounded-lg mr-auto max-w-[85%]">
                        <div className="flex gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100" />
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !isChatLoading && handleChatSend()}
                      placeholder="Posez vos questions..."
                      disabled={isChatLoading}
                    />
                    <Button onClick={handleChatSend} disabled={isChatLoading || !chatInput.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>

                  {["development", "nocode", "ai", "formation"].includes(serviceType) && messages.length >= 4 && (
                    <Button 
                      onClick={handleGenerateSpecifications} 
                      disabled={isGeneratingSpec}
                      className="w-full"
                      variant="outline"
                    >
                      {isGeneratingSpec ? "Génération en cours..." : "Générer le cahier des charges"}
                    </Button>
                  )}

                  {specifications && (
                    <div className="mt-4 border rounded-lg p-4 bg-muted/50">
                      <h3 className="font-semibold mb-2">Cahier des charges généré:</h3>
                      <div className="text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">
                        {specifications}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateRequest;
