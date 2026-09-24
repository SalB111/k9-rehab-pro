-- ===========================================================================
-- K9 Clinical Workflow V2 — Patient Home Environment
-- PostgreSQL / Supabase mirror of patient-home.sqlite.sql
-- ===========================================================================
--
-- Columns must match the SQLite file exactly; schema-parity.test.js fails if
-- they drift. See the SQLite mirror for why this table exists, why the stated
-- answers are columns, and why the normalised readings deliberately are not.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS v2_patient_home_environment (
  id                   BIGSERIAL PRIMARY KEY,
  patient_id           BIGINT NOT NULL UNIQUE,

  exercise_location    TEXT,

  flooring_indoor      TEXT,
  space_indoors        TEXT,
  stairs_indoor        TEXT,
  stair_frequency      TEXT,

  outdoor_space        TEXT,
  outdoor_surface      TEXT,
  outdoor_steps        TEXT,
  outdoor_safety       TEXT,

  session_minutes      TEXT,
  sessions_per_day     TEXT,
  owner_confidence     TEXT,
  expected_compliance  TEXT,

  household_items      TEXT,
  outdoor_items        TEXT,
  reward_items         TEXT,
  owner_notes          TEXT,

  updated_by           BIGINT REFERENCES users(id),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_home_env_patient_id ON v2_patient_home_environment(patient_id);
