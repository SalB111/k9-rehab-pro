# K9 Rehab Pro — Clinical Methodology Whitepaper

**Version:** 1.0
**Classification:** Clinical Decision-Support System (CDSS)
**Date:** February 2026

---

## 1. Executive Summary

K9 Rehab Pro is a clinical decision-support system (CDSS) designed for licensed veterinary professionals performing canine physical rehabilitation. The platform generates structured, evidence-based rehabilitation protocols using deterministic logic mapped to peer-reviewed veterinary rehabilitation literature.

K9 Rehab Pro does not establish a veterinarian-client-patient relationship (VCPR), provide medical diagnoses, or replace licensed veterinary judgment. All generated protocols require review and approval by a licensed veterinarian before clinical application.

---

## 2. Clinical Framework

The protocol engine is built on the foundational texts of veterinary rehabilitation medicine:

- **Millis DL, Levine D.** *Canine Rehabilitation and Physical Therapy.* 2nd ed. St. Louis, MO: Elsevier Saunders; 2014.
- **Zink MC, Van Dyke JB.** *Canine Sports Medicine and Rehabilitation.* 2nd ed. Ames, IA: Wiley-Blackwell; 2018.
- **American College of Veterinary Sports Medicine and Rehabilitation (ACVSMR)** position statements and clinical guidelines.

Exercise selection, phase progression, contraindication rules, and outcome measures are sourced from these references. No exercise or clinical rule is fabricated.

---

## 3. Protocol Architecture

### 3.1 Condition Protocols

| Protocol | Duration | Primary Indication |
|----------|----------|--------------------|
| TPLO Post-Surgical | 16 weeks | Tibial plateau leveling osteotomy recovery |
| IVDD Neurological | 12 weeks | Intervertebral disc disease (conservative or post-surgical) |
| Osteoarthritis (OA) | 16 weeks | Multimodal OA management |
| Geriatric Mobility | 16 weeks | Age-related mobility decline, sarcopenia |

### 3.2 Phase Structure (Per Protocol)

Each protocol contains 4 sequential phases:

| Phase | Name | Clinical Focus |
|-------|------|----------------|
| 1 | Acute / Protection | Pain management, edema control, passive ROM, tissue healing |
| 2 | Early Mobility | Active-assisted movement, gentle weight bearing, proprioceptive retraining |
| 3 | Strengthening | Progressive resistance, core stability, endurance building |
| 4 | Return-to-Function / Maintenance | Functional activities, sport-specific drills, lifelong maintenance |

Phase 4 for chronic conditions (OA, Geriatric) represents lifelong maintenance rather than discharge.

---

## 4. Phase Progression Logic

Phase transitions are **gated**, not time-based. Advancement requires documented achievement of phase-specific progression criteria:

- **Phase 1 → 2:** Pain controlled (≤3/10), incision healed, passive ROM within 80% of contralateral
- **Phase 2 → 3:** Consistent weight bearing, lameness grade ≤2/5 LOAD, active ROM normalized
- **Phase 3 → 4:** Functional strength restored, gait symmetry achieved, owner compliance confirmed

The protocol engine assigns exercises to time-based week ranges but annotates progression criteria at each phase boundary. The supervising veterinarian determines when to advance based on clinical re-evaluation.

---

## 5. Exercise Selection Methodology

### 5.1 Exercise Library

The platform contains 170+ exercises classified across multiple dimensions:

- **Intervention Type:** Passive, Active-Assisted, Active, Strengthening, Neuromuscular, Aquatic, Manual Therapy, Modalities, Functional
- **Phase Appropriateness:** Mapped to specific rehabilitation phases
- **Evidence Grade:** A (strong RCT evidence), B (moderate evidence), C (limited evidence), EO (expert opinion)
- **Difficulty Level:** Easy, Moderate, Advanced
- **Equipment Requirements:** Flagged for aquatic access, specific modalities, specialized equipment

### 5.2 Selection Algorithm

For each protocol week:
1. Determine the current phase based on week number and protocol type
2. Retrieve the exercise list defined for that phase
3. Apply equipment gating (aquatic access flag, individual modality flags)
4. Apply contraindication enforcement (patient-specific exclusions)
5. Attach evidence citations per exercise code
6. Return the filtered, annotated exercise list

### 5.3 Determinism

The protocol engine is fully deterministic: identical inputs always produce identical outputs. No randomization, no AI inference, no probabilistic selection. This ensures reproducibility and auditability.

---

## 6. Contraindication Enforcement

The system maintains a contraindication map of 15 patient condition categories, each mapped to exercise codes that must be excluded:

- Cardiac conditions → exclude aquatic therapy, treadmill, jogging
- Respiratory conditions → exclude aquatic therapy
- Seizure/epilepsy → exclude aquatic therapy
- Open wounds → exclude aquatic therapy, therapeutic ultrasound
- Neoplasia/cancer → exclude therapeutic laser, therapeutic ultrasound
- Pregnancy → exclude electrotherapy (TENS, NMES, PEMF)
- Implant/hardware → exclude shockwave, therapeutic ultrasound at site
- Coagulopathy/bleeding → exclude deep tissue massage, shockwave
- Spinal instability → exclude spinal mobilization, high-impact exercises
- Non-ambulatory patients → exclude all weight-bearing exercises

The `getExcludedCodes()` function scans diagnosis text, contraindication fields, medical history, medications, and mobility level for condition keywords.

---

## 7. Evidence Grading System

| Grade | Description | Source Standard |
|-------|-------------|-----------------|
| A | Strong evidence from randomized controlled trials or systematic reviews | Millis & Levine Ch. 1 |
| B | Moderate evidence from controlled studies or well-designed cohort studies | Millis & Levine Ch. 1 |
| C | Limited evidence from case series, expert consensus, or extrapolation | Millis & Levine Ch. 1 |
| EO | Expert opinion based on clinical experience and physiologic rationale | ACVSMR position statements |

Each exercise in the protocol output includes its evidence citation, linking to the specific textbook chapter or peer-reviewed reference.

---

## 8. Outcome Measures

### 8.1 Canine Brief Pain Inventory (CBPI)

The platform implements the validated CBPI instrument:

- **Pain Severity Scale (PSS):** 4 items (worst, least, average, current), each 0-10
- **Pain Interference Scale (PIS):** 6 items (activity, enjoyment, rising, walking, running, climbing), each 0-10
- **Computed Scores:** PSS = mean of 4 severity items; PIS = mean of 6 interference items

**Reference:** Brown DC, Boston RC, Coyne JC, Farrar JT. Development and psychometric testing of an instrument designed to measure chronic pain in dogs with osteoarthritis. *Am J Vet Res.* 2007;68(6):631-637.

### 8.2 Additional Measures

- **SOAP Documentation:** Subjective, Objective, Assessment, Plan per session
- **Pain Scoring:** Pre/post session VAS (0-10)
- **Lameness Grading:** LOAD scale (0-5)
- **Range of Motion:** Joint-specific flexion/extension in degrees
- **Girth Measurements:** Circumferential measurements at standardized sites for muscle atrophy monitoring
- **Weight-Bearing Status:** Qualitative assessment from non-weight-bearing to full weight-bearing

---

## 9. Safety Architecture

### 9.1 Red-Flag Detection

The intake validation system screens for conditions that contraindicate or require modification of rehabilitation protocols:

| Red Flag | Action | Threshold |
|----------|--------|-----------|
| Pain score ≥ 8/10 | **Block generation** | Stabilize pain before rehab |
| Absent deep pain perception | **Block generation** | Immediate neurological evaluation |
| Incision complications (dehiscence, infection, drainage) | **Block generation** | Resolve surgical site before rehab |
| Absent neurological function | **Warning** | Verify neuro status before weight-bearing |
| Lameness grade 5/5 | **Warning** | Restrict to passive/non-weight-bearing |
| Complication keywords in history (seroma, implant failure, non-union, osteomyelitis, septic) | **Warning** | Verify resolved before advancing |

### 9.2 Safety-Screened Progressions

Exercise intensity progressions within each phase are pre-defined by the protocol. No phase auto-advances. Exercise parameters (sets, reps, duration) increase gradually within defined ranges. No intensity jumps between consecutive weeks.

---

## 10. References

1. Millis DL, Levine D. *Canine Rehabilitation and Physical Therapy.* 2nd ed. St. Louis, MO: Elsevier Saunders; 2014.
2. Zink MC, Van Dyke JB. *Canine Sports Medicine and Rehabilitation.* 2nd ed. Ames, IA: Wiley-Blackwell; 2018.
3. Brown DC, Boston RC, Coyne JC, Farrar JT. Development and psychometric testing of an instrument designed to measure chronic pain in dogs with osteoarthritis. *Am J Vet Res.* 2007;68(6):631-637.
4. Brown DC, Boston RC, Farrar JT. Use of an activity monitor to detect response to treatment in dogs with osteoarthritis. *J Am Vet Med Assoc.* 2010;237(1):66-70.
5. ACVSMR Position Statements on Canine Rehabilitation Standards.
6. Levine D, Bockstahler B. Multimodal management of canine osteoarthritis. 2nd ed. In: Millis DL, Levine D, eds. *Canine Rehabilitation and Physical Therapy.* Elsevier; 2014.

---

*This document is maintained as part of the K9 Rehab Pro enterprise documentation suite. It reflects the clinical methodology implemented in the protocol engine as of the document date.*
