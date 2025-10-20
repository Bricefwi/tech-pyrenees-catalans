-- Vue d'export audit
CREATE OR REPLACE VIEW v_export_audit AS
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