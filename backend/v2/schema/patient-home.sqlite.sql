-- ===========================================================================
-- K9 Clinical Workflow V2 — Patient Home Environment
-- SQLite schema
-- ===========================================================================
--
-- THE PROBLEM THIS SOLVES
-- -----------------------
-- Where the dog actually lives, and what the owner can actually do, was stored
-- ONLY in `patients.dashboard_data` — a JSON blob keyed by the UI's field
-- LABELS, as `home::Primary Flooring — Indoor` and so on.
--
-- Three consequences, all of them real and all of them observed:
--
--   1. RENAMING A LABEL STRANDS THE DATA. The key IS the label. This already
--      happened elsewhere in the same blob: the diagnostics block has records
--      under keys the current dashboard can no longer read or edit.
--   2. NOTHING CAN QUERY IT. "Which patients have no non-slip flooring" is not
--      a question the database can answer about a JSON string.
--   3. IT FORCED A RECONCILER TO EXIST. The same facts lived in the blob and in
--      V2, so `record-sync` and `dashboard-bridge` were written to keep two
--      records of one animal agreeing. That machinery exists only because the
--      split existed.
--
-- V3: ONE STORE PER FACT
-- ----------------------
-- This table is the source of truth for the home block. `dashboard_data` is no
-- longer read for it. Both screens — the V1 dashboard's Home Program panel and
-- anything in V2 — go through the same rows.
--
-- WHY COLUMNS AND NOT A BLOB
-- --------------------------
-- The clinic equipment table keeps a checklist blob because the checklist is
-- 43 items of inventory and only ten of them gate anything. Home is different:
-- it is a FIXED, SMALL set of questions, every one of which somebody may want
-- to query or report on. So each stated answer is a column.
--
-- WHAT IS DELIBERATELY NOT STORED
-- -------------------------------
-- The NORMALISED readings — traction, stairs, session_minutes as a number —
-- are NOT columns. They are derived on read by v2/home-environment.js, because
-- they are an interpretation of the record and not the record. Storing them
-- would freeze today's reading of a phrase into the database, and the
-- normalisers have already been corrected five times in one day. The
-- clinician's own words are what is kept.
--
-- EVERY COLUMN IS NULLABLE
-- ------------------------
-- An unanswered question is not an answer. NULL means nobody has said, which is
-- a different fact from a recorded "none" — the same distinction the clinic
-- capability columns preserve between unstated and unavailable.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS patient_home_environment (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id           INTEGER NOT NULL UNIQUE,

  -- Where the programme happens at all. The V1 panel gates its indoor and
  -- outdoor sections on this, and before V3 it was React state that was never
  -- saved — so a recorded home showed an empty panel on every reload.
  exercise_location    TEXT,

  -- Indoors
  flooring_indoor      TEXT,
  space_indoors        TEXT,
  stairs_indoor        TEXT,
  stair_frequency      TEXT,

  -- Outdoors
  outdoor_space        TEXT,
  outdoor_surface      TEXT,
  outdoor_steps        TEXT,
  outdoor_safety       TEXT,

  -- What the owner can do, and how often
  session_minutes      TEXT,
  sessions_per_day     TEXT,
  owner_confidence     TEXT,
  expected_compliance  TEXT,

  -- Free text. Household items are what B.E.A.U. is permitted to substitute
  -- from, so they are the record, not decoration.
  household_items      TEXT,
  outdoor_items        TEXT,
  reward_items         TEXT,
  owner_notes          TEXT,

  updated_by           INTEGER,
  updated_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_home_env_patient_id ON patient_home_environment(patient_id);
