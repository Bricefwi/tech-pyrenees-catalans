-- Décomposer l'adresse en plusieurs champs dans profiles
ALTER TABLE public.profiles 
  DROP COLUMN IF EXISTS company_address,
  ADD COLUMN street_address text,
  ADD COLUMN postal_code text,
  ADD COLUMN city text,
  ADD COLUMN country text DEFAULT 'France';

-- Ajouter des champs pour la gestion des dates d'intervention
ALTER TABLE public.service_requests
  ADD COLUMN proposed_date timestamp with time zone,
  ADD COLUMN confirmed_date timestamp with time zone,
  ADD COLUMN date_status text DEFAULT 'pending' CHECK (date_status IN ('pending', 'client_proposed', 'admin_proposed', 'confirmed'));