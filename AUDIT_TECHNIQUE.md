# Audit Technique IMOTION - Documentation Complète

## 1. Schéma Supabase - Tables & Policies

### Tables principales

#### `profiles`
```sql
-- Table des profils utilisateurs
Colonnes: id, user_id, full_name, email, phone, company_id, is_professional, 
          company_name, siret_siren, business_sector, street_address, postal_code, 
          city, country, profile_completed, cgu_accepted, cgu_accepted_at

RLS Policies:
- "Profiles are viewable by everyone" (SELECT): true
- "Users can insert their own profile" (INSERT): auth.uid() = user_id
- "Users can update their own profile" (UPDATE): auth.uid() = user_id
```

#### `companies`
```sql
-- Table des entreprises
Colonnes: id, name, siret_siren, business_sector, email, phone, website,
          street_address, postal_code, city, country, is_individual, notes

RLS Policies:
- "Admins can manage all companies" (ALL): has_role(auth.uid(), 'admin')
- "Companies viewable by everyone" (SELECT): true
- "Users can insert companies" (INSERT): true
- "Users can update their own company" (UPDATE): EXISTS (profile match)
```

#### `service_requests`
```sql
-- Table des demandes de service
Colonnes: id, client_user_id, profile_id, request_number, title, description,
          service_type, business_sector, status, priority, quote_status, 
          date_status, admin_notes, ai_specifications, admin_ai_proposals,
          estimated_duration, estimated_cost, device_info

RLS Policies:
- "Admins can view all service requests" (SELECT): has_role(auth.uid(), 'admin')
- "Admins can update all service requests" (UPDATE): has_role(auth.uid(), 'admin')
- "Authenticated users can create service requests" (INSERT): client_user_id = auth.uid()
- "Clients can view their own service requests" (SELECT): client_user_id = auth.uid()
- "Clients can update their own service requests" (UPDATE): client_user_id = auth.uid()
```

#### `audits`
```sql
-- Table des audits numériques
Colonnes: id, company_id, created_by, status, current_sector, current_question_index,
          global_score, generated_report, report_generated_at, completed_at

RLS Policies:
- "Admins can manage audits" (ALL): has_role(auth.uid(), 'admin')
- "Users can create audits" (INSERT): created_by = auth.uid()
- "Users can view their audits" (SELECT): created_by = auth.uid()
- "Users can update their audits" (UPDATE): created_by = auth.uid()
```

#### `audited_companies`
```sql
-- Table des entreprises auditées
Colonnes: id, name, sector, size, contact_name, contact_email, contact_phone, created_by

RLS Policies:
- "Admins can manage companies" (ALL): has_role(auth.uid(), 'admin')
- "Users can create companies" (INSERT): created_by = auth.uid()
- "Users can view their companies" (SELECT): created_by = auth.uid()
```

#### `audit_sectors`
```sql
-- Table des secteurs d'audit
Colonnes: id, name, description, order_index, weighting

RLS Policies:
- "Admins can manage sectors" (ALL): has_role(auth.uid(), 'admin')
- "Sectors viewable by all" (SELECT): true
```

#### `audit_questions`
```sql
-- Table des questions d'audit
Colonnes: id, sector_id, subdomain, question_text, response_type, weighting, order_index

RLS Policies:
- "Admins can manage questions" (ALL): has_role(auth.uid(), 'admin')
- "Questions viewable by all" (SELECT): true
```

#### `audit_responses`
```sql
-- Table des réponses d'audit
Colonnes: id, audit_id, question_id, response_value, score

RLS Policies:
- "Admins can manage all responses" (ALL): has_role(auth.uid(), 'admin')
- "Users can insert their responses" (INSERT): EXISTS (audit match)
- "Users can view their responses" (SELECT): EXISTS (audit match)
```

#### `sector_comments`
```sql
-- Table des commentaires par secteur
Colonnes: id, audit_id, sector_id, comment

RLS Policies:
- "Admins can manage all sector comments" (ALL): has_role(auth.uid(), 'admin')
- "Users can insert their sector comments" (INSERT): EXISTS (audit match)
- "Users can view their sector comments" (SELECT): EXISTS (audit match)
```

#### `quotes`
```sql
-- Table des devis
Colonnes: id, service_request_id, quote_number, description, amount, status,
          valid_until, created_by, sent_at, accepted_at, rejected_at, rejection_reason

RLS Policies:
- "Admins can manage quotes" (ALL): has_role(auth.uid(), 'admin')
- "Clients can view their quotes" (SELECT): EXISTS (service_request match)
```

#### `projects`
```sql
-- Table des projets
Colonnes: id, profile_id, request_id, title, description, status, client_name,
          start_date, end_date, progress, critical_points

RLS Policies:
- "Admins can manage all projects" (ALL): has_role(auth.uid(), 'admin')
- "Clients can view their own projects" (SELECT): profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
```

#### `interventions`
```sql
-- Table des interventions
Colonnes: id, quote_id, client_id, company_id, technician_id, title, status,
          start_date, end_date, planning, report_pdf_url

RLS Policies:
- "interventions_admin_all" (ALL): has_role(auth.uid(), 'admin')
- "interventions_client_read" (SELECT): client_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
```

#### `followups`
```sql
-- Table des suivis
Colonnes: id, project_id, client_id, type, notes, next_action, next_action_date

RLS Policies:
- "followups_admin_all" (ALL): has_role(auth.uid(), 'admin')
- "followups_client_read" (SELECT): client_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
```

#### `user_roles`
```sql
-- Table des rôles utilisateurs
Colonnes: id, user_id, role (enum: admin, client)

RLS Policies:
- "Admins can manage all roles" (ALL): has_role(auth.uid(), 'admin')
- "Admins can view all roles" (SELECT): has_role(auth.uid(), 'admin')
- "Allow first admin creation" (INSERT): role = 'admin' AND NOT EXISTS admin
- "Users can assign themselves client role" (INSERT): role = 'client' AND auth.uid() = user_id
- "Users can view their own roles" (SELECT): auth.uid() = user_id
```

#### `emails_logs`
```sql
-- Table des logs d'emails
Colonnes: id, recipient, subject, message, type, status, error_details, 
          pdf_url, related_request, related_profile, cc_admins

RLS Policies:
- "Admins can insert email logs" (INSERT): has_role(auth.uid(), 'admin')
- "Admins can view all email logs" (SELECT): has_role(auth.uid(), 'admin')
- "Users can view own email logs" (SELECT): related_profile IN (SELECT id FROM profiles WHERE user_id = auth.uid())
```

### Fonctions de base de données

```sql
-- Fonction pour vérifier les rôles (SECURITY DEFINER)
CREATE FUNCTION has_role(_user_id uuid, _role app_role) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public

-- Fonction pour générer les numéros de demande
CREATE FUNCTION generate_request_number() RETURNS text
-- Format: REQ-YYYY-XXXX

-- Fonction pour générer les numéros de devis
CREATE FUNCTION generate_quote_number() RETURNS text
-- Format: DEV-YYYY-XXXX

-- Fonction pour générer les numéros de commande
CREATE FUNCTION generate_order_number() RETURNS text
-- Format: CMD-YYYY-XXXX

-- Fonction pour gérer les timestamps updated_at
CREATE FUNCTION handle_updated_at() RETURNS trigger

-- Fonction pour créer automatiquement une entreprise pour un profil
CREATE FUNCTION ensure_company_for_profile() RETURNS trigger
```

---

## 2. Arborescence du projet

### `/src/pages/` - Pages principales
```
src/pages/
├── Index.tsx                    # Page d'accueil
├── Auth.tsx                     # Authentification
├── NotFound.tsx                 # Page 404
├── Contact.tsx                  # Page de contact
├── FAQ.tsx                      # Page FAQ
├── CGU.tsx                      # Conditions générales
├── CGV.tsx                      # Conditions de vente
├── Brand.tsx                    # Charte graphique
│
├── Audit.tsx                    # Page audit numérique (principal workflow)
├── CreateRequest.tsx            # Création de demande de service
├── ProfileCompletion.tsx        # Complétion du profil
│
├── ClientDashboard.tsx          # Dashboard client
├── ClientQuotes.tsx             # Devis clients
├── ClientProjects.tsx           # Projets clients
│
├── Admin.tsx                    # Dashboard admin principal
├── AdminDashboard.tsx           # Tableau de bord admin
├── AdminAudits.tsx              # Liste des audits (admin)
├── AdminQuotes.tsx              # Liste des devis (admin)
├── AdminProjects.tsx            # Liste des projets (admin)
├── AdminInterventions.tsx       # Liste des interventions (admin)
├── AdminFollowups.tsx           # Liste des suivis (admin)
├── AdminEmailLogs.tsx           # Logs d'emails (admin)
├── AdminSetup.tsx               # Configuration admin
├── AdminRequestChat.tsx         # Chat avec le client par demande
├── AdminProposal.tsx            # Création de proposition
├── AdminQuote.tsx               # Création de devis
├── AdminIntervention.tsx        # Gestion d'intervention
├── AdminPreReception.tsx        # Pré-réception
├── AdminProjectsDashboard.tsx   # Dashboard projets admin
├── ProjectDetail.tsx            # Détail d'un projet
│
├── AnalyzeSpecs.tsx             # Analyse de spécifications IA
├── AnalysesHistory.tsx          # Historique des analyses
├── ServiceSuggestions.tsx       # Suggestions de services
└── EmailPreview.tsx             # Prévisualisation d'email
```

### `/src/components/` - Composants
```
src/components/
├── Header.tsx                   # En-tête principal
├── Footer.tsx                   # Pied de page
├── Hero.tsx                     # Section hero
├── Services.tsx                 # Section services
├── FAQ.tsx                      # Section FAQ
├── ZoneIntervention.tsx         # Zone d'intervention
├── ContactDiagnostic.tsx        # Formulaire de contact/diagnostic
├── ChatAssistant.tsx            # Assistant de chat
├── CGUAcceptance.tsx            # Acceptation CGU
├── ProjectGantt.tsx             # Diagramme de Gantt
├── SeoSchema.tsx                # Schema.org SEO
│
├── layout/
│   ├── Header.tsx               # Header alternatif
│   └── Footer.tsx               # Footer alternatif
│
├── admin/
│   └── ProposalPDFGenerator.tsx # Générateur de PDF de proposition
│
└── ui/                          # Composants shadcn/ui
    ├── button.tsx
    ├── card.tsx
    ├── input.tsx
    ├── dialog.tsx
    ├── toast.tsx
    ├── badge.tsx
    ├── table.tsx
    ├── form.tsx
    ├── select.tsx
    ├── textarea.tsx
    ├── accordion.tsx
    ├── tabs.tsx
    ├── progress.tsx
    ├── radio-group.tsx
    ├── calendar.tsx
    ├── checkbox.tsx
    └── [40+ autres composants UI]
```

### `/src/lib/` - Bibliothèques et utilitaires
```
src/lib/
├── utils.ts                     # Utilitaires généraux
├── emailSender.ts               # Envoi d'emails
├── emailTemplates.ts            # Templates d'emails
├── pdfExport.ts                 # Export PDF
├── generateCharteSEO.ts         # Génération de charte SEO
└── aiAnalysis.ts                # Analyse IA
```

### `/supabase/functions/` - Edge Functions
```
supabase/functions/
├── analyze-project-specs/       # Analyse de spécifications projet
│   └── index.ts
├── chat-faq/                    # Chatbot FAQ
│   └── index.ts
├── diagnostic-chat/             # Chat de diagnostic
│   └── index.ts
├── generate-admin-proposals/    # Génération de propositions admin
│   └── index.ts
├── generate-audit-report/       # Génération de rapport d'audit
│   └── index.ts
├── generate-preReception-report/# Génération de rapport pré-réception
│   └── index.ts
├── generate-quote-pdf/          # Génération de PDF de devis
│   └── index.ts
├── generate-specifications/     # Génération de spécifications
│   └── index.ts
├── send-email/                  # Envoi d'email
│   └── index.ts
├── send-proposal-email/         # Envoi d'email de proposition
│   └── index.ts
└── workflow-hook/               # Hook de workflow
    └── index.ts
```

---

## 3. Package.json - Dépendances

### Dépendances principales
```json
{
  "dependencies": {
    "@hookform/resolvers": "^3.10.0",
    "@radix-ui/*": "Multiples composants UI",
    "@supabase/supabase-js": "^2.75.0",
    "@tanstack/react-query": "^5.83.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.30.1",
    "react-helmet-async": "^2.0.5",
    "react-hook-form": "^7.61.1",
    "zod": "^3.25.76",
    "lucide-react": "^0.462.0",
    "date-fns": "^3.6.0",
    "recharts": "^2.15.4",
    "frappe-gantt": "^1.0.4",
    "html2canvas": "^1.4.1",
    "html2pdf.js": "^0.12.1",
    "jspdf": "^3.0.3",
    "tailwindcss": "latest",
    "tailwindcss-animate": "^1.0.7"
  }
}
```

### Frameworks de test disponibles
- Aucun framework de test installé actuellement
- **Recommandations** :
  - `vitest` pour les tests unitaires
  - `@testing-library/react` pour les tests de composants
  - `playwright` ou `cypress` pour les tests E2E

---

## 4. Clé Supabase de test

### Informations actuelles
- **Project ID**: `nmlkqyhkygdajqaffzny`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (voir .env)

### Recommandations pour les tests
1. **Option 1** : Créer un nouveau projet Supabase dédié aux tests
   - Aller sur https://supabase.com
   - Créer un nouveau projet "imotion-test"
   - Exécuter le même schéma de migration

2. **Option 2** : Utiliser le projet actuel avec des données de test
   - Créer un utilisateur de test dédié
   - Marquer les données de test avec un flag spécifique
   - Nettoyer régulièrement les données de test

---

## 5. Fonctionnalités à valider - Matrice de tests

### 🔐 Authentification & Profils
- [ ] Inscription utilisateur (email + mot de passe)
- [ ] Connexion utilisateur
- [ ] Déconnexion
- [ ] Complétion du profil (particulier vs professionnel)
- [ ] Acceptation des CGU
- [ ] Mise à jour du profil
- [ ] Création automatique de l'entreprise pour un particulier

### 📋 Workflow Audit Numérique
- [ ] **Étape 1** : Formulaire informations entreprise
- [ ] **Étape 2** : Parcours des 8 secteurs d'audit
- [ ] **Étape 3** : Réponses aux questions par secteur
- [ ] **Étape 4** : Ajout de commentaires par secteur (optionnel)
- [ ] **Étape 5** : Navigation Précédent/Suivant entre secteurs
- [ ] **Étape 6** : Sauvegarde des réponses en temps réel
- [ ] **Étape 7** : Calcul du score par question
- [ ] **Étape 8** : Calcul du score global
- [ ] **Étape 9** : Génération du rapport IA via edge function
- [ ] **Étape 10** : Affichage du rapport généré
- [ ] **Étape 11** : Téléchargement du rapport en PDF
- [ ] **Étape 12** : Visualisation d'un audit existant (mode view)
- [ ] **Étape 13** : Cache du rapport généré pour performances

### 📝 Workflow Demande de Service
- [ ] **Création** : Formulaire de création de demande
- [ ] **Validation** : Génération automatique du numéro de demande (REQ-YYYY-XXXX)
- [ ] **Stockage** : Enregistrement dans service_requests
- [ ] **Notification** : Email de confirmation au client
- [ ] **Admin** : Visualisation de la demande côté admin
- [ ] **Chat** : Communication client-admin via messages

### 💰 Workflow Devis (Quote)
- [ ] **Admin** : Création d'un devis depuis une demande
- [ ] **Génération** : Numéro automatique (DEV-YYYY-XXXX)
- [ ] **PDF** : Génération du PDF du devis via edge function
- [ ] **Email** : Envoi du devis au client par email
- [ ] **Client** : Consultation du devis dans l'interface client
- [ ] **Validation** : Bouton "Valider le devis"
- [ ] **Rejet** : Bouton "Refuser le devis" avec motif
- [ ] **Workflow** : Validation → Création automatique d'un projet
- [ ] **Workflow** : Validation → Changement de statut

### 🚀 Workflow Projet
- [ ] **Création** : Création automatique après validation devis
- [ ] **Affichage** : Liste des projets côté admin
- [ ] **Affichage** : Liste des projets côté client
- [ ] **Détail** : Page de détail d'un projet
- [ ] **Gantt** : Affichage du diagramme de Gantt
- [ ] **Jalons** : Gestion des jalons du projet
- [ ] **Notes** : Ajout de notes (internes/client)
- [ ] **Progression** : Mise à jour du pourcentage de progression
- [ ] **Statut** : Changement de statut (pending/active/done)

### 🔧 Workflow Intervention
- [ ] **Création** : Création depuis un devis validé
- [ ] **Planning** : Définition des dates d'intervention
- [ ] **Planning** : Stockage du planning (JSON)
- [ ] **Technicien** : Assignment d'un technicien
- [ ] **Rapport** : Génération du rapport d'intervention PDF
- [ ] **Statut** : Suivi du statut de l'intervention
- [ ] **Client** : Consultation par le client

### 📧 Système d'emails
- [ ] **Confirmation** : Email de confirmation de demande
- [ ] **Devis** : Email d'envoi de devis avec PDF
- [ ] **Proposition** : Email de proposition admin
- [ ] **Audit** : Email de rapport d'audit
- [ ] **Logs** : Enregistrement dans emails_logs
- [ ] **Erreurs** : Gestion des erreurs d'envoi
- [ ] **Admin** : Consultation des logs par admin

### 🤖 Fonctionnalités IA
- [ ] **Analyse** : Analyse de spécifications projet (analyze-project-specs)
- [ ] **Chat FAQ** : Chatbot FAQ (chat-faq)
- [ ] **Diagnostic** : Chat de diagnostic (diagnostic-chat)
- [ ] **Propositions** : Génération de propositions admin (generate-admin-proposals)
- [ ] **Rapport Audit** : Génération de rapport d'audit (generate-audit-report)
- [ ] **Pré-réception** : Rapport de pré-réception (generate-preReception-report)
- [ ] **Spécifications** : Génération de spécifications (generate-specifications)

### 👨‍💼 Dashboard Admin
- [ ] **Accès** : Accès restreint aux admins (RLS)
- [ ] **Stats** : Statistiques globales
- [ ] **Audits** : Liste et gestion des audits
- [ ] **Devis** : Liste et gestion des devis
- [ ] **Projets** : Liste et gestion des projets
- [ ] **Interventions** : Liste et gestion des interventions
- [ ] **Suivis** : Liste et gestion des suivis
- [ ] **Emails** : Consultation des logs d'emails
- [ ] **Configuration** : Page de configuration admin

### 👤 Dashboard Client
- [ ] **Accès** : Accès aux données personnelles uniquement (RLS)
- [ ] **Audits** : Consultation des audits réalisés
- [ ] **Demandes** : Consultation des demandes de service
- [ ] **Devis** : Consultation et validation des devis
- [ ] **Projets** : Suivi des projets en cours
- [ ] **Actions** : Boutons d'action rapide

### 🔒 Sécurité & Permissions
- [ ] **RLS** : Toutes les tables ont RLS activé
- [ ] **Policies** : Policies admin via has_role()
- [ ] **Policies** : Policies client avec filtrage user_id
- [ ] **Roles** : Table user_roles séparée (pas de rôle sur profile)
- [ ] **Auth** : Vérification auth.uid() côté serveur
- [ ] **Edge Functions** : Pas d'exécution SQL brute
- [ ] **Secrets** : Utilisation de Supabase Secrets

### 🎨 UX/UI
- [ ] **Design** : Système de design cohérent (index.css)
- [ ] **Responsive** : Responsive sur mobile/tablette/desktop
- [ ] **Navigation** : Navigation claire entre les pages
- [ ] **Loading** : États de chargement
- [ ] **Erreurs** : Gestion des erreurs avec toasts
- [ ] **404** : Page 404 fonctionnelle
- [ ] **SEO** : Meta tags et Schema.org

---

## 6. Points critiques identifiés

### ⚠️ Erreurs actuelles
1. **Edge Function `generate-audit-report`** :
   - Erreur: "Could not find a relationship between 'audits' and 'profiles'"
   - La foreign key `audits_client_id_fkey` n'existe pas
   - **Solution** : Vérifier la requête SQL dans l'edge function

2. **Routes manquantes** (corrigées) :
   - `/admin/projects` ✅
   - `/admin/suivis` ✅
   - `/admin/journaux-de-courrier` ✅
   - `/client/tableau-de-bord` ✅

3. **Audit page** :
   - Bug "Secteur 1 sur 0" (corrigé)
   - Problème de chargement des secteurs en mode visualisation

### ⚠️ Manques détectés
1. **Tests** : Aucun framework de test installé
2. **Documentation** : Manque de documentation des edge functions
3. **Validation** : Pas de validation Zod systématique sur tous les formulaires
4. **Monitoring** : Pas de système de monitoring/alerting
5. **Logs** : Logs edge functions incomplets

### ⚠️ Recommandations
1. Installer un framework de tests (Vitest + React Testing Library + Playwright)
2. Ajouter des tests unitaires pour les fonctions critiques
3. Ajouter des tests E2E pour les workflows principaux
4. Améliorer la gestion d'erreurs dans les edge functions
5. Ajouter plus de logging pour le debugging
6. Documenter les edge functions
7. Créer un environnement de test isolé

---

## 7. Secrets Supabase configurés

- `SUPABASE_ANON_KEY` ✅
- `SUPABASE_DB_URL` ✅
- `SUPABASE_PUBLISHABLE_KEY` ✅
- `OPENAI_API_KEY` ✅
- `LOVABLE_API_KEY` ✅
- `RESEND_API_KEY` ✅
- `SUPABASE_URL` ✅
- `SUPABASE_SERVICE_ROLE_KEY` ✅

---

## 8. Storage Buckets

- `imotion-docs` (privé) - Documents et fichiers
- `imotion-tests` (privé) - Fichiers de test
