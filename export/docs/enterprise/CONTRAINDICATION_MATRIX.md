# K9 Rehab Pro — Contraindication Enforcement Matrix

**Version:** 1.0
**Date:** February 2026
**Source:** `backend/protocol-generator.js` — `CONTRAINDICATION_MAP` and `validateIntake()`

---

## Purpose

This document defines the automated contraindication rules enforced by the K9 Rehab Pro protocol engine. These rules prevent the assignment of exercises that are clinically contraindicated based on the patient's conditions, medical history, and current status.

The contraindication system operates at two levels:
1. **Intake Validation (Red-Flag Detection):** Blocks or warns before protocol generation begins
2. **Exercise-Level Exclusion:** Removes specific exercises from the protocol output based on patient condition keywords

---

## Exercise-Level Contraindication Map

| Patient Condition Keyword | Excluded Exercise Codes | Clinical Rationale |
|---------------------------|------------------------|-------------------|
| `cardiac` | UNDERWATER_TREAD, POOL_SWIM, WATER_WALKING, WATER_RETRIEVE, TREADMILL_WALK, JOGGING | Hydrostatic pressure increases venous return and cardiac preload; aerobic exercise increases myocardial oxygen demand. Cardiovascular compromise contraindicates both aquatic therapy and sustained aerobic exercise (Millis & Levine Ch. 17). |
| `heart` | UNDERWATER_TREAD, POOL_SWIM, WATER_WALKING, WATER_RETRIEVE, TREADMILL_WALK, JOGGING | Same as cardiac — alternate keyword for cardiovascular conditions. |
| `respiratory` | UNDERWATER_TREAD, POOL_SWIM, WATER_WALKING, WATER_RETRIEVE | Water immersion increases respiratory effort due to hydrostatic pressure on the thorax. Respiratory-compromised patients risk decompensation in aquatic environments (Zink & Van Dyke Ch. 12). |
| `seizure` | UNDERWATER_TREAD, POOL_SWIM, WATER_WALKING, WATER_RETRIEVE | Seizure during aquatic therapy creates drowning risk. All water-based interventions are contraindicated in patients with active or poorly controlled seizure disorders (Millis & Levine Ch. 17). |
| `epilepsy` | UNDERWATER_TREAD, POOL_SWIM, WATER_WALKING, WATER_RETRIEVE | Same as seizure — alternate keyword. |
| `open wound` | UNDERWATER_TREAD, POOL_SWIM, WATER_WALKING, WATER_RETRIEVE, US_PULSED | Water immersion introduces infection risk to open wounds. Therapeutic ultrasound at wound sites may disrupt healing tissue or spread contamination (Millis & Levine Ch. 13, 17). |
| `infection` | UNDERWATER_TREAD, POOL_SWIM, WATER_WALKING, WATER_RETRIEVE | Active infection contraindicates aquatic therapy due to cross-contamination risk to the patient, other patients, and pool water (Millis & Levine Ch. 17). |
| `neoplasia` | US_PULSED, LASER_IV | Therapeutic ultrasound and Class IV laser may increase local blood flow and metabolic activity at tumor sites, potentially accelerating tumor growth or metastasis (Millis & Levine Ch. 12, 13). |
| `cancer` | US_PULSED, LASER_IV | Same as neoplasia — alternate keyword. |
| `tumor` | US_PULSED, LASER_IV | Same as neoplasia — alternate keyword. |
| `pregnant` | US_PULSED, NMES_QUAD, TENS_THERAPY, PEMF_THERAPY, SHOCKWAVE | Electrotherapy modalities may affect fetal development. Therapeutic ultrasound near the gravid uterus is contraindicated. PEMF and shockwave lack safety data in pregnant animals (Millis & Levine Ch. 12, 14). |
| `pacemaker` | NMES_QUAD, TENS_THERAPY, PEMF_THERAPY, SHOCKWAVE | Electrical modalities may interfere with pacemaker function, causing arrhythmia or device malfunction. Electromagnetic fields from PEMF and shockwave pose similar risks (Millis & Levine Ch. 14). |
| `implant` | SHOCKWAVE, US_PULSED | Shockwave therapy at metallic implant sites causes energy reflection and local tissue damage. Therapeutic ultrasound at metal interfaces generates excessive heat (Millis & Levine Ch. 12, 15). |
| `non-ambulatory` | TREADMILL_WALK, JOGGING, CAVALETTI, STAIR_CLIMBING, HILL_WALKING | Weight-bearing exercises require baseline ambulatory capacity. Non-ambulatory patients must be restricted to passive ROM, supported standing, and sling-assisted exercises until voluntary motor function returns (Millis & Levine Ch. 21). |
| `fracture unstable` | WEIGHT_SHIFTING, BALANCE_BOARD, CAVALETTI, STAIR_CLIMBING | Unstable fractures require rigid immobilization. Weight-bearing challenges, balance perturbation, and impact loading risk fracture displacement or implant failure (Millis & Levine Ch. 18). |

---

## Enforcement Architecture

The `getExcludedCodes(formData)` function scans the following patient data fields for condition keywords:

| Field Scanned | Source |
|---------------|--------|
| `contraindications` | Clinician-entered contraindication notes |
| `diagnosis` | Primary diagnosis text |
| `medicalHistory` | Patient medical history |
| `medications` | Current medications (may indicate underlying conditions) |
| `mobilityLevel` | Current mobility assessment |

All fields are concatenated, lowercased, and checked against each keyword in the `CONTRAINDICATION_MAP`. Matched keywords produce a `Set` of excluded exercise codes that are filtered out during `selectExercisesForWeek()`.

---

## Red-Flag Detection Rules (Intake Validation)

### Blocking Rules (Prevent Protocol Generation)

| Rule | Trigger | Clinical Rationale |
|------|---------|-------------------|
| Pain score ≥ 8/10 | `painScore` or `painLevel` ≥ 8 | Severe uncontrolled pain contraindicates active rehabilitation. Stabilize pain pharmacologically before initiating protocols (Millis & Levine Ch. 5). |
| Absent deep pain perception | `neuroDeepPain` contains "absent" | Absent deep pain is a grave neurological sign indicating severe spinal cord damage. Requires immediate veterinary neurological evaluation before any rehabilitation planning (Millis & Levine Ch. 21). |
| Post-op incision complications | `incisionStatus` contains "dehisc", "infected", "open", or "draining" | Active surgical site complications require wound management before rehabilitation can begin. Exercise may worsen dehiscence or spread infection (Millis & Levine Ch. 19). |

### Warning Rules (Generate with Caution Flags)

| Rule | Trigger | Clinical Rationale |
|------|---------|-------------------|
| Absent neurological function | `neuroProprioception`, `neuroWithdrawal`, `neuroDeepPain`, or `neuroMotorGrade` contains "absent", "none", "0/5", or "grade 0" | Absent neuro function requires verification before weight-bearing exercises. Protocol may proceed with passive interventions only. |
| Lameness grade 5/5 | `lamenessGrade` ≥ 5 | Non-weight-bearing lameness indicates severe pathology. Protocol restricted to passive and non-weight-bearing exercises. |
| Complication keywords in history | `medicalHistory` or `complicationsNoted` contains: seroma, implant failure, implant migration, non-union, osteomyelitis, septic | These complications may not be resolved. Clinician must verify resolution before advancing to weight-bearing phases. |
| Future surgery date | `surgeryDate` is in the future with `treatmentApproach` = "surgical" | Protocol generates for pre-surgical planning purposes. Clinician alerted to verify timing. |

---

## References

1. Millis DL, Levine D. *Canine Rehabilitation and Physical Therapy.* 2nd ed. Elsevier Saunders; 2014.
2. Zink MC, Van Dyke JB. *Canine Sports Medicine and Rehabilitation.* 2nd ed. Wiley-Blackwell; 2018.
3. Pryor B, Millis DL. Therapeutic laser in veterinary medicine. *Vet Clin North Am Small Anim Pract.* 2015;45(1):45-56.
4. Levine D, Bockstahler B. Multimodal management of canine osteoarthritis. In: Millis DL, Levine D, eds. *Canine Rehabilitation and Physical Therapy.* 2nd ed. Elsevier; 2014.

---

*This document is maintained as part of the K9 Rehab Pro enterprise documentation suite.*
