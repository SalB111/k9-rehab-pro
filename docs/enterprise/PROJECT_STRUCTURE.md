# K9 Rehab Pro — Project Structure & Export Guide

**Version:** 1.0
**Date:** February 2026

---

## Active Codebase (Production)

```
k9-rehab-pro/
│
├── backend/                          # Express.js API Server (Port 3000)
│   ├── server.js                     # Main server: routes, middleware, audit logging
│   ├── database.js                   # SQLite schema (15 tables), CRUD operations
│   ├── protocol-generator.js         # Protocol engine: 4 protocols × 4 phases
│   ├── all-exercises.js              # Master exercise aggregator (170+ exercises)
│   ├── exercises-part[1-9].js        # Exercise database (split for manageability)
│   ├── exercise-taxonomy.js          # Intervention types, phases, indications
│   ├── exercise-enhancer.js          # Medical-grade metadata enrichment
│   ├── evidence-references.js        # Exercise → citation mapping
│   ├── video-references.js           # Video metadata and instructor profiles
│   ├── protocol-rules.js             # Condition → phase → exercise slug rules
│   ├── package.json                  # Dependencies: express, sqlite3, cors
│   ├── database.db                   # SQLite database file (auto-generated)
│   ├── API_REFERENCE.md              # API endpoint documentation
│   └── README_DATABASE.md            # Database schema documentation
│
├── k9-rehab-frontend/                # React Frontend (Port 3001)
│   ├── src/
│   │   ├── App.js                    # Main SPA (~5,800 lines, 15+ components)
│   │   ├── index.js                  # React entry point
│   │   └── App.test.js               # Test file
│   ├── public/
│   │   ├── index.html                # HTML entry point
│   │   └── favicon.png               # Application icon
│   └── package.json                  # Dependencies: react, axios, react-icons
│
├── docs/                             # Enterprise Documentation Suite
│   └── enterprise/
│       ├── CLINICAL_METHODOLOGY.md   # Clinical methodology whitepaper
│       ├── CONTRAINDICATION_MATRIX.md# Contraindication enforcement rules
│       ├── SECURITY_ARCHITECTURE.md  # Security architecture & roadmap
│       ├── PRIVACY_POLICY.md         # Data privacy policy
│       ├── TERMS_OF_SERVICE.md       # Terms of service
│       └── PROJECT_STRUCTURE.md      # This file
│
├── CanineRehabProtocols/             # Clinical Source Material
│   └── canine_rehab_protocols.docx   # Master protocol reference (4×4 phases)
│
├── CLAUDE.md                         # Project specification
├── README.md                         # Project overview
└── .gitignore                        # Git exclusions
```

---

## Key Metrics

| Metric | Value |
|--------|-------|
| Backend Files | 16 production files |
| Frontend Components | 15+ in single SPA |
| Exercise Count | 170+ evidence-based |
| Protocol Types | 4 (TPLO, IVDD, OA, Geriatric) |
| Phases per Protocol | 4 (gated progression) |
| Database Tables | 15 |
| API Endpoints | 33+ |
| Enterprise Docs | 6 formal documents |

---

## Non-Production Directories

The following directories exist in the repository but are **not part of the production application**:

| Directory | Contents | Status |
|-----------|----------|--------|
| `frontend/` | Original JSX/CDN frontend (pre-CRA) | Archived |
| `frontend_new/` | Vite-based frontend experiment | Archived |
| `k9-rehab-api/` | Alternative API server experiment | Archived |
| `supabase/` | Supabase database configuration | Archived |
| `output/` | Generated protocol output directory | Empty scaffold |
| `data/` | Supporting data files | Empty scaffold |

---

## Acquisition Export Package

For acquisition due diligence, the following package represents the complete deliverable:

### Core Product
- `backend/` — Complete API server and protocol engine
- `k9-rehab-frontend/` — Complete React frontend application
- `CanineRehabProtocols/canine_rehab_protocols.docx` — Clinical source material

### Intellectual Property
- Protocol generation algorithms (4 ACVSMR-aligned protocols)
- 170+ evidence-based exercise definitions with clinical metadata
- Contraindication enforcement engine
- Evidence citation mapping system
- Intake validation with red-flag detection

### Enterprise Documentation
- `docs/enterprise/CLINICAL_METHODOLOGY.md`
- `docs/enterprise/CONTRAINDICATION_MATRIX.md`
- `docs/enterprise/SECURITY_ARCHITECTURE.md`
- `docs/enterprise/PRIVACY_POLICY.md`
- `docs/enterprise/TERMS_OF_SERVICE.md`

### Configuration
- `CLAUDE.md` — Technical specification
- `.gitignore` — Repository configuration

---

*This document is maintained as part of the K9 Rehab Pro enterprise documentation suite.*
