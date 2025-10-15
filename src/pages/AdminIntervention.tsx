import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar } from "lucide-react";

const AdminIntervention = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [requestDetails, setRequestDetails] = useState<any>(null);
  const [formData, setFormData] = useState({
    scheduled_date: "",
    duration_hours: "",
    notes: "",
  });

  useEffect(() => {
    checkAdminAndLoadData();
  }, [requestId]);

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
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas les droits d'administration",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      await loadRequestData();
    } catch (error) {
      navigate("/auth");
    } finally {
      setIsLoading(false);
    }
  };

  const loadRequestData = async () => {
    const { data, error } = await supabase
      .from("service_requests")
      .select(`
        *,
        profiles (
          first_name,
          last_name,
          email
        )
      `)
      .eq("id", requestId)
      .single();

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger la demande",
        variant: "destructive",
      });
      return;
    }

    setRequestDetails(data);

    // Pré-remplir avec la date proposée par le client si elle existe
    if (data.proposed_date) {
      const date = new Date(data.proposed_date);
      setFormData({
        ...formData,
        scheduled_date: date.toISOString().slice(0, 16),
      });
    }
  };

  const handleValidateClientDate = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: updateError } = await supabase
      .from("service_requests")
      .update({
        confirmed_date: requestDetails.proposed_date,
        date_status: "confirmed",
      })
      .eq("id", requestId);

    if (updateError) {
      toast({
        title: "Erreur",
        description: "Impossible de valider la date",
        variant: "destructive",
      });
      return;
    }

    const { error: insertError } = await supabase
      .from("intervention_dates")
      .insert({
        service_request_id: requestId,
        created_by: user.id,
        scheduled_date: requestDetails.proposed_date,
        status: "scheduled",
      });

    if (insertError) {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'intervention",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Succès",
      description: "Date validée avec succès",
    });

    navigate("/admin");
  };

  const handleProposeNewDate = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: updateError } = await supabase
      .from("service_requests")
      .update({
        confirmed_date: formData.scheduled_date,
        date_status: "admin_proposed",
      })
      .eq("id", requestId);

    if (updateError) {
      toast({
        title: "Erreur",
        description: "Impossible de proposer la date",
        variant: "destructive",
      });
      return;
    }

    const { error: insertError } = await supabase
      .from("intervention_dates")
      .insert({
        service_request_id: requestId,
        created_by: user.id,
        scheduled_date: formData.scheduled_date,
        duration_hours: formData.duration_hours ? parseFloat(formData.duration_hours) : null,
        notes: formData.notes,
        status: "scheduled",
      });

    if (insertError) {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'intervention",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Succès",
      description: "Nouvelle date proposée au client",
    });

    navigate("/admin");
  };

  const getDateStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      client_proposed: "default",
      admin_proposed: "default",
      confirmed: "outline",
    };
    const labels: Record<string, string> = {
      pending: "En attente",
      client_proposed: "Proposée par le client",
      admin_proposed: "Proposée par l'admin",
      confirmed: "Confirmée",
    };
    return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button onClick={() => navigate("/admin")} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Gestion des dates d'intervention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {requestDetails && (
              <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
                <p><strong>Demande:</strong> {requestDetails.title}</p>
                <p><strong>Client:</strong> {requestDetails.profiles?.first_name} {requestDetails.profiles?.last_name}</p>
                <p><strong>Description:</strong> {requestDetails.description}</p>
                {requestDetails.proposed_date && (
                  <div className="mt-4 p-3 bg-background rounded border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Date proposée par le client:</p>
                        <p>{new Date(requestDetails.proposed_date).toLocaleString("fr-FR")}</p>
                        {getDateStatusBadge(requestDetails.date_status)}
                      </div>
                      {requestDetails.date_status === "client_proposed" && (
                        <Button onClick={handleValidateClientDate} size="sm">
                          Valider cette date
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleProposeNewDate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="scheduled_date">
                  <Calendar className="inline mr-2 h-4 w-4" />
                  {requestDetails?.proposed_date ? "Proposer une nouvelle date" : "Date d'intervention"} *
                </Label>
                <Input
                  id="scheduled_date"
                  type="datetime-local"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration_hours">Durée estimée (heures)</Label>
                <Input
                  id="duration_hours"
                  type="number"
                  step="0.5"
                  value={formData.duration_hours}
                  onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                  placeholder="2.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes concernant l'intervention..."
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full">
                {requestDetails?.proposed_date ? "Proposer cette nouvelle date" : "Programmer l'intervention"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminIntervention;
