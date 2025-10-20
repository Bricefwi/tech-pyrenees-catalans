-- Rendre le bucket imotion-tests public pour accès aux PDFs
UPDATE storage.buckets 
SET public = true 
WHERE id = 'imotion-tests';

-- Créer les politiques RLS pour permettre l'accès aux fichiers
CREATE POLICY "Les PDFs de test sont accessibles publiquement"
ON storage.objects FOR SELECT
USING (bucket_id = 'imotion-tests');

CREATE POLICY "Les admins peuvent uploader des PDFs de test"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'imotion-tests' 
  AND has_role(auth.uid(), 'admin'::app_role)
);