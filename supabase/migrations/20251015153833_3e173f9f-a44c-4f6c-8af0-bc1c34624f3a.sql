-- Ajouter une colonne pour stocker le rapport HTML généré dans la table audits
ALTER TABLE audits 
ADD COLUMN generated_report text,
ADD COLUMN report_generated_at timestamp with time zone;