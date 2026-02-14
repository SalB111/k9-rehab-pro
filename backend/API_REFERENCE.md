# K9-REHAB-PRO API QUICK REFERENCE

## Base URL
```
http://localhost:3000/api
```

---

## 🏥 PATIENT ENDPOINTS

### Get All Patients
```http
GET /patients
```
**Response:** List of all patients with demographics

### Search Patients
```http
GET /patients/search?q=searchTerm
```
**Query Params:**
- `q` - Search term (name, breed, client name)

### Get Patient by ID
```http
GET /patient/:id
```
**Response:** Single patient details

### Get Patient's Protocols
```http
GET /patient/:id/protocols
```
**Response:** All protocols for this patient

---

## 📋 PROTOCOL ENDPOINTS

### Generate New Protocol
```http
POST /generate-protocol
```
**Body:**
```json
{
  "clientName": "Dr. Smith",
  "patientName": "Buddy",
  "species": "Canine",
  "breed": "Labrador",
  "age": 5,
  "weight": 70,
  "diagnosis": "TPLO",
  "painWithActivity": 6,
  "mobilityLevel": 5,
  "protocolLength": 8,
  "goals": ["Reduce pain", "Improve mobility"]
}
```

### Get Active Protocols
```http
GET /protocols
```
**Response:** All protocols with status='ACTIVE'

### Get Protocol Details
```http
GET /protocol/:protocolId
```
**Response:** Protocol with all 48 exercise assignments

### Update Protocol Status
```http
PUT /protocol/:protocolId/status
```
**Body:**
```json
{
  "status": "COMPLETED",
  "completedDate": "2026-02-20"
}
```
**Valid Status:** ACTIVE, COMPLETED, PAUSED

---

## 💪 EXERCISE LOGGING ENDPOINTS

### Log Exercise Session
```http
POST /exercise-log
```
**Body:**
```json
{
  "protocolId": "K9RP-1234567890",
  "exerciseId": "EX-040",
  "weekNumber": 1,
  "completedDate": "2026-02-11",
  "durationMinutes": 15,
  "repetitions": 12,
  "painLevelPost": 3,
  "notes": "Patient did well"
}
```

### Get Exercise Logs
```http
GET /protocol/:protocolId/logs
```
**Response:** All logged exercise sessions

### Get Compliance Stats
```http
GET /protocol/:protocolId/compliance
```
**Response:** Weekly completion rates, pain trends, duration averages

---

## 📊 PROGRESS ASSESSMENT ENDPOINTS

### Save Progress Assessment
```http
POST /progress-assessment
```
**Body:**
```json
{
  "protocolId": "K9RP-1234567890",
  "weekNumber": 2,
  "assessmentDate": "2026-02-18",
  "painLevel": 3,
  "mobilityLevel": 7,
  "romMeasurement": "Stifle: 125°",
  "girthMeasurement": "Thigh: 42cm",
  "weightBearing": "85%",
  "gaitQuality": "Improved",
  "therapistNotes": "Good progress"
}
```

### Get Progress Assessments
```http
GET /protocol/:protocolId/assessments
```
**Response:** All weekly assessments

---

## 📚 REFERENCE ENDPOINTS

### Get Exercise Library
```http
GET /exercises
```
**Response:** All 50 exercises

### Get Supported Conditions
```http
GET /conditions
```
**Response:** 8 orthopedic conditions

### Safety Screening
```http
POST /safety-screening
```
**Body:**
```json
{
  "painWithActivity": 8,
  "mobilityLevel": 3,
  "comorbidities": ["cardiac"]
}
```

### Health Check
```http
GET /health
```
**Response:** Server + database status

---

## 📋 DIAGNOSIS CODES

| Code | Full Name |
|------|-----------|
| `TPLO` | Tibial Plateau Leveling Osteotomy |
| `CCL_CONSERVATIVE` | Cranial Cruciate Ligament (Conservative) |
| `FHO` | Femoral Head Ostectomy |
| `HIP_DYSPLASIA` | Hip Dysplasia (Conservative) |
| `ELBOW_DYSPLASIA` | Elbow Dysplasia |
| `PATELLAR_LUXATION` | Patellar Luxation (Post-op) |
| `FRACTURE_FEMUR` | Femoral Fracture Repair |
| `AMPUTATION` | Limb Amputation |

---

## 🎯 COMMON WORKFLOWS

### Create New Patient + Protocol
```javascript
// 1. Generate protocol (patient auto-created)
POST /api/generate-protocol
// Returns: protocolId, patient_id

// 2. Retrieve protocol details
GET /api/protocol/:protocolId
```

### Daily Exercise Tracking
```javascript
// 1. Log each completed session
POST /api/exercise-log

// 2. View today's logs
GET /api/protocol/:protocolId/logs
```

### Weekly Progress Check
```javascript
// 1. Review compliance
GET /api/protocol/:protocolId/compliance

// 2. Save assessment
POST /api/progress-assessment

// 3. View assessment history
GET /api/protocol/:protocolId/assessments
```

---

## 🔢 RESPONSE CODES

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request (validation error) |
| `404` | Not Found |
| `500` | Server Error |

---

## 📦 RESPONSE FORMATS

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": "Additional context"
}
```

---

## 🧪 TESTING WITH POSTMAN

1. Import Base URL: `http://localhost:3000/api`
2. Set Header: `Content-Type: application/json`
3. Test endpoints in this order:
   - Health check
   - Generate protocol
   - Get patients
   - Log exercise
   - Save assessment

---

## 💡 PRO TIPS

- **Protocol IDs** follow format: `K9RP-{timestamp}`
- **Exercise IDs** follow format: `EX-{number}`
- **Week numbers** are 1-indexed (1-8)
- **Pain/Mobility levels** are 0-10 scale
- **Dates** use ISO format: `YYYY-MM-DD`

---

**Quick Reference v1.0**
**Server:** http://localhost:3000
**Database:** SQLite (k9_rehab_pro.db)
