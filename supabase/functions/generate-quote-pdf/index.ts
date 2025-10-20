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
    const { quote_id } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Récupérer le devis avec toutes les infos
    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select(`
        *,
        profiles!quotes_client_id_fkey(full_name, email, phone, street_address, postal_code, city),
        companies(name, siret_siren, street_address, postal_code, city)
      `)
      .eq("id", quote_id)
      .single();

    if (quoteError || !quote) {
      console.error("Quote not found:", quoteError);
      return new Response(JSON.stringify({ error: "Quote not found" }), { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const amountHT = quote.amount_ht || quote.amount || 0;
    const amountTTC = quote.amount_ttc || (amountHT * 1.2);
    const tva = amountTTC - amountHT;

    // Générer le HTML du devis
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Devis IMOTION - ${quote.quote_number || quote_id}</title>
  <style>
    body { font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; color: #111; background: #F7F7F8; margin: 0; padding: 20px; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { display: flex; justify-content: space-between; align-items: start; border-bottom: 3px solid #D91E18; padding-bottom: 20px; margin-bottom: 30px; }
    .header .logo { font-size: 24px; font-weight: bold; color: #D91E18; }
    .header .quote-number { text-align: right; color: #666; }
    .header .quote-number .number { font-size: 20px; font-weight: bold; color: #111; }
    .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
    .party h3 { margin: 0 0 10px 0; font-size: 14px; color: #D91E18; text-transform: uppercase; }
    .party p { margin: 4px 0; font-size: 14px; line-height: 1.6; }
    .details { margin: 30px 0; }
    .details h2 { color: #111; margin-bottom: 15px; font-size: 18px; }
    .details-content { background: #F7F7F8; padding: 20px; border-radius: 8px; line-height: 1.8; }
    .pricing { margin: 30px 0; }
    .pricing-table { width: 100%; border-collapse: collapse; }
    .pricing-table th { background: #F7F7F8; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #E5E7EB; }
    .pricing-table td { padding: 12px; border-bottom: 1px solid #E5E7EB; }
    .pricing-table .total-row { font-weight: bold; font-size: 18px; background: #F7F7F8; }
    .conditions { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; }
    .conditions h3 { font-size: 14px; margin-bottom: 10px; }
    .conditions ul { font-size: 12px; color: #666; line-height: 1.8; margin: 0; padding-left: 20px; }
    .cta { margin: 30px 0; padding: 20px; background: #F7F7F8; border-radius: 8px; text-align: center; }
    .cta p { margin: 0 0 15px 0; font-size: 16px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <div class="logo">IMOTION</div>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">Intégrateur Apple & IA</p>
      </div>
      <div class="quote-number">
        <div style="font-size: 12px; color: #666;">DEVIS</div>
        <div class="number">${quote.quote_number || 'DEV-' + quote_id.substring(0, 8)}</div>
        <div style="font-size: 12px; color: #666; margin-top: 5px;">
          Date: ${new Date(quote.created_at).toLocaleDateString('fr-FR')}
        </div>
        ${quote.valid_until ? `<div style="font-size: 12px; color: #666;">Valable jusqu'au: ${new Date(quote.valid_until).toLocaleDateString('fr-FR')}</div>` : ''}
      </div>
    </div>

    <div class="parties">
      <div class="party">
        <h3>Prestataire</h3>
        <p><strong>IMOTION</strong></p>
        <p>Intégrateur Apple & Solutions IA</p>
        <p>Email: contact@imotion.tech</p>
        <p>Web: imotion.tech</p>
      </div>
      <div class="party">
        <h3>Client</h3>
        <p><strong>${quote.profiles?.full_name || 'Client'}</strong></p>
        ${quote.companies?.name ? `<p>${quote.companies.name}</p>` : ''}
        ${quote.companies?.siret_siren ? `<p>SIRET: ${quote.companies.siret_siren}</p>` : ''}
        ${quote.profiles?.street_address || quote.companies?.street_address ? `<p>${quote.profiles?.street_address || quote.companies?.street_address}</p>` : ''}
        ${quote.profiles?.postal_code || quote.companies?.postal_code ? `<p>${quote.profiles?.postal_code || quote.companies?.postal_code} ${quote.profiles?.city || quote.companies?.city || ''}</p>` : ''}
        ${quote.profiles?.email ? `<p>Email: ${quote.profiles.email}</p>` : ''}
        ${quote.profiles?.phone ? `<p>Tél: ${quote.profiles.phone}</p>` : ''}
      </div>
    </div>

    <div class="details">
      <h2>${quote.title || 'Projet IMOTION'}</h2>
      <div class="details-content">
        ${quote.description || 'Projet de transformation digitale avec solutions Apple et IA.'}
      </div>
    </div>

    <div class="pricing">
      <table class="pricing-table">
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align: right; width: 150px;">Montant</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${quote.title || 'Prestation IMOTION'}</td>
            <td style="text-align: right;">${amountHT.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € HT</td>
          </tr>
          <tr>
            <td>TVA (20%)</td>
            <td style="text-align: right;">${tva.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
          </tr>
          <tr class="total-row">
            <td>TOTAL TTC</td>
            <td style="text-align: right;">${amountTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="conditions">
      <h3>Conditions générales</h3>
      <ul>
        <li>Devis valable ${quote.valid_until ? `jusqu'au ${new Date(quote.valid_until).toLocaleDateString('fr-FR')}` : '30 jours'}</li>
        <li>Paiement : 30% à la commande, 40% à mi-parcours, 30% à la livraison</li>
        <li>Délai d'intervention : à définir selon planning</li>
        <li>Garantie et support : inclus selon modalités du contrat</li>
      </ul>
    </div>

    <div class="cta">
      <p>Pour valider ce devis, connectez-vous à votre espace client IMOTION</p>
      <p style="font-size: 14px; color: #666;">ou contactez-nous au contact@imotion.tech</p>
    </div>

    <div class="footer">
      © ${new Date().getFullYear()} IMOTION · Intégrateur Apple & IA · contact@imotion.tech
    </div>
  </div>
</body>
</html>
    `;

    // Uploader le PDF dans le storage
    const fileName = `quote-${quote.quote_number || quote_id}-${Date.now()}.html`;
    const { error: uploadError } = await supabase.storage
      .from("audit-reports")
      .upload(fileName, new Blob([html], { type: "text/html" }), { 
        upsert: true,
        contentType: "text/html"
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    // Obtenir l'URL publique
    const { data: urlData } = supabase.storage
      .from("audit-reports")
      .getPublicUrl(fileName);

    const pdfUrl = urlData.publicUrl;

    // Mettre à jour le devis
    const { error: updateError } = await supabase
      .from("quotes")
      .update({ 
        pdf_url: pdfUrl,
        updated_at: new Date().toISOString()
      })
      .eq("id", quote_id);

    if (updateError) {
      console.error("Update error:", updateError);
      throw updateError;
    }

    // Logger l'action
    await supabase.from("workflow_logs").insert({
      entity_type: "quote",
      entity_id: quote_id,
      action: "QUOTE_PDF_GENERATED",
      details: { pdf_url: pdfUrl },
      performed_by: quote.client_id
    });

    console.log("Quote PDF generated successfully:", pdfUrl);

    return new Response(
      JSON.stringify({ 
        success: true, 
        pdf_url: pdfUrl,
        quote_id: quote_id
      }), 
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (err) {
    const error = err as Error;
    console.error("Error in generate-quote-pdf:", error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
