-- ===========================================================================
-- K9 Clinical Workflow V2 — In-clinic treatment sessions
-- SQLite schema
-- ===========================================================================
--
-- THE THIRD STREAM
-- ----------------
-- Rehabilitation runs on three streams, not two:
--
--   1. VISIT        — the veterinarian assesses and decides.
--   2. IN-CLINIC    — the veterinarian prescribes exercises and modalities; the
--                     CCRT/CCRP delivers them in practice and records how the
--                     patient did. THIS FILE.
--   3. HOME (HEP)   — the owner performs the approved home program.
--
-- The in-clinic stream is where a rehab practice actually spends its day, and
-- it is where a deteriorating patient is noticed first — the CCRT sees the dog
-- weekly, the veterinarian sees them at recheck.
--
-- DELIVERED IS NOT PRESCRIBED
-- ---------------------------
-- A CCRT who reduces reps because the dog was painful has not changed the
-- prescription; they have delivered less of it, for a reason. Both numbers are
-- stored. Overwriting the prescribed values with what happened would erase the
-- clinical decision and make the deviation invisible — and a pattern of
-- deviations is exactly the signal that a protocol needs revising.
--
-- RELATIONSHIP TO THE LEGACY TABLES
-- ---------------------------------
-- K9's `sessions` and `session_exercises` tables model these same concepts
-- (therapist_name, pre/post pain, assistance_level, observed_compensations) and
-- have never had a caller. They are left untouched. V2 uses its own tables so a
-- session is tied to the APPROVED PROTOCOL VERSION it delivered, which the
-- legacy design has no column for — without that link a session cannot be
-- checked against what was actually authorised.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- clinic_sessions — one in-practice treatment session.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clinic_sessions (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id            INTEGER NOT NULL,

  -- The approved protocol version this session delivered. Required: treatment
  -- is delivered FROM an authorisation, and a session that cannot name one
  -- cannot be audited against what the veterinarian approved.
  version_id            INTEGER NOT NULL,

  session_date          DATE NOT NULL,
  session_number        INTEGER,

  therapist_id          INTEGER,
  therapist_username    TEXT,
  therapist_role        TEXT,

  -- Pre/post measures. The pair is the point: a session that raises pain is a
  -- different clinical event from one that lowers it, and only the change shows
  -- that.
  pre_session_pain      INTEGER,
  post_session_pain     INTEGER,
  pre_session_lameness  INTEGER,
  post_session_lameness INTEGER,

  -- The practitioner's overall judgement. Stated, never computed from the
  -- numbers above.
  tolerance             TEXT,        -- WELL | FAIR | POORLY
  session_notes         TEXT,

  status                TEXT NOT NULL DEFAULT 'IN_PROGRESS',  -- IN_PROGRESS | COMPLETED

  -- Veterinary review. "The vet can open the record and see how the patient
  -- did" — so whether they have is a state, not an assumption.
  reviewed_by           INTEGER,
  reviewed_by_username  TEXT,
  reviewed_at           DATETIME,
  review_note           TEXT,

  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at          DATETIME,

  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (version_id) REFERENCES protocol_versions(id),
  FOREIGN KEY (therapist_id) REFERENCES users(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_cs_patient_id ON clinic_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_cs_date ON clinic_sessions(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_cs_unreviewed ON clinic_sessions(reviewed_at);

-- ---------------------------------------------------------------------------
-- clinic_session_exercises — what was delivered, against what was prescribed.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clinic_session_exercises (
  id                     INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id             INTEGER NOT NULL,

  exercise_code          TEXT NOT NULL,
  exercise_name          TEXT,

  -- What the veterinarian authorised, copied at session start so a later
  -- protocol revision cannot rewrite the history of this session.
  prescribed_sets        TEXT,
  prescribed_reps        TEXT,
  prescribed_duration    INTEGER,

  -- What actually happened.
  performed_sets         TEXT,
  performed_reps         TEXT,
  performed_duration     INTEGER,

  completed              INTEGER NOT NULL DEFAULT 0,  -- 0/1
  -- Required when the exercise was not delivered as prescribed. "Why not" is
  -- the clinically interesting field; the numbers alone say nothing.
  deviation_reason       TEXT,

  -- Delivery detail the practitioner observes and the veterinarian needs.
  assistance_level       TEXT,   -- INDEPENDENT | MINIMAL | MODERATE | MAXIMAL
  surface_type           TEXT,
  observed_compensations TEXT,
  performance_notes      TEXT,

  sort_order             INTEGER DEFAULT 0,

  FOREIGN KEY (session_id) REFERENCES clinic_sessions(id)
);

CREATE INDEX IF NOT EXISTS idx_cse_session_id ON clinic_session_exercises(session_id);

-- ---------------------------------------------------------------------------
-- recheck_requests — the CCRT raising a concern to the veterinarian.
--
-- A first-class state rather than a line in session_notes. "Increased pain,
-- recommend recheck" buried in free text is a concern nobody is accountable
-- for. As a row with a status, it is visible without opening the chart, it can
-- be surfaced on the patient snapshot, and it is answerable.
--
-- Only a clinician may respond. The practitioner who raised it may withdraw it;
-- they may not mark it resolved, because that would let a concern be closed by
-- the person who is not the one deciding on it.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recheck_requests (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id            INTEGER NOT NULL,
  session_id            INTEGER,
  version_id            INTEGER,

  raised_by             INTEGER,
  raised_by_username    TEXT,
  raised_by_role        TEXT,
  raised_at             DATETIME DEFAULT CURRENT_TIMESTAMP,

  urgency               TEXT NOT NULL DEFAULT 'ROUTINE',  -- ROUTINE | SOON | URGENT
  reason                TEXT NOT NULL,
  clinical_findings     TEXT,

  status                TEXT NOT NULL DEFAULT 'OPEN',
  -- OPEN | ACKNOWLEDGED | SCHEDULED | RESOLVED | DECLINED | WITHDRAWN

  acknowledged_by       INTEGER,
  acknowledged_by_username TEXT,
  acknowledged_at       DATETIME,
  vet_response          TEXT,
  resolved_at           DATETIME,

  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (session_id) REFERENCES clinic_sessions(id),
  FOREIGN KEY (raised_by) REFERENCES users(id),
  FOREIGN KEY (acknowledged_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_rr_patient_id ON recheck_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_rr_status ON recheck_requests(status);
CREATE INDEX IF NOT EXISTS idx_rr_urgency ON recheck_requests(urgency);
