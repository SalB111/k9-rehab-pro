-- ===========================================================================
-- K9 Clinical Workflow V2 — Clinical Authority
-- SQLite schema
-- ===========================================================================
--
-- WHO MAY APPROVE A HOME EXERCISE PRESCRIPTION
-- --------------------------------------------
-- Approval authority in the founding clinics rests with either:
--   * the attending veterinarian, by virtue of licensure, or
--   * a credentialed rehabilitation practitioner (CCRP / CCRT), by virtue of
--     a CURRENT credential.
--
-- Those are two different bases for the same authority, and the record must say
-- which one was used. "Approved by role=clinician" is not a sufficient clinical
-- record; "approved by Jane Doe, CCRP, certificate 12345, valid at the time of
-- approval" is.
--
-- WHY A SEPARATE TABLE RATHER THAN A COLUMN ON users
-- --------------------------------------------------
-- 1. The production `users` table is not modified. Per the build rule, V2 does
--    not alter live K9 tables until its own path is verified.
-- 2. A practitioner may hold more than one credential.
-- 3. A credential has a license number, an issuing body and an EXPIRY. A
--    boolean column cannot express "was valid on the date of approval", which
--    is exactly the question an audit asks.
--
-- EXPIRY IS A SAFETY PROPERTY, NOT BOOKKEEPING
-- --------------------------------------------
-- A lapsed CCRP must not be able to approve treatment. The authority check
-- evaluates validity at approval time, and the approval record stores the
-- credential it relied on, so a later expiry cannot retroactively invalidate a
-- past approval that was legitimate when made.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS clinician_credentials (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER NOT NULL,

  credential     TEXT NOT NULL,   -- DVM | VMD | BVSc | CCRP | CCRT | CCRV | CCRA
  license_number TEXT,
  issuing_body   TEXT,            -- e.g. state veterinary board, UTCVM, CRI

  valid_from     DATE,
  valid_until    DATE,            -- NULL = no stated expiry

  status         TEXT NOT NULL DEFAULT 'ACTIVE',   -- ACTIVE | EXPIRED | REVOKED | SUSPENDED

  -- Who entered/checked this credential. A credential nobody verified is still
  -- recorded, but the record shows it was unverified.
  verified_by    INTEGER,
  verified_at    DATETIME,

  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (verified_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_cc_user_id ON clinician_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_cc_status ON clinician_credentials(status);

-- ---------------------------------------------------------------------------
-- system_owner — who owns this installation.
--
-- Approval authority is restricted by design, which creates a real failure
-- mode: once a second administrator exists, they can demote the first. In a
-- deployed system the person who built and owns the software can be locked out
-- of it by someone they granted access to.
--
-- The owner's role cannot be changed by anyone else. It is NOT a hidden
-- backdoor: the owner is listed in the access UI and the CLI, and the owner can
-- release or transfer the marker deliberately when handing an installation over
-- to a hospital's own administrator.
--
-- One row. Enforced by the fixed primary key.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS system_owner (
  id         INTEGER PRIMARY KEY CHECK (id = 1),
  user_id    INTEGER NOT NULL,
  note       TEXT,
  set_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ---------------------------------------------------------------------------
-- test_fixtures — everything the test-clinic seeder created.
--
-- Tracked explicitly rather than inferred from a name prefix, so tearing the
-- test environment down can never delete a real patient that happens to be
-- named like one. Reset removes exactly what was created and nothing else.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS test_fixtures (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  kind       TEXT NOT NULL,          -- clinic | patient | user | credential
  ref_id     INTEGER NOT NULL,
  label      TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_test_fixtures_kind ON test_fixtures(kind);
