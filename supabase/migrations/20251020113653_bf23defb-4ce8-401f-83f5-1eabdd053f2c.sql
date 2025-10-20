-- Étape 2 : Créer la table documents_reference
CREATE TABLE IF NOT EXISTS documents_reference (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  path text NOT NULL,
  uploaded_at timestamptz DEFAULT now(),
  category text DEFAULT 'documentation'
);

-- Enable RLS
ALTER TABLE documents_reference ENABLE ROW LEVEL SECURITY;

-- Admins can manage all documents
CREATE POLICY "Admins can manage documents"
ON documents_reference
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Everyone can view documents
CREATE POLICY "Documents viewable by all"
ON documents_reference
FOR SELECT
USING (true);

-- Créer un bucket de stockage pour les documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('imotion-docs', 'imotion-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Policies pour imotion-docs bucket
CREATE POLICY "Admins can upload docs"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'imotion-docs' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can view docs"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'imotion-docs' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Créer bucket pour les tests
INSERT INTO storage.buckets (id, name, public)
VALUES ('imotion-tests', 'imotion-tests', false)
ON CONFLICT (id) DO NOTHING;

-- Policies pour imotion-tests bucket
CREATE POLICY "Admins can manage test files"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'imotion-tests' 
  AND has_role(auth.uid(), 'admin'::app_role)
);
