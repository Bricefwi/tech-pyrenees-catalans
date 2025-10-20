import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ProjectGantt from "@/components/ProjectGantt";
import { exportElementToPDF } from "@/lib/pdfExport";
import { proposalEmailHtml } from "@/lib/emailTemplates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FileDown, Mail, Loader2 } from "lucide-react";

export default function ProjectDetail() {
  const { projectId } = useParams();
  const [project, setProject] = useState<any>(null);
  const [jalons, setJalons] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const { data: p } = await supabase
        .from("projects")
        .select("*, profiles!inner(email, company_name, full_name)")
        .eq("id", projectId)
        .single();
      setProject(p || null);

      const { data: j } = await supabase
        .from("project_jalons")
        .select("id, title, start_date, end_date, status, progress, responsible")
        .eq("project_id", projectId)
        .order("start_date", { ascending: true });
      setJalons(j || []);

      // récupérer la dernière analyse liée via analyses.service_request_id / project.request_id
      if (p?.request_id) {
        const { data: a } = await supabase
          .from("analyses")
          .select("contenu")
          .eq("service_request_id", p.request_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        setAnalysis(a?.contenu?.analysis || "");
      }
      
      setLoading(false);
    })();
  }, [projectId]);

  const tasks = useMemo(() => {
    return jalons
      .filter(j => j.start_date && j.end_date)
      .map(j => ({
        id: j.id,
        name: j.title,
        start: j.start_date,
        end: j.end_date,
        progress: j.progress || 0,
        custom_class: j.status === "done" ? "bar-green" : j.status === "in_progress" ? "bar-blue" : "bar-yellow"
      }));
  }, [jalons]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin mr-2" />
        <span>Chargement...</span>
      </div>
    );
  }

  if (!project) {
    return <div className="p-6">Projet introuvable</div>;
  }

  // Export du bloc principal
  const exportMainPDF = async () => {
    try {
      await exportElementToPDF("projectPdf", `projet-${project.title}.pdf`);
      toast({ title: "PDF exporté avec succès" });
    } catch (error) {
      toast({ 
        title: "Erreur lors de l'export PDF", 
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive" 
      });
    }
  };

  const exportGanttPDF = async () => {
    try {
      await exportElementToPDF("ganttSection", `gantt-${project.title}.pdf`);
      toast({ title: "Gantt exporté avec succès" });
    } catch (error) {
      toast({ 
        title: "Erreur lors de l'export Gantt", 
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive" 
      });
    }
  };

  // Envoi email depuis edge function
  async function sendProposalEmail() {
    setSending(true);
    try {
      const clientEmail = project.profiles?.email;
      
      if (!clientEmail) {
        toast({ 
          title: "Email client manquant", 
          description: "Impossible d'envoyer la proposition sans adresse email",
          variant: "destructive" 
        });
        return;
      }

      const html = proposalEmailHtml({
        clientName: project.client_name || project.profiles?.company_name || project.profiles?.full_name || "Client",
        projectTitle: project.title,
        summary: analysis || project.description || "Synthèse disponible dans le rapport joint.",
        milestones: jalons.map((j: any) => ({ 
          title: j.title, 
          eta: j.end_date, 
          owner: j.responsible 
        })),
        contactSignature: "Tech Pyrénées Catalans — Service Projets IA",
      });

      const { error } = await supabase.functions.invoke("send-proposal-email", {
        body: {
          to: clientEmail,
          subject: `Proposition — ${project.title}`,
          html
        }
      });

      if (error) {
        toast({ 
          title: "Erreur lors de l'envoi", 
          description: error.message,
          variant: "destructive" 
        });
      } else {
        toast({ 
          title: "Proposition envoyée", 
          description: `Email envoyé à ${clientEmail}` 
        });
      }
    } catch (error) {
      toast({ 
        title: "Erreur lors de l'envoi", 
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive" 
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{project.title}</h1>
        <div className="flex gap-2">
          <Button onClick={exportMainPDF} variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Exporter PDF
          </Button>
          <Button onClick={exportGanttPDF} variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Gantt PDF
          </Button>
          <Button onClick={sendProposalEmail} disabled={sending}>
            {sending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
            Envoyer au client
          </Button>
        </div>
      </div>

      {/* Bloc exportable principal */}
      <Card id="projectPdf">
        <CardHeader>
          <CardTitle>Informations du projet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Client</div>
              <div className="font-medium">
                {project.client_name || project.profiles?.company_name || project.profiles?.full_name || "-"}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Période</div>
              <div className="font-medium">
                {project.start_date} → {project.end_date || "—"}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Statut</div>
              <div className="font-medium capitalize">{project.status}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Progression</div>
              <div className="font-medium">{project.progress || 0}%</div>
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground mb-2">Synthèse</div>
            <div className="whitespace-pre-wrap text-sm">
              {analysis || project.description || "—"}
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground mb-2">Jalons</div>
            {jalons.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun jalon défini</p>
            ) : (
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {jalons.map(j => (
                  <li key={j.id}>
                    <span className="font-medium">{j.title}</span> — {j.start_date} → {j.end_date} ({j.status})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bloc exportable Gantt */}
      <Card id="ganttSection">
        <CardHeader>
          <CardTitle>Planning (Gantt)</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectGantt tasks={tasks} />
        </CardContent>
      </Card>
    </div>
  );
}
