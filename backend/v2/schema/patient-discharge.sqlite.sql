-- ===========================================================================
-- K9 Clinical Workflow V2 — Discharge / end of episode
-- SQLite schema
-- ===========================================================================
--
-- THE DEFECT THIS EXISTS FOR
-- --------------------------
-- Until 2026-09-26 nothing recorded that care had ended. The dashboard had a
-- DISCHARGE PATIENT button that PUT {status:"discharged"} to
-- PUT /api/patients/:id -- a route that does not destructure `status`, onto a
-- `patients` table that has no such column. The handler never checked the
-- response and set its success state unconditionally, so the screen said
-- "PATIENT DISCHARGED" and the claim survived exactly until a page reload.
--
-- `VISIT_TYPE.DISCHARGE` had existed since the visit store was written and
-- NOTHING had ever created one.
--
-- WHY THE REASON MATTERS MORE THAN THE FACT
-- -----------------------------------------
-- Sal, 2026-09-26: "in real life situation, a client may decide to stop after
-- 1 session 3,3 or even 4 sessions, because may be financial constraints or
-- has improved doing home exercises may be swants to continue with BEAU".
--
-- Those are clinically different endings. CLAUDE.md's Outcome Monitoring
-- section wants outcome data feeding the audit trail for protocol efficacy
-- tracking, and efficacy cannot be read from a record in which "improved and
-- went home" and "could not afford to continue" are the same row. One is a
-- success; the other is an interrupted course. Recording them identically
-- does not merely lose detail -- it makes the protocol look better or worse
-- than it was.
--
-- So `outcome` is COMPLETED or DISCONTINUED and the two are KEPT APART
-- (Sal's decision, 2026-09-26): completing the protocol is a clinical
-- endpoint, stopping early is an interruption, and a query for "how many
-- completed" must not be able to pick up a dog that stopped at week 2.
--
-- WHY A REASON CAN BE UNKNOWN AND THE RECORD STILL COMPLETE
-- ---------------------------------------------------------
-- Sal, 2026-09-26: "THEN WE CONTACT THE OWNER TO FIND OUT WHY?"
--
-- At the moment care stops the clinic frequently does not know why -- the
-- owner simply stopped booking. `reason_status` makes that a STATED position
-- rather than an empty field: PENDING_OWNER_CONTACT says we do not know yet
-- and we are asking. A blank and an unknown look identical on a screen and
-- mean completely different things in a record.
--
-- WHAT IS DERIVED AND NOT TYPED
-- -----------------------------
-- `handoff_id` points at a real `beau_handoffs` row. It is NOT a checkbox:
-- nobody can tick "handed off to B.E.A.U." for a handoff that never happened.
--
-- There is deliberately NO `patients.status` column. A discharged patient can
-- return, and a status flag would then be a stale lie sitting on the record.
-- Active vs discharged is DERIVED -- the latest discharge with no later visit.
-- One fact, one source, per the V3 rule in CLAUDE.md.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS patient_discharges (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id         INTEGER NOT NULL,

  -- The DISCHARGE visit this record belongs to. Care ending is a clinical
  -- event on a date with a clinician's name on it, which is what a visit is.
  visit_id           INTEGER NOT NULL,

  -- WHERE THIS HAPPENED. Sal, 2026-09-26: "WE SHOULD ALSO IDENTIFY WHICH
  -- CLINIC WE ARE IN SO IF WE DRIFT WE DONT HAVE TO HUNT LOCATION". Written
  -- at creation, never re-derived at read time -- resolving the clinic when
  -- the record is READ is how a record ends up reported against a clinic it
  -- did not happen in.
  clinic_id          INTEGER,

  -- COMPLETED | DISCONTINUED. Kept apart on purpose -- see the header.
  outcome            TEXT NOT NULL,

  -- From the controlled list in discharge-store.js. Controlled rather than
  -- free text so endings can be COUNTED; `reason_note` carries anything the
  -- list does not cover.
  reason             TEXT NOT NULL,
  reason_status      TEXT NOT NULL DEFAULT 'KNOWN',   -- KNOWN | PENDING_OWNER_CONTACT | OWNER_UNREACHABLE
  reason_note        TEXT,

  -- WHERE THEY GOT TO. Stopping at week 3 of 16 and stopping at week 14 of 16
  -- are not the same event, and "DISCONTINUED" alone cannot tell them apart.
  -- Nullable: a patient discharged before any protocol was generated has no
  -- position in one, and 0 would be a claim rather than an absence.
  week_reached       INTEGER,
  total_weeks        INTEGER,
  phase_reached      TEXT,

  -- Sal counted endings in SESSIONS -- "a client may decide to stop after 1
  -- session 3,3 or even 4 sessions" -- so the record counts them too. DERIVED
  -- from the completed visits on the patient at the moment of discharge, not
  -- typed: it is a fact the database already holds and a typed copy of a
  -- known fact is a second source of truth waiting to disagree.
  visits_attended    INTEGER,

  -- IMPROVED | UNCHANGED | WORSE | NOT_ASSESSED.
  -- `outcome_measured_by` names what that judgement was made against (HCPI,
  -- lameness grade, goniometric ROM, clinician observation...). The store
  -- refuses a stated outcome with no measure -- an unsourced clinical claim
  -- is exactly what the Anti-Hallucination Rules forbid.
  clinical_outcome     TEXT NOT NULL DEFAULT 'NOT_ASSESSED',
  outcome_measured_by  TEXT,

  -- The real handoff row, or NULL. Derived from the record, never typed.
  handoff_id         INTEGER,

  discharge_summary  TEXT,

  discharged_by      INTEGER,
  discharged_at      DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- Set when the reason is filled in after the owner is reached, so the
  -- record shows that the answer arrived later rather than pretending it was
  -- known on the day.
  reason_updated_at  DATETIME,
  reason_updated_by  INTEGER,

  CHECK (outcome IN ('COMPLETED', 'DISCONTINUED')),
  CHECK (reason_status IN ('KNOWN', 'PENDING_OWNER_CONTACT', 'OWNER_UNREACHABLE')),
  CHECK (clinical_outcome IN ('IMPROVED', 'UNCHANGED', 'WORSE', 'NOT_ASSESSED')),
  -- A completion's reason is known by definition; only a discontinuation can
  -- be waiting on an owner.
  CHECK (NOT (outcome = 'COMPLETED' AND reason_status <> 'KNOWN')),
  -- NOT_YET_KNOWN is the reason that goes WITH an unresolved reason_status,
  -- and it is not a legal answer once the status says KNOWN.
  CHECK ((reason = 'NOT_YET_KNOWN') = (reason_status <> 'KNOWN')),
  -- A stated clinical outcome must say what it was measured against.
  CHECK (clinical_outcome = 'NOT_ASSESSED' OR outcome_measured_by IS NOT NULL),

  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (visit_id) REFERENCES visits(id),
  FOREIGN KEY (clinic_id) REFERENCES clinics(id),
  FOREIGN KEY (handoff_id) REFERENCES beau_handoffs(id),
  FOREIGN KEY (discharged_by) REFERENCES users(id),
  FOREIGN KEY (reason_updated_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_discharges_patient ON patient_discharges(patient_id);
CREATE INDEX IF NOT EXISTS idx_discharges_clinic  ON patient_discharges(clinic_id);
CREATE INDEX IF NOT EXISTS idx_discharges_outcome ON patient_discharges(outcome, reason);
CREATE UNIQUE INDEX IF NOT EXISTS idx_discharges_visit ON patient_discharges(visit_id);
