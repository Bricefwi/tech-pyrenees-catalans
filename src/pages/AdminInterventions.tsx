import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Loader2, Calendar, User, CheckCircle } from "lucide-react";

export default function AdminInterventions() {
  const queryClient = useQueryClient();

  const { data: interventions, isLoading } = useQuery({
    queryKey: ["admin-interventions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("interventions")
        .select(`
          *,
          companies(name)
        `)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error loading interventions:", error);
        throw error;
      }
      
      // Manually join with profiles for client and technician
      const interventionsWithProfiles = await Promise.all((data || []).map(async (intervention) => {
        const result: any = { ...intervention };
        
        // Load client profile
        if (intervention.client_id) {
          const { data: clientProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', intervention.client_id)
            .maybeSingle();
          result.client_profile = clientProfile;
        }
        
        // Load technician profile
        if (intervention.technician_id) {
          const { data: techProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', intervention.technician_id)
            .maybeSingle();
          result.technician_profile = techProfile;
        }
        
        return result;
      }));
      
      return interventionsWithProfiles;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("interventions")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);
      
      if (error) throw error;

      if (status === "Terminée") {
        await supabase.functions.invoke('workflow-hook', {
          body: { kind: "onInterventionCompleted", intervention_id: id }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-interventions"] });
      toast({ title: "Statut mis à jour" });
    },
    onError: (error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "En attente": "secondary",
      "Planifiée": "outline",
      "En cours": "default",
      "Terminée": "default",
      "Clôturée": "outline",
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
        <h1 className="text-3xl font-bold">Interventions & Projets</h1>
        <Link to="/admin">
          <Button variant="outline">Retour Admin</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {interventions?.map((intervention: any) => (
          <div key={intervention.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">{intervention.title}</h3>
                <div className="flex items-center gap-4 text-sm text-text-muted">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {intervention.client_profile?.full_name || "—"}
                  </span>
                  {intervention.companies?.name && (
                    <span>• {intervention.companies.name}</span>
                  )}
                  {intervention.technician_profile?.full_name && (
                    <span className="flex items-center gap-1">
                      • Technicien: {intervention.technician_profile.full_name}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(intervention.status)}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-text-muted" />
                <span>
                  Début: {intervention.start_date ? new Date(intervention.start_date).toLocaleDateString('fr-FR') : "À planifier"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-text-muted" />
                <span>
                  Fin: {intervention.end_date ? new Date(intervention.end_date).toLocaleDateString('fr-FR') : "À définir"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link to={`/admin/interventions/${intervention.id}`}>
                <Button variant="outline" size="sm">
                  Détails
                </Button>
              </Link>
              
              {intervention.status === "En attente" && (
                <Button
                  size="sm"
                  onClick={() => updateStatusMutation.mutate({ id: intervention.id, status: "Planifiée" })}
                >
                  Planifier
                </Button>
              )}
              
              {intervention.status === "Planifiée" && (
                <Button
                  size="sm"
                  onClick={() => updateStatusMutation.mutate({ id: intervention.id, status: "En cours" })}
                >
                  Démarrer
                </Button>
              )}
              
              {intervention.status === "En cours" && (
                <Button
                  size="sm"
                  onClick={() => updateStatusMutation.mutate({ id: intervention.id, status: "Terminée" })}
                  className="gap-1"
                >
                  <CheckCircle className="h-4 w-4" />
                  Terminer
                </Button>
              )}
            </div>
          </div>
        ))}

        {(!interventions || interventions.length === 0) && (
          <div className="text-center py-12 text-text-muted bg-white rounded-lg">
            Aucune intervention pour le moment
          </div>
        )}
      </div>
    </div>
  );
}
