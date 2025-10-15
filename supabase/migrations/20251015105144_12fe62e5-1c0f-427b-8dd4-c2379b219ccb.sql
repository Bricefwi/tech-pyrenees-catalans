-- Supprimer la contrainte existante
ALTER TABLE public.service_requests DROP CONSTRAINT IF EXISTS service_requests_service_type_check;

-- Ajouter une nouvelle contrainte qui accepte les valeurs actuelles
ALTER TABLE public.service_requests ADD CONSTRAINT service_requests_service_type_check 
CHECK (service_type IN (
  'repair_iphone',
  'repair_mac', 
  'development',
  'nocode',
  'ai',
  'formation',
  'dev',
  'reparation',
  'audit'
));