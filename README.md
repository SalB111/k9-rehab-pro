# K9 Rehab Pro

Veterinary rehabilitation intelligence platform built on ACVSMR diplomate methodology and Millis & Levine textbook standards.

**4 Conditions | 16 Phases | 52 Protocol Exercises | 223 Exercise Library | Full Modality Integration**

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

---

## Features

- **Protocol Generator** — TPLO (16 wk), IVDD (12 wk), OA (16 wk), Geriatric (16 wk) with 4 gated phases each, safety gating (weight-bearing, incision, e-collar, crate rest, pain level), and equipment flags
- **Exercise Library** — 223 exercises with evidence grades, contraindications, intervention types, video references, and AI-generated storyboards (215/215 coverage)
- **VetAI Clinical Assistant** — Streaming AI chat with patient context injection (Anthropic Claude)
- **Patient Management** — Intake, progress assessments, audit logging, bulk operations
- **Storyboard System** — Breed-specific exercise storyboards with AI-generated images (HF SDXL) and Dog.CEO fallback photos

---

## Tech Stack

| Layer | Stack |
|-------|-------|
| Backend | Express.js 4.x, SQLite3, JWT auth (bcrypt), Helmet, rate-limiting |
| Frontend | React 19, Vite 6.x, Tailwind CSS 3.4, Radix UI, shadcn/ui, lucide-react |
| AI | Anthropic SDK (VetAI chat), Hugging Face SDXL (storyboard images) |
| Testing | Vitest, React Testing Library, jsdom |
| Agent | Claude Agent SDK (TypeScript) — `k9pro-agent/` |

---

## Project Structure

```
k9-rehab-pro/
  backend/                 Express API, SQLite, protocol engine, exercise DB
  k9-rehab-frontend/       Active React frontend (Vite + Tailwind)
  k9pro-agent/             Claude Agent SDK CLI tool
  CanineRehabProtocols/    Clinical source-of-truth document
  docs/                    Supplementary clinical documents
```

---

## Testing

```bash
cd k9-rehab-frontend && npm test
```

---

## Clinical Source of Truth

All protocols, exercises, phase definitions, and progression criteria originate from `CanineRehabProtocols/canine_rehab_protocols.docx`. Zero tolerance for fabricated exercises, invented diagnoses, or hallucinated clinical data.

### Protocol System

- 4 Protocols with 4 phases each (16 total phases)
- Phase flow: Acute Protection -> Early Mobilization -> Controlled Strengthening -> Return to Function
- 52 unique exercise codes mapped to protocol phases
- Safety gating: weight-bearing status, incision status, e-collar, crate rest, pain level, MMT, IVDD grade, OA KL grade

---

## License

Proprietary. All rights reserved.
(c) 2026 Sal Bonavita

Clinical content based on evidence-based veterinary rehabilitation standards (Dr. Millis & Dr. Levine).
