# K9 Rehab Pro — Platform Specification

**Version:** 2.0
**Date:** February 2026
**Classification:** Technical Specification | Clinical Methodology | Architecture Reference
**Status:** Living Document

---

## Document Purpose

This specification serves as the single authoritative reference for the K9 Rehab Pro platform. It is designed for four audiences simultaneously:

| Audience | Primary Interest | Key Sections |
|----------|-----------------|--------------|
| **Clinicians & ACVSMR reviewers** | Clinical methodology, evidence base, safety gating | Parts I–II |
| **Developers & engineers** | Architecture, API, database, subsystems | Parts I, III |
| **Stakeholders & university partners** | Platform capabilities, roadmap, compliance | Parts I, IV–V |
| **Accreditation & regulatory bodies** | Clinical validation, audit trail, safety architecture | Parts II, IV |

All clinical data in this document originates from or has been validated against the source-of-truth document (`CanineRehabProtocols/canine_rehab_protocols.docx`). Zero tolerance for fabricated exercises, invented diagnoses, or hallucinated clinical data.

---

# PART I — EXECUTIVE OVERVIEW

## 1. Platform Identity & Mission

K9 Rehab Pro is a veterinary rehabilitation intelligence platform classified as a **Clinical Decision-Support System (CDSS)**. It generates structured, evidence-based canine rehabilitation protocols using deterministic logic mapped to peer-reviewed veterinary rehabilitation literature.

**Core principles:**

- **Clinician FIRST, engineer second, designer third** — every design decision prioritizes clinical accuracy
- **Evidence-based** — ACVSMR diplomate methodology, Millis & Levine textbook standards
- **Deterministic** — identical inputs always produce identical outputs; no randomization, no AI inference in protocol generation
- **Safety-gated** — five-layer safety enforcement prevents contraindicated exercise assignment
- **Auditable** — complete audit trail for all clinical actions, exportable for board investigations

**What K9 Rehab Pro is NOT:**

- Not a medical device
- Not a diagnostic tool
- Does not establish a veterinarian-client-patient relationship (VCPR)
- Does not replace licensed veterinary judgment
- All generated protocols require review and approval by a licensed veterinarian

**Target audience:** Large veterinary corporations, university rehabilitation programs, specialty rehabilitation hospitals.

## 2. System Metrics at a Glance

| Metric | Value | Verification |
|--------|-------|--------------|
| Condition Protocols | 4 | TPLO, IVDD, OA, Geriatric |
| Phases per Protocol | 4 | Gated progression (16 total phases) |
| Unique Protocol Exercise Codes | 52 | Verified via Feb 2026 audit (Rounds 1–2) |
| Full Exercise Database | 223 | After deduplication of 240+ raw entries |
| Evidence Citations | 235 | Mapped to Millis & Levine + secondary sources |
| Storyboards | 215 | Auto-generated with breed-specific models |
| Breed Models | 19 | Mapped to exercise categories |
| Contraindication Categories | 15 | Condition-keyword → exercise exclusion |
| Safety Gate Layers | 5 | Contraindications, WB status, incision, activity, clinical grading |
| Frontend Views | 8 | Dashboard, Clients, Generator, Exercises, Sessions, Settings, About, Welcome |
| Database Tables | 16 | Patients, protocols, exercises, sessions, audit, auth |
| API Endpoints | 40+ | Auth, clinical, exercises, patients, VetAI, storyboards, audit |
| Auth Roles | 2 | Clinician, Admin (JWT-based) |

## 3. Clinical Framework

The protocol engine is built on the foundational texts of veterinary rehabilitation medicine:

| Source | Role |
|--------|------|
| **Millis DL, Levine D.** *Canine Rehabilitation and Physical Therapy.* 2nd ed. Elsevier Saunders; 2014. | Primary evidence base — exercise selection, phase definitions, contraindications, outcome measures |
| **Zink MC, Van Dyke JB.** *Canine Sports Medicine and Rehabilitation.* 2nd ed. Wiley-Blackwell; 2018. | Supplementary — sport-specific rehabilitation, aquatic therapy rationale |
| **ACVSMR** position statements and clinical guidelines | Professional standards alignment |
| **Brown DC et al.** CBPI validation studies (Am J Vet Res, 2007; 2010) | Outcome measurement instruments |

Exercise selection, phase progression, contraindication rules, and outcome measures are sourced from these references. No exercise or clinical rule is fabricated. The source-of-truth document has undergone two formal audit rounds (16 fixes total) to ensure code-to-document alignment.

---

# PART II — CLINICAL ARCHITECTURE

## 4. Protocol System

### 4.1 Four Condition Protocols

| Protocol | Duration | Primary Indication | Routing Criteria |
|----------|----------|--------------------|-----------------|
| **TPLO Post-Surgical** | 16 weeks | Tibial plateau leveling osteotomy recovery | Stifle/knee conditions ONLY: TPLO, TTA, CCL, meniscal, patella |
| **IVDD Neurological** | 12 weeks | Intervertebral disc disease (conservative or post-surgical) | Spinal/neurological conditions: IVDD, disc herniation |
| **Osteoarthritis (OA)** | 16 weeks | Multimodal OA management | OA + hip surgeries (FHO/THR), fractures, polytrauma, general orthopedic |
| **Geriatric Mobility** | 16 weeks | Age-related mobility decline, sarcopenia | Age-related, mobility decline, senior, aging + amputation + palliative override |

### 4.2 Phase Structure (4 Phases per Protocol)

Each protocol contains 4 sequential phases with gated progression:

| Phase | Name | Clinical Focus |
|-------|------|----------------|
| **Phase 1** | Acute / Protection | Pain management, edema control, passive ROM, tissue healing |
| **Phase 2** | Early Mobilization | Active-assisted movement, gentle weight bearing, proprioceptive retraining |
| **Phase 3** | Controlled Strengthening | Progressive resistance, core stability, endurance building |
| **Phase 4** | Return to Function / Maintenance | Functional activities, sport-specific drills, lifelong maintenance |

Phase 4 for chronic conditions (OA, Geriatric) represents **lifelong maintenance** rather than discharge.

### 4.3 Phase Week Ranges

| Protocol | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|----------|---------|---------|---------|---------|
| TPLO (16 wk) | Weeks 0–2 | Weeks 2–6 | Weeks 6–12 | Weeks 12–16 |
| IVDD (12 wk) | Weeks 0–2 | Weeks 2–6 | Weeks 6–12 | Week 12+ |
| OA (16 wk) | Weeks 0–2 | Weeks 2–6 | Weeks 6–12 | Weeks 12–16 |
| Geriatric (16 wk) | Weeks 0–2 | Weeks 2–6 | Weeks 6–12 | Weeks 12–16 |

Phase boundaries use `>=` comparison to ensure exact boundary weeks enter the correct (next) phase.

### 4.4 Phase Progression Criteria

Phase transitions are **gated**, not time-based. Advancement requires documented achievement of phase-specific progression criteria:

| Transition | Required Criteria |
|------------|-------------------|
| Phase 1 → 2 | Pain controlled (≤3/10), incision healed, passive ROM within 80% of contralateral |
| Phase 2 → 3 | Consistent weight bearing, lameness grade ≤2/5 LOAD, active ROM normalized |
| Phase 3 → 4 | Functional strength restored, gait symmetry achieved, owner compliance confirmed |

The protocol engine assigns exercises to time-based week ranges but annotates progression criteria at each phase boundary. The supervising veterinarian determines when to advance based on clinical re-evaluation.

### 4.5 Protocol Routing Logic

Protocol selection is determined by condition keywords and treatment approach:

| Condition Category | Routes To | Rationale |
|-------------------|-----------|-----------|
| TPLO, TTA, CCL, meniscal, patella | TPLO Protocol | Stifle/knee-specific post-surgical rehab |
| FHO, THR, hip surgery | OA Protocol | Hip-focused orthopedic rehabilitation |
| Fractures, polytrauma | OA Protocol | General orthopedic rehabilitation |
| Amputation | Geriatric Protocol | Compensatory balance, quality of life |
| Any condition + palliative approach | Geriatric Protocol | Palliative override: comfort and maintenance |
| Age-related, mobility decline, senior, aging | Geriatric Protocol | Geriatric-specific mobility support |
| IVDD, disc herniation, spinal conditions | IVDD Protocol | Neurological rehabilitation |

## 5. Safety Gating System

The safety gating system is a five-layer enforcement mechanism that prevents assignment of clinically contraindicated exercises. It operates at intake validation (blocking/warning) and exercise selection (filtering).

### 5.1 Layer 1 — Condition-Based Contraindications

The `CONTRAINDICATION_MAP` scans five patient data fields (`contraindications`, `diagnosis`, `medicalHistory`, `medications`, `mobilityLevel`) for condition keywords. Matched keywords produce a `Set` of excluded exercise codes.

| Condition Keyword | Excluded Exercises | Clinical Rationale |
|-------------------|-------------------|-------------------|
| `cardiac` / `heart` | Aquatic therapy, treadmill, jogging | Hydrostatic pressure increases cardiac preload; aerobic exercise increases myocardial O2 demand |
| `respiratory` | All aquatic therapy | Water immersion increases respiratory effort via thoracic hydrostatic pressure |
| `seizure` / `epilepsy` | All aquatic therapy | Seizure during aquatic therapy creates drowning risk |
| `open wound` / `infection` | Aquatic therapy, pulsed ultrasound | Infection risk to open wounds; cross-contamination of pool water |
| `neoplasia` / `cancer` / `tumor` | Pulsed ultrasound, Class IV laser | May increase local blood flow and metabolic activity at tumor sites |
| `pregnant` | Ultrasound, NMES, TENS, PEMF, shockwave | Electrotherapy may affect fetal development; ultrasound near gravid uterus contraindicated |
| `pacemaker` | NMES, TENS, PEMF, shockwave | Electrical modalities may interfere with pacemaker function |
| `implant` | Shockwave, pulsed ultrasound | Energy reflection at metallic interfaces causes tissue damage |
| `non-ambulatory` | Treadmill, jogging, cavaletti, stairs, hill walking | Requires baseline ambulatory capacity |
| `fracture unstable` | Weight shifting, balance board, cavaletti, stairs | Unstable fractures require rigid immobilization |

### 5.2 Layer 2 — Weight-Bearing Status Gates

| Status | Code | Exercises Excluded | Allowed |
|--------|------|--------------------|---------|
| Non-Weight-Bearing | NWB | 53 exercises | Passive ROM + modalities only |
| Toe-Touch Weight-Bearing | TTWB | 27 exercises | No dynamic loading |
| Partial Weight-Bearing | PWB | 10 exercises | No plyometrics |
| Weight-Bearing As Tolerated | WBAT | None | All exercises |
| Full Weight-Bearing | FWB | None | All exercises |

### 5.3 Layer 3 — Incision Status Gates

| Status | Effect |
|--------|--------|
| Seroma | Blocks all aquatic exercises |
| Dehiscence | Blocks all aquatic exercises |
| Infection | Blocks all aquatic exercises |

### 5.4 Layer 4 — Activity Restriction Gates

| Restriction | Effect |
|-------------|--------|
| Crate rest required | Same exclusion set as NWB (53 exercises) — passive + modalities only |
| E-collar required | 10 exercises excluded (proprioception + aquatic blocked) |

### 5.5 Layer 5 — Clinical Grading Gates

| Clinical Parameter | Threshold | Effect |
|-------------------|-----------|--------|
| Pain Score | ≥ 8/10 | Auto-routes to palliative (Phase 1 only), no dead-end |
| MMT Grade | 0–1 | Phase 1 lock + NWB gates (severe weakness) |
| IVDD Grade | IV–V (Hansen) | Phase 1 lock (neurological support until improvement) |
| OA Grade | KL Grade 4 | 9 high-impact exercises excluded (stairs, trot, jog, hill climb) |
| Lameness Grade | 5/5 | Auto-applies NWB gates if no explicit WB status set |

### 5.6 Phase Fallback

If all exercises in the current phase are gated out by safety filters, the system falls back to the highest earlier phase that has available exercises. This ensures no protocol week is ever empty — the patient always receives the most advanced safe exercise set.

### 5.7 Intake Validation

The `validateIntake()` function checks 7 required fields and produces blocking errors or advisory warnings:

**Blocking Rules (prevent protocol generation):**

| Rule | Trigger |
|------|---------|
| Pain score ≥ 8/10 | Severe uncontrolled pain — stabilize before rehab |
| Absent deep pain perception | Grave neurological sign — immediate evaluation required |
| Post-op incision complications | Dehiscence, infection, open, draining — wound management first |

**Warning Rules (generate with caution flags):**

| Rule | Trigger |
|------|---------|
| Absent neurological function | Verify neuro status before weight-bearing |
| Lameness grade 5/5 | Restrict to passive/non-weight-bearing |
| Complication keywords in history | Seroma, implant failure, non-union, osteomyelitis — verify resolved |
| Future surgery date | Pre-surgical planning — verify timing |
| Treatment approach required | Surgical/Conservative/Palliative must be specified |

## 6. Exercise Library & Taxonomy

### 6.1 Library Overview

| Metric | Count |
|--------|-------|
| Total exercises (after deduplication) | 223 |
| Unique protocol exercise codes | 52 |
| Raw entries (before dedup) | 240+ |
| Semantic duplicates resolved | 14 |
| Exercise categories | 20+ |

Exercises are stored across 10 files (`exercises-part[1-10].js`) and aggregated by `all-exercises.js` with deduplication and medical-grade metadata enrichment via `exercise-enhancer.js`.

### 6.2 Classification Dimensions

Each exercise is classified across multiple dimensions:

| Dimension | Values |
|-----------|--------|
| **Intervention Type** | Passive, Active-Assisted, Active, Strengthening, Neuromuscular, Aquatic, Manual Therapy, Modalities, Functional |
| **Phase Appropriateness** | Phase 1–4 (mapped per protocol) |
| **Evidence Grade** | A (strong RCT), B (moderate), C (limited), EO (expert opinion) |
| **Difficulty Level** | Easy, Moderate, Advanced |
| **Equipment Requirements** | Aquatic access flag, 9 individual modality flags, specialized equipment |
| **Domain** | Mobility, Weight Bearing, Core, Balance, Gait, Endurance, Functional, Athletic |
| **Tier** | Passive → Fully Assisted → Low Load Active → Moderate Resistance → Athletic |

### 6.3 Exercise Selection Algorithm

For each protocol week:

1. Determine the current phase based on week number and protocol type
2. Retrieve the full exercise list defined for that phase
3. Apply 5-layer safety gating (contraindications → WB → incision → activity → clinical grading)
4. Apply equipment gating (aquatic access OR individual modality flags)
5. Apply phase fallback if all exercises gated out
6. Attach evidence citations per exercise code
7. Return the filtered, annotated exercise list

The selection is **fully deterministic**: identical inputs always produce identical outputs.

### 6.4 Equipment Gating

Clinics declare available equipment. Exercises are excluded if the clinic lacks required resources:

- **Aquatic access**: Checks `aquaticAccess` OR `modalityUWTM` flags
- **Modalities** (9 independent flags): Laser, TENS, NMES, Ultrasound (pulsed), PEMF, Shockwave, Cryotherapy, Thermotherapy, Ultrasound (continuous)

Equipment gating is independent of patient safety gates — both must pass for an exercise to be included.

## 7. Evidence & Citation System

### 7.1 Evidence Grading

| Grade | Description | Source Standard |
|-------|-------------|-----------------|
| **A** | Strong evidence from RCTs or systematic reviews | Millis & Levine Ch. 1 |
| **B** | Moderate evidence from controlled or cohort studies | Millis & Levine Ch. 1 |
| **C** | Limited evidence from case series or expert consensus | Millis & Levine Ch. 1 |
| **EO** | Expert opinion based on clinical experience and physiologic rationale | ACVSMR position statements |

### 7.2 Citation Coverage

All 52 protocol exercise codes have mapped evidence citations. The `EXERCISE_EVIDENCE_MAP` links each code to:

- **Primary citation**: Millis & Levine chapter and topic reference
- **Secondary citations** (where available): Zink & Van Dyke, Pryor & Millis, Holler et al., Johnson et al.

The `CORE_REFERENCES` object contains 20+ journal articles and clinical protocols with full bibliographic data, DOIs, and URLs.

### 7.3 Counts

| Item | Count |
|------|-------|
| Protocol codes with evidence | 52/52 (100%) |
| Total evidence entries | 235 |
| Core reference sources | 20+ |

## 8. Outcome Measures

### 8.1 Canine Brief Pain Inventory (CBPI)

The platform implements the validated CBPI instrument:

- **Pain Severity Scale (PSS):** 4 items (worst, least, average, current), each 0–10
- **Pain Interference Scale (PIS):** 6 items (activity, enjoyment, rising, walking, running, climbing), each 0–10
- **Computed Scores:** PSS = mean of 4 severity items; PIS = mean of 6 interference items

**Reference:** Brown DC, Boston RC, Coyne JC, Farrar JT. Am J Vet Res. 2007;68(6):631-637.

### 8.2 Additional Clinical Measures

| Measure | Method |
|---------|--------|
| SOAP Documentation | Subjective, Objective, Assessment, Plan per session |
| Pain Scoring | Pre/post session VAS (0–10) |
| Lameness Grading | LOAD scale (0–5) |
| Range of Motion | Joint-specific flexion/extension in degrees |
| Girth Measurements | Circumferential at standardized sites (muscle atrophy monitoring) |
| Weight-Bearing Status | NWB → TTWB → PWB → WBAT → FWB |
| Manual Muscle Testing | MMT 0–5 scale |

## 9. Source-of-Truth Audit Trail

The protocol engine has undergone two formal audit rounds against the source-of-truth document to ensure 100% code-to-document alignment.

### 9.1 Round 1 — 7 Fixes

| Fix | Protocol/Phase | Change |
|-----|---------------|--------|
| 1 | TPLO P4 | Added FETCH_CONTROLLED, STAIR_DESCEND, JOG_LEASH, LAND_TREADMILL |
| 2 | IVDD P4 | Added DIAGONAL_WALK replacing UNEVEN_TERRAIN |
| 3 | OA P4 | SLOW_TROT → LAND_TREADMILL |
| 4 | Geriatric P4 | Removed unauthorized MYOFASC_ILIO |
| 5 | TPLO P1 | Added PROM_STIFLE_SPEC |
| 6 | TPLO P2 | Added WEIGHT_SHIFT_CC |
| 7 | OA P2 | Added WEIGHT_SHIFT_CC |

### 9.2 Round 2 — 9 Moderate Fixes (M1–M9)

| Fix | Change | Scope |
|-----|--------|-------|
| M1/M2 | OA P2 name: "Active Joint Protection" → "Progressive Mobility" + goal text update | OA Phase 2 |
| M3 | MYOFASC_ILIO → STRETCH_ILIO | OA P1/P2, Geriatric P1/P2 |
| M4 | WOBBLE_BOARD_ADV → ROCKER_BOARD | OA P3 |
| M5 | PERTURBATION_ADV → TRAMPOLINE_STAND | Geriatric P3 |
| M6 | STEP_OVER → LADDER_WALK | IVDD P3, Geriatric P3 |
| M7 | BOSU_STAND → BOSU_HIND (TPLO P3) + BOSU_FRONT (IVDD P3) | TPLO P3, IVDD P3 |
| M8 | CAVALETTI_VAR → CAVALETTI_ELEV (TPLO P3) + CAVALETTI_WEAVE (TPLO P4) | TPLO P3/P4 |
| M9 | 12 new evidence citations added (10 new codes + 2 missing) | Evidence system |

**Post-audit status:** 8 new exercise definitions added, safety gating updated for all new codes, verified: **52 unique protocol codes, 223 exercises, 235 evidence entries**.

---

# PART III — TECHNICAL ARCHITECTURE

## 10. System Architecture Overview

```
┌─────────────────────────┐     ┌──────────────────────────┐
│   React 19 Frontend     │     │   External Services       │
│   (CRA, Port 3001)      │────▶│                          │
│                          │     │  Anthropic Claude API    │
│  8 Views / 5-Step Wizard │     │  (VetAI streaming chat)  │
│  CSS-in-JS Styling       │     │                          │
│  Axios HTTP Client       │     │  Hugging Face SDXL       │
└──────────┬──────────────┘     │  (storyboard images)     │
           │ HTTP/JSON                                      │
           │ SSE (VetAI)        │  Dog.CEO API              │
           ▼                    │  (breed photo fallback)   │
┌──────────────────────────┐    └──────────────────────────┘
│   Express.js Backend     │
│   (Port 3000)            │
│                          │
│  Protocol Generator      │
│  Safety Gating Engine    │
│  Exercise Library (223)  │
│  Evidence Citations      │
│  Storyboard System       │
│  JWT Auth + RBAC         │
│  Audit Logging           │
│  Rate Limiting           │
└──────────┬──────────────┘
           │
           ▼
┌──────────────────────────┐
│   SQLite3 Database       │
│   (k9_rehab_pro.db)     │
│                          │
│  16 Tables               │
│  Auto-seeded on startup  │
│  File-based, local-only  │
└──────────────────────────┘
```

### Technology Stack

| Layer | Technology | Version/Notes |
|-------|-----------|---------------|
| **Backend Runtime** | Node.js + Express.js 4.x | Port 3000 |
| **Database** | SQLite3 | File-based (`k9_rehab_pro.db`), auto-initialized |
| **Frontend Framework** | React 19 | Create React App (react-scripts), Port 3001 |
| **Authentication** | JWT | jsonwebtoken + bcryptjs, role-based |
| **Security** | Helmet | Security headers middleware |
| **Rate Limiting** | express-rate-limit | 100 req/15min general, 5 req/15min auth |
| **CORS** | cors | Restricted to `CORS_ORIGIN` (default: localhost:3001) |
| **AI Integration** | Anthropic SDK | claude-sonnet-4-20250514 for VetAI |
| **Image Generation** | Hugging Face Inference | SDXL model, cached to disk |
| **Breed Photos** | Dog.CEO API | 19 breeds mapped, fallback for storyboard images |
| **Document Parsing** | Mammoth | .docx source-of-truth ingestion |

## 11. Backend Architecture

### 11.1 Server Configuration (`backend/server.js`)

**Middleware stack (in order):**
1. Helmet — security headers
2. CORS — origin restriction
3. Rate limiting (general) — 100 requests per 15 minutes
4. Rate limiting (auth) — 5 requests per 15 minutes
5. JSON body parser — 1MB limit
6. Audit logging — all POST/PUT/DELETE to `/api/*`

### 11.2 Protocol Generator (`backend/protocol-generator.js`)

The core clinical engine. Accepts a structured intake form and produces a week-by-week exercise protocol.

**Input:** Patient demographics, diagnosis, clinical status, equipment availability, treatment approach
**Output:** Weekly exercise assignments with evidence citations, phase labels, progression criteria, safety warnings

**Key functions:**
- `generateProtocol(formData)` — Main entry point
- `validateIntake(formData)` — 7-field validation + blocking/warning rules
- `selectExercisesForWeek(week, protocol, phase, formData)` — Per-week exercise selection with 5-layer safety gating
- `getExcludedCodes(formData)` — Contraindication keyword scanning
- `applyWeightBearingGates(exercises, wbStatus)` — WB status filtering
- `applyIncisionGates(exercises, incisionStatus)` — Incision status filtering
- `applyActivityGates(exercises, restrictions)` — Crate rest / e-collar filtering
- `applyClinicalGradingGates(exercises, gradingData)` — MMT, IVDD, OA grading

### 11.3 Exercise System

**File structure:**
- `exercises-part[1-10].js` — 10 files containing exercise definitions
- `all-exercises.js` — Aggregator with dedup (14 semantic duplicates resolved)
- `exercise-enhancer.js` — Medical-grade metadata enrichment
- `exercise-taxonomy.js` — Intervention types, phases, indications
- `evidence-references.js` — Exercise code → citation mapping (235 entries)
- `protocol-rules.js` — Phase-condition → exercise code mappings

### 11.4 Database Schema (`backend/database.js`)

16 tables, auto-initialized with seed data on first run:

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `patients` | Patient records | patient_id, client_name, breed, age, weight |
| `protocols` | Generated rehab protocols | protocol_id, patient_id, diagnosis, status |
| `protocol_exercises` | Weekly exercise assignments | protocol_id, week_number, exercise_id, dosage |
| `exercise_logs` | Completion tracking | protocol_id, exercise_id, completed_date, pain_level_post |
| `progress_assessments` | Clinical assessment notes | week_number, pain_level, ROM, gait_quality |
| `sessions` | Therapy session records | patient_id, pre_session_pain, post_session_lameness |
| `session_exercises` | Exercise performance per session | session_id, sets, reps, assistance_level |
| `audit_log` | Compliance logging | timestamp, action, resource_type, user_label, ip_address |
| `users` | Auth users with roles | username, password_hash, role (clinician/admin) |
| `exercises_v2` | Exercise library v2 | name, domain, category |
| `exercise_phases_v2` | Phase assignments (junction) | exercise_id, phase_id |
| `exercise_tiers_v2` | Tier assignments (junction) | exercise_id, tier_id |
| `domains` | Exercise domains (8) | name, description |
| `phases` | Rehabilitation phases (5) | name |
| `tiers` | Exercise tiers (5) | name |
| `conditions` | Supported conditions | name, category |

## 12. Authentication & Authorization (`backend/auth.js`)

### 12.1 JWT Implementation

- **Token generation:** `generateToken()` signs with `JWT_SECRET`, expires per `JWT_EXPIRES_IN` (default: 24h)
- **Token verification:** `verifyToken()` validates signature and expiration
- **Password security:** bcryptjs async hashing via `verifyPassword()`

### 12.2 Middleware

- **`requireAuth()`** — Mandatory on protected routes; pass-through on public routes (health, login, register, auth/status)
- **`requireRole(role)`** — Enforces role-based access; returns 403 if insufficient privileges

### 12.3 Roles

| Role | Permissions |
|------|------------|
| **clinician** | Generate protocols, manage patients, record sessions, view exercises |
| **admin** | All clinician permissions + bulk delete, audit log purge, user management |

### 12.4 Public Routes (no auth required)

- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/status`

## 13. VetAI Clinical Assistant

### 13.1 Architecture

The VetAI system is an AI-powered clinical decision support chat interface that operates alongside (not replacing) the deterministic protocol generator.

- **Model:** claude-sonnet-4-20250514 (Anthropic)
- **Max tokens:** 4,096
- **Streaming:** Server-Sent Events (SSE) via `Content-Type: text/event-stream`
- **Source-of-truth injection:** Complete `canine_rehab_protocols.docx` content injected on every request

### 13.2 Four-Block Prompt Architecture

| Block | Content | Purpose |
|-------|---------|---------|
| **Block 1** | System Identity & Clinical Framework | ACVSMR-level CDSS, conservative bias, no diagnosis/override, mandatory 7-section response structure |
| **Block 2** | Structured Intake Data Template | Patient fields: breed, age, weight, diagnosis, surgery, neuro grade, pain, WB status, medications, environment |
| **Block 3** | Rehabilitation Phase Definitions | Phase I–IV with gating criteria, 0–14 day → return-to-function progression |
| **Block 4** | Mandatory Disclaimer | "This rehabilitation plan is for professional veterinary use only and does not replace licensed veterinary evaluation." |

### 13.3 Mandatory Response Structure

Every VetAI response follows this 7-section format:

1. Case Classification
2. Risk Flag Analysis
3. Rehabilitation Phase Assignment
4. Structured Exercise Protocol Table (Exercise | Sets | Reps | Frequency | Surface | Contraindications | Progression Trigger)
5. Progression Criteria
6. Monitoring & Red Flags
7. Owner-Friendly Summary

### 13.4 Safety Principles

- Progressive overload adapted to canine physiology
- Tissue healing timeline awareness
- Neurologic grading logic
- Load management
- Biomechanical compensation awareness
- Conservative progression bias
- Missing information triggers clarification request before plan generation
- Red flags trigger explicit veterinary reassessment recommendation

## 14. Storyboard & Image Generation System

### 14.1 Coverage

215 of 215 exercises have auto-generated storyboards with breed-specific data.

### 14.2 Breed Model System

The `CATEGORY_BREED_MAP` assigns 19 real dog breeds to exercise categories based on clinical relevance:

| Category | Breed | Weight | Build |
|----------|-------|--------|-------|
| Athletic Foundations | Belgian Malinois | 55 lbs | Athletic, muscular |
| Neurological Rehab | Dachshund | 18 lbs | Elongated trunk, short limbs |
| Hydrotherapy | Golden Retriever | 68 lbs | Well-proportioned |
| Geriatric Care | German Shepherd | 78 lbs | Sloping hindquarters |
| Aquatic Therapy | Newfoundland | 120 lbs | Massive, webbed paws |
| Palliative Care | Bernese Mountain Dog | 95 lbs | Heavy-boned, broad |

Each breed model includes: breed name, weight (lbs), size class, build description, temperament, and category assignment.

### 14.3 Image Generation Pipeline

1. **Primary:** Hugging Face SDXL via `router.huggingface.co` — AI-generated exercise images
2. **Caching:** Generated images cached to `backend/storyboard-images/` (persistent)
3. **Fallback:** Dog.CEO API breed photos via `BREED_API_MAP` (19 breeds mapped)
4. **Frame viewer:** 1:1 square aspect ratio, 50% viewport width, centered, SVG overlay indicators

### 14.4 Storyboard Structure

Each storyboard includes:
- Frame-by-frame exercise demonstration
- Breed-specific patient model
- `StoryboardPlayer` component with play/pause, frame navigation
- SVG overlay indicators for key positions and movements

## 15. Frontend Architecture

### 15.1 Technology

- **Framework:** React 19 via Create React App (react-scripts)
- **Port:** 3001
- **Architecture:** Single-page application with view state management in `App.js`
- **HTTP Client:** Axios
- **Styling:** CSS-in-JS via `S` styles object (no external CSS framework)

### 15.2 Views (8 Total)

| View | Description |
|------|-------------|
| **Welcome** | Onboarding splash screen, triggers generator entry |
| **Dashboard** | Patient/exercise stats, condition distribution, API health check |
| **Clients** | Patient CRUD: create, search, list, delete |
| **Generator** | 5-step protocol wizard (patient → diagnosis → equipment → review → export) |
| **Exercises** | Full exercise library with search/filter by category, phase, difficulty |
| **Sessions** | Therapy session tracking and progress logging |
| **Settings** | Clinic branding (name, accent color), modality flags, environment config |
| **About** | Platform info, compliance disclaimers |

### 15.3 Protocol Generator Wizard (5 Steps)

| Step | Input |
|------|-------|
| **Step 1** | Patient info: name, breed, age, weight, sex |
| **Step 2** | Diagnosis, clinical status, treatment approach, pain, WB status, neuro, medications |
| **Step 3** | Modality/equipment availability (9 modalities + aquatic access) |
| **Step 4** | Generated protocol review with per-week exercise assignments |
| **Step 5** | Export/save options |

### 15.4 Design System

| Element | Specification |
|---------|---------------|
| Primary Navy | `#0F4C81` |
| Teal Accent | `#0EA5E9` |
| Green Success | `#10B981` |
| Red Alert | `#FF6B6B` |
| Typography | System font stack |
| Animations | EKG scroll (neon green flatline), hover state transitions |
| Cards | Rounded corners, shadow, consistent padding |
| Buttons | 4 variants: primary, secondary, success, danger |
| Badges | 3 color variants for status indicators |

---

# PART IV — SECURITY & COMPLIANCE

## 16. Current Security Posture

| Component | Status | Implementation |
|-----------|--------|----------------|
| Authentication | **Active** | JWT (jsonwebtoken + bcryptjs), 24h token expiry |
| Authorization / RBAC | **Active** | 2 roles (clinician, admin) with middleware enforcement |
| Data Storage | **Active** | SQLite file-based, local filesystem only |
| Encryption at Rest | Planned | SQLCipher integration for AES-256 |
| Encryption in Transit | Planned | TLS 1.3 for production deployment |
| Security Headers | **Active** | Helmet middleware |
| CORS | **Active** | Restricted to configured frontend origin |
| Rate Limiting | **Active** | 100 req/15min general, 5 req/15min auth |
| Audit Logging | **Active** | All POST/PUT/DELETE logged with timestamp, action, user, IP, status |
| Audit Export | **Active** | CSV export for board investigations |
| Data Sharing | **None** | All data remains local — zero external transmission |
| AI Data Policy | **Active** | No user data used for AI training; VetAI source-of-truth is injected per-request (stateless) |
| Backups | Planned | Automated encrypted backup with configurable schedule |

## 17. Data Privacy Architecture

**Key guarantees:**

- No patient or client data leaves the local machine
- No data is transmitted to Anthropic, OpenAI, or any AI provider for training
- No data is sold to or shared with third parties
- No data is used for advertising, analytics, or model training
- All clinical logic runs locally via deterministic algorithms
- VetAI chat sends only the current conversation + source-of-truth to Claude API (no patient data stored by Anthropic)

**Data flow:**

```
[Clinician Browser] ←→ [Express.js API :3000] ←→ [SQLite database.db]
         │                       │
    [Local Only]          [Audit Log Table]
         │                       │
  No external APIs        CSV Export for
  (except VetAI chat)     Board Investigations
```

## 18. Compliance Alignment

### 18.1 HIPAA Framework

HIPAA does not legally govern veterinary medicine. K9 Rehab Pro is designed with HIPAA-aligned principles as a best-practice standard:

| HIPAA Safeguard | K9 Rehab Pro Status |
|-----------------|---------------------|
| Access Controls | **Active** (JWT + RBAC) |
| Audit Controls | **Active** (audit_log table, CSV export) |
| Transmission Security | Planned (TLS 1.3) |
| Encryption at Rest | Planned (AES-256 via SQLCipher) |
| Integrity Controls | **Active** (deterministic logic, audit trail) |

### 18.2 State Veterinary Medical Board Compliance

- **Recordkeeping:** Configurable data retention (3–10 years, default 7 years)
- **Audit Trail:** All protocol generation, patient modifications, and data access logged
- **Export:** Audit logs exportable as CSV for board investigations
- **Purge:** Explicit purge endpoint (admin only) for retention enforcement

## 19. Audit System

### 19.1 Logged Events

All HTTP requests using POST, PUT, or DELETE methods to `/api/*`:

| Field | Description |
|-------|-------------|
| `timestamp` | UTC timestamp |
| `action` | HTTP method + path |
| `resource_type` | API resource category |
| `user_label` | User identifier |
| `ip_address` | Client IP |
| `request_method` | HTTP method |
| `request_path` | Full request URL |
| `status_code` | HTTP response status |
| `detail` | Success/error message |

### 19.2 Retention & Export

- Default retention: 7 years (configurable)
- No automatic deletion — purge must be explicitly triggered (admin only)
- Export: `GET /api/audit-log/export` → CSV with all fields
- File naming: `k9_rehab_audit_log_YYYY-MM-DD.csv`

---

# PART V — ROADMAP & PROPOSALS

## 20. Frontend Modernization

### 20.1 Current State

- React 19 via Create React App (react-scripts)
- Monolithic `App.js` (~5,800 lines, 15+ components)
- CSS-in-JS inline styles
- No TypeScript

### 20.2 In-Progress Migration

A CRA → Vite migration has been initiated (`k9-rehab-frontend/vite.config.js` exists). Current status:

- Vite config created
- `index.jsx` entry point modified
- Package.json updated
- **Not yet complete** — CRA tooling still primary

### 20.3 Proposed Modernization Path

**Phase A: Component Splitting**
- Extract views from monolithic App.js into separate component files
- Introduce React Context for shared state (brand, auth, settings)
- Add PropTypes/interfaces for all component props

**Phase B: Vite + TypeScript Migration**
- Complete CRA → Vite migration
- Migrate to TypeScript (.tsx)
- Add path aliases and module resolution

**Phase C: Design System**
- Extract CSS-in-JS styles to design tokens
- Component library with consistent API
- Responsive/mobile support

## 21. Database Migration Proposal

### 21.1 Current: SQLite3

- File-based (`k9_rehab_pro.db`)
- Single-user, single-connection
- No encryption at rest
- No concurrent access support
- Auto-initialized with seed data

### 21.2 Proposed: Supabase (PostgreSQL)

| Capability | SQLite (Current) | Supabase (Proposed) |
|------------|-------------------|---------------------|
| Concurrent access | Single connection | Unlimited |
| Multi-user | Not supported | Native |
| Encryption at rest | None | AES-256 (managed) |
| Real-time subscriptions | None | Native |
| Row-level security | None | Policy-based |
| Backups | Manual | Automated |
| Hosting | Local file | Cloud or self-hosted |
| Auth integration | Custom JWT | Supabase Auth (OAuth, MFA) |

Supabase configuration exists at `supabase/` (archived). Migration would require:
1. Schema migration (16 tables → PostgreSQL DDL)
2. Data migration tooling
3. API layer update (raw SQL → Supabase client or Prisma ORM)
4. Auth migration (custom JWT → Supabase Auth)
5. Environment configuration (connection strings, API keys)

## 22. Enterprise Deployment Proposal

### 22.1 Docker Containerization

```
docker-compose.yml
├── frontend (React, nginx)
├── backend (Express.js, Node.js)
├── database (PostgreSQL / Supabase)
└── reverse-proxy (nginx, TLS termination)
```

### 22.2 CI/CD Pipeline

- GitHub Actions for automated build, test, deploy
- Environment-based configuration (development, staging, production)
- API versioning (v1/v2 prefix)

### 22.3 White-Label Theming

- Per-deployment branding configuration (clinic name, logo, accent color)
- Theme tokens stored in database or environment
- Frontend reads theme on initialization

## 23. Clinical Expansion Opportunities

| Opportunity | Scope | Effort |
|-------------|-------|--------|
| Feline rehabilitation protocols | New species, new source-of-truth | Major |
| Equine rehabilitation protocols | New species, new source-of-truth | Major |
| Additional canine protocols (e.g., soft tissue, neurological beyond IVDD) | Extend existing engine | Moderate |
| Telerehabilitation support | Video integration, remote monitoring | Moderate |
| Outcome analytics dashboard | Longitudinal data visualization, CBPI trends | Moderate |
| Multi-language support | i18n framework for UI and clinical content | Moderate |

---

# PART VI — APPENDICES

## Appendix A — API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Required | Current user info |
| GET | `/api/auth/status` | Public | Auth system status |

### Clinical Core
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | Public | Health check |
| GET | `/api/conditions` | Required | All conditions |
| GET | `/api/conditions/grouped` | Required | Conditions by category |
| POST | `/api/generate-protocol` | Required | Generate rehab protocol |

### Exercise Library
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/exercises` | Required | All exercises with full details |
| GET | `/api/exercises/search?q=` | Required | Search exercises |
| GET | `/api/exercises/:code` | Required | Single exercise by code |
| GET | `/api/exercises/by-intervention/:type` | Required | Filter by intervention type |
| GET | `/api/exercises/by-phase/:phase` | Required | Filter by rehab phase |
| GET | `/api/exercises/by-indication/:indication` | Required | Filter by indication |
| GET | `/api/exercises/by-evidence-grade/:grade` | Required | Filter by evidence grade |
| GET | `/api/taxonomy` | Required | Full taxonomy |

### Patients
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/patients` | Required | List patients |
| POST | `/api/patients` | Required | Create patient |
| DELETE | `/api/patients/:id` | Required | Delete patient |
| POST | `/api/patients/delete-batch` | Admin | Bulk delete |

### Videos & Storyboards
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/videos/:exerciseCode` | Required | Videos for exercise |
| GET | `/api/instructors` | Required | All instructors |
| GET | `/api/instructors/:id` | Required | Instructor details |
| GET | `/api/video-transcripts/:exerciseCode` | Required | Video transcripts |
| GET | `/api/exercises/with-videos` | Required | Exercises with videos |
| GET | `/api/videos/by-instructor/:id` | Required | Videos by instructor |
| GET | `/api/videos/stats` | Required | Video library stats |
| GET | `/api/storyboards` | Required | All storyboards |
| GET | `/api/storyboards/stats` | Required | Storyboard statistics |
| GET | `/api/storyboards/:exerciseCode` | Required | Storyboard for exercise |
| GET | `/api/storyboards/:exerciseCode/frames` | Required | Storyboard frames |
| GET | `/api/storyboards/:exerciseCode/script` | Required | Storyboard script |

### Storyboard Images
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/storyboard-images/:exerciseCode/:frameNumber` | Required | Generate or serve cached image |
| GET | `/api/storyboard-images/:exerciseCode` | Required | List cached images |

### V1 Exercise Library
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/exercises` | Required | Paginated exercise list |
| GET | `/api/v1/exercises/:id` | Required | Exercise by ID |
| GET | `/api/v1/domains` | Required | Exercise domains |
| GET | `/api/v1/phases` | Required | Exercise phases |
| GET | `/api/v1/tiers` | Required | Exercise tiers |
| POST | `/api/v1/programs/generate` | Required | Generate program |
| GET | `/api/v1/programs/conditions` | Required | Available conditions |
| GET | `/api/v1/programs/conditions/:condition/phases` | Required | Phases for condition |

### VetAI Clinical Assistant
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/vet-ai/chat` | Required | Streaming AI chat (SSE) |
| GET | `/api/vet-ai/status` | Required | VetAI configuration status |

### Audit Log
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/audit-log` | Required | View audit log |
| GET | `/api/audit-log/stats` | Required | Audit statistics |
| GET | `/api/audit-log/export` | Required | CSV export |
| DELETE | `/api/audit-log/purge` | Admin | Purge audit log |

## Appendix B — Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | Yes | — | Secret for JWT signing |
| `JWT_EXPIRES_IN` | No | `24h` | Token expiry duration |
| `CORS_ORIGIN` | No | `http://localhost:3001` | Allowed frontend origin |
| `ANTHROPIC_API_KEY` | Yes* | — | Required for VetAI (* optional if VetAI not used) |
| `HF_TOKEN` | No | — | Hugging Face API token for storyboard images (falls back to Dog.CEO) |
| `PORT` | No | `3000` | Server port |

## Appendix C — Developer Quickstart

```bash
# 1. Clone the repository
git clone <repository-url>
cd k9-rehab-pro

# 2. Backend setup
cd backend
npm install
cp .env.example .env   # Configure JWT_SECRET and ANTHROPIC_API_KEY
node server.js          # Starts on port 3000, auto-creates database

# 3. Frontend setup (new terminal)
cd k9-rehab-frontend
npm install
npm start               # Starts on port 3001

# 4. Access
# Frontend:  http://localhost:3001
# Backend:   http://localhost:3000/api
# Health:    http://localhost:3000/api/health
```

**Key development notes:**
- Database auto-initializes with seed data on first `node server.js`
- Exercise library loads from `exercises-part[1-10].js` → `all-exercises.js`
- Clinical data must NEVER be hardcoded without source-of-truth validation
- Constants/codes use UPPER_CASE (e.g., `PROM_STIFLE`, `CCL_CONSERV`)
- Console logging uses emoji prefixes for visibility

## Appendix D — References

1. Millis DL, Levine D. *Canine Rehabilitation and Physical Therapy.* 2nd ed. St. Louis, MO: Elsevier Saunders; 2014.
2. Zink MC, Van Dyke JB. *Canine Sports Medicine and Rehabilitation.* 2nd ed. Ames, IA: Wiley-Blackwell; 2018.
3. Brown DC, Boston RC, Coyne JC, Farrar JT. Development and psychometric testing of an instrument designed to measure chronic pain in dogs with osteoarthritis. *Am J Vet Res.* 2007;68(6):631-637.
4. Brown DC, Boston RC, Farrar JT. Use of an activity monitor to detect response to treatment in dogs with osteoarthritis. *J Am Vet Med Assoc.* 2010;237(1):66-70.
5. ACVSMR Position Statements on Canine Rehabilitation Standards.
6. Levine D, Bockstahler B. Multimodal management of canine osteoarthritis. In: Millis DL, Levine D, eds. *Canine Rehabilitation and Physical Therapy.* 2nd ed. Elsevier; 2014.
7. Pryor B, Millis DL. Therapeutic laser in veterinary medicine. *Vet Clin North Am Small Anim Pract.* 2015;45(1):45-56.

---

*This document is the master specification for the K9 Rehab Pro platform. It supersedes individual enterprise documents where discrepancies exist. Maintained as a living document — version history tracked via git.*

*Last audit verification: February 2026 — 52 unique protocol codes, 223 exercises, 235 evidence entries, 215 storyboards.*
