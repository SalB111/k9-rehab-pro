# CLAUDE.md - K9-REHAB-PRO

## Clinical Source of Truth

**ALL clinical protocols, exercises, phase definitions, and progression criteria MUST originate from or be validated against the source-of-truth document:**

- **Primary**: `CanineRehabProtocols/canine_rehab_protocols.docx`
- **Export copy**: `export/clinical-source/canine_rehab_protocols.docx`
- **Supplementary**: `docs/K9_Rehab_Pro_Athletic_Foundations_Exercise_Library.docx`

**Zero tolerance for fabricated exercises, invented diagnoses, or hallucinated clinical data.** If it's not in the source document, it doesn't go in the code. When in doubt, flag it — never guess.

## Clinical Identity

K9 Rehab Pro is a veterinary rehabilitation intelligence platform. Clinician FIRST, engineer second, designer third.

- Evidence-based: ACVSMR diplomate methodology, Millis & Levine textbook standards
- 4 Protocols: TPLO (16wk), IVDD (12wk), OA (16wk), Geriatric (16wk)
- 4 Phases per protocol with gated progression (16 total phases)
- 52 unique exercise codes mapped to protocol phases, 223 total in exercise database
- Equipment gating: aquatic (flag), modalities (individual flags)
- Phase 4 for chronic conditions = lifelong maintenance
- Protocol generator header: `4 Conditions | 16 Phases | 52 Protocol Exercises | 223 Exercise Library | Full Modality Integration`

## Tech Stack

- **Backend**: Express.js 4.x, SQLite3, Node.js on port 3000
- **Frontend (active)**: `k9-rehab-frontend/` — React 19 + Vite 6.x + Tailwind CSS 3.4 on port 3001
- **Frontend UI**: Radix UI primitives, shadcn/ui components, lucide-react icons, class-variance-authority
- **Frontend (legacy/WIP)**: `frontend/` (React 19 + Vite + TypeScript), `frontend_new/` (React 18 + Vite)
- **Authentication**: JWT (jsonwebtoken + bcryptjs) with role-based access control (`backend/auth.js`)
- **Security**: Helmet, CORS (origin: localhost:3001), express-rate-limit
- **AI Integration**: Anthropic SDK (`@anthropic-ai/sdk`) for VetAI clinical assistant
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
│   ├── server.js               # Main server — routes, middleware, VetAI endpoint
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
│   ├── src/App.jsx             # Main app — all views including VetAI
│   ├── src/K9Icons.jsx         # Icon system v2
│   ├── src/index.jsx           # Entry point
│   ├── src/components/ui/      # shadcn/ui components
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

### VetAI Clinical Assistant
- `POST /api/vet-ai/chat` — Streaming AI chat with patient context (Anthropic SDK)
- `GET /api/vet-ai/status` — Check if VetAI is configured

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
- VetAI: Streaming chat using Anthropic Claude API with clinical system prompt and patient context injection
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
- `ANTHROPIC_API_KEY` — Required for VetAI clinical assistant
- `HF_TOKEN` — Hugging Face API token for AI storyboard images (optional, falls back to Dog.CEO breed photos)
- `PORT` — Server port (default: 3000)
