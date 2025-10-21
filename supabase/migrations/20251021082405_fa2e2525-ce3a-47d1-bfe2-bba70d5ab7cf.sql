-- Fix RLS policies to ensure admins can view ALL data including joined tables
-- The issue is that when joining tables, the RLS policies of joined tables also apply

-- For audits table, ensure admins can see all audits
DROP POLICY IF EXISTS "Admins can manage audits" ON audits;
CREATE POLICY "Admins can manage audits" ON audits
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::app_role
    )
  );

-- For service_requests, ensure admins can see all
DROP POLICY IF EXISTS "Admins can view all service requests" ON service_requests;
DROP POLICY IF EXISTS "Admins can update all service requests" ON service_requests;

CREATE POLICY "Admins can manage all service requests" ON service_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::app_role
    )
  );

-- For quotes, ensure admins can see all
DROP POLICY IF EXISTS "Admins can manage quotes" ON quotes;
CREATE POLICY "Admins can manage quotes" ON quotes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::app_role
    )
  );

-- For projects, ensure admins can see all
DROP POLICY IF EXISTS "Admins can manage all projects" ON projects;
CREATE POLICY "Admins can manage all projects" ON projects
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::app_role
    )
  );

-- For interventions, ensure admins can see all
DROP POLICY IF EXISTS "interventions_admin_all" ON interventions;
CREATE POLICY "interventions_admin_all" ON interventions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::app_role
    )
  );

-- For followups, ensure admins can see all
DROP POLICY IF EXISTS "followups_admin_all" ON followups;
CREATE POLICY "followups_admin_all" ON followups
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::app_role
    )
  );

-- For intervention_dates, ensure admins can see all
DROP POLICY IF EXISTS "Admins can manage intervention dates" ON intervention_dates;
CREATE POLICY "Admins can manage intervention dates" ON intervention_dates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::app_role
    )
  );

-- For ai_proposals, ensure admins can see all
DROP POLICY IF EXISTS "Admins can manage all proposals" ON ai_proposals;
CREATE POLICY "Admins can manage all proposals" ON ai_proposals
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::app_role
    )
  );

-- For project_jalons, ensure admins can see all
DROP POLICY IF EXISTS "Admins can manage all jalons" ON project_jalons;
CREATE POLICY "Admins can manage all jalons" ON project_jalons
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::app_role
    )
  );

-- For project_notes, ensure admins can see all
DROP POLICY IF EXISTS "Admins can manage all notes" ON project_notes;
CREATE POLICY "Admins can manage all notes" ON project_notes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::app_role
    )
  );

-- Critical: Ensure profiles are viewable for joins
-- Profiles are already viewable by everyone which is good

-- Critical: Ensure companies are viewable for joins
-- Companies are already viewable by everyone which is good

-- For audit_responses, ensure admins can see all
DROP POLICY IF EXISTS "Admins can manage all responses" ON audit_responses;
CREATE POLICY "Admins can manage all responses" ON audit_responses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::app_role
    )
  );

-- For audit_recommendations, ensure admins can see all
DROP POLICY IF EXISTS "Admins can manage recommendations" ON audit_recommendations;
CREATE POLICY "Admins can manage recommendations" ON audit_recommendations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::app_role
    )
  );

-- For analyses, ensure admins can see all
DROP POLICY IF EXISTS "Admins can manage all analyses" ON analyses;
CREATE POLICY "Admins can manage all analyses" ON analyses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::app_role
    )
  );

-- For orders, ensure admins can see all
DROP POLICY IF EXISTS "Admins can manage all orders" ON orders;
CREATE POLICY "Admins can manage all orders" ON orders
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::app_role
    )
  );

-- For invoices, ensure admins can see all
DROP POLICY IF EXISTS "Admins can manage all invoices" ON invoices;
CREATE POLICY "Admins can manage all invoices" ON invoices
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::app_role
    )
  );

-- For messages, admins should see everything
DROP POLICY IF EXISTS "Admins can view all messages" ON messages;
DROP POLICY IF EXISTS "Admins can insert messages" ON messages;

CREATE POLICY "Admins can manage all messages" ON messages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::app_role
    )
  );

-- For email_logs, admins should see everything
DROP POLICY IF EXISTS "Admins can view all email logs" ON emails_logs;
DROP POLICY IF EXISTS "Admins can insert email logs" ON emails_logs;

CREATE POLICY "Admins can manage all email logs" ON emails_logs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::app_role
    )
  );

-- For workflow_logs, admins should see everything
DROP POLICY IF EXISTS "workflow_logs_admin_all" ON workflow_logs;
CREATE POLICY "workflow_logs_admin_all" ON workflow_logs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::app_role
    )
  );