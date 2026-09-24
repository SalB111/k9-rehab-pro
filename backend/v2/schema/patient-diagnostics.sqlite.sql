-- ===========================================================================
-- K9 Clinical Workflow V2 — Patient Diagnostic Studies
-- SQLite schema
-- ===========================================================================
--
-- V3. This table is the source of truth for the diagnostics block.
-- `patients.dashboard_data` is no longer read for it.
--
-- WHY A STUDY IS A ROW AND NOT A CHECKBOX
-- ---------------------------------------
-- Both V1 shapes recorded whether a modality had EVER been performed, and gave
-- it a single findings box:
--
--   current  `Imaging Radiograph (X-Ray)` = "performed", one `Radiograph
--            Findings` field.
--   legacy   `Imaging` = "Radiograph (X-Ray)||CT Scan", same single field.
--
-- A rehabilitation patient is imaged more than once — before surgery, after
-- it, and at recheck — and the entire clinical value of the second study is
-- comparing it with the first. One box per modality cannot hold that, so the
-- second study gets appended to the first one's text and the two stop being
-- separable.
--
-- That is already the case in this database. Four fields describe more than
-- one study each:
--
--   Bella    radiograph findings  "at 4w", "post-op", "recheck"
--   Bella    lab results          "pre-op", "post-op", "day 7"
--   Winston  MRI findings         "post-op MRI at 8w showed appropriate
--                                  decompression"
--   Winston  lab results          "pre-op", "post-op", "day 5"
--
-- So a study is a ROW with a DATE. A repeat study is another row.
--
-- WHAT THE MIGRATION WILL NOT DO
-- ------------------------------
-- It does not split those texts. Deciding that "T13-L1 ... No myelomalacia.
-- Post-op MRI at 8w showed appropriate decompression" is two studies — and
-- which finding belongs to which — is a clinical reading, and a script making
-- it would be inventing records. Each field migrates as ONE study, verbatim,
-- flagged as describing more than one so a clinician can split it.
--
-- `performed_on` IS NULLABLE AND IS NEVER INFERRED
-- ------------------------------------------------
-- "at 8w" is a point in a recovery, not a date: it depends on a surgery date
-- this table does not own, and reading it as one would put a fabricated date
-- on a medical record. NULL means nobody has said when.
--
-- NOTHING HERE GATES EXERCISE SELECTION. The engine takes no diagnostic input
-- — its only two mentions of "radiograph" are progression-criteria prose and
-- THERAPEUTIC ultrasound, which is a treatment and not a diagnostic.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS patient_diagnostic_studies (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id    INTEGER NOT NULL,

  category      TEXT NOT NULL,   -- IMAGING | LAB

  -- IMAGING: the modality, e.g. "MRI". NULL for laboratory work.
  modality      TEXT,

  -- LAB: the panels run from one draw, joined by the V1 multi-select
  -- delimiter, e.g. "CBC||Chemistry Panel". One draw is one study, because
  -- that is how the results are reported and read.
  panels        TEXT,

  -- Never inferred from the findings text. See the header.
  performed_on  TEXT,

  findings      TEXT,

  -- Which V1 field this was migrated out of, or NULL for a study recorded in
  -- V3. Makes the migration idempotent so re-running cannot duplicate a
  -- patient's diagnostic history.
  source_field  TEXT,

  created_by    INTEGER,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_diag_studies_patient_id ON patient_diagnostic_studies(patient_id);
CREATE INDEX IF NOT EXISTS idx_diag_studies_date ON patient_diagnostic_studies(patient_id, performed_on);
CREATE UNIQUE INDEX IF NOT EXISTS idx_diag_studies_source
  ON patient_diagnostic_studies(patient_id, source_field)
  WHERE source_field IS NOT NULL;
