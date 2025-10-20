import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestResults {
  date: string;
  clients: number;
  scenarios: number;
  scores: {
    authentification: number;
    crm_gestion: number;
    gestion_projet: number;
    communication: number;
    interface: number;
    performance: number;
    securite: number;
  };
  total: number;
  status: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { results }: { results: TestResults } = await req.json();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #333; }
          .header { background: #DC2626; color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .score-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
          .score-item { border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; }
          .score-bar { background: #e5e7eb; height: 8px; border-radius: 4px; margin-top: 10px; }
          .score-fill { background: #DC2626; height: 100%; border-radius: 4px; }
          .total-score { font-size: 48px; font-weight: bold; color: #DC2626; text-align: center; margin: 30px 0; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>IMOTION</h1>
          <p>Expert Apple & IA – Innovation Catalane</p>
          <h2>Rapport de Pré-Réception</h2>
        </div>
        
        <div class="content">
          <p><strong>Date :</strong> ${new Date(results.date).toLocaleDateString('fr-FR')}</p>
          <p><strong>Statut :</strong> ${results.status}</p>
          
          <h3>Synthèse</h3>
          <ul>
            <li>Clients testés : ${results.clients}</li>
            <li>Scénarios exécutés : ${results.scenarios}</li>
          </ul>

          <div class="total-score">${results.total}/100</div>

          <h3>Détail des Scores par Catégorie</h3>
          <div class="score-grid">
            ${Object.entries(results.scores).map(([key, value]) => `
              <div class="score-item">
                <strong>${key.replace('_', ' & ').toUpperCase()}</strong>
                <div>${value}/100</div>
                <div class="score-bar">
                  <div class="score-fill" style="width: ${value}%"></div>
                </div>
              </div>
            `).join('')}
          </div>

          <h3>Conclusion</h3>
          <p>${results.total >= 85 
            ? '✅ Le projet IMOTION est validé pour la mise en production.' 
            : '⚠️ Des améliorations sont recommandées avant la mise en production.'
          }</p>

          <h3>Prochaines Étapes</h3>
          <ol>
            <li>Validation finale par l'équipe technique</li>
            <li>Vérification des configurations de production</li>
            <li>Déploiement sur domaine définitif</li>
            <li>Tests de charge et performance</li>
          </ol>
        </div>

        <div class="footer">
          <p>Pré-réception validée IMOTION – Octobre 2025</p>
          <p>www.imotion.tech • contact@imotion.tech</p>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "IMOTION Pré-Réception <onboarding@resend.dev>",
      to: ["admin@imotion.tech"],
      subject: `✅ Rapport Pré-Réception IMOTION - Score: ${results.total}/100`,
      html: htmlContent,
    });

    console.log("Email rapport envoyé:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Erreur génération rapport:", error);
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
