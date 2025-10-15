-- Create companies table for audit
CREATE TABLE IF NOT EXISTS public.audited_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sector text NOT NULL,
  size text,
  contact_name text,
  contact_email text,
  contact_phone text,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.audited_companies ENABLE ROW LEVEL SECURITY;

-- Create audits table
CREATE TABLE IF NOT EXISTS public.audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.audited_companies(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'in_progress',
  current_sector text,
  current_question_index integer DEFAULT 0,
  global_score numeric,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;

-- Create audit_responses table
CREATE TABLE IF NOT EXISTS public.audit_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id uuid REFERENCES public.audits(id) ON DELETE CASCADE NOT NULL,
  sector text NOT NULL,
  criterion text NOT NULL,
  question_id text NOT NULL,
  question_text text NOT NULL,
  response text,
  score numeric,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.audit_responses ENABLE ROW LEVEL SECURITY;

-- Create sector_scores table
CREATE TABLE IF NOT EXISTS public.sector_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id uuid REFERENCES public.audits(id) ON DELETE CASCADE NOT NULL,
  sector text NOT NULL,
  score numeric NOT NULL,
  max_score numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(audit_id, sector)
);

ALTER TABLE public.sector_scores ENABLE ROW LEVEL SECURITY;

-- Create recommendations table
CREATE TABLE IF NOT EXISTS public.audit_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id uuid REFERENCES public.audits(id) ON DELETE CASCADE NOT NULL,
  sector text NOT NULL,
  title text NOT NULL,
  description text,
  tools_suggested jsonb,
  priority text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.audit_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audited_companies
DROP POLICY IF EXISTS "Admins can manage companies" ON public.audited_companies;
DROP POLICY IF EXISTS "Users can view their companies" ON public.audited_companies;

CREATE POLICY "Admins can manage companies"
ON public.audited_companies FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their companies"
ON public.audited_companies FOR SELECT
TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "Users can create companies"
ON public.audited_companies FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

-- RLS Policies for audits
DROP POLICY IF EXISTS "Admins can manage audits" ON public.audits;
DROP POLICY IF EXISTS "Users can view their audits" ON public.audits;

CREATE POLICY "Admins can manage audits"
ON public.audits FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their audits"
ON public.audits FOR SELECT
TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "Users can create audits"
ON public.audits FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their audits"
ON public.audits FOR UPDATE
TO authenticated
USING (created_by = auth.uid());

-- RLS Policies for audit_responses
DROP POLICY IF EXISTS "Admins can view all responses" ON public.audit_responses;
DROP POLICY IF EXISTS "Users can manage their responses" ON public.audit_responses;

CREATE POLICY "Admins can view all responses"
ON public.audit_responses FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can manage their responses"
ON public.audit_responses FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.audits a
    WHERE a.id = audit_responses.audit_id
    AND a.created_by = auth.uid()
  )
);

-- RLS Policies for sector_scores
DROP POLICY IF EXISTS "Admins can view all scores" ON public.sector_scores;
DROP POLICY IF EXISTS "Users can view their scores" ON public.sector_scores;

CREATE POLICY "Admins can view all scores"
ON public.sector_scores FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their scores"
ON public.sector_scores FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.audits a
    WHERE a.id = sector_scores.audit_id
    AND a.created_by = auth.uid()
  )
);

-- RLS Policies for audit_recommendations
DROP POLICY IF EXISTS "Admins can manage recommendations" ON public.audit_recommendations;
DROP POLICY IF EXISTS "Users can view their recommendations" ON public.audit_recommendations;

CREATE POLICY "Admins can manage recommendations"
ON public.audit_recommendations FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their recommendations"
ON public.audit_recommendations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.audits a
    WHERE a.id = audit_recommendations.audit_id
    AND a.created_by = auth.uid()
  )
);

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS set_audited_companies_updated_at ON public.audited_companies;
DROP TRIGGER IF EXISTS set_audits_updated_at ON public.audits;

CREATE TRIGGER set_audited_companies_updated_at
  BEFORE UPDATE ON public.audited_companies
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_audits_updated_at
  BEFORE UPDATE ON public.audits
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();