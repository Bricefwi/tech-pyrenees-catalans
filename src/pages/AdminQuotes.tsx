import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Loader2, FileText, Send, CheckCircle, XCircle } from "lucide-react";

export default function AdminQuotes() {
  const queryClient = useQueryClient();

  const { data: quotes, isLoading } = useQuery({
    queryKey: ["admin-quotes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select(`
          *,
          profiles!quotes_client_id_fkey(full_name, email),
          companies(name)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const generatePdfMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      const { data, error } = await supabase.functions.invoke('generate-quote-pdf', {
        body: { quote_id: quoteId }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quotes"] });
      toast({ title: "PDF généré avec succès" });
    },
    onError: (error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const sendQuoteMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      const { data, error } = await supabase.functions.invoke('workflow-hook', {
        body: { kind: "onQuoteSent", quote_id: quoteId }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quotes"] });
      toast({ title: "Devis envoyé au client" });
    },
    onError: (error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ quoteId, status }: { quoteId: string; status: string }) => {
      const { error } = await supabase
        .from("quotes")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", quoteId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quotes"] });
      toast({ title: "Statut mis à jour" });
    },
    onError: (error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "En attente validation client": "secondary",
      "Validé": "default",
      "Refusé": "destructive",
      "Négociation": "outline",
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
        <h1 className="text-3xl font-bold">Devis</h1>
        <Link to="/admin">
          <Button variant="outline">Retour Admin</Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-surface border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Numéro</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Titre</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Client</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Montant</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Statut</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">PDF</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {quotes?.map((quote: any) => (
              <tr key={quote.id} className="hover:bg-surface/50">
                <td className="px-6 py-4 font-mono text-sm">
                  {quote.quote_number || quote.id.substring(0, 8)}
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium">{quote.title || "Sans titre"}</div>
                  {quote.description && (
                    <div className="text-sm text-text-muted mt-1 truncate max-w-md">{quote.description}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div>{quote.profiles?.full_name || "—"}</div>
                  {quote.companies?.name && (
                    <div className="text-sm text-text-muted">{quote.companies.name}</div>
                  )}
                </td>
                <td className="px-6 py-4 font-semibold">
                  {(quote.amount_ttc || quote.amount || 0).toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'EUR'
                  })}
                </td>
                <td className="px-6 py-4">{getStatusBadge(quote.status)}</td>
                <td className="px-6 py-4">
                  {quote.pdf_url ? (
                    <a
                      href={quote.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <FileText className="h-4 w-4" />
                      Ouvrir
                    </a>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generatePdfMutation.mutate(quote.id)}
                      disabled={generatePdfMutation.isPending}
                    >
                      Générer PDF
                    </Button>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {quote.status === "En attente" && quote.pdf_url && (
                      <Button
                        size="sm"
                        onClick={() => sendQuoteMutation.mutate(quote.id)}
                        disabled={sendQuoteMutation.isPending}
                        className="gap-1"
                      >
                        <Send className="h-4 w-4" />
                        Envoyer
                      </Button>
                    )}
                    {quote.status === "En attente validation client" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({ quoteId: quote.id, status: "Validé" })}
                          className="gap-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Valider
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateStatusMutation.mutate({ quoteId: quote.id, status: "Refusé" })}
                          className="gap-1"
                        >
                          <XCircle className="h-4 w-4" />
                          Refuser
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!quotes || quotes.length === 0) && (
          <div className="text-center py-12 text-text-muted">
            Aucun devis pour le moment
          </div>
        )}
      </div>
    </div>
  );
}
