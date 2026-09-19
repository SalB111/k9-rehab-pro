-- ===========================================================================
-- K9 Clinical Workflow V2 — Clinical Authority
-- Postgres / Supabase migration
-- ===========================================================================
--
-- Mirror of clinical-authority.sqlite.sql. Approval authority rests with the
-- attending veterinarian (by licensure) or a credentialed rehabilitation
-- practitioner (by a CURRENT CCRP/CCRT). The record must say which basis was
-- used, so the production `users` table is left alone and credentials live here
-- with their issuing body, licence number and expiry.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS v2_clinician_credentials (
  id             BIGSERIAL PRIMARY KEY,
  user_id        BIGINT NOT NULL REFERENCES users(id),

  credential     TEXT NOT NULL,
  license_number TEXT,
  issuing_body   TEXT,

  valid_from     DATE,
  valid_until    DATE,

  status         TEXT NOT NULL DEFAULT 'ACTIVE',

  verified_by    BIGINT REFERENCES users(id),
  verified_at    TIMESTAMPTZ,

  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT v2_cc_status_check CHECK (status IN ('ACTIVE','EXPIRED','REVOKED','SUSPENDED'))
);

CREATE INDEX IF NOT EXISTS idx_v2_cc_user_id ON v2_clinician_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_v2_cc_status ON v2_clinician_credentials(status);

-- ===========================================================================
-- ROW LEVEL SECURITY
--
-- Everyone authenticated may READ credentials — the approval screen has to show
-- who is able to sign. Only an admin may write them: a practitioner must not be
-- able to grant themselves approval authority by inserting their own CCRP row.
-- ===========================================================================

ALTER TABLE v2_clinician_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY v2_cc_select ON v2_clinician_credentials
  FOR SELECT TO authenticated USING (true);

CREATE POLICY v2_cc_admin_write ON v2_clinician_credentials
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = auth.uid()::text AND lower(users.role) = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = auth.uid()::text AND lower(users.role) = 'admin'
    )
  );
