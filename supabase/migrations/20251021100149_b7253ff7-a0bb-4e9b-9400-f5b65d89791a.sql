-- Ajouter les champs pour le contenu complet de l'article
ALTER TABLE ia_solutions 
  DROP COLUMN IF EXISTS napkin_url,
  ADD COLUMN IF NOT EXISTS full_content text,
  ADD COLUMN IF NOT EXISTS key_points jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS cta_text text DEFAULT 'Demander un Audit';

-- Mettre à jour les solutions existantes avec du contenu
UPDATE ia_solutions SET
  full_content = CASE 
    WHEN title LIKE '%service client%' THEN 'L''intelligence artificielle révolutionne la relation client en apportant des réponses instantanées et personnalisées. Un chatbot intelligent apprend continuellement de chaque interaction pour améliorer ses réponses. Il qualifie automatiquement les demandes urgentes et les achemine vers les bons interlocuteurs. Cette automatisation libère vos équipes pour se concentrer sur des tâches à plus forte valeur ajoutée. Le résultat : des clients plus satisfaits et une équipe moins sollicitée sur les questions répétitives. Les PME qui adoptent cette solution constatent une amélioration mesurable de leur satisfaction client dès les premières semaines.'
    WHEN title LIKE '%administratives%' THEN 'Les tâches administratives répétitives représentent un coût caché important pour les PME. L''automatisation no-code permet de créer des workflows intelligents sans compétences techniques. Chaque devis, facture ou relance client peut être automatisé selon vos règles métier. Les données circulent automatiquement entre vos différents outils. Vos collaborateurs se concentrent sur leur cœur de métier et gagnent un temps précieux. Cette transformation digitale est accessible à toutes les entreprises, sans investissement technique lourd. Les gains de productivité se mesurent dès le premier mois.'
    WHEN title LIKE '%ventes%' THEN 'L''analyse prédictive transforme vos données de ventes en avantage compétitif. L''IA analyse vos historiques pour identifier les tendances invisibles à l''œil nu. Elle anticipe les variations de demande selon la saisonnalité et les événements. Votre planification devient proactive plutôt que réactive. Les stocks sont optimisés et les invendus réduits significativement. Chaque décision commerciale s''appuie sur des prévisions fiables. Cette intelligence artificielle s''adapte continuellement à l''évolution de votre marché.'
    ELSE 'Le contrôle qualité assisté par IA détecte automatiquement les anomalies sur vos produits. L''analyse d''images identifie les défauts que l''œil humain pourrait manquer. Les données de capteurs sont surveillées en temps réel pour anticiper les problèmes. Chaque anomalie est documentée et tracée pour amélioration continue. Vos équipes se concentrent sur l''analyse et les actions correctives. La fiabilité de vos livraisons s''améliore rapidement. Cette technologie accessible apporte la précision des grands groupes aux PME.'
  END,
  key_points = CASE 
    WHEN title LIKE '%service client%' THEN '[
      {"icon": "⚡", "text": "Réponses instantanées 24/7 sans délai d''attente"},
      {"icon": "🎯", "text": "Qualification automatique des demandes urgentes"},
      {"icon": "📈", "text": "Apprentissage continu pour des réponses précises"}
    ]'::jsonb
    WHEN title LIKE '%administratives%' THEN '[
      {"icon": "🤖", "text": "Automatisation sans code, accessible à tous"},
      {"icon": "⏱️", "text": "Gain de 8h par semaine par collaborateur"},
      {"icon": "🔄", "text": "Synchronisation automatique entre vos outils"}
    ]'::jsonb
    WHEN title LIKE '%ventes%' THEN '[
      {"icon": "🔮", "text": "Prévisions basées sur vos données historiques"},
      {"icon": "📊", "text": "Anticipation des pics et creux de demande"},
      {"icon": "💰", "text": "Réduction des invendus jusqu''à 18%"}
    ]'::jsonb
    ELSE '[
      {"icon": "👁️", "text": "Détection automatique des anomalies visuelles"},
      {"icon": "🎯", "text": "Précision supérieure à l''inspection manuelle"},
      {"icon": "📉", "text": "Réduction des erreurs de 35% en 3 semaines"}
    ]'::jsonb
  END;