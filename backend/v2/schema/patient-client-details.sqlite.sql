-- ===========================================================================
-- K9 Clinical Workflow V2 — Client Details
-- SQLite schema
-- ===========================================================================
--
-- V3. The client block's remaining home.
--
-- The block splits cleanly in two and this table is the second half:
--
--   `patients` columns  — the CLINICAL identity: name, species, breed, age,
--                         weight, sex, date of birth, and the contact fields
--                         that already lived there (client_name, client_email,
--                         client_phone, referring_vet). Already the source of
--                         truth; intake-proposal reads the columns and the
--                         blob only ever answered an EMPTY one, which across
--                         five patients it never did.
--
--   THIS TABLE          — the 13 fields that had no home anywhere: the
--                         address, the emergency contact, the microchip, the
--                         insurer, the other veterinarians, the markings.
--
-- WHY A SEPARATE TABLE AND NOT MORE COLUMNS ON `patients`
-- ------------------------------------------------------
-- Every field here is client PII with no clinical consumer and no engine use.
-- The HEP contract test asserts that none of it reaches B.E.A.U. — it searches
-- the serialized handoff for the patient's ACTUAL recorded values, not for
-- field names, because the risk is a number riding along inside prose.
--
-- Keeping this off the patient row makes that guarantee STRUCTURAL rather than
-- incidental: a payload built from a patient row cannot leak a microchip
-- number it never had. Columns on `patients` would rely on nobody ever
-- spreading the row into a response.
--
-- ADDRESS: STRUCTURED, WITH ONE HONEST EXCEPTION
-- ----------------------------------------------
-- Four of five records store the address as street/city/state/postcode. One
-- stores it as a single line — "1111 11th street Fort Lauderdale FL 33309" —
-- under a different key entirely.
--
-- That one migrates WHOLE into `street_address`, with
-- `address_is_unstructured` set. Splitting it would mean deciding where the
-- street ends and the city begins, which is a parse of somebody's address and
-- gets it wrong the first time a street is named after a city. A clinician
-- separates it; the flag is how they know to.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS patient_client_details (
  id                      INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id              INTEGER NOT NULL UNIQUE,

  -- Address
  street_address          TEXT,
  apt_suite_unit          TEXT,
  city                    TEXT,
  state_province          TEXT,
  postal_code             TEXT,
  country                 TEXT,
  -- Set when the whole address arrived as one line and has not been separated.
  address_is_unstructured INTEGER DEFAULT 0,

  -- People and cover
  emergency_contact       TEXT,
  insurance_provider      TEXT,
  primary_veterinarian    TEXT,
  specialist_surgeon      TEXT,

  -- The conditional free-text companions to the insurer dropdown and the
  -- markings multi-select. They are separate FACTS, not renames of those two:
  -- the panel shows them only when the dropdown is set to "Other — specify
  -- below". Columns so no field in this block is left writing to the blob.
  insurance_other         TEXT,
  markings_additional     TEXT,

  -- Identification
  microchip               TEXT,
  colour_markings         TEXT,

  updated_by              INTEGER,
  updated_at              DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at              DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_client_details_patient_id ON patient_client_details(patient_id);
