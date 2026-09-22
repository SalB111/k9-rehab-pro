# Parked — the seven-step intake wizard

Retired 2026-09-21. Not deleted: this is the clinical intake of a medical
product, and it worked. It is here so it can be read, compared against, and
brought back if the replacement turns out to have missed something.

## What it was

`GeneratorView.jsx` plus `generator/` — a seven-step wizard asking **186
fields** before a protocol appeared:

| Step | Fields |
|---|---|
| Step1ClientPatient | 33 |
| Step2ClinicalAssessment | 36 |
| Step3DiagnosticWorkup | 18 |
| Step3TreatmentPlan | 33 |
| Step4PatientStatus | 28 |
| Step4RehabGoals | 11 |
| Step5ProtocolParams | 11 |
| Step6Equipment | 7 |
| Step6PreProtocolSummary | 1 |
| Step7HomeProtocol | 8 |

The engine reads about 36 inputs. Roughly 150 of those fields went nowhere.

## What replaced it

`pages/clinical/` — the V2 workflow.

- **Registering a patient** is `NewPatient.jsx`: eight fields, only what the
  system has no way of knowing.
- **The clinical picture** is proposed by `backend/v2/intake-proposal.js` from
  the patient record, the clinic's equipment profile, and stated rules.
- **The safety gates** — the twelve inputs that fail UNSAFE if omitted — are
  confirmed by a clinician in `SafetyGates.jsx`, and `protocol-store` refuses
  the approval until every applicable one is ticked.

Measured against the five TEST-CLINIC patients, a clinician confirms 1, 2, 5,
6 or 11 gates depending on how complicated the case is, rather than 186 fields
regardless.

## Before reviving any of it

Three bugs in the old model were only visible once real records were run
through the new one, and they are worth knowing about:

1. A record can say "TPLO Post-Op" and carry **no surgery date**. Anything
   keying post-operative logic off the date alone silently skips incision
   status, complications, e-collar and crate rest — all of which fail UNSAFE.
2. A history can say **"No surgical candidate"**. Matching on the word
   "surgical" makes a medically managed patient look post-operative.
3. Clinic capability keys (`modality_laser`) are not engine input names
   (`modalityLaser`). Mixing them up withholds every modality with no error.
