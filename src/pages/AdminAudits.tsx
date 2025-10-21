import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Loader2, FileText, Sparkles, Plus, Eye, RefreshCw, Send } from "lucide-react";
import { openAuditReport, sendAuditReportEmail } from "@/lib/auditReport";

export default function AdminAudits() {
  const queryClient = useQueryClient();

  const { data: audits, isLoading } = useQuery({
    queryKey: ["admin-audits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audits")
        .select(`
          *,
          profiles!audits_created_by_fkey(full_name, email),
          companies(name)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (auditId: string) => {
      await sendAuditReportEmail(auditId);
    },
    onSuccess: () => {
      toast({
        title: "Email envoyé",
        description: "Le rapport a été envoyé au client avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "En attente IA": "secondary",
      "Prêt": "default",
      "Validé admin": "default",
      "Rejeté": "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Audits</h1>
        <Link to="/admin">
          <Button variant="outline">Retour Admin</Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-surface border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Titre</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Client</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Statut</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Rapport</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {audits?.map((audit: any) => (
              <tr key={audit.id} className="hover:bg-surface/50">
                <td className="px-6 py-4">
                  <div className="font-medium">{audit.title || audit.service_requests?.title || "Sans titre"}</div>
                  {audit.scope && (
                    <div className="text-sm text-text-muted mt-1 truncate max-w-md">{audit.scope}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div>{audit.profiles?.full_name || "—"}</div>
                  {audit.companies?.name && (
                    <div className="text-sm text-text-muted">{audit.companies.name}</div>
                  )}
                </td>
                <td className="px-6 py-4">{getStatusBadge(audit.status)}</td>
                <td className="px-6 py-4 text-sm text-text-muted">
                  {new Date(audit.created_at).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4">
                  {audit.report_pdf_url ? (
                    <a
                      href={audit.report_pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <FileText className="h-4 w-4" />
                      Ouvrir
                    </a>
                  ) : (
                    <span className="text-text-muted">—</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {audit.generated_report ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openAuditReport(audit.id)}
                          className="gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          Voir
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openAuditReport(audit.id, true)}
                          className="gap-1"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Regénérer
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => sendEmailMutation.mutate(audit.id)}
                          disabled={sendEmailMutation.isPending}
                          className="gap-1"
                        >
                          {sendEmailMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                          Envoyer
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => openAuditReport(audit.id)}
                        className="gap-1"
                      >
                        <Sparkles className="h-4 w-4" />
                        Générer rapport
                      </Button>
                    )}
                    <Link to={`/admin/quotes/new?audit=${audit.id}`}>
                      <Button size="sm" variant="outline" className="gap-1">
                        <Plus className="h-4 w-4" />
                        Devis
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!audits || audits.length === 0) && (
          <div className="text-center py-12 text-text-muted">
            Aucun audit pour le moment
          </div>
        )}
      </div>
    </div>
  );
}
