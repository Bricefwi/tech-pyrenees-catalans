-- Permettre au premier utilisateur de devenir admin si aucun admin n'existe
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

-- Les utilisateurs peuvent voir leurs propres rôles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Les admins peuvent voir tous les rôles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Permettre l'insertion du premier admin uniquement si aucun admin n'existe
CREATE POLICY "Allow first admin creation"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  role = 'admin' 
  AND auth.uid() = user_id 
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'admin'
  )
);

-- Les admins peuvent gérer tous les rôles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'));