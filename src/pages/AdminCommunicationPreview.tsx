import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Mail, FileText, FileJson } from "lucide-react";
import { 
  proposalEmailHtml, 
  projectProposalEmail, 
  auditReadyEmail, 
  quoteSentEmail,
  quoteValidatedEmail,
  projectPlannedEmail 
} from "@/lib/emailTemplates";
import { generateAuditPdf, exportToPDF, exportElementToPDF } from "@/lib/pdfExport";
import { generateCharteSEO } from "@/lib/generateCharteSEO";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminCommunicationPreview() {
  const [loading, setLoading] = useState<string | null>(null);

  // Données d'exemple pour les emails
  const emailExamples = {
    proposal: proposalEmailHtml({
      clientName: "Jean Dupont",
      projectTitle: "Migration vers Apple Business Manager",
      summary: "Mise en place d'une infrastructure Apple complète avec gestion MDM et formation des équipes.",
      milestones: [
        { title: "Audit initial", eta: "Semaine 1", owner: "IMOTION" },
        { title: "Configuration MDM", eta: "Semaine 2-3", owner: "IMOTION" },
        { title: "Formation équipes", eta: "Semaine 4", owner: "IMOTION + Client" },
        { title: "Go Live", eta: "Semaine 5", owner: "Client" }
      ],
      contactSignature: "L'équipe IMOTION"
    }),
    proposalDownload: projectProposalEmail({
      clientName: "Marie Martin",
      projectTitle: "Modernisation parc informatique",
      message: "Votre proposition détaillée est prête. Vous y trouverez notre analyse complète et nos recommandations.",
      downloadLink: "https://example.com/proposal.pdf"
    }),
    auditReady: auditReadyEmail({
      clientName: "Pierre Dubois",
      reportUrl: "https://example.com/audit-report.pdf"
    }),
    quoteSent: quoteSentEmail({
      clientName: "Sophie Bernard",
      quoteTitle: "Devis - Infrastructure Apple",
      pdfUrl: "https://example.com/quote.pdf"
    }),
    quoteValidated: quoteValidatedEmail({
      clientName: "Luc Mercier",
      quoteTitle: "Devis - Formation Apple"
    }),
    projectPlanned: projectPlannedEmail({
      clientName: "Émilie Rousseau",
      projectTitle: "Déploiement iPad",
      startDate: "15 janvier 2025",
      technicianName: "Marc Technicien"
    })
  };

  const downloadAuditPDF = async () => {
    setLoading("audit");
    try {
      const pdfBlob = await generateAuditPdf({
        brand: { 
          logoUrl: "/logo-imotion.png", 
          company: "IMOTION", 
          tagline: "Intégrateur Apple & IA" 
        },
        client: { 
          name: "Jean Dupont", 
          email: "jean.dupont@example.com", 
          company: "Canet Restauration" 
        },
        audit: {
          id: "demo-audit",
          title: "Audit Digital - Exemple",
          date: new Date(),
          globalScore: 67,
          sectorScores: [
            { name: "Stratégie digitale", score: 72 },
            { name: "Infrastructure IT", score: 85 },
            { name: "Sécurité", score: 58 },
            { name: "Productivité", score: 63 },
            { name: "Data & Analytics", score: 55 },
            { name: "IA & Automatisation", score: 45 }
          ],
          sectors: [],
          responses: []
        },
        hook: "Accélérez votre performance opérationnelle avec un socle Apple + IA robuste, simple et mesurable."
      });
      
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "exemple-rapport-audit.pdf";
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success("PDF téléchargé");
    } catch (error) {
      toast.error("Erreur lors de la génération du PDF");
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const downloadCharteSEO = async () => {
    setLoading("charte");
    try {
      const pdfBlob = await generateCharteSEO();
      
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "charte-seo-imotion.pdf";
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success("Charte SEO téléchargée");
    } catch (error) {
      toast.error("Erreur lors de la génération de la charte");
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const downloadDemoAuditJSON = async () => {
    setLoading("demo-json");
    try {
      const { data, error } = await supabase.functions.invoke("generate-demo-audit-json");
      
      if (error) throw error;
      
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "audit-demo-complet-imotion.json";
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success("Audit JSON téléchargé");
    } catch (error) {
      toast.error("Erreur lors de la génération de l'audit JSON");
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const downloadLatestAuditJSON = async () => {
    setLoading("latest-json");
    try {
      const { data, error } = await supabase
        .from("v_export_audit")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) {
        toast.error("Aucun audit trouvé dans la base de données");
        return;
      }
      
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-${data.audit_id}-export.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success("Audit réel téléchargé");
    } catch (error) {
      toast.error("Erreur lors de l'export de l'audit");
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Validation Charte Visuelle
          </h1>
          <p className="text-muted-foreground">
            Aperçu de tous les documents de communication client (emails et PDFs)
          </p>
        </div>

        <Tabs defaultValue="emails" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="emails">
              <Mail className="w-4 h-4 mr-2" />
              Templates Emails
            </TabsTrigger>
            <TabsTrigger value="pdfs">
              <FileText className="w-4 h-4 mr-2" />
              Documents PDF
            </TabsTrigger>
            <TabsTrigger value="json">
              <FileJson className="w-4 h-4 mr-2" />
              Données JSON
            </TabsTrigger>
          </TabsList>

          <TabsContent value="emails" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Email - Proposition de projet</h3>
              <div 
                className="border border-border rounded-lg p-4 bg-white overflow-auto max-h-96"
                dangerouslySetInnerHTML={{ __html: emailExamples.proposal }}
              />
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Email - Téléchargement proposition</h3>
              <div 
                className="border border-border rounded-lg p-4 bg-white overflow-auto max-h-96"
                dangerouslySetInnerHTML={{ __html: emailExamples.proposalDownload }}
              />
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Email - Rapport d'audit prêt</h3>
              <div 
                className="border border-border rounded-lg p-4 bg-white overflow-auto max-h-96"
                dangerouslySetInnerHTML={{ __html: emailExamples.auditReady }}
              />
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Email - Devis envoyé</h3>
              <div 
                className="border border-border rounded-lg p-4 bg-white overflow-auto max-h-96"
                dangerouslySetInnerHTML={{ __html: emailExamples.quoteSent }}
              />
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Email - Devis validé</h3>
              <div 
                className="border border-border rounded-lg p-4 bg-white overflow-auto max-h-96"
                dangerouslySetInnerHTML={{ __html: emailExamples.quoteValidated }}
              />
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Email - Projet planifié</h3>
              <div 
                className="border border-border rounded-lg p-4 bg-white overflow-auto max-h-96"
                dangerouslySetInnerHTML={{ __html: emailExamples.projectPlanned }}
              />
            </Card>
          </TabsContent>

          <TabsContent value="pdfs" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">Rapport d'Audit Digital</h3>
                  <p className="text-sm text-muted-foreground">
                    Document professionnel avec scores par secteur et recommandations
                  </p>
                </div>
                <Button 
                  onClick={downloadAuditPDF}
                  disabled={loading === "audit"}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {loading === "audit" ? "Génération..." : "Télécharger"}
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Contenu: Logo IMOTION, informations client, score global, scores par secteur, 
                hook commercial, pied de page avec date
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">Charte SEO & IA</h3>
                  <p className="text-sm text-muted-foreground">
                    Document de référence pour l'optimisation SEO et l'indexation IA
                  </p>
                </div>
                <Button 
                  onClick={downloadCharteSEO}
                  disabled={loading === "charte"}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {loading === "charte" ? "Génération..." : "Télécharger"}
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Contenu: Charte graphique, optimisation SEO, indexation IA, performance, 
                conformité RGPD
              </div>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <h3 className="text-xl font-semibold">Devis Client (Quote PDF)</h3>
                <p className="text-sm text-muted-foreground">
                  Généré automatiquement via l'edge function generate-quote-pdf
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                Contenu: Informations IMOTION, détails client, montant HT/TTC/TVA, 
                description du devis, date de validité
              </div>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <h3 className="text-xl font-semibold">Proposition Commerciale</h3>
                <p className="text-sm text-muted-foreground">
                  Document détaillé généré via ProposalPDFGenerator
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                Contenu: Analyse du besoin, proposition technique, jalons du projet, 
                tarification détaillée
              </div>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <h3 className="text-xl font-semibold">Planning Projet (Gantt)</h3>
                <p className="text-sm text-muted-foreground">
                  Export visuel du planning via exportToPDF
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                Contenu: Logo IMOTION, titre du projet, diagramme Gantt des jalons, 
                informations de génération
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="json" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">Audit Complet - Démonstration</h3>
                  <p className="text-sm text-muted-foreground">
                    Fichier JSON complet avec toutes les données d'un audit type (client fictif)
                  </p>
                </div>
                <Button 
                  onClick={downloadDemoAuditJSON}
                  disabled={loading === "demo-json"}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {loading === "demo-json" ? "Génération..." : "Télécharger"}
                </Button>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Contenu:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Informations client complètes (raison sociale, SIRET, adresse)</li>
                  <li>Score global et scores détaillés par secteur (6 secteurs)</li>
                  <li>Questions et réponses complètes pour chaque secteur</li>
                  <li>Commentaires et recommandations par secteur</li>
                  <li>Plan d'action détaillé avec jalons</li>
                  <li>Estimation budgétaire et ROI</li>
                  <li>Métadonnées IMOTION (contact, certifications)</li>
                </ul>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">Dernier Audit Réel</h3>
                  <p className="text-sm text-muted-foreground">
                    Export JSON du dernier audit créé dans la base de données
                  </p>
                </div>
                <Button 
                  onClick={downloadLatestAuditJSON}
                  disabled={loading === "latest-json"}
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {loading === "latest-json" ? "Export..." : "Exporter"}
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Export via la vue v_export_audit avec toutes les données réelles de l'audit le plus récent
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
