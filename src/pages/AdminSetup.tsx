import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Check } from "lucide-react";

const AdminSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [hasAdmin, setHasAdmin] = useState(false);

  useEffect(() => {
    checkSetup();
  }, []);

  const checkSetup = async () => {
    try {
      // Vérifier si l'utilisateur est connecté
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      setUser(user);

      // Vérifier si un admin existe déjà
      const { data: adminExists } = await supabase
        .from("user_roles")
        .select("id")
        .eq("role", "admin")
        .maybeSingle();

      setHasAdmin(!!adminExists);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const becomeAdmin = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from("user_roles")
        .insert({
          user_id: user.id,
          role: "admin"
        });

      if (error) throw error;

      toast({
        title: "Succès!",
        description: "Vous êtes maintenant administrateur",
      });

      setTimeout(() => {
        navigate("/admin-dashboard");
      }, 1000);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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

  if (hasAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              Configuration terminée
            </CardTitle>
            <CardDescription>
              Un administrateur existe déjà. Veuillez vous connecter avec un compte admin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/auth")} className="w-full">
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Configuration Administrateur
          </CardTitle>
          <CardDescription>
            Aucun administrateur n'a été configuré. Devenez le premier administrateur du système.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Compte connecté:</p>
            <p className="font-medium">{user?.email}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              En tant qu'administrateur, vous pourrez:
            </p>
            <ul className="text-sm space-y-1 ml-4 list-disc text-muted-foreground">
              <li>Voir toutes les demandes d'intervention</li>
              <li>Gérer les devis et les interventions</li>
              <li>Programmer les rendez-vous clients</li>
              <li>Accéder au dashboard complet</li>
            </ul>
          </div>

          <Button 
            onClick={becomeAdmin} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Configuration..." : "Devenir Administrateur"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSetup;
