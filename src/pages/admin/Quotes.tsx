import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CRMNav from "@/components/admin/CRMNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Receipt, Calendar, Euro, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const Quotes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  const checkAdminAndLoadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        navigate("/");
        return;
      }

      await loadQuotes();
    } catch (error) {
      navigate("/auth");
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuotes = async () => {
    const { data, error } = await supabase
      .from("quotes")
      .select(`
        *,
        service_requests (
          title,
          service_type,
          profiles:client_user_id (
            full_name,
            companies (name, is_individual)
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les devis",
        variant: "destructive",
      });
      return;
    }

    setQuotes(data || []);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: any; variant: any; label: string }> = {
      pending: { icon: AlertCircle, variant: "secondary", label: "En attente" },
      accepted: { icon: CheckCircle, variant: "default", label: "Accepté" },
      rejected: { icon: XCircle, variant: "destructive", label: "Refusé" },
    };
    
    const { icon: Icon, variant, label } = config[status] || config.pending;
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <CRMNav />
      
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Devis</h1>
            <div className="flex gap-2">
              <Badge variant="outline">{quotes.filter(q => q.status === 'pending').length} en attente</Badge>
              <Badge variant="default">{quotes.filter(q => q.status === 'accepted').length} acceptés</Badge>
            </div>
          </div>

          <div className="space-y-4">
            {quotes.map((quote) => (
              <Card key={quote.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        <CardTitle className="text-lg font-mono">{quote.quote_number}</CardTitle>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {quote.service_requests?.profiles?.companies?.name || "Client inconnu"}
                        {quote.service_requests?.profiles?.companies?.is_individual && " (Particulier)"}
                      </p>
                      <p className="text-sm font-medium">{quote.service_requests?.title}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(quote.status)}
                      <div className="flex items-center gap-1 text-lg font-bold">
                        <Euro className="h-5 w-5" />
                        {quote.amount}€
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">{quote.description}</p>
                  
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    {quote.sent_at && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Envoyé le {format(new Date(quote.sent_at), "d MMM yyyy", { locale: fr })}
                      </div>
                    )}
                    {quote.valid_until && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Valide jusqu'au {format(new Date(quote.valid_until), "d MMM yyyy", { locale: fr })}
                      </div>
                    )}
                  </div>

                  {quote.accepted_at && (
                    <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg text-sm">
                      ✓ Accepté le {format(new Date(quote.accepted_at), "d MMMM yyyy à HH:mm", { locale: fr })}
                    </div>
                  )}

                  {quote.rejected_at && (
                    <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-lg text-sm">
                      ✗ Refusé le {format(new Date(quote.rejected_at), "d MMMM yyyy à HH:mm", { locale: fr })}
                      {quote.rejection_reason && <p className="mt-1">Raison: {quote.rejection_reason}</p>}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate(`/admin/quote/${quote.service_request_id}`)}
                    >
                      Voir détails
                    </Button>
                    {quote.status === 'pending' && (
                      <Button size="sm" variant="ghost">
                        Relancer
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {quotes.length === 0 && (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun devis créé</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quotes;
