import { useState } from "react";
import { analyzeProjectSpecs, saveAnalysis } from "@/lib/aiAnalysis";
import { toast } from "sonner";

export default function AnalyzeSpecs() {
  const [specs, setSpecs] = useState("");
  const [client, setClient] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    setLoading(true);
    setResult(null);
    setError(null);
    
    const { analysis, error } = await analyzeProjectSpecs({ specs, client });
    
    if (error) {
      setError(error);
    } else {
      const resultText = analysis || "Aucun résultat retourné.";
      setResult(resultText);
      
      // 💾 Sauvegarder automatiquement l'analyse dans la base de données
      try {
        await saveAnalysis({
          contenu: {
            client,
            specs,
            analysis: resultText,
          },
        });
        toast.success("Analyse sauvegardée avec succès");
      } catch (saveError) {
        console.error("Erreur de sauvegarde:", saveError);
        toast.error("Analyse générée mais non sauvegardée - êtes-vous connecté ?");
      }
    }
    
    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Analyse IA du cahier des charges</h1>

      <input
        type="text"
        value={client}
        onChange={(e) => setClient(e.target.value)}
        placeholder="Nom du client (optionnel)"
        className="w-full p-2 border rounded"
      />

      <textarea
        value={specs}
        onChange={(e) => setSpecs(e.target.value)}
        placeholder="Colle ici le cahier des charges du projet..."
        className="w-full h-48 p-2 border rounded"
      />

      <button
        onClick={handleAnalyze}
        disabled={!specs.trim() || loading}
        className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Analyse en cours..." : "Lancer l’analyse"}
      </button>

      {error && (
        <div className="text-red-600 whitespace-pre-wrap">{error}</div>
      )}

      {result && (
        <div className="bg-gray-50 border rounded p-3 whitespace-pre-wrap">
          {result}
        </div>
      )}
    </div>
  );
}
