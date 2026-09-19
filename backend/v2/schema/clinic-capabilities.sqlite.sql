-- ===========================================================================
-- K9 Clinical Workflow V2 — Clinic Capabilities
-- SQLite schema
-- ===========================================================================
--
-- THE PROBLEM THIS SOLVES
-- -----------------------
-- The engine gates ten exercise groups on whether the facility owns the
-- equipment: aquaticAccess, modalityUWTM, modalityLaser, modalityTENS,
-- modalityNMES, modalityTherapeuticUS, modalityPulsedEMF, modalityShockwave,
-- modalityCryotherapy, modalityHeatTherapy.
--
-- Today those flags are collected PER PROTOCOL in the wizard
-- (Step5ProtocolParams / Step6Equipment) and default to `false` in
-- k9-rehab-frontend/src/pages/generator/constants.js. The `clinics` table has
-- no equipment columns at all.
--
-- Two consequences, both wrong:
--
--   1. A clinician re-declares the clinic's equipment on every single protocol.
--      Equipment is a property of the facility, not of a prescription.
--   2. These are ENABLEMENT gates, so a missed tick FAILS RESTRICTIVE — the
--      engine silently withholds therapy the clinic can actually deliver, with
--      no warning and no error. Defaulting to `false` makes forgetting the
--      quiet outcome.
--
-- Storing capability on the clinic makes the answer persistent, auditable, and
-- correctable in one place.
--
-- TRI-STATE, DELIBERATELY
-- -----------------------
-- Each column is 1 (available), 0 (explicitly not available) or NULL (never
-- stated). The engine withholds the exercise for both 0 and NULL, but only NULL
-- is a data gap worth prompting a clinician about. Collapsing them to a boolean
-- would erase the difference between "we don't have a laser" and "nobody has
-- ever filled this in".
--
-- CLINIC LINKAGE GAP
-- ------------------
-- K9 has no clinic linkage today: neither `patients` nor `users` carries a
-- clinic_id. This table is keyed by clinic_id so it is correct once linkage
-- exists, and the V2 router resolves the clinic through an injected resolver
-- that falls back to the single configured clinic. That fallback is a stopgap
-- for a single-practice deployment, not a model of multi-site practice.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS clinic_capabilities (
  id                      INTEGER PRIMARY KEY AUTOINCREMENT,
  clinic_id               INTEGER NOT NULL UNIQUE,

  -- Aquatic
  aquatic_access          INTEGER,
  modality_uwtm           INTEGER,

  -- Electrophysical and thermal modalities
  modality_laser          INTEGER,
  modality_tens           INTEGER,
  modality_nmes           INTEGER,
  modality_therapeutic_us INTEGER,
  modality_pulsed_emf     INTEGER,
  modality_shockwave      INTEGER,
  modality_cryotherapy    INTEGER,
  modality_heat_therapy   INTEGER,

  updated_by              INTEGER,
  updated_at              DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at              DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (clinic_id) REFERENCES clinics(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_cap_clinic_id ON clinic_capabilities(clinic_id);
