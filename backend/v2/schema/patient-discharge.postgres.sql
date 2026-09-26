-- ===========================================================================
-- K9 Clinical Workflow V2 — Discharge / end of episode
-- PostgreSQL / Supabase mirror of patient-discharge.sqlite.sql
-- ===========================================================================
--
-- Columns must match the SQLite file exactly; schema-parity.test.js fails if
-- they drift. See the SQLite mirror for the reasoning: why COMPLETED and
-- DISCONTINUED are kept apart, why a reason may be unknown and the record
-- still complete, why `handoff_id` is derived rather than a checkbox, and
-- why there is deliberately no `patients.status` column.
--
-- `clinic_id` on visits, protocols and beau_handoffs is added to those tables
-- by their own schema files, not declared here.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS v2_patient_discharges (
  id                 BIGSERIAL PRIMARY KEY,
  patient_id         BIGINT NOT NULL,
  visit_id           BIGINT NOT NULL,
  clinic_id          BIGINT,

  outcome            TEXT NOT NULL,
  reason             TEXT NOT NULL,
  reason_status      TEXT NOT NULL DEFAULT 'KNOWN',
  reason_note        TEXT,

  week_reached       INTEGER,
  total_weeks        INTEGER,
  phase_reached      TEXT,
  visits_attended    INTEGER,

  clinical_outcome     TEXT NOT NULL DEFAULT 'NOT_ASSESSED',
  outcome_measured_by  TEXT,

  handoff_id         BIGINT,
  discharge_summary  TEXT,

  discharged_by      BIGINT REFERENCES users(id),
  discharged_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  reason_updated_at  TIMESTAMPTZ,
  reason_updated_by  BIGINT REFERENCES users(id),

  CHECK (outcome IN ('COMPLETED', 'DISCONTINUED')),
  CHECK (reason_status IN ('KNOWN', 'PENDING_OWNER_CONTACT', 'OWNER_UNREACHABLE')),
  CHECK (clinical_outcome IN ('IMPROVED', 'UNCHANGED', 'WORSE', 'NOT_ASSESSED')),
  CHECK (NOT (outcome = 'COMPLETED' AND reason_status <> 'KNOWN')),
  CHECK ((reason = 'NOT_YET_KNOWN') = (reason_status <> 'KNOWN')),
  CHECK (clinical_outcome = 'NOT_ASSESSED' OR outcome_measured_by IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_discharges_patient ON v2_patient_discharges(patient_id);
CREATE INDEX IF NOT EXISTS idx_discharges_clinic  ON v2_patient_discharges(clinic_id);
CREATE INDEX IF NOT EXISTS idx_discharges_outcome ON v2_patient_discharges(outcome, reason);
CREATE UNIQUE INDEX IF NOT EXISTS idx_discharges_visit ON v2_patient_discharges(visit_id);
