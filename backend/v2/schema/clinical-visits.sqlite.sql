-- ===========================================================================
-- K9 Clinical Workflow V2 — Clinical Visits, Assessments and Measurements
-- SQLite schema
-- ===========================================================================
--
-- THE PROBLEM THIS SOLVES
-- -----------------------
-- K9 today has no longitudinal clinical record. PATCH /api/patients/:id/measures
-- writes rom_joint, rom_flexion, rom_extension, hcpi_score, cbpi_pss, cbpi_pis
-- and load_score directly onto the `patients` row. Every measurement OVERWRITES
-- the previous one. The patient record holds only the most recent value and the
-- history is destroyed.
--
-- Consequences in a rehabilitation setting:
--   - "change since previous visit" cannot be computed
--   - a joint's ROM cannot be trended across a course of treatment
--   - the clinical snapshot the V2 spec calls for has nothing to draw on
--   - a protocol version cannot be explained by the assessment that produced it
--
-- Rehabilitation is longitudinal by nature: the clinical question is almost
-- never "what is the pain score" but "what is it compared with three weeks ago".
--
-- WHAT THIS ADDS
-- --------------
-- visits              — the clinical encounter
-- visit_assessments   — today's structured clinical state, typed to mirror the
--                       engine's visit-level inputs one for one
-- visit_measurements  — open-ended measures (ROM, girth, outcome scores),
--                       append-only, keyed by site so both stifles can be
--                       tracked separately
--
-- Nothing here overwrites. A correction is a new row that supersedes an old
-- one, so the clinical record remains evidentiary.
--
-- The existing `patients` measure columns and the orphaned `progress_assessments`
-- table are left in place and untouched, per the build rule.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- visits — one clinical encounter.
--
-- A protocol version is generated FROM a visit. That link is what makes an
-- approved protocol explainable: it points at the assessment that produced it.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS visits (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id        INTEGER NOT NULL,
  visit_date        DATE NOT NULL,
  visit_type        TEXT NOT NULL DEFAULT 'RECHECK',   -- INITIAL | RECHECK | REASSESSMENT | DISCHARGE
  status            TEXT NOT NULL DEFAULT 'OPEN',      -- OPEN | COMPLETED
  clinician_id      INTEGER,
  clinician_username TEXT,
  clinician_role    TEXT,
  visit_notes       TEXT,
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at      DATETIME,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (clinician_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_visits_patient_id ON visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_visits_date ON visits(visit_date DESC);

-- ---------------------------------------------------------------------------
-- visit_assessments — today's structured clinical state.
--
-- Columns mirror the engine's visit-level inputs one for one, deliberately. The
-- engine gates on these exact fields; keeping the storage shape aligned with the
-- engine contract means a missing gate input is visible as a NULL column rather
-- than hidden inside a JSON blob.
--
-- One assessment per visit (UNIQUE), updated in place while the visit is OPEN.
-- Once the visit is COMPLETED the store refuses further edits — a correction
-- becomes an amended visit, so the clinical record is not silently rewritten.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS visit_assessments (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  visit_id             INTEGER NOT NULL UNIQUE,
  patient_id           INTEGER NOT NULL,

  -- Core clinical state
  pain_score           INTEGER,
  lameness_grade       INTEGER,
  weight_bearing_status TEXT,      -- NWB | TTWB | PWB | FWB
  mobility_level       TEXT,
  gait_quality         TEXT,
  treatment_approach   TEXT,

  -- Clinical grading scales — each drives a phase lock in the engine
  mmt_grade            INTEGER,    -- 0-5;  <=1 restricts to passive/NMES
  ivdd_grade           TEXT,       -- I-V;  IV/V locks to Phase 1 neuro
  oa_stage             INTEGER,    -- 0-4;  >=4 excludes impact loading

  -- Neurological examination
  neuro_proprioception TEXT,
  neuro_withdrawal     TEXT,
  neuro_deep_pain      TEXT,       -- 'absent' triggers Grade V support only
  neuro_motor_grade    TEXT,

  -- Post-operative status
  incision_status      TEXT,       -- dehisced/infected/open/draining hard-blocks
  complications_noted  TEXT,

  -- Activity restrictions in force
  crate_rest_required  INTEGER,    -- 0/1
  e_collar_required    INTEGER,    -- 0/1

  -- Clinician's longitudinal judgement. Not derived — the clinician states it.
  overall_change       TEXT,       -- IMPROVED | STABLE | WORSE | NO_SIGNIFICANT_CHANGE
  clinical_observation TEXT,

  recorded_by          INTEGER,
  recorded_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (visit_id) REFERENCES visits(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (recorded_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_va_patient_id ON visit_assessments(patient_id);

-- ---------------------------------------------------------------------------
-- visit_measurements — append-only measurement history.
--
-- Key/value rather than fixed columns because the measure set is open-ended:
-- ROM per joint per direction, girth per site, and outcome instruments (HCPI,
-- CBPI-PSS, CBPI-PIS, LOAD) that clinics adopt at different times. A new
-- instrument must not require a migration.
--
-- `site` and `side` are separate from `measure_key` so the same measure can be
-- tracked bilaterally -- "stifle flexion" on the operated and contralateral limb
-- are two trends, not one, and comparing them is how symmetry is judged.
--
-- APPEND ONLY. A correction inserts a new row and points `supersedes_id` at the
-- one it replaces. Nothing is ever updated or deleted, so a past protocol can
-- always be explained by the numbers that were true when it was approved.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS visit_measurements (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  visit_id       INTEGER NOT NULL,
  patient_id     INTEGER NOT NULL,

  measure_key    TEXT NOT NULL,    -- ROM_FLEXION | ROM_EXTENSION | GIRTH | HCPI | CBPI_PSS | CBPI_PIS | LOAD ...
  site           TEXT,             -- STIFLE | HIP | ELBOW | THIGH ...
  side           TEXT,             -- LEFT | RIGHT | BILATERAL | NA
  value_numeric  REAL,
  value_text     TEXT,
  unit           TEXT,             -- degrees | cm | score

  supersedes_id  INTEGER,          -- correction chain; NULL for an original reading
  recorded_by    INTEGER,
  recorded_at    DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (visit_id) REFERENCES visits(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (supersedes_id) REFERENCES visit_measurements(id),
  FOREIGN KEY (recorded_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_vm_patient_key ON visit_measurements(patient_id, measure_key);
CREATE INDEX IF NOT EXISTS idx_vm_visit_id ON visit_measurements(visit_id);

-- ---------------------------------------------------------------------------
-- Link a protocol version back to the visit that produced it.
--
-- Added here rather than in the protocol schema because the dependency runs
-- visit -> version: a recommendation is generated from an assessment. Without
-- this link an approved protocol cannot be traced to the clinical findings that
-- justified it.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS visit_protocol_versions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  visit_id    INTEGER NOT NULL,
  version_id  INTEGER NOT NULL UNIQUE,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (visit_id) REFERENCES visits(id),
  FOREIGN KEY (version_id) REFERENCES protocol_versions(id)
);

CREATE INDEX IF NOT EXISTS idx_vpv_visit_id ON visit_protocol_versions(visit_id);
