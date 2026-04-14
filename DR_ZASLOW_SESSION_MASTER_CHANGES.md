# K9 REHAB PRO™ — DR. ZASLOW SESSION MASTER CHANGES
# Claude Code Implementation Package
# Session Date: April 13, 2026
# Author: Salvatore Bonanno | salvatore@k9rehabpro.com
# Priority: Mars PetCare CSO Pitch Preparation
# DO NOT SKIP ANY STEP. EXECUTE IN ORDER.

---

## BEFORE YOU START

Read these files first before touching anything:
- k9-rehab-frontend/src/App.jsx
- k9-rehab-frontend/src/constants/navigation.js
- k9-rehab-frontend/src/pages/ (list all files)
- k9-rehab-frontend/src/components/ (list all files)
- k9-rehab-frontend/src/data/ (list all files)

Report back what you find before making any changes.

---

## PHASE 1A — CRITICAL GLOBAL FIXES
# These affect every block. Fix these first.

### FIX 1: PATIENT ANCHOR — ROOT CAUSE OF ALL SAVE FAILURES

The Save & Close button is broken on EVERY block because there
is no patient record to save data to. This is the root cause.

IMPLEMENT THIS FLOW:

1. Client & Patient block = MANDATORY FIRST STEP
2. Minimum required to unlock all other blocks:
   - Client Name (required)
   - Patient Name (required)
   - Everything else in Client & Patient = optional
3. Until Client Name + Patient Name entered:
   - All other blocks show a lock indicator
   - Clicking any locked block shows prompt:
     "Please enter Client and Patient name first"
   - Redirects user to Client & Patient block
4. Once Client Name + Patient Name entered:
   - All blocks unlock
   - Patient name displays at top of every block
   - All Save & Close buttons save to that patient record
5. RETURNING PATIENT:
   - Search bar at top of dashboard finds existing patient
   - Selecting patient auto-populates ALL fields
     across ALL blocks with previous visit data
   - Clinician only updates what changed

### FIX 2: WEIGHT FIELDS — GLOBAL AUTO-CONVERSION

Apply to EVERY weight field across ALL blocks and pages:
- Show TWO fields side by side: LBS and KG
- Enter lbs → kg auto-calculates (kg = lbs ÷ 2.205)
- Enter kg → lbs auto-calculates (lbs = kg × 2.205)
- Both fields always stay in sync
- Round to 1 decimal place
- Applies everywhere weight appears in the entire app

### FIX 3: AGE / DOB FIELDS — GLOBAL AUTO-SYNC

Apply to EVERY age and DOB field across ALL blocks:
- Show BOTH Age field and DOB field together
- Enter DOB → age auto-calculates from today's date
- Enter age → DOB estimates automatically
- Both always reflect each other
- Applies everywhere age or DOB appears in the entire app

---

## PHASE 1B — BLOCK BY BLOCK CHANGES

### BLOCK 1 — CLIENT & PATIENT
CHANGE:
- Remove "Next Appointment Date" field from this block
- It will be added to Protocol Summary block (see Block 10)

### BLOCK 2 — DIAGNOSTICS
CHANGE 1 — DIAGNOSTIC IMAGING: Replace flat checkbox list with dropdown multi-select per imaging category. Add "Other" free text field.
CHANGE 2 — LABORATORY WORK: Replace individual lab fields with simple checklist (CBC, Chemistry Panel, Urinalysis, Thyroid, Culture, Other). Add "Attach Lab Report" button, single date field, single reference lab field.

### BLOCK 3 — ASSESSMENT → RENAME TO "CLINICAL ASSESSMENT"
- INITIAL CLINICAL ASSESSMENT → always open
- Pain Assessment, Current Medications, Diagnosis & Problem List, Gait Analysis, Neurological → collapsed by default
- Helsinki Chronic Pain Index → move to sidebar collapsible panel

### BLOCK 4 — B.E.A.U. METRICS
- Remove BCS section (stays in BEAU Metrics sidebar nutrition panel)
- Goniometry, Muscle Measurement, Postural → Millis & Levine text always visible, input fields collapsed

### BLOCK 5 — DIET DECISION SUPPORT
- REMOVE ENTIRE BLOCK FROM DASHBOARD
- Remove from navigation.js

### BLOCK 6 — CLINIC EQUIPMENT
- Hydrotherapy + Other Equipment open by default
- Land Exercise, Electrotherapy, Manual Therapy, Support & Mobility collapsed

### BLOCK 7 — HOME EXERCISE PROGRAM
- NO CHANGES

### BLOCK 8 — GOALS
- Remove Target Return Date, Activity Level Goal, time labels, Short-term Milestone Target Date
- Primary Rehabilitation Goal → multi-select
- Owner Goals → collapsed by default
- Progress Tracking Schedule → move to Protocol Summary

### BLOCK 9 — CONDITIONING
- Require patient link before generate button
- Apply global weight/age fixes

### BLOCK 10 — PROTOCOL SUMMARY
- Remove Quick Protocol Generation section
- Keep block completion indicators, add all blocks
- Rename button to "GENERATE B.E.A.U. PROTOCOL"
- After generate: reveal Progress Tracking, Next Appointment, Clinician Sign Off sections
- "APPROVE & SAVE PROTOCOL" button saves everything

### BLOCK 11 — EXERCISE LIBRARY — VERIFICATION AUDIT
- READ ALL exercise files (14 files)
- For every exercise verify: Step-by-step, Red Flags, Contraindications, Evidence Base, Resources
- Generate audit report — DO NOT MODIFY files

---

## PHASE 1C — SIDEBAR RENAME
BEAU Metrics → "Nutritional Protocol" (pending Sal confirmation)

---

## PHASE 1D — 3D HOLOGRAPHIC MUSCLE VIEWER
- Create src/data/exerciseMuscleMap.js
- Update Three.js viewer with holographic muscle highlighting
- Background #050810, primary muscles #00e5ff pulse, secondary #a78bfa, protect #ff4455
- Connect to exercise selection in Exercise Library

---

## VERIFICATION CHECKLIST
[Full checklist per Sal's document]

---

## RULES
1. READ each file before editing
2. SURGICAL edits only
3. Global Fixes (1A) FIRST
4. Exercise Library = REPORT ONLY
5. Test build before committing
6. Do NOT push to Railway until Sal reviews locally

---

OWNER: Salvatore Bonanno | sal.2026@icloud.com
REPO: github.com/SalB111/k9-rehab-pro
DEPLOY: k9-rehab-pro.vercel.app
ENDORSING CLINICIAN: Dr. Ira Zaslow, DVM, ACVECC
TARGET: Mars PetCare CSO Pitch
