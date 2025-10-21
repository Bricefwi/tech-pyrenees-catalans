import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, AlertCircle } from "lucide-react";

export default function AdminFollowups() {
  const { data: followups, isLoading } = useQuery({
    queryKey: ["admin-followups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("followups")
        .select(`
          *,
          interventions(title)
        `)
        .order("next_action_date", { ascending: true, nullsFirst: false });
      
      if (error) {
        console.error("Error loading followups:", error);
        throw error;
      }
      
      // Manually join with profiles via client_id
      const followupsWithProfiles = await Promise.all((data || []).map(async (followup) => {
        if (!followup.client_id) return { ...followup, client_profile: null };
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', followup.client_id)
          .maybeSingle();
        
        return { ...followup, client_profile: profile };
      }));
      
      return followupsWithProfiles;
    },
  });

  const getTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      onboarding: "Onboarding",
      support: "Support",
      optimisation: "Optimisation",
      upsell: "Upsell",
    };
    return <Badge variant="outline">{labels[type] || type}</Badge>;
  };

  const isOverdue = (date: string | null) => {
    if (!date) return false;
    return new Date(date) < new Date();
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
        <h1 className="text-3xl font-bold">Suivi Post-Projet</h1>
        <Link to="/admin">
          <Button variant="outline">Retour Admin</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {followups?.map((followup: any) => (
          <div 
            key={followup.id} 
            className={`bg-white rounded-lg shadow p-6 ${
              isOverdue(followup.next_action_date) ? 'border-l-4 border-destructive' : ''
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">
                    {followup.client_profile?.full_name || "Client"}
                  </h3>
                  {getTypeBadge(followup.type)}
                </div>
                {followup.interventions?.title && (
                  <p className="text-sm text-text-muted">
                    Projet: {followup.interventions.title}
                  </p>
                )}
              </div>
            </div>

            {followup.notes && (
              <p className="text-sm mb-4 text-text-muted">{followup.notes}</p>
            )}

            {followup.next_action && (
              <div className="bg-surface rounded-lg p-4 mb-3">
                <div className="flex items-start gap-2">
                  {isOverdue(followup.next_action_date) && (
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium mb-1">{followup.next_action}</p>
                    {followup.next_action_date && (
                      <p className={`text-sm flex items-center gap-1 ${
                        isOverdue(followup.next_action_date) ? 'text-destructive font-medium' : 'text-text-muted'
                      }`}>
                        <Calendar className="h-4 w-4" />
                        {new Date(followup.next_action_date).toLocaleDateString('fr-FR')}
                        {isOverdue(followup.next_action_date) && ' (En retard)'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="text-xs text-text-muted">
              Créé le {new Date(followup.created_at).toLocaleDateString('fr-FR')}
            </div>
          </div>
        ))}

        {(!followups || followups.length === 0) && (
          <div className="text-center py-12 text-text-muted bg-white rounded-lg">
            Aucun suivi en cours
          </div>
        )}
      </div>
    </div>
  );
}
