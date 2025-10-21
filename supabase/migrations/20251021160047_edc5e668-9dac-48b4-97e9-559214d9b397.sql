-- Fix has_role function to include search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Fix ensure_company_for_profile function to include search_path
CREATE OR REPLACE FUNCTION public.ensure_company_for_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Add length constraints to faq_logs table
ALTER TABLE public.faq_logs 
  ADD CONSTRAINT faq_logs_question_length_check CHECK (char_length(question) <= 1000);

ALTER TABLE public.faq_logs 
  ADD CONSTRAINT faq_logs_reponse_length_check CHECK (reponse IS NULL OR char_length(reponse) <= 5000);