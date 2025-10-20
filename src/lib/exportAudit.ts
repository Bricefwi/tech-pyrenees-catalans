import { supabase } from "@/integrations/supabase/client";
import { generateAuditPdf } from "@/lib/pdfExport";
import { saveToStorageAndReturnUrl } from "@/lib/utils";

export type ExportedAudit = {
  audit_id: string;
  title: string;
  created_at: string;
  status: string;
  company_name: string | null;
  client_name: string | null;
  client_email: string | null;
  generated_report: string | null;
  sectors: Array<{
    sector_id: string;
    sector_name: string;
    weighting: number | null;
    score: number | null;
    comments: string | null;
  }>;
  responses: Array<{
    question_id: string;
    sector_id: string;
    question: string;
    weighting: number | null;
    response: string | null;
    score: number | null;
  }>;
};

export async function fetchLatestAudit(): Promise<ExportedAudit | null> {
  const { data, error } = await supabase
    .from("v_export_audit")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) throw error;
  return (data?.[0] as ExportedAudit) ?? null;
}

export async function fetchAuditById(
  auditId: string
): Promise<ExportedAudit | null> {
  const { data, error } = await supabase
    .from("v_export_audit")
    .select("*")
    .eq("audit_id", auditId)
    .maybeSingle();
  if (error) throw error;
  return (data as ExportedAudit) ?? null;
}

export async function exportAuditToPdf(audit: ExportedAudit) {
  // 1) calculs utiles
  const sectorScores = audit.sectors
    .filter((s) => s.score !== null)
    .map((s) => ({ name: s.sector_name, score: Number(s.score) }));

  const globalScore =
    sectorScores.length > 0
      ? Math.round(
          (sectorScores.reduce((acc, s) => acc + s.score, 0) /
            sectorScores.length) *
            10
        ) / 10
      : 0;

  // 2) passerelle vers ton générateur PDF existant (html2pdf/jsPDF)
  const pdfBlob = await generateAuditPdf({
    brand: {
      logoUrl: "/logo-imotion.png",
      company: "IMOTION",
      tagline: "Intégrateur Apple & IA — Modernisation, automatisation, service managé.",
    },
    client: {
      name: audit.client_name ?? "",
      email: audit.client_email ?? "",
      company: audit.company_name ?? "",
    },
    audit: {
      id: audit.audit_id,
      title: audit.title,
      date: new Date(audit.created_at),
      globalScore,
      sectorScores,
      sectors: audit.sectors,
      responses: audit.responses,
    },
    hook: "Accélérez votre performance opérationnelle avec un socle Apple + IA robuste, simple et mesurable.",
  });

  // 3) stockage + URL
  const url = await saveToStorageAndReturnUrl(
    pdfBlob,
    `audits/${audit.audit_id}/rapport.pdf`
  );
  return { url, globalScore };
}
