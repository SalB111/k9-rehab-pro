// ============================================================================
// seed-demo-patients.js
// Seeds 5 fully-realized demo patients for the Dr. Bibevski investor demo.
// Every `dashboard_data` key matches EXACTLY what a Dashboard panel reads.
// ----------------------------------------------------------------------------
// Key format the UI expects:
//   client::Patient Name                (matches F label / update key)
//   treatment::Approach                 ("Surgical" | "Conservative" | "Palliative")
//   metrics::Stifle — Flexion (R)       (em-dash, per-joint-per-side)
//   metrics::Right Thigh Circumference (cm)
//   equipment::Hydrotherapy::Underwater Treadmill (UWTM) = "true"
//   goals::Primary Rehabilitation Goals = "||"-joined MultiF values
//   conditioning::Conditioning Phase
//
// Run:  cd backend && node seed-demo-patients.js
// Idempotent: updates dashboard_data in-place if patient (name, breed) exists.
// ============================================================================

const { initialize, createTables, get, run } = require("./db-provider");

// Shared clinic / clinician identity across all 5 patients
const CLINIC = {
  clinician: "Dr. Salvatore Bonanno, CCRN",
  nurse:     "Jenna Martinez, CVT",
};

// ── Helpers for building the dashboard_data blob ────────────────────────────
const clientFields = (c) => ({
  "client::Client First Name": c.first,
  "client::Client Last Name":  c.last,
  "client::Phone":             c.phone,
  "client::Email":             c.email,
  "client::Street Address":    c.street,
  "client::Apt / Suite / Unit": c.apt || "",
  "client::Zip / Postal Code": c.zip,
  "client::City":              c.city,
  "client::State / Province":  c.state,
  "client::Country":           c.country || "United States",
  "client::Emergency Contact": c.emergency,
  "client::Referred By":       c.referredBy,
  "client::Pet Insurance Provider": c.insurance,
  "client::Primary Veterinarian": c.primaryVet,
});

const patientFields = (p) => ({
  "client::Patient Name":     p.name,
  "client::Species":          p.species,
  "client::Breed":            p.breed,
  "client::Sex":              p.sex,
  "client::Age (years)":      String(p.age),
  "client::Date of Birth":    p.dob,
  "client::Color / Markings": p.colors,
  "client::Weight (lbs)":     String(p.lbs),
  "client::Weight (kg)":      p.kg,
  "client::Microchip #":      p.chip,
});

const globalFields = () => ({
  "global::Clinician Name":  CLINIC.clinician,
  "global::Nurse Assistant": CLINIC.nurse,
});

// Expand an equipment flag list into the exact nested keys the Equipment
// panel renders. Accepts human-friendly shortcodes; unknown codes are
// ignored (safer than silently mis-writing).
const EQUIP_CODE = {
  uwtm:       ["Hydrotherapy",                "Underwater Treadmill (UWTM)"],
  pool:       ["Hydrotherapy",                "Therapy Pool — Full submersion"],
  landtread:  ["Land Exercise Equipment",     "Land Treadmill"],
  cavaletti:  ["Land Exercise Equipment",     "Cavaletti Rail Set"],
  discs:      ["Land Exercise Equipment",     "Balance Discs — Set"],
  wobble:     ["Land Exercise Equipment",     "Wobble Board"],
  physioball: ["Land Exercise Equipment",     "Physioroll / Peanut Ball"],
  resband:    ["Land Exercise Equipment",     "Resistance Bands / Theraband"],
  ramps:      ["Land Exercise Equipment",     "Ramps"],
  cones:      ["Land Exercise Equipment",     "Cone Set"],
  nmes:       ["Electrotherapy & Modalities", "NMES Unit (Neuromuscular E-Stim)"],
  tens:       ["Electrotherapy & Modalities", "TENS Unit"],
  laser4:     ["Electrotherapy & Modalities", "Class IV Therapeutic Laser"],
  shockwave:  ["Electrotherapy & Modalities", "Shockwave Therapy"],
  pemf:       ["Electrotherapy & Modalities", "PEMF (Pulsed Electromagnetic Field)"],
  heat:       ["Electrotherapy & Modalities", "Moist Heat / Hydrocollator"],
  cryo:       ["Electrotherapy & Modalities", "Cryotherapy Unit"],
  goniom:     ["Manual Therapy & Assessment", "Standard Goniometer"],
  tape:       ["Manual Therapy & Assessment", "Measuring Tape (thigh circumference)"],
  slingR:     ["Support & Mobility",          "Slings — Rear end"],
  slingF:     ["Support & Mobility",          "Slings — Front end"],
  harness:    ["Support & Mobility",          "Full-body Harness"],
  mats:       ["Support & Mobility",          "Non-slip Flooring / Mats"],
};
const equipmentFields = (codes) => {
  const out = {};
  for (const code of codes) {
    const pair = EQUIP_CODE[code];
    if (pair) out[`equipment::${pair[0]}::${pair[1]}`] = "true";
  }
  return out;
};

// Goniometry: accepts { "Stifle": { R:{flex,ext}, L:{flex,ext} } } and writes
// into the exact metrics::<Joint> — Flexion (R|L) / Extension (R|L) keys.
const goniometryFields = (measurements) => {
  const out = {};
  for (const [joint, sides] of Object.entries(measurements)) {
    for (const side of ["R", "L"]) {
      const m = sides[side];
      if (!m) continue;
      if (m.flex != null) out[`metrics::${joint} — Flexion (${side})`] = String(m.flex);
      if (m.ext  != null) out[`metrics::${joint} — Extension (${side})`] = String(m.ext);
    }
  }
  return out;
};

const thighFields = (t) => ({
  ...(t.rightThighCm != null ? { "metrics::Right Thigh Circumference (cm)": String(t.rightThighCm) } : {}),
  ...(t.leftThighCm  != null ? { "metrics::Left Thigh Circumference (cm)":  String(t.leftThighCm)  } : {}),
  ...(t.notes ? { "metrics::Goniometry Notes": t.notes } : {}),
});

// ── The 5 patients ──────────────────────────────────────────────────────────
const DEMO_PATIENTS = [

  // ── 1. BELLA — TPLO POST-OP LABRADOR ──────────────────────────────────
  {
    core: {
      name: "Bella", species: "canine", breed: "Labrador Retriever",
      age: 2, weight: 64, sex: "Female — Spayed",
      condition: "TPLO Post-Op (CCL Rupture)",
      affected_region: "Right Stifle",
      surgery_date: "2026-03-21",
      lameness_grade: 2, body_condition_score: 5, pain_level: 3,
      mobility_level: "Mild — slight limp, mostly mobile",
      current_medications: "Carprofen 75mg BID, Gabapentin 100mg TID, Trazodone 100mg PRN",
      medical_history: "R CCL rupture confirmed on tibial compression test 2026-03-10. TPLO performed by Dr. Rodriguez on 2026-03-21. 4 weeks post-op. Incision healed; sutures removed at day 14. No complications. Owner reports consistent weight-bearing at home.",
      special_instructions: "Leash-restricted activity for 8 weeks post-op. No stairs, no running, no jumping. Toe-touching to 50% weight-bearing expected. Begin controlled aquatic therapy at week 4.",
      client_name: "Sarah Thompson",
      client_email: "sarah.thompson@gmail.com",
      client_phone: "(954) 555-0142",
      referring_vet: "Dr. Marcus Rodriguez — Fort Lauderdale Surgery Center",
      rom_joint: "Right Stifle", rom_flexion: "118", rom_extension: "155",
      rom_flexion_contralateral: "135", rom_extension_contralateral: "160",
    },
    dashboard_data: {
      ...globalFields(),
      ...clientFields({
        first: "Sarah", last: "Thompson",
        phone: "(954) 555-0142", email: "sarah.thompson@gmail.com",
        street: "2847 NE 14th Avenue",
        zip: "33305", city: "Fort Lauderdale", state: "FL",
        emergency: "Mark Thompson (spouse) (954) 555-0167",
        referredBy: "Dr. Marcus Rodriguez — Fort Lauderdale Surgery Center",
        insurance: "Trupanion",
        primaryVet: "Dr. Jane Parker — BluePearl Fort Lauderdale",
      }),
      ...patientFields({
        name: "Bella", species: "Canine", breed: "Labrador Retriever",
        sex: "Female — Spayed", age: 2, dob: "2024-01-15",
        colors: "Yellow||Solid", lbs: 64, kg: "29.0",
        chip: "985112006847293",
      }),

      // Diagnostics (MultiF uses || separator; each option must match dropdown text exactly)
      "diagnostics::Imaging": "Radiograph (X-Ray)||CT Scan",
      "diagnostics::Radiograph Findings": "Right stifle: post-TPLO — tibial plateau rotated appropriately (5°), plate and 6 cortical screws in good position. No implant failure. Mild effusion expected at 4w post-op. No meniscal concerns on recheck.",
      "diagnostics::Laboratory Work": "CBC||Chemistry Panel",
      "diagnostics::Lab Results Notes": "Pre-op bloodwork WNL. Post-op CBC at day 7 showed mild neutrophilia (resolved). Chemistry panel normal.",

      // Assessment (matches CSU / Lameness / Neuro dropdown option strings EXACTLY)
      "assessment::Chief Complaint": "Right hind lameness post-TPLO — 4 weeks post-op, transitioning from toe-touching to partial weight bearing.",
      "assessment::Relevant Medical & Surgical History": "R CCL rupture diagnosed 2026-03-10 (positive tibial compression, cranial drawer Grade 1). TPLO performed 2026-03-21 with concurrent partial medial meniscectomy. Healing without complication.",
      "assessment::Primary Diagnosis": "Right cranial cruciate ligament (CCL) rupture s/p TPLO",
      "assessment::CSU Acute Pain Score (0–4)": "1 — Minor discomfort, responds to petting",
      "assessment::Numeric Rating Scale (NRS 0–10)": "3",
      "assessment::Lameness Grade": "Grade 2 — Mild, consistent",
      "assessment::Neurological Grade (Frankel Modified)": "Grade 0 — No pain, no deficits",
      "assessment::Deep Pain Perception": "Present — bilateral",
      "assessment::Initial Assessment Narrative": "4-week post-TPLO recheck. Consistent toe-touching progressing to 50% partial weight-bearing at walk. No mechanical lameness at trot. Incision fully healed, no erythema or dehiscence. Owner compliant with restricted activity. Ready for aquatic progression.",

      // Treatment (Approach is one of "Surgical" | "Conservative" | "Palliative")
      "treatment::Approach": "Surgical",
      "treatment::Surgery Type": "TPLO — Tibial Plateau Leveling Osteotomy",
      "treatment::Surgeon Name": "Dr. Marcus Rodriguez, DACVS",
      "treatment::Surgery Date": "2026-03-21",
      "treatment::Weight Bearing Status": "Partial weight bearing (PWB)",
      "treatment::Affected Limb(s)": "Right hindlimb (RH)",
      "treatment::Activity Restrictions": "Leash-only x 8 weeks post-op. No stairs, running, or jumping. Controlled walks 5 min 4x/day. Begin aquatic week 4.",
      "treatment::E-Collar Required": "",
      "treatment::Strict Crate Rest": "",
      "treatment::Sling Assist Required": "",
      "treatment::Incision Status": "Fully healed / staples removed",

      // Metrics — goniometry per joint per side (right affected, left contralateral)
      "metrics::BCS (1–9)": "5",
      ...goniometryFields({
        "Stifle": { R: { flex: 118, ext: 155 }, L: { flex: 135, ext: 160 } },
        "Hip":    { R: { flex: 62,  ext: 158 }, L: { flex: 65,  ext: 160 } },
      }),
      ...thighFields({
        rightThighCm: 34.5, leftThighCm: 38.0,
        notes: "Affected R hind thigh girth 3.5 cm less than contralateral — disuse atrophy post-op, expected.",
      }),

      // Equipment — nested category::item keys
      ...equipmentFields(["uwtm","pool","laser4","nmes","tens","goniom","tape","slingR","mats"]),

      // Home environment
      "home::Primary Flooring — Indoor": "Mixed — mostly carpet",
      "home::Available Space Indoors": "Multiple rooms available",
      "home::Indoor Stairs": "Full staircase — avoidable",
      "home::Stair Frequency": "Only when necessary",
      "home::Outdoor Space Size": "Medium fenced yard",
      "home::Time Available Per Session (min)": "20",
      "home::Session Frequency (per day)": "3",
      "home::Owner Confidence with Exercises": "High — asks good questions, follows instructions carefully",

      // Goals (Primary is MultiF ||-joined; Short/Long-Term are free text)
      "goals::Primary Rehabilitation Goals": "Post-surgical recovery — full function||Return to sport or working function",
      "goals::Short-Term Clinical Goals": "Achieve 4/5 weight-bearing at trot within 2 weeks. ROM flexion 125°, extension 160°. HCPI <6. Symmetric stance time improving.",
      "goals::Long-Term Clinical Goals": "Full weight bearing, thigh circumference within 1 cm bilaterally, full stifle ROM restored (flex ≤45°, ext ≥160°). Return to off-leash activity.",
      "goals::Short-Term Functional Goals": "Navigate 3 steps independently, complete 10-min controlled leash walk without lameness.",
      "goals::Long-Term Functional Goals": "Return to swimming, off-leash play, and running. No re-injury risk behaviors.",

      // Conditioning
      "conditioning::Conditioning Phase": "Return to sport — early",
      "conditioning::Current Activity Level": "Low — short leash walks",

      // Clinical notes
      "client::Clinical Notes": "Highly motivated owner. Patient compliant with activity restriction. Excellent aquatic candidate — begin UWTM weeks 4–6 then progress to swimming.",
    }
  },

  // ── 2. WINSTON — IVDD FRENCH BULLDOG ──────────────────────────────────
  {
    core: {
      name: "Winston", species: "canine", breed: "French Bulldog",
      age: 4, weight: 26, sex: "Male — Neutered",
      condition: "IVDD — T13-L1 Hansen Type I",
      affected_region: "Thoracolumbar",
      surgery_date: "2026-02-14",
      lameness_grade: 3, body_condition_score: 6, pain_level: 4,
      mobility_level: "Moderate — noticeable weakness, avoids jumping",
      current_medications: "Gabapentin 100mg TID, Prednisolone 5mg SID (tapering), Pepcid AC 10mg SID",
      medical_history: "Acute T13-L1 Hansen Type I disc extrusion 2026-02-10. Neurologic grade 3 (non-ambulatory paraparesis). Hemilaminectomy performed by Dr. Chen on 2026-02-14. Full recovery to ambulatory paraparesis by week 4. Deep pain present throughout. Now 9 weeks post-op.",
      special_instructions: "Strict crate rest x 8 weeks post-op (completed). Ramps instead of stairs. Harness only — no collar leashing. No jumping on/off furniture. Weight management critical (BCS 6/9).",
      client_name: "David Chen",
      client_email: "dchen.winston@outlook.com",
      client_phone: "(305) 555-0289",
      referring_vet: "Dr. Amanda Chen — Miami Veterinary Neurology",
      rom_joint: "Lumbosacral (functional)",
      rom_flexion: "", rom_extension: "",
      rom_flexion_contralateral: "", rom_extension_contralateral: "",
    },
    dashboard_data: {
      ...globalFields(),
      ...clientFields({
        first: "David", last: "Chen",
        phone: "(305) 555-0289", email: "dchen.winston@outlook.com",
        street: "1440 Brickell Bay Drive", apt: "Unit 2104",
        zip: "33131", city: "Miami", state: "FL",
        emergency: "Linda Chen (mother) (305) 555-0290",
        referredBy: "Dr. Amanda Chen — Miami Veterinary Neurology",
        insurance: "Nationwide Pet",
        primaryVet: "Dr. Ravi Patel — Brickell Animal Hospital",
      }),
      ...patientFields({
        name: "Winston", species: "Canine", breed: "French Bulldog",
        sex: "Male — Neutered", age: 4, dob: "2022-06-03",
        colors: "Fawn||Brindle Points", lbs: 26, kg: "11.8",
        chip: "985112009473621",
      }),

      "diagnostics::Imaging": "MRI||Myelogram",
      "diagnostics::MRI Findings": "T13-L1 right-sided Hansen Type I disc extrusion with 60% spinal cord compression. No myelomalacia. Post-op MRI at 8w showed appropriate decompression with mild residual cord signal change at T13-L1.",
      "diagnostics::Laboratory Work": "CBC||Chemistry Panel||Urinalysis",
      "diagnostics::Lab Results Notes": "All pre-op and post-op labs WNL. Urinary retention resolved by post-op day 5.",

      "assessment::Chief Complaint": "Post-IVDD rehabilitation — 9 weeks post-T13-L1 hemilaminectomy. Ambulatory paraparesis improving, proprioceptive deficits persisting.",
      "assessment::Relevant Medical & Surgical History": "Acute T13-L1 Hansen I disc extrusion 2026-02-10 with Grade 3 (non-ambulatory paraparesis). R-sided hemilaminectomy 2026-02-14 by Dr. Chen. Deep pain positive throughout.",
      "assessment::Primary Diagnosis": "T13-L1 Hansen Type I disc extrusion s/p hemilaminectomy",
      "assessment::CSU Acute Pain Score (0–4)": "2 — Moderate pain, reacts to palpation",
      "assessment::Numeric Rating Scale (NRS 0–10)": "4",
      "assessment::Lameness Grade": "Grade 3 — Moderate, consistent weight bearing",
      "assessment::Neurological Grade (Frankel Modified)": "Grade 2 — Paresis, ambulatory",
      "assessment::Deep Pain Perception": "Present — bilateral",
      "assessment::Initial Assessment Narrative": "9w post-T13-L1 hemilaminectomy. Ambulatory paraparesis — weight bearing with proprioceptive ataxia bilateral hind. Intermittent R hind knuckling, improving weekly. Patellar reflexes WNL, crossed-extensor normalized week 6. Excellent candidate for neuro rehabilitation.",

      "treatment::Approach": "Surgical",
      "treatment::Surgery Type": "Spinal Surgery — Hemilaminectomy",
      "treatment::Surgeon Name": "Dr. Amanda Chen, DACVIM (Neurology)",
      "treatment::Surgery Date": "2026-02-14",
      "treatment::Weight Bearing Status": "Partial weight bearing (PWB)",
      "treatment::Affected Limb(s)": "Both hindlimbs",
      "treatment::Activity Restrictions": "Harness only — no collar leashing. Ramps instead of stairs. Crate rest complete. No jumping on/off furniture.",
      "treatment::E-Collar Required": "",
      "treatment::Strict Crate Rest": "",
      "treatment::Sling Assist Required": "true",
      "treatment::Incision Status": "Fully healed / staples removed",

      "metrics::BCS (1–9)": "6",
      ...goniometryFields({
        "Hip":    { R: { flex: 58, ext: 150 }, L: { flex: 60, ext: 152 } },
        "Stifle": { R: { flex: 48, ext: 158 }, L: { flex: 50, ext: 160 } },
      }),
      ...thighFields({
        rightThighCm: 22.0, leftThighCm: 22.5,
        notes: "Symmetric hind-limb girth — muscle mass preserved by 9-week rehab program post-op.",
      }),

      ...equipmentFields(["uwtm","laser4","nmes","tens","discs","wobble","physioball","cavaletti","cones","slingR","harness","mats","goniom","tape"]),

      "home::Primary Flooring — Indoor": "Rubber / Non-slip mats installed",
      "home::Available Space Indoors": "Multiple rooms available",
      "home::Indoor Stairs": "Has ramp available",
      "home::Stair Frequency": "Can be fully avoided",
      "home::Outdoor Space Size": "Small — balcony only",
      "home::Time Available Per Session (min)": "30",
      "home::Session Frequency (per day)": "3",
      "home::Owner Confidence with Exercises": "Very high — executes CIMT and proprioceptive drills correctly",

      "goals::Primary Rehabilitation Goals": "Neurological rehabilitation — ambulation||Weight management — target BCS 5",
      "goals::Short-Term Clinical Goals": "Normal proprioception bilateral hind within 4 weeks. Weight loss of 2 lbs (26 → 24). Sustained 15-min walk without knuckling.",
      "goals::Long-Term Clinical Goals": "Return to pre-injury activity level. BCS 5/9. Symmetric pelvic limb muscling. Independent ramp/stair navigation.",
      "goals::Short-Term Functional Goals": "Complete Cavaletti pattern without errors. Rise from down unassisted 5/5 trials.",
      "goals::Long-Term Functional Goals": "Jump onto bed (14-inch) independently. 30-min walk without fatigue.",

      "conditioning::Conditioning Phase": "Post-recovery reconditioning",
      "conditioning::Current Activity Level": "Moderate — regular walks",

      "client::Clinical Notes": "French Bulldog breed predisposition to IVDD requires lifelong spinal conditioning + weight management. Owner is engaged and responsive to education. Priority: BCS 6→5 over next 12 weeks.",
    }
  },

  // ── 3. CHARLIE — BILATERAL HIP OA GOLDEN ──────────────────────────────
  {
    core: {
      name: "Charlie", species: "canine", breed: "Golden Retriever",
      age: 8, weight: 78, sex: "Male — Neutered",
      condition: "Bilateral Hip Osteoarthritis (moderate-severe)",
      affected_region: "Bilateral Hip (R>L)",
      surgery_date: null,
      lameness_grade: 2, body_condition_score: 6, pain_level: 4,
      mobility_level: "Moderate — visibly stiff after rest, reluctant to climb",
      current_medications: "Galliprant 100mg SID, Librela (bedinvetmab) monthly, Adequan 2mg/kg biweekly, Omega-3 EPA/DHA 1500mg SID, Glucosamine/Chondroitin SID",
      medical_history: "Progressive bilateral coxofemoral OA diagnosed 2024. Managed medically. HCPI 18/44 at presentation — consistent with moderate chronic pain. No surgical candidate (owner opted for conservative). Conservative management plan in place x 18 months.",
      special_instructions: "Moderate impact only. No repetitive jumping. Heated orthopedic bedding. Weight loss to BCS 5/9 is top priority. Reassess HCPI every 4 weeks.",
      client_name: "Patricia Williams",
      client_email: "patricia.williams1958@yahoo.com",
      client_phone: "(561) 555-0374",
      referring_vet: "Dr. Stephen Nakamura — Boca Raton Animal Hospital",
      rom_joint: "Right Hip", rom_flexion: "82", rom_extension: "125",
      rom_flexion_contralateral: "95", rom_extension_contralateral: "140",
    },
    dashboard_data: {
      ...globalFields(),
      ...clientFields({
        first: "Patricia", last: "Williams",
        phone: "(561) 555-0374", email: "patricia.williams1958@yahoo.com",
        street: "725 Spanish River Blvd",
        zip: "33431", city: "Boca Raton", state: "FL",
        emergency: "Robert Williams (son) (561) 555-0389",
        referredBy: "Dr. Stephen Nakamura — Boca Raton Animal Hospital",
        insurance: "Healthy Paws",
        primaryVet: "Dr. Stephen Nakamura — Boca Raton Animal Hospital",
      }),
      ...patientFields({
        name: "Charlie", species: "Canine", breed: "Golden Retriever",
        sex: "Male — Neutered", age: 8, dob: "2018-05-22",
        colors: "Golden||Solid", lbs: 78, kg: "35.4",
        chip: "985112007238146",
      }),

      "diagnostics::Imaging": "Radiograph (X-Ray)",
      "diagnostics::Radiograph Findings": "Bilateral coxofemoral OA. R hip: severe degenerative changes, femoral head remodeling, subchondral sclerosis, Norberg angle <90°. L hip: moderate OA, mild femoral head flattening, Norberg angle 95°. Spondylosis L7-S1. No pathologic fracture.",
      "diagnostics::Laboratory Work": "CBC||Chemistry Panel||Urinalysis",
      "diagnostics::Lab Results Notes": "All WNL. ALT mildly elevated (consistent with senior + long-term NSAID); monitor q3mo. Urinalysis normal.",

      "assessment::Chief Complaint": "Chronic bilateral pelvic limb stiffness (R>L). Reluctant to climb stairs, shorter walk tolerance over past 6 months.",
      "assessment::Relevant Medical & Surgical History": "Bilateral coxofemoral OA diagnosed 2024 on referral imaging. Owner declined THR. Conservative multimodal management x 18 months — good response.",
      "assessment::Primary Diagnosis": "Bilateral coxofemoral osteoarthritis (R>L), spondylosis L7-S1",
      "assessment::CSU Acute Pain Score (0–4)": "2 — Moderate pain, reacts to palpation",
      "assessment::Numeric Rating Scale (NRS 0–10)": "4",
      "assessment::Lameness Grade": "Grade 2 — Mild, consistent",
      "assessment::Neurological Grade (Frankel Modified)": "Grade 0 — No pain, no deficits",
      "assessment::Deep Pain Perception": "Present — bilateral",
      "assessment::Initial Assessment Narrative": "8y M/N Golden with 2y history of progressive bilateral hip OA. Multimodal conservative management (NSAID + anti-NGF mAb + DMOAD + nutraceuticals) showing excellent HCPI response since Librela start. Stiff on rising, loosens with 5-min warm-up. HCPI 14/44 → moderate chronic pain; Librela has been transformative.",

      "treatment::Approach": "Conservative",
      "treatment::Weight Bearing Status": "Full weight bearing — no lameness",
      "treatment::Affected Limb(s)": "Both hindlimbs",
      "treatment::Activity Restrictions": "Moderate impact. Leash walks 20-30 min 2x/day. No repetitive fetch. No stairs when reluctant.",

      "metrics::BCS (1–9)": "6",
      ...goniometryFields({
        "Hip":    { R: { flex: 82,  ext: 125 }, L: { flex: 95,  ext: 140 } },
        "Stifle": { R: { flex: 42,  ext: 158 }, L: { flex: 44,  ext: 160 } },
      }),
      ...thighFields({
        rightThighCm: 41.0, leftThighCm: 43.0,
        notes: "R hind thigh girth 2 cm less than left — disuse atrophy from pain-avoidant loading.",
      }),

      ...equipmentFields(["uwtm","pool","laser4","shockwave","heat","pemf","landtread","cavaletti","cones","harness","mats","goniom","tape"]),

      "home::Primary Flooring — Indoor": "Mixed — mostly carpet",
      "home::Available Space Indoors": "Multiple rooms available",
      "home::Indoor Stairs": "1–3 steps to exit",
      "home::Stair Frequency": "Once daily",
      "home::Outdoor Space Size": "Large fenced yard",
      "home::Time Available Per Session (min)": "45",
      "home::Session Frequency (per day)": "2",
      "home::Owner Confidence with Exercises": "Moderate — retired, highly compliant, very attentive",

      "goals::Primary Rehabilitation Goals": "Pain management — improve quality of life||Weight management — target BCS 5||Senior wellness / mobility maintenance",
      "goals::Short-Term Clinical Goals": "Weight loss 3 lbs (78 → 75) in 4 weeks. HCPI < 12. Tolerate 30-min leash walk without stopping. Maintain ROM at baseline.",
      "goals::Long-Term Clinical Goals": "BCS 5/9 within 16 weeks. HCPI < 8. Comfortable on stairs. Improve hip extension ROM by 5° bilaterally.",
      "goals::Quality of Life Goal": "Maintain comfortable mobility, preserve ability to rise unassisted, reduce post-activity stiffness.",
      "goals::Owner Goals & Expectations": "Keep Charlie comfortable and active for as long as possible. Avoid additional surgery. Family outings and beach walks remain a priority.",

      "conditioning::Conditioning Phase": "Senior wellness",
      "conditioning::Current Activity Level": "Moderate — regular walks",

      "client::Clinical Notes": "Perfect candidate for aquatic therapy + weight management. Owner highly committed (retired, flexible schedule). Librela has been transformative — recheck dosing in 3 months. Reassess HCPI q4wk.",
    }
  },

  // ── 4. LUNA — PARTIAL CCL BORDER COLLIE (CONSERVATIVE) ────────────────
  {
    core: {
      name: "Luna", species: "canine", breed: "Border Collie",
      age: 3, weight: 42, sex: "Female — Spayed",
      condition: "Partial CCL Tear — Conservative Management",
      affected_region: "Left Stifle",
      surgery_date: null,
      lameness_grade: 1, body_condition_score: 4, pain_level: 2,
      mobility_level: "Mild — lameness at trot, resolves with rest",
      current_medications: "Carprofen 50mg BID (first 2 weeks), Gabapentin 100mg BID PRN, Adequan 2mg/kg biweekly",
      medical_history: "Acute L hind lameness during agility trial 2026-03-05. Grade 1 cranial drawer positive; positive tibial compression. Diagnosed partial CCL tear. Owner opted for 6-week conservative trial given young age, high athletic demand, partial (not complete) tear. Week 6 of conservative protocol — responding well.",
      special_instructions: "Strict controlled activity x 8 weeks from diagnosis. No agility. Hydrotherapy 2x/week. Reassess drawer + TCT at 8w. If progression or persistent lameness, TPLO indicated.",
      client_name: "Michael Johnson",
      client_email: "mj.agility@gmail.com",
      client_phone: "(786) 555-0291",
      referring_vet: "Dr. Kayla Martinez — K9 Sports Medicine Miami",
      rom_joint: "Left Stifle", rom_flexion: "125", rom_extension: "155",
      rom_flexion_contralateral: "135", rom_extension_contralateral: "162",
    },
    dashboard_data: {
      ...globalFields(),
      ...clientFields({
        first: "Michael", last: "Johnson",
        phone: "(786) 555-0291", email: "mj.agility@gmail.com",
        street: "8420 SW 132nd Avenue",
        zip: "33183", city: "Miami", state: "FL",
        emergency: "Rebecca Johnson (spouse) (786) 555-0295",
        referredBy: "Dr. Kayla Martinez — K9 Sports Medicine Miami",
        insurance: "Trupanion",
        primaryVet: "Dr. Kayla Martinez — K9 Sports Medicine Miami",
      }),
      ...patientFields({
        name: "Luna", species: "Canine", breed: "Border Collie",
        sex: "Female — Spayed", age: 3, dob: "2023-03-18",
        colors: "Black and White||Tricolor", lbs: 42, kg: "19.1",
        chip: "985112005318472",
      }),

      "diagnostics::Imaging": "Radiograph (X-Ray)||Ultrasound",
      "diagnostics::Radiograph Findings": "L stifle: subtle joint effusion with cranial displacement of infrapatellar fat pad. No obvious osteophytes. Tibial plateau angle 25° (normal). No avulsion fragment.",
      "diagnostics::Ultrasound Findings": "Partial CCL tear confirmed on stifle ultrasound — approximately 40% fiber disruption of craniomedial band. No meniscal tear visible.",
      "diagnostics::Laboratory Work": "CBC||Chemistry Panel",
      "diagnostics::Lab Results Notes": "All WNL. Young healthy dog. Cleared for surgical candidacy if conservative fails.",

      "assessment::Chief Complaint": "L hind lameness during agility run 2026-03-05. Week 6 of conservative trial — subtle short-stride at trot, resolves with warm-up.",
      "assessment::Relevant Medical & Surgical History": "Elite agility athlete, no prior injuries. Acute L hind lameness 2026-03-05. Partial CCL tear confirmed on US.",
      "assessment::Primary Diagnosis": "L stifle partial CCL tear — conservative management, week 6/8",
      "assessment::CSU Acute Pain Score (0–4)": "1 — Minor discomfort, responds to petting",
      "assessment::Numeric Rating Scale (NRS 0–10)": "2",
      "assessment::Lameness Grade": "Grade 1 — Barely perceptible",
      "assessment::Neurological Grade (Frankel Modified)": "Grade 0 — No pain, no deficits",
      "assessment::Deep Pain Perception": "Present — bilateral",
      "assessment::Cranial Drawer Test": "Grade 1 (slight laxity) — unchanged from baseline, not progressing",
      "assessment::Tibial Compression Test": "Positive — subtle",
      "assessment::Initial Assessment Narrative": "3y F/S Border Collie, elite agility athlete. Week 6 of 8-week conservative trial for partial CCL tear. Cranial drawer Grade 1 stable (not progressing). Responding to controlled activity + hydrotherapy + DMOAD. Candidate for return-to-sport protocol if drawer remains Grade 1 at week 8 recheck.",

      "treatment::Approach": "Conservative",
      "treatment::Weight Bearing Status": "Full weight bearing — no lameness",
      "treatment::Affected Limb(s)": "Left hindlimb (LH)",
      "treatment::Activity Restrictions": "NO agility. NO off-leash. Controlled leash walks 15-20 min 3x/day. Hydrotherapy 2x/week. Reassess at 8w post-diagnosis.",

      "metrics::BCS (1–9)": "4",
      ...goniometryFields({
        "Stifle": { R: { flex: 135, ext: 162 }, L: { flex: 125, ext: 155 } },
        "Hip":    { R: { flex: 60,  ext: 160 }, L: { flex: 60,  ext: 158 } },
      }),
      ...thighFields({
        rightThighCm: 29.5, leftThighCm: 28.0,
        notes: "L hind thigh girth 1.5 cm less than R — mild disuse atrophy from 6 weeks restricted activity.",
      }),

      ...equipmentFields(["uwtm","pool","cavaletti","discs","wobble","physioball","nmes","cones","ramps","goniom","tape","mats"]),

      "home::Primary Flooring — Indoor": "Mixed — mostly carpet",
      "home::Available Space Indoors": "Dedicated exercise space",
      "home::Indoor Stairs": "1–3 steps to exit",
      "home::Stair Frequency": "Only when necessary",
      "home::Outdoor Space Size": "Large fenced yard",
      "home::Time Available Per Session (min)": "30",
      "home::Session Frequency (per day)": "3",
      "home::Owner Confidence with Exercises": "Expert — agility handler, excellent execution of rehab drills",

      "goals::Primary Rehabilitation Goals": "Return to sport or working function||Pain management — improve quality of life",
      "goals::Short-Term Clinical Goals": "Return to sound at trot post-warmup within 2 weeks. No progression of drawer. Thigh girth <1 cm difference.",
      "goals::Long-Term Clinical Goals": "Return to AKC agility competition with cleared veterinary sign-off (6 months). Symmetric musculature. No recurrence.",
      "goals::Short-Term Functional Goals": "Complete cavaletti pattern at trot without lameness. 20-min controlled leash walk sound.",
      "goals::Long-Term Functional Goals": "Weave poles, jump grids (12 in), A-frame, teeter — all at competition speed.",

      "conditioning::Conditioning Phase": "Sport-specific conditioning",
      "conditioning::Current Activity Level": "Low — short leash walks",

      "client::Clinical Notes": "Elite agility athlete. Owner is highly experienced and motivated. Conservative trial responding well — favor continued non-surgical if lameness continues to resolve. Re-evaluate drawer test at week 8 milestone.",
    }
  },

  // ── 5. MISTY — FELINE LUMBOSACRAL SPONDYLOSIS ─────────────────────────
  {
    core: {
      name: "Misty", species: "feline", breed: "Domestic Shorthair",
      age: 6, weight: 11, sex: "Female — Spayed",
      condition: "Lumbosacral Spondylosis with Mobility Decline",
      affected_region: "Lumbosacral Spine",
      surgery_date: null,
      lameness_grade: 1, body_condition_score: 6, pain_level: 3,
      mobility_level: "Mild — reluctant to jump, hesitation on stairs",
      current_medications: "Solensia (frunevetmab) 1mg/kg monthly, Gabapentin 50mg BID, Omega-3 EPA/DHA 500mg SID",
      medical_history: "Presented with reluctance to jump to counters (~18 months prior), worsening in past 3 months. Owner noted decreased grooming of hindquarters. Radiographs confirm moderate L6-L7 and lumbosacral spondylosis. Feline Musculoskeletal Pain Index (FMPI) 18/44 — moderate chronic pain. Started Solensia 2026-01-15 with excellent clinical response.",
      special_instructions: "Low-impact feline-appropriate rehabilitation. Environmental modifications (ramps, low-sided litter boxes, non-slip surfaces). Cognitive enrichment. Monthly Solensia injections. Weight loss to BCS 5/9.",
      client_name: "Elena Rodriguez",
      client_email: "elena.r.misty@gmail.com",
      client_phone: "(954) 555-0458",
      referring_vet: "Dr. Kim Nguyen — Coral Springs Feline Clinic",
      rom_joint: "Lumbosacral (functional)",
      rom_flexion: "", rom_extension: "",
      rom_flexion_contralateral: "", rom_extension_contralateral: "",
    },
    dashboard_data: {
      ...globalFields(),
      ...clientFields({
        first: "Elena", last: "Rodriguez",
        phone: "(954) 555-0458", email: "elena.r.misty@gmail.com",
        street: "3218 Coral Ridge Drive",
        zip: "33065", city: "Coral Springs", state: "FL",
        emergency: "Carlos Rodriguez (brother) (954) 555-0462",
        referredBy: "Dr. Kim Nguyen — Coral Springs Feline Clinic",
        insurance: "Embrace",
        primaryVet: "Dr. Kim Nguyen — Coral Springs Feline Clinic",
      }),
      ...patientFields({
        name: "Misty", species: "Feline", breed: "Domestic Shorthair",
        sex: "Female — Spayed", age: 6, dob: "2020-04-10",
        colors: "Tabby||Grey||Silver", lbs: 11, kg: "5.0",
        chip: "985112008264591",
      }),

      "diagnostics::Imaging": "Radiograph (X-Ray)",
      "diagnostics::Radiograph Findings": "Moderate spondylosis L6-L7 and L7-S1 with mild bridging osteophytes. Coxofemoral joints WNL. Stifles WNL. No pathologic fracture. Abdomen — no abnormalities.",
      "diagnostics::Laboratory Work": "CBC||Chemistry Panel||Urinalysis||Thyroid Panel",
      "diagnostics::Lab Results Notes": "All WNL. Total T4 normal (hyperthyroidism ruled out). Renal values normal. Urinalysis USG 1.042 — concentrated.",

      "assessment::Chief Complaint": "Decreased jumping ability, hesitation on stairs, reduced hindquarter grooming over 18 months. Excellent response to Solensia initiated 2026-01-15.",
      "assessment::Relevant Medical & Surgical History": "Progressive mobility decline since 2024. Radiographs 2026-01-10 confirmed LS spondylosis. FMPI 18/44 pre-Solensia.",
      "assessment::Primary Diagnosis": "Lumbosacral spondylosis with chronic pain and mobility decline",
      "assessment::CSU Acute Pain Score (0–4)": "1 — Minor discomfort, responds to petting",
      "assessment::Numeric Rating Scale (NRS 0–10)": "3",
      "assessment::Lameness Grade": "Grade 1 — Barely perceptible",
      "assessment::Neurological Grade (Frankel Modified)": "Grade 0 — No pain, no deficits",
      "assessment::Deep Pain Perception": "Present — bilateral",
      "assessment::Initial Assessment Narrative": "6y F/S DSH with 18-month mobility decline. Moderate LS spondylosis on rads. FMPI 18/44 at diagnosis, now ~10/44 on Solensia + Gabapentin + ω3. Short-strided pelvic limbs, lordotic at rest. Jumps to mid-level (3 ft) not counter (4 ft). Excellent candidate for low-impact feline rehab + environmental modification + cognitive enrichment.",

      "treatment::Approach": "Conservative",
      "treatment::Weight Bearing Status": "Full weight bearing — no lameness",
      "treatment::Affected Limb(s)": "Spinal / truncal",
      "treatment::Activity Restrictions": "Low-impact only. Cat-appropriate play (wand toys, puzzle feeders). Ramps to furniture. Non-slip rugs on hardwood. Low-sided litter boxes.",

      "metrics::BCS (1–9)": "6",
      // Feline: coxofemoral + stifle goniometry still applicable
      ...goniometryFields({
        "Hip":    { R: { flex: 50, ext: 150 }, L: { flex: 50, ext: 150 } },
        "Stifle": { R: { flex: 45, ext: 155 }, L: { flex: 45, ext: 155 } },
      }),
      ...thighFields({
        rightThighCm: 14.0, leftThighCm: 14.0,
        notes: "Symmetric muscling. No focal atrophy. Spinal lordotic posture at rest.",
      }),

      ...equipmentFields(["laser4","heat","pemf","physioball","goniom","tape","mats"]),

      "home::Primary Flooring — Indoor": "Rubber / Non-slip mats installed",
      "home::Available Space Indoors": "Multiple rooms available",
      "home::Indoor Stairs": "Has ramp available",
      "home::Stair Frequency": "Can be fully avoided",
      "home::Outdoor Space Size": "N/A — indoor only",
      "home::Time Available Per Session (min)": "15",
      "home::Session Frequency (per day)": "4",
      "home::Owner Confidence with Exercises": "High — retired, home most of the day, very attentive to feline behavior cues",

      "goals::Primary Rehabilitation Goals": "Pain management — improve quality of life||Senior wellness / mobility maintenance||Weight management — target BCS 5",
      "goals::Short-Term Clinical Goals": "FMPI < 14. Resume jumping to mid-level surfaces. Return to normal hindquarter grooming.",
      "goals::Long-Term Clinical Goals": "FMPI < 8. BCS 5/9. Maintain jumping to chair/sofa height. Consistent monthly Solensia.",
      "goals::Quality of Life Goal": "Comfortable ambulation, resumed grooming, maintained jumping ability to favorite resting spots.",

      "conditioning::Conditioning Phase": "Mobility maintenance",
      "conditioning::Current Activity Level": "Low — short leash walks",

      "client::Clinical Notes": "Feline-specific rehab requires creative low-impact strategies — wand toys for trunk rotation, puzzle feeders for cognitive engagement. Solensia has dramatically improved pain signals. Owner is highly engaged — excellent candidate for home exercise compliance. Cognitive enrichment is as important as physical in the feline patient.",
    }
  },
];

// ── Seed runner ─────────────────────────────────────────────────────────────
// `init` flag controls whether we reopen the DB + create tables. The HTTP
// admin endpoint hits this from within an already-initialized server, so it
// passes init=false. The CLI entry point (node seed-demo-patients.js)
// initializes the DB standalone.
async function seed({ init = true } = {}) {
  if (init) {
    await initialize();
    await createTables();
  }
  console.log("🌱 Seeding demo patients for 7pm investor demo...\n");

  for (const p of DEMO_PATIENTS) {
    const existing = await get(
      "SELECT id FROM patients WHERE name = ? AND breed = ?",
      [p.core.name, p.core.breed]
    );
    if (existing) {
      await run(
        "UPDATE patients SET dashboard_data = ? WHERE id = ?",
        [JSON.stringify(p.dashboard_data), existing.id]
      );
      console.log(`  ♻ ${p.core.name} (${p.core.breed}) — refreshed dashboard_data (${Object.keys(p.dashboard_data).length} fields, id ${existing.id})`);
      continue;
    }
    const result = await run(
      `INSERT INTO patients (
        name, species, breed, age, weight, sex, condition, affected_region,
        surgery_date, lameness_grade, body_condition_score, pain_level,
        mobility_level, current_medications, medical_history,
        special_instructions, client_name, client_email, client_phone, referring_vet,
        rom_joint, rom_flexion, rom_extension, rom_flexion_contralateral,
        rom_extension_contralateral, dashboard_data, visit_count
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        p.core.name, p.core.species, p.core.breed, p.core.age, p.core.weight,
        p.core.sex, p.core.condition, p.core.affected_region,
        p.core.surgery_date, p.core.lameness_grade, p.core.body_condition_score,
        p.core.pain_level, p.core.mobility_level, p.core.current_medications,
        p.core.medical_history, p.core.special_instructions,
        p.core.client_name, p.core.client_email, p.core.client_phone,
        p.core.referring_vet, p.core.rom_joint, p.core.rom_flexion,
        p.core.rom_extension, p.core.rom_flexion_contralateral,
        p.core.rom_extension_contralateral,
        JSON.stringify(p.dashboard_data), 1,
      ]
    );
    console.log(`  ✅ ${p.core.name} — ${p.core.breed} ${p.core.condition} (id ${result.lastID}, ${Object.keys(p.dashboard_data).length} fields)`);
  }

  const total = await get("SELECT COUNT(*) AS c FROM patients");
  console.log(`\n📊 Total patients in DB: ${total.c}\n`);
}

// Allow `require`-style imports (for HTTP admin-seed endpoint) + direct CLI.
if (require.main === module) {
  seed().catch(err => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
}

module.exports = { seed, DEMO_PATIENTS };
