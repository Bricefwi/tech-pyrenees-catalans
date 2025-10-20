import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, html, pdfUrl, ccAdmins = [] } = await req.json();

    if (!to || !subject || !html) {
      console.error("Champs manquants:", { to, subject, html });
      return new Response(
        JSON.stringify({ error: "Champs manquants : to, subject, html" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Tech Catalan <onboarding@resend.dev>";

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY manquant");
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY manquant" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log(`Envoi email à ${to} - Sujet: ${subject}`);
    if (ccAdmins.length > 0) {
      console.log(`CC administrateurs: ${ccAdmins.join(", ")}`);
    }

    // Construire le corps du mail
    const emailData: any = {
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
    };

    // Ajouter CC si présent
    if (ccAdmins.length > 0) {
      emailData.cc = ccAdmins;
    }

    // Ajouter pièce jointe si présente
    if (pdfUrl) {
      console.log(`Pièce jointe PDF: ${pdfUrl}`);
      emailData.attachments = [
        {
          path: pdfUrl,
          filename: "Proposition_TechCatalan.pdf",
          content_type: "application/pdf",
        },
      ];
    }

    // Envoi via Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur Resend:", errorText);
      return new Response(
        JSON.stringify({ error: `Erreur envoi e-mail : ${response.status} - ${errorText}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const data = await response.json();
    console.log("Email envoyé avec succès:", data);

    return new Response(
      JSON.stringify({ success: true, message: "Email envoyé avec succès", data }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (err) {
    console.error("Erreur send-proposal-email:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Erreur inconnue" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
