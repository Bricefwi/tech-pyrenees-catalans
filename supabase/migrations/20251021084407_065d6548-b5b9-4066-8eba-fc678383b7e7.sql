-- Table pour stocker les solutions IA
CREATE TABLE IF NOT EXISTS ia_solutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  benefit TEXT NOT NULL,
  visual TEXT NOT NULL,
  color TEXT DEFAULT '#E11932',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les analytics
CREATE TABLE IF NOT EXISTS ia_solution_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id UUID REFERENCES ia_solutions(id) ON DELETE CASCADE,
  event_type TEXT CHECK (event_type IN ('view', 'click')),
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Vue pour les statistiques
CREATE OR REPLACE VIEW ia_analytics_summary AS
SELECT 
  s.id,
  s.title,
  COUNT(a.id) AS total_interactions,
  SUM(CASE WHEN a.event_type='click' THEN 1 ELSE 0 END) AS clicks,
  SUM(CASE WHEN a.event_type='view' THEN 1 ELSE 0 END) AS views
FROM ia_solutions s
LEFT JOIN ia_solution_analytics a ON s.id = a.solution_id
GROUP BY s.id, s.title;

-- RLS policies
ALTER TABLE ia_solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ia_solution_analytics ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut voir les solutions
CREATE POLICY "Solutions viewable by everyone" ON ia_solutions
  FOR SELECT USING (true);

-- Admins peuvent gérer les solutions
CREATE POLICY "Admins can manage solutions" ON ia_solutions
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Tout le monde peut créer des analytics (via edge function)
CREATE POLICY "Analytics insertable by everyone" ON ia_solution_analytics
  FOR INSERT WITH CHECK (true);

-- Admins peuvent voir les analytics
CREATE POLICY "Admins can view analytics" ON ia_solution_analytics
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Données initiales
INSERT INTO ia_solutions (title, description, benefit, visual, color) VALUES
('Optimisation du service client avec l''IA conversationnelle', 'Mise en place d''un chatbot intelligent pour répondre 24/7, réduire le temps de réponse et qualifier les demandes automatiquement.', 'Temps de traitement réduit de 65% et satisfaction client +22%', 'https://www.napkin.ai/api/render?prompt=chatbot+customer+support+workflow', '#E11932'),
('Automatisation des tâches administratives répétitives', 'Utilisation de scénarios no-code pour automatiser la saisie de données, l''émission de devis ou les relances clients.', 'Gain de 8h par semaine / employé', 'https://www.napkin.ai/api/render?prompt=no-code+workflow+automation', '#222'),
('Analyse prédictive des ventes via IA', 'Création d''un modèle prédictif basé sur les historiques de ventes et comportements clients pour anticiper la demande.', 'Amélioration de la planification et réduction des invendus de 18%', 'https://www.napkin.ai/api/render?prompt=sales+forecasting+ai+graph', '#555'),
('Contrôle qualité assisté par IA', 'Détection automatique des anomalies à partir de photos ou données capteurs. Idéal pour l''industrie et la logistique.', 'Taux d''erreurs réduit de 35% dès 3 semaines', 'https://www.napkin.ai/api/render?prompt=ai+quality+control+system', '#E11932');