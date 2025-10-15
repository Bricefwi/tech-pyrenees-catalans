-- Migration pour améliorer l'audit avec des questions professionnelles

-- Suppression des anciennes données et structure
TRUNCATE TABLE audit_questions CASCADE;
TRUNCATE TABLE audit_criteria CASCADE;
TRUNCATE TABLE audit_sectors CASCADE;

-- Nouveaux secteurs d'audit orientés business
INSERT INTO audit_sectors (name, description, order_index) VALUES
('digitalisation', 'Niveau de digitalisation et outils actuels', 1),
('productivite', 'Productivité et automatisation des processus', 2),
('communication', 'Communication interne et externe', 3),
('visibilite', 'Visibilité et présence digitale', 4),
('gestion', 'Gestion administrative et commerciale', 5);

-- Critères pour Digitalisation
INSERT INTO audit_criteria (sector_id, name, description, max_score, order_index)
SELECT id, 'Outils actuels', 'Quels outils digitaux utilisez-vous actuellement ?', 10, 1
FROM audit_sectors WHERE name = 'digitalisation';

INSERT INTO audit_criteria (sector_id, name, description, max_score, order_index)
SELECT id, 'Collaboration', 'Comment gérez-vous la collaboration en équipe ?', 10, 2
FROM audit_sectors WHERE name = 'digitalisation';

-- Critères pour Productivité
INSERT INTO audit_criteria (sector_id, name, description, max_score, order_index)
SELECT id, 'Processus manuels', 'Quels processus sont encore manuels ?', 10, 1
FROM audit_sectors WHERE name = 'productivite';

INSERT INTO audit_criteria (sector_id, name, description, max_score, order_index)
SELECT id, 'Automatisation', 'Avez-vous automatisé certaines tâches ?', 10, 2
FROM audit_sectors WHERE name = 'productivite';

-- Critères pour Communication
INSERT INTO audit_criteria (sector_id, name, description, max_score, order_index)
SELECT id, 'Onboarding', 'Comment intégrez-vous vos nouveaux collaborateurs ?', 10, 1
FROM audit_sectors WHERE name = 'communication';

INSERT INTO audit_criteria (sector_id, name, description, max_score, order_index)
SELECT id, 'Partage info', 'Comment partagez-vous les informations importantes ?', 10, 2
FROM audit_sectors WHERE name = 'communication';

-- Critères pour Visibilité
INSERT INTO audit_criteria (sector_id, name, description, max_score, order_index)
SELECT id, 'Présence web', 'Quelle est votre présence en ligne ?', 10, 1
FROM audit_sectors WHERE name = 'visibilite';

INSERT INTO audit_criteria (sector_id, name, description, max_score, order_index)
SELECT id, 'Marketing digital', 'Utilisez-vous le marketing digital ?', 10, 2
FROM audit_sectors WHERE name = 'visibilite';

-- Critères pour Gestion
INSERT INTO audit_criteria (sector_id, name, description, max_score, order_index)
SELECT id, 'Devis/Factures', 'Comment gérez-vous devis et factures ?', 10, 1
FROM audit_sectors WHERE name = 'gestion';

INSERT INTO audit_criteria (sector_id, name, description, max_score, order_index)
SELECT id, 'CRM', 'Avez-vous un système de gestion client ?', 10, 2
FROM audit_sectors WHERE name = 'gestion';

-- Questions pour Digitalisation - Outils actuels
INSERT INTO audit_questions (criterion_id, question_text, question_type, options, weight, order_index)
SELECT id, 
  'Quels outils utilisez-vous pour gérer votre activité ?',
  'rating',
  jsonb_build_array(
    jsonb_build_object('value', '0', 'label', 'Aucun outil digital'),
    jsonb_build_object('value', '5', 'label', 'Quelques outils basiques (email, Excel)'),
    jsonb_build_object('value', '10', 'label', 'Suite d''outils intégrés')
  ),
  1,
  1
FROM audit_criteria WHERE name = 'Outils actuels';

-- Questions pour Productivité - Automatisation
INSERT INTO audit_questions (criterion_id, question_text, question_type, options, weight, order_index)
SELECT id,
  'Combien de temps passez-vous sur des tâches répétitives par semaine ?',
  'rating',
  jsonb_build_array(
    jsonb_build_object('value', '10', 'label', 'Moins de 2h (excellent)'),
    jsonb_build_object('value', '5', 'label', 'Entre 2h et 10h (moyen)'),
    jsonb_build_object('value', '0', 'label', 'Plus de 10h (à améliorer)')
  ),
  1,
  1
FROM audit_criteria WHERE name = 'Automatisation';

-- Questions pour Communication - Onboarding
INSERT INTO audit_questions (criterion_id, question_text, question_type, options, weight, order_index)
SELECT id,
  'Comment se passe l''intégration des nouveaux collaborateurs ?',
  'rating',
  jsonb_build_array(
    jsonb_build_object('value', '0', 'label', 'Processus informel, non documenté'),
    jsonb_build_object('value', '5', 'label', 'Documentation papier/email'),
    jsonb_build_object('value', '10', 'label', 'Plateforme d''onboarding digitale')
  ),
  1,
  1
FROM audit_criteria WHERE name = 'Onboarding';

-- Questions pour Visibilité - Présence web
INSERT INTO audit_questions (criterion_id, question_text, question_type, options, weight, order_index)
SELECT id,
  'Quelle est votre présence digitale actuelle ?',
  'rating',
  jsonb_build_array(
    jsonb_build_object('value', '0', 'label', 'Pas de site web'),
    jsonb_build_object('value', '5', 'label', 'Site vitrine basique'),
    jsonb_build_object('value', '10', 'label', 'Site moderne + réseaux sociaux actifs')
  ),
  1,
  1
FROM audit_criteria WHERE name = 'Présence web';

-- Questions pour Gestion - Devis/Factures
INSERT INTO audit_questions (criterion_id, question_text, question_type, options, weight, order_index)
SELECT id,
  'Comment gérez-vous vos devis et factures ?',
  'rating',
  jsonb_build_array(
    jsonb_build_object('value', '0', 'label', 'Manuellement (Word/Excel)'),
    jsonb_build_object('value', '5', 'label', 'Logiciel de facturation basique'),
    jsonb_build_object('value', '10', 'label', 'Solution automatisée avec CRM')
  ),
  1,
  1
FROM audit_criteria WHERE name = 'Devis/Factures';