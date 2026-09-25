-- ===========================================================================
-- K9 Clinical Workflow V2 — Treatment
-- PostgreSQL / Supabase mirror of patient-treatment.sqlite.sql
-- ===========================================================================
--
-- Columns must match the SQLite file exactly; schema-parity.test.js fails if
-- they drift. See the SQLite mirror for the reasoning: why a procedure is a
-- row with a date rather than a set of columns, why treatment status is a
-- time series rather than a single overwritable state, why the affected LIMB
-- is a separate fact from the affected REGION and never feeds the protocol
-- router, and why the three flags are tri-state with no DEFAULT.
--
-- The two case-level columns (`treatment_approach`, `affected_limbs`) are
-- added to the existing `patients` table by the migration, not declared here.
-- ===========================================================================

-- ── 1. Procedures ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS v2_patient_procedures (
  id                  BIGSERIAL PRIMARY KEY,
  patient_id          BIGINT NOT NULL,

  procedure_type      TEXT NOT NULL,
  -- Nullable on purpose: an undated surgical case is treated as ACTIVE by
  -- intake-proposal, and inventing a date would close the post-operative
  -- gates on a patient nobody has examined.
  procedure_date      TEXT,

  surgeon             TEXT,
  facility            TEXT,
  notes               TEXT,

  recorded_by         BIGINT REFERENCES users(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_procedures_patient ON v2_patient_procedures(patient_id);
CREATE INDEX IF NOT EXISTS idx_procedures_date    ON v2_patient_procedures(patient_id, procedure_date);

-- ── 2. Treatment status over time ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS v2_patient_treatment_status (
  id                      BIGSERIAL PRIMARY KEY,
  patient_id              BIGINT NOT NULL,

  effective_date          TEXT NOT NULL,

  weight_bearing_status   TEXT,
  incision_status         TEXT,

  -- Tri-state. NULL is "nobody has answered" and 0 is "a clinician said no",
  -- and the e-collar and crate-rest gates default to REQUIRED in the acute
  -- window. No DEFAULT clause, deliberately.
  e_collar_required       INTEGER,
  strict_crate_rest       INTEGER,
  sling_assist_required   INTEGER,

  effective_date_is_unknown INTEGER DEFAULT 0,

  activity_restrictions   TEXT,
  clinical_notes          TEXT,

  recorded_by             BIGINT REFERENCES users(id),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tx_status_patient ON v2_patient_treatment_status(patient_id);
CREATE INDEX IF NOT EXISTS idx_tx_status_current ON v2_patient_treatment_status(patient_id, effective_date DESC);
