-- ===========================================================================
-- K9 Clinical Workflow V2 — Patient Diagnostic Studies
-- PostgreSQL / Supabase mirror of patient-diagnostics.sqlite.sql
-- ===========================================================================
--
-- Columns must match the SQLite file exactly; schema-parity.test.js fails if
-- they drift. See the SQLite mirror for why a study is a row with a date
-- rather than a checkbox with one findings box, and why `performed_on` is
-- never inferred from the findings text.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS v2_patient_diagnostic_studies (
  id            BIGSERIAL PRIMARY KEY,
  patient_id    BIGINT NOT NULL,

  category      TEXT NOT NULL,

  modality      TEXT,
  panels        TEXT,

  performed_on  TEXT,
  findings      TEXT,

  source_field  TEXT,

  created_by    BIGINT REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diag_studies_patient_id ON v2_patient_diagnostic_studies(patient_id);
CREATE INDEX IF NOT EXISTS idx_diag_studies_date ON v2_patient_diagnostic_studies(patient_id, performed_on);
CREATE UNIQUE INDEX IF NOT EXISTS idx_diag_studies_source
  ON v2_patient_diagnostic_studies(patient_id, source_field)
  WHERE source_field IS NOT NULL;
