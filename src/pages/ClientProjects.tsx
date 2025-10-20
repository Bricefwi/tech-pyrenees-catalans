import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Calendar, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ClientProjects() {
  const [userId, setUserId] = useState<string | null>(null);
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

  const { data: interventions, isLoading } = useQuery({
    queryKey: ["client-interventions", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (!profile) return [];

      const { data, error } = await supabase
        .from("interventions")
        .select(`
          *,
          technician:profiles!interventions_technician_id_fkey(full_name)
        `)
        .eq("client_id", profile.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
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

  const getStatusProgress = (status: string) => {
    const progressMap: Record<string, number> = {
      "En attente": 10,
      "Planifiée": 25,
      "En cours": 60,
      "Terminée": 90,
      "Clôturée": 100,
    };
    return progressMap[status] || 0;
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
      <h1 className="text-3xl font-bold mb-6">Mes Projets</h1>

      <div className="grid gap-4">
        {interventions?.map((intervention: any) => (
          <div key={intervention.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">{intervention.title}</h3>
                {intervention.technician?.full_name && (
                  <p className="text-sm text-text-muted flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Technicien: {intervention.technician.full_name}
                  </p>
                )}
              </div>
              {getStatusBadge(intervention.status)}
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-muted">Avancement</span>
                <span className="font-medium">{getStatusProgress(intervention.status)}%</span>
              </div>
              <Progress value={getStatusProgress(intervention.status)} className="h-2" />
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {intervention.start_date && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-text-muted" />
                  <span>
                    Début: {new Date(intervention.start_date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
              {intervention.end_date && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-text-muted" />
                  <span>
                    Fin: {new Date(intervention.end_date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
            </div>

            {intervention.report_pdf_url && (
              <a
                href={intervention.report_pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm"
              >
                Consulter le rapport d'intervention →
              </a>
            )}

            <div className="text-xs text-text-muted mt-4">
              Créé le {new Date(intervention.created_at).toLocaleDateString('fr-FR')}
            </div>
          </div>
        ))}

        {(!interventions || interventions.length === 0) && (
          <div className="text-center py-12 text-text-muted bg-white rounded-lg">
            Aucun projet en cours
          </div>
        )}
      </div>
    </div>
  );
}
