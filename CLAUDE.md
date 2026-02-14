# CLAUDE.md - K9-REHAB-PRO

## Project Overview

Veterinary rehabilitation protocol generator for canine physical therapy. Full-stack web app that generates personalized 8-12 week rehab protocols based on patient condition, clinical assessment, and treatment goals.

## Tech Stack

- **Frontend**: React 18 (JSX with Babel transpilation), Tailwind CSS (CDN), Axios, served via `http-server` on port 8080
- **Backend**: Express.js 4.x, SQLite3, Node.js on port 3000
- **No build step** - frontend runs directly as HTML/JSX with CDN-based transpilation
- **No test framework** configured (utility test scripts exist in backend/)
- **No linter** configured

## Project Structure

```
k9-rehab-pro/
├── backend/           # Express API server
│   ├── server.js      # Main server (routes, middleware)
│   ├── database.js    # SQLite schema & data operations
│   ├── protocol-generator.js  # Condition-to-exercise mapping
│   ├── all-exercises.js       # Master exercise export
│   ├── exercises-part[1-9].js # 170+ exercises split across files
│   └── package.json
├── frontend/          # React SPA
│   ├── index.html     # Entry point
│   ├── app.jsx        # Main React component (all views)
│   ├── styles.css     # Custom styling
│   ├── src/           # TypeScript source (components, services)
│   │   ├── components/PatientIntakeForm.tsx
│   │   └── services/api.ts
│   ├── tsconfig.json
│   └── package.json
├── output/            # Generated protocols, PDFs, reports
└── data/              # Supporting data files
```

## Running the App

```bash
# Backend (Terminal 1)
cd backend && npm install && node server.js

# Frontend (Terminal 2)
cd frontend && npm install && npm start
```

- Frontend: http://localhost:8080
- Backend API: http://localhost:3000/api
- Health check: http://localhost:3000/api/health

## Key API Endpoints

- `GET /api/health` - Health check
- `GET /api/conditions` - All conditions
- `GET /api/conditions/grouped` - Conditions by category
- `GET /api/exercises` - All exercises with full details
- `GET /api/patients` - List patients
- `POST /api/patients` - Create patient
- `POST /api/generate-protocol` - Generate rehab protocol (main endpoint)

## Database

SQLite3 file-based (`database.db` or `k9_rehab_pro.db`). Key tables: PATIENTS, PROTOCOLS, PROTOCOL_EXERCISES, EXERCISE_LOGS, PROGRESS_ASSESSMENTS, EXERCISES, CONDITIONS. Auto-initializes with seed data on first run.

## Code Conventions

- Constants/codes use UPPER_CASE (e.g., `PROM_STIFLE`, `CCL_CONSERV`)
- Backend uses `module.exports` pattern
- Frontend components are React functional components
- Console logging uses emoji prefixes for visibility
- Error handling via try-catch with promise-based async
- Exercise files split across `exercises-part[1-9].js` for manageability

## Architecture Notes

- Protocol generation uses hardcoded condition-to-exercise mapping with 5-phase progression (passive -> active -> strengthening -> balance -> functional)
- Frontend is a single-page app with view state management in `app.jsx`
- No authentication/authorization implemented
- CORS is open for development
- UI theme is dark/cyberpunk with neon accents and glassmorphism effects
