-- ===========================================================================
-- K9 Clinical Workflow V2 — Home execution and the client feedback loop
-- SQLite schema
-- ===========================================================================
--
-- THE RETURN PATH
-- ---------------
--   owner opens the app -> follows the approved HEP step by step
--     -> answers a few short questions -> optionally submits a requested video
--     -> it lands on the chart -> a clinician reads it -> the record advances
--
-- OWNER-REPORTED IS NOT CLINICIAN-MEASURED
-- ----------------------------------------
-- Everything in this file is observed by a pet owner at home. It is stored
-- apart from `visit_measurements` and never written into them.
--
-- An owner's pain estimate and a clinician's pain score are different
-- measurements of different things by differently-trained observers. Blending
-- them produces a trend line that looks continuous and is not, and that trend
-- is what drives the next protocol. The two are shown side by side and labelled;
-- they are never summed, averaged, or silently interleaved.
--
-- B.E.A.U. CANNOT PRESCRIBE
-- -------------------------
-- These tables are append-only reporting against a FROZEN handoff payload.
-- Nothing here can alter an approved protocol, a dosage, or a restriction. A
-- change to treatment is a clinical decision that happens in K9, by a
-- clinician, as a new protocol version.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- home_sessions — one attempt at the home program.
--
-- Status carries the adherence signal directly: STARTED means the owner opened
-- the program and began, ABANDONED means they began and stopped. A protocol
-- that is repeatedly abandoned needs simplifying, not progressing — and only
-- the distinction between "never started" and "started and gave up" tells a
-- clinician which.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS home_sessions (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id         INTEGER NOT NULL,

  -- The exact approved prescription that was live when this was performed.
  -- Required: a home session has to be attributable to what the owner was
  -- actually told to do, not to whatever is current now.
  handoff_id         INTEGER NOT NULL,
  version_id         INTEGER NOT NULL,

  session_date       DATE NOT NULL,
  week_number        INTEGER,

  status             TEXT NOT NULL DEFAULT 'STARTED',  -- STARTED | COMPLETED | ABANDONED

  -- The few short questions asked once, after the exercises. Kept short on
  -- purpose: a long form after every session is a form that stops being filled
  -- in, and then the whole feedback loop goes quiet.
  overall_difficulty TEXT,     -- EASY | JUST_RIGHT | HARD | TOO_HARD
  owner_pain_rating  INTEGER,  -- 0-10, OWNER-OBSERVED. Not a clinical pain score.
  owner_notes        TEXT,

  red_flag_reported  INTEGER NOT NULL DEFAULT 0,

  started_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at       DATETIME,

  -- "Once seen by the vet or CCRT". Whether anyone has read it is a state, not
  -- an assumption.
  reviewed_by            INTEGER,
  reviewed_by_username   TEXT,
  reviewed_at            DATETIME,
  review_note            TEXT,

  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (handoff_id) REFERENCES beau_handoffs(id),
  FOREIGN KEY (version_id) REFERENCES protocol_versions(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_hs_patient_id ON home_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_hs_date ON home_sessions(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_hs_unreviewed ON home_sessions(reviewed_at);

-- ---------------------------------------------------------------------------
-- home_exercise_logs — what the owner did, exercise by exercise.
--
-- The prescribed dosage is frozen here, as it is for in-clinic sessions, so a
-- later revision cannot rewrite the history of what was attempted.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS home_exercise_logs (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  home_session_id  INTEGER NOT NULL,

  exercise_code    TEXT NOT NULL,
  exercise_name    TEXT,

  prescribed_sets  TEXT,
  prescribed_reps  TEXT,

  completed        INTEGER NOT NULL DEFAULT 0,  -- 0/1
  partial          INTEGER NOT NULL DEFAULT 0,  -- attempted but not finished
  skipped_reason   TEXT,

  difficulty       TEXT,     -- EASY | JUST_RIGHT | HARD | TOO_HARD
  owner_note       TEXT,

  -- Which stop condition the owner observed, in their words. The clinician
  -- wrote these red flags into the exercise; this is one coming back.
  red_flag_observed TEXT,

  sort_order       INTEGER DEFAULT 0,

  FOREIGN KEY (home_session_id) REFERENCES home_sessions(id)
);

CREATE INDEX IF NOT EXISTS idx_hel_session_id ON home_exercise_logs(home_session_id);

-- ---------------------------------------------------------------------------
-- home_observations — anything the owner wants the clinic to know, and any
-- red flag they saw.
--
-- A red flag does not sit here waiting to be noticed. The store raises a
-- recheck request from it, so an owner-reported stop condition lands in the
-- same queue a CCRT's concern does and is answered by a clinician. A safety
-- signal that only surfaces when somebody happens to open the chart is not a
-- safety net.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS home_observations (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id        INTEGER NOT NULL,
  home_session_id   INTEGER,

  observation_type  TEXT NOT NULL,   -- FEEDBACK | RED_FLAG | QUESTION
  severity          TEXT,            -- MILD | MODERATE | SEVERE  (red flags)
  detail            TEXT NOT NULL,

  -- Set when a red flag escalated into a clinical concern.
  recheck_request_id INTEGER,

  status            TEXT NOT NULL DEFAULT 'NEW',   -- NEW | SEEN | ACTIONED
  seen_by           INTEGER,
  seen_by_username  TEXT,
  seen_at           DATETIME,

  reported_at       DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (home_session_id) REFERENCES home_sessions(id),
  FOREIGN KEY (recheck_request_id) REFERENCES recheck_requests(id),
  FOREIGN KEY (seen_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_ho_patient_id ON home_observations(patient_id);
CREATE INDEX IF NOT EXISTS idx_ho_status ON home_observations(status);

-- ---------------------------------------------------------------------------
-- video_requests — a clinician asking to see a specific exercise performed.
--
-- Requested rather than always-on. A general clip of the dog is rarely watched;
-- "send me a video of the sit-to-stand" is a targeted question about form on
-- the exercise the clinician is actually worried about, and it gets answered.
--
-- The media itself is referenced, not stored here. Consent and retention are
-- decisions for the practice, and a clinical database is the wrong place to
-- accumulate video.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS video_requests (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id        INTEGER NOT NULL,
  version_id        INTEGER,
  exercise_code     TEXT,

  requested_by      INTEGER,
  requested_by_username TEXT,
  request_note      TEXT,
  requested_at      DATETIME DEFAULT CURRENT_TIMESTAMP,

  status            TEXT NOT NULL DEFAULT 'REQUESTED',
  -- REQUESTED | SUBMITTED | REVIEWED | DECLINED | CANCELLED

  home_session_id   INTEGER,
  media_ref         TEXT,          -- storage reference, not the media itself
  owner_note        TEXT,
  submitted_at      DATETIME,

  reviewed_by       INTEGER,
  reviewed_by_username TEXT,
  reviewed_at       DATETIME,
  review_note       TEXT,

  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (home_session_id) REFERENCES home_sessions(id),
  FOREIGN KEY (requested_by) REFERENCES users(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_vr_patient_id ON video_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_vr_status ON video_requests(status);

-- ---------------------------------------------------------------------------
-- home_engagement — did the client open the app at all.
--
-- Distinct from adherence on purpose. An owner who opens the program and does
-- not start it has a different problem from one who never opens it: the first
-- is usually difficulty or confusion, the second is usually that nobody
-- explained why it matters. The clinical response differs, so the signal has to
-- be separable.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS home_engagement (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id    INTEGER NOT NULL,
  handoff_id    INTEGER,
  event         TEXT NOT NULL,   -- APP_OPENED | HEP_VIEWED | EXERCISE_VIEWED | SESSION_STARTED
  detail        TEXT,
  occurred_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

CREATE INDEX IF NOT EXISTS idx_he_patient_id ON home_engagement(patient_id);
CREATE INDEX IF NOT EXISTS idx_he_occurred ON home_engagement(occurred_at DESC);

-- ---------------------------------------------------------------------------
-- home_access — how an owner reaches their dog's program.
--
-- Pet owners do not get clinician accounts. They receive a code from the
-- practice, and that code resolves to one patient.
--
-- Tied to the PATIENT rather than to a handoff, deliberately: a protocol is
-- revised often, and forcing a new code on every revision would mean an owner
-- losing access precisely when their program changed. Revoking is explicit.
--
-- The code is compared as a hash, not stored in the clear, for the same reason
-- passwords are: whoever can read the database should not be able to walk into
-- a client's record.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS home_access (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id     INTEGER NOT NULL,
  code_hash      TEXT NOT NULL,
  code_hint      TEXT,          -- last 4 characters, so the clinic can identify it
  status         TEXT NOT NULL DEFAULT 'ACTIVE',   -- ACTIVE | REVOKED
  issued_by      INTEGER,
  issued_by_username TEXT,
  issued_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_used_at   DATETIME,
  revoked_at     DATETIME,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (issued_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_ha_patient_id ON home_access(patient_id);
CREATE INDEX IF NOT EXISTS idx_ha_status ON home_access(status);
