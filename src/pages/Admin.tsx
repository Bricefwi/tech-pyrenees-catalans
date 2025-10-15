import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LogOut, MessageSquare, FileText, Calendar } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
  });

  useEffect(() => {
    checkAdminAccess();
    loadServiceRequests();
  }, []);

  const checkAdminAccess = async () => {
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
        .single();

      if (roleData?.role !== "admin") {
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas les droits d'administration",
          variant: "destructive",
        });
        navigate("/");
      }
    } catch (error) {
      navigate("/auth");
    } finally {
      setIsLoading(false);
    }
  };

  const loadServiceRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("service_requests")
        .select(`
          *,
          profiles (
            full_name,
            email,
            phone
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setServiceRequests(data || []);

      // Calculate stats
      const pending = data?.filter(r => r.status === "pending").length || 0;
      const inProgress = data?.filter(r => r.status === "in_progress").length || 0;
      const completed = data?.filter(r => r.status === "completed").length || 0;

      setStats({ pending, inProgress, completed });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
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
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      low: "secondary",
      medium: "default",
      high: "destructive",
    };
    return <Badge variant={variants[priority] || "default"}>{priority}</Badge>;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Tableau de bord administrateur</h1>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">En attente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">En cours</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.inProgress}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Terminées</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.completed}</p>
            </CardContent>
          </Card>
        </div>

        {/* Service Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Demandes clients</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">Toutes</TabsTrigger>
                <TabsTrigger value="pending">En attente</TabsTrigger>
                <TabsTrigger value="in_progress">En cours</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {serviceRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{request.title}</h3>
                            {getStatusBadge(request.status)}
                            {getPriorityBadge(request.priority)}
                          </div>
                          <p className="text-sm text-muted-foreground">{request.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Client: {request.profiles?.full_name}</span>
                            <span>Email: {request.profiles?.email}</span>
                            {request.profiles?.phone && <span>Tél: {request.profiles?.phone}</span>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/admin/request/${request.id}`)}
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Chat
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/admin/quote/${request.id}`)}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Devis
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/admin/intervention/${request.id}`)}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            Dates
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="pending" className="space-y-4">
                {serviceRequests
                  .filter((r) => r.status === "pending")
                  .map((request) => (
                    <Card key={request.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{request.title}</h3>
                              {getStatusBadge(request.status)}
                              {getPriorityBadge(request.priority)}
                            </div>
                            <p className="text-sm text-muted-foreground">{request.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Client: {request.profiles?.full_name}</span>
                              <span>Email: {request.profiles?.email}</span>
                              {request.profiles?.phone && <span>Tél: {request.profiles?.phone}</span>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/admin/request/${request.id}`)}
                            >
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Chat
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/admin/quote/${request.id}`)}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Devis
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/admin/intervention/${request.id}`)}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              Dates
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </TabsContent>

              <TabsContent value="in_progress" className="space-y-4">
                {serviceRequests
                  .filter((r) => r.status === "in_progress")
                  .map((request) => (
                    <Card key={request.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{request.title}</h3>
                              {getStatusBadge(request.status)}
                              {getPriorityBadge(request.priority)}
                            </div>
                            <p className="text-sm text-muted-foreground">{request.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Client: {request.profiles?.full_name}</span>
                              <span>Email: {request.profiles?.email}</span>
                              {request.profiles?.phone && <span>Tél: {request.profiles?.phone}</span>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/admin/request/${request.id}`)}
                            >
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Chat
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/admin/quote/${request.id}`)}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Devis
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/admin/intervention/${request.id}`)}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              Dates
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
