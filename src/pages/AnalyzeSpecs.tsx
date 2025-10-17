import { useState } from "react";
import { analyzeProjectSpecs } from "@/lib/aiAnalysis";

export default function AnalyzeSpecsPanel() {
  const [specs, setSpecs] = useState("");
  const [client, setClient] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    const { analysis, error } = await analyzeProjectSpecs({ specs, client });
    if (error) setError(error);
    else setResult(analysis || "(aucun contenu)");
    setLoading(false);
  }

  return (
    <div className="space-y-3 p-4 border rounded-lg">
      <h2 className="text-lg font-semibold">Analyse IA du cahier des charges</h2>

      <input
        value={client}
        onChange={(e) => setClient(e.target.value)}
        placeholder="Nom du client (optionnel)"
        className="w-full border rounded p-2"
      />

      <textarea
        value={specs}
        onChange={(e) => setSpecs(e.target.value)}
        placeholder="Colle ici le cahier des charges…"
        className="w-full h-40 border rounded p-2"
      />

      <button
        onClick={run}
        disabled={loading || !specs.trim()}
        className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
      >
        {loading ? "Analyse en cours…" : "Lancer l'analyse"}
      </button>

      {error && (
        <div className="text-red-600 text-sm whitespace-pre-wrap">{error}</div>
      )}

      {result && (
        <div className="mt-3 p-3 bg-gray-50 border rounded whitespace-pre-wrap">
          {result}
        </div>
      )}
    </div>
  );
}
