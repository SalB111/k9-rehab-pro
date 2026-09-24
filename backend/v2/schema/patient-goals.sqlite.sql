-- ===========================================================================
-- K9 Clinical Workflow V2 — Patient Goals
-- SQLite schema
-- ===========================================================================
--
-- V3. These two tables are the source of truth for the goals block.
-- `patients.dashboard_data` is no longer read for it.
--
-- WHY TWO TABLES
-- --------------
-- V1 kept goals as ten fields in a blob, four of them free text. That records
-- what somebody wrote. It cannot record a rehabilitation workflow, because a
-- goal in rehabilitation is not a paragraph:
--
--   * it has a HORIZON — short term or long term;
--   * it is a clinician's measure, or something the animal will be able to DO,
--     or the owner's own words;
--   * it has a TARGET;
--   * and it is REVIEWED at each reassessment — met, partly met, not met,
--     revised, discontinued.
--
-- A goal written at the initial assessment and never looked at again is the
-- exact thing a real workflow must surface, and four text boxes cannot.
--
--   `patient_goals`      — the goal SET. One row per patient: the selected
--                          rehabilitation goals, the owner's priority and
--                          expectations. These are the patient's standing aims,
--                          not things with a due date.
--
--   `patient_goal_items` — the TRACKABLE goals. Many rows per patient, each
--                          reviewable on its own.
--
-- TARGET DATES ARE NEVER PARSED FROM THE GOAL TEXT
-- ------------------------------------------------
-- `target_date` is NULL until a clinician sets it. Reading it from the prose
-- was tried against the real records first: a pattern for "within N units"
-- matched "thigh circumference within 1 cm bilaterally" and "jump grids
-- (12 in)" — a measurement tolerance and a jump height — as though they were a
-- fortnight and twelve months. Two false positives in six matches across five
-- patients. A fabricated deadline on a medical record is worse than none.
--
-- STATUS IS NULLABLE, AND NULL IS NOT "IN PROGRESS"
-- -------------------------------------------------
-- NULL means nobody has reviewed this goal. That is a different fact from
-- "not met", and collapsing them would let a goal quietly stop being looked
-- at — which is the failure this table exists to prevent. `overdue` is
-- computed from `target_date` and `status` on read, never stored, because a
-- stored flag is wrong the day after it is written.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS patient_goals (
  id                       INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id               INTEGER NOT NULL UNIQUE,

  -- The selected rehabilitation goals, as the clinician chose them, joined by
  -- the V1 multi-select delimiter. Stored verbatim: the coded form is derived
  -- on read in v2/goals.js, so a code change never needs a data migration.
  primary_goals            TEXT,

  owner_priority           TEXT,
  owner_expectations       TEXT,

  -- Not a goal. How the practice contacts the client, collected in the same V1
  -- section. Kept so the block is fully accounted for, and deliberately NOT
  -- carried in the B.E.A.U. handoff.
  communication_preference TEXT,

  updated_by               INTEGER,
  updated_at               DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at               DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_patient_goals_patient_id ON patient_goals(patient_id);

CREATE TABLE IF NOT EXISTS patient_goal_items (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id        INTEGER NOT NULL,

  horizon           TEXT NOT NULL,   -- SHORT | LONG
  kind              TEXT NOT NULL,   -- CLINICAL | FUNCTIONAL | OWNER
  goal_text         TEXT NOT NULL,

  -- Which V1 field this goal was migrated out of, or NULL for one written in
  -- V3. It makes the migration idempotent — one item per source field per
  -- patient — so re-running it cannot duplicate a patient's goals.
  source_field      TEXT,

  -- Set by a clinician. NEVER parsed from `goal_text`. See the header.
  target_date       TEXT,

  -- NULL = never reviewed. See the header: that is not "in progress".
  status            TEXT,
  status_note       TEXT,
  reviewed_at       DATETIME,
  reviewed_by       INTEGER,
  -- The visit the review happened at, so a status can be read back against the
  -- assessment that justified it rather than floating free of the record.
  reviewed_visit_id INTEGER,

  sort_index        INTEGER DEFAULT 0,

  created_by        INTEGER,
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (reviewed_visit_id) REFERENCES visits(id)
);

CREATE INDEX IF NOT EXISTS idx_goal_items_patient_id ON patient_goal_items(patient_id);
CREATE INDEX IF NOT EXISTS idx_goal_items_status ON patient_goal_items(patient_id, status);
-- One migrated goal per source field per patient; a second run updates rather
-- than duplicating. Partial, so goals written in V3 (source_field NULL) are
-- unconstrained and a patient may have as many as they need.
CREATE UNIQUE INDEX IF NOT EXISTS idx_goal_items_source
  ON patient_goal_items(patient_id, source_field)
  WHERE source_field IS NOT NULL;
