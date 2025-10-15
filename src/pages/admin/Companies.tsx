import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CRMNav from "@/components/admin/CRMNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Phone, Mail, MapPin } from "lucide-react";

const Companies = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        navigate("/");
        return;
      }

      await loadCompanies();
    } catch (error) {
      navigate("/auth");
    } finally {
      setIsLoading(false);
    }
  };

  const loadCompanies = async () => {
    const { data, error } = await supabase
      .from("companies")
      .select(`
        *,
        profiles (count)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les entreprises",
        variant: "destructive",
      });
      return;
    }

    setCompanies(data || []);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <CRMNav />
      
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Entreprises</h1>
            <Button>+ Nouvelle entreprise</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => (
              <Card key={company.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      <CardTitle className="text-lg">{company.name}</CardTitle>
                    </div>
                    <Badge variant={company.is_individual ? "secondary" : "default"}>
                      {company.is_individual ? "Particulier" : "Entreprise"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!company.is_individual && company.business_sector && (
                    <p className="text-sm text-muted-foreground">{company.business_sector}</p>
                  )}
                  
                  {company.siret_siren && (
                    <p className="text-sm font-mono">{company.siret_siren}</p>
                  )}

                  {company.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4" />
                      <span>{company.email}</span>
                    </div>
                  )}

                  {company.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4" />
                      <span>{company.phone}</span>
                    </div>
                  )}

                  {company.city && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>{company.postal_code} {company.city}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{company.profiles?.[0]?.count || 0} contact(s)</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {companies.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune entreprise enregistrée</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Companies;
