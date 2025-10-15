import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const EmailPreview = () => {
  const [sending, setSending] = useState(false);

  const confirmationEmail = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Tech catalan</h1>
            <p>Excellence en solutions digitales</p>
          </div>
          <div class="content">
            <h2>Bonjour M. Dupont,</h2>
            <p>Nous avons bien reçu votre demande concernant : <strong>Audit digital complet</strong></p>
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

  const quoteEmail = `
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
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Tech catalan</h1>
            <p>Votre devis personnalisé</p>
          </div>
          <div class="content">
            <h2>Bonjour M. Dupont,</h2>
            <p>Suite à votre demande, nous avons le plaisir de vous transmettre notre proposition commerciale.</p>
            <div class="quote-box">
              <h3>Détails du devis</h3>
              <p><strong>Service :</strong> Audit digital complet</p>
              <p><strong>Montant :</strong> 2 500,00 €</p>
              <p><strong>Valide jusqu'au :</strong> 31/12/2025</p>
              <p><strong>Référence :</strong> DEVIS-2025-001</p>
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

  const interventionEmail = `
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
            <h2>Bonjour M. Dupont,</h2>
            <p>Nous sommes heureux de vous proposer une date pour votre intervention.</p>
            <div class="date-box">
              <h3>📅 Date proposée</h3>
              <p style="font-size: 18px; color: #667eea; font-weight: bold;">
                Lundi 20 janvier 2025
              </p>
              <p style="font-size: 16px;">à 14:00</p>
              <p><strong>Durée estimée :</strong> 3 heures</p>
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
            <div style="background: white; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <p><strong>Rappel du devis :</strong> 2 500,00 €</p>
              <p><strong>Référence :</strong> DEVIS-2025-001</p>
            </div>
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

  const sendTestEmail = async (type: "confirmation" | "quote" | "intervention_date") => {
    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        toast.error("Vous devez être connecté pour tester l'envoi d'email");
        return;
      }

      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          type,
          to: user.email,
          clientName: "Client Test",
          serviceType: "Audit digital complet",
          requestTitle: "Audit digital complet",
          quoteAmount: 2500,
          quoteValidUntil: "2025-12-31",
          interventionDate: "2025-01-20T14:00:00",
          interventionDuration: "3 heures",
          quoteId: "DEVIS-2025-001"
        }
      });

      if (error) throw error;

      toast.success(`Email de test envoyé à ${user.email}`);
    } catch (error) {
      console.error("Error sending test email:", error);
      toast.error("Erreur lors de l'envoi de l'email de test");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-8">
      <div className="max-w-6xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl">Prévisualisation des emails Tech catalan</CardTitle>
            <p className="text-muted-foreground">
              Découvrez les trois types d'emails professionnels envoyés automatiquement
            </p>
          </CardHeader>
        </Card>

        <Tabs defaultValue="confirmation" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="confirmation">Confirmation de prise en charge</TabsTrigger>
            <TabsTrigger value="quote">Envoi du devis</TabsTrigger>
            <TabsTrigger value="intervention">Proposition de date</TabsTrigger>
          </TabsList>

          <TabsContent value="confirmation">
            <Card>
              <CardHeader>
                <CardTitle>Email de confirmation de prise en charge</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Envoyé automatiquement lorsqu'une demande de service est acceptée
                </p>
                <Button 
                  onClick={() => sendTestEmail("confirmation")} 
                  disabled={sending}
                  className="w-fit"
                >
                  {sending ? "Envoi..." : "Envoyer un email de test"}
                </Button>
              </CardHeader>
              <CardContent>
                <div 
                  className="border rounded-lg p-4 bg-white"
                  dangerouslySetInnerHTML={{ __html: confirmationEmail }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quote">
            <Card>
              <CardHeader>
                <CardTitle>Email d'envoi du devis</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Envoyé automatiquement lors de la création d'un devis
                </p>
                <Button 
                  onClick={() => sendTestEmail("quote")} 
                  disabled={sending}
                  className="w-fit"
                >
                  {sending ? "Envoi..." : "Envoyer un email de test"}
                </Button>
              </CardHeader>
              <CardContent>
                <div 
                  className="border rounded-lg p-4 bg-white"
                  dangerouslySetInnerHTML={{ __html: quoteEmail }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="intervention">
            <Card>
              <CardHeader>
                <CardTitle>Email de proposition de date d'intervention</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Envoyé automatiquement lors de la proposition d'une date d'intervention
                </p>
                <Button 
                  onClick={() => sendTestEmail("intervention_date")} 
                  disabled={sending}
                  className="w-fit"
                >
                  {sending ? "Envoi..." : "Envoyer un email de test"}
                </Button>
              </CardHeader>
              <CardContent>
                <div 
                  className="border rounded-lg p-4 bg-white"
                  dangerouslySetInnerHTML={{ __html: interventionEmail }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EmailPreview;
