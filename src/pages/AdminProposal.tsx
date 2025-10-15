import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Save, FileDown } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { generateProposalPDF } from "@/components/admin/ProposalPDFGenerator";

const AdminProposal = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [requestDetails, setRequestDetails] = useState<any>(null);
  const [proposals, setProposals] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
          full_name,
          email,
          is_professional,
          companies (
            name,
            is_individual,
            business_sector
          )
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
    // @ts-ignore - Column will be added via migration
    setProposals(data.admin_ai_proposals || "");
  };

  const handleGenerateProposals = async () => {
    // @ts-ignore - Column will be added via migration
    if (!requestDetails?.ai_specifications) {
      toast({
        title: "Cahier des charges manquant",
        description: "Le client n'a pas encore généré de cahier des charges via l'IA",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const clientInfo = `
Type: ${requestDetails.profiles?.companies?.is_individual ? 'Particulier' : 'Entreprise'}
${!requestDetails.profiles?.companies?.is_individual ? 'Entreprise: ' + (requestDetails.profiles?.companies?.name || 'Non renseigné') : ''}
Secteur: ${requestDetails.profiles?.companies?.business_sector || 'Non renseigné'}
Contact: ${requestDetails.profiles?.full_name} (${requestDetails.profiles?.email})
      `.trim();

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-admin-proposals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          // @ts-ignore - Column will be added via migration
          specifications: requestDetails.ai_specifications,
          serviceType: requestDetails.service_type,
          clientInfo
        }),
      });

      if (!response.ok) throw new Error("Erreur génération");

      const data = await response.json();
      setProposals(data.proposals);
      
      toast({
        title: "Propositions générées",
        description: "Les propositions commerciales ont été créées avec succès",
      });
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer les propositions",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveProposals = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("service_requests")
        // @ts-ignore - Column will be added via migration
        .update({ admin_ai_proposals: proposals })
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: "Sauvegardé",
        description: "Les propositions ont été enregistrées",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!requestDetails || !proposals) {
      toast({
        title: "Impossible de générer le PDF",
        description: "Veuillez d'abord générer ou saisir des propositions",
        variant: "destructive",
      });
      return;
    }

    generateProposalPDF({
      clientName: requestDetails.profiles?.full_name || "Client",
      companyName: requestDetails.profiles?.companies?.name,
      isIndividual: requestDetails.profiles?.companies?.is_individual || false,
      businessSector: requestDetails.profiles?.companies?.business_sector,
      serviceType: requestDetails.service_type,
      title: requestDetails.title,
      // @ts-ignore
      specifications: requestDetails.ai_specifications || requestDetails.description || "",
      proposals: proposals,
      requestNumber: requestDetails.request_number,
    });

    toast({
      title: "PDF généré",
      description: "Le document commercial a été téléchargé avec succès",
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  const isDigitalService = requestDetails && ["development", "nocode", "ai", "formation"].includes(requestDetails.service_type);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Button onClick={() => navigate("/admin")} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <h1 className="text-3xl font-bold">Propositions Commerciales IA</h1>

        {requestDetails && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Informations client et CDC */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informations Client</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><strong>Client:</strong> {requestDetails.profiles?.full_name}</p>
                  <p>
                    <strong>{requestDetails.profiles?.companies?.is_individual ? 'Particulier' : 'Entreprise'}:</strong>{' '}
                    {requestDetails.profiles?.companies?.name || "Non renseigné"}
                  </p>
                  {!requestDetails.profiles?.companies?.is_individual && (
                    <p><strong>Secteur:</strong> {requestDetails.profiles?.companies?.business_sector || "Non renseigné"}</p>
                  )}
                  <p><strong>Service:</strong> {requestDetails.service_type}</p>
                  <p><strong>Titre:</strong> {requestDetails.title}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cahier des Charges Client</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* @ts-ignore - Column will be added via migration */}
                  {requestDetails.ai_specifications ? (
                    <div className="text-sm whitespace-pre-wrap max-h-[500px] overflow-y-auto border rounded-lg p-4 bg-muted/50">
                      {/* @ts-ignore */}
                      {requestDetails.ai_specifications}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      {isDigitalService 
                        ? "Le client n'a pas encore généré de cahier des charges via l'IA"
                        : "Ce type de service ne nécessite pas de cahier des charges"}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Propositions commerciales */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Propositions Commerciales IA</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isDigitalService && (
                    <Button 
                      onClick={handleGenerateProposals} 
                      // @ts-ignore - Column will be added via migration
                      disabled={isGenerating || !requestDetails.ai_specifications}
                      className="w-full"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      {isGenerating ? "Génération en cours..." : "Générer des propositions avec l'IA"}
                    </Button>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Propositions de solutions:</label>
                    <Textarea
                      value={proposals}
                      onChange={(e) => setProposals(e.target.value)}
                      placeholder="Les propositions commerciales apparaîtront ici... Vous pouvez aussi les éditer manuellement."
                      rows={20}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSaveProposals} 
                      disabled={isSaving || !proposals}
                      className="flex-1"
                      variant="default"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isSaving ? "Enregistrement..." : "Sauvegarder"}
                    </Button>
                    
                    <Button 
                      onClick={handleDownloadPDF} 
                      disabled={!proposals}
                      className="flex-1"
                      variant="secondary"
                    >
                      <FileDown className="mr-2 h-4 w-4" />
                      Télécharger PDF
                    </Button>
                  </div>

                  {!isDigitalService && (
                    <p className="text-sm text-muted-foreground text-center">
                      Cette fonctionnalité est principalement destinée aux services de transformation digitale (développement, No-Code, IA, formation).
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProposal;