import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: "confirmation" | "quote" | "intervention_date";
  to: string;
  clientName: string;
  serviceType?: string;
  requestTitle?: string;
  quoteAmount?: number;
  quoteValidUntil?: string;
  interventionDate?: string;
  interventionDuration?: string;
  quoteId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const emailData: EmailRequest = await req.json();
    const { type, to, clientName } = emailData;

    let subject = "";
    let html = "";

    // Email de confirmation de prise en charge
    if (type === "confirmation") {
      subject = "Tech catalan - Confirmation de prise en charge de votre demande";
      html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Tech catalan</h1>
                <p>Excellence en solutions digitales</p>
              </div>
              <div class="content">
                <h2>Bonjour ${clientName},</h2>
                <p>Nous avons bien reçu votre demande concernant : <strong>${emailData.requestTitle || emailData.serviceType}</strong></p>
                <p>Votre demande a été prise en charge par nos équipes. Nous étudions actuellement vos besoins et vous transmettrons un devis détaillé dans les plus brefs délais.</p>
                <p><strong>Prochaines étapes :</strong></p>
                <ul>
                  <li>Analyse de vos besoins par nos experts</li>
                  <li>Élaboration d'un devis personnalisé</li>
                  <li>Proposition de date d'intervention</li>
                </ul>
                <p>Notre équipe reste à votre disposition pour toute question.</p>
                <p>Cordialement,<br><strong>L'équipe Tech catalan</strong></p>
              </div>
              <div class="footer">
                <p>Tech catalan - Solutions digitales & consulting IT</p>
                <p>Pour toute question : contact@techcatalan.fr</p>
              </div>
            </div>
          </body>
        </html>
      `;
    }

    // Email d'envoi de devis
    else if (type === "quote") {
      subject = "Tech catalan - Votre devis personnalisé";
      html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .quote-box { background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Tech catalan</h1>
                <p>Votre devis personnalisé</p>
              </div>
              <div class="content">
                <h2>Bonjour ${clientName},</h2>
                <p>Suite à votre demande, nous avons le plaisir de vous transmettre notre proposition commerciale.</p>
                <div class="quote-box">
                  <h3>Détails du devis</h3>
                  <p><strong>Service :</strong> ${emailData.serviceType || emailData.requestTitle}</p>
                  <p><strong>Montant :</strong> ${emailData.quoteAmount ? `${emailData.quoteAmount.toFixed(2)} €` : 'Sur mesure'}</p>
                  ${emailData.quoteValidUntil ? `<p><strong>Valide jusqu'au :</strong> ${new Date(emailData.quoteValidUntil).toLocaleDateString('fr-FR')}</p>` : ''}
                  ${emailData.quoteId ? `<p><strong>Référence :</strong> ${emailData.quoteId}</p>` : ''}
                </div>
                <p>Ce devis a été élaboré sur mesure pour répondre précisément à vos besoins. Il comprend tous les services nécessaires pour mener à bien votre projet.</p>
                <p><strong>Pour accepter ce devis ou poser des questions :</strong></p>
                <ul>
                  <li>📧 Répondez directement à cet email</li>
                  <li>📱 Contactez-nous par WhatsApp</li>
                  <li>📞 Appelez-nous au numéro indiqué</li>
                </ul>
                <p>Nous restons à votre entière disposition pour tout complément d'information.</p>
                <p>Cordialement,<br><strong>L'équipe Tech catalan</strong></p>
              </div>
              <div class="footer">
                <p>Tech catalan - Solutions digitales & consulting IT</p>
                <p>contact@techcatalan.fr</p>
              </div>
            </div>
          </body>
        </html>
      `;
    }

    // Email de proposition de date d'intervention
    else if (type === "intervention_date") {
      subject = "Tech catalan - Proposition de date d'intervention";
      html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .date-box { background: white; border: 2px solid #667eea; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px; }
              .alert-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Tech catalan</h1>
                <p>Planification de votre intervention</p>
              </div>
              <div class="content">
                <h2>Bonjour ${clientName},</h2>
                <p>Nous sommes heureux de vous proposer une date pour votre intervention.</p>
                <div class="date-box">
                  <h3>📅 Date proposée</h3>
                  <p style="font-size: 18px; color: #667eea; font-weight: bold;">
                    ${emailData.interventionDate ? new Date(emailData.interventionDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'À définir'}
                  </p>
                  ${emailData.interventionDate ? `<p style="font-size: 16px;">à ${new Date(emailData.interventionDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>` : ''}
                  ${emailData.interventionDuration ? `<p><strong>Durée estimée :</strong> ${emailData.interventionDuration}</p>` : ''}
                </div>
                <div class="alert-box">
                  <p><strong>⚠️ Important - Merci de confirmer votre disponibilité</strong></p>
                  <p>Si cette date ne vous convient pas, veuillez nous en informer au plus vite par :</p>
                  <ul style="margin: 10px 0;">
                    <li>📧 Retour d'email</li>
                    <li>📱 WhatsApp</li>
                    <li>📞 Téléphone</li>
                  </ul>
                </div>
                ${emailData.quoteAmount ? `
                <div style="background: white; padding: 15px; margin: 20px 0; border-radius: 5px;">
                  <p><strong>Rappel du devis :</strong> ${emailData.quoteAmount.toFixed(2)} €</p>
                  ${emailData.quoteId ? `<p><strong>Référence :</strong> ${emailData.quoteId}</p>` : ''}
                </div>
                ` : ''}
                <p>Nous vous rappelons que notre équipe d'experts interviendra avec tout le matériel nécessaire pour assurer une prestation de qualité.</p>
                <p>À très bientôt,<br><strong>L'équipe Tech catalan</strong></p>
              </div>
              <div class="footer">
                <p>Tech catalan - Solutions digitales & consulting IT</p>
                <p>contact@techcatalan.fr</p>
              </div>
            </div>
          </body>
        </html>
      `;
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: 'Tech catalan <onboarding@resend.dev>',
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Resend error:", error);
      throw new Error(error);
    }

    console.log(`Email ${type} sent successfully to ${to}`);

    return new Response(
      JSON.stringify({ success: true, message: "Email envoyé avec succès" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
