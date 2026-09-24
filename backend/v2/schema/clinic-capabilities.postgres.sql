-- ===========================================================================
-- K9 Clinical Workflow V2 - Clinic Capabilities
-- Postgres / Supabase migration
-- ===========================================================================
--
-- Mirror of clinic-capabilities.sqlite.sql. Equipment is a property of the
-- facility, not of each prescription. These are ENABLEMENT gates: an unstated
-- capability silently WITHHOLDS therapy, so the tri-state (available / not
-- available / never stated) is preserved rather than collapsed to a boolean.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS v2_clinic_capabilities (
  id                      BIGSERIAL PRIMARY KEY,
  clinic_id               BIGINT NOT NULL UNIQUE,

  aquatic_access          INTEGER,
  modality_uwtm           INTEGER,

  modality_laser          INTEGER,
  modality_tens           INTEGER,
  modality_nmes           INTEGER,
  modality_therapeutic_us INTEGER,
  modality_pulsed_emf     INTEGER,
  modality_shockwave      INTEGER,
  modality_cryotherapy    INTEGER,
  modality_heat_therapy   INTEGER,

  -- The full 43-item equipment checklist. The ten columns above are the
  -- engine's projection of it, derived on every write so they cannot disagree.
  -- See the sqlite mirror of this file for why it exists.
  equipment_json          TEXT,

  updated_by              BIGINT REFERENCES users(id),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_v2_cap_clinic_id ON v2_clinic_capabilities(clinic_id);

ALTER TABLE v2_clinic_capabilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY v2_cap_select ON v2_clinic_capabilities
  FOR SELECT TO authenticated USING (true);

CREATE POLICY v2_cap_write ON v2_clinic_capabilities
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = auth.uid()::text
        AND lower(users.role) IN ('admin','veterinarian','vet')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = auth.uid()::text
        AND lower(users.role) IN ('admin','veterinarian','vet')
    )
  );
