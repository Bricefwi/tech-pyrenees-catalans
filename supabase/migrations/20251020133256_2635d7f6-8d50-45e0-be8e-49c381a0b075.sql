-- Vérifier et créer les tables manquantes

-- Table INTERVENTIONS / PROJETS
CREATE TABLE IF NOT EXISTS interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  client_id UUID REFERENCES profiles(id),
  company_id UUID REFERENCES companies(id),
  technician_id UUID REFERENCES profiles(id),
  title TEXT,
  status TEXT DEFAULT 'En attente',
  start_date DATE,
  end_date DATE,
  planning JSONB,
  report_pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table FOLLOWUPS
CREATE TABLE IF NOT EXISTS followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES profiles(id),
  project_id UUID REFERENCES interventions(id) ON DELETE CASCADE,
  type TEXT,
  notes TEXT,
  next_action TEXT,
  next_action_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table WORKFLOW_LOGS
CREATE TABLE IF NOT EXISTS workflow_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  performed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger pour interventions
CREATE OR REPLACE FUNCTION update_interventions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS interventions_updated_at ON interventions;
CREATE TRIGGER interventions_updated_at
BEFORE UPDATE ON interventions
FOR EACH ROW
EXECUTE FUNCTION update_interventions_updated_at();

-- RLS pour interventions
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "interventions_admin_all" ON interventions;
CREATE POLICY "interventions_admin_all"
ON interventions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "interventions_client_read" ON interventions;
CREATE POLICY "interventions_client_read"
ON interventions FOR SELECT
USING (client_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- RLS pour followups
ALTER TABLE followups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "followups_admin_all" ON followups;
CREATE POLICY "followups_admin_all"
ON followups FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "followups_client_read" ON followups;
CREATE POLICY "followups_client_read"
ON followups FOR SELECT
USING (client_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- RLS pour workflow_logs
ALTER TABLE workflow_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workflow_logs_admin_all" ON workflow_logs;
CREATE POLICY "workflow_logs_admin_all"
ON workflow_logs FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));