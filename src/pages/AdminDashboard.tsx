import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  FileText, 
  Receipt, 
  FolderKanban, 
  BarChart3, 
  Calendar, 
  Send, 
  Mail, 
  Eye,
  ClipboardCheck,
  MessageSquare
} from "lucide-react";

interface Request {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

interface Intervention {
  id: string;
  service_request_id: string;
  scheduled_date: string;
  service_requests?: { title: string; id: string } | null;
}

export default function AdminDashboard() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [stats, setStats] = useState({ pending: 0, in_progress: 0, completed: 0 });
  const [loading, setLoading] = useState(false);

  async function loadDashboard() {
    setLoading(true);

    // ---- Charger les demandes
    const { data: reqs, error: reqErr } = await supabase
      .from("service_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (reqErr) toast({ title: "Erreur", description: reqErr.message });
    else setRequests(reqs || []);

    // ---- Charger les interventions
    const { data: interv, error: intErr } = await supabase
      .from("intervention_dates")
      .select("*, service_requests(title, id)")
      .order("scheduled_date", { ascending: true });
    if (intErr) toast({ title: "Erreur", description: intErr.message });
    else setInterventions(interv || []);

    // ---- Calculer les stats
    const pending = reqs?.filter(r => r.status === "pending").length ?? 0;
    const in_progress = reqs?.filter(r => r.status === "in_progress").length ?? 0;
    const completed = reqs?.filter(r => r.status === "completed").length ?? 0;
    setStats({ pending, in_progress, completed });

    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from("service_requests")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: error.message });
    } else {
      toast({ title: "Succès", description: `Statut passé à ${status}` });
      loadDashboard();
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  // ---- Helper de filtrage du planning
  const today = new Date();
  const thisWeek = [startOfWeek(today, { locale: fr }), endOfWeek(today, { locale: fr })];
  const thisMonth = [startOfMonth(today), endOfMonth(today)];

  const todayInterv = interventions.filter(i => format(new Date(i.scheduled_date), "yyyy-MM-dd") === format(today, "yyyy-MM-dd"));
  const weekInterv = interventions.filter(i => new Date(i.scheduled_date) >= thisWeek[0] && new Date(i.scheduled_date) <= thisWeek[1]);
  const monthInterv = interventions.filter(i => new Date(i.scheduled_date) >= thisMonth[0] && new Date(i.scheduled_date) <= thisMonth[1]);

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Tableau de bord Administrateur</h1>

      {/* ---- Statistiques ---- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg bg-slate-100 p-4">
          <h3 className="font-medium text-gray-700">En attente</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
        </div>
        <div className="rounded-lg bg-slate-100 p-4">
          <h3 className="font-medium text-gray-700">En cours</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.in_progress}</p>
        </div>
        <div className="rounded-lg bg-slate-100 p-4">
          <h3 className="font-medium text-gray-700">Terminées</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
        </div>
      </div>

      {/* ---- Navigation Admin ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Navigation Administration</CardTitle>
          <CardDescription>Accédez rapidement à toutes les fonctionnalités administratives</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[100px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><FileText className="h-5 w-5 text-primary" /></TableCell>
                <TableCell className="font-medium">Audits</TableCell>
                <TableCell className="text-muted-foreground">Gérer les audits clients, générer et consulter les rapports d'analyse</TableCell>
                <TableCell><Link to="/admin/audits" className="text-primary hover:underline">Accéder</Link></TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Receipt className="h-5 w-5 text-primary" /></TableCell>
                <TableCell className="font-medium">Devis</TableCell>
                <TableCell className="text-muted-foreground">Consulter et gérer tous les devis créés pour les clients</TableCell>
                <TableCell><Link to="/admin/quotes" className="text-primary hover:underline">Accéder</Link></TableCell>
              </TableRow>
              <TableRow>
                <TableCell><FolderKanban className="h-5 w-5 text-primary" /></TableCell>
                <TableCell className="font-medium">Projets</TableCell>
                <TableCell className="text-muted-foreground">Vue liste de tous les projets clients en cours et terminés</TableCell>
                <TableCell><Link to="/admin/projects" className="text-primary hover:underline">Accéder</Link></TableCell>
              </TableRow>
              <TableRow>
                <TableCell><BarChart3 className="h-5 w-5 text-primary" /></TableCell>
                <TableCell className="font-medium">Dashboard Projets</TableCell>
                <TableCell className="text-muted-foreground">Tableau de bord avec statistiques et métriques des projets</TableCell>
                <TableCell><Link to="/admin/projects-dashboard" className="text-primary hover:underline">Accéder</Link></TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Calendar className="h-5 w-5 text-primary" /></TableCell>
                <TableCell className="font-medium">Interventions</TableCell>
                <TableCell className="text-muted-foreground">Planning et gestion des interventions techniques planifiées</TableCell>
                <TableCell><Link to="/admin/interventions" className="text-primary hover:underline">Accéder</Link></TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Send className="h-5 w-5 text-primary" /></TableCell>
                <TableCell className="font-medium">Relances</TableCell>
                <TableCell className="text-muted-foreground">Gérer les relances automatiques et manuelles des clients</TableCell>
                <TableCell><Link to="/admin/followups" className="text-primary hover:underline">Accéder</Link></TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Mail className="h-5 w-5 text-primary" /></TableCell>
                <TableCell className="font-medium">Logs Emails</TableCell>
                <TableCell className="text-muted-foreground">Historique de tous les emails envoyés par le système</TableCell>
                <TableCell><Link to="/admin/email-logs" className="text-primary hover:underline">Accéder</Link></TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Eye className="h-5 w-5 text-primary" /></TableCell>
                <TableCell className="font-medium">Aperçu Communications</TableCell>
                <TableCell className="text-muted-foreground">Prévisualiser les templates d'emails et communications</TableCell>
                <TableCell><Link to="/admin/communication-aperçu" className="text-primary hover:underline">Accéder</Link></TableCell>
              </TableRow>
              <TableRow>
                <TableCell><ClipboardCheck className="h-5 w-5 text-primary" /></TableCell>
                <TableCell className="font-medium">Pré-Réception</TableCell>
                <TableCell className="text-muted-foreground">Valider les besoins clients avant création de projet</TableCell>
                <TableCell><span className="text-muted-foreground text-sm">Via demande</span></TableCell>
              </TableRow>
              <TableRow>
                <TableCell><MessageSquare className="h-5 w-5 text-primary" /></TableCell>
                <TableCell className="font-medium">Chat Demandes</TableCell>
                <TableCell className="text-muted-foreground">Échanger avec les clients sur leurs demandes de service</TableCell>
                <TableCell><span className="text-muted-foreground text-sm">Via demande</span></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ---- Liste des demandes ---- */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Demandes</h2>
        {requests.length === 0 && <p className="text-gray-500">Aucune demande pour le moment.</p>}
        <ul className="divide-y divide-gray-200">
          {requests.map(req => (
            <li key={req.id} className="py-3 flex justify-between items-center">
              <div>
                <p className="font-medium">{req.title || "Sans titre"}</p>
                <p className="text-sm text-gray-500">
                  {format(new Date(req.created_at), "dd MMM yyyy HH:mm", { locale: fr })} – {req.status}
                </p>
              </div>
              <div className="flex gap-2">
                {req.status === "pending" && (
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                    onClick={() => updateStatus(req.id, "in_progress")}
                  >
                    Prendre en charge
                  </button>
                )}
                {req.status === "in_progress" && (
                  <button
                    className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
                    onClick={() => updateStatus(req.id, "completed")}
                  >
                    Terminer
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ---- Planning ---- */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Planning des interventions</h2>
        {interventions.length === 0 && <p className="text-gray-500">Aucune intervention planifiée.</p>}

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Aujourd’hui</h3>
            {todayInterv.length === 0 && <p className="text-gray-400 text-sm">Rien de prévu</p>}
            <ul className="space-y-1">
              {todayInterv.map(i => (
                <li key={i.id} className="text-sm">
                  {format(new Date(i.scheduled_date), "HH:mm", { locale: fr })} – {i.service_requests?.title || "Demande"}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">Cette semaine</h3>
            {weekInterv.length === 0 && <p className="text-gray-400 text-sm">Aucune intervention</p>}
            <ul className="space-y-1">
              {weekInterv.map(i => (
                <li key={i.id} className="text-sm">
                  {format(new Date(i.scheduled_date), "dd/MM HH:mm", { locale: fr })} – {i.service_requests?.title || "Demande"}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">Ce mois-ci</h3>
            {monthInterv.length === 0 && <p className="text-gray-400 text-sm">Aucune intervention</p>}
            <ul className="space-y-1">
              {monthInterv.map(i => (
                <li key={i.id} className="text-sm">
                  {format(new Date(i.scheduled_date), "dd/MM", { locale: fr })} – {i.service_requests?.title || "Demande"}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
