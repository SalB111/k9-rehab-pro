# CLAUDE.md — K9 Rehab Pro™

## Ownership & Intellectual Property

**Product:** K9 Rehab Pro™
**AI Engine:** B.E.A.U. (Biomedical Evidence-Based Analytical Unit)
**Owner / Author:** Salvatore Bonanno
**Role:** Canine Rehabilitation Nurse (CCRN) | Software Developer | Founder
**Copyright:** © 2025 Salvatore Bonanno. All rights reserved.

This codebase, all clinical logic, exercise data, protocol rules, and B.E.A.U.'s
system prompt (`BEAUS_BRAIN_AI_PROMPT`) are the proprietary intellectual property
of Salvatore Bonanno. Unauthorized use, reproduction, or distribution is prohibited.

**Background:** Salvatore Bonanno built K9 Rehab Pro™ from 30 years of veterinary
nursing experience, including founding and running the canine rehabilitation department
at BluePearl Veterinary Partners (formerly Lauderdale Veterinary Specialists) in Fort
Lauderdale, Florida from 2016–2024. Every protocol, every phase gate, and every
clinical rule in this system came from real clinical work with real patients.

---

## Clinical Source of Truth

**ALL clinical protocols, exercises, phase definitions, and progression criteria MUST originate from or be validated against the source-of-truth document:**

- **Primary**: `CanineRehabProtocols/canine_rehab_protocols.docx`
- **Export copy**: `export/clinical-source/canine_rehab_protocols.docx`
- **Supplementary**: `docs/K9_Rehab_Pro_Athletic_Foundations_Exercise_Library.docx`

**Zero tolerance for fabricated exercises, invented diagnoses, or hallucinated clinical data.** If it's not in the source document, it doesn't go in the code. When in doubt, flag it — never guess.

## Scope of Practice

This platform is a **Clinical Decision-Support System (CDSS)** for **post-diagnostic rehabilitation planning ONLY**.

**In scope:**
- Rehabilitation protocol generation for diagnosed conditions
- Exercise selection, dosing, and progression from the validated library
- Phase-gated progression based on clinical assessment criteria
- Clinical education and evidence reference

**Out of scope — the platform NEVER:**
- Diagnoses conditions or diseases
- Prescribes medication or pharmaceutical interventions
- Establishes or replaces the Veterinarian-Client-Patient Relationship (VCPR)
- Overrides licensed veterinary judgment
- Provides emergency or urgent care guidance
- Makes prognosis determinations

**Enforcement:** Any feature, AI output, or code path that crosses scope boundaries must be blocked, not just disclaimed.

## Anti-Hallucination Rules

These rules are **non-negotiable** and apply to all code generation, B.E.A.U. output, and protocol logic:

1. **Exercise Library Lock**: Every exercise referenced in protocol output or B.E.A.U. responses MUST match an exercise code in the 260-exercise library (`backend/all-exercises.js`, which prints its own count on load). Any unmatched exercise name = blocked output + clinician alert. No exceptions.
2. **Dosing from Source Only**: Sets, reps, duration, frequency, and intensity parameters MUST be extracted from the source-of-truth document. B.E.A.U. must NOT generate novel dosing. If the source doc doesn't specify dosing for an exercise, output "Dosing: Per clinician assessment" — never fabricate numbers.
3. **No Invented Clinical Data**: Exercise descriptions, contraindications, indications, evidence grades, and phase assignments must trace to source documents. If a value cannot be sourced, it must be flagged as `[UNVERIFIED]` and excluded from clinical output.
4. **B.E.A.U. Post-Generation Verification**: Every B.E.A.U. response that references exercises must be cross-checked against the exercise database before delivery to the clinician. Novel exercise names trigger a block.
5. **Confidence Transparency**: When B.E.A.U. synthesizes recommendations (vs. quoting source material directly), the output must indicate this distinction. Never present AI synthesis as sourced fact.
6. **No Speculative Prognosis**: B.E.A.U. must never predict outcomes, timelines to recovery, or success rates unless directly quoting published literature with citation.

## Clinical Reasoning Constraints `[Sal, 2026-09-26]`

### 1. What Sal enters is FACTUAL

Every value Sal types into this system is real clinical data. The patients in
the demo database are not real animals, but **the clinical content of their
records is factual and considered** — it is what a case like that actually
looks like.

Do not treat an entered value as a placeholder, a typo, or something to be
"corrected" toward what seems more typical. If a value looks surprising, the
surprise is information: ask, or report it as a finding. Never quietly
normalise it.

### 2. A CURRENT FINDING IS NOT A POSITION ON A LADDER

**Weight-bearing status does not follow a fixed sequence, and nothing may
assume one.**

It is tempting to read the four states as stages:

    NWB  ->  TTWB  ->  PWB  ->  FWB

That is one path among many. A real patient may go NWB -> TTWB -> FWB, skip
states, start at FWB and never be anything else, or move backwards after a
setback. **Every patient is different.**

So:

- **Never infer a stage from a sequence.** A patient recorded FWB was not
  necessarily NWB before, and may have no earlier state at all.
- **Never block, gate, restrict or withhold output because a patient is not
  where a progression says they "should" be.** There is no such place.
- **FWB does not mean recovered**, and an impairment does not imply reduced
  weight bearing. Haley, 2026-09-26, is the case to remember: **full weight
  bearing AND slow to rise from lying.** Those are two independent findings.
  A dog that is slow to get up in no way resembles a non-weight-bearing dog,
  and reasoning that treats them alike is wrong before it is unsafe.

**What the engine does today, and it is correct:** `WEIGHT_BEARING_EXCLUSIONS`
keys off the CURRENT state only — `NWB`, `TTWB`, `PWB` each exclude a set,
and `FWB` excludes nothing. Nothing validates a transition, and nothing must
start. Verified 2026-09-26: Haley reads FWB and has **zero** exercises excluded
on that basis.

`patient_treatment_status` stores a status per DATE. That series is a RECORD
of what was found, in the order it was found. It is not a schedule, not a
staircase, and carries no expectation about what comes next.

### 3. Functional findings stand on their own

Slow to rise, difficulty with stairs, reduced jump ability, exercise
intolerance — these are their own findings. They are not derivable from a
weight-bearing state, a lameness grade or a pain score, and none of those may
be inferred from them either. Each is recorded because a clinician observed
it.

## V3 — The V1/V2 Merge (standing constraint)

**Instruction from Sal, 2026-09-24:** *"can we merge v1 and v2 so they dont
conflict? ... take all best of v1 and all the best of v2 and merge them"* /
*"before we deploy i thought we are merging v1 and v2 we can call it v3"*

### Definition of done

**For any clinical fact, exactly ONE store is the source of truth.**

`patients.dashboard_data` is **NOT** a source of truth in V3. At most it is a
view served at the API boundary for backward compatibility with the existing
dashboard form.

### The template — commit `9e8f407`

Give the block **one real home**, point **both screens** at it, **fold the old
copies in**. That commit did it for clinic equipment. It works. Follow it.

### THE RULE

> A change that leaves `dashboard_data` as the source of truth for a block is
> **NOT progress toward V3**, whatever else it achieves.
>
> If you are about to do that, say so in the **FIRST LINE** of your response,
> name it as a departure from this section, and say why — before anything else.

A "bridge", a "reader", and "reading through" are the same thing: **not a
merge.** On 2026-09-24 commit `9e8f407` declared the template above and the
next three blocks (home, goals, diagnostics) silently did not follow it, while
still being called "the next block". Every individual statement made was true;
the work still drifted, because the goal lived only in conversation and
conversation gets summarised. That is why this is written here.

### Verified state, 2026-09-26

**MERGED means FOUR things, not three.** The template in commit `9e8f407` says:
give the block one real home, point **both screens** at it, fold the old copies
in. A block is merged only when all four hold:

1. it has its own table
2. **the engine does not read the blob** for its fields
3. **the panel writes the store**, not `dashboard_data`
4. **no OTHER screen reads the blob** for its fields

**Test 4 was added 2026-09-26, and it was added because it was missing.** Sal,
driving Haley's intake: *"the Goals are not being transferred to the protocol
summary."* He was right, and it was wider than goals. `ProtocolPanel` read 8
blob keys belonging to two blocks that already owned tables — 2 goals and 6
treatment — and **goals and treatment passed all three of the old tests while
being wrong on that page.** A panel reading its own block's keys is test 3's
business; nothing asked about everyone else.

What it cost, measured on the live database:

- **Haley** — blank for all 8, while her record held `Full weight bearing
  (FWB)`, her activity restrictions, a goal item and her owner's priority.
- **Winston** — the summary showed `Partial weight bearing (PWB)` while his
  record said `Full weight bearing (FWB)`. His store had two rows for
  2026-09-25, PWB at 04:30 then FWB at 12:56; the blob kept the 04:30 value.

The second is why this is not cosmetic. **This is the page a clinician reads
before sign-off, and it presented a superseded weight-bearing status as
current.** A blank field gets noticed. A plausible stale one does not.

Fixed in `ProtocolPanel` the same day: it now fetches
`GET /v2/patients/:id/goals` and `GET /v2/patients/:id/treatment`, with **no
blob fallback** — a fallback is precisely what would have kept showing
Winston's stale value. Nine tests in `backend/v2/protocol-summary.test.js`
read the real JSX and run the real stores against the real database.

| block | own table (rows) | engine reads blob | panel writes blob | other screens read blob | verdict |
|---|---|---|---|---|---|
| **home** | `patient_home_environment` (6) | 0 | **0 controls** | 0 | **MERGED** |
| **treatment** | `patient_procedures` (3) + `patient_treatment_status` (7) | 0 gates | 5, none of them migrated fields | **0** — was 6 | **MERGED** |
| **diagnostics** | `patient_diagnostic_studies` (14) | 0 | 4, none of them migrated fields | 0 | MERGED |
| **goals** | `patient_goals` (6) + `patient_goal_items` (17) | 0 | 15, none of them migrated fields | **0** — was 2 | MERGED |
| **equipment** | `clinic_capabilities` (2) | 0 | 1, not a migrated field | 0 | MERGED |
| **metrics** | `visit_measurements` (40) | 1 (`bodyConditionScore`) | 8, none of them migrated fields | **1** — nutrition panel reads `metrics::BCS (1–9)` | **PARTIAL** |
| **client** | `patient_client_details` (6) | **4** — age, breed, sex, weight | 7 + 2, all DEMOGRAPHICS | **63**, all demographics | **PARTIAL** |
| assessment | — | **10**, incl. `neuroDeepPain` [GATE] | 68 + 1 | n/a — no store to be wrong about | untouched |
| conditioning / global / helsinki | — | 0 | no panel / 4 | n/a | untouched |

**metrics moved MERGED → PARTIAL** on test 4. It is the one case the new column
found that was not already known: `PetCareNutritionPanel` reads
`metrics::BCS (1–9)` from the blob while `visit_measurements` owns the
measurement. Small, and not yet fixed — recorded here rather than quietly
carried.

For blocks with no store of their own, test 4 does not apply: reading their
blob keys from another screen is the design, not a defect.

**What "none of them migrated fields" means, because it is the load-bearing
claim in four rows above.** Those panels still contain controls writing
`block::Label` keys — but they are DIFFERENT FIELDS from the ones the store
owns, not un-rewired copies of them:

- diagnostics store owns imaging and labs; the 4 remaining controls are
  Supplements, Last NSAID dose, Response to current medications, Medication
  Notes — medication fields that happen to live in that panel
- goals store owns rehabilitation goal items; the 15 are conditioning phase,
  session duration, clinician sign-off and discharge summary
- metrics store owns measurements; the 8 are goniometer type, position,
  alignment and notes
- equipment's 1 is a free-text "any additional equipment not listed above"

They are not yet in V3 and they are not a regression. They are fields nobody
has given a home.

**client is PARTIAL and the table said MERGED until today.** The details —
address, contacts, cover, PII — did move to `patient_client_details`. The
DEMOGRAPHICS did not: the panel writes name, sex, species, breed, phone, email
and referring vet into the blob, and four engine inputs (age, breed, sex,
weight) are still read from `client::` keys. The design says demographics go
through `PUT /api/patients/:id`; the panel does not do that.

**treatment was HALF for one day and is now MERGED.** Since
`3c8a22a` the engine reads `patient_treatment_status` and
`patient_procedures` — all four safety gates are off the blob — and since
`50d71f9` the panel writes them too. For the day between those two commits a
clinician's edit did not reach the protocol, which is the one state where the
screen and the engine disagree by construction. Two tests in
`patient-treatment-store.test.js` now read the real JSX and fail if the panel
goes back to the blob or stops reading the endpoint.

### Re-derive this table

**Do not trust the measured columns above.** One command prints all four:

    node scripts/block-state.js

Read only. It reads the table row counts from the database, the engine sources
from `dashboard-bridge.MAP`, and BOTH the panel writes and the foreign reads
out of the real `DashboardView.jsx`. It ends with a list of every block that
has a table but is not fully merged, naming which screen reads which key.

The fourth column exists because the table was wrong without it and nobody
could tell. If you add a test to the definition above, add it here too — a
document whose claims cannot be re-derived is the thing this whole file was
written to prevent.

It exists as a script rather than a one-liner here because the one-liner needed
enough backslash escaping that the shell mangled it — and a document telling
you to run a broken command is worse than a document saying nothing.

### Where a blob value still reaches the engine

**Corrected 2026-09-24.** An earlier version of this section said assessment was
the block left to do and the only place a blob value still reaches the engine.
That was **wrong**. Treatment feeds the engine too, and two of the three
blob-only safety gates are treatment fields.

Three engine inputs have **no column anywhere**, so `dashboard_data` is their
only source:

| engine input | blob key | block |
|---|---|---|
| `weightBearingStatus` (gate) | `treatment::Weight Bearing Status` | treatment |
| `incisionStatus` (gate) | `treatment::Incision Status` | treatment |
| `neuroDeepPain` (gate) | `assessment::Deep Pain Perception` | assessment |

Everything else the bridge maps is **column-first**: `intake-proposal`'s `FILL`
list (intake-proposal.js:269) reads the column, and the blob answers only where
the column is empty. Across the five current patients no such column is empty,
so today nothing else is blob-sourced. **That is a fact about the DATA, not
about the code** — a new patient with an empty column is blob-sourced
immediately.

### The two screens disagree about which record wins

This is the mechanism by which the two records drift apart, and it is worth
knowing before touching either:

- the **engine** reads column-first, blob fills gaps (intake-proposal.js:269)
- the **dashboard** reads blob-first, columns fill gaps
  (DashboardView.jsx:4166, `...savedDash` spread first)

and the dashboard's column fallback covers `client::` keys **only**. No
`treatment::` key is ever seeded from its column. So a clinician edits the blob
value on screen while the engine reads the column, and neither screen shows the
other's value.

Live example, Charlie: `affected_region` = `Bilateral Hip (R>L)` (what the
engine reads) and `treatment::Affected Limb(s)` = `Both hindlimbs` (what the
screen shows). Same for `special_instructions` vs `treatment::Activity
Restrictions` — for Charlie and Luna each holds orders the other is missing.

### `Affected Limb(s)` and `affected_region` are not the same fact

The bridge aliases them onto one engine input, `affectedRegion`
(dashboard-bridge.js:204). They are different vocabularies:

- the `affected_region` COLUMN holds a **lesion site** — `Thoracolumbar`,
  `Bilateral Hip (R>L)`, `Left Stifle`
- `treatment::Affected Limb(s)` holds **limbs** — `Both hindlimbs`,
  `Left hindlimb (LH)`

The engine's own vocabulary is the anatomical one, and `getProtocolType`
(protocol-generator.js:435) string-matches it. Demonstrated 2026-09-24:

    "Osteoarthritis" + "Left Stifle"         ->  tplo protocol
    "Osteoarthritis" + "Left hindlimb (LH)"  ->  oa protocol

Same patient, same limb, different protocol, decided by which field answered.
It does **not** fire for the five current patients — their diagnoses route on
their own — and it fires the moment `affected_region` is empty and the blob
fills it.

### Activity restrictions have ONE home  `[2026-09-26]`

**`patient_treatment_status.activity_restrictions` is the home.**
`patients.special_instructions` is a **mirror** of it, written by
`recordStatus` and by nothing else. They are one fact, owned by the
Treatment block — Sal's decision, 2026-09-26.

They used to be two live copies and they did not drift as stale copies of one
another. They drifted into **half-records**, each holding orders the other was
missing:

| | only in the column | only in the store |
|---|---|---|
| Charlie | heated orthopedic bedding, weight loss to BCS 5/9, reassess HCPI 4-weekly | leash walks 20-30 min 2x/day, no repetitive fetch, no stairs when reluctant |
| Luna | reassess drawer + TCT at 8w, TPLO indicated if progression | no off-leash, controlled walks 15-20 min 3x/day |
| Winston | weight management critical (BCS 6/9) | — |
| Haley | — | **everything — her column was empty, so the engine had never seen her restrictions at all** |

Merged from Sal's own wording, confirmed by him verbatim, then the cause was
fixed:

- `recordStatus` mirrors the **current** row into the column. It reads
  `getTreatment().status` rather than its local `merged`, because a clinician
  may record a status for an EARLIER date — mirroring `merged` would put a
  backdated crate-rest order back on a freely exercising dog.
- `readTreatment` maps it, and it outranks the column, the way `surgery_date`
  already did.
- `record-sync`'s `ONE_WAY` entry was **removed**: a mirror with two writers
  is the problem all over again.
- **The Special instructions box is gone from New/Edit Patient.** This is the
  load-bearing part. With the engine reading the store, a box still writing
  the column would not recreate the old drift — it would mean what a
  clinician types reaches NOTHING.

The column stays because three readers take it from there:
`PatientDetailView.jsx:145`, `engine-adapter.js:191`, `patient-gaps.js:96`.

Guarded by 8 tests in `backend/v2/activity-restrictions-home.test.js`,
mutation-tested against all seven ways of undoing it.

> **AND THEY DRIVE NO EXERCISE EXCLUSION — they did not before this either.**
> `getExcludedCodes` (protocol-generator.js:867) keyword-scans
> `specialInstructions`, but all 18 `CONTRAINDICATION_MAP` keywords are
> comorbidity terms — `cardiac`, `seizure`, `cancer`, `pregnant`,
> `implant`, `non-ambulatory`. Probed 2026-09-26: `"no stairs"`,
> `"no jumping"`, `"crate rest"`, `"harness only"` and
> `"no impact exercises"` match **nothing**.
>
> So writing "no impact exercises" does not remove impact exercises from a
> protocol. Impact and jumping appear only as advisory prose on each protocol
> definition, never as logic. Not a safety hole — every protocol carries its
> contraindication text and none is valid without clinician sign-off — but it
> is a gap between what the field implies and what the engine does.
> **Adding activity-based exclusion rules is clinical authorship and is
> Sal's to write.**

### Treatment answers the engine never sees

`treatment::E-Collar Required` and `treatment::Strict Crate Rest` are collected
by the dashboard and stored. The engine has `eCollarRequired` and
`crateRestRequired` gates. **The bridge maps neither**, so both gates always
fall to their cautious default and the clinician's answer is discarded.

Not a safety hole — every gate carries `mustConfirm: true` and is confirmed by
a person before use — but it is a collected answer that goes nowhere.

`treatment::Approach` is discarded the same way: `intake-proposal` always
DERIVES `treatmentApproach` from the surgery date and the presentation
(intake-proposal.js:318). Checked against all five patients on 2026-09-24 — the
derivation agrees with the recorded answer in every case, so nothing is wrong
today.

### Re-derive this section rather than trusting it

From the repo root. If any of these disagree with the text above, the text is
stale and the commands are right:

    # every engine input the bridge can supply from the blob
    node -e "console.log(require('./backend/v2/dashboard-bridge').MAP.map(m=>m.to).sort().join(' '))"

    # which safety gates the bridge can source at all
    node -e "const b=require('./backend/v2/dashboard-bridge'),i=require('./backend/v2/intake-proposal');       const s=new Set(b.MAP.map(m=>m.to));       i.SAFETY_GATES.forEach(g=>console.log(s.has(g.field)?'from record':'NO SOURCE ',g.field))"

### Scope note

`DashboardView.jsx` is 4,536 lines but has **one** `updateField` definition —
all field writes funnel through it — and **two** calls that PUT the blob
(DashboardView.jsx:3123 and :4252). Changing where that data lands does not
require rewriting the form.

### Related

The integration workspace map, and which copies are stale, is in
`D:\BEAU-K9-INTEGRATION\CLAUDE.md`. Note that `01-SOURCE\K9-REHAB-PRO` there
is a frozen archive months out of date — **this repo is the live code.**

## Evidence Gating Policy

- Protocols default to **Grade A (strong RCT)** and **Grade B (moderate evidence)** exercises
- **Grade C (limited evidence)** and **EO (expert opinion)** exercises are included ONLY when no Grade A/B alternative exists for that phase/condition
- Every exercise in protocol output MUST display its evidence grade to the clinician
- Evidence grades: `A` = Strong RCT | `B` = Moderate evidence | `C` = Limited evidence | `EO` = Expert opinion
- Low-evidence exercises (C/EO) must carry an inline notation: `[Evidence: C — limited studies]`
- Evidence references must cite: Author, Year, Publication, and relevance to the exercise

## Credential & Access Requirements

- Users must attest to professional licensure during registration: **DVM**, **CCRP**, **CCRT**, or **supervised student/technician**
- License type and credential number are required fields (stored, not externally verified in v1)
- Protocol generation is restricted to authenticated users with valid credential attestation
- Student/trainee accounts must be flagged for additional oversight in audit logs
- Role hierarchy for clinical sign-off: DVM > CCRP/CCRT > Technician (supervised) > Student (view only)

## Regulatory Framework

### Classification
- Platform is classified as a **CDSS (Clinical Decision-Support System)**, NOT a medical device
- Does NOT claim FDA/USDA device classification
- Does NOT claim AVMA endorsement — aligns with AVMA Model Veterinary Practice Act principles

### Regulatory References
- **AVMA Model Veterinary Practice Act** — scope-of-practice definitions
- **ACVSMR (American College of Veterinary Sports Medicine and Rehabilitation)** — certification and methodology standards
- **State Veterinary Practice Acts** — jurisdiction-specific requirements (vary by state)
- **AAHA (American Animal Hospital Association)** — practice standards reference

### Compliance Requirements
- All protocol output includes CDSS classification disclaimer
- Terms of Service must be accepted before first protocol generation
- Disclaimer refresh required every 90 days for active users
- No protocol output is valid without licensed veterinarian review and approval
- Platform retains no liability for clinical outcomes — licensee assumes full professional responsibility

### Adverse Event Reporting
- UI must include a "Report Safety Concern" mechanism
- Adverse events linked to protocol recommendations must be logged with: patient ID, protocol version, exercise code, event description, clinician ID, timestamp
- Adverse event logs are retained for minimum 7 years (aligned with state board investigation timelines)

## Red-Flag Detection & Escalation

### Current Blocking Criteria (implemented)
- Pain score >= 8/10 → **BLOCKS** protocol generation
- Absent deep pain perception → **BLOCKS** protocol generation
- Incision complications (dehiscence, infection) → **BLOCKS** generation
- Lameness grade 5 (non-weight-bearing) → Restricted to passive exercises only

### Escalation Pathways (required)
- High pain (>= 7/10) → Recommend pain management specialist consult
- Neurological grade IV-V → Recommend veterinary neurologist consult
- Post-op complications → Flag for surgeon re-evaluation
- Cardiac history + aquatic exercise → Recommend cardiology clearance
- All escalation recommendations must be logged in audit trail

### Red-Flag Audit Requirements
- Every red flag evaluated per patient per protocol MUST be logged
- Log format: `{patient_id, protocol_id, flag_type, flag_value, action_taken, clinician_id, timestamp}`
- Red-flag logs are included in protocol defensibility records

## Audit & Defensibility

### Protocol Documentation Standard
Every generated protocol must retain:
- **Generation metadata**: timestamp, algorithm version, clinician ID, patient ID
- **Input snapshot**: all intake parameters used for generation
- **Red flags evaluated**: complete list of flags checked and their values
- **Contraindications checked**: which contraindication categories were evaluated and passed/failed
- **Evidence grades**: per-exercise evidence level
- **Version control**: if protocol is modified post-generation, both "Original" and "Approved" versions retained
- **Modification trail**: clinician edits tracked separately from algorithm output

### Audit Log Requirements
- All POST, PUT, DELETE operations logged automatically (existing)
- Red-flag triggers logged per patient (required addition)
- B.E.A.U. queries and responses logged with session ID
- Protocol modifications tracked as diffs (original vs. approved)
- Logs retained minimum 7 years
- Audit log must be immutable once written (append-only, no delete except admin purge with separate audit entry)

### Litigation Defensibility
- Unsigned protocols must carry watermark: `DRAFT — NOT APPROVED FOR CLINICAL USE`
- Signed/approved protocols must show: clinician name, credential type, approval timestamp
- Decision rationale available per exercise: "Selected because: Phase 2 + TPLO indication + Grade B evidence + no contraindications"

## Outcome Monitoring

- Reassessment prompts at 2-week and 4-week intervals after protocol generation
- Validated outcome measures: CBPI (Canine Brief Pain Inventory), lameness grading, goniometric ROM
- Alert if patient shows regression: increased pain score, decreased ROM, increased lameness grade
- Stalled progress (no improvement after 4 weeks) triggers protocol review recommendation
- Outcome data feeds back into audit trail for protocol efficacy tracking

## Clinical Identity

K9 Rehab Pro is a veterinary rehabilitation intelligence platform. Clinician FIRST, engineer second, designer third.

- Evidence-based: ACVSMR diplomate methodology, Millis & Levine textbook standards
- 4 Protocols: TPLO (16wk), IVDD (12wk), OA (16wk), Geriatric (16wk)
- 4 Phases per protocol with gated progression (16 total phases)
- 52 unique exercise codes mapped to protocol phases, 260 total in exercise database
- Equipment gating: aquatic (flag), modalities (individual flags)
- Phase 4 for chronic conditions = lifelong maintenance
- Protocol generator header: `4 Conditions | 16 Phases | 52 Protocol Exercises | 260 Exercise Library | Full Modality Integration`
- Full Millis & Levine assessment framework (TPR, orthopedic, neuro, gait, pain, functional, special tests)
- 13 dashboard blocks (Client, Diagnostics, Assessment, Treatment, Metrics, Equipment, Home, Goals, Conditioning, Protocol, Library, Nutrition, 3D Viewer)
- Full multilingual support: 10 locales (en, es, fr, de, pt-BR, it, ja, ko, zh-CN, nl)
- PetCare Nutrition dashboard block with multi-manufacturer veterinary diet recommendations (Mars/Royal Canin, Hill's, Purina Pro Plan, Blue Buffalo, etc.)
- Clinician roster + staff roster management in Settings → Clinic Configuration
- Hospital language lock system (admin-controlled)

## Implementation Tiers

Features and safety measures are prioritized into implementation tiers:

### TIER 1 — Required before clinical use
- [ ] Credential verification at registration (DVM/CCRP/CCRT/student attestation)
- [ ] Scope-of-practice enforcement in B.E.A.U. (block out-of-scope queries)
- [ ] B.E.A.U. exercise name cross-check against 260-exercise library
- [ ] Terms of Service sign-off on first login
- [ ] Evidence grade display on every exercise in protocol output
- [ ] Red-flag audit logging per patient per protocol

### TIER 2 — Required for regulatory defensibility
- [ ] AVMA/state board compliance reference in UI
- [ ] Protocol versioning (Original vs. Approved with diff tracking)
- [ ] B.E.A.U. dosing extraction from source doc (not AI-generated)
- [ ] Outcome tracking with reassessment prompts
- [ ] Specialist escalation pathways for high-risk flags
- [ ] Adverse event reporting mechanism in UI

### TIER 3 — Required for enterprise/university deployment
- [ ] Role-based clinical access (DVM approve / technician execute / student view)
- [ ] Semantic hallucination detection on B.E.A.U. responses
- [ ] Confidence scoring per AI recommendation
- [ ] Decision rationale per exercise selection
- [ ] Informed consent template for CDSS-assisted rehabilitation
- [ ] Multi-language support
- [ ] WCAG AA accessibility compliance

## Tech Stack

- **Backend**: Express.js 4.x, SQLite3, Node.js on port 3000
- **Frontend (active)**: `k9-rehab-frontend/` — React 19 + Vite 6.x + Tailwind CSS 3.4 on port 3001
- **Frontend UI**: Radix UI primitives, shadcn/ui components, lucide-react icons, class-variance-authority
- **Frontend (legacy/WIP)**: `frontend/` (React 19 + Vite + TypeScript), `frontend_new/` (React 18 + Vite)
- **Authentication**: JWT (jsonwebtoken + bcryptjs) with role-based access control (`backend/auth.js`)
- **Security**: Helmet, CORS (origin: localhost:3001), express-rate-limit
- **AI Integration**: Anthropic SDK (`@anthropic-ai/sdk`) for B.E.A.U. clinical assistant
- **Image Generation**: Hugging Face Inference API (SDXL) for storyboard exercise images
- **Breed Photos Fallback**: Dog.CEO API for breed-specific photos (19 breeds mapped)
- **Document parsing**: Mammoth (for .docx source-of-truth ingestion)
- **Database (migration)**: Supabase (WIP via `k9-rehab-api/`), client included in dependencies
- **No test framework** configured (utility test scripts exist in `backend/`)
- **No linter** configured (eslint exists in frontend/ only)

## Project Structure

```
k9-rehab-pro/
├── backend/                    # Express API server (port 3000)
│   ├── server.js               # Main server — routes, middleware, B.E.A.U. endpoint
│   ├── database.js             # SQLite schema & data operations
│   ├── auth.js                 # JWT auth, bcrypt, role-based middleware
│   ├── protocol-generator.js   # ACVSMR-aligned 4-protocol × 4-phase system
│   ├── protocol-rules.js       # Phase-condition mappings
│   ├── all-exercises.js        # Master exercise export (deduped + enhanced)
│   ├── exercises-part[1-10].js # Exercise database split across 10 files
│   ├── exercise-taxonomy.js    # Intervention types, phases, indications
│   ├── exercise-enhancer.js    # Medical-grade metadata enrichment
│   ├── evidence-references.js  # Clinical evidence citations
│   ├── video-references.js     # Instructor video library
│   ├── storyboard-references.js # Exercise storyboard system (215/215 auto-gen)
│   ├── storyboard-images/       # Cached AI-generated exercise images (HF SDXL)
│   └── package.json
├── k9-rehab-frontend/          # Active frontend (React 19 + Vite, port 3001)
│   ├── src/App.jsx             # Main app — all views including B.E.A.U.
│   ├── src/K9Icons.jsx         # Icon system v2
│   ├── src/index.jsx           # Entry point
│   ├── src/i18n/               # Multilingual system (10 locales)
│   │   ├── index.js            # i18next config
│   │   └── locales/            # en, es, fr, de, pt-BR, it, ja, ko, zh-CN, nl
│   ├── src/pages/DashboardView.jsx  # 13-block clinical intake system
│   ├── src/pages/settings/     # Settings tabs including Clinic Configuration
│   │   └── TabClinicConfig.jsx # Hospital language, clinician & staff rosters
│   ├── src/components/ui/      # shadcn/ui components
│   ├── src/hooks/useBeauVoice.js # TTS with rewind/FF/playText
│   ├── src/lib/                # Utility functions (cn, etc.)
│   ├── vite.config.js          # Vite configuration
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   └── package.json
├── frontend/                   # WIP frontend (React 19 + Vite + TypeScript)
├── frontend_new/               # Legacy frontend (React 18 + Vite)
├── k9-rehab-api/               # Supabase-backed API (WIP migration target)
│   ├── server.js               # Express + Supabase server
│   ├── schema.sql              # Supabase schema
│   └── seed*.js/sql            # Data migration scripts
├── CanineRehabProtocols/       # Source-of-truth clinical document
│   └── canine_rehab_protocols.docx
├── export/clinical-source/     # Exported copy of source-of-truth
├── docs/                       # Supplementary clinical documents
├── output/                     # Generated protocols, PDFs, reports
├── data/                       # Supporting data files
├── supabase/                   # Supabase configuration
│   └── migrations/             # Database migration files
├── tests/                      # Test directory
├── public/                     # Static assets
└── documentation/              # Project documentation
```

## Running the App

```bash
# Backend (Terminal 1)
cd backend && npm install && node server.js

# Frontend (Terminal 2) — Active frontend
cd k9-rehab-frontend && npm install && npm start
```

- Frontend: http://localhost:3001
- Backend API: http://localhost:3000/api
- Health check: http://localhost:3000/api/health

## Key API Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login, returns JWT
- `GET /api/auth/me` — Current user info (requires auth)
- `GET /api/auth/status` — Auth system status (public)

### Clinical Core
- `GET /api/health` — Health check (public)
- `GET /api/conditions` — All conditions
- `GET /api/conditions/grouped` — Conditions by category
- `POST /api/generate-protocol` — Generate rehab protocol (main endpoint)

### Exercise Library
- `GET /api/exercises` — All exercises with full details
- `GET /api/exercises/search?q=` — Search exercises
- `GET /api/exercises/:code` — Single exercise by code
- `GET /api/exercises/by-intervention/:type` — Filter by intervention type
- `GET /api/exercises/by-phase/:phase` — Filter by rehab phase
- `GET /api/exercises/by-indication/:indication` — Filter by indication
- `GET /api/exercises/by-evidence-grade/:grade` — Filter by evidence grade
- `GET /api/taxonomy` — Full taxonomy (interventions, phases, indications)

### Patients
- `GET /api/patients` — List patients
- `POST /api/patients` — Create patient
- `DELETE /api/patients/:id` — Delete patient
- `POST /api/patients/delete-batch` — Bulk delete (admin only)

### Video & Storyboard System
- `GET /api/videos/:exerciseCode` — Videos for exercise
- `GET /api/instructors` — All instructors
- `GET /api/instructors/:id` — Instructor details
- `GET /api/video-transcripts/:exerciseCode` — Video transcripts
- `GET /api/exercises/with-videos` — Exercises that have videos
- `GET /api/videos/by-instructor/:id` — Videos by instructor
- `GET /api/videos/stats` — Video library statistics
- `GET /api/storyboards` — All storyboards
- `GET /api/storyboards/stats` — Storyboard statistics
- `GET /api/storyboards/:exerciseCode` — Storyboard for exercise
- `GET /api/storyboards/:exerciseCode/frames` — Storyboard frames
- `GET /api/storyboards/:exerciseCode/script` — Storyboard script

### Storyboard Image Generation
- `GET /api/storyboard-images/:exerciseCode/:frameNumber` — Generate or serve cached exercise image (HF SDXL)
- `GET /api/storyboard-images/:exerciseCode` — List cached images for exercise

### V1 Exercise Library API
- `GET /api/v1/exercises` — Paginated exercise list
- `GET /api/v1/exercises/:id` — Exercise by ID
- `GET /api/v1/domains` — Exercise domains
- `GET /api/v1/phases` — Exercise phases
- `GET /api/v1/tiers` — Exercise tiers
- `POST /api/v1/programs/generate` — Generate program
- `GET /api/v1/programs/conditions` — Available conditions
- `GET /api/v1/programs/conditions/:condition/phases` — Phases for condition

### B.E.A.U. Clinical Assistant
- `POST /api/beau/chat` — Streaming AI chat with patient context (Anthropic SDK)
- `GET /api/beau/status` — Check if B.E.A.U. is configured

### Audit Log
- `GET /api/audit-log` — View audit log (⚠ documented but not yet wired on backend — follow-up)
- `GET /api/audit-log/stats` — Audit statistics (⚠ not yet wired)
- `GET /api/audit-log/export` — Export audit log (⚠ not yet wired)
- `DELETE /api/audit-log/purge` — Purge audit log, admin only (⚠ not yet wired)

### Safety / Adverse Event Reporting
- `POST /api/safety-report` — Record a safety concern or adverse event (auth required, any clinician). Body: `{type, severity, description, exercise?, patient_id?, patient_name?, protocol_type?}`. Validates `type` ∈ {adverse_reaction, pain_increase, injury, contraindication_missed, dosing_concern, safety_gate_failure, other}, `severity` ∈ {low, moderate, high, critical}, description ≥ 10 chars. Persists to `safety_events` with clinician attribution, IP, user-agent. 7-year retention per state board rules.
- `GET /api/safety-reports` — List safety events (admin only). Query: `limit`, `offset`, `patient_id`. Returns `{rows, total}`.

## Database

SQLite3 file-based (`k9_rehab_pro.db`). Key tables:

- `patients` — Patient records (client, breed, age, weight)
- `protocols` — Generated rehab protocols linked to patients
- `protocol_exercises` — Weekly exercise assignments per protocol
- `exercise_logs` — Exercise completion tracking
- `progress_assessments` — Clinical progress notes
- `exercises` — Exercise library (seeded from exercise-part files)
- `conditions` — Supported conditions
- `users` — Auth users with roles (clinician, admin)
- `safety_events` — Adverse event / safety concern reports (clinician-attributed, 7yr retention)

Auto-initializes with seed data on first run.

## Code Conventions

- Constants/codes use UPPER_CASE (e.g., `PROM_STIFLE`, `CCL_CONSERV`)
- Backend uses `module.exports` pattern
- Frontend components are React functional components
- Console logging uses emoji prefixes for visibility (e.g., `✅`, `❌`, `📚`)
- Error handling via try-catch with promise-based async
- Exercise files split across `exercises-part[1-10].js` for manageability
- Clinical data is NEVER hardcoded without source-of-truth validation

## Architecture Notes

- Protocol generation: ACVSMR-aligned 4-condition × 4-phase system with gated progression
- Phase progression: Acute Protection → Early Mobilization → Controlled Strengthening → Return to Function
- Frontend (`k9-rehab-frontend`): Single-page app with view state management in `App.js`
- Dashboard: 13 clinical blocks — Client, Diagnostics, Assessment (full Millis & Levine), Treatment, Metrics, Equipment, Home, Goals, Conditioning, Protocol Summary, Exercise Library, PetCare Nutrition, 3D Anatomy Viewer
- Multilingual: 10 locales with i18next, hospital language lock, safety strings English-locked
- Assessment: Full Millis & Levine framework — TPR vitals with auto-flagging, orthopedic exam (7 joints), neurological exam, gait analysis (Ch.9), pain scales (CSU/Helsinki/LOAD/FGS), functional assessment, special orthopedic tests, B.E.A.U. synthesis
- Block data indicators: dashboard cards show colored dots (green=complete, amber=partial) and checkmark badges when blocks contain data
- Clinician auto-fill: `global::Clinician Name` and `global::Nurse Assistant` propagate across all blocks
- B.E.A.U.: Streaming chat using Anthropic Claude API with clinical system prompt and patient context injection
- Auth: JWT with role-based access (clinician, admin). Public routes: health, login, register, auth status
- Security: Helmet headers, CORS restricted to localhost:3001, rate limiting (100 req/15min general, 5 req/15min auth)
- CORS origins configurable via `CORS_ORIGINS` (or `CORS_ORIGIN`) env var, comma-separated

### Storyboard System
- 215/215 exercises have auto-generated storyboards with breed-specific data
- `CATEGORY_BREED_MAP` assigns 19 real breeds by exercise category (e.g., TPLO→Labrador, IVDD→Dachshund)
- Each storyboard includes `breed_model` with breed name, weight, size, build, temperament
- `StoryboardPlayer` component renders frame-by-frame with breed photo/AI image, SVG overlay indicators
- Image generation: HF SDXL via `router.huggingface.co`, cached to `backend/storyboard-images/`
- Fallback: Dog.CEO API breed photos via `BREED_API_MAP` (19 breeds mapped to API paths)
- Frame viewer: 1:1 square aspect ratio, 50% width, centered

## Design Direction

- Target audience: Large corporations and veterinary rehab universities
- Theme: Medical-professional with subtle futuristic edge
- Color palette: Deep blue `#0F4C81`, Teal `#0EA5E9`, Green `#10B981`

## Environment Variables

Backend requires `.env` with:
- `JWT_SECRET` — Secret for JWT signing (generate with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
- `JWT_EXPIRES_IN` — Token expiry (default: 24h)
- `CORS_ORIGINS` (or `CORS_ORIGIN`) — Allowed frontend origins, comma-separated. Both spellings accepted. Falls back to a hardcoded Vercel+localhost allowlist in `backend/server.js` if unset.
- `ANTHROPIC_API_KEY` — Required for B.E.A.U. clinical assistant
- `HF_TOKEN` — Hugging Face API token for AI storyboard images (optional, falls back to Dog.CEO breed photos)
- `PORT` — Server port (default: 3000)
- `DEMO_MODE` — Set to `"true"` ONLY on hosts where a temporary, demo-only route must be reachable. Any route wrapped with `requireDemoMode` from `backend/demo-mode.js` returns 404 unless this env var is set. Never set in production. Startup logs a loud warning whenever this is true.

## Repo Hygiene Hooks

A pre-commit hook in `.githooks/pre-commit` blocks commits that reintroduce emergency-patch markers (`EMERGENCY DEMO PATCH`, `TODO: revert`) outside whitelisted paths (`.githooks/`, `.github/`, `CLAUDE.md`, `docs/`, `documentation/`). Activate once per clone:

```bash
npm run hooks:install
```

The same scan runs in CI via `.github/workflows/no-emergency-markers.yml` on every push/PR to `main`, so a bypassed local hook is caught before merge.

**Emergency hot-patch protocol:** if a temporary unsafe route is ever required (e.g. demo), wrap the handler with `requireDemoMode` from `backend/demo-mode.js` and set `DEMO_MODE=true` on the demo host only. The route is 404 elsewhere, so it cannot accidentally ship to production.
