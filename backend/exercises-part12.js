// ============================================================================
// EXERCISES PART 12 — SOFT TISSUE, SPORT CONDITIONING & RETURN TO FUNCTION
// K9-REHAB-PRO | Millis & Levine Standards | ACVSMR-Aligned
// ============================================================================
// Covers: Iliopsoas rehab, gracilis/ST contracture, bicipital tenosynovitis,
// OCD shoulder, elbow dysplasia post-op, core stabilization, sport prep
// ============================================================================

const SOFT_TISSUE_SPORT_EXERCISES = [

  // ──────────────────────────────────────────────────────────────────────────
  // 1. ILIOPSOAS PASSIVE STRETCH
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: 'ILIO_STRETCH',
    name: 'Iliopsoas Passive Stretch',
    category: 'Manual Therapy',
    difficulty_level: 'Easy',
    description: 'Passive stretch of the iliopsoas muscle in lateral recumbency. Hip extension with internal rotation bias targets the iliopsoas attachment at the lesser trochanter. Primary treatment for iliopsoas strain — reduces scar tissue formation and restores hip extension ROM.',
    equipment: ['Padded surface', 'Towel for patient positioning'],
    setup: 'Patient in lateral recumbency, affected limb uppermost. Support patient with towel roll under abdomen if needed for comfort.',
    steps: [
      'Position patient in lateral recumbency, affected side up',
      'Stabilize pelvis with one hand to prevent lumbar compensation',
      'With other hand, gently extend hip to comfortable end range',
      'Add slight internal rotation of femur (toe turned inward) to target iliopsoas',
      'Hold 20–30 seconds. MUST be pain-free — any resistance or vocalization, reduce range',
      'Return to neutral. Repeat 3–5 times per session',
      'Apply heat 10–15 min before stretching in subacute/chronic phase to increase tissue extensibility'
    ],
    good_form: [
      'Pelvis stable — no lumbar extension or rotation compensation',
      'Stretch held at end range without forcing beyond comfortable limit',
      'Patient relaxed throughout — no muscle guarding or bracing',
      'Internal rotation component maintained throughout stretch'
    ],
    red_flags: [
      'Vocalization or flinching — immediately reduce range',
      'Increased lameness next day — stretch too aggressive, reduce intensity',
      'Pain on palpation of lesser trochanter area — acute phase, defer stretching'
    ],
    contraindications: 'Acute iliopsoas strain (first 72 hours), hip fracture, hip luxation',
    progression: 'Progress to ILIO_ECCENTRIC when full pain-free passive ROM achieved.',
    clinical_classification: {
      primary_indications: ['OSTEOARTHRITIS'],
      rehab_phases: ['SUBACUTE', 'CHRONIC'],
      intervention_type: 'MANUAL_THERAPY',
      evidence_grade: 'B'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 2. ILIOPSOAS ECCENTRIC LOADING
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: 'ILIO_ECCENTRIC',
    name: 'Iliopsoas Eccentric Loading Progression',
    category: 'Active Assisted',
    difficulty_level: 'Moderate',
    description: 'Controlled eccentric loading of the iliopsoas through active hip flexion against gravity and resistance. Eccentric loading promotes collagen remodeling and tensile strength in healing tendon/muscle tissue. Phase III return-to-function exercise.',
    equipment: ['Ramp (15–20°)', 'Stairs (shallow)', 'Resistance band (optional advanced)'],
    setup: 'Begin with gentle incline walking. Progress to stair stepping when pain-free at incline.',
    steps: [
      'Begin with ramp ascent — encourages hip flexion under load',
      'Descending ramp provides eccentric hip flexor loading (the therapeutic component)',
      'Start with 2 min continuous ramp walking, progress to 5–10 min',
      'Progress to stair descending (controlled single-step descent) at week 6+',
      'Advanced: lateral stepping with resistance band around stifles for hip abductor co-loading'
    ],
    good_form: [
      'Controlled descent — not rushing or bounding down ramp',
      'Symmetric footing on each step',
      'No toe-dragging on descent (indicates fatigue — end session)'
    ],
    red_flags: [
      'Increased lameness post-session — reduce eccentric load, return to flat walking',
      'Positive iliopsoas palpation returning — regression, reduce intensity'
    ],
    contraindications: 'Acute iliopsoas strain, within 3 weeks of diagnosis',
    progression: 'When pain-free on ramp and stairs: progress to jogging, then sport-specific return.',
    clinical_classification: {
      primary_indications: ['OSTEOARTHRITIS'],
      rehab_phases: ['CHRONIC', 'MAINTENANCE'],
      intervention_type: 'ACTIVE_THERAPEUTIC',
      evidence_grade: 'B'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 3. GRACILIS / SEMITENDINOSUS MYOFASCIAL RELEASE
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: 'GRACILIS_RELEASE',
    name: 'Gracilis / Semitendinosus Myofascial Release',
    category: 'Manual Therapy',
    difficulty_level: 'Easy',
    description: 'Manual myofascial release along the gracilis and semitendinosus muscle bellies in the medial thigh. Addresses fibrosis and contracture causing the characteristic circumducting gait pattern. Warm tissue before treatment. Combine with passive stretch.',
    equipment: ['Padded surface', 'Warm compress or hot pack (apply 10 min before)'],
    setup: 'Patient in lateral recumbency, affected limb uppermost. Apply heat 10 min before hands-on work.',
    steps: [
      'Apply warm compress to medial thigh 10 min before starting',
      'Palpate gracilis belly (medial thigh, broad flat muscle running from pelvis to stifle)',
      'Apply sustained pressure along muscle belly using thumb or heel of hand',
      'Hold each point 30–60 seconds. Move 2 cm distally and repeat',
      'Treat entire muscle length from origin (ischial tuberosity) to insertion (tibial tuberosity)',
      'Follow with passive stretch: hip abduction + external rotation while extending stifle',
      'Perform 3–4x/week in subacute/chronic phase'
    ],
    good_form: [
      'Sustained pressure — not sliding or friction (myofascial, not massage)',
      'Patient tolerates treatment — mild discomfort acceptable, pain is not',
      'Palpable softening of tissue under hand during sustained hold'
    ],
    red_flags: [
      'Hard, non-compressible fibrous band — advanced contracture, refer for surgical evaluation',
      'Worsening gait after treatment — reassess technique'
    ],
    contraindications: 'Acute muscle tear, open wounds over treatment area',
    progression: 'Combine with UWTM and lateral stepping. Surgical referral if no improvement in 6 weeks.',
    clinical_classification: {
      primary_indications: ['OSTEOARTHRITIS'],
      rehab_phases: ['SUBACUTE', 'CHRONIC'],
      intervention_type: 'MANUAL_THERAPY',
      evidence_grade: 'C'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 4. BICIPITAL TENDON PROM
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: 'BICEPS_PROM',
    name: 'Bicipital Tendon PROM — Shoulder Flexion/Extension',
    category: 'Passive Therapy',
    difficulty_level: 'Easy',
    description: 'Passive range of motion specifically for bicipital tenosynovitis rehabilitation. Gentle shoulder flexion and extension maintains joint mobility, reduces adhesion formation within the bicipital groove, and prevents muscle atrophy during rest phase.',
    equipment: ['Padded surface'],
    setup: 'Patient in lateral recumbency, affected forelimb uppermost.',
    steps: [
      'Stabilize scapula with one hand against thorax',
      'Grasp distal radius with other hand',
      'Slowly flex shoulder — bring elbow toward chest wall to comfortable end range',
      'Hold 5–10 seconds at end of flexion',
      'Slowly extend shoulder — bring limb caudally to gentle end range',
      'Hold 5 seconds at extension',
      'Complete 10–15 repetitions per session, 2–3 sessions/day'
    ],
    good_form: [
      'Scapula stabilized throughout — prevents compensation',
      'Smooth controlled motion at each direction',
      'No forced movement beyond comfortable range'
    ],
    red_flags: [
      'Pain on shoulder flexion beyond 90° — bicipital groove irritation active, reduce range',
      'Crepitus on joint motion — possible OCD or degenerative component, reassess'
    ],
    contraindications: 'Acute shoulder fracture, shoulder luxation, severe joint effusion',
    progression: 'Progress to BICEPS_ACTIVE when full passive ROM pain-free. Introduce UWTM at shoulder level.',
    clinical_classification: {
      primary_indications: ['OSTEOARTHRITIS'],
      rehab_phases: ['ACUTE', 'SUBACUTE'],
      intervention_type: 'PASSIVE_MODALITY',
      evidence_grade: 'B'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 5. BICIPITAL TENDON — ACTIVE RETURN TO FUNCTION
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: 'BICEPS_ACTIVE',
    name: 'Bicipital Tendon — Active Return to Function',
    category: 'Active Assisted',
    difficulty_level: 'Moderate',
    description: 'Progressive active forelimb loading for return to function after bicipital tenosynovitis. Wheelbarrow exercise selectively loads forelimbs, driving active shoulder stabilization. Combine with cavaletti to restore normal forelimb reach and swing.',
    equipment: ['Non-slip surface', 'Cavaletti poles or ground poles'],
    setup: 'Begin on flat non-slip surface. Handler at rear for wheelbarrow. Level ground poles before progressing to cavaletti height.',
    steps: [
      'Wheelbarrow: Handler lifts hindquarters, dog walks forward on forelimbs — 5 steps initially',
      'Progress wheelbarrow: 10 steps, then 20 steps, over 2-week period',
      'Ground poles: Walk over 4–6 poles set at natural stride length on flat surface',
      'Cavaletti: Raise poles to fetlock height. Walk at controlled pace over 6 poles',
      'All exercises: Monitor for shortened forelimb stride or toe-dragging (indicates residual pain)'
    ],
    good_form: [
      'Symmetric forelimb reach over cavaletti',
      'No circumduction of affected forelimb',
      'Active shoulder extension during push-off phase'
    ],
    red_flags: [
      'Acute lameness increase after session — too much load, reduce to PROM phase',
      'Shoulder swelling increasing — stop, cold therapy, vet reassessment'
    ],
    contraindications: 'Active bicipital pain on palpation, acute shoulder effusion',
    progression: 'Sport return when: full symmetric forelimb reach at trot, negative shoulder palpation, full ROM.',
    clinical_classification: {
      primary_indications: ['OSTEOARTHRITIS'],
      rehab_phases: ['CHRONIC', 'MAINTENANCE'],
      intervention_type: 'ACTIVE_THERAPEUTIC',
      evidence_grade: 'B'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 6. CANINE CORE BRIDGE
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: 'CORE_BRIDGE',
    name: 'Canine Core Bridge — Spinal Stabilization',
    category: 'Balance & Proprioception',
    difficulty_level: 'Moderate',
    description: 'Core stabilization exercise using unstable surface under hindquarters to activate epaxial and hypaxial musculature. Critical for lumbosacral disease, DM, IVDD maintenance, and any case where spinal stability is compromised. Equivalent to the human bridge/plank for spinal stabilizer recruitment.',
    equipment: ['Balance disc or peanut ball under hindquarters', 'Non-slip mat', 'Treat for lure'],
    setup: 'Place balance disc under hindquarters with dog in standing position. Handler stabilizes dog with light hand contact on flanks.',
    steps: [
      'Position balance disc under hindquarters in standing — disc should slightly tilt pelvis',
      'Lure dog to maintain standing position with treat at nose level',
      'Hold 10–30 seconds. Dog actively corrects balance — this IS the exercise',
      'Add slight lateral perturbations (gentle push on flank) to challenge stabilizers',
      'Progress: move disc under forelimbs, then diagonal limbs',
      '3 sets × 30 seconds, 1 min rest between sets'
    ],
    good_form: [
      'Dog making subtle balance corrections throughout — muscle activation confirmed',
      'Spine neutral — not roaching or hyperextending',
      'All four limbs bearing weight symmetrically'
    ],
    red_flags: [
      'Dog steps off disc repeatedly — either too challenging or pain avoidance',
      'Lumbar pain on axial loading — reassess patient suitability'
    ],
    contraindications: 'Acute spinal pain, Grade IV-V IVDD without veterinary clearance',
    progression: 'CORE_CRAWL when 30-second hold achieved pain-free.',
    clinical_classification: {
      primary_indications: ['IVDD', 'DEGENERATIVE_MYELO', 'OSTEOARTHRITIS'],
      rehab_phases: ['SUBACUTE', 'CHRONIC', 'MAINTENANCE'],
      intervention_type: 'NEUROMUSCULAR_RETRAINING',
      evidence_grade: 'B'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 7. CANINE CORE CRAWL (CREEPING PATTERN)
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: 'CORE_CRAWL',
    name: 'Canine Creeping / Crawl Pattern',
    category: 'Neurological Rehabilitation',
    difficulty_level: 'Moderate',
    description: 'Controlled forward crawling under a low obstacle drives diagonal limb coordination, deep core activation, and proprioceptive integration. Particularly valuable for IVDD, DM, and FCE patients relearning normal limb sequencing. Activates contralateral limb patterning lost in neurological patients.',
    equipment: ['Low tunnel or suspended bar at shoulder height', 'Treat lure', 'Non-slip mat'],
    setup: 'Create low tunnel using cavaletti poles or a table with a bar at dog\'s shoulder height. Dog must lower body to pass under.',
    steps: [
      'Lure dog under low obstacle with treat — obstacle should require them to lower head and flex all joints',
      'Start with obstacle at sternum height, progress to elbow height as skill improves',
      'Encourage slow controlled movement — speed defeats the proprioceptive benefit',
      '5–10 passes initially, progress to 3 × 10 passes',
      'For neurological patients: support hindquarters with sling if needed during passes'
    ],
    good_form: [
      'Diagonal limb movement pattern maintained (LF + RH, RF + LH)',
      'Controlled body lowering — not collapsing',
      'Head tracking forward, spine neutral'
    ],
    red_flags: [
      'Dog refuses to go under — possible cervical pain, assess neck ROM first',
      'Lumbar flexion causing pain — raise obstacle height, reduce lumbar demand'
    ],
    contraindications: 'Cervical IVDD (forces neck flexion), lumbosacral disease in acute phase',
    progression: 'Combine with SPORT_WEAVE for advanced neuromotor patterning.',
    clinical_classification: {
      primary_indications: ['IVDD', 'DEGENERATIVE_MYELO', 'FCE'],
      rehab_phases: ['SUBACUTE', 'CHRONIC'],
      intervention_type: 'NEUROMUSCULAR_RETRAINING',
      evidence_grade: 'C'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 8. SPORT WEAVE POLES
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: 'SPORT_WEAVE',
    name: 'Sport Return — Weave Poles',
    category: 'Functional Training',
    difficulty_level: 'Advanced',
    description: 'Weave pole exercise for sport and agility return-to-function patients. Demands lateral flexion, rapid limb placement changes, and cervical/lumbar rotation. Phase IV/V only. Not appropriate for lumbosacral, cervical IVDD, or acute soft tissue cases.',
    equipment: ['6–12 weave poles', 'Non-slip surface'],
    setup: 'Set poles at standard agility spacing (60–65cm) initially. Wider spacing for early introduction.',
    steps: [
      'Begin with wide-set poles (90cm spacing) — reduces spinal rotation demand',
      'Walk pace only for first 2 weeks of weave introduction',
      'Progress to trot pace when walk weave is consistent and pain-free',
      'Reduce pole spacing toward standard (60–65cm) over 4-week period',
      'Running weave is final stage — require full pain-free sport clearance first'
    ],
    good_form: [
      'Smooth lateral flexion through thoracolumbar junction',
      'No stumbling or pole knocking from rushing',
      'Even footfall pattern both directions'
    ],
    red_flags: [
      'Back pain post-session — lumbosacral or thoracolumbar involvement, discontinue',
      'Uneven weave performance (better one direction) — possible residual lateral asymmetry, investigate'
    ],
    contraindications: 'Lumbosacral disease, cervical IVDD, DM, Phase I-III patients',
    progression: 'Full sport return when pain-free, symmetric, running weave at normal agility speed.',
    clinical_classification: {
      primary_indications: ['SPORT', 'CCL_REPAIR', 'OSTEOARTHRITIS'],
      rehab_phases: ['MAINTENANCE'],
      intervention_type: 'FUNCTIONAL_REHABILITATION',
      evidence_grade: 'C'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 9. SPORT JUMP PREPARATION
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: 'SPORT_JUMP_PREP',
    name: 'Sport Return — Jump Preparation Protocol',
    category: 'Functional Training',
    difficulty_level: 'Advanced',
    description: 'Structured jump return protocol for agility, flyball, or working dog patients. Graded height introduction with biomechanical assessment at each stage. Phase IV/V only. Requires full weight-bearing, symmetric gait, and ACVSMR Phase IV clearance criteria met before jump introduction.',
    equipment: ['Adjustable jump bar', 'Non-slip landing surface', 'Video recording (optional, recommended)'],
    setup: 'Begin at jump bar on ground (no height). Progress in 5cm increments over weeks, not days.',
    steps: [
      'Week 1: Jump bar on ground — walk over at heel, then trot over',
      'Week 2–3: 10cm height — trot approach, assess landing symmetry',
      'Week 3–4: 20cm height — controlled trot approach, evaluate hindlimb push-off symmetry',
      'Week 5–6: 30cm — approaching working height for small dogs, half-height for medium/large',
      'Week 7–8: Progress to competition height only when all previous heights pain-free and symmetric',
      'Video from behind: assess symmetric hindlimb push-off and landing'
    ],
    good_form: [
      'Symmetric hindlimb push-off on takeoff',
      'Forelimb landing absorbing impact symmetrically',
      'Clean lift without clipping bar (indicates adequate hip/stifle flexion)'
    ],
    red_flags: [
      'Asymmetric push-off on video — residual surgical limb weakness, do not advance height',
      'Landing hard on forelimbs (dropping hindquarters) — possible hindlimb pain or weakness',
      'Any lameness within 24h of jump session — step back to previous height'
    ],
    contraindications: 'Phase I-III patients, positive gait score >1 at any gait, ROM deficit >10° from contralateral',
    progression: 'Full sport clearance when: competition height achieved, symmetric video analysis, pain-free for 4 consecutive weeks.',
    clinical_classification: {
      primary_indications: ['SPORT', 'CCL_REPAIR', 'PATELLAR_LUXATION'],
      rehab_phases: ['MAINTENANCE'],
      intervention_type: 'FUNCTIONAL_REHABILITATION',
      evidence_grade: 'C'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 10. ELBOW DYSPLASIA POST-OP — PROGRESSIVE FORELIMB LOADING
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: 'ELBOW_LOAD_PROG',
    name: 'Elbow Dysplasia Post-Op — Progressive Forelimb Loading',
    category: 'Post-Surgical',
    difficulty_level: 'Moderate',
    description: 'Structured forelimb loading protocol for post-arthroscopic elbow dysplasia patients. Graded loading sequence progresses from partial weight-bearing in water to full land-based loading. Mirrors TPLO loading protocol but adapted for the elbow joint — shorter timeline, higher early weight-bearing tolerance.',
    equipment: ['Underwater treadmill', 'Balance disc', 'Front step platform (4–6 inches)'],
    setup: 'Week 1-3 aquatic priority. Week 4+ introduce land exercises.',
    uwtm_dosing: {
      water_depth: 'Shoulder level weeks 1–3 (reduces forelimb load ~50%). Elbow level weeks 4–8 (reduces ~30%).',
      speed_mph: { min: 0.5, max: 1.5 },
      session_duration_min: { initial: 5, target: 12 },
      frequency_per_week: { min: 2, max: 3 },
      water_temp_f: { min: 85, max: 92 },
      rehab_phase: 'Phase I → III',
      post_op_week: '1–12'
    },
    steps: [
      'Weeks 1–3: UWTM shoulder-level water. Cold therapy post-session.',
      'Weeks 3–6: UWTM elbow-level water + land walking on flat surface',
      'Week 4+: Front step-ups (4-inch platform) — promotes active elbow flexion/extension under load',
      'Week 6+: Cavaletti rails (forelimb reach and proprioception)',
      'Week 8+: Wheelbarrow exercise — active forelimb loading under body weight'
    ],
    good_form: [
      'Symmetric forelimb reach on all exercises',
      'Active weight-bearing on affected forelimb during stance phase',
      'No circumduction or carrying of affected forelimb'
    ],
    red_flags: [
      'Elbow swelling increasing after exercise — too much load, reduce to UWTM only',
      'Persistent toe-touching only — check surgical outcome with veterinarian'
    ],
    contraindications: 'Open surgical site, confirmed implant complication, severe OA flare',
    progression: 'Full activity at 12–16 weeks if symmetric gait and pain-free elbow ROM.',
    clinical_classification: {
      primary_indications: ['OSTEOARTHRITIS'],
      rehab_phases: ['ACUTE', 'SUBACUTE', 'CHRONIC'],
      intervention_type: 'ACTIVE_THERAPEUTIC',
      evidence_grade: 'B'
    }
  }

];

// ============================================================================
// EXPORT
// ============================================================================
module.exports = SOFT_TISSUE_SPORT_EXERCISES;
