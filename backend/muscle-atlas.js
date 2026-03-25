// ============================================================================
// MUSCLE ATLAS — B.E.A.U. Clinical Anatomy Intelligence Layer
// © 2025 Salvatore Bonanno. All rights reserved. Proprietary.
// K9 Rehab Pro™ | B.E.A.U. Engine
// ============================================================================
// Source authorities:
//   Evans HE, de Lahunta A — Miller's Anatomy of the Dog, 4th ed. (2013)
//   Dyce KM, Sack WO, Wensing CJG — Textbook of Veterinary Anatomy, 4th ed.
//   Constantinescu GM — Clinical Anatomy of the Dog & Cat, 2nd ed.
//   Millis DL, Levine D — Canine Rehabilitation & Physical Therapy, 2nd ed.
//   Drum, Bockstahler, Levine, Marcellin-Little — Feline Rehabilitation (2015)
// ============================================================================
// Purpose: Give B.E.A.U. the ability to explain WHY a specific exercise targets
// a specific muscle at a specific phase — not just WHAT, but the biology behind it.
// Every structure includes: origin, insertion, action, innervation, blood supply,
// rehab relevance, atrophy signs, compensation patterns, phase loading guidance,
// and feline-specific notes where applicable.
// ============================================================================

const MUSCLE_ATLAS = {

  // ══════════════════════════════════════════════════════════════════════════
  // HINDLIMB — THIGH MUSCULATURE
  // ══════════════════════════════════════════════════════════════════════════

  quad: {
    id: "quad",
    bilateral_ids: ["quad_l", "quad_r"],
    name: "Quadriceps Femoris",
    clinical_name: "m. quadriceps femoris",
    species: ["canine", "feline"],
    components: [
      "Rectus femoris — only biarticular head (hip flex + stifle extend)",
      "Vastus lateralis — largest head, lateral femoral shaft",
      "Vastus medialis — critical for patellar tracking",
      "Vastus intermedius — deep, directly on femoral shaft"
    ],
    origin: "Ilium cranial to acetabulum (rectus femoris); greater trochanter and femoral shaft (vasti)",
    insertion: "Tibial tuberosity via patellar ligament; all four heads converge on patella",
    action: "Primary stifle extensor; rectus femoris also flexes hip. The most powerful muscle group in the hindlimb.",
    innervation: "Femoral nerve (L4, L5, L6)",
    blood_supply: "Femoral artery — medial and lateral circumflex femoral branches",
    palpation: "Craniolateral thigh. Thigh circumference at mid-femur is the primary clinical proxy for quad mass.",
    rehab_relevance: "The #1 muscle lost to disuse atrophy post-TPLO, TTA, and FHO. Neuropraxia from femoral nerve stretch during hip surgery causes acute inhibition. The stifle joint's pain inhibits quad activation via arthrogenic muscle inhibition (AMI) — pain = no quad contraction even if nerve is intact. This is why NMES (NMES_QUAD) is used in week 1-2 before voluntary exercise is possible. Thigh circumference loss of >1cm vs. contralateral = clinically significant. >2cm = severe atrophy requiring aggressive intervention.",
    post_op_significance: "Post-TPLO: TPA (tibial plateau angle) correction changes the mechanical advantage of the quad — initially the muscle must work harder on the new geometry. Progression from passive to active to resisted loading must respect this adaptation period.",
    atrophy_tracking: "Thigh circumference measurement at mid-femur (midpoint between greater trochanter and lateral fabella). Measure bilaterally at every session. Document in patient record. Target: symmetric circumference by week 12.",
    weakness_signs: [
      "Bunny-hopping gait — bilateral quad weakness causing simultaneous hindlimb push-off",
      "Stifle buckling on descent (stairs, ramp) — eccentric quad failure",
      "Inability to maintain sit position without progressive stifle extension (legs sliding out)",
      "Compensatory thoracic limb loading — leans forward to offload hindquarters",
      "Short stride — reduces stifle excursion to minimize quad demand"
    ],
    compensation_patterns: [
      "Contralateral hindlimb hyperloading — leads to bilateral OA progression",
      "Thoracic limb muscle hypertrophy (wheelbarrow stance)",
      "Lumbosacral overloading — excessive lumbar extension compensates for reduced hindquarter drive"
    ],
    phase_loading: {
      acute_weeks_1_2: "Passive ROM only. NMES (15-20 min, 1-2x/day) stimulates quad without voluntary effort. Prevents denervation atrophy during AMI period.",
      subacute_weeks_3_6: "Active weight bearing — assisted standing, weight shifting. Sit-to-stand introduces concentric loading. Water treadmill allows loading with 60-80% bodyweight unloaded. Target: symmetric stance.",
      chronic_weeks_7_plus: "Resisted loading — incline walking, hill climbing, step-ups. Eccentric loading (descent) is introduced at week 8-10 when callus permits. Thigh circumference target: within 1cm bilateral by week 12."
    },
    goniometry_relevance: "Stifle ROM directly reflects quad extensibility and pain inhibition. Post-TPLO normal extension = 155-165 degrees. Flexion = 35-45 degrees. <130 degrees extension = significant contracture — increase PROM frequency.",
    manual_muscle_testing: "Grade 0-5 scale. Grade 3 = movement against gravity (can extend stifle in lateral recumbency). Grade 4 = moderate resistance. Grade 5 = full resistance. Most post-TPLO patients present at Grade 2-3 at week 1.",
    feline_notes: "Cats lose quad mass more rapidly than dogs during disuse due to higher baseline metabolic rate. Feline AMI is less well-documented but clinically evident — a cat in pain will not voluntarily load the affected stifle. FMPI item: 'difficulty rising from sitting position' directly tracks quad function. Sit-to-stand (FELINE_SIT_STAND) is the primary feline quad exercise — treat held above eye level motivates the extension.",
    related_conditions: ["POST_TPLO", "TTA", "LUXATING_PATELLA", "STIFLE_OA", "IVDD_HINDLIMB", "HIP_DYSPLASIA"],
    exercises_that_target: ["SIT_STAND", "DOWN_STAND", "STAIR_CLIMB", "HILL_CLIMB", "UWT_WALK", "NMES_QUAD", "STEP_UPS", "CAVALETTI", "FELINE_SIT_STAND", "FELINE_CAVALETTI"],
    contraindications_for_loading: ["Non-weight-bearing (NWB) fracture", "Stifle luxation", "Grade 5 lameness unresolved", "Acute femoral nerve injury"],
    source: "Evans & de Lahunta 2013 pp.381-385; Millis & Levine 2014 Ch.17"
  },

  hamstrings: {
    id: "hamstrings",
    bilateral_ids: ["hamstring_l", "hamstring_r"],
    name: "Hamstring Group",
    clinical_name: "mm. biceps femoris, semitendinosus, semimembranosus",
    species: ["canine", "feline"],
    components: [
      "Biceps femoris — largest, most superficial, lateral caudal thigh (two heads in dog)",
      "Semitendinosus — medial caudal thigh, long tendon at hock (tarsal extensor via common calcaneal tendon)",
      "Semimembranosus — deepest, medial caudal thigh, two bellies in dog"
    ],
    origin: "Ischial tuberosity (all three); biceps femoris also has vertebral head from sacral/caudal fascia",
    insertion: "Biceps femoris: lateral tibial fascia, lateral patellar ligament, crural fascia, and calcaneal tuber via biceps tendon. Semitendinosus: medial tibial crest and calcaneal tuber. Semimembranosus: medial femoral condyle and medial tibial condyle.",
    action: "Hip extension (primary hip extensor — more powerful than gluteals for propulsion). Stifle flexion. Hock extension via calcaneal tendon contributions. Biceps femoris also abducts hip.",
    innervation: "Sciatic nerve (L6, L7, S1, S2) — caudal gluteal and tibial branches",
    blood_supply: "Caudal femoral artery branches",
    palpation: "Caudal thigh — large muscle mass filling the caudal compartment. Gracilis contracture must be differentiated from hamstring tightness on palpation.",
    rehab_relevance: "The hamstrings are the primary propulsive engine for hill climbing, stair ascent, and swimming. Post-TPLO patients often show paradoxical hamstring tightness — the muscle contracts eccentrically to resist cranial tibial thrust (the instability CCL was preventing). This causes muscle guarding, painful palpation at ischial tuberosity, and reduced hip extension ROM. Passive ROM in hip extension specifically assesses hamstring extensibility. Iliopsoas strain is often concurrent with hamstring tightness — assess both.",
    weakness_signs: [
      "Reduced propulsion — short push-off phase, shuffling gait",
      "Inability to maintain stair ascent — collapses at top step",
      "Bunny-hopping at trot (bilateral weakness)",
      "Reduced hip extension ROM on goniometry",
      "Pain on deep palpation of caudal thigh or ischial tuberosity"
    ],
    compensation_patterns: [
      "Increased thoracic limb reach to compensate for reduced hindlimb drive",
      "Exaggerated lumbar extension (back dipping) to substitute for hip extension",
      "Trot converted to pace (lateral gait) to reduce hindlimb demand"
    ],
    phase_loading: {
      acute_weeks_1_2: "Gentle PROM of hip extension assesses and maintains hamstring length. Cold therapy to ischial tuberosity if tenderness noted. No active loading.",
      subacute_weeks_3_6: "Slow walking on level surface activates hamstrings eccentrically. Shallow incline walking (5-10°) begins concentric hip extension demand. Massage (MASSAGE_THERA) reduces guarding in caudal thigh.",
      chronic_weeks_7_plus: "Hill climbing (HILL_CLIMB) is the primary hamstring strength exercise — uphill = concentric hip extension. Swimming engages hamstrings through full water resistance. Return to full function when symmetric stride length achieved."
    },
    feline_notes: "Hamstring tightness in cats presents as difficulty jumping up (requires hip extension for take-off) — an FMPI-tracked behavior. FELINE_STAIR_WAND (ascent phase) is the primary feline hamstring exercise. Semitendinosus contracture (ST contracture) is a specific feline condition causing progressive hindlimb gait abnormality — a distinct clinical entity requiring specific manual therapy.",
    semitendinosus_contracture_note: "ST contracture in cats: unique feline condition causing the semitendinosus to fibrosis, creating a characteristic 'skipping' gait. Distinguish from general hamstring tightness by specific palpation of the ST tendon. Stretching program targets ST specifically.",
    related_conditions: ["POST_TPLO", "HIP_DYSPLASIA", "ILIOPSOAS_STRAIN", "GRACILIS_ST_CONTRACTURE", "LUMBOSACRAL", "DEGENERATIVE_MYELOPATHY"],
    exercises_that_target: ["HILL_CLIMB", "STAIR_CLIMB", "SWIM", "SLOW_WALK", "BACKING_UP", "FELINE_STAIR_WAND"],
    source: "Evans & de Lahunta 2013 pp.385-391; Millis & Levine 2014 Ch.17"
  },

  gluteals: {
    id: "gluteals",
    bilateral_ids: ["glute_l", "glute_r"],
    name: "Gluteal Muscle Group",
    clinical_name: "mm. gluteus medius, gluteus superficialis, gluteus profundus",
    species: ["canine", "feline"],
    components: [
      "Gluteus medius — largest, primary hip abductor and extensor, deep to superficialis",
      "Gluteus superficialis — most superficial, hip extension and abduction",
      "Gluteus profundus — smallest, deep, hip abduction (not palpable independently)"
    ],
    origin: "Gluteus medius: iliac crest, gluteal surface of ilium, thoracolumbar fascia. Gluteus superficialis: sacrum, first caudal vertebrae, thoracolumbar fascia.",
    insertion: "Greater trochanter of femur (all three heads converge here)",
    action: "Hip abduction (primary function — critical for lateral stability during gait). Hip extension (gluteus medius contributes significantly — important for sit-to-stand and stair climbing). Internal rotation of hip.",
    innervation: "Cranial and caudal gluteal nerves (L6, L7, S1)",
    blood_supply: "Cranial and caudal gluteal arteries",
    palpation: "Dorsolateral pelvis — cranial to greater trochanter. Pain on deep gluteal palpation = hip OA, hip dysplasia, or post-FHO guarding.",
    rehab_relevance: "Gluteals are the primary lateral stabilizers of the hip. Weakness causes the 'Trendelenburg gait' equivalent — pelvis drops toward the non-stance limb during single-limb support. Post-FHO: gluteals must hypertrophy to compensate for absent femoral head, as they become the primary joint stabilizers. The pseudoarthrosis quality post-FHO is directly proportional to gluteal development. Hip dysplasia: bilateral gluteal weakness is universal — primary strength target. The sit-to-stand exercise (SIT_STAND) loads gluteals concentrically during the stand phase.",
    weakness_signs: [
      "Lateral pelvic sway/waddling gait — pelvis drops contralaterally during stance",
      "Difficulty rising from lateral recumbency",
      "Reduced hip extension visible on slow-motion gait analysis",
      "Muscle atrophy visible as flattening of dorsolateral pelvis",
      "Pain on palpation over greater trochanter area"
    ],
    phase_loading: {
      acute: "PROM of hip abduction and extension. Cold therapy if acute inflammation. No active loading within 72 hrs post-op.",
      subacute: "Weight shifting with treat target in lateral plane (FELINE_TREAT_SHIFT / WEIGHT_SHIFT). Sit-to-stand on level surface.",
      chronic: "Hill climbing, swimming (kick phase), lateral stepping (SIDE_STEP) specifically loads hip abductors. Theraband resistance around stifles for advanced abductor loading."
    },
    feline_notes: "Cats have proportionally stronger gluteals relative to body size than dogs — this is why post-FHO outcomes in cats are often excellent despite no femoral head. FELINE_WAND_AROM with lateral wand positioning specifically targets hip abductors in cats.",
    related_conditions: ["POST_FHO", "HIP_DYSPLASIA", "POST_THR", "HIP_OA", "FELINE_OA"],
    exercises_that_target: ["SIT_STAND", "SIDE_STEP", "HILL_CLIMB", "SWIM", "FIGURE_8", "DOWN_STAND", "FELINE_SIT_STAND", "FELINE_WOBBLE"],
    source: "Evans & de Lahunta 2013 pp.375-381; Millis & Levine 2014 Ch.17"
  },

  iliopsoas: {
    id: "iliopsoas",
    bilateral_ids: ["hip_flexor_l", "hip_flexor_r"],
    name: "Iliopsoas (Hip Flexor Complex)",
    clinical_name: "m. iliopsoas (m. iliacus + m. psoas major)",
    species: ["canine", "feline"],
    components: [
      "Iliacus — fan-shaped, fills iliac fossa medially",
      "Psoas major — long, runs alongside lumbar vertebrae to lesser trochanter"
    ],
    origin: "Iliacus: ventral surface of ilium (iliac fossa). Psoas major: transverse processes and vertebral bodies of lumbar vertebrae (L2-L7).",
    insertion: "Lesser trochanter of femur (both heads converge here via the iliopsoas tendon)",
    action: "Hip flexion (primary hip flexor). External rotation of hip. Psoas major also stabilizes lumbar spine against extension forces.",
    innervation: "Femoral nerve (L4, L5) and direct lumbar nerve branches (L2-L4) to psoas major",
    blood_supply: "Iliolumbar artery and branches of femoral artery",
    palpation: "NOT directly palpable from external surface. Assessed indirectly via rectal palpation (specialist) or via pain response on passive hip extension with internal rotation. The 'iliopsoas stretch test': patient in lateral recumbency, examiner extends hip while applying gentle internal rotation — pain at end range = positive.",
    rehab_relevance: "The most commonly STRAINED muscle in canine athletes and high-activity dogs. IVDD patients have concurrent iliopsoas spasm in 60-70% of cases due to referred pain from spinal pathology. Post-TPLO patients develop iliopsoas tightness from altered gait mechanics and compensatory hip flexion. The muscle passes over the iliopectineal eminence and lesser trochanter — both are palpable pain points. Iliopsoas strain is frequently missed as a concurrent diagnosis in CCL patients. Eccentrically loaded during descent (stairs, ramps) — this is why descending ramps is the therapeutic target (ILIO_ECCENTRIC).",
    clinical_significance_lumbosacral: "Psoas major attaches directly to lumbar vertebrae — spasm causes lumbar pain, lumbosacral compression, and altered gait that can mimic or worsen IVDD symptoms. Always assess iliopsoas in spinal patients.",
    weakness_signs: [
      "Shortened stride — reduced hip flexion causes foot not clearing ground",
      "Toe-dragging on affected limb",
      "Reluctance to jump or climb stairs (hip flexion required for step height)",
      "Kyphotic posture — shortened iliopsoas pulls lumbar spine into flexion"
    ],
    strain_signs: [
      "Pain on palpation of lesser trochanter (medial proximal thigh)",
      "Pain on passive hip extension + internal rotation",
      "Bunny-hopping or shortened stride at trot",
      "Reluctance to extend hip fully during walk",
      "Often unilateral in sporting dogs"
    ],
    phase_loading: {
      acute_strain: "Complete rest 48-72 hrs. Cold therapy. NO passive or active hip extension. NSAID therapy. Absolute exercise contraindication in first 5 days.",
      subacute_strain: "Gentle passive hip extension stretch (ILIO_STRETCH): 20-30 sec hold, pain-free only. Massage to lumbar paraspinals and caudal abdominal musculature. Heat before stretching in chronic phase.",
      chronic_strain: "Eccentric loading program — controlled ramp descent (ILIO_ECCENTRIC). Gradual return to activity. Recurrence is common — need full resolution before return to sport.",
      post_tplo_tightness: "Passive hip extension stretch twice daily from week 3 onward. Prevents permanent hip extension ROM loss that worsens long-term prognosis."
    },
    feline_notes: "Iliopsoas strain is underdiagnosed in cats. The lesser trochanter is accessible for palpation in lateral recumbency. Feline iliopsoas strain causes the classic 'hunched back' posture and reluctance to jump. FELINE_WAND_AROM with the wand positioned to encourage hip extension specifically stretches the iliopsoas.",
    related_conditions: ["ILIOPSOAS_STRAIN", "IVDD", "LUMBOSACRAL", "POST_TPLO", "POST_THR", "FELINE_OA_AXIAL"],
    exercises_that_target: ["ILIO_STRETCH", "SLOW_WALK", "BACKING_UP", "CAVALETTI", "HILL_CLIMB", "FELINE_WAND_AROM"],
    source: "Evans & de Lahunta 2013 pp.370-374; Millis & Levine 2014 Ch.17 & 28"
  },

  hip_adductors: {
    id: "hip_adductors",
    bilateral_ids: ["hip_adduct_l", "hip_adduct_r"],
    name: "Hip Adductor Group",
    clinical_name: "mm. adductores (gracilis, pectineus, adductor magnus et brevis)",
    species: ["canine", "feline"],
    components: [
      "Gracilis — medial thigh, broad flat muscle, biarticular (stifle flexion also)",
      "Pectineus — deep, medial proximal thigh, small but clinically significant in hip OA",
      "Adductor magnus et brevis — deep medial femur, primary adductors"
    ],
    origin: "Gracilis: pelvic symphysis. Pectineus: iliopubic eminence. Adductors: pubis and ischium.",
    insertion: "Gracilis: medial aspect of tibia (via crural fascia) and calcaneal tuber. Pectineus: medial femoral shaft. Adductors: medial femoral shaft.",
    action: "Hip adduction (all). Gracilis also flexes stifle and extends hock. Pectineus flexes hip.",
    innervation: "Obturator nerve (L4, L5, L6) — gracilis, pectineus, adductors. Saphenous nerve branch to gracilis.",
    blood_supply: "Medial circumflex femoral artery",
    palpation: "Medial thigh — inner surface. Pectineus is palpable as a distinct cord-like muscle at the medial proximal thigh in hip OA patients (often hypertrophied and painful).",
    rehab_relevance: "Adductors are the lateral stabilizers of the stifle during gait. Weakness causes medial stifle collapse (valgus) which increases CCL loading. In hip OA, the pectineus becomes hypertrophied and fibrotic — causing medial thigh pain and restricted hip abduction ROM. Pectineus tenotomy was historically performed in hip dysplasia — now replaced by multimodal management. Gracilis and semitendinosus contracture is a specific condition in dogs (and cats) causing progressive medial thigh band formation and gait abnormality.",
    gracilis_contracture_note: "Gracilis contracture: unique condition in medium-large breed dogs (German Shepherd predisposed) causing progressive fibrosis of the gracilis muscle into a fibrous cord. Presents as characteristic swinging or 'clunking' hindlimb gait. Manual palpation of medial thigh reveals palpable band. Surgical release is the definitive treatment but recurrence is common. Rehab: aggressive passive stretching and massage post-op.",
    weakness_signs: [
      "Medial stifle collapse during stance phase",
      "Reduced lateral stability on uneven terrain",
      "Waddling or wide-based hindlimb stance"
    ],
    phase_loading: {
      all_phases: "Lateral stepping (SIDE_STEP) is the primary adductor/abductor targeting exercise. Wobble board provides adductor and core co-contraction. Figure-8 patterns challenge adductors through direction changes."
    },
    feline_notes: "Adductor group is proportionally smaller in cats. Pectineus pain in feline OA patients is an underrecognized source of medial hip pain — assess by passive hip abduction with resistance. FELINE_THREE_LEG loads adductors of the standing limbs.",
    related_conditions: ["HIP_DYSPLASIA", "HIP_OA", "GRACILIS_CONTRACTURE", "POST_TPLO", "FELINE_OA"],
    exercises_that_target: ["SIDE_STEP", "WOBBLE_BOARD", "FIGURE_8", "FELINE_THREE_LEG", "FELINE_WOBBLE"],
    source: "Evans & de Lahunta 2013 pp.391-396; Millis & Levine 2014 Ch.17"
  },

  // ══════════════════════════════════════════════════════════════════════════
  // HINDLIMB — JOINTS
  // ══════════════════════════════════════════════════════════════════════════

  hip_joint: {
    id: "hip_joint",
    bilateral_ids: ["hip_l", "hip_r"],
    name: "Coxofemoral Joint (Hip)",
    clinical_name: "articulatio coxae",
    species: ["canine", "feline"],
    joint_type: "Ball-and-socket (spheroidal) — widest range of motion of any joint",
    articulating_surfaces: "Femoral head (caput ossis femoris) into acetabulum of pelvis",
    stabilizing_structures: [
      "Ligament of the femoral head (teres ligament) — crosses inside joint capsule",
      "Joint capsule — thick, reinforced by accessory ligaments",
      "Transverse acetabular ligament — bridges acetabular notch",
      "Acetabular labrum — fibrocartilaginous rim deepening socket",
      "Periarticular musculature — gluteals, iliopsoas, hamstrings as primary dynamic stabilizers"
    ],
    normal_rom: {
      flexion: "50-55 degrees (maximum stifle flexion with hip flexion)",
      extension: "162-165 degrees",
      abduction: "45-55 degrees",
      adduction: "25-30 degrees",
      internal_rotation: "35-40 degrees",
      external_rotation: "40-45 degrees"
    },
    goniometry_technique: "Patient in lateral recumbency. Goniometer axis over greater trochanter. Stationary arm along lateral body wall (iliac crest to greater trochanter). Moving arm along lateral femur (greater trochanter to lateral femoral condyle). Measure extension and flexion separately.",
    rehab_relevance: "Hip OA is the most common cause of chronic hindlimb pain in dogs >7 years. The joint responds to reduced loading via cartilage degeneration (use-it-or-lose-it). The aquatic environment (UWTM) allows cyclical joint motion with 60-80% reduced loading — ideal for maintaining cartilage nutrition. Every degree of hip extension ROM lost reduces the efficiency of propulsive musculature. Post-FHO: the 'hip' becomes a pseudoarthrosis — fibrous tissue fills the space. The quality of this pseudoarthrosis determines long-term function.",
    ortolani_sign_note: "Ortolani sign: positive in hip dysplasia — a palpable 'clunk' during passive hip abduction with the stifle flexed, indicating femoral head reduction after partial subluxation. Perform ONLY in anesthetized or heavily sedated patients.",
    subluxation_assessment: "Barden test and Ortolani test require sedation. Clinical gait assessment is primary. Pain on hip extension + internal rotation = positive hip extension test (highly sensitive for hip OA and dysplasia).",
    post_fho_specific: "Post-FHO rehabilitation is uniquely progressive — the goal is pseudoarthrosis formation through controlled loading. Too much loading too early causes excessive fibrous proliferation. Too little causes muscle atrophy and poor pseudoarthrosis quality. Progressive weight bearing from week 1 (hydrotherapy) to full ground exercise by week 8-12 optimizes outcomes.",
    feline_notes: "Feline hip OA predominantly affects the hip and elbow. Cats rarely limp from hip OA — behavioral signs dominate (reduced jumping, reluctance to use stairs). The Feline Orthopedic Survey (part of FMPI) specifically tracks jump height. Hip extension ROM measurement is the key physical exam finding — compare bilaterally and to feline normals (Jaeger et al. 2007: extension 156-163 degrees, flexion 33-38 degrees).",
    normal_rom_feline: "Extension: 156-163 degrees. Flexion: 33-38 degrees. Source: Jaeger GH et al., Am J Vet Res 2007;68:822-826.",
    related_conditions: ["HIP_DYSPLASIA", "POST_FHO", "POST_THR", "HIP_OA", "FELINE_OA", "LUMBOSACRAL"],
    exercises_that_target: ["PROM_HIP", "SIT_STAND", "HILL_CLIMB", "UWT_WALK", "SWIM", "FELINE_PROM"],
    source: "Evans & de Lahunta 2013 pp.140-145; Jaeger 2007 Am J Vet Res"
  },

  stifle_joint: {
    id: "stifle_joint",
    bilateral_ids: ["stifle_l", "stifle_r"],
    name: "Stifle Joint (Knee)",
    clinical_name: "articulatio genus",
    species: ["canine", "feline"],
    joint_type: "Compound synovial joint — femorotibial + femoropatellar + proximal tibiofibular",
    articulating_surfaces: "Femoral condyles on tibial plateau (medial and lateral); patella in femoral trochlea",
    stabilizing_structures: [
      "Cranial cruciate ligament (CCL) — resists cranial tibial thrust and internal rotation",
      "Caudal cruciate ligament (CaCL) — resists caudal tibial displacement",
      "Medial collateral ligament — resists valgus stress",
      "Lateral collateral ligament — resists varus stress",
      "Medial meniscus — shock absorption, congruency (often damaged with CCL rupture)",
      "Lateral meniscus — shock absorption",
      "Joint capsule — thick medially",
      "Patellar ligament — connects patella to tibial tuberosity (distal quad tendon)"
    ],
    normal_rom: {
      extension: "155-165 degrees",
      flexion: "35-45 degrees"
    },
    goniometry_technique: "Patient in lateral recumbency. Axis over lateral femoral condyle (lateral fabella is the landmark). Stationary arm along femoral shaft (greater trochanter to lateral condyle). Moving arm along fibula/tibia (lateral condyle to lateral malleolus). Measure at end of active and passive range.",
    tibial_plateau_angle_tpa: "TPA is the angle between the tibial plateau and a line perpendicular to the tibial mechanical axis. Normal dog: 18-24 degrees. TPLO reduces TPA to 5-6.5 degrees, eliminating cranial tibial thrust. The new geometry changes the mechanical environment for quad loading — clinicians must understand this when prescribing exercises.",
    rehab_relevance: "Most-injured joint in veterinary medicine. CCL rupture accounts for >90% of stifle surgeries. Arthrogenic muscle inhibition (AMI) from stifle pain/swelling inhibits quad recruitment — this is the mechanism behind early NMES use. Joint effusion visible and palpable as 'bulging' medial to the patellar ligament. Every 1mm of effusion reduces quad activation by a measurable amount. PROM is critical from day 1 to prevent capsular fibrosis (joint contracture).",
    meniscal_injury_note: "The medial meniscus is the 'shock absorber' between femur and tibia. Damaged in 40-60% of CCL ruptures. 'Meniscal click' on physical exam (audible click during stifle ROM) = meniscal tear. A late meniscal tear (after CCL repair) causes sudden return of lameness — a clinical red flag requiring immediate veterinary assessment.",
    post_tplo_critical_milestones: [
      "Week 2: stance on surgical limb",
      "Week 4: consistent weight bearing",
      "Week 6: radiographic callus on follow-up films",
      "Week 8: full weight bearing",
      "Week 12: symmetric gait, return to controlled activity",
      "Week 16: return to full activity/sport"
    ],
    feline_notes: "Feline stifle has identical anatomy to canine but CCL rupture is far less common (cat TPA averages lower than dog). Feline stifle PROM: extension 140-148 degrees, flexion 22-28 degrees (Jaeger 2007). Joint effusion less obvious in cats due to smaller joint volume. Patellar luxation in cats is rarer than dogs but occurs. Meniscal pathology in cats with OA: underrecognized as cats rarely display the acute-on-chronic lameness pattern.",
    normal_rom_feline: "Extension: 140-148 degrees. Flexion: 22-28 degrees. Source: Jaeger 2007.",
    related_conditions: ["POST_TPLO", "TTA", "CCL_CONSERV", "STIFLE_OA", "LUXATING_PATELLA", "FELINE_OA"],
    exercises_that_target: ["PROM_STIFLE", "SIT_STAND", "UWT_WALK", "CAVALETTI", "STAIR_CLIMB", "NMES_QUAD", "FELINE_PROM", "FELINE_CAVALETTI"],
    source: "Evans & de Lahunta 2013 pp.145-155; Millis & Levine 2014 Ch.14 & 15"
  },

  ccl: {
    id: "ccl",
    bilateral_ids: ["ccl"],
    name: "Cranial Cruciate Ligament",
    clinical_name: "ligamentum cruciatum craniale",
    species: ["canine", "feline"],
    structure: "Intracapsular, extrasynovial ligament. Two distinct bands: craniomedial band (taut in all stifle positions) and caudolateral band (taut in extension only). Composed of type I collagen organized in parallel fascicles.",
    origin: "Lateral femoral condyle (caudal aspect)",
    insertion: "Cranial intercondylar area of tibia (tibial spine)",
    action: "Resists cranial tibial thrust (cranial translation of tibia relative to femur). Resists internal tibial rotation. Limits hyperextension.",
    blood_supply: "Middle genicular artery — poor vascularity, explains slow healing and inability to repair rather than replace.",
    innervation: "Mechanoreceptors (Ruffini, Pacinian, Golgi tendon organ-like) — proprioceptive role. Loss of these receptors post-rupture reduces proprioceptive feedback, contributing to joint instability.",
    rupture_mechanism_dog: "NOT a single traumatic event in most cases. Progressive degeneration from collagen fatigue, immune-mediated disease, tibial plateau angle factors, and conformational issues. 'Partial CCL rupture' is a distinct early stage — dogs present with intermittent lameness, positive drawer at full range but not partial.",
    tibial_plateau_angle_relationship: "Higher TPA = greater cranial tibial thrust force = greater CCL loading. Breeds with steep TPA (Rottweiler, Labrador, Newfoundland) have higher CCL rupture rates. This is the biological basis for TPLO — reducing TPA eliminates the force the CCL was resisting.",
    bilateral_rupture_rate: "40-60% of dogs rupture the contralateral CCL within 1-2 years. B.E.A.U. should flag this — protect the contralateral stifle throughout rehabilitation by monitoring for contralateral limb overloading.",
    post_surgical_healing: "After TPLO/TTA, the original CCL remnant remains but is non-functional. The joint relies on the altered biomechanics (TPLO) or new tibial geometry (TTA) for stability. The scar tissue that forms in the joint capsule provides some additional stability over 3-6 months.",
    clinical_tests: [
      "Cranial drawer test — gold standard. Performed at full extension and 20-30 degrees flexion. Positive = cranial tibial translation relative to femur.",
      "Tibial compression test (cranial tibial thrust test) — simulates weight bearing. Positive = cranial tibial movement visible during stifle flexion with hock extended.",
      "Stifle effusion test — ballottement of medial joint capsule craniomedial to patellar ligament."
    ],
    feline_notes: "CCL rupture in cats is significantly less common than dogs — lower body weight and lower TPA. When it occurs, it is more often acute traumatic than degenerative. Post-TPLO outcomes in cats are excellent. Most feline stifle instability workup follows the same protocol as canine. Cats rarely show the classic cranial drawer with acute rupture due to muscle guarding — may require anesthesia for definitive assessment.",
    related_conditions: ["POST_TPLO", "TTA", "CCL_CONSERV", "LATERAL_SUTURE", "STIFLE_OA"],
    exercises_that_target: ["PROM_STIFLE", "UWT_WALK", "SIT_STAND", "SLOW_WALK"],
    source: "Evans & de Lahunta 2013 pp.150-154; Arnoczky SP 1977 JAVMA; Millis & Levine 2014 Ch.14"
  },

  gastrocnemius: {
    id: "gastrocnemius",
    bilateral_ids: ["calf_l", "calf_r"],
    name: "Gastrocnemius",
    clinical_name: "m. gastrocnemius",
    species: ["canine", "feline"],
    components: [
      "Lateral head — origin lateral femoral fabella (sesamoid in lateral head of origin)",
      "Medial head — origin medial femoral fabella"
    ],
    origin: "Lateral and medial fabellae (sesamoid bones in lateral and medial heads of gastrocnemius) on the caudal femur, just proximal to femoral condyles",
    insertion: "Calcaneal tuber via the common calcaneal tendon (Achilles tendon equivalent). Also contains contributions from semitendinosus (gracilis minor), superficial digital flexor, and biceps femoris.",
    action: "Hock extension (plantar flexion). Stifle flexion (biarticular — crosses both stifle and hock). Critical for push-off propulsion during gait.",
    innervation: "Tibial nerve (L6, L7, S1)",
    blood_supply: "Caudal tibial artery",
    palpation: "Caudal crus (lower leg) — easily palpable as the most prominent caudal muscle of the lower hindlimb. The Achilles tendon is palpable distally.",
    achilles_complex: "The common calcaneal tendon (Achilles equivalent) in dogs has 5 components: gastrocnemius, superficial digital flexor, gracilis, semitendinosus, biceps femoris. Rupture of ANY component causes plantigrade stance. Complete rupture = emergency surgical repair.",
    plantigrade_stance_diagnosis: "A plantigrade (dropped hock) stance indicates Achilles tendon pathology. In cats, plantigrade stance is also the hallmark of diabetic peripheral neuropathy (NOT an Achilles issue — peripheral nerve). CRITICAL differential for B.E.A.U.: feline plantigrade = assess for diabetes before assuming musculoskeletal.",
    rehab_relevance: "Gastrocnemius is loaded eccentrically during descent (stairs, ramps, hills). Eccentric loading of the calf complex builds tendon resilience. Post-Achilles repair: strictly protected rehabilitation — too much load too early causes re-rupture. The gastrocnemius is also involved in TPLO — the lateral fabella (origin of lateral gastrocnemius head) can be inadvertently damaged during surgical approach.",
    feline_plantigrade_note: "Feline diabetic neuropathy: peripheral nerve dysfunction causing symmetric plantigrade stance and hindlimb weakness. Distinguishing features from Achilles pathology: bilateral symmetry, concurrent systemic signs (PU/PD, weight loss), glucose >250 mg/dL. Rehab role: maintain muscle mass during glycemic control. Once euglycemic, neuropathy is often reversible. Exercises: FELINE_PROM, FELINE_STAND_ROLL, gentle weight bearing.",
    related_conditions: ["ACHILLES_RUPTURE", "POST_TPLO", "LUMBOSACRAL", "FELINE_DIABETIC_NEUROPATHY"],
    exercises_that_target: ["HILL_CLIMB", "STAIR_CLIMB", "BACKWARD_HILL", "CAVALETTI", "UWT_WALK", "FELINE_STAIR_WAND"],
    source: "Evans & de Lahunta 2013 pp.397-402; Millis & Levine 2014 Ch.17"
  },

  hock_joint: {
    id: "hock_joint",
    bilateral_ids: ["hock_l", "hock_r"],
    name: "Tarsocrural Joint (Hock)",
    clinical_name: "articulatio tarsocruralis",
    species: ["canine", "feline"],
    joint_type: "Compound synovial joint — tarsocrural (tibiotarsal), intertarsal, tarsometatarsal joints",
    normal_rom: {
      extension: "160-165 degrees (dog); 165-168 degrees (cat)",
      flexion: "35-40 degrees (dog); 22-28 degrees (cat)"
    },
    rehab_relevance: "Hock flexibility is essential for cavaletti work, stair climbing, and sit-to-stand. Reduced hock extension ROM (plantar flexor tightness) limits stride and push-off. Hock swelling post-trauma is easily monitored. FATE survival patients develop ischemic injury to hock musculature — hock PROM is day-1 priority in FATE recovery.",
    feline_hock_fate: "Post-FATE: hocks are often cold, edematous, and painful. Skin sloughing of the paw pads can occur. Passive ROM of hock and digits beginning at day 2-3 prevents permanent contracture. The hock circulation is the last to return — monitor for reperfusion injury.",
    related_conditions: ["POST_TPLO", "ACHILLES_RUPTURE", "FELINE_FATE_RECOVERY", "FELINE_OA"],
    exercises_that_target: ["CAVALETTI", "PROM_STIFLE", "UWT_WALK", "STAIR_CLIMB", "FELINE_PROM", "FELINE_CAVALETTI"],
    source: "Evans & de Lahunta 2013 pp.158-163; Jaeger 2007 Am J Vet Res"
  },

  // ══════════════════════════════════════════════════════════════════════════
  // FORELIMB
  // ══════════════════════════════════════════════════════════════════════════

  shoulder_joint: {
    id: "shoulder_joint",
    bilateral_ids: ["shoulder_l", "shoulder_r"],
    name: "Glenohumeral Joint (Shoulder)",
    clinical_name: "articulatio humeri",
    species: ["canine", "feline"],
    joint_type: "Ball-and-socket — most mobile joint in the forelimb",
    articulating_surfaces: "Humeral head (caput humeri) into glenoid fossa of scapula",
    unique_anatomy: "Unlike the hindlimb, the scapula has NO bony attachment to the axial skeleton — attached purely by musculature (serratus ventralis, trapezius, omotransversarius, rhomboids). This 'floating scapula' absorbs forelimb impact forces. If these muscles weaken, biomechanical efficiency collapses.",
    forelimb_weight_bearing: "Thoracic limbs bear 60% of body weight in static stance. The shoulder complex is the primary shock absorber for the forelimb, landing forces, and decelerating forces.",
    stabilizing_muscles: [
      "Supraspinatus — cranial rotator cuff equivalent, stabilizes cranially",
      "Infraspinatus — primary external rotator, stabilizes laterally",
      "Subscapularis — medial stabilizer, resists lateral luxation",
      "Biceps brachii tendon — cranial stability via bicipital groove",
      "Deltoideus — abductor, flexor"
    ],
    normal_rom: {
      extension: "165-170 degrees",
      flexion: "30-35 degrees",
      abduction: "30-35 degrees",
      adduction: "20-25 degrees"
    },
    rehab_relevance: "Shoulder OCD (osteochondrosis dissecans) affects the caudal humeral head in young large breeds — flap of cartilage causes effusion and pain on shoulder flexion. Medial shoulder instability (MSI) is increasingly recognized — pathological laxity of the medial glenohumeral ligament causing forelimb lameness in sporting dogs. Supraspinatus tendinopathy presents with pain on direct palpation over greater tubercle. Bicipital tenosynovitis: pain on shoulder flexion with elbow extension (bicipital stretch test positive).",
    post_ocd_rehab: "Post-OCD surgery: strict rest 4-6 weeks, then progressive active ROM. The concern is cartilage healing — impact loading is delayed until flap is fully healed (8-12 weeks).",
    feline_notes: "Cats bear relatively more weight on forelimbs during landing from jumps. Shoulder OCD is rare in cats. Forelimb lameness in cats more commonly reflects HCM complications (brachial arterial thromboembolism) or vaccine-associated fibrosarcoma in the scapular region — critical differentials for B.E.A.U. to flag.",
    related_conditions: ["OCD_SHOULDER", "BICEPS_TENOSYNOVITIS", "MEDIAL_SHOULDER_INSTAB", "FELINE_NEURO_CAT"],
    exercises_that_target: ["WHEELBARROW", "THREE_LEG_STAND", "FRONT_STEP_UPS", "SLOW_WALK", "FOAM_PAD", "FELINE_WAND_AROM", "FELINE_THREE_LEG"],
    source: "Evans & de Lahunta 2013 pp.165-172; Millis & Levine 2014 Ch.16"
  },

  elbow_joint: {
    id: "elbow_joint",
    bilateral_ids: ["elbow_l", "elbow_r"],
    name: "Elbow Joint (Cubital)",
    clinical_name: "articulatio cubiti",
    species: ["canine", "feline"],
    joint_type: "Compound hinge joint — humeroulnar, humeroradial, proximal radioulnar",
    normal_rom: {
      extension: "165-170 degrees",
      flexion: "20-25 degrees"
    },
    rehab_relevance: "Elbow dysplasia (fragmented coronoid process, OCD of medial humeral condyle, UAP) is the most common forelimb OA condition in young medium-large breed dogs. The 'elbow OA cascade': early FCP/OCD → joint incongruity → progressive OA → end-stage elbow OA in middle age. Elbow OA is often bilateral. Range of motion loss is the primary clinical marker — reduced flexion ROM strongly correlates with OA severity. Cavaletti rails and stepping exercises specifically challenge elbow ROM.",
    feline_notes: "Elbow OA is one of the most common sites of feline OA (along with hip and spine). Hardie 2002 showed elbow among top OA joints in geriatric cats. Feline elbow ROM: extension 148-162 degrees, flexion 20-24 degrees (Jaeger 2007). Reduced elbow extension in cats causes a characteristic shortened forelimb stride — clinically subtle but FMPI-measurable via 'difficulty with play activities.'",
    normal_rom_feline: "Extension: 148-162 degrees. Flexion: 20-24 degrees. Source: Jaeger 2007.",
    related_conditions: ["ELBOW_DYSPLASIA", "FCP", "UAP", "OCD_ELBOW", "FELINE_OA"],
    exercises_that_target: ["PROM_ELBOW", "CAVALETTI", "WHEELBARROW", "SLOW_WALK", "FELINE_PROM", "FELINE_CAVALETTI"],
    source: "Evans & de Lahunta 2013 pp.172-180; Millis & Levine 2014 Ch.16"
  },

  triceps: {
    id: "triceps",
    bilateral_ids: ["tricep_l", "tricep_r"],
    name: "Triceps Brachii",
    clinical_name: "m. triceps brachii",
    species: ["canine", "feline"],
    components: [
      "Long head — largest, biarticular (shoulder extension + elbow extension)",
      "Lateral head — elbow extension only",
      "Medial head — elbow extension only",
      "Accessory head (in dog) — medial to long head"
    ],
    origin: "Long head: caudal glenoid (infraglenoid tubercle). Other heads: caudal humeral shaft.",
    insertion: "Olecranon process of ulna",
    action: "Elbow extension (primary). Long head also extends shoulder. Critical for weight bearing — prevents elbow collapse under body weight.",
    innervation: "Radial nerve (C7, C8, T1)",
    blood_supply: "Deep brachial artery",
    rehab_relevance: "Triceps is the primary weight-bearing muscle of the forelimb — prevents elbow buckling during stance. Triceps atrophy causes a 'dropped elbow' posture. Post-OCD shoulder surgery: protect triceps activation during early healing. Wheelbarrow exercise (WHEELBARROW) is the primary triceps strengthening exercise in rehabilitation.",
    radial_nerve_injury: "Radial nerve injury causes complete elbow and carpal extension failure — the dog cannot extend the elbow and knuckles the carpus (walks on dorsum of paw). A common result of humeral fractures and shoulder trauma. B.E.A.U. should flag: any forelimb with knuckling requires immediate neurological assessment.",
    related_conditions: ["OCD_SHOULDER", "BICEPS_TENOSYNOVITIS", "HUMERAL_FRACTURE", "FELINE_NEURO_CAT"],
    exercises_that_target: ["WHEELBARROW", "THREE_LEG_STAND", "FRONT_STEP_UPS", "FOAM_PAD", "FELINE_WAND_AROM"],
    source: "Evans & de Lahunta 2013 pp.340-345"
  },

  // ══════════════════════════════════════════════════════════════════════════
  // AXIAL SKELETON — SPINE & CORE
  // ══════════════════════════════════════════════════════════════════════════

  spine: {
    id: "spine",
    bilateral_ids: ["spine"],
    name: "Vertebral Column",
    clinical_name: "columna vertebralis",
    species: ["canine", "feline"],
    vertebral_formula: {
      dog: "C7, T13, L7, S3, Ca6-23",
      cat: "C7, T13, L7, S3, Ca18-23 (cats typically have more caudal vertebrae)"
    },
    intervertebral_discs: "Present C2-3 through L7-S1. Each disc has nucleus pulposus (gelatinous center) and annulus fibrosus (concentric fibrous rings). Chondroid degeneration (Hansen Type I) causes mineralization and extrusion. Fibroid degeneration (Hansen Type II) causes bulging protrusion.",
    critical_spinal_regions: {
      cervical: "C1-C7. Largest vertebral canal — tolerates more disc material. Cervical IVDD causes neck pain and forelimb signs. 'Root signature' = unilateral forelimb lameness from nerve root compression.",
      thoracolumbar: "T3-L3. MOST COMMON IVDD location in chondrodystrophic breeds (T12-T13, T13-L1 peak). Causes paraparesis/paraplegia. The 'deep pain' test (pinching digit) is the single most important prognostic test — preserved = good prognosis, absent = grave.",
      lumbosacral: "L7-S1. Cauda equina syndrome — compression of nerve roots to bladder and hindlimbs. Characteristic: tail base pain, urinary/fecal incontinence, hindlimb weakness, pain on lumbosacral extension.",
      cervical_myelopathy: "C2-C6 stenosis in large breeds (Wobbler syndrome/CSM). Causes progressive tetraparesis. Unique rehab: forelimb function often better than hindlimb."
    },
    deep_pain_perception: "The most critical neurological test in spinal patients. Conscious perception of noxious stimulus (not just withdrawal reflex) indicates intact spinothalamic tract. Absent deep pain = Frankel Grade I — surgical emergency. Return of deep pain = first sign of recovery. B.E.A.U. must flag: absent deep pain in any spinal patient = IMMEDIATE veterinary referral.",
    frankel_grading: {
      5: "Normal — no neurological deficits",
      4: "Ambulatory with mild ataxia/paresis",
      3: "Non-ambulatory but voluntary movement present",
      2: "Paralyzed, deep pain present",
      1: "Paralyzed, deep pain absent — emergency"
    },
    rehab_principles_spinal: "Spinal patients require neurological rehabilitation: spinal cord plasticity (central pattern generators) can be exploited through repetitive stepping movements even in incomplete injuries. Standing in physio-roll activates spinal motor programs. Underwater treadmill provides stepping movement with reduced fall risk. Acupuncture and NMES augment motor recovery. Bladder management (manual expression or clean catheterization) is a co-management requirement.",
    feline_specific_spinal: "Feline IVDD: 59% lumbar (L3-L7 dominant). 85% positive outcome. Unlike dogs, most feline IVDD has gradual onset (70% insidious). Deep pain preserved in 87% at presentation. Spinal lymphosarcoma is the most important differential in young cats with spinal signs — B.E.A.U. must flag: young cat (<4 years) + spinal signs = rule out lymphosarcoma BEFORE assuming IVDD.",
    dm_note: "Degenerative Myelopathy (DM): progressive upper motor neuron disease in older dogs (German Shepherd most common). Painless — distinguish from IVDD by absence of spinal pain. No treatment — rehabilitation maximizes functional life. DM exercise principle: push as hard as tolerated for as long as tolerated. UWT, assisted walking, cart conditioning.",
    related_conditions: ["IVDD", "FCE", "DEGENERATIVE_MYELOPATHY", "LUMBOSACRAL", "WOBBLER", "SPINAL_FRACTURE", "FELINE_IVDD_CAT"],
    exercises_that_target: ["PROM_STIFLE", "UWT_WALK", "MASSAGE_THERA", "CAVALETTI", "BACKING_UP", "WOBBLE_BOARD", "FELINE_STAND_ROLL", "FELINE_WOBBLE"],
    source: "Evans & de Lahunta 2013 pp.55-85; Olby N — Vet Clin North Am 2005; Drum et al. 2015"
  },

  paraspinals: {
    id: "paraspinals",
    bilateral_ids: ["paraspinal_l", "paraspinal_r"],
    name: "Epaxial (Paraspinal) Musculature",
    clinical_name: "mm. epaxiales (longissimus, iliocostalis, multifidus, spinalis)",
    species: ["canine", "feline"],
    components: [
      "Longissimus — largest epaxial muscle, runs full length of spine, multi-segmental",
      "Iliocostalis — lateral column, rib and transverse process attachment",
      "Multifidus — deep, short rotators between individual vertebrae — primary segmental stabilizer",
      "Spinalis — most medial, spinous process to spinous process"
    ],
    origin: "Iliac crest, sacrum, transverse processes and spinous processes of vertebrae throughout",
    insertion: "Spinous processes, transverse processes, and ribs of more cranial vertebrae",
    action: "Bilateral contraction: spinal extension, resist flexion loading. Unilateral: ipsilateral lateral bending. Multifidus: intersegmental stability — the 'deep stabilizer' equivalent of human transversus abdominis.",
    innervation: "Dorsal branches of spinal nerves at each segment — segmental innervation",
    blood_supply: "Segmental branches of aorta — dorsal branches",
    palpation: "Bilateral, flanking the spinous processes throughout the entire spine. Muscle guarding (hypertonicity) in paraspinal muscles = indicator of spinal pain. Asymmetric tension = possible lateral disc herniation. Rolling-skin test (superficial): pinch skin along spine — hypersensitivity = radiculopathy at that level.",
    rehab_relevance: "Paraspinal atrophy is universal in IVDD patients and DM patients. The multifidus in particular undergoes rapid atrophy adjacent to a disc herniation. Core stabilization exercises (CORE_STAB) reactivate multifidus. Spinal manipulation (chiropractic/manual therapy) targets intersegmental mobility — B.E.A.U. recommends only when specifically prescribed by a DACVSMR or CVSMT-certified practitioner. Massage (MASSAGE_THERA) of paraspinals reduces guarding and enables better ROM for subsequent exercises.",
    massage_technique_paraspinals: "Paravertebral massage technique: thumbs bilateral to spinous processes, progressive kneading from lumbosacral to cervicothoracic junction. Light effleurage first (2-3 min), then deeper petrissage as relaxation occurs. Feline: fingertip kneading only — never full palm pressure.",
    feline_paraspinal_note: "Feline paraspinal muscles are proportionally thicker relative to spine size than in dogs. OA of the axial skeleton causes marked paraspinal spasm in cats — this is often the primary reason for grooming difficulty (reduced lumbar flexibility prevents the cat from reaching its caudal body). FELINE_MASSAGE directly targets paraspinals. PBMT to lumbar paraspinals is one of the most effective initial treatments for feline axial OA.",
    core_muscle_note: "True 'core' rehabilitation in dogs involves both epaxial (back extensors) and hypaxial muscles (abdominal wall). Sit-pretty exercise (SIT_PRETTY) activates hypaxial muscles maximally. Balance board and wobble cushion exercises co-activate the entire core.",
    related_conditions: ["IVDD", "LUMBOSACRAL", "DEGENERATIVE_MYELOPATHY", "MUSCLE_STRAIN", "ILIOPSOAS_STRAIN", "FELINE_IVDD_CAT", "FELINE_OA_AXIAL"],
    exercises_that_target: ["MASSAGE_THERA", "WOBBLE_BOARD", "CORE_STAB", "WHEELBARROW", "SIT_PRETTY", "CAVALETTI", "FELINE_MASSAGE", "FELINE_WOBBLE", "FELINE_STAND_ROLL"],
    source: "Evans & de Lahunta 2013 pp.277-290; Millis & Levine 2014 Ch.9"
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SPECIAL CLINICAL STRUCTURES
  // ══════════════════════════════════════════════════════════════════════════

  infraspinatus: {
    id: "infraspinatus",
    bilateral_ids: ["shoulder_l", "shoulder_r"],
    name: "Infraspinatus",
    clinical_name: "m. infraspinatus",
    species: ["canine"],
    origin: "Infraspinous fossa of scapula",
    insertion: "Greater tubercle of humerus",
    action: "External rotation of humerus. Abduction. Lateral stabilizer of glenohumeral joint.",
    innervation: "Suprascapular nerve (C6, C7)",
    rehab_relevance: "INFRASPINATUS CONTRACTURE: A well-defined clinical syndrome in active/working dogs. Trauma or repeated strain causes fibrosis and contracture of the infraspinatus, resulting in the pathognomonic 'circumduction gait' — the affected forelimb swings outward in a clockwise arc during protraction. On examination: firm, fibrotic consistency of the infraspinatus on palpation, reduced internal rotation of the shoulder. Surgical tenotomy followed by aggressive physiotherapy (passive ROM, stretching) is the treatment of choice. Post-surgical rehab: passive internal rotation stretching begins day 1.",
    infraspinatus_contracture_gait: "Pathognomonic gait: external rotation of the humerus with elbow abducted, paw swinging outward laterally during swing phase. Easy to identify on visual gait assessment.",
    source: "Evans & de Lahunta 2013 pp.335-338; Millis & Levine 2014 Ch.28"
  },

  tensor_fasciae_latae: {
    id: "tensor_fasciae_latae",
    bilateral_ids: ["hip_flexor_l", "hip_flexor_r"],
    name: "Tensor Fasciae Latae (TFL)",
    clinical_name: "m. tensor fasciae latae",
    species: ["canine", "feline"],
    origin: "Tuber coxae (point of hip)",
    insertion: "Fascia lata (lateral thigh fascia) — indirect insertion to tibial crest via iliotibial band",
    action: "Hip flexion. Stifle extension (via fascia lata). Lateral patellar stabilizer — important in patellar luxation assessment.",
    innervation: "Cranial gluteal nerve",
    rehab_relevance: "The TFL forms the iliotibial band equivalent — tightness causes lateral patellar tracking issues and hip flexion restriction. Important in patellar luxation rehabilitation. Can become hypertrophied as a compensatory hip flexor when iliopsoas is injured.",
    related_conditions: ["LUXATING_PATELLA", "HIP_DYSPLASIA", "ILIOPSOAS_STRAIN"],
    source: "Evans & de Lahunta 2013 pp.374-376"
  },

  // ══════════════════════════════════════════════════════════════════════════
  // FELINE-SPECIFIC STRUCTURES
  // ══════════════════════════════════════════════════════════════════════════

  feline_diabetic_neuropathy_note: {
    id: "feline_diabetic_neuropathy",
    name: "Feline Diabetic Peripheral Neuropathy",
    species: ["feline"],
    pathology: "Peripheral nerve demyelination secondary to chronic hyperglycemia. Affects distal hindlimbs preferentially. Results in symmetric plantigrade stance (dropped hock posture).",
    distinguishing_from_achilles: "BILATERAL symmetric, concurrent systemic signs (polyuria/polydipsia, weight loss), blood glucose >250 mg/dL. Achilles rupture is typically UNILATERAL and traumatic.",
    distinguishing_from_ivdd: "Plantigrade (dropped hock) without spinal pain. IVDD causes weakness but not specific plantigrade stance unless lumbosacral.",
    rehab_role: "Glycemic control is primary treatment. Rehab maintains muscle mass and prevents contracture during recovery period. Once euglycemic, neuropathy often reverses over weeks to months. Exercises: FELINE_PROM, FELINE_STAND_ROLL, FELINE_TREAT_SHIFT at low demand.",
    prognosis: "Good with diabetic remission. Poor if uncontrolled. Neuropathy improvement lags behind glycemic control by 2-4 weeks.",
    source: "Mizisin AP et al., JAVMA 2002; Drum et al. 2015"
  },

  feline_hcm_cardiac_note: {
    id: "feline_hcm_cardiac",
    name: "Feline HCM — Cardiac Anatomy Clinical Note",
    species: ["feline"],
    anatomy: "Left ventricular hypertrophy — myocardium thickens, reducing chamber volume and impairing diastolic relaxation. Left atrial enlargement follows increased filling pressure. LA enlargement creates blood stasis and clot formation risk.",
    la_size_significance: "Left atrial to aortic ratio (LA:Ao ratio): normal <1.5. >1.6 = significant enlargement. >2.0 = high thromboembolic risk — clopidogrel indicated. Echocardiography is required to stage HCM before any exercise prescription.",
    exercise_physiology_hcm: "In HCM, cardiac output cannot increase adequately with exercise demand (diastolic dysfunction). Even mild exertion can cause pulmonary edema in Stage B2/C cats. Stress itself triggers catecholamine release that worsens LVOTO (left ventricular outflow obstruction) in obstructive HCM.",
    rehab_contraindications: "ABSOLUTE: UWTM (water immersion increases preload), high-intensity exercise (Stage C/D), thoracic heat application. RELATIVE: any exercise in Stage B2 without cardiology clearance.",
    monitoring_during_rehab: "Signs of decompensation during rehabilitation: open-mouth breathing, labored breathing at rest, increased respiratory rate, orthopnea (propped up posture). ANY of these = stop exercise immediately and alert attending veterinarian.",
    source: "Fuentes VL et al., ACVIM Consensus 2020; Kittleson MD, Merck Vet Manual 2023"
  }
};

// ============================================================================
// LOOKUP FUNCTIONS
// ============================================================================

/**
 * Get full atlas entry for a muscle/structure by its 3D viewer ID
 */
function getAtlasEntry(muscleId) {
  for (const entry of Object.values(MUSCLE_ATLAS)) {
    if (entry.id === muscleId) return entry;
    if (Array.isArray(entry.bilateral_ids) && entry.bilateral_ids.some(id => id === muscleId)) return entry;
  }
  return null;
}

/**
 * Get all structures targeted by a given exercise code
 */
function getStructuresForExercise(exerciseCode) {
  const code = (exerciseCode || '').toUpperCase().replace(/[- ]/g, '_');
  const results = [];
  for (const entry of Object.values(MUSCLE_ATLAS)) {
    if (Array.isArray(entry.exercises_that_target) && entry.exercises_that_target.includes(code)) {
      results.push(entry);
    }
  }
  return results;
}

/**
 * Get all structures involved in a given condition/diagnosis
 */
function getStructuresForCondition(condition) {
  const results = [];
  for (const entry of Object.values(MUSCLE_ATLAS)) {
    if (Array.isArray(entry.related_conditions) && entry.related_conditions.includes(condition)) {
      results.push(entry);
    }
  }
  return results;
}

/**
 * Build a BEAU-ready clinical explanation for an exercise + diagnosis combination
 * This is what goes into the system prompt when a patient has a specific exercise selected
 */
function buildExerciseAnatomyContext(exerciseCode, diagnosis) {
  const structures = getStructuresForExercise(exerciseCode);
  const diagStructures = diagnosis ? getStructuresForCondition(diagnosis) : [];

  if (structures.length === 0 && diagStructures.length === 0) return '';

  let ctx = `\n\n=== ANATOMY INTELLIGENCE: ${exerciseCode} ===\n`;

  if (structures.length > 0) {
    ctx += `\nStructures targeted by ${exerciseCode}:\n`;
    structures.forEach(s => {
      ctx += `\n• ${s.name} (${s.clinical_name})\n`;
      ctx += `  Action: ${s.action}\n`;
      ctx += `  Innervation: ${s.innervation}\n`;
      if (s.rehab_relevance) ctx += `  Rehab relevance: ${s.rehab_relevance.slice(0, 300)}...\n`;
    });
  }

  if (diagnosis && diagStructures.length > 0) {
    ctx += `\nStructures affected by ${diagnosis}:\n`;
    diagStructures.slice(0, 3).forEach(s => {
      ctx += `• ${s.name}: ${s.post_op_significance || s.rehab_relevance || ''}\n`.slice(0, 250) + '\n';
    });
  }

  ctx += `=== END ANATOMY INTELLIGENCE ===`;
  return ctx;
}

/**
 * Generate Block 14 content for server.js system prompt
 * Injects the full atlas summary into B.E.A.U.'s brain
 */
function generateBlock14SystemPromptContent() {
  const lines = [
    '\n=== BLOCK 14: CLINICAL MUSCLE ATLAS — ANATOMY INTELLIGENCE LAYER ===',
    'B.E.A.U. has full origin/insertion/action/innervation/rehab-relevance knowledge for every',
    'musculoskeletal structure in the exercise database. Use this to explain WHY exercises are',
    'prescribed at specific phases — not just what to do, but the biology behind it.\n',
    'KEY CLINICAL RULES FROM THE ATLAS:',
    '',
    '1. ARTHROGENIC MUSCLE INHIBITION (AMI): Stifle pain/effusion inhibits quadriceps activation',
    '   even when the nerve is intact. NMES is indicated in weeks 1-2 post-TPLO before voluntary',
    '   quad activation is possible. This is WHY we use NMES before sit-to-stands.',
    '',
    '2. THIGH CIRCUMFERENCE is the primary quad atrophy tracking metric. Measure bilaterally at',
    '   mid-femur at EVERY session. >1cm asymmetry = clinically significant. >2cm = severe.',
    '',
    '3. ILIOPSOAS TIGHTNESS occurs in 60-70% of IVDD patients due to referred pain. Always',
    '   assess lesser trochanter tenderness and passive hip extension ROM in spinal patients.',
    '',
    '4. DEEP PAIN PERCEPTION is the single most important prognostic test in spinal patients.',
    '   Absent deep pain = Frankel Grade I = SURGICAL EMERGENCY. Do not prescribe exercise.',
    '   Flag to attending veterinarian immediately.',
    '',
    '5. BILATERAL CCL RUPTURE RATE: 40-60% of dogs rupture the contralateral CCL within 1-2 years.',
    '   Monitor contralateral limb loading throughout rehabilitation. Prevent overloading.',
    '',
    '6. FELINE PLANTIGRADE STANCE differential: Achilles rupture (unilateral, traumatic) vs.',
    '   Diabetic neuropathy (bilateral, symmetric, concurrent PU/PD/weight loss) vs.',
    '   Lumbosacral disease (with spinal pain). Each requires completely different management.',
    '',
    '7. HCM EXERCISE PHYSIOLOGY: Diastolic dysfunction means cardiac output cannot increase',
    '   with exercise demand. Stage C/D cats can develop flash pulmonary edema from minimal',
    '   exertion. STRESS ITSELF triggers catecholamine release worsening LVOTO.',
    '   Monitoring signs: open-mouth breathing, labored breathing, orthopnea = STOP IMMEDIATELY.',
    '',
    '8. POST-FHO PSEUDOARTHROSIS: Quality depends directly on gluteal development. Gluteals',
    '   become the primary hip stabilizers post-FHO. Aggressive gluteal strengthening from',
    '   week 1 (hydrotherapy) determines long-term functional outcome.',
    '',
    '9. SPINE ANATOMY — CHONDRODYSTROPHIC BREEDS: Hansen Type I IVDD (chondroid degeneration,',
    '   extrusion) peaks at T12-13 and T13-L1. Hansen Type II (fibroid, protrusion) in',
    '   non-chondrodystrophic large breeds at any level. Feline IVDD peaks at L3-L7.',
    '',
    '10. MENISCAL INJURY: Present in 40-60% of CCL ruptures. "Meniscal click" on ROM exam =',
    '    meniscal tear. Late meniscal tear post-TPLO = sudden return of lameness = RED FLAG.',
    '    Requires immediate veterinary reassessment before ANY protocol continuation.',
    '',
    '=== END BLOCK 14 ==='
  ];
  return lines.join('\n');
}

module.exports = {
  MUSCLE_ATLAS,
  getAtlasEntry,
  getStructuresForExercise,
  getStructuresForCondition,
  buildExerciseAnatomyContext,
  generateBlock14SystemPromptContent
};
