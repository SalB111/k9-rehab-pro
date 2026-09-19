-- ===========================================================================
-- K9 Clinical Workflow V2 - In-clinic treatment sessions
-- Postgres / Supabase migration
-- ===========================================================================
--
-- Mirror of clinic-sessions.sqlite.sql. See that file for the rationale: the
-- in-clinic stream is where a rehab practice spends its day and where a
-- deteriorating patient is noticed first, and "delivered" is recorded
-- separately from "prescribed" so a deviation stays visible.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS v2_clinic_sessions (
  id                    BIGSERIAL PRIMARY KEY,
  patient_id            BIGINT NOT NULL,
  version_id            BIGINT NOT NULL REFERENCES v2_protocol_versions(id),

  session_date          DATE NOT NULL,
  session_number        INTEGER,

  therapist_id          BIGINT REFERENCES users(id),
  therapist_username    TEXT,
  therapist_role        TEXT,

  pre_session_pain      INTEGER,
  post_session_pain     INTEGER,
  pre_session_lameness  INTEGER,
  post_session_lameness INTEGER,

  tolerance             TEXT,
  session_notes         TEXT,

  status                TEXT NOT NULL DEFAULT 'IN_PROGRESS',

  reviewed_by           BIGINT REFERENCES users(id),
  reviewed_by_username  TEXT,
  reviewed_at           TIMESTAMPTZ,
  review_note           TEXT,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at          TIMESTAMPTZ,

  CONSTRAINT v2_cs_status_check CHECK (status IN ('IN_PROGRESS','COMPLETED')),
  CONSTRAINT v2_cs_tolerance_check CHECK (tolerance IS NULL OR tolerance IN ('WELL','FAIR','POORLY'))
);

CREATE INDEX IF NOT EXISTS idx_v2_cs_patient_id ON v2_clinic_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_v2_cs_date ON v2_clinic_sessions(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_v2_cs_unreviewed ON v2_clinic_sessions(reviewed_at);

CREATE TABLE IF NOT EXISTS v2_clinic_session_exercises (
  id                     BIGSERIAL PRIMARY KEY,
  session_id             BIGINT NOT NULL REFERENCES v2_clinic_sessions(id),

  exercise_code          TEXT NOT NULL,
  exercise_name          TEXT,

  prescribed_sets        TEXT,
  prescribed_reps        TEXT,
  prescribed_duration    INTEGER,

  performed_sets         TEXT,
  performed_reps         TEXT,
  performed_duration     INTEGER,

  completed              INTEGER NOT NULL DEFAULT 0,
  deviation_reason       TEXT,

  assistance_level       TEXT,
  surface_type           TEXT,
  observed_compensations TEXT,
  performance_notes      TEXT,

  sort_order             INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_v2_cse_session_id ON v2_clinic_session_exercises(session_id);

CREATE TABLE IF NOT EXISTS v2_recheck_requests (
  id                    BIGSERIAL PRIMARY KEY,
  patient_id            BIGINT NOT NULL,
  session_id            BIGINT REFERENCES v2_clinic_sessions(id),
  version_id            BIGINT,

  raised_by             BIGINT REFERENCES users(id),
  raised_by_username    TEXT,
  raised_by_role        TEXT,
  raised_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  urgency               TEXT NOT NULL DEFAULT 'ROUTINE',
  reason                TEXT NOT NULL,
  clinical_findings     TEXT,

  status                TEXT NOT NULL DEFAULT 'OPEN',

  acknowledged_by       BIGINT REFERENCES users(id),
  acknowledged_by_username TEXT,
  acknowledged_at       TIMESTAMPTZ,
  vet_response          TEXT,
  resolved_at           TIMESTAMPTZ,

  CONSTRAINT v2_rr_urgency_check CHECK (urgency IN ('ROUTINE','SOON','URGENT')),
  CONSTRAINT v2_rr_status_check CHECK (
    status IN ('OPEN','ACKNOWLEDGED','SCHEDULED','RESOLVED','DECLINED','WITHDRAWN')
  )
);

CREATE INDEX IF NOT EXISTS idx_v2_rr_patient_id ON v2_recheck_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_v2_rr_status ON v2_recheck_requests(status);
CREATE INDEX IF NOT EXISTS idx_v2_rr_urgency ON v2_recheck_requests(urgency);

-- ===========================================================================
-- ROW LEVEL SECURITY
--
-- Session delivery is open to authenticated clinical staff. Responding to a
-- recheck request is not: only a clinician may acknowledge or resolve one, so
-- a concern cannot be closed by the person who is not deciding on it.
-- ===========================================================================

ALTER TABLE v2_clinic_sessions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_clinic_session_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_recheck_requests         ENABLE ROW LEVEL SECURITY;

CREATE POLICY v2_cs_select ON v2_clinic_sessions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY v2_cs_write ON v2_clinic_sessions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY v2_cse_select ON v2_clinic_session_exercises
  FOR SELECT TO authenticated USING (true);
CREATE POLICY v2_cse_write ON v2_clinic_session_exercises
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY v2_rr_select ON v2_recheck_requests
  FOR SELECT TO authenticated USING (true);
CREATE POLICY v2_rr_insert ON v2_recheck_requests
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY v2_rr_clinician_response ON v2_recheck_requests
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = auth.uid()::text
        AND lower(users.role) IN ('veterinarian','vet','dvm','rehab_practitioner','admin')
    )
  );
