# K9 Rehab Pro — Security Architecture & Roadmap

**Version:** 1.0
**Date:** February 2026
**Classification:** Internal / Enterprise Distribution

---

## 1. Current State

K9 Rehab Pro currently operates as a **locally-hosted application** with the following security posture:

| Component | Current Implementation | Status |
|-----------|----------------------|--------|
| Data Storage | SQLite file-based database on local filesystem | Active |
| Encryption at Rest | None (SQLite unencrypted) | Planned |
| Encryption in Transit | HTTP (no TLS) | Planned |
| Authentication | None (single-user local access) | Planned |
| Authorization / RBAC | None | Planned |
| Session Management | No formal sessions | Planned |
| Audit Logging | All mutating API operations logged with timestamp, action, user, IP, status code | Active |
| Audit Export | CSV export endpoint for board investigations | Active |
| Data Sharing | None — all data remains local | Active |
| AI Training | No user data used for AI training | Active |
| Backups | None (manual filesystem backup) | Planned |

---

## 2. Security Roadmap

### Phase 1: Transport Security
- **HTTPS / TLS 1.3:** SSL certificate configuration for all API communications
- **Session Management:** JWT or session-token-based authentication with configurable auto-expiration (default: 30 minutes idle)
- **CORS Hardening:** Restrict allowed origins to deployed frontend domain

### Phase 2: Data Protection & Access Control
- **AES-256 Encryption at Rest:** SQLCipher integration for encrypted SQLite database
- **Role-Based Access Control (RBAC):** Four roles with defined permissions:
  - **Veterinarian:** Full access — generate protocols, modify, approve, sign off
  - **Technician:** Generate protocols, record sessions, view patients — cannot approve/sign
  - **Student:** View-only access to protocols and exercise library — cannot generate or modify
  - **Admin:** Full access plus system configuration, user management, audit log access
- **Password Policy:** Minimum 12 characters, complexity requirements, bcrypt hashing

### Phase 3: Advanced Security
- **Zero-Knowledge Sensitive Fields:** Field-level encryption for client PII (name, email, phone) with per-field encryption keys
- **Multi-Factor Authentication (MFA):** TOTP-based second factor for all clinical roles
- **Encrypted Backups:** Automated encrypted backup with configurable schedule and retention
- **Disaster Recovery:** Documented recovery procedure with backup verification
- **Intrusion Detection:** Rate limiting, failed login lockout, anomalous access alerting

---

## 3. Data Flow Architecture

```
[Clinician Browser] ←→ [Express.js API :3000] ←→ [SQLite database.db]
         ↓                       ↓
    [Local Only]          [Audit Log Table]
         ↓                       ↓
  No external APIs        CSV Export for
  No cloud services       Board Investigations
  No data transmission
```

**Key Guarantees:**
- No patient or client data leaves the local machine
- No data is transmitted to Anthropic, OpenAI, or any AI provider
- No data is sold to or shared with third parties
- No data is used for advertising, analytics, or model training
- All clinical logic runs locally via deterministic algorithms

---

## 4. Compliance Alignment

### HIPAA Framework
HIPAA does not legally govern veterinary medicine. However, K9 Rehab Pro is designed with HIPAA-aligned principles as a best-practice standard:

| HIPAA Safeguard | K9 Rehab Pro Status |
|-----------------|-------------------|
| Access Controls | Planned (Phase 2 RBAC) |
| Audit Controls | Active (audit_log table, CSV export) |
| Transmission Security | Planned (Phase 1 TLS) |
| Encryption | Planned (Phase 2 AES-256) |
| Integrity Controls | Active (deterministic logic, no data modification without audit) |

### State Veterinary Medical Board Compliance
- Recordkeeping: Configurable data retention (3–10 years, default 7 years per most state board requirements)
- Audit Trail: All protocol generation, patient modifications, and data access events are logged
- Export: Audit logs exportable as CSV for board investigation compliance

---

## 5. Audit System

### What Is Logged
All HTTP requests using POST, PUT, or DELETE methods to `/api/*` endpoints are automatically logged:

| Field | Description |
|-------|-------------|
| timestamp | UTC timestamp of the action |
| action | HTTP method + path (e.g., "POST /generate-protocol") |
| resource_type | API resource category (patients, protocols, etc.) |
| user_label | User identifier (default: "clinician") |
| ip_address | Client IP address |
| request_method | HTTP method |
| request_path | Full request URL |
| status_code | HTTP response status code |
| detail | Success/error message |

### Retention
- Default retention: 7 years (configurable)
- Purge endpoint available for retention enforcement
- No automatic deletion — purge must be explicitly triggered

### Export
- `GET /api/audit-log/export` — Full CSV export with all fields
- File naming: `k9_rehab_audit_log_YYYY-MM-DD.csv`

---

## 6. Technology Migration Roadmap

### Current Stack
| Layer | Technology | Status |
|-------|-----------|--------|
| Frontend | React 19 (JavaScript, single-file SPA) | Production |
| Backend | Express.js + SQLite3 | Production |
| Database | SQLite (file-based) | Production |
| ORM | Raw SQL queries | Production |
| Type Safety | None (JavaScript) | Active |

### Planned Migration Path

**Phase A: Frontend Modernization**
- Migrate App.js to TypeScript (.tsx)
- Split monolithic App.js into component modules (DashboardView, GeneratorView, ExercisesView, etc.)
- Add PropTypes/interfaces for all component props
- Introduce React Context for shared state (brand, auth, settings)

**Phase B: Backend Modernization**
- Migrate to TypeScript
- Replace raw SQL with Prisma ORM
- Migrate from SQLite to PostgreSQL for multi-user, concurrent access
- Add request validation with Zod or Joi schemas
- Implement JWT-based authentication middleware

**Phase C: Enterprise Deployment**
- Docker containerization (frontend + backend + database)
- CI/CD pipeline (GitHub Actions or similar)
- Environment-based configuration (development, staging, production)
- API versioning (v1/v2 prefix)
- White-label theming configuration (per-deployment branding)

---

*This document is maintained as part of the K9 Rehab Pro enterprise documentation suite.*
