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
}

interface AuditCriterion {
  id: string;
  sector_id: string;
  name: string;
  description: string;
  order_index: number;
  max_score: number;
}

interface AuditQuestion {
  id: string;
  criterion_id: string;
  question_text: string;
  question_type: string;
  options: any;
  order_index: number;
  weight: number;
}

const Audit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [sectors, setSectors] = useState<AuditSector[]>([]);
  const [criteria, setCriteria] = useState<AuditCriterion[]>([]);
  const [questions, setQuestions] = useState<AuditQuestion[]>([]);
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
      const [sectorsRes, criteriaRes, questionsRes] = await Promise.all([
        supabase.from("audit_sectors").select("*").order("order_index"),
        supabase.from("audit_criteria").select("*").order("order_index"),
        supabase.from("audit_questions").select("*").order("order_index")
      ]);

      if (sectorsRes.error) throw sectorsRes.error;
      if (criteriaRes.error) throw criteriaRes.error;
      if (questionsRes.error) throw questionsRes.error;

      setSectors(sectorsRes.data || []);
      setCriteria(criteriaRes.data || []);
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

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Create company
      const { data: company, error: companyError } = await supabase
        .from("audited_companies")
        .insert({
          name: companyInfo.name,
          sector: companyInfo.sector,
          size: companyInfo.size,
          contact_name: companyInfo.contactName,
          contact_email: companyInfo.contactEmail,
          contact_phone: companyInfo.contactPhone,
          created_by: user?.id
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // Create audit
      const { data: audit, error: auditError } = await supabase
        .from("audits")
        .insert({
          company_id: company.id,
          created_by: user?.id,
          current_sector: sectors[0]?.name,
          status: "in_progress"
        })
        .select()
        .single();

      if (auditError) throw auditError;

      setAuditId(audit.id);
      setShowCompanyForm(false);
    } catch (error) {
      console.error("Error starting audit:", error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer l'audit",
        variant: "destructive"
      });
    }
  };

  const getCurrentSectorQuestions = () => {
    const currentSector = sectors[currentSectorIndex];
    if (!currentSector) return [];
    
    const sectorCriteria = criteria.filter(c => c.sector_id === currentSector.id);
    const criterionIds = sectorCriteria.map(c => c.id);
    return questions.filter(q => criterionIds.includes(q.criterion_id));
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
    const currentSector = sectors[currentSectorIndex];
    
    const responsesToSave = currentQuestions.map(question => {
      const criterion = criteria.find(c => c.id === question.criterion_id);
      return {
        audit_id: auditId,
        question_id: question.id,
        question_text: question.question_text,
        response: responses[question.id],
        criterion: criterion?.name || "",
        sector: currentSector.name,
        score: calculateScore(question, responses[question.id])
      };
    });

    const { error } = await supabase.from("audit_responses").insert(responsesToSave);
    
    if (error) {
      console.error("Error saving responses:", error);
      throw error;
    }
  };

  const calculateScore = (question: AuditQuestion, response: string): number => {
    if (question.question_type === "rating") {
      return parseFloat(response) || 0;
    }
    return 0;
  };

  const completeAudit = async () => {
    try {
      const { error } = await supabase
        .from("audits")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", auditId);

      if (error) throw error;

      toast({
        title: "Audit complété",
        description: "Votre audit a été enregistré avec succès",
      });

      navigate("/");
    } catch (error) {
      console.error("Error completing audit:", error);
      toast({
        title: "Erreur",
        description: "Impossible de finaliser l'audit",
        variant: "destructive"
      });
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
              <Button onClick={startAudit} className="w-full" size="lg">
                Commencer l'audit
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
                  {currentQuestions.map((question) => {
                    const criterion = criteria.find(c => c.id === question.criterion_id);
                    return (
                      <div key={question.id} className="space-y-3 p-4 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm text-primary mb-1">
                            {criterion?.name}
                          </p>
                          <p className="font-medium">{question.question_text}</p>
                        </div>
                        {question.question_type === "rating" && (
                          <RadioGroup
                            value={responses[question.id] || ""}
                            onValueChange={(value) =>
                              setResponses({ ...responses, [question.id]: value })
                            }
                          >
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <div key={rating} className="flex items-center space-x-2">
                                <RadioGroupItem value={rating.toString()} id={`${question.id}-${rating}`} />
                                <Label htmlFor={`${question.id}-${rating}`} className="cursor-pointer">
                                  {rating} - {
                                    rating === 1 ? "Pas du tout" :
                                    rating === 2 ? "Peu" :
                                    rating === 3 ? "Moyennement" :
                                    rating === 4 ? "Bien" :
                                    "Excellent"
                                  }
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        )}
                        {question.question_type === "text" && (
                          <Textarea
                            value={responses[question.id] || ""}
                            onChange={(e) =>
                              setResponses({ ...responses, [question.id]: e.target.value })
                            }
                            placeholder="Votre réponse..."
                          />
                        )}
                      </div>
                    );
                  })}
                  
                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentSectorIndex(Math.max(0, currentSectorIndex - 1))}
                      disabled={currentSectorIndex === 0}
                    >
                      <ArrowLeft className="mr-2 w-4 h-4" />
                      Précédent
                    </Button>
                    <Button onClick={handleNext}>
                      {currentSectorIndex === sectors.length - 1 ? (
                        <>
                          Terminer
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