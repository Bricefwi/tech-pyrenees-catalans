import { useEffect, useState } from "react";
import { analyzeProjectSpecs, saveAnalysis } from "@/lib/aiAnalysis";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AnalyzeSpecs() {
  const [specs, setSpecs] = useState("");
  const [client, setClient] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  // 🔹 Charger les demandes existantes depuis Supabase
  useEffect(() => {
    async function loadRequests() {
      const { data, error } = await supabase
        .from("service_requests")
        .select("id, title, created_at, request_number")
        .order("created_at", { ascending: false });
      
      if (!error && data) {
        setRequests(data);
      }
    }
    loadRequests();
  }, []);

  async function handleAnalyze() {
    setLoading(true);
    setResult(null);
    setError(null);

    const { analysis, error } = await analyzeProjectSpecs({ specs, client });
    
    if (error) {
      setError(error);
      setLoading(false);
      return;
    }

    const resultText = analysis || "Aucun résultat retourné.";
    setResult(resultText);

    // 💾 Sauvegarder automatiquement l'analyse dans la base de données
    try {
      await saveAnalysis({
        service_request_id: selectedRequest || undefined,
        contenu: { client, specs, analysis: resultText },
      });
      toast.success("Analyse sauvegardée avec succès");
    } catch (saveError) {
      console.error("Erreur de sauvegarde:", saveError);
      toast.error("Analyse générée mais non sauvegardée - êtes-vous connecté ?");
    }

    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Analyse IA du cahier des charges</h1>

      {/* Sélection du client */}
      <div>
        <label className="block mb-1 font-medium text-sm">
          Nom du client (optionnel)
        </label>
        <input
          type="text"
          value={client}
          onChange={(e) => setClient(e.target.value)}
          placeholder="Nom du client"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Sélection de la demande */}
      <div>
        <label className="block mb-1 font-medium text-sm">
          Associer à une demande existante :
        </label>
        <select
          value={selectedRequest || ""}
          onChange={(e) => setSelectedRequest(e.target.value || null)}
          className="w-full p-2 border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary z-10"
        >
          <option value="">Aucune (optionnel)</option>
          {requests.map((r) => (
            <option key={r.id} value={r.id}>
              {r.request_number || "REQ"} - {r.title || `Demande du ${new Date(r.created_at).toLocaleDateString("fr-FR")}`}
            </option>
          ))}
        </select>
      </div>

      {/* Cahier des charges */}
      <div>
        <label className="block mb-1 font-medium text-sm">
          Cahier des charges du projet
        </label>
        <textarea
          value={specs}
          onChange={(e) => setSpecs(e.target.value)}
          placeholder="Colle ici le cahier des charges du projet..."
          className="w-full h-48 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Bouton de lancement */}
      <button
        onClick={handleAnalyze}
        disabled={!specs.trim() || loading}
        className="w-full bg-primary text-primary-foreground px-4 py-2 rounded font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Analyse en cours..." : "Lancer l'analyse"}
      </button>

      {/* Erreur */}
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive rounded p-4 whitespace-pre-wrap">
          {error}
        </div>
      )}

      {/* Résultat */}
      {result && (
        <div className="bg-muted border rounded p-4">
          <h2 className="text-lg font-semibold mb-3">Résultat de l'analyse</h2>
          <div className="whitespace-pre-wrap text-sm">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}
