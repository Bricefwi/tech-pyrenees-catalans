import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Loader2, FileText, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ClientQuotes() {
  const [userId, setUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        navigate("/auth");
      } else {
        setUserId(user.id);
      }
    });
  }, [navigate]);

  const { data: quotes, isLoading } = useQuery({
    queryKey: ["client-quotes", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (!profile) return [];

      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .eq("client_id", profile.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const validateQuoteMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      // Mettre à jour le statut du devis
      const { error: updateError } = await supabase
        .from("quotes")
        .update({ 
          status: "Validé",
          accepted_at: new Date().toISOString()
        })
        .eq("id", quoteId);

      if (updateError) throw updateError;

      // Déclencher le workflow de validation
      const { error: workflowError } = await supabase.functions.invoke('workflow-hook', {
        body: { kind: "onQuoteValidated", quote_id: quoteId }
      });

      if (workflowError) throw workflowError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-quotes"] });
      toast({
        title: "Devis validé",
        description: "Votre projet va être planifié par notre équipe",
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

  const rejectQuoteMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      const { error } = await supabase
        .from("quotes")
        .update({ 
          status: "Refusé",
          rejected_at: new Date().toISOString()
        })
        .eq("id", quoteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-quotes"] });
      toast({ title: "Devis refusé" });
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
      <h1 className="text-3xl font-bold mb-6">Mes Devis</h1>

      <div className="grid gap-4">
        {quotes?.map((quote: any) => (
          <div key={quote.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">{quote.title || "Devis IMOTION"}</h3>
                <p className="text-sm text-text-muted">
                  {quote.quote_number || `Réf: ${quote.id.substring(0, 8)}`}
                </p>
              </div>
              {getStatusBadge(quote.status)}
            </div>

            {quote.description && (
              <p className="text-sm text-text-muted mb-4">{quote.description}</p>
            )}

            <div className="bg-surface rounded-lg p-4 mb-4">
              <div className="text-2xl font-bold">
                {(quote.amount_ttc || quote.amount || 0).toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR'
                })}
              </div>
              <div className="text-xs text-text-muted mt-1">
                TTC • HT: {(quote.amount_ht || quote.amount || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {quote.pdf_url && (
                <a href={quote.pdf_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="gap-1">
                    <FileText className="h-4 w-4" />
                    Télécharger le PDF
                  </Button>
                </a>
              )}

              {quote.status === "En attente validation client" && (
                <>
                  <Button
                    onClick={() => validateQuoteMutation.mutate(quote.id)}
                    disabled={validateQuoteMutation.isPending}
                    className="gap-1"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Valider le devis
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => rejectQuoteMutation.mutate(quote.id)}
                    disabled={rejectQuoteMutation.isPending}
                    className="gap-1"
                  >
                    <XCircle className="h-4 w-4" />
                    Refuser
                  </Button>
                </>
              )}
            </div>

            <div className="text-xs text-text-muted mt-4">
              Créé le {new Date(quote.created_at).toLocaleDateString('fr-FR')}
            </div>
          </div>
        ))}

        {(!quotes || quotes.length === 0) && (
          <div className="text-center py-12 text-text-muted bg-white rounded-lg">
            Aucun devis pour le moment
          </div>
        )}
      </div>
    </div>
  );
}
