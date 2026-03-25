// ============================================================================
// EXERCISES PART 11 — AQUATIC THERAPY: PHASE-SPECIFIC UWTM PROTOCOLS
// K9-REHAB-PRO | Millis & Levine Standards | ACVSMR-Aligned
// ============================================================================
// Each exercise includes a structured `uwtm_dosing` block with:
//   water_depth, weight_bearing_reduction, speed_mph, session_duration_min,
//   frequency_per_week, water_temp_f, rehab_phase, post_op_week
// This data is injected into B.E.A.U.'s system prompt and protocol generator.
// ============================================================================

const AQUATIC_EXERCISES_PART11 = [

  // ──────────────────────────────────────────────────────────────────────────
  // 1. UWTM PHASE I — Acute / Post-Op Protection
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: 'UWTM_PHASE1',
    name: 'Underwater Treadmill — Phase I Acute Protocol',
    category: 'Hydrotherapy',
    difficulty_level: 'Easy',
    description: 'Phase I UWTM protocol for acute post-operative or acute injury patients. Hip-level water provides 62% weight-bearing reduction, allowing controlled limb loading with minimal joint stress. Primary goal is edema management, pain-free weight-bearing initiation, and ROM maintenance.',
    uwtm_dosing: {
      water_depth: 'Hip level — greater trochanter landmark',
      weight_bearing_reduction: '62%',
      speed_mph: { min: 0.5, max: 1.0 },
      session_duration_min: { initial: 3, target: 5 },
      frequency_per_week: { min: 1, max: 2 },
      water_temp_f: { min: 85, max: 92, optimal: 88 },
      rehab_phase: 'Phase I',
      post_op_week: '1–4',
      incline_degrees: 0,
      jets: false
    },
    equipment: ['Underwater treadmill', 'Life vest (if needed)', 'Non-slip mat', 'Towel and dryer'],
    setup: 'Fill water to greater trochanter (hip) level. Pre-warm to 85-92°F. Allow 2-3 min acclimation before belt movement.',
    steps: [
      'Acclimate dog to treadmill — stand in still water 2 min before starting belt',
      'Start belt at 0.5 mph. Observe limb placement and weight bearing immediately',
      'Target 3 min initial session. Extend to 5 min if patient remains comfortable',
      'Watch for: even gait pattern, no toe-dragging, no stumbling, calm respiratory rate',
      'Cool down: 1 min stationary stand in water after belt stops',
      'Dry patient completely — hot air dryer preferred. Check incision if post-op'
    ],
    good_form: [
      'Patient weight-bearing on all four limbs in water',
      'No toe-dragging or knuckling during belt movement',
      'Relaxed posture, normal respiratory rate throughout',
      'Smooth limb swing without circumduction'
    ],
    red_flags: [
      'Non-weight-bearing on affected limb throughout — reassess phase appropriateness',
      'Vocalizing or attempting to exit — stop immediately, do not force',
      'Incision contact with water before 10-14 days post-op — CONTRAINDICATED',
      'Respiratory distress — brachycephalic breeds at elevated risk',
      'Marked swelling increase post-session — reduce frequency'
    ],
    contraindications: 'Open/healing incision within 10-14 days, fever >103.5°F, active infection, urinary/fecal incontinence without protective garment, severe brachycephalic airway obstruction, extreme water fear (stress negates benefit)',
    progression: 'Progress to UWTM_PHASE2 when: pain ≤3/10 at rest, consistent weight-bearing, swelling resolved. Lower water depth to stifle level and increase speed to 1.0-1.5 mph.',
    clinical_classification: {
      primary_indications: ['CCL_REPAIR', 'HIP_DYSPLASIA', 'FRACTURE', 'OSTEOARTHRITIS', 'IVDD'],
      rehab_phases: ['ACUTE'],
      intervention_type: 'AQUATIC_HYDROTHERAPY',
      evidence_grade: 'A'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 2. UWTM PHASE II — Controlled Loading / Subacute
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: 'UWTM_PHASE2',
    name: 'Underwater Treadmill — Phase II Controlled Loading Protocol',
    category: 'Hydrotherapy',
    difficulty_level: 'Easy',
    description: 'Phase II UWTM for subacute recovery. Water level transitions from hip to stifle as weight-bearing tolerance improves. Speed and duration increase progressively. Focus shifts to active gait normalization, early strengthening, and ROM improvement.',
    uwtm_dosing: {
      water_depth: 'Hip level (weeks 2-4) transitioning to stifle level (weeks 4-6)',
      weight_bearing_reduction: '38–62% depending on water depth',
      speed_mph: { min: 1.0, max: 1.5 },
      session_duration_min: { initial: 5, target: 10 },
      frequency_per_week: { min: 2, max: 3 },
      water_temp_f: { min: 85, max: 92, optimal: 88 },
      rehab_phase: 'Phase II',
      post_op_week: '2–6',
      incline_degrees: 0,
      jets: false
    },
    equipment: ['Underwater treadmill', 'Goniometer for ROM check pre/post', 'Towel and dryer'],
    setup: 'Start session at hip-level water. After 2-3 weeks consistent progress, lower to stifle level. Warm to 85-92°F.',
    steps: [
      'Position water at hip level (greater trochanter) for first sessions of Phase II',
      'Start belt at 1.0 mph — target even walk without toe-dragging',
      'Run 5-7 min initial sessions, progressing to 10 min over 2-3 weeks',
      'After 2-3 weeks, lower water depth to stifle level to increase limb loading',
      'Observe and document: gait symmetry, affected limb stance duration, head-bobbing presence/absence',
      'Post-session: passive ROM check. Document any gains in flexion/extension',
      'Dry completely. Post-session cold therapy 15 min if joint heat present'
    ],
    good_form: [
      'Affected limb shows visible push-off during gait cycle',
      'Symmetrical stride length bilateral',
      'Head carriage neutral — no head-bobbing at this speed',
      'No stumbling or toe-dragging at target speed'
    ],
    red_flags: [
      'Head-bobbing persisting at 1.0 mph — reduce speed or return to Phase I depth',
      'Marked toe-dragging indicates neurological component — reassess neuro grade',
      'Patient slowing or stopping frequently — fatigue or pain, end session'
    ],
    contraindications: 'Same as UWTM_PHASE1 plus: do not advance to stifle depth until pain ≤3/10 consistently',
    progression: 'Progress to UWTM_PHASE3 when: consistent weight-bearing at stifle depth, pain ≤2/10, can complete 10 min at 1.5 mph without lameness',
    clinical_classification: {
      primary_indications: ['CCL_REPAIR', 'HIP_DYSPLASIA', 'FRACTURE', 'OSTEOARTHRITIS', 'PATELLAR_LUXATION'],
      rehab_phases: ['SUBACUTE'],
      intervention_type: 'AQUATIC_HYDROTHERAPY',
      evidence_grade: 'A'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 3. UWTM PHASE III — Strength Development
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: 'UWTM_PHASE3',
    name: 'Underwater Treadmill — Phase III Strength Development Protocol',
    category: 'Hydrotherapy',
    difficulty_level: 'Moderate',
    description: 'Phase III UWTM for progressive strengthening. Stifle-level water provides 38% weight-bearing reduction. Increasing speed builds cardiovascular endurance and hindlimb muscle mass. Incline option added to increase hindlimb recruitment.',
    uwtm_dosing: {
      water_depth: 'Stifle level',
      weight_bearing_reduction: '38%',
      speed_mph: { min: 1.5, max: 2.5 },
      session_duration_min: { initial: 10, target: 15 },
      frequency_per_week: { min: 2, max: 3 },
      water_temp_f: { min: 85, max: 92, optimal: 87 },
      rehab_phase: 'Phase III',
      post_op_week: '6–16',
      incline_degrees: { min: 0, max: 10, note: 'Add incline only when flat-speed protocol mastered' },
      jets: false
    },
    equipment: ['Underwater treadmill with incline function', 'Limb circumference tape', 'Goniometer'],
    setup: 'Water at stifle level. Start flat. Introduce 5° incline at week 8+ if patient tolerates.',
    steps: [
      'Warm up 2 min at 1.0 mph flat before advancing to working speed',
      'Working speed 1.5-2.5 mph. Progress 0.2 mph increments over weeks, not days',
      'Sessions 10-15 min. Divide into 2-3 intervals with 1 min rest if fatiguing',
      'Incline progression: 5° at week 8, 10° at week 10+ only if flat protocol pain-free',
      'Document limb circumference at mid-thigh pre-session weekly — track atrophy recovery',
      'Post-session: goniometric ROM check. Trend should show progressive ROM improvement'
    ],
    good_form: [
      'Affected hindlimb actively driving at increased speed',
      'Thigh muscle engagement visible during push-off phase',
      'Breathing rate elevated but not distressed (working aerobic effort)',
      'On incline: hindquarters lower, glutes visibly engaging'
    ],
    red_flags: [
      'No limb circumference progress after 3 weeks — consider NMES adjunct',
      'Pain behavior emerging at target speed — reduce 0.2 mph, reassess phase',
      'Stumbling on incline — remove incline, retest flat protocol'
    ],
    contraindications: 'Do not use incline with acute lumbosacral disease or disc patients without veterinary clearance',
    progression: 'Progress to UWTM_PHASE4 when: limb circumference within 1.5cm of contralateral, pain ≤1/10, full weight-bearing on land confirmed',
    clinical_classification: {
      primary_indications: ['CCL_REPAIR', 'HIP_DYSPLASIA', 'OSTEOARTHRITIS', 'PATELLAR_LUXATION', 'FRACTURE'],
      rehab_phases: ['CHRONIC'],
      intervention_type: 'AQUATIC_HYDROTHERAPY',
      evidence_grade: 'A'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 4. UWTM PHASE IV/V — Return to Function / Maintenance with Resistance
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: 'UWTM_PHASE4',
    name: 'Underwater Treadmill — Phase IV/V Return to Function with Resistance Jets',
    category: 'Hydrotherapy',
    difficulty_level: 'Advanced',
    description: 'Phase IV/V UWTM for return to function and lifelong maintenance. Hock-level water (15% weight-bearing reduction) closely approximates land loading. Resistance jets add cardiovascular and muscular challenge. Used for maintenance in chronic OA, DM, and post-return-to-function conditioning.',
    uwtm_dosing: {
      water_depth: 'Hock level (tarsus) — near-land loading conditions',
      weight_bearing_reduction: '15%',
      speed_mph: { min: 2.5, max: 3.5 },
      session_duration_min: { initial: 15, target: 20 },
      frequency_per_week: { min: 2, max: 3 },
      water_temp_f: { min: 85, max: 92, optimal: 87 },
      rehab_phase: 'Phase IV / Phase V Maintenance',
      post_op_week: '16+',
      incline_degrees: { min: 0, max: 15, note: 'Incline appropriate at this phase' },
      jets: true,
      jet_resistance_note: 'Start with lowest jet setting. Increase resistance over 2-4 weeks.'
    },
    equipment: ['Underwater treadmill with jets and incline', 'Limb circumference tape'],
    setup: 'Hock-level water. Begin flat, add incline and jets as tolerated over weeks.',
    steps: [
      'Warm up 2-3 min at 1.5 mph flat, no jets',
      'Advance to 2.5 mph working speed. Introduce jets at lowest setting',
      'Interval option: 3 min fast / 1 min slow x4 for cardiovascular conditioning',
      'Incline 5-15°: increases hindlimb gluteal and hamstring recruitment significantly',
      'Total session 15-20 min. Geriatric patients cap at 15 min regardless of appearance',
      'Post-session: full dry, ROM check, document any soreness or gait change next day'
    ],
    good_form: [
      'Consistent speed throughout — not slowing at end of session without reason',
      'Active hindlimb push-off against jet resistance',
      'No head-bobbing or shortened stride at working speed',
      'Symmetrical muscle effort both hindlimbs at hock-level depth'
    ],
    red_flags: [
      'Head-bobbing re-emerging at Phase IV speeds — possible OA flare, revert to stifle depth',
      'Muscle trembling throughout — fatigue or pain, reduce speed and duration',
      'Post-session next-day lameness — too aggressive, reduce by one phase parameter'
    ],
    contraindications: 'Not appropriate for Grade III-V neurological patients (hock level = high fall risk). Geriatric patients: monitor cardiac and respiratory status closely.',
    progression: 'Lifelong maintenance phase. Adjust speed, duration, and incline seasonally based on patient condition. Reduce parameters during OA flare-ups, increase during stable periods.',
    clinical_classification: {
      primary_indications: ['CCL_REPAIR', 'HIP_DYSPLASIA', 'OSTEOARTHRITIS', 'GERIATRIC', 'SPORT'],
      rehab_phases: ['CHRONIC', 'MAINTENANCE'],
      intervention_type: 'AQUATIC_HYDROTHERAPY',
      evidence_grade: 'A'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 5. UWTM NEUROLOGICAL — Grade III-IV IVDD / DM / FCE Support Protocol
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: 'UWTM_NEURO',
    name: 'Underwater Treadmill — Neurological Support Protocol (IVDD/DM/FCE)',
    category: 'Hydrotherapy',
    difficulty_level: 'Moderate',
    description: 'Specialized UWTM protocol for patients with neurological deficits (IVDD Grade III-IV, DM Stage 1-2, FCE). Hip-level water provides buoyancy support enabling limb movement without full weight-bearing. Water allows limb swing and stepping patterns even when land-based ambulation is severely impaired. CONTRAINDICATED in Grade V IVDD (aspiration risk from incontinence) and DM Stage 3.',
    uwtm_dosing: {
      water_depth: 'Hip level — greater trochanter landmark. Chest level if Grade IV for maximum support.',
      weight_bearing_reduction: '62–75% depending on water depth',
      speed_mph: { min: 0.5, max: 1.0, note: 'Never exceed 1.0 mph in neurological patients — fall risk' },
      session_duration_min: { initial: 3, target: 8 },
      frequency_per_week: { min: 3, max: 5, note: 'Higher frequency critical for DM — exercise slows progression' },
      water_temp_f: { min: 87, max: 92, optimal: 90, note: 'Warmer water reduces muscle spasm in neuro patients' },
      rehab_phase: 'All phases — ongoing for DM',
      post_op_week: '1+ for IVDD surgical, or immediate for DM/FCE conservative',
      incline_degrees: 0,
      jets: false,
      handler_support: 'Sling or manual hindquarter support required for Grade III-IV. Handler inside treadmill unit for Grade IV.'
    },
    equipment: ['Underwater treadmill', 'Hindquarter sling', 'Life vest', 'Two handlers preferred for Grade IV'],
    setup: 'Fill to hip or chest level depending on grade. Warmer water (90°F preferred). Handler inside unit for Grade IV patients. Sling under hindquarters from session start.',
    steps: [
      'Position sling under hindquarters before entering treadmill',
      'Handler provides hindquarter support throughout — do NOT let neurological dog fall in UWTM',
      'Start belt at 0.5 mph. Observe if limbs are making voluntary stepping attempts',
      'Even unconscious stepping (reflex stepping) in water = progress for Grade IV patients',
      'Grade III: 5-8 min sessions. Grade IV: 3-5 min sessions initially',
      'DM patients: prioritize frequency over duration. 5x/week at 5-8 min > 2x/week at 15 min',
      'Document: stepping attempts, voluntary vs reflex, symmetry, duration tolerrated',
      'Post-session: full dry, bladder check in incontinent patients, skin inspection'
    ],
    good_form: [
      'Any visible limb movement in water — even reflex stepping counts as therapeutic',
      'Patient calm in water — anxiety negates neuromuscular benefit',
      'Handler maintaining stable hindquarter position without dragging'
    ],
    red_flags: [
      'Grade V IVDD (deep pain absent) — CONTRAINDICATED. Aspiration risk from incontinence.',
      'Patient submerging nose/mouth — immediate stop, chest-level water too deep for this patient',
      'Acute worsening of neurological grade during UWTM course — stop, immediate vet reassessment',
      'DM Stage 3 (forelimb involvement) — reassess cart suitability before continuing UWTM'
    ],
    contraindications: 'Grade V IVDD, DM Stage 3, severe brachycephalic airway obstruction, uncontrolled urinary/fecal incontinence without protective garment, open spinal surgical site',
    progression: 'DM: no progression target — maintain maximum function. IVDD: advance speed/reduce depth as neurological grade improves. FCE: progress per functional recovery rate.',
    clinical_classification: {
      primary_indications: ['IVDD', 'DEGENERATIVE_MYELO', 'FCE'],
      rehab_phases: ['ACUTE', 'SUBACUTE', 'CHRONIC', 'MAINTENANCE'],
      intervention_type: 'AQUATIC_HYDROTHERAPY',
      evidence_grade: 'A'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 6. UWTM OBESITY — BCS 7-9 Weight Management Protocol
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: 'UWTM_OBESITY',
    name: 'Underwater Treadmill — Obesity / BCS 7-9 Protocol',
    category: 'Hydrotherapy',
    difficulty_level: 'Easy',
    description: 'UWTM protocol specifically designed for obese patients (BCS 7-9). Water at hip-to-chest level dramatically reduces joint impact while enabling cardiovascular exercise. This is the FIRST-LINE exercise for obese patients before ANY land-based exercise is introduced. Concurrent veterinary weight-loss program is mandatory.',
    uwtm_dosing: {
      water_depth: 'BCS 7: hip level. BCS 8-9: chest level (maximum buoyancy, minimum joint load).',
      weight_bearing_reduction: 'BCS 7: 62%. BCS 8-9: 75-80% (chest level)',
      speed_mph: { min: 0.5, max: 1.2, note: 'Keep speed low — cardiac demand already elevated in obese patients' },
      session_duration_min: { initial: 8, target: 15, note: 'Short sessions to prevent hyperthermia. BCS 8-9: cap at 10 min initially.' },
      frequency_per_week: { min: 3, max: 5, note: 'Frequency over intensity for weight management' },
      water_temp_f: { min: 83, max: 88, optimal: 85, note: 'CRITICAL: Cooler water than standard — obese dogs overheat faster. Never exceed 88°F for BCS 8-9.' },
      rehab_phase: 'All phases — primary modality until BCS ≤6',
      post_op_week: 'N/A — condition-based not time-based',
      incline_degrees: 0,
      jets: false
    },
    equipment: ['Underwater treadmill', 'Fan for active cooling if needed', 'Temperature monitor'],
    setup: 'CRITICAL: Water temperature 83-88°F (lower than standard). Fill to chest level for BCS 8-9. Have fan available. Monitor rectal temp if session extends past 10 min for BCS 8-9.',
    steps: [
      'Fill water to chest level (BCS 8-9) or hip level (BCS 7)',
      'Temperature CHECK before entry: must be 83-88°F. Never start above 90°F in obese patients',
      'Start 0.5 mph. Obese dogs may have poor cardiovascular baseline — acclimate slowly',
      'Monitor breathing rate every 2 min. Excessive panting = slow down or stop',
      'Session 8-10 min initially. Increase by 2 min/week as cardiovascular fitness improves',
      'POST-SESSION: allow cool-down in still water 2 min before exit. Fan dry preferred over hot-air dryer',
      'Document: weight at every visit. Target 0.5-1 kg/month loss concurrent with UWTM program'
    ],
    good_form: [
      'Dog moving at slow trot without panting excessively',
      'No stumbling despite high body mass',
      'Mucous membranes pink throughout'
    ],
    red_flags: [
      'Rectal temperature >104°F — stop immediately, cool water rinse, emergency vet if not resolving',
      'Pale or brick-red mucous membranes — cardiovascular emergency',
      'Brachycephalic breed BCS 8-9 — EXTREME CAUTION. Short sessions only (5 min). Vet cardiac clearance recommended first.'
    ],
    contraindications: 'Brachycephalic breeds BCS 8-9 without prior cardiac/respiratory clearance, water temp >90°F, ambient temperature >80°F without adequate ventilation',
    progression: 'As BCS reduces: gradually transition to hip-level water and increase speed. Introduce land-based exercise when BCS ≤6.',
    clinical_classification: {
      primary_indications: ['OBESITY', 'HIP_DYSPLASIA', 'OSTEOARTHRITIS', 'GERIATRIC'],
      rehab_phases: ['ACUTE', 'SUBACUTE', 'CHRONIC', 'MAINTENANCE'],
      intervention_type: 'AQUATIC_HYDROTHERAPY',
      evidence_grade: 'B'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 7. UWTM GERIATRIC / DM MAINTENANCE — Phase V Lifelong Protocol
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: 'UWTM_GERIATRIC',
    name: 'Underwater Treadmill — Geriatric / DM Lifelong Maintenance Protocol',
    category: 'Hydrotherapy',
    difficulty_level: 'Easy',
    description: 'Phase V lifelong UWTM maintenance for geriatric patients and DM patients. Goal is muscle mass preservation, joint mobility maintenance, cardiovascular health, and quality of life — not performance. For DM: frequency is the most important variable. Exercise slows DM progression measurably. Never stop exercise in DM — progression of the disease accelerates with inactivity.',
    uwtm_dosing: {
      water_depth: 'Hip to stifle level depending on condition severity',
      weight_bearing_reduction: '38–62%',
      speed_mph: { min: 0.8, max: 1.5, note: 'Comfortable trot. DM patients: whatever pace allows voluntary limb movement.' },
      session_duration_min: { initial: 10, target: 15, note: 'Cap at 15 min for geriatric. DM: 20 min acceptable if patient tolerates.' },
      frequency_per_week: { min: 3, max: 5, note: 'DM: 5x/week is the clinical target. Geriatric OA: 3x/week minimum.' },
      water_temp_f: { min: 87, max: 92, optimal: 90, note: 'Warmer water reduces stiffness in arthritic joints. Critical for geriatric patients.' },
      rehab_phase: 'Phase V — Lifelong Maintenance',
      post_op_week: 'N/A — chronic/lifelong',
      incline_degrees: { min: 0, max: 5, note: 'Maximum 5° incline in geriatric patients' },
      jets: false
    },
    equipment: ['Underwater treadmill', 'Ramp entry if available — reduces hip stress at entry/exit', 'Warm dryer'],
    setup: 'Warm water 90°F. Ramp entry preferred over step-up. Allow longer acclimation in arthritic patients — 3-5 min warmup at slowest speed.',
    steps: [
      'Warm water to 90°F — critical for arthritic/geriatric patients',
      'Allow slow entry. Use ramp if available — single-step entry stresses arthritic hips',
      'Warm up at 0.5 mph for 3 min before advancing to working speed',
      'Working speed: comfortable trot, patient should appear relaxed not laboring',
      'Monitor for: toe-dragging (DM progression), stumbling (fatigue or worsening OA), breathing rate',
      'DM patients: document any changes in stepping quality at each session — tracks disease progression',
      'Exit slowly. Post-session: warm dry, brief soft tissue massage to gluteals/hamstrings'
    ],
    good_form: [
      'Relaxed expression — patient should look comfortable, even enjoying session',
      'For DM: any active stepping, even inconsistent, is therapeutic success',
      'Arthritic patients: visibly less stiff during and immediately post-session vs pre-session'
    ],
    red_flags: [
      'DM patient suddenly unable to step voluntarily — possible rapid progression, vet reassessment',
      'Geriatric patient with new cardiac arrhythmia detected (irregular breathing, pallor) — stop, vet referral',
      'Marked deterioration in stepping quality over 2 weeks — document and report to attending vet'
    ],
    contraindications: 'DM Stage 3+ (significant forelimb involvement) — requires cart assessment before continuing UWTM',
    progression: 'No progression target — maintain current parameters. Adjust downward during arthritis flares. Never stop entirely.',
    clinical_classification: {
      primary_indications: ['GERIATRIC', 'DEGENERATIVE_MYELO', 'OSTEOARTHRITIS', 'PALLIATIVE'],
      rehab_phases: ['MAINTENANCE'],
      intervention_type: 'AQUATIC_HYDROTHERAPY',
      evidence_grade: 'A'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 8. UWTM INCLINE — Hindlimb Recruitment Focus
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: 'UWTM_INCLINE',
    name: 'Underwater Treadmill — Incline Hindlimb Recruitment Protocol',
    category: 'Hydrotherapy',
    difficulty_level: 'Moderate',
    description: 'UWTM with incline specifically to maximize hindlimb gluteal and hamstring recruitment. Incline combined with water buoyancy provides high muscular demand with low joint impact. Particularly valuable for hip dysplasia, post-FHO, and post-TPLO patients needing hindlimb muscle mass restoration. Phase III+ only.',
    uwtm_dosing: {
      water_depth: 'Stifle level — maintains 38% weight reduction while maximizing active loading',
      weight_bearing_reduction: '38%',
      speed_mph: { min: 1.0, max: 2.0, note: 'Slower speed with incline = same muscular demand as faster speed flat' },
      session_duration_min: { initial: 8, target: 12 },
      frequency_per_week: { min: 2, max: 3 },
      water_temp_f: { min: 85, max: 92, optimal: 88 },
      rehab_phase: 'Phase III — Phase IV',
      post_op_week: '8–16',
      incline_degrees: { progression: '5° (week 8-10), 10° (week 10-12), 15° (week 12+)', max: 15 },
      jets: false
    },
    equipment: ['Underwater treadmill with incline — confirm incline is functional before session'],
    setup: 'Confirm incline function. Set to 5° for first incline session. Water at stifle level. Speed 0.2 mph lower than flat protocol speed.',
    steps: [
      'Warm up 2 min flat at moderate speed before engaging incline',
      'Engage 5° incline. Reduce speed 0.2 mph from flat working speed',
      'Observe immediately: hindquarters should lower, butt engagement visible',
      'Run 8-10 min incline protocol. Watch for toe-dragging at hind feet (fatigue)',
      'Return to flat for 2-min cool-down before ending session',
      'Progress incline: 5° → 10° → 15° only when previous incline is maintained with good form for 2+ sessions',
      'Measure limb circumference at mid-thigh weekly — incline protocol should accelerate atrophy recovery'
    ],
    good_form: [
      'Hindquarters visibly lower during incline walking — glute and hamstring engagement confirmed',
      'Forelimbs reaching forward with longer stride to compensate for incline',
      'No toe-dragging at hindlimbs throughout incline session'
    ],
    red_flags: [
      'Toe-dragging emerging on incline not present on flat — fatigue or neurological concern, remove incline',
      'Lumbosacral patients: incline may exacerbate pain — use flat protocol only for LS disease',
      'Patient sitting down on incline — overload or pain, reduce incline immediately'
    ],
    contraindications: 'Lumbosacral disease, acute disc disease, Phase I or II patients, bilateral TPLO before week 8',
    progression: 'Progress to UWTM_PHASE4 with jets when 15° incline maintained pain-free for 2+ sessions.',
    clinical_classification: {
      primary_indications: ['CCL_REPAIR', 'HIP_DYSPLASIA', 'PATELLAR_LUXATION', 'FRACTURE'],
      rehab_phases: ['CHRONIC'],
      intervention_type: 'AQUATIC_HYDROTHERAPY',
      evidence_grade: 'B'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 9. UWTM POST-TPLO — Condition-Specific TPLO Protocol
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: 'UWTM_POST_TPLO',
    name: 'Underwater Treadmill — Post-TPLO Condition-Specific Protocol',
    category: 'Hydrotherapy',
    difficulty_level: 'Easy',
    description: 'UWTM protocol specifically calibrated to TPLO healing milestones (Millis & Levine Ch. 24). Water depth and speed progress in lockstep with the 16-week TPLO rehabilitation timeline. This protocol integrates Block 5 TPLO decision tree milestones directly into UWTM session parameters. Not interchangeable with generic Phase I-IV UWTM entries.',
    uwtm_dosing: {
      week_2_4: {
        water_depth: 'Hip level',
        weight_bearing_reduction: '62%',
        speed_mph: 0.5,
        duration_min: 5,
        frequency: '2x/week',
        note: 'Begin only if incision healed (10-14 days). Confirm suture removal completed.'
      },
      week_4_6: {
        water_depth: 'Hip level',
        weight_bearing_reduction: '62%',
        speed_mph: 1.0,
        duration_min: 8,
        frequency: '2-3x/week',
        note: 'Increase speed when dog shows push-off from surgical limb'
      },
      week_6_10: {
        water_depth: 'Stifle level',
        weight_bearing_reduction: '38%',
        speed_mph: { min: 1.0, max: 1.5 },
        duration_min: 10,
        frequency: '2-3x/week',
        note: 'Lower water depth as surgical site healing confirmed. Stifle ROM should be improving.'
      },
      week_10_16: {
        water_depth: 'Stifle to hock level progression',
        weight_bearing_reduction: '15–38%',
        speed_mph: { min: 1.5, max: 2.5 },
        duration_min: 15,
        frequency: '3x/week',
        note: 'Add incline 5° at week 12+ if ROM and limb circumference on target'
      },
      rehab_phase: 'Phase I → IV (TPLO timeline-gated)',
      water_temp_f: { min: 85, max: 92 }
    },
    equipment: ['Underwater treadmill', 'Limb circumference tape', 'Goniometer'],
    setup: 'Follow week-specific parameters above. Never skip weeks based on appearance alone — radiographic and clinical milestones govern progression.',
    steps: [
      'Week 2-4: Confirm sutures/incision healed before ANY water contact. Hip-level water, 0.5 mph, 5 min',
      'Week 4-6: Document whether surgical limb is visibly pushing off. If yes: advance to 1.0 mph',
      'Week 6-10: Lower water to stifle level. Measure stifle ROM with goniometer — should trend toward normal',
      'Week 10-16: Progress to hock-level water. Measure limb circumference weekly',
      'Week 16: Full TPLO clearance criteria check before transitioning out of condition-specific protocol'
    ],
    good_form: [
      'Surgical limb shows visible active propulsion by week 6-8',
      'Limb circumference gap closing toward contralateral by week 10-12',
      'Symmetric gait at target speed with no head-bobbing by week 12+'
    ],
    red_flags: [
      'Sudden non-weight-bearing at any point post-TPLO — IMMEDIATE STOP. Do not assign any UWTM. Implant failure must be ruled out first.',
      'Incision redness or discharge — stop UWTM until veterinary clearance',
      'Stifle effusion increasing — reduce water depth, add cold therapy post-session'
    ],
    contraindications: 'Any UWTM before incision healed (10-14 days minimum), open sutures, surgical site infection, implant failure concern',
    progression: 'After week 16 with full TPLO clearance: transition to UWTM_PHASE4 maintenance protocol.',
    clinical_classification: {
      primary_indications: ['CCL_REPAIR'],
      rehab_phases: ['ACUTE', 'SUBACUTE', 'CHRONIC'],
      intervention_type: 'AQUATIC_HYDROTHERAPY',
      evidence_grade: 'A'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 10. POOL SUPPORTED — Neurological / Weak Patient Pool Protocol
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: 'POOL_SUPPORTED',
    name: 'Pool Swimming — Supported Neurological Protocol',
    category: 'Hydrotherapy',
    difficulty_level: 'Moderate',
    description: 'Supported pool swimming for neurological patients (IVDD Grade I-II, DM Stage 1-2, FCE) and patients with significant muscle atrophy. Handler in pool providing hindquarter buoyancy support. Zero weight-bearing — pure muscular effort against water resistance. Superior to UWTM for generating symmetric hindlimb paddling patterns in early neuro recovery.',
    uwtm_dosing: {
      modality: 'Pool — not UWTM',
      water_depth: 'Full depth pool — dog fully supported by water and handler',
      weight_bearing_reduction: '100% — zero weight-bearing',
      session_duration_min: { initial: 2, target: 8, note: 'Neuro patients fatigue quickly — short frequent sessions preferred' },
      frequency_per_week: { min: 3, max: 5 },
      water_temp_f: { min: 88, max: 94, optimal: 92, note: 'Warmer pool water critical — neurological patients lose core temp quickly' },
      life_vest: 'Mandatory for all patients in pool protocol',
      handler_position: 'In pool, supporting hindquarters. Second handler on pool deck for safety.'
    },
    equipment: ['Therapeutic pool', 'Life vest (mandatory)', 'Two handlers', 'Pool ramp or steps for entry/exit', 'Warm dryer'],
    setup: 'Water at 90-92°F. Life vest fitted and snug before entry. Handler in pool positioned at patient hindquarters. Second handler on deck.',
    steps: [
      'Fit life vest — snug but not restrictive. Test fit before pool entry',
      'Handler enters pool first. Assist dog entry via ramp (preferred) or gentle lift',
      'Support hindquarters gently — not lifting, supporting buoyancy',
      'Allow 60 seconds calm acclimatization before encouraging movement',
      'Grade I-II: encourage paddling by moving forward slowly in pool',
      'Grade III-IV: passive hindlimb paddling — move dog forward, hindlimbs may paddle reflexively',
      'Initial sessions 2-3 min. Progress by 1 min/session to maximum 8-10 min',
      'Exit via ramp. Full dry immediately — neurological patients at hypothermia risk'
    ],
    good_form: [
      'Active hindlimb paddling with any voluntary effort — document precisely',
      'Patient calm, not panicking — fear response negates all therapeutic benefit',
      'Handler maintaining stable support without impeding limb movement'
    ],
    red_flags: [
      'Patient submerging head or appearing to aspirate — stop immediately',
      'Extreme panic — forced swimming is counterproductive and dangerous, abandon session',
      'Grade V IVDD — ABSOLUTE CONTRAINDICATION for pool (aspiration risk)',
      'Brachycephalic breeds — POOL CONTRAINDICATED if significant airway obstruction present'
    ],
    contraindications: 'Grade V IVDD, brachycephalic breeds with significant airway obstruction, open wounds, active skin infection, extreme water phobia, severe cardiac disease, pool water temperature <85°F',
    progression: 'As neurological grade improves: reduce handler support gradually. Transition to unsupported pool or UWTM when dog can maintain forelimb paddling for 3+ minutes independently.',
    clinical_classification: {
      primary_indications: ['IVDD', 'DEGENERATIVE_MYELO', 'FCE', 'GERIATRIC'],
      rehab_phases: ['SUBACUTE', 'CHRONIC', 'MAINTENANCE'],
      intervention_type: 'AQUATIC_HYDROTHERAPY',
      evidence_grade: 'B'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 11. POOL THERAPEUTIC — Phase III-IV Full Swimming Protocol
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: 'POOL_THERAPEUTIC',
    name: 'Pool Swimming — Full Therapeutic Protocol (Phase III-IV)',
    category: 'Hydrotherapy',
    difficulty_level: 'Moderate',
    description: 'Full therapeutic pool swimming for ambulatory patients in Phase III-IV recovery. Zero impact, high cardiovascular and muscular demand. Superior for cardiovascular conditioning, bilateral limb use, and patients who cannot tolerate land exercise due to severe OA or obesity. Not a replacement for UWTM — complements it by adding full-body symmetric loading.',
    uwtm_dosing: {
      modality: 'Pool — not UWTM',
      water_depth: 'Full depth pool',
      weight_bearing_reduction: '100% — zero weight-bearing during swimming',
      session_duration_min: { initial: 3, target: 15, progression: 'Add 2 min/week' },
      frequency_per_week: { min: 1, max: 3 },
      water_temp_f: { min: 85, max: 92, optimal: 88 },
      life_vest: 'Optional for strong swimmers. Mandatory for first session and any patient with reduced buoyancy (sighthounds, very lean dogs).'
    },
    equipment: ['Therapeutic pool', 'Life vest', 'Retrieving toy (optional — motivation)', 'Ramp for entry/exit'],
    setup: 'Water 88°F. Assess swim competency on first session before removing life vest. Ramp entry/exit mandatory — jumping in/out = joint impact = defeats the purpose.',
    steps: [
      'First session: life vest on. Assess swim ability and enthusiasm before removal',
      'Enter via ramp — NEVER allow jumping into pool (joint impact at entry)',
      'Encourage swimming with toy or treat motivation across pool width initially',
      'Progress to pool length swims as endurance builds',
      'Maximum 15 min therapeutic session. Rest on ramp mid-session if fatigued',
      'Exit via ramp — never lift full-body weight of post-surgical patient out of pool by spine',
      'Post-session: full dry, 15-min rest before any land-based exercise'
    ],
    good_form: [
      'Symmetric paddling all four limbs — asymmetry indicates pain or neurological deficit',
      'Head above water comfortably with relaxed neck — not straining to breathe',
      'Smooth transition to ramp exit without scrambling'
    ],
    red_flags: [
      'Asymmetric paddling (one side dominant) — possible pain, investigate source',
      'Labored breathing or excessive panting in water — exit immediately',
      'Brachycephalic breeds — assess carefully. Short-nosed breeds at aspiration risk in pool'
    ],
    contraindications: 'Brachycephalic breeds with significant airway obstruction, Grade III-V IVDD, open wounds, extreme water fear, severe cardiac disease',
    progression: 'Combine with land exercise at Phase IV. Maintain 1-2x/week pool sessions through Phase V maintenance.',
    clinical_classification: {
      primary_indications: ['HIP_DYSPLASIA', 'OSTEOARTHRITIS', 'CCL_REPAIR', 'OBESITY', 'GERIATRIC', 'SPORT'],
      rehab_phases: ['CHRONIC', 'MAINTENANCE'],
      intervention_type: 'AQUATIC_HYDROTHERAPY',
      evidence_grade: 'B'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 12. UWTM HIP DJD — Bilateral Hip DJD / OA Specific Protocol
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: 'UWTM_HIP_DJD',
    name: 'Underwater Treadmill — Bilateral Hip DJD / Osteoarthritis Protocol',
    category: 'Hydrotherapy',
    difficulty_level: 'Easy',
    description: 'UWTM protocol specifically for bilateral hip DJD and generalized osteoarthritis. Hip-level water offloads the joint while allowing full ROM movement — ideal for patients where land exercise exacerbates pain. Warm water (90°F) reduces joint stiffness and muscle guarding before exercise begins. Concurrent NSAID compliance is assumed. This is the primary aquatic protocol for chronic OA patients including Dylan-type bilateral presentations.',
    uwtm_dosing: {
      water_depth: 'Hip level — greater trochanter landmark. Reduces load on hip joint by 62%.',
      weight_bearing_reduction: '62%',
      speed_mph: { min: 0.8, max: 1.5, note: 'Comfortable walk. Patient sets the pace — do not push speed in bilateral OA.' },
      session_duration_min: { initial: 8, target: 15 },
      frequency_per_week: { min: 3, max: 5, note: '3x/week minimum for OA management benefit. 5x/week optimal.' },
      water_temp_f: { min: 88, max: 92, optimal: 90, note: 'Warm water critical — reduces hip joint stiffness and muscle guarding.' },
      rehab_phase: 'Phase II–V (chronic OA — ongoing)',
      post_op_week: 'N/A — condition-based',
      incline_degrees: { initial: 0, progression: 'Introduce 5° incline at month 2+ if pain ≤2/10 consistently', max: 10 },
      jets: false,
      bilateral_note: 'Bilateral hip DJD: observe for alternating lameness patterns. Document which limb appears more affected each session.'
    },
    equipment: ['Underwater treadmill', 'Ramp entry preferred — reduces single-limb loading at entry/exit', 'Warm towels and dryer'],
    setup: 'Fill to hip level (greater trochanter). Pre-warm water to 90°F. Ramp entry. Allow 3-minute slow warm-up before advancing speed.',
    steps: [
      'Pre-warm water to 90°F — DO NOT start session at <85°F for bilateral hip OA patients',
      'Ramp entry. Observe gait immediately: which hindlimb shows more reluctance or shorter stride?',
      'Start belt 0.5 mph warm-up for 3 min. Observe hip extension symmetry bilateral',
      'Advance to 0.8-1.5 mph working speed based on patient response',
      'Run 8-15 min depending on fitness level. Document if patient voluntarily slows — may indicate fatigue or pain',
      'Observe hip extension: reduced extension is the key deficit in hip DJD — note improvement over sessions',
      'Cool down: 2 min at 0.5 mph. Cold therapy 15 min post-session if heat present at hip joints',
      'Weigh patient at each visit — weight management is concurrent treatment goal for bilateral hip OA'
    ],
    good_form: [
      'Symmetric hindlimb stride length in water — asymmetry persisting after warmup = active pain',
      'Visible hip extension during push-off phase in water',
      'Dog appears comfortable, not hunched or guarding at working speed'
    ],
    red_flags: [
      'Acute worsening lameness in UWTM patient — possible OA flare or concurrent injury. Reduce session, apply cold therapy, consult vet if persists',
      'Patient refuses to weight-bear in water (Grade 4-5 lameness in UWTM) — pain too severe, escalate to vet for pain management review before continuing',
      'BCS 8+ bilateral hip DJD — transition to chest-level water (UWTM_OBESITY protocol parameters) immediately'
    ],
    contraindications: 'Acute OA flare with fever, septic arthritis (joint infection), open skin wounds over hip region',
    progression: 'Progress to incline (5°) at month 2+ if responding well. Maintain indefinitely as lifelong management. Introduce POOL_THERAPEUTIC for cardiovascular variety at Phase III+.',
    clinical_classification: {
      primary_indications: ['HIP_DYSPLASIA', 'OSTEOARTHRITIS', 'GERIATRIC'],
      rehab_phases: ['SUBACUTE', 'CHRONIC', 'MAINTENANCE'],
      intervention_type: 'AQUATIC_HYDROTHERAPY',
      evidence_grade: 'A'
    }
  }

];

// ============================================================================
// EXPORT
// ============================================================================
module.exports = AQUATIC_EXERCISES_PART11;
