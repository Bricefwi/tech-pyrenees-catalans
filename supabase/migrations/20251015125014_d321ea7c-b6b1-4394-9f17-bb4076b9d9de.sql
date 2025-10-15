-- Permettre aux nouveaux utilisateurs de s'auto-attribuer le rôle 'client' lors de l'inscription
CREATE POLICY "Users can assign themselves client role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  role = 'client' 
  AND auth.uid() = user_id
);