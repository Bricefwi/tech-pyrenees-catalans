-- Ajout des colonnes pour les spécifications IA et propositions admin
ALTER TABLE service_requests 
ADD COLUMN ai_specifications text,
ADD COLUMN admin_ai_proposals text;