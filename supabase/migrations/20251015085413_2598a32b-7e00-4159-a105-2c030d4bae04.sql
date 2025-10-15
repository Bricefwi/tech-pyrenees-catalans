-- Table des profils clients
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  is_professional BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table des demandes de service
CREATE TABLE public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL CHECK (service_type IN ('reparation', 'dev', 'audit')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  title TEXT NOT NULL,
  description TEXT,
  device_info JSONB,
  business_sector TEXT,
  estimated_cost DECIMAL(10, 2),
  estimated_duration TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table des conversations de diagnostic
CREATE TABLE public.diagnostic_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID REFERENCES public.service_requests(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]',
  ai_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour profiles (publiquement lisible, modifiable par le propriétaire)
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies pour service_requests (accessible par tous pour démo)
CREATE POLICY "Service requests are viewable by everyone"
  ON public.service_requests FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create service requests"
  ON public.service_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update service requests they created"
  ON public.service_requests FOR UPDATE
  USING (true);

-- RLS Policies pour diagnostic_conversations
CREATE POLICY "Diagnostic conversations are viewable by everyone"
  ON public.diagnostic_conversations FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create diagnostic conversations"
  ON public.diagnostic_conversations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update diagnostic conversations"
  ON public.diagnostic_conversations FOR UPDATE
  USING (true);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_service_requests_updated_at
  BEFORE UPDATE ON public.service_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_diagnostic_conversations_updated_at
  BEFORE UPDATE ON public.diagnostic_conversations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();