-- ===========================================================================
-- K9 Clinical Workflow V2 — Clinical Visits, Assessments and Measurements
-- Postgres / Supabase migration
-- ===========================================================================
--
-- Mirror of clinical-visits.sqlite.sql. See that file for the rationale: K9's
-- PATCH /api/patients/:id/measures overwrites measurements on the patient row,
-- so no longitudinal clinical record exists today.
--
-- The existing `patients` measure columns are NOT dropped or altered here. They
-- keep working for the current UI until its callers are migrated.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS v2_visits (
  id                 BIGSERIAL PRIMARY KEY,
  patient_id         BIGINT NOT NULL,
  visit_date         DATE NOT NULL,
  visit_type         TEXT NOT NULL DEFAULT 'RECHECK',
  status             TEXT NOT NULL DEFAULT 'OPEN',
  clinician_id       BIGINT REFERENCES users(id),
  clinician_username TEXT,
  clinician_role     TEXT,
  visit_notes        TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at       TIMESTAMPTZ,
  CONSTRAINT v2_visits_type_check CHECK (visit_type IN ('INITIAL','RECHECK','REASSESSMENT','DISCHARGE')),
  CONSTRAINT v2_visits_status_check CHECK (status IN ('OPEN','COMPLETED'))
);

CREATE INDEX IF NOT EXISTS idx_v2_visits_patient_id ON v2_visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_v2_visits_date ON v2_visits(visit_date DESC);

CREATE TABLE IF NOT EXISTS v2_visit_assessments (
  id                    BIGSERIAL PRIMARY KEY,
  visit_id              BIGINT NOT NULL UNIQUE REFERENCES v2_visits(id),
  patient_id            BIGINT NOT NULL,

  pain_score            INTEGER,
  lameness_grade        INTEGER,
  weight_bearing_status TEXT,
  mobility_level        TEXT,
  gait_quality          TEXT,
  treatment_approach    TEXT,

  mmt_grade             INTEGER,
  ivdd_grade            TEXT,
  oa_stage              INTEGER,

  neuro_proprioception  TEXT,
  neuro_withdrawal      TEXT,
  neuro_deep_pain       TEXT,
  neuro_motor_grade     TEXT,

  incision_status       TEXT,
  complications_noted   TEXT,

  crate_rest_required   INTEGER,
  e_collar_required     INTEGER,

  overall_change        TEXT,
  clinical_observation  TEXT,

  recorded_by           BIGINT REFERENCES users(id),
  recorded_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT v2_va_change_check CHECK (
    overall_change IS NULL
    OR overall_change IN ('IMPROVED','STABLE','WORSE','NO_SIGNIFICANT_CHANGE')
  )
);

CREATE INDEX IF NOT EXISTS idx_v2_va_patient_id ON v2_visit_assessments(patient_id);

CREATE TABLE IF NOT EXISTS v2_visit_measurements (
  id            BIGSERIAL PRIMARY KEY,
  visit_id      BIGINT NOT NULL REFERENCES v2_visits(id),
  patient_id    BIGINT NOT NULL,

  measure_key   TEXT NOT NULL,
  site          TEXT,
  side          TEXT,
  value_numeric DOUBLE PRECISION,
  value_text    TEXT,
  unit          TEXT,

  supersedes_id BIGINT REFERENCES v2_visit_measurements(id),
  recorded_by   BIGINT REFERENCES users(id),
  recorded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_v2_vm_patient_key ON v2_visit_measurements(patient_id, measure_key);
CREATE INDEX IF NOT EXISTS idx_v2_vm_visit_id ON v2_visit_measurements(visit_id);

CREATE TABLE IF NOT EXISTS v2_visit_protocol_versions (
  id         BIGSERIAL PRIMARY KEY,
  visit_id   BIGINT NOT NULL REFERENCES v2_visits(id),
  version_id BIGINT NOT NULL UNIQUE REFERENCES v2_protocol_versions(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_v2_vpv_visit_id ON v2_visit_protocol_versions(visit_id);

-- ===========================================================================
-- ROW LEVEL SECURITY
--
-- Assessment and measurement capture is open to authenticated clinical staff —
-- technicians record measurements as part of their normal work. What they
-- cannot do is approve a protocol; that restriction lives on
-- v2_protocol_approvals.
--
-- Measurements are append-only: INSERT and SELECT policies only, so a reading
-- cannot be edited or deleted after the fact. A correction inserts a new row
-- pointing at the one it supersedes.
-- ===========================================================================

ALTER TABLE v2_visits                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_visit_assessments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_visit_measurements        ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_visit_protocol_versions   ENABLE ROW LEVEL SECURITY;

CREATE POLICY v2_visits_select ON v2_visits
  FOR SELECT TO authenticated USING (true);
CREATE POLICY v2_visits_write ON v2_visits
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY v2_va_select ON v2_visit_assessments
  FOR SELECT TO authenticated USING (true);
CREATE POLICY v2_va_write ON v2_visit_assessments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY v2_vm_select ON v2_visit_measurements
  FOR SELECT TO authenticated USING (true);
CREATE POLICY v2_vm_insert ON v2_visit_measurements
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY v2_vpv_select ON v2_visit_protocol_versions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY v2_vpv_insert ON v2_visit_protocol_versions
  FOR INSERT TO authenticated WITH CHECK (true);
