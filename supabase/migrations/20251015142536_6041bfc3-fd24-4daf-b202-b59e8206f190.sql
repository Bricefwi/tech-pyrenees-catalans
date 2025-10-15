-- Insérer les questions manquantes pour RH & Formation
INSERT INTO public.audit_questions (sector_id, subdomain, question_text, response_type, weighting, order_index)
SELECT 
  s.id,
  'Adaptation et apprentissage',
  'Mesurer la capacité d''adaptation et d''apprentissage',
  'low_medium_high',
  1.0,
  COALESCE((SELECT MAX(order_index) FROM audit_questions WHERE sector_id = s.id), 0) + 1
FROM audit_sectors s
WHERE s.name = 'RH & Formation';

-- Insérer les questions manquantes pour Commercial & Relation Client
INSERT INTO public.audit_questions (sector_id, subdomain, question_text, response_type, weighting, order_index)
SELECT 
  s.id,
  'Automatisation commerciale',
  'Identifier les opportunités d''automatisation du cycle de vente',
  'low_medium_high',
  1.0,
  COALESCE((SELECT MAX(order_index) FROM audit_questions WHERE sector_id = s.id), 0) + 1
FROM audit_sectors s
WHERE s.name = 'Commercial & Relation Client';

-- Ajouter une colonne pour les commentaires libres à la fin de chaque secteur dans audit_responses
CREATE TABLE IF NOT EXISTS public.sector_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
  sector_id UUID NOT NULL REFERENCES public.audit_sectors(id) ON DELETE CASCADE,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(audit_id, sector_id)
);

-- Enable RLS on sector_comments
ALTER TABLE public.sector_comments ENABLE ROW LEVEL SECURITY;

-- Users can view their sector comments
CREATE POLICY "Users can view their sector comments"
ON public.sector_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM audits a
    WHERE a.id = sector_comments.audit_id
    AND (a.created_by = auth.uid() OR a.created_by IS NULL)
  )
);

-- Users can insert their sector comments
CREATE POLICY "Users can insert their sector comments"
ON public.sector_comments
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM audits a
    WHERE a.id = sector_comments.audit_id
    AND (a.created_by = auth.uid() OR a.created_by IS NULL)
  )
);

-- Admins can manage all sector comments
CREATE POLICY "Admins can manage all sector comments"
ON public.sector_comments
FOR ALL
USING (has_role(auth.uid(), 'admin'));