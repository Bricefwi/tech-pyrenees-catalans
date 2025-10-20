import { useEffect, useState } from "react";
import { analyzeProjectSpecs, saveAnalysis } from "@/lib/aiAnalysis";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { History, User } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

export default function AnalyzeSpecs() {
  const [specs, setSpecs] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  // 🔹 Charger le profil utilisateur et ses demandes
  useEffect(() => {
    async function loadUserData() {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      
      if (!userId) {
        toast.error("Vous devez être connecté pour accéder à cette page");
        return;
      }

      // Récupérer le profil de l'utilisateur
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, full_name, company_name, email")
        .eq("user_id", userId)
        .single();

      setProfile(profileData);

      // Récupérer les demandes de l'utilisateur
      const { data: reqData, error } = await supabase
        .from("service_requests")
        .select("id, title, created_at, request_number")
        .eq("client_user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && reqData) {
        setRequests(reqData);
      }
    }
    
    loadUserData();
  }, []);

  async function handleAnalyze() {
    if (!selectedRequest) {
      toast.error("Veuillez d'abord sélectionner une demande");
      setError("Veuillez d'abord sélectionner une demande.");
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    const clientName = profile?.company_name || profile?.full_name || "Client inconnu";

    const { analysis, error } = await analyzeProjectSpecs({
      specs,
      client: clientName,
    });

    if (error) {
      setError(error);
      toast.error(error);
      setLoading(false);
      return;
    }

    const resultText = analysis || "Aucun résultat retourné.";
    setResult(resultText);

    // 💾 Sauvegarder l'analyse
    try {
      await saveAnalysis({
        service_request_id: selectedRequest,
        contenu: {
          company_name: profile?.company_name,
          client_name: clientName,
          specs,
          analysis: resultText,
        },
      });
      toast.success("Analyse sauvegardée avec succès");
    } catch (saveError) {
      console.error("Erreur de sauvegarde:", saveError);
      toast.error("Analyse générée mais non sauvegardée");
    }

    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analyse IA du cahier des charges</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.href = "/analyses-history"}
        >
          <History className="h-4 w-4 mr-2" />
          Historique
        </Button>
      </div>

      {/* Informations du client */}
      {profile && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-semibold">
                  {profile.company_name || profile.full_name || "Non renseigné"}
                </p>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sélection de la demande */}
      <div className="space-y-2">
        <Label htmlFor="request-select">
          Associer à une demande existante <span className="text-destructive">*</span>
        </Label>
        <Select value={selectedRequest || ""} onValueChange={setSelectedRequest}>
          <SelectTrigger id="request-select">
            <SelectValue placeholder="Sélectionner une demande" />
          </SelectTrigger>
          <SelectContent>
            {requests.length === 0 ? (
              <SelectItem value="none" disabled>
                Aucune demande trouvée
              </SelectItem>
            ) : (
              requests.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.request_number || "REQ"} -{" "}
                  {r.title || `Demande du ${new Date(r.created_at).toLocaleDateString("fr-FR")}`}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {requests.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Vous devez d'abord créer une demande de service pour pouvoir effectuer une analyse.
          </p>
        )}
      </div>

      {/* Cahier des charges */}
      <div className="space-y-2">
        <Label htmlFor="specs">
          Cahier des charges du projet <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="specs"
          value={specs}
          onChange={(e) => setSpecs(e.target.value)}
          placeholder="Collez ici le cahier des charges détaillé de votre projet..."
          className="min-h-[250px] font-mono text-sm"
        />
      </div>

      {/* Bouton de lancement */}
      <Button
        onClick={handleAnalyze}
        disabled={!specs.trim() || !selectedRequest || loading}
        className="w-full"
        size="lg"
      >
        {loading ? "Analyse en cours..." : "Lancer l'analyse"}
      </Button>

      {/* Erreur */}
      {error && (
        <Card className="bg-destructive/10 border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive whitespace-pre-wrap">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Résultat */}
      {result && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-3">Résultat de l'analyse</h2>
            <div className="whitespace-pre-wrap text-sm bg-muted p-4 rounded">
              {result}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
