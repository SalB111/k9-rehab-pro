# STEP 13 — ENGINE CONTRACT RECONCILIATION

Date: 2026-09-18
Scope: Forensic mapping of the existing K9 clinical engine against the V2 adapter built so far.
Status: **BLOCKING FINDINGS — V2 adapter must not be built on until resolved.**

Sources read (production, unmodified):
- `C:/Users/User/k9-rehab-pro/backend/protocol-generator.js` (1111 lines)
- `C:/Users/User/k9-rehab-pro/backend/protocol-rules.js` (537 lines)
- `C:/Users/User/k9-rehab-pro/backend/server.js` (1050 lines)
- `C:/Users/User/k9-rehab-pro/backend/db-providers/sqlite-provider.js`
- `C:/Users/User/k9-rehab-pro/backend/db-providers/supabase-provider.js`

Artifact produced: `contracts/k9-engine-input-contract.json` — the authoritative, language-neutral
engine input contract (36 inputs, 33 of them safety gates, plus 6 route-level inputs).

---

## FINDING 1 — SAFETY-CRITICAL: the current V2 adapter drops 24 of 33 safety-gate inputs

`backend/patient_adapter.py` emits a nested snake_case `{patient, today, workflow}` object.
The engine consumes a **single flat camelCase `formData` object**. Beyond the shape mismatch,
the adapter simply has no field at all for most of the engine's clinical gates.

Absent from the adapter, and what each absence costs:

| Engine input | Gate it drives | Effect of omission |
|---|---|---|
| `weightBearingStatus` | PRIMARY weight-bearing gate (NWB/TTWB/PWB exclusion sets) | **Fails unsafe** |
| `incisionStatus` | Dehisced/infected/open/draining = hard error block | **Fails unsafe** |
| `mmtGrade` | `<=1` → passive/NMES/assisted standing only | **Fails unsafe** |
| `ivddGrade` | IV/V → Phase 1 neuro lock | **Fails unsafe** |
| `oaStage` | `>=4` → excludes 9 impact-loading codes | **Fails unsafe** |
| `neuroDeepPain` | 'absent' → passive supportive care only (Grade V) | **Fails unsafe** |
| `neuroProprioception`, `neuroWithdrawal`, `neuroMotorGrade` | neuro red-flag detection | **Fails unsafe** |
| `complicationsNoted` | seroma / dehiscence / implant failure / osteomyelitis / septic scan | **Fails unsafe** |
| `crateRestRequired`, `eCollarRequired` | activity-restriction exclusion sets | **Fails unsafe** |
| `diagnosis` | contraindication keyword scan + protocol type | **Fails unsafe** (adapter has `condition`, a different name — engine silently defaults to `Conditioning`) |
| `treatmentApproach` | protocol type + phase path | Silently defaults to `Conservative` |
| `aquaticAccess`, `modalityUWTM` | aquatic **enablement** | **Fails restrictive** — withholds aquatic therapy |
| `modalityLaser`, `modalityTENS`, `modalityNMES`, `modalityTherapeuticUS`, `modalityPulsedEMF`, `modalityShockwave`, `modalityCryotherapy`, `modalityHeatTherapy` | modality **enablement** | **Fails restrictive** — withholds 9 deliverable modalities |

Also absent: `patientName`, `clientFirstName`/`clientLastName`. These are **hard validation errors** —
`validateIntake` rejects the request outright. So in its current form the adapter's output cannot
reach the engine at all; if the identity fields were patched in without the rest, it would reach the
engine and silently fail open on every gate above.

**Omission is never neutral.** Two distinct failure modes, both clinically wrong:
- Restriction inputs omitted → the restriction never fires → patient receives contraindicated exercise.
- Enablement inputs omitted (aquatic, modalities) → therapy the clinic can deliver is withheld.

---

## FINDING 2 — SAFETY-CRITICAL: undocumented call-order dependency

`validateIntake()` **mutates `formData` in place**, setting five private severity flags:

| Flag | Set when | Consumed by |
|---|---|---|
| `_highPainOverride` | `painScore >= 8` | forces palliative approach + phase lock |
| `_severeWeakness` | `mmtGrade <= 1` | phase lock + full NWB exclusion set |
| `_ivddSevere` | `ivddGrade` IV or V | Phase 1 neuro lock |
| `_severeOA` | `oaStage >= 4` | excludes 9 impact-loading codes |
| `_gradeVSupport` | `neuroDeepPain` contains 'absent' | passive supportive care only |

`getExcludedCodes()` and `selectExercisesForWeek()` read these flags off the object they are handed.

**Verified by mutation test** (severe-OA patient, `oaStage` 4, all else identical):

| Call pattern | `_severeOA` | Impact codes leaked into protocol |
|---|---|---|
| `validateIntake(fd)`, then generate from `fd` | `true` | none |
| `validateIntake(fd)`, then generate from a JSON clone of `fd` | `true` | none |
| generate without calling `validateIntake` first | `undefined` | **`HILL_CLIMB`, `BACKWARD_HILL`** |

So the invariant is narrower than "never copy the object": a copy taken *after* validation preserves
the flags, because they are plain enumerable properties. What actually breaks the gates is
**generating from an object that never went through `validateIntake`** - validating one object and
building the protocol from another, or skipping validation because the caller believes the input is
already well-formed.

Consequence: the OA, MMT, IVDD, high-pain and Grade-V gates silently do not fire. No error is
raised. The protocol generates and looks entirely normal - it simply contains impact-loading
exercises a Kellgren-Lawrence Grade 4 patient must not receive.

This is the single highest-risk item for any V2 re-implementation, because the natural,
clean-looking refactor - validate the incoming request, then build a fresh normalized object for
the generator - is exactly the pattern that breaks it.

Required sequence is recorded in `contracts/k9-engine-input-contract.json`
under `CRITICAL_call_order_dependency`.

---

## FINDING 3 — Runtime mismatch: Python adapter cannot call a Node engine

The V2 adapter is Python. The entire production K9 stack is Node 18 —
`protocol-generator.js` and `protocol-rules.js` are CommonJS modules, the API is Express,
the frontend is React. A Python adapter can never `require()` the engine in-process, so on the
current path V2 would need either a second runtime plus an RPC hop, or a reimplementation of the
engine in Python. A reimplementation directly contradicts the directive's "do not unnecessarily
rewrite the existing K9 clinical engine" and would fork the safety logic.

**This is a decision point, not something to resolve silently.** See "Open decision" below.

---

## FINDING 4 — Protocol persistence gap confirmed (as the directive predicted) — **RESOLVED**

`POST /api/generate-protocol` (`server.js:417`) is **pure compute**. It validates, generates weeks,
and returns JSON. It writes nothing. There is no protocol id, no version, no approval, no
supersession, no audit record.

What persistence does exist:
- Supabase `protocols` table, written by `createProtocol(patientId, protocolData)` — stores the
  whole protocol as **one unversioned JSON blob** (`protocol_data`). No version column, no approval
  identity, no approval timestamp, no state machine.
- `GET /api/patients/:id/protocols` (`server.js:333`) reads them back.
- SQLite provider defines **no** protocols table at all. The two providers are not equivalent.

So the directive's requirement — `Protocol → Protocol Version → Protocol Exercises → Approval →
Supersession → B.E.A.U. Handoff` — had no backing store in either provider. It was built, not adapted.

**Resolution (2026-09-18).** See `docs/PROTOCOL-PERSISTENCE.md`. Seven new tables in both
providers (`backend/schema/protocol-persistence.sqlite.sql` and `.postgres.sql`, verified
column-for-column identical), driven by `backend/protocol-store.js`, which enforces six invariants:
approved versions are immutable, only clinician-class roles may approve, only approved versions
reach B.E.A.U., approvals are SHA-256 bound to their content, a new approval supersedes the old
prescription and revokes its live handoff, and every transition is audited. 35 tests, mutation-verified.

The legacy `protocol_exercises` / `exercise_logs` / `progress_assessments` tables and the Supabase
`protocols` blob table were left in place, untouched, per the build rule.

---

## FINDING 6 — Engine OUTPUT fields were being dropped (found and fixed during persistence work)

Finding 1 was about dropped engine *inputs*. The same class of defect appeared one layer down, in
what the persistence layer stored from the engine's *output*.

The engine's exercise object carries:
`code, name, category, description, sets, reps, frequency, duration_minutes, progression,
equipment, setup, steps, good_form, common_mistakes, red_flags, contraindications,
difficulty_level, notes, evidence_citation`.

The first draft of the store mapped a non-existent `ex.dosage` (always null) and collapsed
everything else away. Concretely that dropped:

- **`equipment`** — the input B.E.A.U. computes household substitutions against. Without it,
  substitution is guesswork.
- **`red_flags`** — the stop conditions for an unsupervised home session. Without them an owner has
  no signal to halt an exercise.
- **`contraindications`** — per-exercise, distinct from the protocol-level restrictions.
- **`frequency`** — the exercise's own dosing frequency (`2-3x/day`), which is NOT the protocol
  frequency (`2x/week`). Collapsing the two loses the prescription.
- **`reps`**, **`duration_minutes`**, **`progression`**, **`evidence_citation`**.

Fixed: `protocol_version_exercises` now mirrors the engine field for field in both providers, with a
separate `dosage_override` for clinician-specified dosing that does not erase the engine's values.
Array-valued fields round-trip as arrays rather than degrading to comma-joined strings. Covered by
tests in `tests/protocol-store.test.js` and `tests/hep-contract.test.js`.

**Lesson worth carrying:** at every boundary in this integration, the default failure is a silently
dropped field, and it is never neutral. Both the input contract and the output contract now have
tests that fail when a field goes missing.

---

## FINDING 5 — `ProgressDB` orphan status: CONFIRMED

Repo-wide search for `ProgressDB` returns exactly one file: `backend/.js` — a stray 34 KB artifact
literally named `.js`, containing the `ProgressDB` implementation and the only reference to
`CREATE TABLE ... protocols` outside the Supabase provider. No live caller anywhere in
`server.js`, the agents, the engines, or the React frontend.

Matches the directive's forensic claim. Per instruction: **not deleted.** Classified as
legacy/orphaned. Its clinical concepts (pain, mobility, ROM, girth, weight-bearing, gait quality,
therapist notes) map to the V2 `clinical_measurements` / `outcome_measurements` domain and should be
carried forward there rather than revived in place.

The live `progress_assessments` table *is* created by the SQLite provider (`sqlite-provider.js:231`)
but likewise has no application writer.

---

## EXISTING ASSETS CONFIRMED INTACT (do not rebuild)

- `protocol-generator.js` — `PROTOCOL_DEFINITIONS`, `CONTRAINDICATION_MAP`, `WEIGHT_BEARING_EXCLUSIONS`,
  `INCISION_EXCLUSIONS`, `ACTIVITY_RESTRICTION_EXCLUSIONS`, `EVIDENCE_MAP`, phase logic.
- `protocol-rules.js` — `PROTOCOL_RULES`, `getExerciseSlugsForPhase`, `getPhasesForCondition`.
- `backend/agents/` — `safetyGateAgent`, `contraindicationAgent`, `exerciseSequencerAgent`,
  `protocolLookupAgent`, `orchestratorAgent`, `assemblerAgent`, plus `approvedProtocols.json`.
- `backend/engines/` — evidence (incl. PubMed client + grader), knowledge, narrative, diagram,
  presentation, visual.
- Exercise library — `all-exercises.js` + `exercises-part1..13.js`, `exercise-taxonomy.js`,
  `exercise-enhancer.js`, `evidence-references.js`, and the `exercises_v2` /
  `exercise_phases_v2` / `exercise_tiers_v2` tables.

None of this needs replacing. V2 needs an adapter and a persistence layer around it.

---

## OPEN DECISION (blocks the next increment)

The engine adapter must be written in a language that can actually reach the engine.
Recommended: **rewrite the adapter in Node/CommonJS** so it can `require()` `protocol-generator.js`
directly, preserving the in-place mutation contract in Finding 2 and matching the runtime V2 must
eventually merge into. The existing 148-line Python adapter would be retired (backed up to
`backups/`, not deleted, per the build rule).

---

## NEXT STEPS (pending the decision above)

1. Rewrite the adapter against `contracts/k9-engine-input-contract.json` — all 36 inputs carried,
   explicit `null` where genuinely unknown, never silently dropped.
2. Add a contract guard test that fails if any engine input is unmapped — this is the regression
   net for Finding 1.
3. Add a call-order test that asserts each of the five derived flags actually reaches
   `getExcludedCodes` — the regression net for Finding 2.
4. Golden clinical cases: NWB, high pain, MMT 0-1, IVDD IV/V, OA 4, absent deep pain, dehisced
   incision, aquatic-unavailable clinic. Assert V2 output is byte-identical to the current
   production engine's output for the same case.
5. ~~protocol/version/approval persistence (Finding 4)~~ — **done**, see `docs/PROTOCOL-PERSISTENCE.md`.
6. Wire the store behind the V2 API routes (`/api/v2/protocols/:id/approve`, `/handoff`), mapping
   `ProtocolStoreError.code` to HTTP status. Add a `requireRole` middleware to K9 so the role check
   is enforced at the route as well as in the store.
7. Then the V2 clinician UI (snapshot -> today's update -> recommendation -> review -> approve).
8. Then the B.E.A.U. side: consume the approved HEP, adapt execution to the home environment, and
   return observations.
