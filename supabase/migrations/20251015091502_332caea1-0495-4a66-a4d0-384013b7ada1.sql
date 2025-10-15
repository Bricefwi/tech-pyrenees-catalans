-- Create sectors table
CREATE TABLE IF NOT EXISTS public.audit_sectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  order_index integer NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Create criteria table
CREATE TABLE IF NOT EXISTS public.audit_criteria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id uuid REFERENCES public.audit_sectors(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  order_index integer NOT NULL,
  max_score numeric NOT NULL DEFAULT 10,
  created_at timestamp with time zone DEFAULT now()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS public.audit_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  criterion_id uuid REFERENCES public.audit_criteria(id) ON DELETE CASCADE NOT NULL,
  question_text text NOT NULL,
  question_type text NOT NULL DEFAULT 'rating', -- rating, yes_no, multiple_choice, text
  options jsonb,
  order_index integer NOT NULL,
  weight numeric DEFAULT 1,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (read-only for authenticated users, admins can manage)
CREATE POLICY "Sectors are viewable by authenticated users"
ON public.audit_sectors FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Criteria are viewable by authenticated users"
ON public.audit_criteria FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Questions are viewable by authenticated users"
ON public.audit_questions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage sectors"
ON public.audit_sectors FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage criteria"
ON public.audit_criteria FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage questions"
ON public.audit_questions FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Insert initial sectors
INSERT INTO public.audit_sectors (name, description, order_index) VALUES
('Communication & Marketing', 'Évaluation des outils de communication et stratégie marketing digitale', 1),
('Gestion de Projet', 'Organisation et suivi des projets, collaboration d''équipe', 2),
('Relation Client (CRM)', 'Gestion des contacts, suivi des opportunités et service client', 3),
('Ressources Humaines', 'Recrutement, onboarding, formation et gestion des talents', 4),
('Finance & Comptabilité', 'Facturation, gestion budgétaire et reporting financier', 5),
('Opérations & Productivité', 'Automatisation des tâches, workflows et productivité', 6),
('Données & Analytics', 'Collecte, analyse et visualisation des données', 7);

-- Insert criteria and questions for Communication & Marketing
INSERT INTO public.audit_criteria (sector_id, name, description, order_index, max_score)
SELECT id, 'Présence en ligne', 'Site web, réseaux sociaux, référencement', 1, 10
FROM public.audit_sectors WHERE name = 'Communication & Marketing';

INSERT INTO public.audit_questions (criterion_id, question_text, question_type, order_index)
SELECT id, 'Possédez-vous un site web professionnel et à jour ?', 'rating', 1
FROM public.audit_criteria WHERE name = 'Présence en ligne';

INSERT INTO public.audit_questions (criterion_id, question_text, question_type, order_index)
SELECT id, 'Utilisez-vous des outils pour gérer vos réseaux sociaux ?', 'rating', 2
FROM public.audit_criteria WHERE name = 'Présence en ligne';

INSERT INTO public.audit_questions (criterion_id, question_text, question_type, order_index)
SELECT id, 'Suivez-vous vos performances SEO et analytics web ?', 'rating', 3
FROM public.audit_criteria WHERE name = 'Présence en ligne';

INSERT INTO public.audit_criteria (sector_id, name, description, order_index, max_score)
SELECT id, 'Email Marketing', 'Campagnes email, newsletters, automation', 2, 10
FROM public.audit_sectors WHERE name = 'Communication & Marketing';

INSERT INTO public.audit_questions (criterion_id, question_text, question_type, order_index)
SELECT id, 'Disposez-vous d''un outil d''email marketing professionnel ?', 'rating', 1
FROM public.audit_criteria WHERE name = 'Email Marketing';

INSERT INTO public.audit_questions (criterion_id, question_text, question_type, order_index)
SELECT id, 'Vos campagnes email sont-elles automatisées et segmentées ?', 'rating', 2
FROM public.audit_criteria WHERE name = 'Email Marketing';

-- Insert criteria and questions for Gestion de Projet
INSERT INTO public.audit_criteria (sector_id, name, description, order_index, max_score)
SELECT id, 'Organisation du travail', 'Planification, suivi des tâches, collaboration', 1, 10
FROM public.audit_sectors WHERE name = 'Gestion de Projet';

INSERT INTO public.audit_questions (criterion_id, question_text, question_type, order_index)
SELECT id, 'Utilisez-vous un outil de gestion de projet (type Trello, Asana, Monday) ?', 'rating', 1
FROM public.audit_criteria WHERE name = 'Organisation du travail';

INSERT INTO public.audit_questions (criterion_id, question_text, question_type, order_index)
SELECT id, 'Les membres de l''équipe collaborent-ils efficacement sur les projets ?', 'rating', 2
FROM public.audit_criteria WHERE name = 'Organisation du travail';

INSERT INTO public.audit_questions (criterion_id, question_text, question_type, order_index)
SELECT id, 'Suivez-vous les délais et les budgets de vos projets ?', 'rating', 3
FROM public.audit_criteria WHERE name = 'Organisation du travail';

-- Insert criteria and questions for CRM
INSERT INTO public.audit_criteria (sector_id, name, description, order_index, max_score)
SELECT id, 'Gestion des contacts', 'Base de données clients, historique des interactions', 1, 10
FROM public.audit_sectors WHERE name = 'Relation Client (CRM)';

INSERT INTO public.audit_questions (criterion_id, question_text, question_type, order_index)
SELECT id, 'Disposez-vous d''un CRM centralisé pour gérer vos contacts ?', 'rating', 1
FROM public.audit_criteria WHERE name = 'Gestion des contacts';

INSERT INTO public.audit_questions (criterion_id, question_text, question_type, order_index)
SELECT id, 'Votre équipe a-t-elle accès à l''historique complet des interactions clients ?', 'rating', 2
FROM public.audit_criteria WHERE name = 'Gestion des contacts';

INSERT INTO public.audit_criteria (sector_id, name, description, order_index, max_score)
SELECT id, 'Suivi des ventes', 'Pipeline, opportunités, prévisions', 2, 10
FROM public.audit_sectors WHERE name = 'Relation Client (CRM)';

INSERT INTO public.audit_questions (criterion_id, question_text, question_type, order_index)
SELECT id, 'Suivez-vous vos opportunités de vente dans un pipeline structuré ?', 'rating', 1
FROM public.audit_criteria WHERE name = 'Suivi des ventes';

-- Insert criteria and questions for RH
INSERT INTO public.audit_criteria (sector_id, name, description, order_index, max_score)
SELECT id, 'Recrutement', 'Processus de recrutement, suivi des candidatures', 1, 10
FROM public.audit_sectors WHERE name = 'Ressources Humaines';

INSERT INTO public.audit_questions (criterion_id, question_text, question_type, order_index)
SELECT id, 'Utilisez-vous un ATS (système de suivi des candidatures) ?', 'rating', 1
FROM public.audit_criteria WHERE name = 'Recrutement';

INSERT INTO public.audit_questions (criterion_id, question_text, question_type, order_index)
SELECT id, 'Le processus de recrutement est-il digitalisé et fluide ?', 'rating', 2
FROM public.audit_criteria WHERE name = 'Recrutement';

INSERT INTO public.audit_criteria (sector_id, name, description, order_index, max_score)
SELECT id, 'Gestion des employés', 'Onboarding, formation, évaluation', 2, 10
FROM public.audit_sectors WHERE name = 'Ressources Humaines';

INSERT INTO public.audit_questions (criterion_id, question_text, question_type, order_index)
SELECT id, 'Avez-vous un processus d''onboarding structuré et digitalisé ?', 'rating', 1
FROM public.audit_criteria WHERE name = 'Gestion des employés';

-- Insert criteria and questions for Finance
INSERT INTO public.audit_criteria (sector_id, name, description, order_index, max_score)
SELECT id, 'Facturation', 'Création et suivi des factures, paiements', 1, 10
FROM public.audit_sectors WHERE name = 'Finance & Comptabilité';

INSERT INTO public.audit_questions (criterion_id, question_text, question_type, order_index)
SELECT id, 'Utilisez-vous un logiciel de facturation automatisé ?', 'rating', 1
FROM public.audit_criteria WHERE name = 'Facturation';

INSERT INTO public.audit_questions (criterion_id, question_text, question_type, order_index)
SELECT id, 'Le suivi des paiements est-il automatisé ?', 'rating', 2
FROM public.audit_criteria WHERE name = 'Facturation';

INSERT INTO public.audit_criteria (sector_id, name, description, order_index, max_score)
SELECT id, 'Reporting financier', 'Tableaux de bord, prévisions, analyse', 2, 10
FROM public.audit_sectors WHERE name = 'Finance & Comptabilité';

INSERT INTO public.audit_questions (criterion_id, question_text, question_type, order_index)
SELECT id, 'Disposez-vous de tableaux de bord financiers en temps réel ?', 'rating', 1
FROM public.audit_criteria WHERE name = 'Reporting financier';

-- Insert criteria and questions for Operations
INSERT INTO public.audit_criteria (sector_id, name, description, order_index, max_score)
SELECT id, 'Automatisation', 'Workflows automatisés, intégrations', 1, 10
FROM public.audit_sectors WHERE name = 'Opérations & Productivité';

INSERT INTO public.audit_questions (criterion_id, question_text, question_type, order_index)
SELECT id, 'Utilisez-vous des outils d''automatisation (Zapier, Make, n8n) ?', 'rating', 1
FROM public.audit_criteria WHERE name = 'Automatisation';

INSERT INTO public.audit_questions (criterion_id, question_text, question_type, order_index)
SELECT id, 'Vos applications sont-elles intégrées entre elles ?', 'rating', 2
FROM public.audit_criteria WHERE name = 'Automatisation';

-- Insert criteria and questions for Data Analytics
INSERT INTO public.audit_criteria (sector_id, name, description, order_index, max_score)
SELECT id, 'Collecte de données', 'Sources, centralisation, qualité', 1, 10
FROM public.audit_sectors WHERE name = 'Données & Analytics';

INSERT INTO public.audit_questions (criterion_id, question_text, question_type, order_index)
SELECT id, 'Vos données sont-elles centralisées dans une base unique ?', 'rating', 1
FROM public.audit_criteria WHERE name = 'Collecte de données';

INSERT INTO public.audit_criteria (sector_id, name, description, order_index, max_score)
SELECT id, 'Visualisation', 'Dashboards, reporting, KPIs', 2, 10
FROM public.audit_sectors WHERE name = 'Données & Analytics';

INSERT INTO public.audit_questions (criterion_id, question_text, question_type, order_index)
SELECT id, 'Utilisez-vous des outils de BI (Business Intelligence) pour visualiser vos données ?', 'rating', 1
FROM public.audit_criteria WHERE name = 'Visualisation';