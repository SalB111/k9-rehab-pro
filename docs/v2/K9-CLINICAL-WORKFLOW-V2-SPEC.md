# K9 CLINICAL WORKFLOW V2
## Build Specification — v1.0

### PURPOSE

Transform the existing K9-REHAB-PRO clinician workflow from a multi-step
data-entry wizard into a patient-centered clinical decision and review workflow.

The underlying K9 clinical intelligence, exercise library, contraindication
logic, safety gates, clinical measurements, and B.E.A.U. integration concepts
must be preserved.

---

## CORE PRINCIPLE

The veterinarian should REVIEW and APPROVE clinical recommendations,
not repeatedly reconstruct information K9 already knows.

CURRENT:

Patient → 6-step wizard → manual configuration → generate → protocol

TARGET:

Existing Patient
→ Today's Clinical Update
→ K9 Clinical Reasoning
→ Recommendation
→ Clinician Review
→ Clinician Approval
→ Approved HEP
→ B.E.A.U. Home

---

## CLINICAL AUTHORITY

K9-REHAB-PRO remains the clinical authority.

K9 owns:

- patient clinical record
- clinical assessment
- diagnosis/context
- surgical history
- clinical restrictions
- contraindications
- clinical safety decisions
- exercise selection
- dosage
- progression
- protocol generation
- protocol versioning
- clinician approval

B.E.A.U. Home owns:

- approved HEP presentation
- home execution
- household equipment adaptation
- environment-aware execution
- owner instructions
- home sessions
- adherence/activity
- owner observations
- home progress reporting

B.E.A.U. must not modify the approved clinical prescription.

---

## WORKFLOW

### 1. PATIENT SELECTION

Existing patient:
- search
- select
- open longitudinal record

New patient:
- lightweight registration

The clinician should not re-enter existing patient information.

---

### 2. CLINICAL SNAPSHOT

Display existing patient information automatically.

Relevant information includes:

- diagnosis/condition
- affected region
- surgery history/date
- medications
- medical history
- current restrictions
- previous clinical measures
- current protocol/HEP status
- previous B.E.A.U. activity where available

---

### 3. TODAY'S ASSESSMENT

Clinician enters only information that changed or must be measured today.

Primary fields:

- pain
- lameness
- weight bearing
- mobility/function
- ROM
- relevant clinical observations
- important change since previous visit

Additional measurements remain available when clinically indicated.

---

### 4. K9 CLINICAL REASONING

K9 combines:

- persistent patient record
- today's assessment
- surgical/treatment context
- clinical measurements
- contraindications
- safety flags
- exercise library
- protocol phase
- dosage/progression logic

The existing clinical engine remains the underlying reasoning system.

---

### 5. RECOMMENDATION

K9 presents:

- recommended protocol phase
- recommended exercises
- dosage
- frequency
- duration
- progression
- contraindications
- warnings
- relevant rationale

The clinician may modify the recommendation.

---

### 6. CLINICIAN REVIEW & APPROVAL

The clinician must explicitly approve the resulting protocol.

Approval creates a new protocol version.

A previously approved protocol must not be silently overwritten.

Protocol states:

- DRAFT
- APPROVED
- SUPERSEDED

---

### 7. B.E.A.U. HANDOFF

Only an APPROVED HEP is eligible for B.E.A.U.

The approved HEP includes:

- prescribed exercises
- dosage
- frequency
- duration
- progression
- clinical restrictions
- contraindications
- safety instructions

B.E.A.U. determines how approved exercises can be safely executed in
the owner's home environment.

---

## CURRENT COMPONENT DISPOSITION

Step1ClientPatient:
- retain for new-patient registration
- remove from normal existing-patient clinical workflow

Step2ClinicalAssessment:
- retain clinical intelligence
- compress into Today's Clinical Update
- progressive disclosure for advanced measurements

Step3TreatmentPlan:
- auto-populate from persistent record when possible
- expose clinician overrides only when needed

Step4RehabGoals:
- retain
- generate/suggest automatically
- clinician confirms or edits

Step5ProtocolParams:
- retain underlying capabilities
- K9 suggests defaults
- clinician reviews exceptions

Step6PreProtocolSummary:
- transform into Clinician Review & Approval

ProtocolResults:
- retain
- make approval and longitudinal protocol versioning central

---

## SAFETY REQUIREMENTS

Existing safety infrastructure must not be weakened.

Preserve:

- contraindication filtering
- pain-related restrictions
- severe weakness restrictions
- IVDD restrictions
- OA restrictions
- incision safety
- weight-bearing restrictions
- aquatic gating
- modality gating
- exercise existence validation
- phase validation
- dosage validation
- red flags
- clinician approval requirement

No workflow simplification may bypass clinical safety gates.

---

## PERSISTENCE REQUIREMENTS

Patient records remain persistent.

Clinical measurements remain persistent.

Dashboard data remains persistent where appropriate.

Protocol history must become explicitly persistent.

The current UI sends `protocol_text`, but the current backend does not
persist that field. V2 must replace this incomplete path with an explicit
protocol/version persistence model.

---

## DATA PRINCIPLE

Do not delete existing clinical information merely because it is removed
from the primary clinician interface.

Information may be:

- visible
- progressive disclosure
- auto-populated
- calculated
- backend-only
- reference-only
- B.E.A.U.-owned

The objective is workflow reduction, not knowledge reduction.

---

## BUILD RULE

V2 must initially be built separately from the production K9 source.

Do not modify the original K9 source until V2 components are verified.

Existing K9 functionality must remain recoverable.

---

## SUCCESS CRITERIA

A clinician should be able to:

1. Select an existing patient.
2. See the relevant clinical history automatically.
3. Enter today's meaningful clinical changes.
4. Generate a clinically constrained recommendation.
5. Review the recommendation.
6. Modify it if necessary.
7. Explicitly approve it.
8. Persist the approved protocol as a version.
9. Hand the approved HEP to B.E.A.U.

The clinician should not need to reconstruct the patient's complete history
or manually configure information K9 can safely determine from existing data.

---

## NON-GOALS

V2 does not initially:

- delete the old generator
- rewrite the entire K9 application
- replace the clinical engine
- replace the exercise library
- allow B.E.A.U. to alter prescriptions
- claim autonomous clinical decision-making
- claim autonomous machine learning unless an actual verified learning path exists

---

## BUILD STATUS

Specification: INITIALIZED

Next:
1. Build data contract
2. Build patient-aware workflow shell
3. Connect existing clinical engine
4. Build protocol persistence/versioning
5. Build clinician approval
6. Build B.E.A.U. handoff
7. Test against existing K9 behavior
8. Only then consider retiring redundant UI
