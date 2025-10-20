import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function AdminProjects() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          profiles!projects_profile_id_fkey(full_name)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "pending": "secondary",
      "active": "default",
      "done": "outline",
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
        <h1 className="text-3xl font-bold">Projets</h1>
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
              <th className="px-6 py-3 text-left text-sm font-semibold">Dates</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Progrès</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {projects?.map((project: any) => (
              <tr key={project.id} className="hover:bg-surface/50">
                <td className="px-6 py-4">
                  <div className="font-medium">{project.title}</div>
                  {project.description && (
                    <div className="text-sm text-text-muted mt-1 truncate max-w-md">{project.description}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {project.profiles?.full_name || project.client_name || "—"}
                </td>
                <td className="px-6 py-4">{getStatusBadge(project.status)}</td>
                <td className="px-6 py-4 text-sm text-text-muted">
                  {project.start_date && (
                    <div>Début: {new Date(project.start_date).toLocaleDateString('fr-FR')}</div>
                  )}
                  {project.end_date && (
                    <div>Fin: {new Date(project.end_date).toLocaleDateString('fr-FR')}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${project.progress || 0}%` }}
                      />
                    </div>
                    <span className="text-sm text-text-muted">{project.progress || 0}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!projects || projects.length === 0) && (
          <div className="text-center py-12 text-text-muted">
            Aucun projet pour le moment
          </div>
        )}
      </div>
    </div>
  );
}
