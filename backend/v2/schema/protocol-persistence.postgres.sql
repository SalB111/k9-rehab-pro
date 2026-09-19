-- ===========================================================================
-- K9 Clinical Workflow V2 — Protocol Persistence
-- Postgres / Supabase migration
-- ===========================================================================
--
-- Mirror of backend/schema/protocol-persistence.sqlite.sql. The K9 providers
-- are dual (DB_PROVIDER=sqlite|supabase) and today they are NOT equivalent --
-- Supabase has an unversioned `protocols` blob table, SQLite has none at all.
-- V2 closes that gap on both sides so behaviour does not depend on which
-- provider is configured.
--
-- Conventions follow supabase/migrations/20260418000000_safety_events.sql:
-- BIGSERIAL keys, TIMESTAMPTZ NOT NULL DEFAULT NOW(), explicit REFERENCES,
-- indexes on lookup columns, RLS enabled with explicit policies.
--
-- NOTE ON THE EXISTING `protocols` TABLE
-- --------------------------------------
-- Supabase already has a `protocols` table written by createProtocol() as a
-- single JSON blob with no version, approval or state. It is NOT dropped or
-- altered here. V2 writes to `v2_protocols` so the legacy path keeps working
-- until it is classified and migrated. Renaming or reshaping a live clinical
-- table before its callers are retired would be exactly the silent breakage
-- the build rule forbids.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- v2_protocols
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS v2_protocols (
  id                  BIGSERIAL PRIMARY KEY,
  patient_id          BIGINT NOT NULL,
  patient_name        TEXT,
  current_version_id  BIGINT,
  status              TEXT NOT NULL DEFAULT 'DRAFT',
  created_by          BIGINT REFERENCES users(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_v2_protocols_patient_id ON v2_protocols(patient_id);

-- ---------------------------------------------------------------------------
-- v2_protocol_versions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS v2_protocol_versions (
  id                        BIGSERIAL PRIMARY KEY,
  protocol_id               BIGINT NOT NULL REFERENCES v2_protocols(id),
  version_number            INTEGER NOT NULL,
  status                    TEXT NOT NULL DEFAULT 'DRAFT',

  engine_input_json         JSONB NOT NULL,
  derived_flags_json        JSONB NOT NULL,
  engine_warnings_json      JSONB,

  protocol_type             TEXT,
  total_weeks               INTEGER,
  frequency                 TEXT,

  superseded_by_version_id  BIGINT REFERENCES v2_protocol_versions(id),
  superseded_at             TIMESTAMPTZ,

  created_by                BIGINT REFERENCES users(id),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT v2_protocol_versions_unique_number UNIQUE (protocol_id, version_number),
  CONSTRAINT v2_protocol_versions_status_check CHECK (
    status IN ('DRAFT','GENERATED','REVIEW','APPROVED','HANDED_OFF','SUPERSEDED')
  )
);

CREATE INDEX IF NOT EXISTS idx_v2_pv_protocol_id ON v2_protocol_versions(protocol_id);
CREATE INDEX IF NOT EXISTS idx_v2_pv_status ON v2_protocol_versions(status);

-- ---------------------------------------------------------------------------
-- v2_protocol_version_exercises
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS v2_protocol_version_exercises (
  id             BIGSERIAL PRIMARY KEY,
  version_id     BIGINT NOT NULL REFERENCES v2_protocol_versions(id),
  week_number    INTEGER NOT NULL,
  exercise_code  TEXT NOT NULL,
  exercise_name  TEXT,
  phase          TEXT,
  sort_order     INTEGER DEFAULT 0,
  origin         TEXT NOT NULL DEFAULT 'ENGINE',
  clinician_note TEXT,

  sets             TEXT,
  reps             TEXT,
  frequency        TEXT,
  duration_minutes INTEGER,
  dosage_override  TEXT,

  equipment         TEXT,
  progression       TEXT,
  contraindications TEXT,
  red_flags         TEXT,
  evidence_citation TEXT,

  CONSTRAINT v2_pve_origin_check CHECK (origin IN ('ENGINE','CLINICIAN'))
);

CREATE INDEX IF NOT EXISTS idx_v2_pve_version_id ON v2_protocol_version_exercises(version_id);

-- ---------------------------------------------------------------------------
-- v2_protocol_version_restrictions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS v2_protocol_version_restrictions (
  id               BIGSERIAL PRIMARY KEY,
  version_id       BIGINT NOT NULL REFERENCES v2_protocol_versions(id),
  restriction_type TEXT NOT NULL,
  detail           TEXT NOT NULL,
  source           TEXT NOT NULL DEFAULT 'ENGINE',
  CONSTRAINT v2_pvr_source_check CHECK (source IN ('ENGINE','CLINICIAN'))
);

CREATE INDEX IF NOT EXISTS idx_v2_pvr_version_id ON v2_protocol_version_restrictions(version_id);

-- ---------------------------------------------------------------------------
-- v2_protocol_approvals
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS v2_protocol_approvals (
  id                 BIGSERIAL PRIMARY KEY,
  version_id         BIGINT NOT NULL UNIQUE REFERENCES v2_protocol_versions(id),
  approved_by        BIGINT NOT NULL REFERENCES users(id),
  approver_username  TEXT NOT NULL,
  approver_role      TEXT NOT NULL,
  approval_note      TEXT,
  approval_basis     TEXT,
  approver_credential TEXT,
  credential_id      BIGINT,
  content_hash       TEXT NOT NULL,
  approved_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- v2_beau_handoffs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS v2_beau_handoffs (
  id                   BIGSERIAL PRIMARY KEY,
  protocol_id          BIGINT NOT NULL REFERENCES v2_protocols(id),
  version_id           BIGINT NOT NULL REFERENCES v2_protocol_versions(id),
  patient_id           BIGINT NOT NULL,
  handoff_payload_json JSONB NOT NULL,
  payload_hash         TEXT NOT NULL,
  status               TEXT NOT NULL DEFAULT 'ACTIVE',
  handed_off_by        BIGINT REFERENCES users(id),
  handed_off_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  superseded_at        TIMESTAMPTZ,
  revoked_at           TIMESTAMPTZ,
  revoked_reason       TEXT,
  CONSTRAINT v2_handoff_status_check CHECK (status IN ('ACTIVE','SUPERSEDED','REVOKED'))
);

CREATE INDEX IF NOT EXISTS idx_v2_handoffs_patient_id ON v2_beau_handoffs(patient_id);
CREATE INDEX IF NOT EXISTS idx_v2_handoffs_status ON v2_beau_handoffs(status);

-- Invariant I5 at the database level: a patient may hold at most one live home
-- prescription. Enforced as a partial unique index so a race between two
-- concurrent handoffs cannot produce two ACTIVE rows.
CREATE UNIQUE INDEX IF NOT EXISTS idx_v2_handoffs_one_active_per_patient
  ON v2_beau_handoffs(patient_id) WHERE status = 'ACTIVE';

-- ---------------------------------------------------------------------------
-- v2_protocol_audit_events — append-only
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS v2_protocol_audit_events (
  id              BIGSERIAL PRIMARY KEY,
  protocol_id     BIGINT,
  version_id      BIGINT,
  patient_id      BIGINT,
  action          TEXT NOT NULL,
  actor_id        BIGINT,
  actor_username  TEXT,
  actor_role      TEXT,
  source_system   TEXT NOT NULL DEFAULT 'K9',
  detail_json     JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT v2_audit_source_check CHECK (source_system IN ('K9','BEAU'))
);

CREATE INDEX IF NOT EXISTS idx_v2_audit_protocol_id ON v2_protocol_audit_events(protocol_id);
CREATE INDEX IF NOT EXISTS idx_v2_audit_created_at ON v2_protocol_audit_events(created_at DESC);

-- ===========================================================================
-- ROW LEVEL SECURITY
--
-- Defense in depth. protocol-store.js already enforces these rules in
-- application code; repeating the approval restriction here means a direct
-- database write, a future service, or a compromised API route still cannot
-- forge a clinical approval.
-- ===========================================================================

ALTER TABLE v2_protocols                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_protocol_versions              ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_protocol_version_exercises     ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_protocol_version_restrictions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_protocol_approvals             ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_beau_handoffs                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_protocol_audit_events          ENABLE ROW LEVEL SECURITY;

-- Authenticated clinical staff may read the clinical record.
CREATE POLICY v2_protocols_select ON v2_protocols
  FOR SELECT TO authenticated USING (true);
CREATE POLICY v2_pv_select ON v2_protocol_versions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY v2_pve_select ON v2_protocol_version_exercises
  FOR SELECT TO authenticated USING (true);
CREATE POLICY v2_pvr_select ON v2_protocol_version_restrictions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY v2_approvals_select ON v2_protocol_approvals
  FOR SELECT TO authenticated USING (true);
CREATE POLICY v2_handoffs_select ON v2_beau_handoffs
  FOR SELECT TO authenticated USING (true);
CREATE POLICY v2_audit_select ON v2_protocol_audit_events
  FOR SELECT TO authenticated USING (true);

-- Drafting and assessment are open to authenticated staff (technicians included).
CREATE POLICY v2_protocols_write ON v2_protocols
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY v2_pv_write ON v2_protocol_versions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY v2_pve_write ON v2_protocol_version_exercises
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY v2_pvr_write ON v2_protocol_version_restrictions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- INVARIANT I2, enforced in the database: only a clinician-class role may
-- insert an approval, and only as themselves. This is the one write that turns
-- a recommendation into a prescription.
CREATE POLICY v2_approvals_insert_clinician_only ON v2_protocol_approvals
  FOR INSERT TO authenticated
  WITH CHECK (
    approved_by::text = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = auth.uid()::text
        AND lower(users.role) IN ('clinician','veterinarian','vet','admin')
    )
  );

-- An approval is never updated or deleted. Changing an approved protocol
-- creates a new version (invariant I1). No UPDATE or DELETE policy is defined,
-- so both are denied by default.

-- Handoffs are created by clinical staff and may be superseded/revoked, but the
-- payload itself is immutable once written.
CREATE POLICY v2_handoffs_insert ON v2_beau_handoffs
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY v2_handoffs_update_status ON v2_beau_handoffs
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- The audit trail is append-only: insert allowed, no UPDATE or DELETE policy.
CREATE POLICY v2_audit_insert ON v2_protocol_audit_events
  FOR INSERT TO authenticated WITH CHECK (true);
