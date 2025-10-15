-- Create role enum if not exists
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'client');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
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

-- Create messages table for client-admin chat
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id uuid REFERENCES public.service_requests(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  is_admin boolean DEFAULT false,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create quotes table
CREATE TABLE IF NOT EXISTS public.quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id uuid REFERENCES public.service_requests(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL,
  description text,
  valid_until timestamp with time zone,
  status text DEFAULT 'pending',
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Create intervention_dates table
CREATE TABLE IF NOT EXISTS public.intervention_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id uuid REFERENCES public.service_requests(id) ON DELETE CASCADE NOT NULL,
  scheduled_date timestamp with time zone NOT NULL,
  duration_hours numeric,
  status text DEFAULT 'scheduled',
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.intervention_dates ENABLE ROW LEVEL SECURITY;

-- Add columns to service_requests
ALTER TABLE public.service_requests 
ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS admin_notes text,
ADD COLUMN IF NOT EXISTS client_user_id uuid REFERENCES auth.users(id);

-- RLS Policies for user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for messages
DROP POLICY IF EXISTS "Admins can view all messages" ON public.messages;
DROP POLICY IF EXISTS "Clients can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Admins can insert messages" ON public.messages;
DROP POLICY IF EXISTS "Clients can insert messages" ON public.messages;

CREATE POLICY "Admins can view all messages"
ON public.messages FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view their own messages"
ON public.messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.service_requests sr
    WHERE sr.id = messages.service_request_id
    AND sr.client_user_id = auth.uid()
  )
);

CREATE POLICY "Admins can insert messages"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can insert messages"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.service_requests sr
    WHERE sr.id = service_request_id
    AND sr.client_user_id = auth.uid()
  )
);

-- RLS Policies for quotes
DROP POLICY IF EXISTS "Admins can manage quotes" ON public.quotes;
DROP POLICY IF EXISTS "Clients can view their quotes" ON public.quotes;

CREATE POLICY "Admins can manage quotes"
ON public.quotes FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view their quotes"
ON public.quotes FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.service_requests sr
    WHERE sr.id = quotes.service_request_id
    AND sr.client_user_id = auth.uid()
  )
);

-- RLS Policies for intervention_dates
DROP POLICY IF EXISTS "Admins can manage intervention dates" ON public.intervention_dates;
DROP POLICY IF EXISTS "Clients can view their intervention dates" ON public.intervention_dates;

CREATE POLICY "Admins can manage intervention dates"
ON public.intervention_dates FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view their intervention dates"
ON public.intervention_dates FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.service_requests sr
    WHERE sr.id = intervention_dates.service_request_id
    AND sr.client_user_id = auth.uid()
  )
);

-- Update service_requests RLS policies
DROP POLICY IF EXISTS "Service requests are viewable by everyone" ON public.service_requests;
DROP POLICY IF EXISTS "Anyone can create service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Users can update service requests they created" ON public.service_requests;
DROP POLICY IF EXISTS "Admins can view all service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Clients can view their own service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Authenticated users can create service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Admins can update all service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Clients can update their own service requests" ON public.service_requests;

CREATE POLICY "Admins can view all service requests"
ON public.service_requests FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view their own service requests"
ON public.service_requests FOR SELECT
TO authenticated
USING (client_user_id = auth.uid());

CREATE POLICY "Authenticated users can create service requests"
ON public.service_requests FOR INSERT
TO authenticated
WITH CHECK (client_user_id = auth.uid());

CREATE POLICY "Admins can update all service requests"
ON public.service_requests FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can update their own service requests"
ON public.service_requests FOR UPDATE
TO authenticated
USING (client_user_id = auth.uid());

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS set_quotes_updated_at ON public.quotes;
DROP TRIGGER IF EXISTS set_intervention_dates_updated_at ON public.intervention_dates;

CREATE TRIGGER set_quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_intervention_dates_updated_at
  BEFORE UPDATE ON public.intervention_dates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime for messages (only if not already added)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;