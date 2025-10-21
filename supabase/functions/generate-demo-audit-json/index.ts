import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Créer un audit complet de démonstration
    const demoAudit = {
      audit_id: "demo-" + crypto.randomUUID(),
      title: "Audit Digital Complet - Démonstration IMOTION",
      created_at: new Date().toISOString(),
      status: "completed",
      company_name: "TechCatalan SAS",
      client_name: "Jean Dupont",
      client_email: "jean.dupont@techcatalan.fr",
      company_details: {
        siret: "123 456 789 00012",
        address: "15 Avenue des Champs-Élysées, 75008 Paris",
        sector: "Services informatiques",
        size: "PME (50-250 employés)",
        website: "https://www.techcatalan.fr"
      },
      global_score: 67.5,
      generated_report: "Rapport détaillé de l'audit digital...",
      sectors: [
        {
          sector_id: "sector-strategie",
          sector_name: "Stratégie Digitale",
          weighting: 20,
          score: 72,
          max_score: 100,
          comments: "Bonne vision stratégique mais manque d'outils de mesure KPI. Recommandation: mise en place d'un tableau de bord avec Power BI ou Tableau."
        },
        {
          sector_id: "sector-infrastructure",
          sector_name: "Infrastructure IT",
          weighting: 25,
          score: 85,
          max_score: 100,
          comments: "Infrastructure solide avec des solutions Apple bien intégrées. Point d'amélioration: migration vers Apple Business Manager pour centraliser la gestion."
        },
        {
          sector_id: "sector-securite",
          sector_name: "Sécurité & Conformité",
          weighting: 20,
          score: 58,
          max_score: 100,
          comments: "Failles importantes détectées: absence de MFA sur certains comptes critiques, pas de politique de sauvegarde automatisée. Action urgente requise."
        },
        {
          sector_id: "sector-productivite",
          sector_name: "Productivité & Collaboration",
          weighting: 15,
          score: 63,
          max_score: 100,
          comments: "Utilisation basique de Microsoft 365. Opportunité: formation des équipes sur les outils collaboratifs avancés (Teams, SharePoint, OneDrive)."
        },
        {
          sector_id: "sector-data",
          sector_name: "Data & Analytics",
          weighting: 10,
          score: 55,
          max_score: 100,
          comments: "Données éparses, pas de centralisation. Recommandation: mise en place d'un data warehouse avec Azure Synapse ou Snowflake."
        },
        {
          sector_id: "sector-ia",
          sector_name: "IA & Automatisation",
          weighting: 10,
          score: 45,
          max_score: 100,
          comments: "Aucune solution d'IA en place. Grande opportunité de gains de productivité avec l'automatisation des tâches répétitives (Power Automate, ChatGPT API)."
        }
      ],
      questions_responses: [
        {
          sector: "Stratégie Digitale",
          questions: [
            {
              question_id: "q1-strat",
              question: "Avez-vous une stratégie digitale formalisée pour les 3 prochaines années ?",
              type: "yes_no",
              response: "yes",
              score: 10,
              weighting: 10
            },
            {
              question_id: "q2-strat",
              question: "Disposez-vous d'indicateurs de performance (KPI) pour mesurer votre transformation digitale ?",
              type: "yes_no",
              response: "partial",
              score: 5,
              weighting: 10
            },
            {
              question_id: "q3-strat",
              question: "Quel est votre budget annuel dédié au digital ?",
              type: "choice",
              response: "50k-100k €",
              score: 7,
              weighting: 8
            }
          ]
        },
        {
          sector: "Infrastructure IT",
          questions: [
            {
              question_id: "q1-infra",
              question: "Utilisez-vous des solutions Apple (Mac, iPad, iPhone) en entreprise ?",
              type: "yes_no",
              response: "yes",
              score: 10,
              weighting: 10
            },
            {
              question_id: "q2-infra",
              question: "Avez-vous un MDM (Mobile Device Management) pour gérer vos appareils ?",
              type: "yes_no",
              response: "yes",
              score: 10,
              weighting: 10
            },
            {
              question_id: "q3-infra",
              question: "Vos données sont-elles sauvegardées automatiquement et régulièrement ?",
              type: "yes_no",
              response: "yes",
              score: 10,
              weighting: 10
            },
            {
              question_id: "q4-infra",
              question: "Utilisez-vous le cloud pour stocker vos données (iCloud, OneDrive, Google Drive) ?",
              type: "choice",
              response: "Oui, principalement",
              score: 9,
              weighting: 8
            }
          ]
        },
        {
          sector: "Sécurité & Conformité",
          questions: [
            {
              question_id: "q1-secu",
              question: "Avez-vous activé l'authentification multi-facteurs (MFA) sur tous les comptes critiques ?",
              type: "yes_no",
              response: "no",
              score: 0,
              weighting: 15
            },
            {
              question_id: "q2-secu",
              question: "Êtes-vous conforme au RGPD pour la gestion des données personnelles ?",
              type: "yes_no",
              response: "partial",
              score: 7,
              weighting: 12
            },
            {
              question_id: "q3-secu",
              question: "Avez-vous une politique de mots de passe renforcée ?",
              type: "yes_no",
              response: "yes",
              score: 8,
              weighting: 10
            },
            {
              question_id: "q4-secu",
              question: "Effectuez-vous des audits de sécurité réguliers ?",
              type: "choice",
              response: "Une fois par an",
              score: 6,
              weighting: 8
            }
          ]
        },
        {
          sector: "Productivité & Collaboration",
          questions: [
            {
              question_id: "q1-prod",
              question: "Utilisez-vous des outils collaboratifs (Teams, Slack, Google Workspace) ?",
              type: "yes_no",
              response: "yes",
              score: 9,
              weighting: 10
            },
            {
              question_id: "q2-prod",
              question: "Vos équipes sont-elles formées aux outils digitaux qu'elles utilisent ?",
              type: "yes_no",
              response: "partial",
              score: 5,
              weighting: 10
            },
            {
              question_id: "q3-prod",
              question: "Avez-vous mis en place des workflows automatisés pour les tâches répétitives ?",
              type: "yes_no",
              response: "no",
              score: 0,
              weighting: 8
            }
          ]
        },
        {
          sector: "Data & Analytics",
          questions: [
            {
              question_id: "q1-data",
              question: "Disposez-vous d'un entrepôt de données centralisé (Data Warehouse) ?",
              type: "yes_no",
              response: "no",
              score: 0,
              weighting: 12
            },
            {
              question_id: "q2-data",
              question: "Utilisez-vous des outils de Business Intelligence (Power BI, Tableau) ?",
              type: "yes_no",
              response: "partial",
              score: 5,
              weighting: 10
            },
            {
              question_id: "q3-data",
              question: "Vos données sont-elles structurées et exploitables pour l'analyse ?",
              type: "choice",
              response: "Partiellement",
              score: 5,
              weighting: 8
            }
          ]
        },
        {
          sector: "IA & Automatisation",
          questions: [
            {
              question_id: "q1-ia",
              question: "Utilisez-vous des solutions d'Intelligence Artificielle dans votre activité ?",
              type: "yes_no",
              response: "no",
              score: 0,
              weighting: 15
            },
            {
              question_id: "q2-ia",
              question: "Avez-vous automatisé certaines tâches via RPA ou workflows intelligents ?",
              type: "yes_no",
              response: "no",
              score: 0,
              weighting: 12
            },
            {
              question_id: "q3-ia",
              question: "Êtes-vous intéressé par l'intégration de ChatGPT ou autres IA génératives ?",
              type: "yes_no",
              response: "yes",
              score: 8,
              weighting: 8
            }
          ]
        }
      ],
      recommendations: [
        {
          priority: "high",
          sector: "Sécurité & Conformité",
          title: "Mise en place urgente de MFA",
          description: "Déployer l'authentification multi-facteurs sur tous les comptes administrateurs et critiques. Estimation: 2 semaines, budget 5k€.",
          estimated_gain: "Réduction de 90% des risques d'intrusion par compromission de mot de passe"
        },
        {
          priority: "high",
          sector: "Infrastructure IT",
          title: "Migration vers Apple Business Manager",
          description: "Centraliser la gestion des appareils Apple via ABM et MDM (Jamf ou Intune). Estimation: 1 mois, budget 15k€.",
          estimated_gain: "Gain de 50% sur le temps de déploiement et maintenance des appareils"
        },
        {
          priority: "medium",
          sector: "Productivité & Collaboration",
          title: "Formation avancée Microsoft 365",
          description: "Programme de formation de 3 jours pour les équipes sur Teams, SharePoint, Power Automate. Budget: 8k€.",
          estimated_gain: "Augmentation de 30% de la productivité collaborative"
        },
        {
          priority: "medium",
          sector: "Data & Analytics",
          title: "Mise en place d'un Data Warehouse",
          description: "Centralisation des données dans Azure Synapse avec Power BI pour la visualisation. Estimation: 3 mois, budget 45k€.",
          estimated_gain: "Prise de décision data-driven, ROI estimé à 18 mois"
        },
        {
          priority: "low",
          sector: "IA & Automatisation",
          title: "POC Intelligence Artificielle",
          description: "Proof of Concept sur l'automatisation de 3 cas d'usage métier avec IA générative. Estimation: 6 semaines, budget 20k€.",
          estimated_gain: "Automatisation de 40% des tâches répétitives identifiées"
        }
      ],
      next_steps: [
        {
          step: 1,
          title: "Validation du rapport d'audit",
          description: "Présentation détaillée des résultats et recommandations",
          deadline: "Semaine 1",
          responsible: "IMOTION + Client"
        },
        {
          step: 2,
          title: "Priorisation des actions",
          description: "Définition du plan d'action avec budget et planning",
          deadline: "Semaine 2",
          responsible: "Client"
        },
        {
          step: 3,
          title: "Proposition commerciale détaillée",
          description: "Chiffrage précis des prestations prioritaires",
          deadline: "Semaine 3",
          responsible: "IMOTION"
        },
        {
          step: 4,
          title: "Démarrage des quick-wins",
          description: "Mise en place MFA et formation équipes",
          deadline: "Mois 2",
          responsible: "IMOTION"
        }
      ],
      commercial_hook: "TechCatalan dispose d'une base solide (score global 67.5/100) avec une infrastructure Apple bien établie. Nos recommandations permettraient d'atteindre un score de 85/100 sous 6 mois, avec un ROI mesurable dès le 3ème trimestre. Budget total estimé: 93k€ HT pour un gain de productivité de 35% et une réduction des risques de sécurité de 80%.",
      imotion_signature: {
        company: "IMOTION",
        tagline: "Intégrateur Apple & IA — Modernisation, automatisation, service managé",
        contact: {
          email: "contact@imotion.tech",
          phone: "+33 1 23 45 67 89",
          website: "https://www.imotion.tech"
        },
        certifications: [
          "Apple Authorized Reseller",
          "Microsoft Gold Partner",
          "ISO 27001 Certifié"
        ]
      },
      metadata: {
        generated_at: new Date().toISOString(),
        format_version: "1.0",
        audit_duration_hours: 8,
        auditor: "Expert IMOTION - Transformation Digitale"
      }
    };

    console.log("Audit de démonstration généré avec succès");

    return new Response(JSON.stringify(demoAudit, null, 2), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (error: any) {
    console.error("Erreur génération audit démo:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
