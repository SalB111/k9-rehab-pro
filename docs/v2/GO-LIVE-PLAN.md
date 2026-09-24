# GO-LIVE PLAN — K9 CLINICAL WORKFLOW V2

Date: 2026-09-18
Status: Steps 1–2 built. Step 3 is the next build.

---

## THE CLINICAL WORKFLOW WE ARE BUILDING TOWARD

```
SELECT PATIENT
  -> CLINICAL SNAPSHOT        (what is true now, what changed since last time)
  -> TODAY'S VISIT            (assessment + measurements)
  -> K9 RECOMMENDATION        (existing engine, all safety gates intact)
  -> CLINICIAN REVIEW
  -> APPROVAL                 (versioned, signed, immutable)
  -> APPROVED HEP
  -> B.E.A.U. HOME            (execution only — never prescription)
  -> ADHERENCE / OBSERVATIONS
  -> NEXT VISIT
```

Every arrow in that chain now has a backing store except the last two.

---

## WHAT IS BUILT

### Step 1 — Engine adapter *(done)*
`backend/engine-adapter.js`. Carries all 36 engine inputs, enforces the
validate-then-generate call order that the safety gates depend on. 21 tests.
See `STEP-13-ENGINE-CONTRACT-RECONCILIATION.md`.

### Step 2a — Protocol persistence *(done)*
`backend/protocol-store.js` + 7 tables. Protocol → version → approval →
supersession → handoff, with six enforced invariants. 35 tests.
See `PROTOCOL-PERSISTENCE.md`.

### Step 2b — Longitudinal clinical record *(done)*
`backend/visit-store.js` + 4 tables. This is what makes it a rehabilitation
workflow rather than a one-shot generator.

**The gap it closes:** `PATCH /api/patients/:id/measures` writes ROM, HCPI, CBPI
and LOAD directly onto the `patients` row. Every measurement overwrites the
previous one. No history survives anywhere in K9 today, which means no change
since last visit, no ROM trend, and nothing for a clinical snapshot to draw on.

What now exists:

- **`visits`** — the clinical encounter. Every protocol version links back to the
  visit that produced it, so an approved protocol can be explained by the
  assessment that justified it.
- **`visit_assessments`** — today's structured clinical state, typed to mirror the
  engine's visit-level inputs one for one. A missing gate input shows as a NULL
  column rather than hiding inside a JSON blob.
- **`visit_measurements`** — append-only. Keyed by `measure_key` + `site` + `side`,
  so the operated and contralateral stifle are two trends and can be compared,
  which is how symmetry is judged. A correction inserts a new row pointing at the
  one it supersedes; nothing is ever destroyed.
- **`buildClinicalSnapshot()`** — what a clinician sees on opening a patient:
  current state, change since the previous visit, measurement trends, the live
  prescription, and which safety gates were in force when it was approved.

The snapshot computes arithmetic deltas and states direction for the measure
(more ROM is improving; more pain is not). It renders **no clinical verdict** —
`overall_change` is stated by the clinician and never inferred from the numbers.

91 tests across 5 suites, including a full three-visit course of treatment:
initial post-op → improvement and progression → flare at week 6 with the
high-pain gate re-firing and the plan regressed to comfort care, with each
version superseding the last and only one HEP ever live at home.

```bash
node tests/run-all.js
```

---

## WHAT REMAINS

### Step 3 — Wire it into the running backend *(next)*

Additive only. Existing routes keep working untouched.

- `requireRole` middleware — K9 has **no role enforcement anywhere** today.
- `/api/v2` router:
  - `GET  /api/v2/patients/:id/snapshot`
  - `POST /api/v2/patients/:id/visits`
  - `POST /api/v2/visits/:id/assessment`
  - `POST /api/v2/visits/:id/measurements`
  - `POST /api/v2/visits/:id/recommendation`
  - `GET  /api/v2/protocols/:id/versions`
  - `POST /api/v2/protocols/:id/approve`      *(clinician only)*
  - `POST /api/v2/protocols/:id/handoff`      *(clinician only)*
  - `GET  /api/v2/beau/handoffs/:patientId`
- Schema bootstrap on boot via `schema.applyAll(db)`.
- Error mapping: `FORBIDDEN` → 403, `IMMUTABLE`/`ILLEGAL_TRANSITION`/`INTEGRITY` → 409,
  `NOT_FOUND` → 404, `NOT_APPROVED` → 409, `INVALID` → 400.

### Step 4 — V2 clinician UI

Replaces the 7-step wizard for existing patients. The wizard is retained for new
patient registration only.

```
Select patient -> Snapshot -> Today's update -> Recommendation -> Review -> Approve
```

Underlying detail stays reachable through progressive disclosure. The objective
is workflow reduction, not knowledge reduction.

### Step 5 — B.E.A.U. consumption

Consume the approved HEP, adapt execution to the home environment, return
adherence and observations. `source_system = 'BEAU'` is already modelled in the
audit table.

### Step 6 — Deploy

Backend `render.yaml` and frontend `vercel.json` already exist. Run the Postgres
migrations, seed roles, then deploy behind a feature flag so the founding clinics
can opt in per patient.

---

## CLINICAL AUTHORITY — DECIDED AND BUILT

**Decision (2026-09-18):** approval authority rests with the attending veterinarian
**or** a credentialed rehabilitation practitioner.

Those are two different bases for the same authority, and the record states which
was used. "Approved by role = clinician" does not survive audit; "approved by Jane
Doe, CCRP #12345, valid at the time of approval" does.

| Basis | Who | Requirement |
|---|---|---|
| `LICENSURE` | veterinarian / vet / dvm | The licence itself. No separate credential record needed. |
| `CREDENTIAL` | rehab_practitioner / ccrp / ccrt | A **current** CCRP/CCRT/CCRV on file. |
| `ADMINISTRATIVE` | admin | Break-glass. Deliberately distinguishable from a clinical approval. |

Technicians and owners cannot approve on any basis. They record measurements and
prepare drafts.

### `clinician` is no longer an approving role — deliberately

The previous role list included `clinician`, which cannot say whether the approver
was a veterinarian or a rehab practitioner. That is exactly the distinction the
record now has to make, so the ambiguous role was removed rather than mapped to
one side. No production data was affected: `users.role` defaults to `'user'` and
no account had approval authority before this.

### Credentials live in their own table

`clinician_credentials` — credential, licence number, issuing body, valid_from,
valid_until, status. The production `users` table is not altered.

This is not bookkeeping. **A lapsed CCRP cannot approve treatment.** Validity is
evaluated at the moment of approval, and the approval stores the credential it
relied on — so a certificate lapsing later does **not** retroactively void an
approval that was legitimate when made. Both directions are covered by tests, and
both were verified to fail when the check is removed.

Under Postgres RLS, only an admin may write credentials: a practitioner must not
be able to grant themselves approval authority by inserting their own CCRP row.

### Still outstanding for go-live

Real credentials must be entered for the founding-clinic staff before anyone can
approve. That is data entry with a verification step, not a migration default —
someone has to check the certificates.

---

## SAFETY PROPERTIES THAT MUST SURVIVE TO PRODUCTION

Each is currently held by a test that has been verified to fail when the property
is deliberately broken.

| Property | Guarded by |
|---|---|
| All 36 engine inputs reach the engine | `engine-adapter.test.js` |
| Severity flags reach exercise exclusion | `engine-adapter.test.js` |
| Approved protocols are immutable | `protocol-store.test.js` |
| Only a vet or credentialed practitioner approves | `protocol-store.test.js` |
| A lapsed or revoked credential cannot approve | `protocol-store.test.js` |
| A later expiry does not void a past approval | `protocol-store.test.js` |
| Only approved protocols reach B.E.A.U. | `protocol-store.test.js` |
| Approvals are content-bound | `protocol-store.test.js` |
| One live prescription per patient | `protocol-store.test.js` |
| Measurements are never overwritten | `visit-store.test.js` |
| Completed visits are not rewritten | `visit-store.test.js` |
| Handoff matches the published contract | `hep-contract.test.js` |
| Both providers stay identical | `schema-parity.test.js` |

Treat a failure in any of these as a release blocker.
