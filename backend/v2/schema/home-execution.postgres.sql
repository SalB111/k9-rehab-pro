-- ===========================================================================
-- K9 Clinical Workflow V2 - Home execution and the client feedback loop
-- Postgres / Supabase migration
-- ===========================================================================
--
-- Mirror of home-execution.sqlite.sql. See that file for the rationale:
-- owner-reported data is stored apart from clinician measurements and never
-- blended into them, and everything here is append-only reporting against a
-- frozen handoff. B.E.A.U. cannot alter an approved prescription.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS v2_home_sessions (
  id                 BIGSERIAL PRIMARY KEY,
  patient_id         BIGINT NOT NULL,
  handoff_id         BIGINT NOT NULL REFERENCES v2_beau_handoffs(id),
  version_id         BIGINT NOT NULL REFERENCES v2_protocol_versions(id),

  session_date       DATE NOT NULL,
  week_number        INTEGER,

  status             TEXT NOT NULL DEFAULT 'STARTED',

  overall_difficulty TEXT,
  owner_pain_rating  INTEGER,
  owner_notes        TEXT,

  red_flag_reported  INTEGER NOT NULL DEFAULT 0,

  started_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at       TIMESTAMPTZ,

  reviewed_by            BIGINT REFERENCES users(id),
  reviewed_by_username   TEXT,
  reviewed_at            TIMESTAMPTZ,
  review_note            TEXT,

  CONSTRAINT v2_hs_status_check CHECK (status IN ('STARTED','COMPLETED','ABANDONED')),
  CONSTRAINT v2_hs_difficulty_check CHECK (
    overall_difficulty IS NULL
    OR overall_difficulty IN ('EASY','JUST_RIGHT','HARD','TOO_HARD')
  )
);

CREATE INDEX IF NOT EXISTS idx_v2_hs_patient_id ON v2_home_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_v2_hs_date ON v2_home_sessions(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_v2_hs_unreviewed ON v2_home_sessions(reviewed_at);

CREATE TABLE IF NOT EXISTS v2_home_exercise_logs (
  id               BIGSERIAL PRIMARY KEY,
  home_session_id  BIGINT NOT NULL REFERENCES v2_home_sessions(id),

  exercise_code    TEXT NOT NULL,
  exercise_name    TEXT,

  prescribed_sets  TEXT,
  prescribed_reps  TEXT,

  completed        INTEGER NOT NULL DEFAULT 0,
  partial          INTEGER NOT NULL DEFAULT 0,
  skipped_reason   TEXT,

  difficulty       TEXT,
  owner_note       TEXT,
  red_flag_observed TEXT,

  sort_order       INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_v2_hel_session_id ON v2_home_exercise_logs(home_session_id);

CREATE TABLE IF NOT EXISTS v2_home_observations (
  id                BIGSERIAL PRIMARY KEY,
  patient_id        BIGINT NOT NULL,
  home_session_id   BIGINT REFERENCES v2_home_sessions(id),

  observation_type  TEXT NOT NULL,
  severity          TEXT,
  detail            TEXT NOT NULL,

  recheck_request_id BIGINT REFERENCES v2_recheck_requests(id),

  status            TEXT NOT NULL DEFAULT 'NEW',
  seen_by           BIGINT REFERENCES users(id),
  seen_by_username  TEXT,
  seen_at           TIMESTAMPTZ,

  reported_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT v2_ho_type_check CHECK (observation_type IN ('FEEDBACK','RED_FLAG','QUESTION')),
  CONSTRAINT v2_ho_status_check CHECK (status IN ('NEW','SEEN','ACTIONED'))
);

CREATE INDEX IF NOT EXISTS idx_v2_ho_patient_id ON v2_home_observations(patient_id);
CREATE INDEX IF NOT EXISTS idx_v2_ho_status ON v2_home_observations(status);

CREATE TABLE IF NOT EXISTS v2_video_requests (
  id                BIGSERIAL PRIMARY KEY,
  patient_id        BIGINT NOT NULL,
  version_id        BIGINT,
  exercise_code     TEXT,

  requested_by      BIGINT REFERENCES users(id),
  requested_by_username TEXT,
  request_note      TEXT,
  requested_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  status            TEXT NOT NULL DEFAULT 'REQUESTED',

  home_session_id   BIGINT REFERENCES v2_home_sessions(id),
  media_ref         TEXT,
  owner_note        TEXT,
  submitted_at      TIMESTAMPTZ,

  reviewed_by       BIGINT REFERENCES users(id),
  reviewed_by_username TEXT,
  reviewed_at       TIMESTAMPTZ,
  review_note       TEXT,

  CONSTRAINT v2_vr_status_check CHECK (
    status IN ('REQUESTED','SUBMITTED','REVIEWED','DECLINED','CANCELLED')
  )
);

CREATE INDEX IF NOT EXISTS idx_v2_vr_patient_id ON v2_video_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_v2_vr_status ON v2_video_requests(status);

CREATE TABLE IF NOT EXISTS v2_home_engagement (
  id            BIGSERIAL PRIMARY KEY,
  patient_id    BIGINT NOT NULL,
  handoff_id    BIGINT,
  event         TEXT NOT NULL,
  detail        TEXT,
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_v2_he_patient_id ON v2_home_engagement(patient_id);
CREATE INDEX IF NOT EXISTS idx_v2_he_occurred ON v2_home_engagement(occurred_at DESC);

-- ===========================================================================
-- ROW LEVEL SECURITY
--
-- Home reporting is append-only. There is deliberately no UPDATE or DELETE
-- policy on the log tables: B.E.A.U. reports what happened and cannot revise
-- the record afterwards. Marking something as seen is a clinician action and
-- happens through the reviewing endpoints.
-- ===========================================================================

ALTER TABLE v2_home_sessions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_home_exercise_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_home_observations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_video_requests      ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_home_engagement     ENABLE ROW LEVEL SECURITY;

CREATE POLICY v2_hs_select ON v2_home_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY v2_hs_insert ON v2_home_sessions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY v2_hs_update ON v2_home_sessions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY v2_hel_select ON v2_home_exercise_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY v2_hel_insert ON v2_home_exercise_logs FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY v2_ho_select ON v2_home_observations FOR SELECT TO authenticated USING (true);
CREATE POLICY v2_ho_insert ON v2_home_observations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY v2_ho_update ON v2_home_observations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY v2_vr_select ON v2_video_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY v2_vr_write ON v2_video_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY v2_he_select ON v2_home_engagement FOR SELECT TO authenticated USING (true);
CREATE POLICY v2_he_insert ON v2_home_engagement FOR INSERT TO authenticated WITH CHECK (true);
