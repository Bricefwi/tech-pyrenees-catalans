-- =====================================================
-- IMOTION - Dump SQL du schéma Supabase (sans données)
-- Généré pour audit et tests
-- =====================================================

-- =====================================================
-- 1. TYPES ENUMS
-- =====================================================

CREATE TYPE public.app_role AS ENUM ('admin', 'client');

-- =====================================================
-- 2. SEQUENCES
-- =====================================================

CREATE SEQUENCE IF NOT EXISTS public.service_request_number_seq START WITH 1;
CREATE SEQUENCE IF NOT EXISTS public.quote_number_seq START WITH 1;
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START WITH 1;
CREATE SEQUENCE IF NOT EXISTS public.invoice_number_seq START WITH 1;
CREATE SEQUENCE IF NOT EXISTS public.ai_proposal_number_seq START WITH 1;

-- =====================================================
-- 3. TABLES
-- =====================================================

-- Table: companies
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  siret_siren TEXT,
  business_sector TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  street_address TEXT,
  postal_code TEXT,
  city TEXT,
  country TEXT DEFAULT 'France',
  is_individual BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  full_name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  mobile_phone TEXT,
  company_id UUID REFERENCES public.companies(id),
  is_professional BOOLEAN DEFAULT false,
  company_name TEXT,
  siret_siren TEXT,
  business_sector TEXT,
  street_address TEXT,
  postal_code TEXT,
  city TEXT,
  country TEXT DEFAULT 'France',
  profile_completed BOOLEAN DEFAULT false,
  cgu_accepted BOOLEAN DEFAULT false,
  cgu_accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: user_roles
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Table: service_requests
CREATE TABLE public.service_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_user_id UUID,
  profile_id UUID REFERENCES public.profiles(id),
  request_number TEXT,
  title TEXT NOT NULL,
  description TEXT,
  service_type TEXT NOT NULL,
  business_sector TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  quote_status TEXT DEFAULT 'no_quote',
  date_status TEXT DEFAULT 'pending',
  proposed_date TIMESTAMP WITH TIME ZONE,
  confirmed_date TIMESTAMP WITH TIME ZONE,
  assigned_to UUID,
  admin_notes TEXT,
  ai_specifications TEXT,
  admin_ai_proposals TEXT,
  estimated_duration TEXT,
  estimated_cost NUMERIC,
  device_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: audited_companies
CREATE TABLE public.audited_companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sector TEXT NOT NULL,
  size TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: audits
CREATE TABLE public.audits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.audited_companies(id),
  created_by UUID,
  status TEXT DEFAULT 'in_progress',
  current_sector TEXT,
  current_question_index INTEGER DEFAULT 0,
  global_score NUMERIC,
  generated_report TEXT,
  report_generated_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: audit_sectors
CREATE TABLE public.audit_sectors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  weighting NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: audit_questions
CREATE TABLE public.audit_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sector_id UUID NOT NULL REFERENCES public.audit_sectors(id),
  subdomain TEXT NOT NULL,
  question_text TEXT NOT NULL,
  response_type TEXT NOT NULL,
  weighting NUMERIC NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: audit_responses
CREATE TABLE public.audit_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID NOT NULL REFERENCES public.audits(id),
  question_id UUID NOT NULL REFERENCES public.audit_questions(id),
  response_value TEXT NOT NULL,
  score NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: sector_comments
CREATE TABLE public.sector_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID NOT NULL REFERENCES public.audits(id),
  sector_id UUID NOT NULL REFERENCES public.audit_sectors(id),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: sector_scores
CREATE TABLE public.sector_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID NOT NULL REFERENCES public.audits(id),
  sector TEXT NOT NULL,
  score NUMERIC NOT NULL,
  max_score NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: audit_recommendations
CREATE TABLE public.audit_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID NOT NULL REFERENCES public.audits(id),
  sector TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT,
  tools_suggested JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: quotes
CREATE TABLE public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_request_id UUID NOT NULL REFERENCES public.service_requests(id),
  quote_number TEXT,
  description TEXT,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  valid_until TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: projects
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id),
  request_id UUID REFERENCES public.service_requests(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  client_name TEXT,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  progress INTEGER DEFAULT 0,
  critical_points JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: project_jalons
CREATE TABLE public.project_jalons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id),
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  progress INTEGER DEFAULT 0,
  status TEXT DEFAULT 'planned',
  responsible TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: project_notes
CREATE TABLE public.project_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id),
  author_id UUID,
  content TEXT NOT NULL,
  visibility TEXT DEFAULT 'internal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: interventions
CREATE TABLE public.interventions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID REFERENCES public.quotes(id),
  client_id UUID REFERENCES public.profiles(id),
  company_id UUID REFERENCES public.companies(id),
  technician_id UUID,
  title TEXT,
  status TEXT DEFAULT 'En attente',
  start_date DATE,
  end_date DATE,
  planning JSONB,
  report_pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: followups
CREATE TABLE public.followups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id),
  client_id UUID REFERENCES public.profiles(id),
  type TEXT,
  notes TEXT,
  next_action TEXT,
  next_action_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: emails_logs
CREATE TABLE public.emails_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'generic',
  status TEXT DEFAULT 'sent',
  error_details TEXT,
  pdf_url TEXT,
  related_request UUID REFERENCES public.service_requests(id),
  related_profile UUID REFERENCES public.profiles(id),
  cc_admins TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Table: ai_proposals
CREATE TABLE public.ai_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_request_id UUID NOT NULL REFERENCES public.service_requests(id),
  client_user_id UUID NOT NULL,
  profile_id UUID REFERENCES public.profiles(id),
  company_id UUID REFERENCES public.companies(id),
  proposal_number TEXT,
  title TEXT NOT NULL,
  service_type TEXT NOT NULL,
  business_sector TEXT,
  specifications TEXT NOT NULL,
  proposals TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: workflow_logs
CREATE TABLE public.workflow_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  performed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: faq
CREATE TABLE public.faq (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  reponse TEXT NOT NULL,
  category TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: faq_logs
CREATE TABLE public.faq_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  question TEXT NOT NULL,
  reponse TEXT,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: messages
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_request_id UUID NOT NULL REFERENCES public.service_requests(id),
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: intervention_dates
CREATE TABLE public.intervention_dates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_request_id UUID NOT NULL REFERENCES public.service_requests(id),
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_hours NUMERIC,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- 4. FONCTIONS
-- =====================================================

-- Fonction: has_role (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Fonction: generate_request_number
CREATE OR REPLACE FUNCTION public.generate_request_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  next_number INTEGER;
  year_suffix TEXT;
BEGIN
  next_number := nextval('service_request_number_seq');
  year_suffix := to_char(now(), 'YYYY');
  RETURN 'REQ-' || year_suffix || '-' || lpad(next_number::text, 4, '0');
END;
$$;

-- Fonction: generate_quote_number
CREATE OR REPLACE FUNCTION public.generate_quote_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  next_number INTEGER;
  year_suffix TEXT;
BEGIN
  next_number := nextval('quote_number_seq');
  year_suffix := to_char(now(), 'YYYY');
  RETURN 'DEV-' || year_suffix || '-' || lpad(next_number::text, 4, '0');
END;
$$;

-- Fonction: handle_updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fonction: ensure_company_for_profile
CREATE OR REPLACE FUNCTION public.ensure_company_for_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_company_id UUID;
BEGIN
  -- Si pas de company_id et que c'est un particulier
  IF NEW.company_id IS NULL AND (NEW.is_professional = false OR NEW.is_professional IS NULL) THEN
    INSERT INTO companies (
      name, is_individual, email, phone, 
      street_address, postal_code, city, country
    ) VALUES (
      COALESCE(NEW.full_name, NEW.first_name || ' ' || NEW.last_name, 'Particulier'),
      true, NEW.email, NEW.phone,
      NEW.street_address, NEW.postal_code, NEW.city, NEW.country
    ) RETURNING id INTO new_company_id;
    
    NEW.company_id := new_company_id;
  END IF;
  
  -- Si pas de company_id mais professionnel avec nom d'entreprise
  IF NEW.company_id IS NULL AND NEW.is_professional = true AND NEW.company_name IS NOT NULL THEN
    INSERT INTO companies (
      name, siret_siren, business_sector, is_individual,
      email, phone, street_address, postal_code, city, country
    ) VALUES (
      NEW.company_name, NEW.siret_siren, NEW.business_sector, false,
      NEW.email, NEW.phone, NEW.street_address, NEW.postal_code, NEW.city, NEW.country
    ) RETURNING id INTO new_company_id;
    
    NEW.company_id := new_company_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- =====================================================
-- 5. TRIGGERS
-- =====================================================

-- Trigger: set_request_number sur service_requests
CREATE TRIGGER set_request_number
BEFORE INSERT ON public.service_requests
FOR EACH ROW
EXECUTE FUNCTION public.set_request_number();

-- Trigger: set_quote_number sur quotes
CREATE TRIGGER set_quote_number
BEFORE INSERT ON public.quotes
FOR EACH ROW
EXECUTE FUNCTION public.set_quote_number();

-- Trigger: handle_updated_at sur multiples tables
CREATE TRIGGER handle_updated_at_trigger
BEFORE UPDATE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_trigger
BEFORE UPDATE ON public.service_requests
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: ensure_company_for_profile
CREATE TRIGGER ensure_company_trigger
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.ensure_company_for_profile();

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audited_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sector_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sector_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_jalons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intervention_dates ENABLE ROW LEVEL SECURITY;

-- Policies détaillées dans AUDIT_TECHNIQUE.md

-- =====================================================
-- FIN DU DUMP
-- =====================================================
