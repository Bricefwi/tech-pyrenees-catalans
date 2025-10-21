import { supabase } from "@/integrations/supabase/client";

/**
 * Generate or retrieve an audit report
 * @param auditId - The audit ID
 * @param force - Force regeneration even if report exists
 * @returns The generated HTML report
 */
export async function generateAuditReport(
  auditId: string,
  force = false
): Promise<{ html: string; error?: string }> {
  try {
    const baseUrl = import.meta.env.VITE_SUPABASE_URL!.replace(/\/$/, "");
    const functionUrl = `${baseUrl}/functions/v1/generate-audit-report`;
    
    const url = new URL(functionUrl);
    url.searchParams.set("audit_id", auditId);
    if (force) {
      url.searchParams.set("force", "1");
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    return { html };
  } catch (error: any) {
    console.error("[generateAuditReport] Error:", error);
    return {
      html: "",
      error: error.message || "Erreur lors de la génération du rapport",
    };
  }
}

/**
 * Open audit report in a new window
 * @param auditId - The audit ID
 * @param force - Force regeneration
 */
export function openAuditReport(auditId: string, force = false) {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL!.replace(/\/$/, "");
  const functionUrl = `${baseUrl}/functions/v1/generate-audit-report`;
  const url = `${functionUrl}?audit_id=${auditId}${force ? "&force=1" : ""}`;
  window.open(url, "_blank");
}

/**
 * Send audit report by email
 * @param auditId - The audit ID
 */
export async function sendAuditReportEmail(
  auditId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // First get audit details
    const { data: audit } = await supabase
      .from("audits")
      .select(`
        id,
        global_score,
        company_id,
        created_by,
        companies(name),
        profiles!audits_created_by_fkey(full_name, email)
      `)
      .eq("id", auditId)
      .single();

    if (!audit) {
      throw new Error("Audit non trouvé");
    }

    const recipientEmail = (audit.profiles as any)?.email;
    if (!recipientEmail) {
      throw new Error("Email du client non trouvé");
    }

    // First generate/get the report
    const { html, error: reportError } = await generateAuditReport(auditId);
    if (reportError) {
      throw new Error(reportError);
    }

    // Get client name
    const clientName = (audit.profiles as any)?.full_name || "Client";
    const companyName = (audit.companies as any)?.name || "—";

    // Send email using send-email function
    const { error: emailError } = await supabase.functions.invoke("send-email", {
      body: {
        to: recipientEmail,
        subject: `Votre rapport d'audit IMOTION est prêt`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #E11932;">Bonjour ${clientName},</h2>
            <p>Votre rapport d'audit de maturité numérique est disponible.</p>
            <p><strong>Score global pondéré :</strong> ${audit.global_score ? `${audit.global_score.toFixed(1)}%` : "—"}</p>
            <div style="margin: 30px 0;">
              <a href="${window.location.origin}/admin/audits" 
                 style="background: #E11932; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Consulter le rapport complet
              </a>
            </div>
            <p>Nous proposons un atelier de cadrage (2h) pour valider les priorités et caler le planning.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #6B7280; font-size: 14px;">— L'équipe IMOTION</p>
          </div>
        `,
        bcc: ["ops@imotion.tech"],
      },
    });

    if (emailError) {
      throw emailError;
    }

    return { success: true };
  } catch (error: any) {
    console.error("[sendAuditReportEmail] Error:", error);
    return {
      success: false,
      error: error.message || "Erreur lors de l'envoi de l'email",
    };
  }
}
