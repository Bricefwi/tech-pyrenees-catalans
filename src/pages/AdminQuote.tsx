import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";

const AdminQuote = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [requestDetails, setRequestDetails] = useState<any>(null);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    valid_until: "",
  });

  useEffect(() => {
    checkAdminAndLoadData();
  }, [requestId]);

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
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas les droits d'administration",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      await loadRequestData();
    } catch (error) {
      navigate("/auth");
    } finally {
      setIsLoading(false);
    }
  };

  const loadRequestData = async () => {
    const { data, error } = await supabase
      .from("service_requests")
      .select(`
        *,
        profiles (
          first_name,
          last_name,
          email
        )
      `)
      .eq("id", requestId)
      .single();

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger la demande",
        variant: "destructive",
      });
      return;
    }

    setRequestDetails(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Insérer le devis
    const { error: quoteError } = await supabase
      .from("quotes")
      .insert({
        service_request_id: requestId,
        created_by: user.id,
        amount: parseFloat(formData.amount),
        description: formData.description,
        valid_until: formData.valid_until,
        status: "pending",
      });

    if (quoteError) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le devis",
        variant: "destructive",
      });
      return;
    }

    // Mettre à jour le statut de la demande
    const { error: updateError } = await supabase
      .from("service_requests")
      .update({ 
        quote_status: "quote_sent",
        status: "in_progress"
      })
      .eq("id", requestId);

    if (updateError) {
      toast({
        title: "Avertissement",
        description: "Devis créé mais impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }

    toast({
      title: "Succès",
      description: "Devis envoyé au client",
    });

    navigate("/admin");
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button onClick={() => navigate("/admin")} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Créer un devis</CardTitle>
          </CardHeader>
          <CardContent>
            {requestDetails && (
              <div className="mb-6 p-4 bg-muted rounded-lg space-y-2 text-sm">
                <p><strong>Demande:</strong> {requestDetails.title}</p>
                <p><strong>Client:</strong> {requestDetails.profiles?.first_name} {requestDetails.profiles?.last_name}</p>
                <p><strong>Description:</strong> {requestDetails.description}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Montant (€) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description du devis *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valid_until">Valide jusqu'au *</Label>
                <Input
                  id="valid_until"
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Créer le devis
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminQuote;
