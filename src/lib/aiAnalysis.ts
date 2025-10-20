import { supabase } from "@/integrations/supabase/client";

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

// 💾 Fonction pour enregistrer l'analyse dans Supabase
export async function saveAnalysis({
  service_request_id,
  contenu,
}: {
  service_request_id?: string;
  contenu: any;
}) {
  try {
    // Récupérer l'utilisateur connecté
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Utilisateur non connecté", userError);
      throw new Error("Vous devez être connecté pour sauvegarder une analyse");
    }

    // Récupérer le profile_id correspondant à cet utilisateur
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("Profil non trouvé", profileError);
      throw new Error("Profil utilisateur introuvable");
    }

    // Insérer l'analyse dans la base de données
    const { error: insertError } = await supabase
      .from("analyses")
      .insert({
        profile_id: profile.id,
        service_request_id,
        contenu,
      });

    if (insertError) {
      console.error("Erreur lors de l'enregistrement de l'analyse :", insertError);
      throw insertError;
    }

    console.log("✅ Analyse sauvegardée avec succès");
  } catch (error) {
    console.error("Erreur saveAnalysis:", error);
    throw error;
  }
}
