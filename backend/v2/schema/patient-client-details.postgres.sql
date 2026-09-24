-- ===========================================================================
-- K9 Clinical Workflow V2 — Client Details
-- PostgreSQL / Supabase mirror of patient-client-details.sqlite.sql
-- ===========================================================================
--
-- Columns must match the SQLite file exactly; schema-parity.test.js fails if
-- they drift. See the SQLite mirror for why this is a separate table from
-- `patients` (client PII, kept off the patient row so the handoff cannot leak
-- it) and why one address migrates whole rather than being parsed.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS v2_patient_client_details (
  id                      BIGSERIAL PRIMARY KEY,
  patient_id              BIGINT NOT NULL UNIQUE,

  street_address          TEXT,
  apt_suite_unit          TEXT,
  city                    TEXT,
  state_province          TEXT,
  postal_code             TEXT,
  country                 TEXT,
  address_is_unstructured INTEGER DEFAULT 0,

  emergency_contact       TEXT,
  insurance_provider      TEXT,
  primary_veterinarian    TEXT,
  specialist_surgeon      TEXT,

  insurance_other         TEXT,
  markings_additional     TEXT,

  microchip               TEXT,
  colour_markings         TEXT,

  updated_by              BIGINT REFERENCES users(id),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_details_patient_id ON v2_patient_client_details(patient_id);
