-- ===========================================================================
-- K9 Clinical Workflow V2 — Patient Goals
-- PostgreSQL / Supabase mirror of patient-goals.sqlite.sql
-- ===========================================================================
--
-- Columns must match the SQLite file exactly; schema-parity.test.js fails if
-- they drift. See the SQLite mirror for why there are two tables, why
-- `target_date` is never parsed out of the goal text, and why a NULL status
-- means UNREVIEWED rather than "in progress".
-- ===========================================================================

CREATE TABLE IF NOT EXISTS v2_patient_goals (
  id                       BIGSERIAL PRIMARY KEY,
  patient_id               BIGINT NOT NULL UNIQUE,

  primary_goals            TEXT,
  owner_priority           TEXT,
  owner_expectations       TEXT,
  communication_preference TEXT,

  updated_by               BIGINT REFERENCES users(id),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patient_goals_patient_id ON v2_patient_goals(patient_id);

CREATE TABLE IF NOT EXISTS v2_patient_goal_items (
  id                BIGSERIAL PRIMARY KEY,
  patient_id        BIGINT NOT NULL,

  horizon           TEXT NOT NULL,
  kind              TEXT NOT NULL,
  goal_text         TEXT NOT NULL,

  source_field      TEXT,
  target_date       TEXT,

  status            TEXT,
  status_note       TEXT,
  reviewed_at       TIMESTAMPTZ,
  reviewed_by       BIGINT REFERENCES users(id),
  reviewed_visit_id BIGINT,

  sort_index        INTEGER DEFAULT 0,

  created_by        BIGINT REFERENCES users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_goal_items_patient_id ON v2_patient_goal_items(patient_id);
CREATE INDEX IF NOT EXISTS idx_goal_items_status ON v2_patient_goal_items(patient_id, status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_goal_items_source
  ON v2_patient_goal_items(patient_id, source_field)
  WHERE source_field IS NOT NULL;
