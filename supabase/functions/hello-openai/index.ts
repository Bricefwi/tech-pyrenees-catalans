// ------------------------------
// IMOTION - Test Cloud OpenAI API
// Version cloud-ready avec logs et gestion d'erreurs
// ------------------------------

import OpenAI from "npm:openai@4.52.5";

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY")!,
});

Deno.serve(async (req) => {
  const start = new Date();

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Tu es un assistant IMOTION en environnement cloud." },
        { role: "user", content: "Teste la connexion et réponds : Connexion OpenAI IMOTION OK." }
      ],
      max_tokens: 30,
    });

    const reply = completion.choices[0]?.message?.content ?? "Réponse manquante";

    const end = new Date();

    // Log structuré (visible dans Supabase > Logs)
    console.log(JSON.stringify({
      event: "openai_connection_test",
      timestamp: end.toISOString(),
      duration_ms: end.getTime() - start.getTime(),
      status: "success",
      message: reply,
    }));

    return new Response(
      JSON.stringify({
        status: "success",
        message: reply,
        duration_ms: end.getTime() - start.getTime(),
      }),
      { headers: { "Content-Type": "application/json" }, status: 200 },
    );

  } catch (err) {
    const end = new Date();
    const error = err as Error;

    console.error(JSON.stringify({
      event: "openai_connection_test",
      timestamp: end.toISOString(),
      duration_ms: end.getTime() - start.getTime(),
      status: "error",
      error: error.message ?? "Erreur inconnue",
    }));

    return new Response(
      JSON.stringify({
        status: "error",
        message: error.message ?? "Erreur inconnue",
      }),
      { headers: { "Content-Type": "application/json" }, status: 500 },
    );
  }
});
