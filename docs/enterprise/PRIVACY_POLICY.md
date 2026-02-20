# K9 Rehab Pro — Privacy Policy

**Version:** 1.0
**Effective Date:** February 2026

---

## 1. Data Controller

The data controller for all information processed by K9 Rehab Pro is the **deploying organization** (the veterinary practice, rehabilitation center, specialty hospital, or university that operates the platform). K9 Rehab Pro is a locally-hosted software tool; the platform developer does not have access to, collect, or process any data entered into the system by the deploying organization.

---

## 2. Data Collected

K9 Rehab Pro processes the following categories of data:

| Category | Data Elements | Purpose |
|----------|---------------|---------|
| Patient Records | Canine patient name, breed, age, weight, sex, diagnosis, medical history, clinical assessments | Protocol generation and clinical record-keeping |
| Client Information | Owner name, email, phone, referring veterinarian | Client communication and VCPR documentation |
| Clinical Assessments | Pain scores, lameness grades, ROM measurements, girth measurements, neurological status | Treatment planning and outcome tracking |
| Protocol Data | Generated rehabilitation protocols, exercise assignments, phase progression | Clinical documentation and treatment records |
| Session Records | SOAP notes, CBPI assessments, exercise logs, progress assessments | Longitudinal outcome tracking |
| Audit Data | Timestamps, actions, user labels, IP addresses, status codes | Compliance and accountability |

---

## 3. Data Storage

- **Location:** All data is stored in a SQLite database file on the local filesystem of the deploying organization's infrastructure
- **No Cloud Transmission:** No data is transmitted to external servers, cloud services, or remote databases
- **No Remote Access:** The platform does not provide remote access to data unless configured by the deploying organization

---

## 4. Data Sharing

**K9 Rehab Pro does not share data with any third party.** Specifically:

- No data is sold to any party
- No data is shared with advertisers
- No data is used for marketing or analytics by the platform developer
- No data is shared with AI or machine learning providers
- No data is transmitted to Anthropic, OpenAI, Google, or any other technology company
- No data leaves the local installation unless explicitly exported by the deploying organization

---

## 5. Data Retention

- **Configurable Retention Period:** 3 to 10 years (default: 7 years)
- **Alignment:** Default retention period aligned with most state veterinary medical board recordkeeping requirements
- **Purge:** Data older than the configured retention period may be purged via the audit log purge endpoint
- **Responsibility:** The deploying organization is responsible for configuring retention periods in compliance with their applicable state veterinary medical board requirements

---

## 6. Data Rights

The deploying organization and its clients maintain the following data rights:

- **Access:** Full access to all stored data through the application interface and API
- **Export:** Patient records, protocols, session data, and audit logs can be exported
- **Deletion:** Data can be deleted through the application (subject to recordkeeping requirements)
- **Portability:** Data stored in standard SQLite format, exportable as CSV/JSON

---

## 7. Security Measures

See **SECURITY_ARCHITECTURE.md** for current and planned security measures.

Current active protections:
- Local-only data storage (no external transmission)
- Audit logging of all data modifications
- CSV export of audit logs for compliance review
- No third-party data access

Planned protections (see Security Architecture Roadmap):
- AES-256 encryption at rest
- TLS 1.3 encryption in transit
- Role-based access control
- Multi-factor authentication
- Encrypted backups

---

## 8. HIPAA Alignment

HIPAA (Health Insurance Portability and Accountability Act) does not govern veterinary medicine. However, K9 Rehab Pro is designed with HIPAA-aligned data protection principles as a best-practice framework, including:

- Minimum necessary data collection
- Audit trail for all data access and modifications
- Data retention aligned with professional recordkeeping standards
- Local-only architecture preventing unauthorized data transmission

---

## 9. Contact

For privacy inquiries, contact the deploying organization's designated privacy officer or system administrator.

---

*This privacy policy is maintained as part of the K9 Rehab Pro enterprise documentation suite. The deploying organization may customize this policy to reflect their specific data handling practices and applicable regulations.*
