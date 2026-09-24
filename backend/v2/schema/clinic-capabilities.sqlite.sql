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

  -- The full equipment checklist, as the V1 dashboard presents it: 43 items in
  -- 5 categories, { "<item>": true | false | null }.
  --
  -- The ten columns above are the ENGINE'S PROJECTION of this, derived on every
  -- write in v2/clinic-equipment.js, so the two can never disagree. They stay
  -- as columns because the engine reads them and a column is cheaper and
  -- clearer to query than a blob.
  --
  -- WHY THIS COLUMN EXISTS. Equipment is a property of the practice, and both
  -- apps ask about it. V1's panel wrote through the patient form context, so it
  -- landed in `patients.dashboard_data` and EVERY PATIENT CARRIED A PRIVATE
  -- COPY of the clinic's equipment list — five patients, five partial answers,
  -- no reason to agree. V2 kept one row per clinic and the engine read that.
  -- Neither could see the other, so the fuller V1 checklist never reached the
  -- engine and the engine's answer never reached the V1 screen.
  --
  -- This is where the two records become one. Thirty-three of the items gate
  -- nothing — cavaletti rails, slings, a goniometer — but a practice needs to
  -- know what it owns, and recording them five times was never the way.
  equipment_json          TEXT,

  updated_by              INTEGER,
  updated_at              DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at              DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (clinic_id) REFERENCES clinics(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_cap_clinic_id ON clinic_capabilities(clinic_id);
