import { useState } from "react";
import { fetchAuditById, fetchLatestAudit, exportAuditToPdf } from "@/lib/exportAudit";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

export function AuditExportActions({ auditId }: { auditId?: string }) {
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    try {
      const audit = auditId ? await fetchAuditById(auditId) : await fetchLatestAudit();
      if (!audit) {
        toast.error("Aucun audit trouvé");
        return;
      }
      const { url, globalScore } = await exportAuditToPdf(audit);
      setPdfUrl(url);
      toast.success(`Rapport généré avec succès (Score: ${globalScore}/100)`);
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'export PDF");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button onClick={run} disabled={loading} variant="outline">
        <Download className="mr-2 h-4 w-4" />
        {loading ? "Génération…" : "Exporter le rapport PDF"}
      </Button>
      {pdfUrl && (
        <a
          className="text-sm underline text-primary hover:text-primary/80"
          href={pdfUrl}
          target="_blank"
          rel="noreferrer"
        >
          Ouvrir le PDF
        </a>
      )}
    </div>
  );
}
