import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";

interface AuditSector {
  id: string;
  name: string;
  description: string;
  order_index: number;
  weighting: number;
}

interface AuditQuestion {
  id: string;
  sector_id: string;
  subdomain: string;
  question_text: string;
  response_type: string;
  weighting: number;
  order_index: number;
}

const Audit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [sectors, setSectors] = useState<AuditSector[]>([]);
  const [questions, setQuestions] = useState<AuditQuestion[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [auditReport, setAuditReport] = useState<string | null>(null);
  const [currentSectorIndex, setCurrentSectorIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [companyInfo, setCompanyInfo] = useState({
    name: "",
    sector: "",
    size: "",
    contactName: "",
    contactEmail: "",
    contactPhone: ""
  });
  const [showCompanyForm, setShowCompanyForm] = useState(true);
  const [auditId, setAuditId] = useState<string | null>(null);

  useEffect(() => {
    loadAuditData();
  }, []);

  const loadAuditData = async () => {
    try {
      const [sectorsRes, questionsRes] = await Promise.all([
        supabase.from("audit_sectors").select("*").order("order_index"),
        supabase.from("audit_questions").select("*").order("order_index")
      ]);

      if (sectorsRes.error) throw sectorsRes.error;
      if (questionsRes.error) throw questionsRes.error;

      setSectors(sectorsRes.data || []);
      setQuestions(questionsRes.data || []);
    } catch (error) {
      console.error("Error loading audit data:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de l'audit",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startAudit = async () => {
    if (!companyInfo.name || !companyInfo.contactEmail) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir au moins le nom de l'entreprise et l'email",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Create company (without user requirement - audit can be done anonymously)
      const { data: company, error: companyError } = await supabase
        .from("audited_companies")
        .insert({
          name: companyInfo.name.trim(),
          sector: companyInfo.sector.trim(),
          size: companyInfo.size.trim(),
          contact_name: companyInfo.contactName.trim(),
          contact_email: companyInfo.contactEmail.trim(),
          contact_phone: companyInfo.contactPhone.trim(),
          created_by: user?.id || null
        })
        .select()
        .single();

      if (companyError) {
        console.error("Company creation error:", companyError);
        throw new Error(`Erreur lors de la création de l'entreprise: ${companyError.message}`);
      }

      // Create audit (can be created without user)
      const { data: audit, error: auditError } = await supabase
        .from("audits")
        .insert({
          company_id: company.id,
          created_by: user?.id || null,
          current_sector: sectors[0]?.name || 'digitalisation',
          status: "in_progress"
        })
        .select()
        .single();

      if (auditError) {
        console.error("Audit creation error:", auditError);
        throw new Error(`Erreur lors de la création de l'audit: ${auditError.message}`);
      }

      setAuditId(audit.id);
      setShowCompanyForm(false);
      
      toast({
        title: "Succès",
        description: "Audit démarré avec succès"
      });
    } catch (error: any) {
      console.error("Error starting audit:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de démarrer l'audit. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentSectorQuestions = () => {
    const currentSector = sectors[currentSectorIndex];
    if (!currentSector) return [];
    
    return questions.filter(q => q.sector_id === currentSector.id);
  };

  const handleNext = async () => {
    const currentQuestions = getCurrentSectorQuestions();
    const unansweredQuestions = currentQuestions.filter(q => !responses[q.id]);
    
    if (unansweredQuestions.length > 0) {
      toast({
        title: "Questions manquantes",
        description: "Veuillez répondre à toutes les questions avant de continuer",
        variant: "destructive"
      });
      return;
    }

    // Save responses for current sector
    if (auditId) {
      await saveResponses();
    }

    if (currentSectorIndex < sectors.length - 1) {
      setCurrentSectorIndex(currentSectorIndex + 1);
    } else {
      await completeAudit();
    }
  };

  const saveResponses = async () => {
    const currentQuestions = getCurrentSectorQuestions();
    
    const responsesToSave = currentQuestions.map(question => ({
      audit_id: auditId,
      question_id: question.id,
      response_value: responses[question.id],
      score: calculateScore(question, responses[question.id])
    }));

    const { error } = await supabase.from("audit_responses").insert(responsesToSave);
    
    if (error) {
      console.error("Error saving responses:", error);
      throw error;
    }
  };

  const calculateScore = (question: AuditQuestion, response: string): number => {
    switch (question.response_type) {
      case 'yes_no':
        return response === 'yes' ? 5 : 0;
      case 'yes_no_partial':
        if (response === 'yes') return 5;
        if (response === 'partial') return 2.5;
        return 0;
      case 'low_medium_high':
        if (response === 'high') return 5;
        if (response === 'medium') return 3;
        return 1;
      case 'hours':
        const hours = parseFloat(response) || 0;
        // Plus d'heures perdues = score plus bas
        if (hours === 0) return 5;
        if (hours <= 5) return 4;
        if (hours <= 10) return 3;
        if (hours <= 20) return 2;
        return 1;
      default:
        return 0;
    }
  };

  const completeAudit = async () => {
    try {
      setIsGeneratingReport(true);
      
      // Récupérer toutes les réponses
      const { data: responsesData } = await supabase
        .from("audit_responses")
        .select("*")
        .eq("audit_id", auditId);

      // Générer le rapport avec l'IA
      const { data: reportData, error: reportError } = await supabase.functions.invoke(
        'generate-audit-report',
        {
          body: {
            auditData: {
              sectors,
              questions,
              responses: responsesData
            },
            companyInfo
          }
        }
      );

      if (reportError) {
        console.error("Error generating report:", reportError);
        toast({
          title: "Erreur",
          description: "Impossible de générer le rapport IA",
          variant: "destructive"
        });
        return;
      }

      setAuditReport(reportData.report);
      
      // Mettre à jour l'audit comme complété
      const { error } = await supabase
        .from("audits")
        .update({ 
          status: "completed", 
          completed_at: new Date().toISOString()
        })
        .eq("id", auditId);

      if (error) throw error;

      toast({
        title: "Audit complété",
        description: "Rapport généré avec succès",
      });
    } catch (error) {
      console.error("Error completing audit:", error);
      toast({
        title: "Erreur",
        description: "Impossible de finaliser l'audit",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const progress = sectors.length > 0 ? ((currentSectorIndex + 1) / sectors.length) * 100 : 0;
  const currentSector = sectors[currentSectorIndex];
  const currentQuestions = getCurrentSectorQuestions();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12">
        {showCompanyForm ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl">Audit Digital Gratuit</CardTitle>
              <CardDescription>
                Évaluez la maturité digitale de votre entreprise en quelques minutes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l'entreprise *</Label>
                <Input
                  id="name"
                  value={companyInfo.name}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sector">Secteur d'activité</Label>
                <Input
                  id="sector"
                  value={companyInfo.sector}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, sector: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">Taille de l'entreprise</Label>
                <Input
                  id="size"
                  placeholder="Ex: 1-10, 10-50, 50+"
                  value={companyInfo.size}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, size: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactName">Nom du contact</Label>
                <Input
                  id="contactName"
                  value={companyInfo.contactName}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, contactName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={companyInfo.contactEmail}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, contactEmail: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Téléphone</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={companyInfo.contactPhone}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, contactPhone: e.target.value })}
                />
              </div>
              <Button 
                onClick={startAudit} 
                className="w-full" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Démarrage..." : "Commencer l'audit"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Retour
            </Button>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Secteur {currentSectorIndex + 1} sur {sectors.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {currentSector && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{currentSector.name}</CardTitle>
                  {currentSector.description && (
                    <CardDescription>{currentSector.description}</CardDescription>
                  )}
                </CardHeader>
                 <CardContent className="space-y-6">
                  {auditReport ? (
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-wrap bg-muted p-6 rounded-lg">
                        {auditReport}
                      </div>
                      <div className="flex gap-4 mt-6">
                        <Button onClick={() => navigate("/")}>
                          Retour à l'accueil
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            const blob = new Blob([auditReport], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `audit-${companyInfo.name}-${new Date().toISOString().split('T')[0]}.txt`;
                            a.click();
                          }}
                        >
                          Télécharger le rapport
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {currentQuestions.map((question) => (
                        <div key={question.id} className="space-y-3 p-4 border rounded-lg">
                          <div>
                            <p className="font-medium text-sm text-primary mb-1">
                              {question.subdomain}
                            </p>
                            <p className="font-medium">{question.question_text}</p>
                          </div>
                          
                          {question.response_type === "yes_no" && (
                            <RadioGroup
                              value={responses[question.id] || ""}
                              onValueChange={(value) =>
                                setResponses({ ...responses, [question.id]: value })
                              }
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id={`${question.id}-yes`} />
                                <Label htmlFor={`${question.id}-yes`} className="cursor-pointer">Oui</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id={`${question.id}-no`} />
                                <Label htmlFor={`${question.id}-no`} className="cursor-pointer">Non</Label>
                              </div>
                            </RadioGroup>
                          )}
                          
                          {question.response_type === "yes_no_partial" && (
                            <RadioGroup
                              value={responses[question.id] || ""}
                              onValueChange={(value) =>
                                setResponses({ ...responses, [question.id]: value })
                              }
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id={`${question.id}-yes`} />
                                <Label htmlFor={`${question.id}-yes`} className="cursor-pointer">Oui</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="partial" id={`${question.id}-partial`} />
                                <Label htmlFor={`${question.id}-partial`} className="cursor-pointer">Partiellement</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id={`${question.id}-no`} />
                                <Label htmlFor={`${question.id}-no`} className="cursor-pointer">Non</Label>
                              </div>
                            </RadioGroup>
                          )}
                          
                          {question.response_type === "low_medium_high" && (
                            <RadioGroup
                              value={responses[question.id] || ""}
                              onValueChange={(value) =>
                                setResponses({ ...responses, [question.id]: value })
                              }
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="low" id={`${question.id}-low`} />
                                <Label htmlFor={`${question.id}-low`} className="cursor-pointer">Bas</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="medium" id={`${question.id}-medium`} />
                                <Label htmlFor={`${question.id}-medium`} className="cursor-pointer">Moyen</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="high" id={`${question.id}-high`} />
                                <Label htmlFor={`${question.id}-high`} className="cursor-pointer">Élevé</Label>
                              </div>
                            </RadioGroup>
                          )}
                          
                          {question.response_type === "hours" && (
                            <Input
                              type="number"
                              min="0"
                              step="0.5"
                              placeholder="Nombre d'heures"
                              value={responses[question.id] || ""}
                              onChange={(e) =>
                                setResponses({ ...responses, [question.id]: e.target.value })
                              }
                            />
                          )}
                        </div>
                      ))}
                    </>
                  )}
                  
                  {!auditReport && (
                    <div className="flex justify-between pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentSectorIndex(Math.max(0, currentSectorIndex - 1))}
                        disabled={currentSectorIndex === 0}
                      >
                        <ArrowLeft className="mr-2 w-4 h-4" />
                        Précédent
                      </Button>
                      <Button 
                        onClick={handleNext}
                        disabled={isGeneratingReport}
                      >
                        {isGeneratingReport ? (
                          <>
                            Génération du rapport...
                          </>
                        ) : currentSectorIndex === sectors.length - 1 ? (
                          <>
                            Terminer et générer le rapport
                            <CheckCircle2 className="ml-2 w-5 h-5" />
                          </>
                        ) : (
                          <>
                            Suivant
                            <ArrowRight className="ml-2 w-5 h-5" />
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Audit;