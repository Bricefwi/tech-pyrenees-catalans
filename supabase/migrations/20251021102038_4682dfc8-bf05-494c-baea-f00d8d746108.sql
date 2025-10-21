-- Fix CRITICAL: Remove public access to companies table
DROP POLICY IF EXISTS "Companies viewable by everyone" ON companies;

-- Restrict companies to authenticated users viewing their own company
CREATE POLICY "Users view their company"
  ON companies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.company_id = companies.id
      AND profiles.user_id = auth.uid()
    ) OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Note: "Admins can manage all companies" policy already exists and covers admin access