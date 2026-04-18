-- Safety / adverse-event reports
-- 7-year retention per state veterinary medical board recordkeeping rules.
-- Required by CLAUDE.md Regulatory Framework § Adverse Event Reporting.

CREATE TABLE IF NOT EXISTS safety_events (
  id               BIGSERIAL PRIMARY KEY,
  patient_id       BIGINT,
  patient_name     TEXT,
  protocol_type    TEXT,
  exercise_code    TEXT,
  event_type       TEXT NOT NULL,
  severity         TEXT NOT NULL,
  description      TEXT NOT NULL,
  clinician_id     BIGINT NOT NULL REFERENCES users(id),
  clinician_username TEXT NOT NULL,
  clinician_role   TEXT,
  ip_address       TEXT,
  user_agent       TEXT,
  status           TEXT NOT NULL DEFAULT 'open',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_safety_events_created_at ON safety_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_safety_events_patient_id ON safety_events(patient_id);
CREATE INDEX IF NOT EXISTS idx_safety_events_clinician_id ON safety_events(clinician_id);

-- RLS: clinicians read only their own reports; admins read all.
ALTER TABLE safety_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY safety_events_insert_authenticated
  ON safety_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY safety_events_select_own
  ON safety_events FOR SELECT
  TO authenticated
  USING (clinician_id::text = auth.uid()::text);

CREATE POLICY safety_events_select_admin
  ON safety_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = auth.uid()::text
        AND users.role = 'admin'
    )
  );
