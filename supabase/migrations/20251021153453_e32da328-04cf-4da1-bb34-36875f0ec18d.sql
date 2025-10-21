-- Fix ERROR #1: Restrict diagnostic_conversations access
-- Drop overly permissive policies
DROP POLICY IF EXISTS "Diagnostic conversations are viewable by everyone" ON diagnostic_conversations;
DROP POLICY IF EXISTS "Anyone can create diagnostic conversations" ON diagnostic_conversations;
DROP POLICY IF EXISTS "Anyone can update diagnostic conversations" ON diagnostic_conversations;

-- Add restrictive policies
CREATE POLICY "Admins can manage all diagnostic conversations"
  ON diagnostic_conversations FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can view their own diagnostic conversations"
  ON diagnostic_conversations FOR SELECT
  USING (
    service_request_id IN (
      SELECT id FROM service_requests 
      WHERE client_user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create diagnostic conversations"
  ON diagnostic_conversations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Service request owners can update their conversations"
  ON diagnostic_conversations FOR UPDATE
  USING (
    service_request_id IN (
      SELECT id FROM service_requests 
      WHERE client_user_id = auth.uid()
    )
  );

-- Fix ERROR #2: Change views from implicit SECURITY DEFINER to SECURITY INVOKER
-- Recreate v_export_audit with SECURITY INVOKER
DROP VIEW IF EXISTS v_export_audit;
CREATE VIEW v_export_audit WITH (security_invoker=true) AS
SELECT
  a.id as audit_id,
  a.status as title,
  a.created_at,
  a.status,
  ac.name as company_name,
  p.full_name as client_name,
  p.email as client_email,
  a.generated_report,
  COALESCE(
    jsonb_agg(
      DISTINCT jsonb_build_object(
        'sector_id', s.id,
        'sector_name', s.name,
        'weighting', s.weighting,
        'score', (
          SELECT avg(ar.score)::numeric(5,2)
          FROM audit_responses ar
          WHERE ar.audit_id = a.id
            AND ar.question_id IN (SELECT id FROM audit_questions WHERE sector_id = s.id)
        ),
        'comments', (
          SELECT sc.comment
          FROM sector_comments sc
          WHERE sc.audit_id = a.id AND sc.sector_id = s.id
          LIMIT 1
        )
      )
    ) FILTER (WHERE s.id IS NOT NULL),
    '[]'::jsonb
  ) as sectors,
  jsonb_agg(
    jsonb_build_object(
      'question_id', q.id,
      'sector_id', q.sector_id,
      'question', q.question_text,
      'weighting', q.weighting,
      'response', ar.response_value,
      'score', ar.score
    )
  ) as responses
FROM audits a
LEFT JOIN audited_companies ac ON ac.id = a.company_id
LEFT JOIN profiles p ON p.user_id = a.created_by
LEFT JOIN audit_questions q ON true
LEFT JOIN audit_sectors s ON s.id = q.sector_id
LEFT JOIN audit_responses ar ON ar.audit_id = a.id AND ar.question_id = q.id
GROUP BY a.id, ac.name, p.full_name, p.email;

-- Recreate ia_analytics_summary with SECURITY INVOKER
DROP VIEW IF EXISTS ia_analytics_summary;
CREATE VIEW ia_analytics_summary WITH (security_invoker=true) AS
SELECT 
  s.id,
  s.title,
  COUNT(a.id) AS total_interactions,
  SUM(CASE WHEN a.event_type='click' THEN 1 ELSE 0 END) AS clicks,
  SUM(CASE WHEN a.event_type='view' THEN 1 ELSE 0 END) AS views
FROM ia_solutions s
LEFT JOIN ia_solution_analytics a ON s.id = a.solution_id
GROUP BY s.id, s.title;