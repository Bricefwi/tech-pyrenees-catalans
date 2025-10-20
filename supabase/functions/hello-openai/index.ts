// supabase/functions/hello-openai/index.ts
// Fonction de test OpenAI pour Deno + Supabase Edge

import OpenAI from "openai";

// Initialisation client OpenAI via variable d'environnement
const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY")!,
});

console.log("✅ OpenAI client initialized successfully.");

// Handler principal Supabase Edge
Deno.serve(async (req) => {
  try {
    // Simple prompt test (aucune donnée sensible)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Tu es un assistant de test IMOTION." },
        { role: "user", content: "Dis-moi simplement 'Connexion OK'." }
      ],
      max_tokens: 30,
    });

    const reply = completion.choices[0]?.message?.content ?? "Aucune réponse";

    return new Response(
      JSON.stringify({
        status: "success",
        message: reply,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("❌ Erreur OpenAI:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        message: error.message ?? "Erreur inconnue",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
