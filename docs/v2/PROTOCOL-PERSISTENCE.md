# PROTOCOL PERSISTENCE LAYER

Date: 2026-09-18
Closes: FINDING 4 of `STEP-13-ENGINE-CONTRACT-RECONCILIATION.md`
Status: Built and tested. Not yet wired to API routes.

---

## WHAT WAS MISSING

`POST /api/generate-protocol` was pure compute — it validated, generated, returned JSON, and wrote
nothing. Supabase stored protocols as a single unversioned `protocol_data` blob. SQLite had no
protocols table at all, so behaviour differed by `DB_PROVIDER`. `GET /api/patients/:id/protocols`
returned a hardcoded empty array with a comment admitting there was no table to read.

There was no protocol id, no version, no approval, no supersession, no audit record. A clinical
decision could not be recorded, explained, superseded, or proven.

---

## WHAT EXISTS NOW

Seven tables, defined identically in both providers and verified column-for-column:

| Table | Holds |
|---|---|
| `protocols` | The longitudinal container for one patient's treatment course |
| `protocol_versions` | An immutable-once-approved clinical decision, with full engine provenance |
| `protocol_version_exercises` | The prescribed exercises, mirroring the engine field for field |
| `protocol_version_restrictions` | Contraindications, warnings, safety instructions |
| `protocol_approvals` | The clinical decision record, SHA-256 bound to its content |
| `beau_handoffs` | The controlled K9 → B.E.A.U. boundary, payload frozen at handoff |
| `protocol_audit_events` | Append-only audit trail |

- `backend/schema/protocol-persistence.sqlite.sql`
- `backend/schema/protocol-persistence.postgres.sql` — Supabase migration, with RLS
- `backend/protocol-store.js` — the repository and its invariants
- `backend/sqlite-adapter.js` — promise wrapper matching the existing provider shape
- `contracts/approved-hep.schema.json` — the published K9 → B.E.A.U. contract

Postgres tables are prefixed `v2_` so the live Supabase `protocols` blob table keeps working
untouched until its callers are retired.

---

## THE SIX INVARIANTS

These are the point of the layer. Each is enforced in `protocol-store.js` and covered by tests that
were confirmed to fail when the invariant is deliberately broken.

**I1 — An APPROVED version is immutable.**
Adding, removing or editing anything on an approved version throws. Changing an approved protocol
goes through `reviseApprovedVersion()`, which clones it into a new DRAFT. The approved version
remains intact as historical record.

**I2 — Only an authorized clinician may approve.**
`APPROVAL_ROLES = clinician | veterinarian | vet | admin`. A technician may record measurements and
prepare a draft; they may not authorize treatment. An owner never can. Rejected attempts are
themselves audited.

*Note:* K9 has no role enforcement anywhere today — no `requireRole` middleware exists and
`users.role` defaults to `'user'`. The check therefore lives at the point of decision, and is
repeated as a Postgres RLS policy so a direct database write cannot forge an approval.

**I3 — Only an APPROVED version reaches B.E.A.U.**
Handing off a DRAFT, GENERATED or REVIEW version is refused.

**I4 — An approval is bound to specific content.**
Approval records a SHA-256 over the canonical content of the version. `verifyApprovalIntegrity()`
re-hashes and compares; a mismatch means the database no longer holds what the clinician signed.
Handoff runs this check and refuses on failure, so out-of-band edits — a direct SQL write, a legacy
code path, a bad migration — cannot reach a home user under cover of an old approval.

**I5 — A new approval supersedes the old prescription.**
Approving a new version marks the previous one SUPERSEDED, links the chain via
`superseded_by_version_id`, and revokes its ACTIVE B.E.A.U. handoff. A patient never holds two live
prescriptions. Postgres additionally enforces this with a partial unique index, so a race between
concurrent handoffs cannot produce two ACTIVE rows.

**I6 — Every transition is audited.**
Actor id, username, role, timestamp, source system (`K9` or `BEAU`), and a JSON detail blob. The
table is append-only: no UPDATE or DELETE policy is defined in Postgres, so both are denied.

---

## STATE MACHINE

```
DRAFT ──► GENERATED ──► REVIEW ──► APPROVED ──► HANDED_OFF
  │            │           │           │             │
  └────────────┴───────────┴───────────┴─────────────┴──► SUPERSEDED
```

Transitions not in this diagram are rejected with `ILLEGAL_TRANSITION`. Notably a version cannot go
straight from GENERATED to APPROVED — it must pass through REVIEW, so approval is always a
deliberate act rather than a side effect of generation.

---

## PROVENANCE

Each version stores the exact 36-field engine input, the derived safety flags that fired, and the
engine's warnings. This is what makes an approval explainable later: not just *what* was prescribed,
but *which safety gates were active* and *what the engine was told about the patient*.

Without it, a protocol approved two years ago can only be re-guessed.

---

## EXERCISE FIELDS

`protocol_version_exercises` mirrors the engine's exercise object rather than collapsing it:

- Dosage: `sets`, `reps`, `frequency`, `duration_minutes` — kept separate because an exercise's own
  frequency (`2-3x/day`) is not the protocol frequency (`2x/week`).
- `dosage_override` — clinician-specified dosing. Takes precedence, without erasing the engine's
  values, so the change stays visible.
- Home execution: `equipment`, `progression`, `contraindications`, `red_flags`,
  `evidence_citation`. B.E.A.U. needs `equipment` to compute household substitutions and `red_flags`
  to give an owner a stop condition.
- `origin` — `ENGINE` or `CLINICIAN`. A clinician-added exercise did not pass the engine's safety
  gates; downstream review and B.E.A.U. must be able to see that rather than have it hidden.

---

## THE APPROVED HEP CONTRACT

`contracts/approved-hep.schema.json` is what B.E.A.U. codes against. `tests/hep-contract.test.js`
validates a real handoff payload against it, so the contract cannot drift from the implementation.

Every payload carries `beau_permissions` explicitly, so the authority boundary is transmitted rather
than assumed:

```
may_adapt_execution_to_home_environment   true
may_substitute_household_equipment        true
may_record_adherence_and_observations     true

may_modify_prescription                   false
may_change_dosage                         false
may_change_frequency                      false
may_add_or_remove_exercises               false
may_override_restrictions                 false
```

It also carries `active_safety_gates` — which K9 gates fired. B.E.A.U. must not re-derive these
(clinical reasoning stays in K9) but needs them to refuse unsafe substitutions: with `_severeOA`
active, no household substitution may reintroduce impact loading.

---

## TESTS

```bash
node tests/run-all.js
```

| Suite | Tests | Covers |
|---|---|---|
| `engine-adapter.test.js` | 21 | Engine input contract, call order, safety gates |
| `protocol-store.test.js` | 35 | All six invariants, state machine, lifecycle, audit |
| `hep-contract.test.js` | 5 | Handoff payload conforms to the published contract |

All run against the real production K9 engine and a real in-memory SQLite database. Nothing in
production is written to.

The invariant tests were mutation-verified: allowing technicians to approve, disabling the integrity
check, and removing supersession each caused exactly the expected tests to fail, and only those.

---

## NOT DONE YET

1. **API routes.** The store is not wired to Express. Needs `/api/v2/protocols/:id/approve`,
   `/handoff`, `/versions`, mapping `ProtocolStoreError.code` to HTTP status
   (`FORBIDDEN` → 403, `IMMUTABLE`/`ILLEGAL_TRANSITION` → 409, `NOT_FOUND` → 404,
   `INTEGRITY` → 409, `INVALID` → 400).
2. **`requireRole` middleware.** The store enforces I2, but the route layer should reject
   unauthorized approvals before they reach it.
3. **Role seeding.** `users.role` defaults to `'user'`, so no existing account can approve anything
   until real clinician roles are assigned. This needs a deliberate decision about who holds
   approval authority, not a migration default.
4. **B.E.A.U.-side consumption** of the approved HEP, and the observation feedback path
   (`source_system = 'BEAU'` is already modelled in the audit table).
