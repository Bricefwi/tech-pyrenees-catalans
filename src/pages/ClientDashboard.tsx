import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, MessageSquare, FileText, Calendar, Plus, Home } from "lucide-react";
import Header from "@/components/Header";

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [audits, setAudits] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
    loadServiceRequests();
    loadAudits();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      setUser(user);
    } catch (error) {
      navigate("/auth");
    } finally {
      setIsLoading(false);
    }
  };

  const loadServiceRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("service_requests")
        .select(`
          *,
          quotes (*),
          intervention_dates (*)
        `)
        .eq("client_user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setServiceRequests(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadAudits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("audits")
        .select(`
          *,
          audited_companies(name)
        `)
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAudits(data || []);
    } catch (error: any) {
      console.error("Error loading audits:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      in_progress: "default",
      completed: "outline",
    };
    const labels: Record<string, string> = {
      pending: "En attente",
      in_progress: "En cours",
      completed: "Terminé",
    };
    return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="p-6 pt-24">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Tableau de Bord Client</h1>
            <div className="flex gap-2">
              <Button onClick={() => navigate("/")}>
                <Home className="mr-2 h-4 w-4" />
                Accueil
              </Button>
              <Button onClick={() => navigate("/audit")}>
                <FileText className="mr-2 h-4 w-4" />
                Nouvel Audit
              </Button>
              <Button onClick={() => navigate("/create-request")}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle demande
              </Button>
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </div>

          {/* Audits Section */}
          <Card>
            <CardHeader>
              <CardTitle>Mes Audits Numériques</CardTitle>
            </CardHeader>
            <CardContent>
              {audits.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Aucun audit réalisé</p>
                  <Button onClick={() => navigate("/audit")}>
                    <FileText className="mr-2 h-4 w-4" />
                    Démarrer un Audit
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {audits.map((audit) => (
                    <div key={audit.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">
                          {audit.audited_companies?.name || "Entreprise"}
                        </h3>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={audit.status === "completed" ? "default" : "secondary"}>
                            {audit.status === "completed" ? "Complété" : "En cours"}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(audit.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        {audit.global_score && (
                          <div className="mt-2">
                            <span className="text-sm font-medium">Score global: </span>
                            <span className="text-xl font-bold text-primary">
                              {Math.round(audit.global_score)}/100
                            </span>
                          </div>
                        )}
                      </div>
                      {audit.status === "completed" && (
                        <Button onClick={() => navigate(`/audit?view=${audit.id}`)}>
                          <FileText className="mr-2 h-4 w-4" />
                          Voir le Rapport
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        {/* Service Requests */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Mes Demandes de Service</h2>
        <div className="space-y-4">
          {serviceRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Vous n'avez pas encore de demandes</p>
                <Button className="mt-4" onClick={() => navigate("/create-request")}>
                  Créer une demande
                </Button>
              </CardContent>
            </Card>
          ) : (
            serviceRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{request.title}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        {getStatusBadge(request.status)}
                        <Badge variant="outline">{request.service_type}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{request.description}</p>

                  {/* Quotes */}
                  {request.quotes && request.quotes.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2">Devis</h4>
                      {request.quotes.map((quote: any) => (
                        <div key={quote.id} className="flex justify-between items-center p-2 bg-secondary/10 rounded">
                          <div>
                            <p className="font-medium">{quote.amount} €</p>
                            <p className="text-sm text-muted-foreground">{quote.description}</p>
                          </div>
                          <Badge>{quote.status}</Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Intervention Dates */}
                  {request.intervention_dates && request.intervention_dates.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2">Dates d'intervention</h4>
                      {request.intervention_dates.map((date: any) => (
                        <div key={date.id} className="flex justify-between items-center p-2 bg-secondary/10 rounded">
                          <div>
                            <p className="font-medium">
                              {new Date(date.scheduled_date).toLocaleString("fr-FR")}
                            </p>
                            {date.notes && (
                              <p className="text-sm text-muted-foreground">{date.notes}</p>
                            )}
                          </div>
                          <Badge>{date.status}</Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 border-t pt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/client/chat/${request.id}`)}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Discussion
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;