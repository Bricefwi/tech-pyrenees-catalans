import { supabase } from "@/integrations/supabase/client";

/**
 * Envoie un email de proposition avec PDF en pièce jointe
 * et copie automatique aux administrateurs
 */
export async function sendProposalEmail({
  to,
  subject,
  html,
  pdfUrl,
}: {
  to: string;
  subject: string;
  html: string;
  pdfUrl?: string;
}) {
  // Liste des emails administrateurs en CC
  const adminEmails = [
    "admin@techcatalan.fr",
    "contact@techcatalan.fr",
  ];

  const { data, error } = await supabase.functions.invoke('send-proposal-email', {
    body: {
      to,
      subject,
      html,
      pdfUrl,
      ccAdmins: adminEmails,
    }
  });

  if (error) {
    console.error("Erreur envoi email:", error);
    throw new Error(error.message || "Erreur d'envoi d'e-mail");
  }

  return data;
}
