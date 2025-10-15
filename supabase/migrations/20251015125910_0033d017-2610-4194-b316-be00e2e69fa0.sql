-- Ajouter les champs manquants à la table profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS mobile_phone TEXT,
ADD COLUMN IF NOT EXISTS company_address TEXT,
ADD COLUMN IF NOT EXISTS siret_siren TEXT,
ADD COLUMN IF NOT EXISTS business_sector TEXT,
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false;

-- Mettre à jour les noms complets existants si nécessaire
COMMENT ON COLUMN public.profiles.full_name IS 'Deprecated - use first_name and last_name instead';
COMMENT ON COLUMN public.profiles.phone IS 'Deprecated - use mobile_phone instead';
COMMENT ON COLUMN public.profiles.is_professional IS 'True for professionals, false for individuals';
COMMENT ON COLUMN public.profiles.profile_completed IS 'Indicates if the user has completed their profile';