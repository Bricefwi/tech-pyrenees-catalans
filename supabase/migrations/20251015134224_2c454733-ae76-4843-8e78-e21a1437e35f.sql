-- Reconstruire les tables d'audit avec la nouvelle structure
DROP TABLE IF EXISTS audit_responses CASCADE;
DROP TABLE IF EXISTS audit_questions CASCADE;
DROP TABLE IF EXISTS audit_criteria CASCADE;
DROP TABLE IF EXISTS audit_sectors CASCADE;

-- Créer la table des secteurs d'audit
CREATE TABLE public.audit_sectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  weighting numeric NOT NULL, -- Pondération en pourcentage
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Créer la table des questions d'audit
CREATE TABLE public.audit_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id uuid REFERENCES audit_sectors(id) ON DELETE CASCADE NOT NULL,
  subdomain text NOT NULL,
  question_text text NOT NULL,
  response_type text NOT NULL CHECK (response_type IN ('yes_no', 'yes_no_partial', 'low_medium_high', 'hours')),
  weighting numeric NOT NULL, -- Pondération de la question
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Créer la table des réponses d'audit
CREATE TABLE public.audit_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id uuid REFERENCES audits(id) ON DELETE CASCADE NOT NULL,
  question_id uuid REFERENCES audit_questions(id) ON DELETE CASCADE NOT NULL,
  response_value text NOT NULL,
  score numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.audit_sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_responses ENABLE ROW LEVEL SECURITY;

-- Policies pour audit_sectors
CREATE POLICY "Sectors viewable by all" ON audit_sectors FOR SELECT USING (true);
CREATE POLICY "Admins can manage sectors" ON audit_sectors FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Policies pour audit_questions
CREATE POLICY "Questions viewable by all" ON audit_questions FOR SELECT USING (true);
CREATE POLICY "Admins can manage questions" ON audit_questions FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Policies pour audit_responses
CREATE POLICY "Users can view their responses" ON audit_responses FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM audits a
    WHERE a.id = audit_responses.audit_id 
    AND (a.created_by = auth.uid() OR a.created_by IS NULL)
  )
);

CREATE POLICY "Users can insert their responses" ON audit_responses FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM audits a
    WHERE a.id = audit_responses.audit_id 
    AND (a.created_by = auth.uid() OR a.created_by IS NULL)
  )
);

CREATE POLICY "Admins can manage all responses" ON audit_responses FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Insérer les secteurs d'audit avec pondération
INSERT INTO audit_sectors (name, description, weighting, order_index) VALUES
('Marketing & Communication', 'Identifier la maturité digitale et la cohérence de la communication', 15, 1),
('Organisation & Process', 'Mesurer l''efficacité des flux internes', 20, 2),
('Financier & Gestion', 'Évaluer la rigueur de gestion et le pilotage de la rentabilité', 15, 3),
('Administratif', 'Gestion documentaire et workflows', 10, 4),
('Veille & Innovation', 'Évaluer la proactivité face aux évolutions du marché', 10, 5),
('Outils & Technologies', 'Identifier le niveau d''adoption du numérique et du NoCode', 15, 6),
('RH & Formation', 'Mesurer la capacité d''adaptation et d''apprentissage', 10, 7),
('Commercial & Relation Client', 'Identifier les opportunités d''automatisation du cycle de vente', 5, 8);

-- Insérer toutes les questions d'audit basées sur l'Excel
-- Marketing & Communication
INSERT INTO audit_questions (sector_id, subdomain, question_text, response_type, weighting, order_index)
SELECT id, 'Présence digitale', 'Avez-vous un site web à jour et connecté à vos outils métiers ?', 'yes_no', 15, 1
FROM audit_sectors WHERE name = 'Marketing & Communication';

INSERT INTO audit_questions (sector_id, subdomain, question_text, response_type, weighting, order_index)
SELECT id, 'CRM et fidélisation', 'Disposez-vous d''un CRM ou d''une base clients structurée ?', 'yes_no_partial', 10, 2
FROM audit_sectors WHERE name = 'Marketing & Communication';

INSERT INTO audit_questions (sector_id, subdomain, question_text, response_type, weighting, order_index)
SELECT id, 'Suivi des performances', 'Suivez-vous les performances de vos actions marketing (KPI, ROI) ?', 'yes_no_partial', 10, 3
FROM audit_sectors WHERE name = 'Marketing & Communication';

INSERT INTO audit_questions (sector_id, subdomain, question_text, response_type, weighting, order_index)
SELECT id, 'Automatisation', 'Utilisez-vous des automatisations pour vos campagnes (emailing, SMS, relances) ?', 'yes_no_partial', 10, 4
FROM audit_sectors WHERE name = 'Marketing & Communication';

INSERT INTO audit_questions (sector_id, subdomain, question_text, response_type, weighting, order_index)
SELECT id, 'Réseaux sociaux', 'Votre communication est-elle planifiée et mesurée ?', 'yes_no_partial', 10, 5
FROM audit_sectors WHERE name = 'Marketing & Communication';

-- Organisation & Process
INSERT INTO audit_questions (sector_id, subdomain, question_text, response_type, weighting, order_index)
SELECT id, 'Documentation', 'Les tâches récurrentes sont-elles documentées ?', 'yes_no_partial', 10, 1
FROM audit_sectors WHERE name = 'Organisation & Process';

INSERT INTO audit_questions (sector_id, subdomain, question_text, response_type, weighting, order_index)
SELECT id, 'Intégration des outils', 'Les outils utilisés sont-ils interconnectés ?', 'yes_no_partial', 10, 2
FROM audit_sectors WHERE name = 'Organisation & Process';

INSERT INTO audit_questions (sector_id, subdomain, question_text, response_type, weighting, order_index)
SELECT id, 'Flux de données', 'Les données circulent-elles sans ressaisie ?', 'yes_no_partial', 10, 3
FROM audit_sectors WHERE name = 'Organisation & Process';

INSERT INTO audit_questions (sector_id, subdomain, question_text, response_type, weighting, order_index)
SELECT id, 'Temps perdu', 'Estimez-vous le temps perdu hebdomadaire sur des tâches répétitives ?', 'hours', 10, 4
FROM audit_sectors WHERE name = 'Organisation & Process';

INSERT INTO audit_questions (sector_id, subdomain, question_text, response_type, weighting, order_index)
SELECT id, 'Optimisation', 'Disposez-vous de processus optimisés (lean, agile, etc.) ?', 'yes_no_partial', 10, 5
FROM audit_sectors WHERE name = 'Organisation & Process';

-- Financier & Gestion
INSERT INTO audit_questions (sector_id, subdomain, question_text, response_type, weighting, order_index)
SELECT id, 'Pilotage', 'Disposez-vous d''un tableau de bord financier (marge, trésorerie, etc.) ?', 'yes_no', 10, 1
FROM audit_sectors WHERE name = 'Financier & Gestion';

INSERT INTO audit_questions (sector_id, subdomain, question_text, response_type, weighting, order_index)
SELECT id, 'Facturation', 'Le suivi des factures et relances est-il automatisé ?', 'yes_no_partial', 10, 2
FROM audit_sectors WHERE name = 'Financier & Gestion';

INSERT INTO audit_questions (sector_id, subdomain, question_text, response_type, weighting, order_index)
SELECT id, 'Analyse', 'Avez-vous des outils simples pour l''analyse financière ?', 'yes_no_partial', 10, 3
FROM audit_sectors WHERE name = 'Financier & Gestion';

INSERT INTO audit_questions (sector_id, subdomain, question_text, response_type, weighting, order_index)
SELECT id, 'Budget', 'Avez-vous un budget d''investissement innovation ?', 'yes_no', 10, 4
FROM audit_sectors WHERE name = 'Financier & Gestion';

-- Administratif
INSERT INTO audit_questions (sector_id, subdomain, question_text, response_type, weighting, order_index)
SELECT id, 'Gestion documentaire', 'Les documents sont-ils centralisés et dématérialisés ?', 'yes_no_partial', 10, 1
FROM audit_sectors WHERE name = 'Administratif';

INSERT INTO audit_questions (sector_id, subdomain, question_text, response_type, weighting, order_index)
SELECT id, 'Workflows internes', 'Les validations internes sont-elles automatisées ?', 'yes_no_partial', 10, 2
FROM audit_sectors WHERE name = 'Administratif';

INSERT INTO audit_questions (sector_id, subdomain, question_text, response_type, weighting, order_index)
SELECT id, 'Dématérialisation', 'Quel est votre niveau de dématérialisation administrative ?', 'low_medium_high', 10, 3
FROM audit_sectors WHERE name = 'Administratif';

INSERT INTO audit_questions (sector_id, subdomain, question_text, response_type, weighting, order_index)
SELECT id, 'Comptabilité', 'Les exports comptables sont-ils automatisés ?', 'yes_no_partial', 10, 4
FROM audit_sectors WHERE name = 'Administratif';

-- Veille & Innovation
INSERT INTO audit_questions (sector_id, subdomain, question_text, response_type, weighting, order_index)
SELECT id, 'Surveillance marché', 'Suivez-vous les tendances du marché et vos concurrents ?', 'yes_no', 10, 1
FROM audit_sectors WHERE name = 'Veille & Innovation';

INSERT INTO audit_questions (sector_id, subdomain, question_text, response_type, weighting, order_index)
SELECT id, 'Outils IA', 'Utilisez-vous des outils IA pour la veille (ChatGPT, Perplexity, etc.) ?', 'yes_no_partial', 10, 2
FROM audit_sectors WHERE name = 'Veille & Innovation';

INSERT INTO audit_questions (sector_id, subdomain, question_text, response_type, weighting, order_index)
SELECT id, 'Amélioration continue', 'Avez-vous un processus formalisé d''innovation ?', 'yes_no_partial', 10, 3
FROM audit_sectors WHERE name = 'Veille & Innovation';

-- Outils & Technologies
INSERT INTO audit_questions (sector_id, subdomain, question_text, response_type, weighting, order_index)
SELECT id, 'Adoption numérique', 'Quel est votre niveau d''usage des outils numériques ?', 'low_medium_high', 10, 1
FROM audit_sectors WHERE name = 'Outils & Technologies';

INSERT INTO audit_questions (sector_id, subdomain, question_text, response_type, weighting, order_index)
SELECT id, 'Interopérabilité', 'Les outils métiers sont-ils interconnectés ?', 'yes_no_partial', 10, 2
FROM audit_sectors WHERE name = 'Outils & Technologies';

INSERT INTO audit_questions (sector_id, subdomain, question_text, response_type, weighting, order_index)
SELECT id, 'Sécurité & RGPD', 'Les données sont-elles sécurisées et conformes RGPD ?', 'yes_no_partial', 10, 3
FROM audit_sectors WHERE name = 'Outils & Technologies';