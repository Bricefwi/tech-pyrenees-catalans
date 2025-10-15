import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp,
  Users,
  FileText,
  ArrowLeft,
  Wrench
} from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    todayInterventions: 0,
    weekInterventions: 0,
    monthInterventions: 0
  });

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

      // Vérifier le rôle admin
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas les droits administrateur",
          variant: "destructive"
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      await loadDashboardData();
    } catch (error: any) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadDashboardData = async () => {
    // Charger les demandes avec les profils corrects
    const { data: requestsData } = await supabase
      .from("service_requests")
      .select(`
        *,
        profiles:client_user_id (
          full_name,
          email,
          phone,
          first_name,
          last_name
        )
      `)
      .order("created_at", { ascending: false });

    if (requestsData) {
      setRequests(requestsData);
      
      // Calculer les stats
      const pending = requestsData.filter(r => r.status === "pending").length;
      const inProgress = requestsData.filter(r => r.status === "in_progress").length;
      const completed = requestsData.filter(r => r.status === "completed").length;
      
      setStats(prev => ({ ...prev, pending, inProgress, completed }));
    }

    // Charger les interventions
    const today = new Date();
    const weekStart = startOfWeek(today, { locale: fr });
    const weekEnd = endOfWeek(today, { locale: fr });
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    const { data: interventionsData } = await supabase
      .from("intervention_dates")
      .select(`
        *,
        service_requests (
          title,
          service_type,
          profiles:client_user_id (full_name, phone)
        )
      `)
      .gte("scheduled_date", today.toISOString())
      .order("scheduled_date", { ascending: true });

    if (interventionsData) {
      setInterventions(interventionsData);

      const todayEnd = new Date(today);
      todayEnd.setHours(23, 59, 59);

      const todayCount = interventionsData.filter(i => 
        new Date(i.scheduled_date) <= todayEnd
      ).length;

      const weekCount = interventionsData.filter(i => 
        new Date(i.scheduled_date) >= weekStart && new Date(i.scheduled_date) <= weekEnd
      ).length;

      const monthCount = interventionsData.filter(i =>
        new Date(i.scheduled_date) >= monthStart && new Date(i.scheduled_date) <= monthEnd
      ).length;

      setStats(prev => ({
        ...prev,
        todayInterventions: todayCount,
        weekInterventions: weekCount,
        monthInterventions: monthCount
      }));
    }
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    const { error } = await supabase
      .from("service_requests")
      .update({ status })
      .eq("id", requestId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Succès",
        description: "Statut mis à jour"
      });
      loadDashboardData();
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: any }> = {
      pending: { label: "En attente", variant: "secondary" },
      in_progress: { label: "En cours", variant: "default" },
      completed: { label: "Terminé", variant: "outline" },
      cancelled: { label: "Annulé", variant: "destructive" }
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      low: { label: "Basse", className: "bg-green-100 text-green-800" },
      medium: { label: "Moyenne", className: "bg-yellow-100 text-yellow-800" },
      high: { label: "Haute", className: "bg-red-100 text-red-800" }
    };
    const config = variants[priority] || variants.medium;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getServiceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      repair_iphone: "Réparation iPhone",
      repair_mac: "Réparation Mac/iPad",
      development: "Développement",
      nocode: "No-Code",
      ai: "IA",
      formation: "Formation"
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            <h1 className="text-3xl font-bold">Dashboard Admin</h1>
          </div>
          <Button onClick={() => supabase.auth.signOut().then(() => navigate("/"))}>
            Déconnexion
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">demandes à traiter</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">En cours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">interventions actives</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Terminées</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">ce mois</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Aujourd'hui</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayInterventions}</div>
              <p className="text-xs text-muted-foreground">interventions prévues</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList>
            <TabsTrigger value="requests">
              <FileText className="w-4 h-4 mr-2" />
              Demandes
            </TabsTrigger>
            <TabsTrigger value="planning">
              <Calendar className="w-4 h-4 mr-2" />
              Planning
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{request.title}</CardTitle>
                      <div className="flex gap-2 items-center text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        {request.profiles?.full_name || "Client inconnu"}
                        {request.profiles?.phone && ` • ${request.profiles.phone}`}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {getStatusBadge(request.status)}
                      {getPriorityBadge(request.priority)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Type de service</p>
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4" />
                      <span>{getServiceTypeLabel(request.service_type)}</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1">Description</p>
                    <p className="text-sm text-muted-foreground">{request.description}</p>
                  </div>

                  {request.admin_notes && (
                    <div>
                      <p className="text-sm font-medium mb-1">Notes admin</p>
                      <p className="text-sm text-muted-foreground">{request.admin_notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t">
                    {request.status === "pending" && (
                      <Button 
                        onClick={() => updateRequestStatus(request.id, "in_progress")}
                        size="sm"
                      >
                        Prendre en charge
                      </Button>
                    )}
                    {request.status === "in_progress" && (
                      <Button 
                        onClick={() => updateRequestStatus(request.id, "completed")}
                        size="sm"
                        variant="outline"
                      >
                        Marquer terminé
                      </Button>
                    )}
                    <Button 
                      onClick={() => navigate(`/admin/request/${request.id}`)}
                      size="sm"
                      variant="ghost"
                    >
                      Chat
                    </Button>
                    <Button 
                      onClick={() => navigate(`/admin/quote/${request.id}`)}
                      size="sm"
                      variant="ghost"
                    >
                      Devis
                    </Button>
                    <Button 
                      onClick={() => navigate(`/admin/intervention/${request.id}`)}
                      size="sm"
                      variant="ghost"
                    >
                      Dates
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="planning" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Aujourd'hui */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Aujourd'hui</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(), "d MMMM yyyy", { locale: fr })}
                  </p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {interventions
                    .filter(i => {
                      const interventionDate = new Date(i.scheduled_date);
                      const today = new Date();
                      return interventionDate.toDateString() === today.toDateString();
                    })
                    .map((intervention) => (
                      <div key={intervention.id} className="p-3 border rounded-lg space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium text-sm">
                            {format(new Date(intervention.scheduled_date), "HH:mm")}
                          </span>
                        </div>
                        <p className="text-sm">{intervention.service_requests?.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {intervention.service_requests?.profiles?.full_name}
                        </p>
                      </div>
                    ))}
                  {interventions.filter(i => {
                    const interventionDate = new Date(i.scheduled_date);
                    const today = new Date();
                    return interventionDate.toDateString() === today.toDateString();
                  }).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucune intervention prévue
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Cette semaine */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cette semaine</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {stats.weekInterventions} intervention(s)
                  </p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {interventions
                    .filter(i => {
                      const interventionDate = new Date(i.scheduled_date);
                      const weekStart = startOfWeek(new Date(), { locale: fr });
                      const weekEnd = endOfWeek(new Date(), { locale: fr });
                      return interventionDate >= weekStart && interventionDate <= weekEnd;
                    })
                    .slice(0, 5)
                    .map((intervention) => (
                      <div key={intervention.id} className="p-3 border rounded-lg space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium text-sm">
                            {format(new Date(intervention.scheduled_date), "EEE d MMM", { locale: fr })}
                          </span>
                        </div>
                        <p className="text-sm">{intervention.service_requests?.title}</p>
                      </div>
                    ))}
                </CardContent>
              </Card>

              {/* Ce mois */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ce mois</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {stats.monthInterventions} intervention(s)
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Charge de travail</span>
                      <TrendingUp className="w-4 h-4 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Prévisions</span>
                        <span className="font-medium">{stats.monthInterventions}h</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${Math.min((stats.monthInterventions / 160) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {Math.round((stats.monthInterventions / 160) * 100)}% de capacité
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
