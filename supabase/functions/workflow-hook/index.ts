import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { kind, quote_id, intervention_id, audit_id } = body;
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Workflow hook triggered:", kind);

    // DEVIS VALIDÉ → CRÉER INTERVENTION
    if (kind === "onQuoteValidated" && quote_id) {
      const { data: quote, error: quoteError } = await supabase
        .from("quotes")
        .select(`
          *,
          profiles!quotes_client_id_fkey(full_name, email)
        `)
        .eq("id", quote_id)
        .single();

      if (quoteError || !quote) {
        throw new Error("Quote not found");
      }

      // Créer l'intervention
      const { data: intervention, error: interventionError } = await supabase
        .from("interventions")
        .insert({
          quote_id: quote.id,
          client_id: quote.client_id,
          company_id: quote.company_id,
          title: `Projet: ${quote.title}`,
          status: "En attente",
        })
        .select()
        .single();

      if (interventionError) {
        throw interventionError;
      }

      // Logger
      await supabase.from("workflow_logs").insert({
        entity_type: "quote",
        entity_id: quote_id,
        action: "QUOTE_VALIDATED",
        details: { intervention_id: intervention.id },
        performed_by: quote.client_id
      });

      // Email de confirmation
      try {
        await supabase.functions.invoke('send-proposal-email', {
          body: {
            to: quote.profiles?.email,
            subject: "Devis validé - Projet IMOTION en cours de planification",
            html: `
              <h2>Merci pour votre confiance !</h2>
              <p>Bonjour ${quote.profiles?.full_name || 'Client'},</p>
              <p>Votre devis pour <strong>${quote.title}</strong> a bien été validé.</p>
              <p>Notre équipe prend contact avec vous dans les plus brefs délais pour planifier l'intervention.</p>
              <p>Vous pouvez suivre l'avancement de votre projet depuis votre espace client.</p>
              <p>Cordialement,<br>L'équipe IMOTION</p>
            `,
            ccAdmins: ['ops@imotion.tech'],
            relatedRequest: quote.request_id,
            relatedProfile: quote.client_id
          }
        });
      } catch (emailError) {
        console.error("Email error (non-blocking):", emailError);
      }

      return new Response(
        JSON.stringify({ success: true, intervention_id: intervention.id }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      );
    }

    // DEVIS ENVOYÉ
    if (kind === "onQuoteSent" && quote_id) {
      const { data: quote } = await supabase
        .from("quotes")
        .select(`*, profiles!quotes_client_id_fkey(full_name, email)`)
        .eq("id", quote_id)
        .single();

      if (!quote) throw new Error("Quote not found");

      // Mettre à jour le statut
      await supabase.from("quotes").update({ 
        status: "En attente validation client",
        sent_at: new Date().toISOString()
      }).eq("id", quote_id);

      // Logger
      await supabase.from("workflow_logs").insert({
        entity_type: "quote",
        entity_id: quote_id,
        action: "QUOTE_SENT",
        details: { pdf_url: quote.pdf_url }
      });

      // Email
      try {
        await supabase.functions.invoke('send-proposal-email', {
          body: {
            to: quote.profiles?.email,
            subject: `Votre devis IMOTION - ${quote.title}`,
            html: `
              <h2>Votre devis personnalisé</h2>
              <p>Bonjour ${quote.profiles?.full_name || 'Client'},</p>
              <p>Nous avons le plaisir de vous transmettre notre devis pour <strong>${quote.title}</strong>.</p>
              ${quote.pdf_url ? `<p><a href="${quote.pdf_url}" style="background:#111;color:#fff;padding:12px 24px;border-radius:8px;display:inline-block;text-decoration:none;margin:20px 0;">Consulter le devis</a></p>` : ''}
              <p>Vous pouvez le valider directement depuis votre espace client IMOTION.</p>
              <p>Nous restons à votre disposition pour toute question.</p>
              <p>Cordialement,<br>L'équipe IMOTION</p>
            `,
            pdfUrl: quote.pdf_url,
            ccAdmins: ['ops@imotion.tech'],
            relatedRequest: quote.request_id,
            relatedProfile: quote.client_id
          }
        });
      } catch (emailError) {
        console.error("Email error (non-blocking):", emailError);
      }

      return new Response(
        JSON.stringify({ success: true }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      );
    }

    // INTERVENTION PLANIFIÉE
    if (kind === "onInterventionPlanned" && intervention_id) {
      const { data: intervention } = await supabase
        .from("interventions")
        .select(`
          *,
          profiles!interventions_client_id_fkey(full_name, email),
          profiles!interventions_technician_id_fkey(full_name)
        `)
        .eq("id", intervention_id)
        .single();

      if (!intervention) throw new Error("Intervention not found");

      await supabase.from("workflow_logs").insert({
        entity_type: "intervention",
        entity_id: intervention_id,
        action: "INTERVENTION_PLANNED",
        details: { 
          start_date: intervention.start_date,
          technician_id: intervention.technician_id
        }
      });

      // Email client
      try {
        await supabase.functions.invoke('send-proposal-email', {
          body: {
            to: intervention.profiles?.email,
            subject: "Votre projet IMOTION est planifié",
            html: `
              <h2>Planification de votre projet</h2>
              <p>Bonjour ${intervention.profiles?.full_name || 'Client'},</p>
              <p>Votre projet <strong>${intervention.title}</strong> est maintenant planifié.</p>
              ${intervention.start_date ? `<p>Date de début prévue : <strong>${new Date(intervention.start_date).toLocaleDateString('fr-FR')}</strong></p>` : ''}
              ${intervention.technician ? `<p>Technicien référent : ${intervention.technician.full_name}</p>` : ''}
              <p>Vous pouvez suivre l'avancement en temps réel depuis votre espace client.</p>
              <p>Cordialement,<br>L'équipe IMOTION</p>
            `,
            ccAdmins: ['ops@imotion.tech'],
            relatedProfile: intervention.client_id
          }
        });
      } catch (emailError) {
        console.error("Email error (non-blocking):", emailError);
      }

      return new Response(
        JSON.stringify({ success: true }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      );
    }

    // INTERVENTION TERMINÉE
    if (kind === "onInterventionCompleted" && intervention_id) {
      const { data: intervention } = await supabase
        .from("interventions")
        .select(`*, profiles!interventions_client_id_fkey(full_name, email)`)
        .eq("id", intervention_id)
        .single();

      if (!intervention) throw new Error("Intervention not found");

      await supabase.from("interventions").update({
        status: "Terminée",
        end_date: new Date().toISOString()
      }).eq("id", intervention_id);

      // Créer un suivi automatique
      await supabase.from("followups").insert({
        client_id: intervention.client_id,
        project_id: intervention_id,
        type: "onboarding",
        notes: "Suivi post-projet automatique créé",
        next_action: "Appel de satisfaction client",
        next_action_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });

      await supabase.from("workflow_logs").insert({
        entity_type: "intervention",
        entity_id: intervention_id,
        action: "INTERVENTION_COMPLETED",
        details: { report_url: intervention.report_pdf_url }
      });

      return new Response(
        JSON.stringify({ success: true }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown workflow kind" }), 
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );

  } catch (error) {
    console.error("Error in workflow-hook:", error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );
  }
});
