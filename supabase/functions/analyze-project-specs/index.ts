import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  try {
    const { specs, client } = await req.json();

    const prompt = `
Tu es un consultant expert en transformation digitale et automatisation no-code.
Analyse le cahier des charges suivant :
---
${specs}
---
Client : ${client || "Non spécifié"}

Rédige :
1. Une synthèse claire du besoin.
2. Les points critiques et risques identifiés.
3. Trois axes de solutions technologiques possibles (NoCode, IA, Automatisation).
4. Un plan projet structuré en jalons (avec durées indicatives et livrables).
5. Les gains potentiels estimés en productivité, organisation et visibilité.
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Tu réponds de manière structurée, claire et exploitable par un professionnel." },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 1800,
      }),
    });

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || "Analyse indisponible.";

    return new Response(JSON.stringify({ analysis: text }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
