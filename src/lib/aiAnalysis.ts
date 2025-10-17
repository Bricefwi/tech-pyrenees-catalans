// src/lib/aiAnalysis.ts

const EDGE_URL = "https://nmlkqyhkygdajqaffzny.supabase.co/functions/v1/analyze-project-specs";

type AnalyzeInput = { specs: string; client?: string };
type AnalyzeOutput = { analysis?: string; error?: string };

// 🔁 Fonction de retry automatique (complément, ne remplace rien)
async function withRetry<T>(fn: () => Promise<T>, tries = 3, delayMs = 1200): Promise<T> {
  try {
    return await fn();
  } catch (e: any) {
    if (tries <= 1) throw e;
    await new Promise(r => setTimeout(r, delayMs));
    return withRetry(fn, tries - 1, delayMs * 1.5);
  }
}

// 🧠 Fonction principale d’analyse IA
export async function analyzeProjectSpecs(input: AnalyzeInput): Promise<AnalyzeOutput> {
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!anonKey) return { error: "Anon key manquante (VITE_SUPABASE_PUBLISHABLE_KEY)" };

  try {
    // ✅ On enveloppe le fetch dans le retry
    return await withRetry(async () => {
      const res = await fetch(EDGE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${anonKey}`,
        },
        body: JSON.stringify(input),
      });

      if (res.status === 429) return { error: "Rate limit atteint. Réessaie dans une minute." };
      if (res.status === 402) return { error: "Crédits IA insuffisants sur Lovable." };
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        return { error: `Erreur ${res.status}: ${txt || "Edge function"}` };
      }

      return await res.json();
    });
  } catch (e: any) {
    return { error: e?.message || "Erreur réseau inattendue" };
  }
}
