// src/lib/aiAnalysis.ts
const EDGE_URL = "https://nmlkqyhkygdajqaffzny.supabase.co/functions/v1/analyze-project-specs";

type AnalyzeInput = { specs: string; client?: string };
type AnalyzeOutput = { analysis?: string; error?: string };

export async function analyzeProjectSpecs(input: AnalyzeInput): Promise<AnalyzeOutput> {
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!anonKey) return { error: "Anon key manquante (VITE_SUPABASE_PUBLISHABLE_KEY)" };
  try {
    const res = await fetch(EDGE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${anonKey}`,
      },
      body: JSON.stringify(input),
    });

    // Gestion des quotas/credits côté gateway
    if (res.status === 429) return { error: "Rate limit atteint. Réessaie dans une minute." };
    if (res.status === 402) return { error: "Crédits IA insuffisants sur Lovable." };

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      return { error: `Erreur ${res.status}: ${txt || "Edge function"}`
      };
    }
    return await res.json();
  } catch (e: any) {
    return { error: e?.message || "Erreur réseau inattendue" };
  }
}
