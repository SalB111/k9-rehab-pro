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

1. **Exercise Library Lock**: Every exercise referenced in protocol output or B.E.A.U. responses MUST match an exercise code in the 223-exercise library. Any unmatched exercise name = blocked output + clinician alert. No exceptions.
2. **Dosing from Source Only**: Sets, reps, duration, frequency, and intensity parameters MUST be extracted from the source-of-truth document. B.E.A.U. must NOT generate novel dosing. If the source doc doesn't specify dosing for an exercise, output "Dosing: Per clinician assessment" — never fabricate numbers.
3. **No Invented Clinical Data**: Exercise descriptions, contraindications, indications, evidence grades, and phase assignments must trace to source documents. If a value cannot be sourced, it must be flagged as `[UNVERIFIED]` and excluded from clinical output.
4. **B.E.A.U. Post-Generation Verification**: Every B.E.A.U. response that references exercises must be cross-checked against the exercise database before delivery to the clinician. Novel exercise names trigger a block.
5. **Confidence Transparency**: When B.E.A.U. synthesizes recommendations (vs. quoting source material directly), the output must indicate this distinction. Never present AI synthesis as sourced fact.
6. **No Speculative Prognosis**: B.E.A.U. must never predict outcomes, timelines to recovery, or success rates unless directly quoting published literature with citation.

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
- PetCare Nutrition dashboard block with Mars PetCare diet recommendations
- Clinician roster + staff roster management in Settings → Clinic Configuration
- Hospital language lock system (admin-controlled)

## Implementation Tiers

Features and safety measures are prioritized into implementation tiers:

### TIER 1 — Required before clinical use
- [ ] Credential verification at registration (DVM/CCRP/CCRT/student attestation)
- [ ] Scope-of-practice enforcement in B.E.A.U. (block out-of-scope queries)
- [ ] B.E.A.U. exercise name cross-check against 223-exercise library
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
- `GET /api/audit-log` — View audit log
- `GET /api/audit-log/stats` — Audit statistics
- `GET /api/audit-log/export` — Export audit log
- `DELETE /api/audit-log/purge` — Purge audit log (admin only)

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
- CORS origin configurable via `CORS_ORIGIN` env var

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
- `CORS_ORIGIN` — Allowed frontend origin (default: http://localhost:3001)
- `ANTHROPIC_API_KEY` — Required for B.E.A.U. clinical assistant
- `HF_TOKEN` — Hugging Face API token for AI storyboard images (optional, falls back to Dog.CEO breed photos)
- `PORT` — Server port (default: 3000)
