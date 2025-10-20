-- Create analyses table for storing AI analysis results
CREATE TABLE IF NOT EXISTS public.analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_request_id UUID REFERENCES public.service_requests(id) ON DELETE SET NULL,
  contenu JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

-- Admins can manage all analyses
CREATE POLICY "Admins can manage all analyses"
  ON public.analyses
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own analyses
CREATE POLICY "Users can view their own analyses"
  ON public.analyses
  FOR SELECT
  USING (
    profile_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Users can insert their own analyses
CREATE POLICY "Users can insert their own analyses"
  ON public.analyses
  FOR INSERT
  WITH CHECK (
    profile_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Users can update their own analyses
CREATE POLICY "Users can update their own analyses"
  ON public.analyses
  FOR UPDATE
  USING (
    profile_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_analyses_updated_at
  BEFORE UPDATE ON public.analyses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add index for faster queries
CREATE INDEX idx_analyses_profile_id ON public.analyses(profile_id);
CREATE INDEX idx_analyses_service_request_id ON public.analyses(service_request_id);
CREATE INDEX idx_analyses_created_at ON public.analyses(created_at DESC);