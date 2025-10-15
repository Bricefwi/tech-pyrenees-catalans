-- Create sequence for AI proposal numbers
CREATE SEQUENCE IF NOT EXISTS ai_proposal_number_seq START WITH 1 INCREMENT BY 1;

-- Create function to generate AI proposal numbers
CREATE OR REPLACE FUNCTION public.generate_ai_proposal_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  next_number integer;
  year_suffix text;
BEGIN
  next_number := nextval('ai_proposal_number_seq');
  year_suffix := to_char(now(), 'YYYY');
  RETURN 'PROP-' || year_suffix || '-' || lpad(next_number::text, 4, '0');
END;
$function$;

-- Create trigger function to set AI proposal number
CREATE OR REPLACE FUNCTION public.set_ai_proposal_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF NEW.proposal_number IS NULL THEN
    NEW.proposal_number := generate_ai_proposal_number();
  END IF;
  RETURN NEW;
END;
$function$;

-- Create AI proposals table
CREATE TABLE public.ai_proposals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_number text UNIQUE,
  service_request_id uuid NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  client_user_id uuid NOT NULL,
  profile_id uuid REFERENCES public.profiles(id),
  company_id uuid REFERENCES public.companies(id),
  service_type text NOT NULL,
  title text NOT NULL,
  business_sector text,
  specifications text NOT NULL,
  proposals text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid NOT NULL
);

-- Create trigger to set AI proposal number
CREATE TRIGGER set_ai_proposal_number_trigger
  BEFORE INSERT ON public.ai_proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.set_ai_proposal_number();

-- Create trigger to update updated_at
CREATE TRIGGER update_ai_proposals_updated_at
  BEFORE UPDATE ON public.ai_proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.ai_proposals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage all proposals"
  ON public.ai_proposals
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can view their proposals"
  ON public.ai_proposals
  FOR SELECT
  USING (client_user_id = auth.uid());

-- Create index for faster lookups
CREATE INDEX idx_ai_proposals_request ON public.ai_proposals(service_request_id);
CREATE INDEX idx_ai_proposals_client ON public.ai_proposals(client_user_id);