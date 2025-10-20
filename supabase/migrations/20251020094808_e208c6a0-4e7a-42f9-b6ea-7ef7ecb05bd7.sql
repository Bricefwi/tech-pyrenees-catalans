-- Table de suivi des envois d'emails
CREATE TABLE IF NOT EXISTS public.emails_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  type TEXT DEFAULT 'generic',
  related_request UUID REFERENCES service_requests(id) ON DELETE SET NULL,
  related_profile UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'sent',
  message TEXT,
  pdf_url TEXT,
  cc_admins TEXT[] DEFAULT '{}',
  error_details TEXT
);

-- Index pour accélérer les recherches
CREATE INDEX IF NOT EXISTS idx_emails_logs_created_at ON public.emails_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_emails_logs_type ON public.emails_logs(type);

-- Activer RLS
ALTER TABLE public.emails_logs ENABLE ROW LEVEL SECURITY;

-- Politique pour les administrateurs (voir tous les logs)
CREATE POLICY "Admins can view all email logs"
ON public.emails_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Politique pour les utilisateurs (voir leurs propres logs)
CREATE POLICY "Users can view own email logs"
ON public.emails_logs
FOR SELECT
USING (related_profile IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

-- Politique pour insertion (seuls les admins peuvent insérer manuellement)
CREATE POLICY "Admins can insert email logs"
ON public.emails_logs
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));