import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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
    const { to, subject, html, pdfUrl, ccAdmins = [], relatedRequest, relatedProfile } = await req.json();

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
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

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

    let emailStatus = "sent";
    let errorDetails = null;

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
      emailStatus = "failed";
      errorDetails = `${response.status} - ${errorText}`;
    }

    const data = response.ok ? await response.json() : null;
    
    if (response.ok) {
      console.log("Email envoyé avec succès:", data);
    }

    // Enregistrement dans emails_logs via Supabase client
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      const { error: logError } = await supabase
        .from("emails_logs")
        .insert({
          recipient: to,
          subject,
          type: "proposal",
          related_request: relatedRequest || null,
          related_profile: relatedProfile || null,
          status: emailStatus,
          message: emailStatus === "sent" 
            ? "Proposition envoyée avec succès" 
            : "Échec d'envoi de la proposition",
          pdf_url: pdfUrl || null,
          cc_admins: ccAdmins,
          error_details: errorDetails,
        });

      if (logError) {
        console.error("Erreur lors de l'enregistrement du log:", logError);
      } else {
        console.log("Email log enregistré avec succès");
      }
    }

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Erreur envoi e-mail : ${errorDetails}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

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
