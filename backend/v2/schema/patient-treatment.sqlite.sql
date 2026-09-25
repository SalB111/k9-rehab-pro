-- ===========================================================================
-- K9 Clinical Workflow V2 — Treatment
-- SQLite schema
-- ===========================================================================
--
-- V3. The treatment block's own home. `patients.dashboard_data` stops being
-- the source of truth for the twelve `treatment::` keys.
--
-- This block matters more than the six before it, because it is the FIRST one
-- that feeds the protocol engine. Two of the three engine inputs that have no
-- column anywhere are treatment fields, and both are SAFETY GATES:
--
--     weightBearingStatus  <- treatment::Weight Bearing Status
--     incisionStatus       <- treatment::Incision Status
--
-- THE BLOCK IS THREE DIFFERENT SHAPES, NOT ONE
-- --------------------------------------------
-- The reason it needs two tables and two columns rather than one row of
-- twelve fields is that the twelve are not all the same KIND of fact:
--
--   1. A PROCEDURE IS AN EVENT WITH A DATE.        -> patient_procedures
--      Surgery type, date, surgeon. A dog can have more than one: a
--      contralateral TPLO is ordinary in cruciate disease, and a revision is
--      a second operation, not a correction of the first. Storing one set of
--      columns means the second procedure overwrites the first and the
--      history is gone. Same shape as patient_diagnostic_studies, for the
--      same reason.
--
--   2. POST-OPERATIVE STATUS CHANGES OVER TIME.    -> patient_treatment_status
--      Weight bearing goes NWB -> TTWB -> PWB -> FWB. An incision goes from
--      fresh to healed. Those are the things a rehabilitation clinician
--      actually tracks, and as single overwritable strings the progression is
--      invisible — you can see where the patient is and never where they were.
--      Rows with an `effective_date`; the latest is current.
--
--   3. THE CASE ITSELF DOES NOT CHANGE.            -> columns on `patients`
--      Treatment approach and affected limb belong to the patient, not to a
--      procedure and not to a point in time. They go beside `condition` and
--      `affected_region`, which are already there.
--
-- AFFECTED LIMB IS NOT AFFECTED REGION
-- ------------------------------------
-- `patients.affected_region` holds the LESION SITE in an anatomical
-- vocabulary — "Thoracolumbar spine", "Stifle — right". `getProtocolType`
-- string-matches it, so it decides which protocol runs.
--
-- `affected_limbs` holds LIMBS — "Both hindlimbs", "Left hindlimb (LH)". Both
-- controls are live in the Treatment panel and they are different clinical
-- facts. Until 2026-09-24 dashboard-bridge aliased them onto one engine input,
-- and the consequence was measurable:
--
--     "Osteoarthritis" + "Left Stifle"         ->  tplo protocol
--     "Osteoarthritis" + "Left hindlimb (LH)"  ->  oa protocol
--
-- Same patient, same limb, different protocol, decided by which field
-- answered first. The limb has its own column here and NEVER feeds the
-- protocol router. It is recorded because a clinician needs it, not because
-- the engine does.
--
-- TREATMENT APPROACH: TWO VALUES, NOT THREE
-- -----------------------------------------
-- Surgical or Conservative. PALLIATIVE was retired on 2026-09-25 — a
-- palliative patient is not a rehabilitation candidate.
--
-- There is deliberately NO database constraint on the value. The store
-- refuses 'Palliative' on WRITE and still READS one, so a legacy or imported
-- row is visible and replaceable rather than failing an insert and losing the
-- record. The engine also still routes that token: the pain >= 8 override
-- travels through it to reach the comfort protocol.
-- ===========================================================================

-- ── 1. Procedures ──────────────────────────────────────────────────────────
-- One row per operation. A repeat or contralateral procedure is a new row.
CREATE TABLE IF NOT EXISTS patient_procedures (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id          INTEGER NOT NULL,

  -- Free text on purpose. The form offers a list but a surgeon's report says
  -- things a dropdown does not, and truncating it to fit is how detail is
  -- lost. Nothing in the engine matches on this field.
  procedure_type      TEXT NOT NULL,

  -- ISO date. NULLABLE, and that is a clinical statement rather than a gap:
  -- a patient can arrive post-operative with no date on record, and
  -- intake-proposal treats an undated surgical case as ACTIVE — it cannot
  -- know the incision has healed, so it asks. Inventing a date here would
  -- silently close those gates.
  procedure_date      TEXT,

  surgeon             TEXT,
  facility            TEXT,
  notes               TEXT,

  recorded_by         INTEGER,
  created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (patient_id)  REFERENCES patients(id),
  FOREIGN KEY (recorded_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_procedures_patient ON patient_procedures(patient_id);
CREATE INDEX IF NOT EXISTS idx_procedures_date    ON patient_procedures(patient_id, procedure_date);

-- ── 2. Treatment status over time ──────────────────────────────────────────
-- One row per recorded state. The row with the latest `effective_date` is
-- current; earlier rows are the progression and are never updated in place.
CREATE TABLE IF NOT EXISTS patient_treatment_status (
  id                      INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id              INTEGER NOT NULL,

  -- When this state was TRUE, which is not when the row was written. A
  -- clinician recording Friday's findings on Monday needs Friday's date, or
  -- the progression reads as having happened at the keyboard.
  effective_date          TEXT NOT NULL,

  -- ── The two engine safety gates ──
  -- Stored as the FORM's wording, not the engine's token. dashboard-bridge
  -- normalises ("Non-weight bearing (NWB)" -> 'NWB'), and storing the token
  -- would mean a screen showing a clinician an abbreviation they never chose
  -- and losing the distinction between the four option lists that exist.
  weight_bearing_status   TEXT,
  incision_status         TEXT,

  -- ── Tri-state flags: NULL is a real value ──
  -- NULL means nobody has answered. 0 means a clinician said no. They are
  -- different clinical statements and the engine treats them differently:
  -- the e-collar and crate-rest gates DEFAULT TO REQUIRED inside the acute
  -- post-operative window, so reading an unanswered box as "no" would quietly
  -- relax both. No DEFAULT clause here, on purpose.
  e_collar_required       INTEGER,
  strict_crate_rest       INTEGER,
  sling_assist_required   INTEGER,

  -- The blob this block migrated from carried NO date: the V1 form stores a
  -- current state and never when it was observed. Rather than stamp the
  -- migration date and have it read as a finding, the row keeps a date so it
  -- can be ordered and carries this flag so nobody mistakes it for one.
  -- A clinician recording the next status clears it by simply recording one.
  effective_date_is_unknown INTEGER DEFAULT 0,

  activity_restrictions   TEXT,
  clinical_notes          TEXT,

  recorded_by             INTEGER,
  created_at              DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (patient_id)  REFERENCES patients(id),
  FOREIGN KEY (recorded_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_tx_status_patient ON patient_treatment_status(patient_id);
CREATE INDEX IF NOT EXISTS idx_tx_status_current ON patient_treatment_status(patient_id, effective_date DESC);

-- ── 3. Case-level facts, beside the ones already on `patients` ─────────────
-- Added by migration rather than declared here; see
-- scripts/migrate-treatment-to-v3.js. SQLite has no ADD COLUMN IF NOT EXISTS,
-- so the migration checks PRAGMA table_info first.
--
--   patients.treatment_approach   'Surgical' | 'Conservative'
--   patients.affected_limbs       the limb vocabulary, never the engine's
