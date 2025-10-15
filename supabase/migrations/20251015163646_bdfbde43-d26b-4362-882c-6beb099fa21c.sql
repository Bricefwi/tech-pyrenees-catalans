-- Créer une table companies pour gérer les entreprises
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  siret_siren text,
  business_sector text,
  street_address text,
  postal_code text,
  city text,
  country text DEFAULT 'France',
  phone text,
  email text,
  website text,
  notes text,
  is_individual boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Modifier la table profiles pour ajouter la référence à company
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES companies(id) ON DELETE SET NULL;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id);

-- Fonction pour créer automatiquement une entreprise "Particulier" si nécessaire
CREATE OR REPLACE FUNCTION ensure_company_for_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_company_id uuid;
BEGIN
  -- Si pas de company_id et que c'est un particulier (is_professional = false)
  IF NEW.company_id IS NULL AND (NEW.is_professional = false OR NEW.is_professional IS NULL) THEN
    -- Créer une entreprise "Particulier" avec le nom du contact
    INSERT INTO companies (
      name,
      is_individual,
      email,
      phone,
      street_address,
      postal_code,
      city,
      country
    ) VALUES (
      COALESCE(NEW.full_name, NEW.first_name || ' ' || NEW.last_name, 'Particulier'),
      true,
      NEW.email,
      NEW.phone,
      NEW.street_address,
      NEW.postal_code,
      NEW.city,
      NEW.country
    )
    RETURNING id INTO new_company_id;
    
    NEW.company_id := new_company_id;
  END IF;
  
  -- Si pas de company_id mais que c'est un professionnel avec un nom d'entreprise
  IF NEW.company_id IS NULL AND NEW.is_professional = true AND NEW.company_name IS NOT NULL THEN
    INSERT INTO companies (
      name,
      siret_siren,
      business_sector,
      is_individual,
      email,
      phone,
      street_address,
      postal_code,
      city,
      country
    ) VALUES (
      NEW.company_name,
      NEW.siret_siren,
      NEW.business_sector,
      false,
      NEW.email,
      NEW.phone,
      NEW.street_address,
      NEW.postal_code,
      NEW.city,
      NEW.country
    )
    RETURNING id INTO new_company_id;
    
    NEW.company_id := new_company_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger pour créer automatiquement une entreprise lors de l'insertion/mise à jour d'un profil
DROP TRIGGER IF EXISTS ensure_company_trigger ON profiles;
CREATE TRIGGER ensure_company_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION ensure_company_for_profile();

-- Migrer les données existantes : créer des entreprises pour les profils existants
DO $$
DECLARE
  profile_record RECORD;
  new_company_id uuid;
BEGIN
  FOR profile_record IN 
    SELECT * FROM profiles WHERE company_id IS NULL
  LOOP
    -- Si c'est un particulier
    IF profile_record.is_professional = false OR profile_record.is_professional IS NULL THEN
      INSERT INTO companies (
        name,
        is_individual,
        email,
        phone,
        street_address,
        postal_code,
        city,
        country
      ) VALUES (
        COALESCE(profile_record.full_name, profile_record.first_name || ' ' || profile_record.last_name, 'Particulier'),
        true,
        profile_record.email,
        profile_record.phone,
        profile_record.street_address,
        profile_record.postal_code,
        profile_record.city,
        profile_record.country
      )
      RETURNING id INTO new_company_id;
    -- Si c'est un professionnel
    ELSE
      INSERT INTO companies (
        name,
        siret_siren,
        business_sector,
        is_individual,
        email,
        phone,
        street_address,
        postal_code,
        city,
        country
      ) VALUES (
        COALESCE(profile_record.company_name, profile_record.full_name, 'Entreprise'),
        profile_record.siret_siren,
        profile_record.business_sector,
        false,
        profile_record.email,
        profile_record.phone,
        profile_record.street_address,
        profile_record.postal_code,
        profile_record.city,
        profile_record.country
      )
      RETURNING id INTO new_company_id;
    END IF;
    
    -- Mettre à jour le profil avec le company_id
    UPDATE profiles 
    SET company_id = new_company_id 
    WHERE id = profile_record.id;
  END LOOP;
END $$;

-- RLS pour companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies viewable by everyone"
ON companies FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own company"
ON companies FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.company_id = companies.id
    AND profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert companies"
ON companies FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admins can manage all companies"
ON companies FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'));