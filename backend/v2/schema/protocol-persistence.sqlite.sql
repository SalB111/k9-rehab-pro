-- ===========================================================================
-- K9 Clinical Workflow V2 — Protocol Persistence
-- SQLite schema
-- ===========================================================================
--
-- Closes FINDING 4 of docs/STEP-13-ENGINE-CONTRACT-RECONCILIATION.md:
-- POST /api/generate-protocol is pure compute, the Supabase `protocols` table
-- stores one unversioned JSON blob, and the SQLite provider has no protocols
-- table at all. There is no backing store for
--   Protocol -> Version -> Exercises -> Approval -> Supersession -> Handoff.
--
-- WHY NEW TABLES RATHER THAN EXTENDING THE EXISTING ONES
-- ------------------------------------------------------
-- `protocol_exercises`, `exercise_logs` and `progress_assessments` already
-- exist in the SQLite provider keyed on a bare `protocol_id TEXT`, with no
-- parent row and no version. Repo-wide search found ZERO live callers for any
-- of them (same orphan class as ProgressDB, Finding 5). They are left in place,
-- untouched and undeleted, per the build rule. V2 writes to its own versioned
-- tables so an approved clinical decision can never be silently mutated by a
-- legacy write path.
--
-- CONVENTIONS follow the existing provider: INTEGER PRIMARY KEY AUTOINCREMENT,
-- DATETIME DEFAULT CURRENT_TIMESTAMP, explicit FOREIGN KEY clauses.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- protocols — the longitudinal container for one patient's rehabilitation
-- plan. Versions hang off this. There is exactly one protocol row per
-- treatment course; re-assessment produces a new VERSION, not a new protocol.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS protocols (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id          INTEGER NOT NULL,
  -- Denormalized for audit legibility: a protocol record must remain readable
  -- even if the patient row is later renamed. Clinical records are evidentiary.
  patient_name        TEXT,
  current_version_id  INTEGER,
  status              TEXT NOT NULL DEFAULT 'DRAFT',
  created_by          INTEGER,
  created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_protocols_patient_id ON protocols(patient_id);

-- ---------------------------------------------------------------------------
-- protocol_versions — an immutable-once-approved snapshot of a clinical
-- decision.
--
-- Carries full provenance: the exact engine input that produced it, which
-- safety gates fired, and what the engine warned about. Without this a past
-- approval cannot be explained, only re-guessed.
--
-- status: DRAFT | GENERATED | REVIEW | APPROVED | HANDED_OFF | SUPERSEDED
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS protocol_versions (
  id                        INTEGER PRIMARY KEY AUTOINCREMENT,
  protocol_id               INTEGER NOT NULL,
  version_number            INTEGER NOT NULL,
  status                    TEXT NOT NULL DEFAULT 'DRAFT',

  -- Provenance — the 36-field engine input contract, verbatim.
  engine_input_json         TEXT NOT NULL,
  -- Which of the five severity flags validateIntake actually set. This is the
  -- record of WHICH SAFETY GATES FIRED, and is what makes an approval auditable.
  derived_flags_json        TEXT NOT NULL,
  engine_warnings_json      TEXT,

  -- Engine output summary
  protocol_type             TEXT,
  total_weeks               INTEGER,
  frequency                 TEXT,

  -- Supersession chain
  superseded_by_version_id  INTEGER,
  superseded_at             DATETIME,

  created_by                INTEGER,
  created_at                DATETIME DEFAULT CURRENT_TIMESTAMP,

  UNIQUE (protocol_id, version_number),
  FOREIGN KEY (protocol_id) REFERENCES protocols(id),
  FOREIGN KEY (superseded_by_version_id) REFERENCES protocol_versions(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_protocol_versions_protocol_id ON protocol_versions(protocol_id);
CREATE INDEX IF NOT EXISTS idx_protocol_versions_status ON protocol_versions(status);

-- ---------------------------------------------------------------------------
-- protocol_version_exercises — the prescribed exercises of ONE version.
--
-- `origin` records whether the engine proposed the exercise or the clinician
-- added it by hand. A clinician-added exercise has not passed the engine's
-- safety gates, so downstream review and B.E.A.U. must be able to tell the
-- difference.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS protocol_version_exercises (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  version_id     INTEGER NOT NULL,
  week_number    INTEGER NOT NULL,
  exercise_code  TEXT NOT NULL,
  exercise_name  TEXT,
  phase          TEXT,
  sort_order     INTEGER DEFAULT 0,
  origin         TEXT NOT NULL DEFAULT 'ENGINE',   -- ENGINE | CLINICIAN
  clinician_note TEXT,

  -- Dosage, mirroring the engine exercise object field for field. The engine
  -- has no single `dosage` string: sets, reps, frequency and duration are
  -- separate, and exercise frequency ("2-3x/day") is NOT the protocol
  -- frequency ("2x/week"). Collapsing them loses the prescription.
  sets             TEXT,
  reps             TEXT,
  frequency        TEXT,
  duration_minutes INTEGER,
  -- Clinician-specified dosage. When present it overrides the engine values
  -- above; the engine values are retained so the change stays visible.
  dosage_override  TEXT,

  -- Home-execution payload. B.E.A.U. cannot do its job without these:
  -- `equipment` is what household substitution is computed against, and
  -- `red_flags` is what makes an unsupervised home session safe to stop.
  equipment         TEXT,
  progression       TEXT,
  contraindications TEXT,
  red_flags         TEXT,
  evidence_citation TEXT,

  -- Where this exercise may be performed, and the shortlist decision.
  -- A Class IV laser or NMES cannot go home whatever the clinic owns, so venue
  -- is stored per exercise rather than inferred at handoff time.
  venue             TEXT DEFAULT 'HOME',      -- CLINIC | HOME
  venue_reason      TEXT,
  home_rank         INTEGER,
  home_selected     INTEGER DEFAULT 0,
  selection_reason  TEXT,

  FOREIGN KEY (version_id) REFERENCES protocol_versions(id)
);

CREATE INDEX IF NOT EXISTS idx_pve_version_id ON protocol_version_exercises(version_id);

-- ---------------------------------------------------------------------------
-- protocol_version_restrictions — restrictions, contraindications and warnings
-- attached to a version. Separated from exercises because a restriction can
-- outlive any particular exercise selection and must travel to B.E.A.U. intact.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS protocol_version_restrictions (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  version_id       INTEGER NOT NULL,
  restriction_type TEXT NOT NULL,   -- CONTRAINDICATION | WARNING | SAFETY_INSTRUCTION | ACTIVITY_LIMIT
  detail           TEXT NOT NULL,
  source           TEXT NOT NULL DEFAULT 'ENGINE',  -- ENGINE | CLINICIAN
  FOREIGN KEY (version_id) REFERENCES protocol_versions(id)
);

CREATE INDEX IF NOT EXISTS idx_pvr_version_id ON protocol_version_restrictions(version_id);

-- ---------------------------------------------------------------------------
-- protocol_approvals — the clinical decision record.
--
-- One approval per version, enforced by UNIQUE(version_id). Re-approving is
-- not an update; changing an approved protocol creates a NEW version.
--
-- content_hash is a SHA-256 over the canonical content of the version at the
-- moment of approval (exercises + restrictions + dosage + engine input). It is
-- the tamper check: if the stored content ever stops hashing to this value,
-- the approval no longer describes what is in the database and must be treated
-- as invalid rather than trusted. A clinician's signature has to be attached to
-- specific content, not to a mutable row.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS protocol_approvals (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  version_id         INTEGER NOT NULL UNIQUE,
  approved_by        INTEGER NOT NULL,
  approver_username  TEXT NOT NULL,
  approver_role      TEXT NOT NULL,
  approval_note      TEXT,
  approval_basis     TEXT,
  approver_credential TEXT,
  credential_id      INTEGER,
  content_hash       TEXT NOT NULL,
  approved_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (version_id) REFERENCES protocol_versions(id),
  FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- ---------------------------------------------------------------------------
-- beau_handoffs — the controlled K9 -> B.E.A.U. boundary.
--
-- Only an APPROVED version may be handed off. The payload is frozen at handoff
-- time so B.E.A.U. holds the exact approved prescription; it is never
-- recomputed from live tables, because a later K9 edit must not retroactively
-- change what a home user was told to do.
--
-- status: ACTIVE | SUPERSEDED | REVOKED
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS beau_handoffs (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  protocol_id          INTEGER NOT NULL,
  version_id           INTEGER NOT NULL,
  patient_id           INTEGER NOT NULL,
  handoff_payload_json TEXT NOT NULL,
  payload_hash         TEXT NOT NULL,
  status               TEXT NOT NULL DEFAULT 'ACTIVE',
  handed_off_by        INTEGER,
  handed_off_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  superseded_at        DATETIME,
  revoked_at           DATETIME,
  revoked_reason       TEXT,
  FOREIGN KEY (protocol_id) REFERENCES protocols(id),
  FOREIGN KEY (version_id) REFERENCES protocol_versions(id),
  FOREIGN KEY (handed_off_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_beau_handoffs_patient_id ON beau_handoffs(patient_id);
CREATE INDEX IF NOT EXISTS idx_beau_handoffs_status ON beau_handoffs(status);

-- ---------------------------------------------------------------------------
-- protocol_audit_events — append-only clinical audit trail.
--
-- Mirrors the existing safety_events table's actor columns so the two read
-- consistently. Never updated, never deleted.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS protocol_audit_events (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  protocol_id     INTEGER,
  version_id      INTEGER,
  patient_id      INTEGER,
  action          TEXT NOT NULL,
  actor_id        INTEGER,
  actor_username  TEXT,
  actor_role      TEXT,
  source_system   TEXT NOT NULL DEFAULT 'K9',   -- K9 | BEAU
  detail_json     TEXT,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pae_protocol_id ON protocol_audit_events(protocol_id);
CREATE INDEX IF NOT EXISTS idx_pae_created_at ON protocol_audit_events(created_at DESC);
