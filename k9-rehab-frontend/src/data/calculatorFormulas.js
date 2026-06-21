// ─────────────────────────────────────────────────────────────
// Canine Rehab Calculators — Clinical Formulas & Reference Data
// ─────────────────────────────────────────────────────────────
// SOURCES (all values traced to published clinical literature):
//   - Millis DL, Levine D. Canine Rehabilitation and Physical
//     Therapy, 2nd ed. Elsevier Saunders, 2014.
//   - Jaegger G, Marcellin-Little DJ, Levine D. Reliability of
//     goniometry in Labrador Retrievers. AJVR 2002;63(7):979-986.
//   - WSAVA Global Nutrition Guidelines (BCS 9-point scale).
//   - Laflamme DP. Development and validation of a body condition
//     score system for dogs. Canine Pract 1997;22:10-15.
//   - Brown DC et al. Canine Brief Pain Inventory (CBPI).
//     JAVMA 2008;233(8):1278-1283.
//   - AAHA/WSAVA lameness grading standards (0-5 scale).
//   - Levine D, Millis DL. Aquatic therapy. In: Canine
//     Rehabilitation and Physical Therapy, 2nd ed. Ch. 27.
// ─────────────────────────────────────────────────────────────

// ─── 1. BCS / Ideal Body Weight (WSAVA 9-point scale) ────────
export const BCS_SCALE = [
  { score: 1, label: "Emaciated",     pctOfIdeal: 70,  description: "Ribs, lumbar vertebrae, pelvic bones visible from distance. No discernible body fat. Obvious loss of muscle mass." },
  { score: 2, label: "Very Thin",     pctOfIdeal: 80,  description: "Ribs and bony landmarks easily visible. No palpable fat. Minimal muscle loss." },
  { score: 3, label: "Thin",          pctOfIdeal: 90,  description: "Ribs easily palpated, may be visible. Pelvic bones becoming prominent. Obvious waist." },
  { score: 4, label: "Underweight",   pctOfIdeal: 95,  description: "Ribs easily palpable with minimal fat. Waist easily noted. Abdominal tuck evident." },
  { score: 5, label: "Ideal",         pctOfIdeal: 100, description: "Ribs palpable without excess fat. Waist visible behind ribs. Abdomen tucked when viewed from side." },
  { score: 6, label: "Overweight",    pctOfIdeal: 110, description: "Ribs palpable with slight excess fat. Waist discernible but not prominent. Abdominal tuck apparent." },
  { score: 7, label: "Heavy",         pctOfIdeal: 120, description: "Ribs palpable with difficulty; heavy fat cover. Fat deposits over lumbar and base of tail. Waist absent or barely visible." },
  { score: 8, label: "Obese",         pctOfIdeal: 130, description: "Ribs not palpable under heavy fat. Heavy deposits over lumbar, base of tail. Waist absent. No abdominal tuck." },
  { score: 9, label: "Grossly Obese", pctOfIdeal: 145, description: "Massive fat deposits over thorax, spine, tail base. Waist and abdominal tuck absent. Obvious abdominal distention." },
];

// ─── 2. Caloric Needs ────────────────────────────────────────
// RER = 70 × BW_kg^0.75    MER = RER × activity factor
export const ACTIVITY_FACTORS = [
  { key: "weight_loss",      label: "Weight Loss Program",         factor: 1.0, note: "Feed at RER to achieve ~1-2% body weight loss/week" },
  { key: "rehab_restricted", label: "Rehab — Activity Restricted", factor: 1.2, note: "Post-op crate rest / strict rehab" },
  { key: "geriatric",        label: "Geriatric (inactive)",        factor: 1.4, note: "" },
  { key: "neutered_adult",   label: "Neutered Adult (normal)",     factor: 1.6, note: "" },
  { key: "intact_adult",     label: "Intact Adult",                factor: 1.8, note: "" },
  { key: "light_activity",   label: "Light Activity",              factor: 2.0, note: "" },
  { key: "moderate_work",    label: "Moderate Work",               factor: 3.0, note: "" },
  { key: "heavy_work",       label: "Heavy Work / Performance",    factor: 4.0, note: "Up to 8.0 for sled dogs" },
];

// ─── 3. Goniometric ROM Reference Ranges (degrees) ────────────
export const ROM_REFERENCES = {
  millis_levine: {
    label: "Millis & Levine (2014)",
    citation: "Canine Rehabilitation and Physical Therapy, 2nd ed., Appendix B",
    joints: [
      { joint: "Shoulder", flexion: 57,  extension: 165 },
      { joint: "Elbow",    flexion: 36,  extension: 165 },
      { joint: "Carpus",   flexion: 32,  extension: 196 },
      { joint: "Hip",      flexion: 50,  extension: 162 },
      { joint: "Stifle",   flexion: 42,  extension: 162 },
      { joint: "Tarsus",   flexion: 39,  extension: 164 },
    ],
    note: "Reference ranges; allow ±5° measurement variation.",
  },
  jaegger: {
    label: "Jaegger et al. (2002) — Labrador Retrievers",
    citation: "AJVR 2002;63(7):979-986",
    joints: [
      { joint: "Shoulder", flexion: 57,  extension: 165 },
      { joint: "Elbow",    flexion: 36,  extension: 165 },
      { joint: "Carpus",   flexion: 32,  extension: 196 },
      { joint: "Hip",      flexion: 50,  extension: 162 },
      { joint: "Stifle",   flexion: 42,  extension: 162 },
      { joint: "Tarsus",   flexion: 39,  extension: 164 },
    ],
    note: "Validated on adult Labrador Retrievers (n=9). Inter-observer reliability ICC 0.71-0.99.",
  },
};

// ─── 4. Lameness Grading (AAHA / WSAVA 0-5) ───────────────────
export const LAMENESS_GRADES = [
  { grade: 0, label: "Sound",                   description: "No lameness observed at walk or trot." },
  { grade: 1, label: "Subtle / Intermittent",   description: "Mild, intermittent weight-shifting; barely perceptible lameness at trot." },
  { grade: 2, label: "Mild Weight-Bearing",     description: "Consistent mild lameness at trot; bears full weight at stance." },
  { grade: 3, label: "Moderate Weight-Bearing", description: "Obvious lameness at walk and trot; bears partial weight at stance." },
  { grade: 4, label: "Severe Weight-Bearing",   description: "Severe lameness; toe-touches during stance; avoids weight-bearing when possible." },
  { grade: 5, label: "Non-Weight-Bearing",      description: "Carries limb; no weight-bearing at stance or gait." },
];

export const LAMENESS_CRITERIA = [
  { id: "stance",   label: "Abnormal weight-bearing at stance" },
  { id: "walk",     label: "Visible lameness at walk" },
  { id: "trot",     label: "Visible lameness at trot" },
  { id: "head_nod", label: "Head-nod or hip-hike present" },
  { id: "stride",   label: "Shortened stride length" },
];

// ─── 5. Canine Brief Pain Inventory (CBPI) ────────────────────
export const CBPI_PAIN_SEVERITY_ITEMS = [
  { id: "pss_worst",   label: "Pain at its WORST in the last 7 days" },
  { id: "pss_least",   label: "Pain at its LEAST in the last 7 days" },
  { id: "pss_average", label: "Pain on AVERAGE in the last 7 days" },
  { id: "pss_now",     label: "Pain as it is RIGHT NOW" },
];

export const CBPI_PAIN_INTERFERENCE_ITEMS = [
  { id: "pis_activity", label: "General activity" },
  { id: "pis_enjoy",    label: "Enjoyment of life" },
  { id: "pis_rise",     label: "Ability to rise from lying down" },
  { id: "pis_walk",     label: "Ability to walk" },
  { id: "pis_run",      label: "Ability to run" },
  { id: "pis_climb",    label: "Ability to climb (stairs, curbs)" },
];

export const CBPI_SCALE_ANCHORS = {
  severity:     "0 = No pain  →  10 = Extreme pain",
  interference: "0 = Does not interfere  →  10 = Completely interferes",
};

// Treatment success (Brown et al. 2013 validation)
export const CBPI_SUCCESS_THRESHOLD = {
  pss_reduction: 1, // ≥1-point reduction in Pain Severity Score
  pis_reduction: 2, // ≥2-point reduction in Pain Interference Score
};

// ─── 6. Exercise Dosing by Phase ──────────────────────────────
export const PHASE_DOSING = [
  {
    phase: 1, name: "Acute Protection", weekRange: "Weeks 0-2",
    frequency: "2-3 sessions/day", sessionDuration: "5-10 min",
    setsReps: "1-2 sets × 5-10 reps (or 10-15 sec holds)",
    intensity: "Very Low — passive / assisted only",
    modalities: "Cryotherapy, PROM, gentle massage, laser",
    notes: "Pain control and inflammation management prioritized. No resistance. No weight-bearing challenges.",
  },
  {
    phase: 2, name: "Early Mobilization", weekRange: "Weeks 2-6",
    frequency: "1-2 sessions/day", sessionDuration: "10-15 min",
    setsReps: "2-3 sets × 8-12 reps",
    intensity: "Low — active-assisted, controlled weight-bearing",
    modalities: "AROM, weight-shifting, controlled leash walks, therapeutic US, NMES",
    notes: "Restore tissue extensibility and reintroduce weight-bearing. Monitor for pain flares.",
  },
  {
    phase: 3, name: "Controlled Strengthening", weekRange: "Weeks 6-12",
    frequency: "1 session/day + daily home program", sessionDuration: "15-25 min",
    setsReps: "3 sets × 10-15 reps (or 20-30 sec holds)",
    intensity: "Moderate — progressive resistance, closed-chain loading",
    modalities: "Cavaletti, balance discs, UWTM, incline/decline walking, sit-to-stand",
    notes: "Build strength and neuromuscular control. Progress load only when form is maintained.",
  },
  {
    phase: 4, name: "Return to Function", weekRange: "Weeks 12+",
    frequency: "3-5 sessions/week", sessionDuration: "20-30 min",
    setsReps: "3-4 sets × 12-20 reps",
    intensity: "Moderate-High — sport-specific, dynamic, eccentric loading",
    modalities: "Agility drills, plyometrics, sprint work, terrain variation",
    notes: "Return to sport/work readiness. For chronic conditions, Phase 4 transitions to lifelong maintenance.",
  },
];

// ─── 7. UWTM Buoyancy (Water Depth → % Weight-Bearing) ────────
export const UWTM_DEPTH_LEVELS = [
  { level: "lateral_malleolus", label: "Lateral Malleolus (ankle)",  pctWeightBearing: 91, note: "Minimal buoyancy assist; closest to land-based gait." },
  { level: "mid_tibia",         label: "Mid-Tibia",                  pctWeightBearing: 85, note: "Light buoyancy; early post-op transition." },
  { level: "stifle",            label: "Stifle (knee)",              pctWeightBearing: 62, note: "Moderate unloading; common starting depth." },
  { level: "hip",               label: "Hip / Greater Trochanter",   pctWeightBearing: 38, note: "Significant unloading; severe OA or acute post-op." },
  { level: "shoulder",          label: "Shoulder / Greater Tubercle",pctWeightBearing: 9,  note: "Near-full unloading; swimming equivalent." },
];

// ─── 8. Weight-Shift / Symmetry ───────────────────────────────
export const WEIGHT_DISTRIBUTION = {
  normal: {
    forelimbs: 60, hindlimbs: 40,
    perForelimb: 30, perHindlimb: 20,
  },
  symmetryThreshold: 10, // SI% above which asymmetry is clinically meaningful
  formulaText: "SI% = |Limb_A − Limb_B| ÷ ((Limb_A + Limb_B) / 2) × 100",
};

// ─── 9. Daily Monitor Tracking ────────────────────────────────
// Daily clinical metrics recorded during the rehab program.
// Used to track trend, flag regression, and inform phase progression.
// Stored locally per-patient in browser localStorage.
export const DAILY_MONITOR_FIELDS = [
  { id: "pain_score",        label: "Pain Score (0-10)",          type: "number", min: 0,  max: 10, unit: "",    group: "clinical" },
  { id: "lameness_grade",    label: "Lameness Grade (0-5)",       type: "number", min: 0,  max: 5,  unit: "",    group: "clinical" },
  { id: "weight_kg",         label: "Body Weight",                type: "number", min: 0,  max: 100,unit: "kg",  group: "clinical" },
  { id: "appetite",          label: "Appetite (0-3)",             type: "select", options: [
      { value: 0, label: "0 — Anorexic" }, { value: 1, label: "1 — Reduced" },
      { value: 2, label: "2 — Normal" },   { value: 3, label: "3 — Increased" },
    ], group: "clinical" },
  { id: "attitude",          label: "Attitude / Mentation",       type: "select", options: [
      { value: "bright", label: "Bright, alert, responsive" },
      { value: "quiet",  label: "Quiet but responsive" },
      { value: "dull",   label: "Dull / lethargic" },
      { value: "depressed", label: "Depressed / non-responsive" },
    ], group: "clinical" },
  { id: "rom_change",        label: "ROM Change vs. Yesterday",   type: "select", options: [
      { value: "improved",  label: "Improved" },
      { value: "unchanged", label: "Unchanged" },
      { value: "worse",     label: "Worse" },
    ], group: "clinical" },
  { id: "exercise_tolerance",label: "Exercise Tolerance",         type: "select", options: [
      { value: "full",    label: "Completed full session" },
      { value: "partial", label: "Completed with rest breaks" },
      { value: "limited", label: "Stopped early — fatigue/pain" },
      { value: "refused", label: "Refused / unable" },
    ], group: "function" },
  { id: "activity_minutes",  label: "Total Active Minutes",       type: "number", min: 0, max: 480, unit: "min", group: "function" },
  { id: "incision_status",   label: "Incision / Bandage",         type: "select", options: [
      { value: "na",      label: "N/A" },
      { value: "clean",   label: "Clean, dry, intact" },
      { value: "redness", label: "Mild redness" },
      { value: "swelling",label: "Swelling" },
      { value: "drainage",label: "Drainage — ALERT" },
      { value: "dehiscence",label: "Dehiscence — ALERT" },
    ], group: "post_op" },
  { id: "notes",             label: "Clinical Notes",             type: "text",   group: "notes" },
];

export const DAILY_MONITOR_GROUPS = [
  { key: "clinical", label: "Clinical Metrics" },
  { key: "function", label: "Functional Metrics" },
  { key: "post_op",  label: "Post-Op Monitoring" },
  { key: "notes",    label: "Notes" },
];

// Red-flag thresholds — trigger warnings when crossed
export const MONITOR_RED_FLAGS = [
  { field: "pain_score",     condition: (v) => v >= 7, message: "Pain score ≥7/10 — consider pain management review." },
  { field: "lameness_grade", condition: (v) => v >= 4, message: "Lameness grade ≥4/5 — evaluate for regression or complication." },
  { field: "incision_status",condition: (v) => v === "drainage" || v === "dehiscence", message: "Incision complication — contact surgeon." },
  { field: "attitude",       condition: (v) => v === "depressed", message: "Depressed mentation — urgent clinical evaluation." },
  { field: "appetite",       condition: (v) => v === 0, message: "Anorexic — clinical evaluation recommended." },
];

// Trend direction helpers
export const trendDirection = (prev, curr, lowerIsBetter = true) => {
  if (prev == null || curr == null) return "none";
  if (prev === curr) return "flat";
  if (lowerIsBetter) return curr < prev ? "better" : "worse";
  return curr > prev ? "better" : "worse";
};

// ═════════════════════════════════════════════════════════════
// FELINE DATA SETS
// ═════════════════════════════════════════════════════════════

// ─── Feline BCS (WSAVA 9-point for cats) ──────────────────────
// Source: WSAVA Global Nutrition Guidelines — feline BCS
export const FELINE_BCS_SCALE = [
  { score: 1, label: "Emaciated",     pctOfIdeal: 70,  description: "Ribs visible on shorthaired cats. No palpable fat. Severe abdominal tuck. Lumbar vertebrae and wings of ilia easily palpated." },
  { score: 2, label: "Very Thin",     pctOfIdeal: 80,  description: "Ribs easily palpable with minimal fat covering. Lumbar vertebrae obvious. Obvious waist behind ribs. Minimal abdominal fat." },
  { score: 3, label: "Thin",          pctOfIdeal: 90,  description: "Ribs easily palpable with minimal fat. Obvious waist behind ribs when viewed from above. Abdominal fat pad absent or minimal." },
  { score: 4, label: "Underweight",   pctOfIdeal: 95,  description: "Ribs palpable with minimal fat covering. Waist obvious. Slight abdominal tuck." },
  { score: 5, label: "Ideal",         pctOfIdeal: 100, description: "Well-proportioned. Waist observed behind ribs. Ribs palpable with slight fat covering. Abdominal fat pad minimal." },
  { score: 6, label: "Overweight",    pctOfIdeal: 110, description: "Ribs palpable with slight excess fat. Waist and abdominal fat pad distinguishable but noticeable." },
  { score: 7, label: "Heavy",         pctOfIdeal: 120, description: "Ribs not easily palpated with moderate fat. Waist poorly discernible. Obvious abdominal fat pad. Rounding of abdomen." },
  { score: 8, label: "Obese",         pctOfIdeal: 130, description: "Ribs not palpable under moderate fat. Waist absent. Obvious abdominal distention and rounding. Prominent abdominal fat pad. Fat deposits over lumbar area." },
  { score: 9, label: "Grossly Obese", pctOfIdeal: 145, description: "Ribs not palpable under thick fat cover. Heavy fat deposits over lumbar area, face, and limbs. Obvious distention of abdomen with no waist. Extensive abdominal fat deposits." },
];

// ─── Feline Activity Factors ──────────────────────────────────
// Source: NRC 2006 Nutrient Requirements of Dogs and Cats.
// Cats have narrower activity factor range than dogs.
export const FELINE_ACTIVITY_FACTORS = [
  { key: "weight_loss",      label: "Weight Loss Program",      factor: 0.8, note: "Feed at 80% RER; target 0.5-2% body weight loss/week" },
  { key: "rehab_restricted", label: "Rehab — Restricted",       factor: 1.0, note: "Post-op / strict cage rest" },
  { key: "geriatric",        label: "Geriatric (inactive)",     factor: 1.1, note: "" },
  { key: "neutered_adult",   label: "Neutered Adult (indoor)",  factor: 1.2, note: "Most common category" },
  { key: "intact_adult",     label: "Intact Adult",             factor: 1.4, note: "" },
  { key: "active_adult",     label: "Active Adult (outdoor)",   factor: 1.6, note: "" },
  { key: "growing_kitten",   label: "Growing Kitten (<1yr)",    factor: 2.5, note: "Up to 3.0 for very young kittens" },
];

// ─── Feline ROM Reference (limited published data) ────────────
// Source: Jaeger GH et al. AJVR 2007;68(4):350-354 (hip only
// validated). Other joints extrapolated from Millis & Levine
// feline chapter — use as GUIDANCE, not strict reference.
export const FELINE_ROM_REFERENCES = {
  millis_levine: {
    label: "Millis & Levine (feline chapter)",
    citation: "Canine Rehabilitation and Physical Therapy, 2nd ed., feline adaptations",
    joints: [
      { joint: "Shoulder", flexion: 32,  extension: 164 },
      { joint: "Elbow",    flexion: 22,  extension: 163 },
      { joint: "Carpus",   flexion: 22,  extension: 198 },
      { joint: "Hip",      flexion: 33,  extension: 164 },
      { joint: "Stifle",   flexion: 24,  extension: 164 },
      { joint: "Tarsus",   flexion: 22,  extension: 167 },
    ],
    note: "LIMITED feline data — use as guidance only. Inter-breed variation substantial. Validated hip ROM: Jaeger et al. AJVR 2007;68(4):350-354.",
  },
};

// ─── Feline Lameness Grading (AAHA adapted) ───────────────────
export const FELINE_LAMENESS_GRADES = [
  { grade: 0, label: "Sound",                   description: "Normal gait; no lameness at walk or trot." },
  { grade: 1, label: "Subtle",                  description: "Intermittent lameness or altered gait; stiffness noted. Cats often mask lameness — rely on owner video at home." },
  { grade: 2, label: "Mild",                    description: "Mild but consistent lameness at walk; reluctance to jump or climb." },
  { grade: 3, label: "Moderate",                description: "Obvious lameness at walk; reduced activity; avoids jumping." },
  { grade: 4, label: "Severe Weight-Bearing",   description: "Severe lameness; toe-touches limb; significant activity restriction; often hides." },
  { grade: 5, label: "Non-Weight-Bearing",      description: "Carries limb; no weight-bearing at stance or gait." },
];

// ─── Feline Musculoskeletal Pain Index (FMPI) ─────────────────
// Source: Benito J et al. Vet J 2013;196(3):368-373
// 17 items total. Each item 0-4 (0=normal, 4=severe impairment).
// Clinically meaningful change: ≥6-point total reduction.
export const FMPI_ITEMS = [
  { id: "fmpi_q1",  label: "How your cat walks" },
  { id: "fmpi_q2",  label: "How your cat runs" },
  { id: "fmpi_q3",  label: "How your cat jumps up" },
  { id: "fmpi_q4",  label: "How your cat jumps down" },
  { id: "fmpi_q5",  label: "How your cat climbs up stairs" },
  { id: "fmpi_q6",  label: "How your cat climbs down stairs" },
  { id: "fmpi_q7",  label: "How your cat plays with other animals" },
  { id: "fmpi_q8",  label: "How your cat plays with toys" },
  { id: "fmpi_q9",  label: "How your cat chases moving objects" },
  { id: "fmpi_q10", label: "How your cat stretches" },
  { id: "fmpi_q11", label: "How your cat grooms" },
  { id: "fmpi_q12", label: "How your cat eats dry food" },
  { id: "fmpi_q13", label: "How your cat eats wet food" },
  { id: "fmpi_q14", label: "How your cat goes to the litter box" },
  { id: "fmpi_q15", label: "How your cat interacts with family" },
  { id: "fmpi_q16", label: "Overall activity level" },
  { id: "fmpi_q17", label: "Overall quality of life" },
];

export const FMPI_SCALE_ANCHORS = "0 = Normal  →  4 = Severe impairment / cannot perform";
export const FMPI_SUCCESS_THRESHOLD = 6; // ≥6-point total reduction = clinically meaningful

// ─── Feline Grimace Scale (FGS) ───────────────────────────────
// Source: Evangelista MC et al. Sci Rep 2019;9:19128
// 5 action units, each scored 0-2. Max score = 10.
// Analgesia threshold: total score ≥4/10 indicates pain requiring intervention.
export const FGS_ACTION_UNITS = [
  {
    id: "ear_position", label: "Ear Position",
    anchors: [
      { value: 0, label: "0 — Ears facing forward" },
      { value: 1, label: "1 — Ears slightly pulled apart" },
      { value: 2, label: "2 — Ears flattened and rotated outward" },
    ],
  },
  {
    id: "orbital_tightening", label: "Orbital Tightening",
    anchors: [
      { value: 0, label: "0 — Eyes opened" },
      { value: 1, label: "1 — Eyes partially opened" },
      { value: 2, label: "2 — Eyes squinted/closed" },
    ],
  },
  {
    id: "muzzle_tension", label: "Muzzle Tension",
    anchors: [
      { value: 0, label: "0 — Muzzle relaxed (round shape)" },
      { value: 1, label: "1 — Muzzle mildly tense" },
      { value: 2, label: "2 — Muzzle tense (elliptical shape)" },
    ],
  },
  {
    id: "whisker_position", label: "Whisker Position",
    anchors: [
      { value: 0, label: "0 — Whiskers loose and curved" },
      { value: 1, label: "1 — Whiskers slightly curved / straight" },
      { value: 2, label: "2 — Whiskers straight and moving forward" },
    ],
  },
  {
    id: "head_position", label: "Head Position",
    anchors: [
      { value: 0, label: "0 — Head above shoulder line" },
      { value: 1, label: "1 — Head aligned with shoulder line" },
      { value: 2, label: "2 — Head below shoulder line / tilted down" },
    ],
  },
];

export const FGS_ANALGESIA_THRESHOLD = 4; // total score ≥4/10 indicates pain requiring intervention

// ─── Feline Phase Dosing ──────────────────────────────────────
// Source: Drum MG. Feline rehabilitation. Vet Clin North Am
// Small Anim Pract 2015;45(1):185-201. Millis & Levine 2nd ed.
// feline chapter (Ch. 30).
export const FELINE_PHASE_DOSING = [
  {
    phase: 1, name: "Acute Protection", weekRange: "Weeks 0-2",
    frequency: "2-4 brief sessions/day", sessionDuration: "3-5 min",
    setsReps: "5-8 reps or 5-10 sec holds",
    intensity: "Very Low — passive / assisted only",
    modalities: "PROM, gentle massage, laser, cryotherapy (if tolerated)",
    notes: "Cats tolerate handling poorly in pain. Keep sessions SHORT. Use food rewards. Stop at first sign of stress (flattened ears, hissing, tail flicking).",
  },
  {
    phase: 2, name: "Early Mobilization", weekRange: "Weeks 2-6",
    frequency: "1-2 sessions/day", sessionDuration: "5-10 min",
    setsReps: "2 sets × 5-10 reps",
    intensity: "Low — play-based active movement",
    modalities: "AROM via toy-lure, controlled cavaletti (low), laser, gentle stretching",
    notes: "Use prey-drive play (wand toys, laser pointers) to elicit voluntary movement. Avoid forced exercise. Session location matters — home is lower stress than clinic.",
  },
  {
    phase: 3, name: "Controlled Strengthening", weekRange: "Weeks 6-12",
    frequency: "1 session/day + owner home play", sessionDuration: "10-15 min",
    setsReps: "2-3 sets × 8-12 reps (play-based)",
    intensity: "Moderate — climbing, jumping tasks",
    modalities: "Graduated cat tree climbing, low jumps, balance on cushion, food puzzle play",
    notes: "Use vertical environment (cat trees, shelves) to build hindlimb strength. Progression = higher jumps, steeper climbs. Food puzzles encourage active reach.",
  },
  {
    phase: 4, name: "Return to Function", weekRange: "Weeks 12+",
    frequency: "3-5 play sessions/week", sessionDuration: "15-20 min",
    setsReps: "Activity-based (not structured sets)",
    intensity: "Moderate — normal feline activity restored",
    modalities: "Full vertical territory, hunting play, interactive feeders",
    notes: "Restoration of normal activities (climbing, jumping, playing). For chronic OA, maintain at reduced intensity with modifications (ramps, lowered resources).",
  },
];

// ─── Feline Weight Distribution ───────────────────────────────
// Source: Corbee RJ et al. BMC Vet Res 2014;10:146 (feline
// static stance weight distribution)
export const FELINE_WEIGHT_DISTRIBUTION = {
  normal: {
    forelimbs: 54, hindlimbs: 46,
    perForelimb: 27, perHindlimb: 23,
  },
  symmetryThreshold: 10,
  formulaText: "SI% = |Limb_A − Limb_B| ÷ ((Limb_A + Limb_B) / 2) × 100",
};

// ═════════════════════════════════════════════════════════════
// BREED DATA (common breeds per species + smart defaults)
// ═════════════════════════════════════════════════════════════

// Canine breeds with clinical metadata
// Fields: size (toy/small/medium/large/giant), activity (low/moderate/high),
//         conditions (predisposed conditions), romRef (preferred ROM reference)
export const CANINE_BREEDS = [
  { id: "unspecified",      label: "— Not specified —",           size: null,     activity: null,       conditions: [],                      romRef: null },
  { id: "labrador",         label: "Labrador Retriever",          size: "large",  activity: "high",     conditions: ["HD","CCL","OA"],       romRef: "jaegger" },
  { id: "golden",           label: "Golden Retriever",            size: "large",  activity: "high",     conditions: ["HD","CCL","OA"],       romRef: "jaegger" },
  { id: "gsd",              label: "German Shepherd",             size: "large",  activity: "high",     conditions: ["HD","DM","OA"],        romRef: null },
  { id: "bulldog_eng",      label: "Bulldog (English)",           size: "medium", activity: "low",      conditions: ["IVDD","HD","OA"],      romRef: null },
  { id: "frenchie",         label: "French Bulldog",              size: "small",  activity: "low",      conditions: ["IVDD","HD"],           romRef: null },
  { id: "poodle_std",       label: "Poodle (Standard)",           size: "large",  activity: "high",     conditions: ["HD","OA"],             romRef: null },
  { id: "beagle",           label: "Beagle",                      size: "medium", activity: "moderate", conditions: ["IVDD","OA"],           romRef: null },
  { id: "dachshund",        label: "Dachshund",                   size: "small",  activity: "moderate", conditions: ["IVDD"],                romRef: null },
  { id: "rottweiler",       label: "Rottweiler",                  size: "large",  activity: "moderate", conditions: ["HD","CCL","OA"],       romRef: null },
  { id: "boxer",            label: "Boxer",                       size: "large",  activity: "high",     conditions: ["HD","CCL","DM"],       romRef: null },
  { id: "yorkie",           label: "Yorkshire Terrier",           size: "toy",    activity: "moderate", conditions: ["LUX_PAT","IVDD"],      romRef: null },
  { id: "chihuahua",        label: "Chihuahua",                   size: "toy",    activity: "moderate", conditions: ["LUX_PAT","IVDD"],      romRef: null },
  { id: "border_collie",    label: "Border Collie",               size: "medium", activity: "high",     conditions: ["HD","OA"],             romRef: null },
  { id: "aussie",           label: "Australian Shepherd",         size: "medium", activity: "high",     conditions: ["HD","OA"],             romRef: null },
  { id: "bernese",          label: "Bernese Mountain Dog",        size: "giant",  activity: "moderate", conditions: ["HD","OA","CCL"],       romRef: null },
  { id: "great_dane",       label: "Great Dane",                  size: "giant",  activity: "moderate", conditions: ["HD","OA"],             romRef: null },
  { id: "husky",            label: "Siberian Husky",              size: "large",  activity: "high",     conditions: ["HD"],                  romRef: null },
  { id: "shih_tzu",         label: "Shih Tzu",                    size: "small",  activity: "low",      conditions: ["IVDD","LUX_PAT"],      romRef: null },
  { id: "pomeranian",       label: "Pomeranian",                  size: "toy",    activity: "moderate", conditions: ["LUX_PAT"],             romRef: null },
  { id: "cavalier",         label: "Cavalier King Charles",       size: "small",  activity: "moderate", conditions: ["LUX_PAT","OA"],        romRef: null },
  { id: "mixed",            label: "Mixed Breed",                 size: null,     activity: "moderate", conditions: [],                      romRef: null },
  { id: "other",            label: "Other",                       size: null,     activity: null,       conditions: [],                      romRef: null },
];

// Feline breeds with clinical metadata
export const FELINE_BREEDS = [
  { id: "unspecified",      label: "— Not specified —",           size: null,     activity: null,       conditions: [] },
  { id: "dsh",              label: "Domestic Shorthair",          size: "medium", activity: "moderate", conditions: [] },
  { id: "dlh",              label: "Domestic Longhair",           size: "medium", activity: "moderate", conditions: [] },
  { id: "maine_coon",       label: "Maine Coon",                  size: "large",  activity: "moderate", conditions: ["HCM","HD"] },
  { id: "ragdoll",          label: "Ragdoll",                     size: "large",  activity: "low",      conditions: ["HCM"] },
  { id: "persian",          label: "Persian",                     size: "medium", activity: "low",      conditions: ["PKD","OA"] },
  { id: "british_sh",       label: "British Shorthair",           size: "medium", activity: "low",      conditions: ["HCM"] },
  { id: "siamese",          label: "Siamese",                     size: "medium", activity: "high",     conditions: [] },
  { id: "bengal",           label: "Bengal",                      size: "medium", activity: "high",     conditions: ["HCM","LUX_PAT"] },
  { id: "sphynx",           label: "Sphynx",                      size: "medium", activity: "high",     conditions: ["HCM"] },
  { id: "russian_blue",     label: "Russian Blue",                size: "medium", activity: "moderate", conditions: [] },
  { id: "scottish_fold",    label: "Scottish Fold",               size: "medium", activity: "moderate", conditions: ["OA","osteochondrodysplasia"] },
  { id: "abyssinian",       label: "Abyssinian",                  size: "medium", activity: "high",     conditions: ["LUX_PAT"] },
  { id: "american_sh",      label: "American Shorthair",          size: "medium", activity: "moderate", conditions: ["HCM"] },
  { id: "burmese",          label: "Burmese",                     size: "small",  activity: "moderate", conditions: [] },
  { id: "norwegian_forest", label: "Norwegian Forest Cat",        size: "large",  activity: "moderate", conditions: ["HCM","HD"] },
  { id: "oriental_sh",      label: "Oriental Shorthair",          size: "medium", activity: "high",     conditions: [] },
  { id: "exotic_sh",        label: "Exotic Shorthair",            size: "medium", activity: "low",      conditions: ["PKD","HCM"] },
  { id: "birman",           label: "Birman",                      size: "medium", activity: "low",      conditions: [] },
  { id: "himalayan",        label: "Himalayan",                   size: "medium", activity: "low",      conditions: ["PKD"] },
  { id: "devon_rex",        label: "Devon Rex",                   size: "small",  activity: "high",     conditions: ["LUX_PAT"] },
  { id: "mixed",            label: "Mixed Breed",                 size: null,     activity: "moderate", conditions: [] },
  { id: "other",            label: "Other",                       size: null,     activity: null,       conditions: [] },
];

// Condition code → human-readable label (for breed risk flags)
export const CONDITION_LABELS = {
  HD: "Hip Dysplasia",
  CCL: "CCL / Cruciate Disease",
  OA: "Osteoarthritis",
  IVDD: "Intervertebral Disc Disease",
  DM: "Degenerative Myelopathy",
  LUX_PAT: "Patellar Luxation",
  HCM: "Hypertrophic Cardiomyopathy",
  PKD: "Polycystic Kidney Disease",
  osteochondrodysplasia: "Osteochondrodysplasia",
};

// ─── Species-aware data resolver ──────────────────────────────
// Returns the correct dataset based on selected species.
export const getBCSScale = (species) =>
  species === "feline" ? FELINE_BCS_SCALE : BCS_SCALE;

export const getActivityFactors = (species) =>
  species === "feline" ? FELINE_ACTIVITY_FACTORS : ACTIVITY_FACTORS;

export const getROMReferences = (species) =>
  species === "feline" ? FELINE_ROM_REFERENCES : ROM_REFERENCES;

export const getLamenessGrades = (species) =>
  species === "feline" ? FELINE_LAMENESS_GRADES : LAMENESS_GRADES;

export const getPhaseDosing = (species) =>
  species === "feline" ? FELINE_PHASE_DOSING : PHASE_DOSING;

export const getWeightDistribution = (species) =>
  species === "feline" ? FELINE_WEIGHT_DISTRIBUTION : WEIGHT_DISTRIBUTION;

export const getBreedList = (species) =>
  species === "feline" ? FELINE_BREEDS : CANINE_BREEDS;

// ─── Smart activity default from breed ────────────────────────
// Maps breed activity tendency → best-matching activity factor key
export const breedToActivityKey = (species, breed) => {
  if (!breed || breed.activity == null) return null;
  if (species === "feline") {
    if (breed.activity === "high")     return "active_adult";
    if (breed.activity === "moderate") return "neutered_adult";
    if (breed.activity === "low")      return "geriatric";
    return "neutered_adult";
  }
  // canine
  if (breed.activity === "high")     return "light_activity";
  if (breed.activity === "moderate") return "neutered_adult";
  if (breed.activity === "low")      return "geriatric";
  return "neutered_adult";
};

// ─── UTILITIES ────────────────────────────────────────────────
export const roundTo = (value, decimals = 1) => {
  const m = Math.pow(10, decimals);
  return Math.round(value * m) / m;
};

export const kgToLb = (kg) => roundTo(kg * 2.20462, 1);
export const lbToKg = (lb) => roundTo(lb / 2.20462, 2);

export const calcRER = (bwKg) => {
  if (!bwKg || bwKg <= 0) return 0;
  return roundTo(70 * Math.pow(bwKg, 0.75), 0);
};

export const calcMER = (bwKg, activityFactor) =>
  roundTo(calcRER(bwKg) * activityFactor, 0);

export const calcIdealWeight = (currentKg, bcs) => {
  const entry = BCS_SCALE.find((b) => b.score === bcs);
  if (!entry || !currentKg) return null;
  return roundTo(currentKg * (100 / entry.pctOfIdeal), 2);
};

export const getBuoyancyLoad = (bwKg, depthLevel) => {
  const entry = UWTM_DEPTH_LEVELS.find((l) => l.level === depthLevel);
  if (!entry || !bwKg) return null;
  return {
    pct: entry.pctWeightBearing,
    effectiveKg: roundTo(bwKg * (entry.pctWeightBearing / 100), 2),
    unloadedKg: roundTo(bwKg * (1 - entry.pctWeightBearing / 100), 2),
  };
};

export const calcSymmetryIndex = (limbA, limbB) => {
  if (!limbA || !limbB) return 0;
  const mean = (limbA + limbB) / 2;
  return roundTo((Math.abs(limbA - limbB) / mean) * 100, 1);
};
