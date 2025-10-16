-- Table FAQ pour stocker les questions/réponses
CREATE TABLE IF NOT EXISTS public.faq (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  reponse TEXT NOT NULL,
  category TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour journaliser les interactions FAQ/Chat
CREATE TABLE IF NOT EXISTS public.faq_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  question TEXT NOT NULL,
  reponse TEXT,
  source TEXT, -- 'faq' ou 'ia'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ajouter champ acceptation CGU aux profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS cgu_accepted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cgu_accepted_at TIMESTAMP WITH TIME ZONE;

-- RLS pour FAQ
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;

CREATE POLICY "FAQ viewable by everyone"
ON public.faq FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage FAQ"
ON public.faq FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS pour FAQ logs
ALTER TABLE public.faq_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own logs"
ON public.faq_logs FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can insert logs"
ON public.faq_logs FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all logs"
ON public.faq_logs FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION public.handle_faq_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_faq_updated_at
BEFORE UPDATE ON public.faq
FOR EACH ROW
EXECUTE FUNCTION public.handle_faq_updated_at();

-- Insérer quelques FAQs de base
INSERT INTO public.faq (question, reponse, category, order_index) VALUES
('Comment décrire ma panne efficacement ?', 'Indiquez le modèle exact (ex. MacBook Pro 2021), la version macOS/iOS si pertinente, et joignez une photo nette. L''IA propose un diagnostic préliminaire.', 'Support', 1),
('Quels services pour les professionnels ?', 'Audit digital, automatisation, intégration IA, maintenance et formations sur-mesure.', 'Services', 2),
('Quelle est votre zone d''intervention ?', 'Perpignan, Argelès, Céret, Puigcerdà et la frontière espagnole. Support à distance partout en France.', 'Géographie', 3),
('Délai moyen pour une réparation Apple ?', '24 à 72h selon la complexité et disponibilité des pièces. Le diagnostic initial est gratuit.', 'Délais', 4),
('Mes données sont-elles sécurisées ?', 'Oui : HTTPS, hébergement RGPD-compatible, et stockage chiffré pour les données reçues.', 'Sécurité', 5),
('Modes de paiement acceptés', 'Carte bancaire, virement, et paiement en ligne sécurisé.', 'Paiement', 6)
ON CONFLICT DO NOTHING;