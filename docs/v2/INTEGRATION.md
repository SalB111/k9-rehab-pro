# INTEGRATING V2 INTO THE RUNNING K9 BACKEND

Date: 2026-09-18
Status: Built and verified (123 tests). **Not yet applied to the production repo.**

---

## THE DEPLOYMENT FACT THAT DECIDES THIS

`render.yaml` deploys a single service from the **k9-rehab-pro repo**:

```yaml
buildCommand: cd backend && npm install
startCommand: cd backend && node server.js
```

Nothing outside that repo is deployed. V2 currently lives at
`D:\BEAU-K9-INTEGRATION\10-BUILD\K9-CLINICAL-WORKFLOW-V2`, which Render never
sees. A cross-drive `require('D:/...')` works on a dev machine and fails in
production.

**So going live requires V2 source to move into `k9-rehab-pro/backend/`.** That
is the moment V2 stops being a sandbox, which is why it is a deliberate step and
not something to slip in.

---

## STEP 1 — Copy V2 into the backend

```
k9-rehab-pro/backend/v2/
  ├── authority.js
  ├── clinic-store.js
  ├── engine-adapter.js
  ├── http-errors.js
  ├── mount-v2.js
  ├── protocol-store.js
  ├── schema.js
  ├── sqlite-adapter.js
  ├── visit-store.js
  ├── contracts/          (k9-engine-input-contract.json, approved-hep.schema.json)
  ├── middleware/require-role.js
  ├── routes/v2-router.js
  └── schema/*.sql
```

Two path references need updating after the move:

- `engine-adapter.js` → `CONTRACT_PATH` (`../contracts` stays correct if
  `contracts/` moves with it)
- `mount-v2.js` → `require('../contracts/k9-engine-input-contract.json')`

The test suite stays in the integration workspace and points at the moved code
via `K9_BACKEND`, so it keeps running against production source.

---

## STEP 2 — Two lines in `server.js`

`server.js` currently has uncommitted changes. Apply this on top of them, near
the other route registrations:

```js
// ── K9 Clinical Workflow V2 ────────────────────────────────────────────────
// Additive: new /api/v2 surface. No existing route, table or middleware changes.
const { mountV2 } = require("./v2/mount-v2");
const { ALL_EXERCISES: V2_EXERCISES } = require("./all-exercises");
const v2Engine = require("./protocol-generator");

mountV2(app, {
  db,                       // the promise-returning provider already in scope
  engine: v2Engine,
  allExercises: V2_EXERCISES,
  requireAuth,
}).catch((err) => {
  console.error("[v2] failed to mount:", err.message);
  process.exit(1);          // a clinical workflow that half-mounted is worse than one that did not
});
```

`mountV2` applies the schema (idempotent), verifies the clinic capability map
still covers every engine enablement gate, mounts `/api/v2`, and installs an
error handler scoped to `/api/v2`.

**Check `db` first.** `mountV2` needs promise-returning `run/get/all`. The SQLite
provider exposes exactly that. If `server.js` holds a different handle, wrap it
with `v2/sqlite-adapter.js`.

---

## STEP 3 — Postgres, if DB_PROVIDER=supabase

`backend/.env` currently sets `DB_PROVIDER=sqlite`, so the SQLite schema is what
boots. For Supabase, run the four `*.postgres.sql` files in this order:

1. `protocol-persistence.postgres.sql`
2. `clinical-visits.postgres.sql`
3. `clinical-authority.postgres.sql`
4. `clinic-capabilities.postgres.sql`

They create `v2_`-prefixed tables and do not touch the existing `protocols`
table. `tests/schema-parity.test.js` keeps the two providers identical.

---

## STEP 4 — Seed the data that makes approval possible

Nothing can be approved until this is done. It is data entry with a verification
step, not a migration.

**Roles.** `users.role` defaults to `'user'`. Assign real ones:

| Role | Can approve | Basis |
|---|---|---|
| `veterinarian` | yes | LICENSURE |
| `rehab_practitioner` | yes, with a current credential | CREDENTIAL |
| `technician` | no | — |
| `admin` | yes | ADMINISTRATIVE (break-glass) |

**Credentials** for every rehab practitioner — somebody must physically check the
certificate:

```
POST /api/v2/credentials        (admin only)
{ "user_id": 3, "credential": "CCRP", "license_number": "12345",
  "issuing_body": "UTCVM", "valid_from": "2025-01-01", "valid_until": "2030-01-01" }
```

**Clinic capabilities** — the ten equipment flags:

```
PUT /api/v2/clinic/capabilities  (admin or veterinarian)
{ "aquatic_access": true, "modality_laser": true, "modality_nmes": true, ... }
```

Until these are stated, every dependent exercise is **withheld**. That is the
engine's enablement behaviour, not a bug — but it is silent, so
`GET /api/v2/patients/:id/snapshot` reports `clinic.unstated_capabilities` and
the recommendation response repeats it.

---

## THE API

Everything sits behind K9's existing `requireAuth`.

| Method | Path | Notes |
|---|---|---|
| GET | `/api/v2/patients/:id/snapshot` | Current state, change since last visit, trends, live prescription |
| GET | `/api/v2/patients/:id/visits` | |
| POST | `/api/v2/patients/:id/visits` | |
| GET | `/api/v2/visits/:id` | |
| POST | `/api/v2/visits/:id/assessment` | |
| POST | `/api/v2/visits/:id/measurements` | Append-only |
| POST | `/api/v2/visits/:id/complete` | |
| POST | `/api/v2/visits/:id/recommendation` | Runs the engine, persists a version, links it to the visit |
| GET | `/api/v2/patients/:id/measurements/:key` | `?site=&side=` — the trend |
| GET | `/api/v2/protocols/:id/versions` | |
| GET | `/api/v2/versions/:id` | |
| POST | `/api/v2/versions/:id/status` | e.g. `REVIEW` |
| POST | `/api/v2/versions/:id/exercises` | Pre-approval only |
| DELETE | `/api/v2/versions/:id/exercises/:rowId` | Pre-approval only |
| POST | `/api/v2/versions/:id/revise` | Clones an approved version to a new DRAFT |
| POST | `/api/v2/versions/:id/approve` | **Authority-gated** |
| POST | `/api/v2/versions/:id/handoff` | **Authority-gated** |
| GET | `/api/v2/versions/:id/integrity` | Re-verifies the approval's content hash |
| GET | `/api/v2/protocols/:id/audit` | |
| GET | `/api/v2/beau/handoffs/:patientId` | The live approved HEP |
| GET/PUT | `/api/v2/clinic/capabilities` | PUT: admin or veterinarian |
| GET/POST | `/api/v2/credentials` | POST: admin only |
| GET | `/api/v2/me/approval-authority` | Whether the caller can sign, and why not |

### Status codes

| Code | Meaning |
|---|---|
| 400 `INVALID` | Malformed input |
| 403 `FORBIDDEN` | Not authorized — `reason` says which denial |
| 404 `NOT_FOUND` | |
| 409 `IMMUTABLE` | Editing an approved or superseded version |
| 409 `ILLEGAL_TRANSITION` | e.g. approving without review |
| 409 `NOT_APPROVED` | Handing off an unapproved version |
| 409 `INTEGRITY` | Stored content no longer matches what was approved |
| 409 `CLINICAL_BLOCK` | The engine refused — e.g. dehisced incision |

409 rather than 400 throughout: the request is well-formed and the caller is
permitted, but it conflicts with current clinical state. A UI needs that
distinction to choose between "fix your input" and "this has moved on, reload".

---

## ROLLBACK

Remove the `mountV2` call. Every V2 table is new and unread by any existing
route, so the tables can be left in place. No legacy table, route or middleware
was modified, so there is nothing else to undo.

---

## WHAT IS STILL NOT DONE

- **V2 clinician UI** — the API is complete; the 7-step wizard still drives the
  screen.
- **B.E.A.U. consumption** — `GET /api/v2/beau/handoffs/:patientId` serves the
  approved HEP; nothing reads it yet.
- **Home observations back to K9** — `source_system = 'BEAU'` is modelled in the
  audit table, no route yet.
- **Clinic linkage** — neither `patients` nor `users` carries a `clinic_id`, so
  capabilities resolve to the single configured clinic. Correct for one practice,
  wrong the moment two share an instance.
