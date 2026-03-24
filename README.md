# K9 Rehab Pro

**AI-powered veterinary rehabilitation intelligence platform.**

Built on ACVSMR diplomate methodology and Millis & Levine textbook standards by a canine rehabilitation nurse with 30+ years of clinical experience.

**4 Conditions | 16 Phases | 52 Protocol Exercises | 260 Exercise Library | 524 Evidence Mappings | Full Modality Integration**

---

## What It Does

K9 Rehab Pro generates evidence-based, phase-gated rehabilitation protocols in minutes — replacing the 20-30 minute manual process clinicians use today. Two products, one clinical intelligence engine:

- **K9 Rehab Pro** (B2B) — For veterinary clinics and universities. AI protocol generation, evidence grading, safety gating, audit trails, and a clinical AI assistant.
- **B.E.A.U. Home** (B2C) — For pet owners. Professional-grade rehab guidance using household items, with daily check-ins and progress tracking. Referred by the treating veterinarian.

---

## Features

- **Protocol Generator** — TPLO (16 wk), IVDD (12 wk), OA (16 wk), Geriatric (16 wk) with 4 gated phases each
- **Safety Gating** — Weight-bearing status, incision status, e-collar, crate rest, pain level (>=8 blocks generation), MMT, IVDD grade, OA KL grade, red-flag detection and escalation
- **Exercise Library** — 260 exercises with evidence grades (129 A / 74 B / 20 C), contraindications, dosing parameters, intervention types, and clinical tags
- **Evidence System** — 524 exercise-to-reference mappings across 49 clinical references. Every exercise displays its evidence grade to the clinician.
- **VetAI Clinical Assistant** — Streaming AI chat with patient context injection, 4-block clinical prompt architecture, scope-of-practice enforcement (Anthropic Claude)
- **3D Anatomy Viewer** — Interactive Three.js canine/feline model with exercise-reactive muscle highlighting, clinical atlas tooltips (origin, insertion, action, nerve), and 260 exercise-to-muscle mappings
- **Patient Management** — Intake, progress assessments, audit logging, protocol versioning
- **Storyboard System** — Breed-specific exercise storyboards with 19 breeds mapped, AI-generated images (HF SDXL), and Dog.CEO fallback photos
- **Feline Support** — Species-adaptive protocols for cats — the first platform with AI-driven feline rehabilitation
- **Dark Mode** — 3 themes (Clinical Light, Clinical Dark, High Contrast) via CSS custom properties

---

## Quick Start

```bash
# Backend (Terminal 1)
cd backend && npm install && node server.js

# Frontend (Terminal 2)
cd k9-rehab-frontend && npm install && npm start
```

- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:3000/api
- **Health check:** http://localhost:3000/api/health

### Environment Variables

Create `backend/.env`:

```env
JWT_SECRET=<generate-a-64-byte-hex-secret>
ANTHROPIC_API_KEY=<required-for-vetai>
HF_TOKEN=<optional-for-storyboard-images>
```

### Deploy to Render

This repo includes a `render.yaml` blueprint for one-click deployment:

1. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
2. Connect this repository
3. Set `ANTHROPIC_API_KEY` in environment variables
4. Deploy — backend serves frontend from `public/`

---

## Tech Stack

| Layer | Stack |
|-------|-------|
| Backend | Express.js 4.x, SQLite3, JWT auth (bcrypt), Helmet, CORS, rate-limiting |
| Frontend | React 19, Vite 6.x, Tailwind CSS 3.4, Radix UI, shadcn/ui, lucide-react |
| AI | Anthropic SDK (VetAI chat), Hugging Face SDXL (storyboard images) |
| 3D | Three.js (anatomy viewer with clinical atlas) |
| Testing | Vitest, React Testing Library, jsdom |

---

## Project Structure

```
k9-rehab-pro/
  backend/                 Express API, SQLite, protocol engine, exercise DB
    server.js              Main server — routes, middleware, VetAI endpoint
    protocol-generator.js  ACVSMR-aligned 4-protocol x 4-phase system
    protocol-rules.js      Phase-condition mappings and safety gates
    all-exercises.js       Master exercise export (260, deduped + enhanced)
    exercises-part[1-10].js  Exercise database across 10 files
    exercise-enhancer.js   Medical-grade metadata enrichment + evidence grading
    evidence-references.js Clinical evidence citations (49 references)
    auth.js                JWT auth, bcrypt, role-based middleware
  k9-rehab-frontend/       Active React frontend (Vite + Tailwind)
    src/pages/             View components (Generator, Exercises, VetAI, etc.)
    src/components/        Shared components (AnatomyViewer3D, TopNav, etc.)
    src/constants/         Colors, styles, navigation (CSS variable driven)
  CanineRehabProtocols/    Clinical source-of-truth document
  docs/                    Supplementary clinical documents
  render.yaml              Render deployment blueprint
```

---

## Clinical Source of Truth

All protocols, exercises, phase definitions, and progression criteria originate from `CanineRehabProtocols/canine_rehab_protocols.docx`.

**Zero tolerance for fabricated exercises, invented diagnoses, or hallucinated clinical data.** If it's not in the source document, it doesn't go in the code.

### Protocol System

- **4 Protocols:** TPLO (16 wk), IVDD (12 wk), OA (16 wk), Geriatric (16 wk)
- **4 Phases per protocol** (16 total): Acute Protection → Early Mobilization → Controlled Strengthening → Return to Function
- **52 unique exercise codes** mapped to protocol phases with gated progression
- **Safety gating:** weight-bearing status, incision status, e-collar, crate rest, pain level, MMT (0-5), IVDD Hansen grade (I-V), OA Kellgren-Lawrence grade (0-4)
- **Evidence grades:** A (Strong RCT) | B (Moderate) | C (Limited) | EO (Expert Opinion)

### Anti-Hallucination Architecture

- Every exercise referenced in protocol output must match an exercise code in the 260-exercise library
- Novel exercise names trigger an automatic block
- VetAI responses are cross-checked against the exercise database before delivery
- Dosing parameters extracted from source documentation only — never AI-generated

---

## About the Founder

**Salvatore Bonanno** — Canine Rehabilitation Nurse, 30+ years in veterinary medicine.

Built and ran the rehabilitation department solo at BluePearl Veterinary Partners (formerly Lauderdale Veterinary Specialists) in Fort Lauderdale, FL from 2017–2024. Every protocol, every phase gate, and every clinical rule in this system came from real clinical work with real patients.

K9 Rehab Pro is the platform I wished I had during those years — generating protocols by hand, 20-30 minutes per patient, 8-10 cases a day, alone.

---

## License

Proprietary. All rights reserved.

© 2025-2026 Salvatore Bonanno

K9 Rehab Pro™ | Powered by B.E.A.U. (Biomedical Evidence-Based Assessment Utility)

Clinical content based on evidence-based veterinary rehabilitation standards (Millis & Levine).
