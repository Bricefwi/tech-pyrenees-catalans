-- Mise à jour de la table ia_solutions avec les nouveaux champs
ALTER TABLE ia_solutions 
  DROP COLUMN IF EXISTS benefit,
  DROP COLUMN IF EXISTS visual,
  ADD COLUMN IF NOT EXISTS highlight text,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS napkin_url text;

-- Supprimer les anciennes données et insérer les nouvelles
DELETE FROM ia_solutions;

INSERT INTO ia_solutions (title, description, highlight, image_url, napkin_url, color) VALUES
(
  'Optimisation du service client avec l''IA conversationnelle',
  'Mise en place d''un chatbot intelligent pour répondre 24/7, réduire le temps de réponse et qualifier les demandes automatiquement.',
  'Temps de traitement réduit de 65% et satisfaction client +22%',
  'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&h=600&fit=crop',
  'https://www.napkin.ai',
  '#E11932'
),
(
  'Automatisation des tâches administratives répétitives',
  'Utilisation de scénarios no-code pour automatiser la saisie de données, l''émission de devis ou les relances clients.',
  'Gain de 8h par semaine / employé',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',
  'https://www.napkin.ai',
  '#222'
),
(
  'Analyse prédictive des ventes via IA',
  'Création d''un modèle prédictif basé sur les historiques de ventes et comportements clients pour anticiper la demande.',
  'Amélioration de la planification et réduction des invendus de 18%',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
  'https://www.napkin.ai',
  '#555'
),
(
  'Contrôle qualité assisté par IA',
  'Détection automatique des anomalies à partir de photos ou données capteurs. Idéal pour l''industrie et la logistique.',
  'Taux d''erreurs réduit de 35% dès 3 semaines',
  'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800&h=600&fit=crop',
  'https://www.napkin.ai',
  '#E11932'
);