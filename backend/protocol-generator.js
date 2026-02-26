// ============================================================================
// CANINE REHABILITATION PROTOCOL SYSTEM
// Full Hybrid Exercise Library Edition — Board-Certified Specialty Standard
// ACVSMR-Aligned Clinical Protocols
// 4 Conditions | 16 Phases | 60+ Exercises | Full Modality Integration
//
// Source: canine_rehab_protocols.docx
// Evidence-Based | Client-Safe | Phase-Specific
// ============================================================================

// ============================================================================
// PROTOCOL DEFINITIONS
// 4 Conditions × 4 Gated Phases
// Each phase includes: goal, exercises, contraindications, progression criteria
// Exercises reference codes from the exercise database
// ============================================================================

const PROTOCOL_DEFINITIONS = {

  // ═══════════════════════════════════════════════════════════════════════════
  // PROTOCOL 1: TPLO POST-OP REHABILITATION
  // Tibial Plateau Leveling Osteotomy — 4-Phase Recovery Protocol
  // ═══════════════════════════════════════════════════════════════════════════
  'tplo': {
    name: 'TPLO Post-Op Rehabilitation',
    defaultWeeks: 16,
    phases: [
      {
        number: 1,
        name: 'Acute Protection',
        weekRange: 'Weeks 0-2',
        phaseFraction: [0, 0.125],   // 0-12.5% of protocol
        goal: 'Control pain and inflammation. Protect surgical repair. Prevent muscle atrophy onset. Maintain joint nutrition via controlled ROM.',
        exercises: [
          { code: 'PROM_STIFLE',      sets: '10-15 reps/joint',    frequency: '2-3x/day',   progression: 'Increase ROM as tolerated' },
          { code: 'PROM_HIP',         sets: '5-10 circles each dir', frequency: '2x/day',   progression: 'Add resistance at end-range' },
          // Source-of-truth: stifle-specific PROM is separate exercise with higher frequency
          { code: 'PROM_STIFLE_SPEC', sets: '10-15 reps',          frequency: '3x/day',     progression: 'Transition to active-assisted' },
          { code: 'JOINT_MOB_G1',     sets: '30-60 sec/joint',     frequency: '1-2x/day',   progression: 'Progress to Grade III-IV' },
          { code: 'COLD_THERAPY',     sets: '10-15 min',           frequency: '3-4x/day',   progression: 'Reduce frequency as inflammation resolves' },
          { code: 'ASSISTED_STANDING', sets: '30-60 sec x 3-5',    frequency: '3-5x/day',   progression: 'Reduce sling support' },
          { code: 'LASER_IV',         sets: 'Per protocol',        frequency: '2-3x/week',  progression: 'Reduce frequency as healing progresses' },
          { code: 'NMES_QUAD',        sets: '15-20 min',           frequency: '1-2x/day',   progression: 'Increase intensity, combine with active exercise' },
          { code: 'PEMF_THERAPY',     sets: '20-30 min',           frequency: '1-2x/day',   progression: 'Reduce frequency over time' }
        ],
        contraindications: 'No off-leash activity. No jumping. No stairs. No forced ROM past pain threshold. No running. No swimming.',
        progressionCriteria: 'Willingness to bear weight on surgical limb. Incision healing well. Pain score consistently < 3/10. No effusion increase.'
      },
      {
        number: 2,
        name: 'Early Mobilization',
        weekRange: 'Weeks 2-6',
        phaseFraction: [0.125, 0.375],  // 12.5-37.5%
        goal: 'Restore normal weight bearing. Begin active ROM. Initiate controlled strengthening. Begin proprioceptive re-education.',
        exercises: [
          { code: 'PROM_STIFLE',   sets: '10-15 reps/joint',      frequency: '2-3x/day',   progression: 'Increase ROM as tolerated' },
          { code: 'MASSAGE_THERA', sets: '5-10 min per area',      frequency: '1-2x/day',   progression: 'Deeper techniques as tolerated' },
          { code: 'HEAT_THERAPY',  sets: '10-15 min',              frequency: 'Before exercise', progression: 'Consistent use pre-stretching' },
          { code: 'WEIGHT_SHIFT',  sets: '5-10 shifts, 2-3 sec',   frequency: '2-3x/day',   progression: 'Longer holds, less handler support' },
          // Source-of-truth: cranial/caudal weight shift is separate from lateral
          { code: 'WEIGHT_SHIFT_CC', sets: '5-10 shifts, 2-3 sec',  frequency: '2-3x/day',   progression: 'Uneven surface' },
          { code: 'SIT_STAND',     sets: '5-10 reps x 2-3 sets',   frequency: '2x/day',     progression: 'Slow tempo, incline surface' },
          { code: 'SLOW_WALK',     sets: '5-15 min',               frequency: '2-4x/day',   progression: 'Increase duration 10-15% weekly' },
          { code: 'FIGURE_8',      sets: '3-5 figures x 2 sets',   frequency: '1-2x/day',   progression: 'Tighten turns, vary speed' },
          { code: 'FOAM_PAD_STAND', sets: '5-10 passes',           frequency: '1-2x/day',   progression: 'Thicker/softer pads' },
          { code: 'LASER_IV',      sets: 'Per protocol',           frequency: '2-3x/week',  progression: 'Reduce frequency as healing progresses' },
          { code: 'NMES_QUAD',     sets: '15-20 min',              frequency: '1-2x/day',   progression: 'Increase intensity, combine with active exercise' }
        ],
        contraindications: 'No off-leash activity. No jumping. Stairs only if necessary with sling support. No trotting. No sudden direction changes.',
        progressionCriteria: 'Consistent weight bearing at walk. Thigh circumference loss < 1cm vs opposite. Passive ROM within 10 degrees of opposite. No post-exercise lameness.'
      },
      {
        number: 3,
        name: 'Controlled Strengthening',
        weekRange: 'Weeks 6-12',
        phaseFraction: [0.375, 0.75],  // 37.5-75%
        goal: 'Rebuild muscle mass. Improve dynamic stability. Increase exercise duration and complexity. Begin advanced proprioception.',
        exercises: [
          { code: 'SIT_STAND',       sets: '5-10 reps x 2-3 sets',  frequency: '2x/day',     progression: 'Slow tempo, incline surface' },
          { code: 'DOWN_STAND',      sets: '5-8 reps x 2 sets',     frequency: '1-2x/day',   progression: 'Add surface difficulty' },
          { code: 'SLOW_WALK',       sets: '5-15 min',              frequency: '2-4x/day',   progression: 'Increase duration 10-15% weekly' },
          { code: 'BACKING_UP',      sets: '5-10 steps x 3-5 sets', frequency: '1-2x/day',   progression: 'Increase distance, add incline' },
          { code: 'HILL_CLIMB',      sets: '5-10 min',              frequency: '1-2x/day',   progression: 'Steeper incline, longer duration' },
          { code: 'BACKWARD_HILL',   sets: '5-10 min',              frequency: '1-2x/day',   progression: 'Steeper decline' },
          { code: 'CAVALETTI_RAILS', sets: '3-5 passes x 2 sets',   frequency: '1-2x/day',   progression: 'Raise height incrementally' },
          { code: 'CAVALETTI_ELEV',  sets: '3-5 passes x 2 sets',   frequency: '1x/day',     progression: 'Increase height incrementally' },
          { code: 'PLATFORM_TRANS',  sets: '5-10 reps x 2',         frequency: '1x/day',     progression: 'Higher platform' },
          { code: 'SLOW_PIVOT',      sets: '5-10 pivots each dir',  frequency: '1x/day',     progression: 'Smaller platform' },
          { code: 'WOBBLE_BOARD',    sets: '30-60 sec x 3-5',       frequency: '1-2x/day',   progression: 'Decrease base of support' },
          { code: 'BALANCE_PAD',     sets: '30-60 sec x 3',         frequency: '1-2x/day',   progression: 'Eyes-off (handler-directed distraction)' },
          { code: 'BOSU_HIND',       sets: '20-45 sec x 3',         frequency: '1x/day',     progression: 'Add perturbation' },
          { code: 'UNDERWATER_TREAD', sets: '5-20 min',             frequency: '2-3x/week',  progression: 'Increase duration, speed, water level' }
        ],
        contraindications: 'No uncontrolled off-leash running. No jumping from heights. Limit high-speed turns. Monitor for post-exercise soreness > 24hrs.',
        progressionCriteria: 'Thigh circumference within 0.5cm of opposite. Full PROM. No lameness at walk or slow trot. Radiographic bone healing confirmed.'
      },
      {
        number: 4,
        name: 'Return to Function',
        weekRange: 'Weeks 12-16+',
        phaseFraction: [0.75, 1.0],  // 75-100%
        goal: 'Full functional restoration. Sport-specific or lifestyle-specific conditioning. Gradual return to unrestricted activity.',
        exercises: [
          // Source-of-truth: canine_rehab_protocols.docx — TPLO Phase 4 (11 exercises)
          { code: 'STAIR_CLIMB',      sets: '3-5 flights x 2',       frequency: '1x/day',     progression: 'Increase flights' },
          { code: 'STAIR_DESCEND',    sets: '3-5 flights x 2',       frequency: '1x/day',     progression: 'Reduce leash tension support' },
          { code: 'CAVALETTI_WEAVE',  sets: '3-5 passes',            frequency: '1x/day',     progression: 'Curved path, speed variation' },
          { code: 'POLE_WEAVE',       sets: '3-5 passes x 2',        frequency: '1x/day',     progression: 'Tighter spacing, faster pace' },
          { code: 'PHYSIO_BALL',      sets: '15-30 sec x 3-5',       frequency: '1x/day',     progression: 'Reduce handler support, add movement' },
          { code: 'UNDERWATER_TREAD', sets: '5-20 min',              frequency: '2-3x/week',  progression: 'Increase duration, speed, water level' },
          { code: 'POOL_SWIM',        sets: '5-15 min',              frequency: '1-3x/week',  progression: 'Increase duration, reduce flotation support' },
          { code: 'SLOW_TROT',        sets: '1 min trot / 2 min walk x 5', frequency: '1x/day', progression: 'Increase trot intervals' },
          { code: 'JOG_LEASH',        sets: '5-15 min',              frequency: '1x/day',     progression: 'Increase duration, add terrain' },
          { code: 'FETCH_CONTROLLED', sets: '3-5 throws, short dist', frequency: '1x/day',    progression: 'Increase distance gradually' },
          { code: 'LAND_TREADMILL',   sets: '5-20 min',              frequency: '1-2x/day',   progression: 'Increase speed, incline' }
        ],
        contraindications: 'Avoid full-speed sprints until 16 weeks minimum. No competitive agility until cleared. Stop any activity causing visible lameness.',
        progressionCriteria: 'Symmetrical gait at trot. Equal thigh circumference. Full pain-free ROM. Owner reports normal activity level at home.'
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PROTOCOL 2: IVDD (INTERVERTEBRAL DISC DISEASE) RECOVERY
  // Grade I-III Conservative & Post-Surgical — 4-Phase Neuro-Rehab Protocol
  // ═══════════════════════════════════════════════════════════════════════════
  'ivdd': {
    name: 'IVDD (Intervertebral Disc Disease) Recovery',
    defaultWeeks: 12,
    phases: [
      {
        number: 1,
        name: 'Strict Rest & Pain Control',
        weekRange: 'Weeks 0-2',
        phaseFraction: [0, 0.167],
        goal: 'Reduce disc inflammation. Manage neuropathic pain. Prevent further herniation. Maintain passive joint/tissue health.',
        exercises: [
          { code: 'PROM_STIFLE',  sets: '10-15 reps/joint',  frequency: '2-3x/day',   progression: 'Increase ROM as tolerated' },
          { code: 'JOINT_MOB_G1', sets: '30-60 sec/joint',   frequency: '1-2x/day',   progression: 'Progress to Grade III-IV' },
          { code: 'MASSAGE_THERA', sets: '5-10 min per area', frequency: '1-2x/day',   progression: 'Deeper techniques as tolerated' },
          { code: 'COLD_THERAPY', sets: '10-15 min',          frequency: '3-4x/day',   progression: 'Reduce frequency as inflammation resolves' },
          { code: 'LASER_IV',     sets: 'Per protocol',       frequency: '2-3x/week',  progression: 'Reduce frequency as healing progresses' },
          { code: 'TENS_THERAPY', sets: '15-30 min',          frequency: 'As needed',   progression: 'Wean as pain improves' },
          { code: 'PEMF_THERAPY', sets: '20-30 min',          frequency: '1-2x/day',   progression: 'Reduce frequency over time' },
          { code: 'NMES_QUAD',    sets: '15-20 min',          frequency: '1-2x/day',   progression: 'Increase intensity, combine with active exercise' }
        ],
        contraindications: 'No jumping, running, stairs, or off-leash activity. No spinal manipulation. Crate rest required. No forced flexion/extension of spine.',
        progressionCriteria: 'Pain score < 2/10. Voluntary movement in crate. Proprioceptive placing present (if neurologic). Vet clearance to begin active rehab.'
      },
      {
        number: 2,
        name: 'Neuromotor Re-Education',
        weekRange: 'Weeks 2-6',
        phaseFraction: [0.167, 0.50],
        goal: 'Restore proprioceptive awareness. Initiate voluntary motor control. Establish supported weight bearing. Begin core stabilization.',
        exercises: [
          { code: 'PROM_STIFLE',      sets: '10-15 reps/joint',      frequency: '2-3x/day',   progression: 'Increase ROM as tolerated' },
          { code: 'HEAT_THERAPY',     sets: '10-15 min',              frequency: 'Before exercise', progression: 'Consistent use pre-stretching' },
          { code: 'ASSISTED_STANDING', sets: '30-60 sec holds x 3-5', frequency: '3-5x/day',   progression: 'Reduce sling support' },
          { code: 'WEIGHT_SHIFT',     sets: '5-10 shifts, 2-3 sec',   frequency: '2-3x/day',   progression: 'Longer holds, less handler support' },
          { code: 'PERTURBATION',     sets: '5-10 perturbations x 3', frequency: '1-2x/day',   progression: 'Increase force, add unstable surface' },
          { code: 'SLOW_WALK',        sets: '5-15 min',               frequency: '2-4x/day',   progression: 'Increase duration 10-15% weekly' },
          { code: 'BACKING_UP',       sets: '5-10 steps x 3-5 sets',  frequency: '1-2x/day',   progression: 'Increase distance, add incline' },
          { code: 'FOAM_PAD_STAND',   sets: '5-10 passes',            frequency: '1-2x/day',   progression: 'Thicker/softer pads' },
          { code: 'LASER_IV',         sets: 'Per protocol',           frequency: '2-3x/week',  progression: 'Reduce frequency as healing progresses' },
          { code: 'NMES_QUAD',        sets: '15-20 min',              frequency: '1-2x/day',   progression: 'Increase intensity, combine with active exercise' },
          { code: 'UNDERWATER_TREAD', sets: '5-20 min',               frequency: '2-3x/week',  progression: 'Increase duration, speed, water level' }
        ],
        contraindications: 'No spinal flexion exercises. No jumping. Avoid slippery surfaces. No unassisted stairs.',
        progressionCriteria: 'Voluntary weight bearing without sling. Conscious proprioceptive placing in all 4 limbs. Ambulatory (may be ataxic). No worsening neurologic signs.'
      },
      {
        number: 3,
        name: 'Functional Strengthening',
        weekRange: 'Weeks 6-12',
        phaseFraction: [0.50, 1.0],
        goal: 'Improve gait quality. Strengthen core and limb musculature. Challenge balance systems. Increase endurance.',
        exercises: [
          { code: 'SIT_STAND',        sets: '5-10 reps x 2-3 sets',  frequency: '2x/day',     progression: 'Slow tempo, incline surface' },
          { code: 'SLOW_WALK',        sets: '5-15 min',              frequency: '2-4x/day',   progression: 'Increase duration 10-15% weekly' },
          { code: 'FIGURE_8',         sets: '3-5 figures x 2 sets',  frequency: '1-2x/day',   progression: 'Tighten turns, vary speed' },
          { code: 'BACKING_UP',       sets: '5-10 steps x 3-5 sets', frequency: '1-2x/day',   progression: 'Increase distance, add incline' },
          { code: 'SIDE_STEP',        sets: '5-10 steps each dir x 3', frequency: '1x/day',   progression: 'Increase reps, add resistance band' },
          { code: 'HILL_CLIMB',       sets: '5-10 min',              frequency: '1-2x/day',   progression: 'Steeper incline, longer duration' },
          { code: 'CAVALETTI_RAILS',  sets: '3-5 passes x 2 sets',   frequency: '1-2x/day',   progression: 'Raise height incrementally' },
          { code: 'LADDER_WALK',      sets: '3-5 passes',            frequency: '1x/day',     progression: 'Vary rung spacing' },
          { code: 'WOBBLE_BOARD',     sets: '30-60 sec x 3-5',       frequency: '1-2x/day',   progression: 'Decrease base of support' },
          { code: 'BOSU_FRONT',       sets: '20-45 sec x 3',         frequency: '1x/day',     progression: 'All 4 feet on BOSU' },
          { code: 'PHYSIO_BALL',      sets: '15-30 sec x 3-5',       frequency: '1x/day',     progression: 'Reduce handler support, add movement' },
          { code: 'UNDERWATER_TREAD', sets: '5-20 min',              frequency: '2-3x/week',  progression: 'Increase duration, speed, water level' },
          { code: 'WATER_WALKING',    sets: '5-10 min',              frequency: '2-3x/week',  progression: 'Deeper water for more resistance' }
        ],
        contraindications: 'Avoid high-impact activities. No forced spinal rotation. Monitor for fatigue-induced ataxia. Stop if neurologic signs worsen.',
        progressionCriteria: 'Non-ataxic gait at walk. Core stability sufficient for unsupported standing on unstable surface > 30 sec. No pain on spinal palpation.'
      },
      {
        number: 4,
        name: 'Maintenance & Prevention',
        weekRange: 'Weeks 12+',
        phaseFraction: [1.0, 1.5],  // extends beyond protocol
        goal: 'Long-term spinal health. Core strength maintenance. Weight management support. Activity modification education.',
        exercises: [
          // Source-of-truth: canine_rehab_protocols.docx — IVDD Phase 4 (10 exercises)
          { code: 'SIT_STAND',        sets: '5-10 reps x 2-3 sets',  frequency: '2x/day',     progression: 'Slow tempo, incline surface' },
          { code: 'DIAGONAL_WALK',    sets: '10-20 steps x 2',       frequency: '1x/day',     progression: 'Increase distance' },
          { code: 'HILL_CLIMB',       sets: '5-10 min',              frequency: '1-2x/day',   progression: 'Steeper incline, longer duration' },
          { code: 'CAVALETTI_RAILS',  sets: '3-5 passes x 2 sets',   frequency: '1-2x/day',   progression: 'Raise height incrementally' },
          { code: 'SLOW_PIVOT',       sets: '5-10 pivots each dir',  frequency: '1x/day',     progression: 'Smaller platform' },
          { code: 'WOBBLE_BOARD',     sets: '30-60 sec x 3-5',       frequency: '1-2x/day',   progression: 'Decrease base of support' },
          { code: 'PHYSIO_BALL',      sets: '15-30 sec x 3-5',       frequency: '1x/day',     progression: 'Reduce handler support, add movement' },
          { code: 'UNDERWATER_TREAD', sets: '5-20 min',              frequency: '2-3x/week',  progression: 'Increase duration, speed, water level' },
          { code: 'SLOW_TROT',        sets: '1 min trot / 2 min walk x 5', frequency: '1x/day', progression: 'Increase trot intervals' },
          { code: 'LAND_TREADMILL',   sets: '5-20 min',              frequency: '1-2x/day',   progression: 'Increase speed, incline' }
        ],
        contraindications: 'Avoid repetitive high-impact activities long-term. No disc dog/flyball unless cleared. Manage body weight rigorously. Lifetime activity modification for stairs/jumping.',
        progressionCriteria: 'Home maintenance program established. Owner educated on red flags. 3-6 month recheck schedule confirmed.'
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PROTOCOL 3: OSTEOARTHRITIS (OA) MANAGEMENT
  // Hip, Stifle & Elbow — Multimodal Chronic Pain & Mobility Protocol
  // ═══════════════════════════════════════════════════════════════════════════
  'oa': {
    name: 'Osteoarthritis (OA) Management',
    defaultWeeks: 16,
    phases: [
      {
        number: 1,
        name: 'Pain Control & Baseline',
        weekRange: 'Weeks 0-4',
        phaseFraction: [0, 0.25],
        goal: 'Establish pain baseline. Reduce acute flare. Initiate gentle movement. Begin weight/body condition assessment.',
        exercises: [
          { code: 'PROM_STIFLE',      sets: '10-15 reps/joint',      frequency: '2-3x/day',   progression: 'Increase ROM as tolerated' },
          { code: 'PROM_HIP',         sets: '5-10 circles each dir', frequency: '2x/day',     progression: 'Add resistance at end-range' },
          { code: 'MASSAGE_THERA',    sets: '5-10 min per area',     frequency: '1-2x/day',   progression: 'Deeper techniques as tolerated' },
          { code: 'COLD_THERAPY',     sets: '10-15 min',             frequency: '3-4x/day',   progression: 'Reduce frequency as inflammation resolves' },
          { code: 'HEAT_THERAPY',     sets: '10-15 min',             frequency: 'Before exercise', progression: 'Consistent use pre-stretching' },
          { code: 'STRETCH_HAMS',     sets: '3-5 reps, 15-30 sec hold', frequency: 'After warm-up', progression: 'Increase hold duration' },
          { code: 'STRETCH_ILIO',      sets: '3-5 reps, 15-30 sec hold', frequency: 'After warm-up', progression: 'Increase extension range' },
          { code: 'SLOW_WALK',        sets: '5-15 min',              frequency: '2-4x/day',   progression: 'Increase duration 10-15% weekly' },
          { code: 'LASER_IV',         sets: 'Per protocol',          frequency: '2-3x/week',  progression: 'Reduce frequency as healing progresses' },
          { code: 'TENS_THERAPY',     sets: '15-30 min',             frequency: 'As needed',   progression: 'Wean as pain improves' },
          { code: 'UNDERWATER_TREAD', sets: '5-20 min',              frequency: '2-3x/week',  progression: 'Increase duration, speed, water level' }
        ],
        contraindications: 'No high-impact exercise. No forced ROM through pain. Avoid cold surfaces without warm-up. No exercise during active flare without vet guidance.',
        progressionCriteria: 'Pain score consistently < 4/10. Owner-reported improvement in mobility at home. Willingness to walk > 10 minutes without lameness.'
      },
      {
        number: 2,
        name: 'Progressive Mobility',
        weekRange: 'Weeks 4-8',
        phaseFraction: [0.25, 0.50],
        goal: 'Improve joint ROM. Combat deconditioning. Build walking endurance. Strengthen stabilizer muscles.',
        exercises: [
          { code: 'MASSAGE_THERA',    sets: '5-10 min per area',      frequency: '1-2x/day',   progression: 'Deeper techniques as tolerated' },
          { code: 'HEAT_THERAPY',     sets: '10-15 min',              frequency: 'Before exercise', progression: 'Consistent use pre-stretching' },
          { code: 'STRETCH_HAMS',     sets: '3-5 reps, 15-30 sec hold', frequency: 'After warm-up', progression: 'Increase hold duration' },
          { code: 'STRETCH_ILIO',      sets: '3-5 reps, 15-30 sec hold', frequency: 'After warm-up', progression: 'Increase extension range' },
          { code: 'WEIGHT_SHIFT',     sets: '5-10 shifts, 2-3 sec',   frequency: '2-3x/day',   progression: 'Longer holds, less handler support' },
          // Source-of-truth: cranial/caudal weight shift is separate from lateral
          { code: 'WEIGHT_SHIFT_CC', sets: '5-10 shifts, 2-3 sec',   frequency: '2-3x/day',   progression: 'Uneven surface' },
          { code: 'SIT_STAND',        sets: '5-10 reps x 2-3 sets',   frequency: '2x/day',     progression: 'Slow tempo, incline surface' },
          { code: 'SLOW_WALK',        sets: '5-15 min',               frequency: '2-4x/day',   progression: 'Increase duration 10-15% weekly' },
          { code: 'FIGURE_8',         sets: '3-5 figures x 2 sets',   frequency: '1-2x/day',   progression: 'Tighten turns, vary speed' },
          { code: 'BACKING_UP',       sets: '5-10 steps x 3-5 sets',  frequency: '1-2x/day',   progression: 'Increase distance, add incline' },
          { code: 'FOAM_PAD_STAND',   sets: '5-10 passes',            frequency: '1-2x/day',   progression: 'Thicker/softer pads' },
          { code: 'CAVALETTI_RAILS',  sets: '3-5 passes x 2 sets',    frequency: '1-2x/day',   progression: 'Raise height incrementally' },
          { code: 'UNDERWATER_TREAD', sets: '5-20 min',               frequency: '2-3x/week',  progression: 'Increase duration, speed, water level' },
          { code: 'LASER_IV',         sets: 'Per protocol',           frequency: '2-3x/week',  progression: 'Reduce frequency as healing progresses' }
        ],
        contraindications: 'No exercises that cause visible lameness during or after. No jumping. Avoid hard surfaces for prolonged exercise.',
        progressionCriteria: 'Improved thigh/arm circumference. Lameness-free walking for 15+ minutes. Active ROM improved by 10+ degrees. Body condition improving.'
      },
      {
        number: 3,
        name: 'Functional Optimization',
        weekRange: 'Weeks 8-16',
        phaseFraction: [0.50, 1.0],
        goal: 'Maximize joint function within OA limits. Build endurance. Challenge dynamic stability. Optimize body composition.',
        exercises: [
          { code: 'SIT_STAND',        sets: '5-10 reps x 2-3 sets',   frequency: '2x/day',     progression: 'Slow tempo, incline surface' },
          { code: 'DOWN_STAND',       sets: '5-8 reps x 2 sets',      frequency: '1-2x/day',   progression: 'Add surface difficulty' },
          { code: 'SLOW_WALK',        sets: '5-15 min',               frequency: '2-4x/day',   progression: 'Increase duration 10-15% weekly' },
          { code: 'SIDE_STEP',        sets: '5-10 steps each dir x 3', frequency: '1x/day',    progression: 'Increase reps, add resistance band' },
          { code: 'HILL_CLIMB',       sets: '5-10 min',               frequency: '1-2x/day',   progression: 'Steeper incline, longer duration' },
          { code: 'CAVALETTI_RAILS',  sets: '3-5 passes x 2 sets',    frequency: '1-2x/day',   progression: 'Raise height incrementally' },
          { code: 'POLE_WEAVE',       sets: '3-5 passes x 2',         frequency: '1x/day',     progression: 'Tighter spacing, faster pace' },
          { code: 'PLATFORM_TRANS',   sets: '5-10 reps x 2',          frequency: '1x/day',     progression: 'Higher platform' },
          { code: 'SLOW_PIVOT',       sets: '5-10 pivots each dir',   frequency: '1x/day',     progression: 'Smaller platform' },
          { code: 'WOBBLE_BOARD',     sets: '30-60 sec x 3-5',        frequency: '1-2x/day',   progression: 'Decrease base of support' },
          { code: 'BALANCE_PAD',      sets: '30-60 sec x 3',          frequency: '1-2x/day',   progression: 'Eyes-off (handler-directed distraction)' },
          { code: 'ROCKER_BOARD',     sets: '30 sec x 3',             frequency: '1x/day',     progression: 'Combine with weight shifts' },
          { code: 'UNDERWATER_TREAD', sets: '5-20 min',               frequency: '2-3x/week',  progression: 'Increase duration, speed, water level' },
          { code: 'POOL_SWIM',        sets: '5-15 min',               frequency: '1-3x/week',  progression: 'Increase duration, reduce flotation support' }
        ],
        contraindications: 'No high-impact repetitive activity. Avoid exercise on days following flare-ups. Reduce intensity during weather-related flares.',
        progressionCriteria: 'Consistent exercise tolerance > 20 min. Stable or improved joint ROM. Owner satisfaction with mobility. Body condition score 4-5/9.'
      },
      {
        number: 4,
        name: 'Lifelong Maintenance',
        weekRange: 'Ongoing',
        phaseFraction: [1.0, 1.5],
        goal: 'Sustain gains. Prevent deconditioning. Manage flares proactively. Support aging joint health.',
        exercises: [
          { code: 'SIT_STAND',        sets: '5-10 reps x 2-3 sets',   frequency: '2x/day',    progression: 'Slow tempo, incline surface' },
          { code: 'SLOW_WALK',        sets: '5-15 min',               frequency: '2-4x/day',  progression: 'Increase duration 10-15% weekly' },
          { code: 'FIGURE_8',         sets: '3-5 figures x 2 sets',   frequency: '1-2x/day',  progression: 'Tighten turns, vary speed' },
          { code: 'HILL_CLIMB',       sets: '5-10 min',               frequency: '1-2x/day',  progression: 'Steeper incline, longer duration' },
          { code: 'CAVALETTI_RAILS',  sets: '3-5 passes x 2 sets',    frequency: '1-2x/day',  progression: 'Raise height incrementally' },
          { code: 'WOBBLE_BOARD',     sets: '30-60 sec x 3-5',        frequency: '1-2x/day',  progression: 'Decrease base of support' },
          { code: 'FOAM_PAD_STAND',   sets: '5-10 passes',            frequency: '1-2x/day',  progression: 'Thicker/softer pads' },
          { code: 'UNDERWATER_TREAD', sets: '5-20 min',               frequency: '2-3x/week', progression: 'Increase duration, speed, water level' },
          { code: 'LASER_IV',         sets: 'Per protocol',           frequency: '2-3x/week', progression: 'Reduce frequency as healing progresses' },
          { code: 'SHOCKWAVE',        sets: '1000-2000 pulses',       frequency: 'Weekly x 3-4', progression: 'Reassess after series completion' },
          // Source-of-truth: exercise #11 is "Land Treadmill Walking/Trotting" (NOT Trot-Walk Interval)
          { code: 'LAND_TREADMILL',   sets: '5-20 min',               frequency: '1-2x/day',  progression: 'Increase speed, incline' }
        ],
        contraindications: 'Permanent avoidance of high-impact repetitive activity. Lifetime weight management. Environmental modifications (ramps, rugs, orthopedic bedding).',
        progressionCriteria: 'Ongoing. Quarterly reassessment. Adjust protocol seasonally and based on flare patterns. Owner compliance confirmed.'
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PROTOCOL 4: GERIATRIC MOBILITY DECLINE
  // Age-Related Sarcopenia, Balance Loss & Quality-of-Life Protocol
  // ═══════════════════════════════════════════════════════════════════════════
  'geriatric': {
    name: 'Geriatric Mobility Decline',
    defaultWeeks: 16,
    phases: [
      {
        number: 1,
        name: 'Assessment & Gentle Activation',
        weekRange: 'Weeks 0-4',
        phaseFraction: [0, 0.25],
        goal: 'Baseline functional assessment. Pain identification and management. Initiate gentle movement to prevent further deconditioning. Home safety evaluation.',
        exercises: [
          { code: 'PROM_STIFLE',      sets: '10-15 reps/joint',       frequency: '2-3x/day',   progression: 'Increase ROM as tolerated' },
          { code: 'PROM_HIP',         sets: '5-10 circles each dir',  frequency: '2x/day',     progression: 'Add resistance at end-range' },
          { code: 'MASSAGE_THERA',    sets: '5-10 min per area',      frequency: '1-2x/day',   progression: 'Deeper techniques as tolerated' },
          { code: 'COLD_THERAPY',     sets: '10-15 min',              frequency: '3-4x/day',   progression: 'Reduce frequency as inflammation resolves' },
          { code: 'HEAT_THERAPY',     sets: '10-15 min',              frequency: 'Before exercise', progression: 'Consistent use pre-stretching' },
          { code: 'STRETCH_HAMS',     sets: '3-5 reps, 15-30 sec hold', frequency: 'After warm-up', progression: 'Increase hold duration' },
          { code: 'STRETCH_ILIO',      sets: '3-5 reps, 15-30 sec hold', frequency: 'After warm-up', progression: 'Increase extension range' },
          { code: 'ASSISTED_STANDING', sets: '30-60 sec holds x 3-5', frequency: '3-5x/day',   progression: 'Reduce sling support' },
          { code: 'SLOW_WALK',        sets: '5-15 min',               frequency: '2-4x/day',   progression: 'Increase duration 10-15% weekly' },
          { code: 'LASER_IV',         sets: 'Per protocol',           frequency: '2-3x/week',  progression: 'Reduce frequency as healing progresses' },
          { code: 'TENS_THERAPY',     sets: '15-30 min',              frequency: 'As needed',   progression: 'Wean as pain improves' }
        ],
        contraindications: 'No high-intensity exercise. No exercise causing visible distress. No exercise on slippery surfaces. No forced movement. Monitor cardiovascular response.',
        progressionCriteria: 'Willingness to walk 5-10 min without stopping. Comfortable standing > 30 seconds. Pain manageable. No adverse cardiovascular signs.'
      },
      {
        number: 2,
        name: 'Functional Strengthening',
        weekRange: 'Weeks 4-10',
        phaseFraction: [0.25, 0.625],
        goal: 'Combat sarcopenia. Improve balance to prevent falls. Increase walking endurance. Build confidence in movement.',
        exercises: [
          { code: 'HEAT_THERAPY',     sets: '10-15 min',              frequency: 'Before exercise', progression: 'Consistent use pre-stretching' },
          { code: 'STRETCH_HAMS',     sets: '3-5 reps, 15-30 sec hold', frequency: 'After warm-up', progression: 'Increase hold duration' },
          { code: 'STRETCH_ILIO',      sets: '3-5 reps, 15-30 sec hold', frequency: 'After warm-up', progression: 'Increase extension range' },
          { code: 'WEIGHT_SHIFT',     sets: '5-10 shifts, 2-3 sec',   frequency: '2-3x/day',   progression: 'Longer holds, less handler support' },
          { code: 'THREE_LEG_STAND',  sets: '3-5 reps, 5-10 sec hold', frequency: '1-2x/day',  progression: 'Increase hold time, add surface challenge' },
          { code: 'SIT_STAND',        sets: '5-10 reps x 2-3 sets',   frequency: '2x/day',     progression: 'Slow tempo, incline surface' },
          { code: 'SLOW_WALK',        sets: '5-15 min',               frequency: '2-4x/day',   progression: 'Increase duration 10-15% weekly' },
          { code: 'BACKING_UP',       sets: '5-10 steps x 3-5 sets',  frequency: '1-2x/day',   progression: 'Increase distance, add incline' },
          { code: 'FOAM_PAD_STAND',   sets: '5-10 passes',            frequency: '1-2x/day',   progression: 'Thicker/softer pads' },
          { code: 'CAVALETTI_RAILS',  sets: '3-5 passes x 2 sets',    frequency: '1-2x/day',   progression: 'Raise height incrementally' },
          { code: 'UNDERWATER_TREAD', sets: '5-20 min',               frequency: '2-3x/week',  progression: 'Increase duration, speed, water level' },
          { code: 'LASER_IV',         sets: 'Per protocol',           frequency: '2-3x/week',  progression: 'Reduce frequency as healing progresses' }
        ],
        contraindications: 'No exercise causing post-activity lethargy > 4 hours. No unstable surfaces without handler support. No stairs without assistance.',
        progressionCriteria: 'Walking endurance > 15 min. Sit-to-stand independently from flat surface. Standing balance > 45 sec. Improved muscle tone on palpation.'
      },
      {
        number: 3,
        name: 'Balance & Independence',
        weekRange: 'Weeks 10-16',
        phaseFraction: [0.625, 1.0],
        goal: 'Maximize functional independence. Prevent falls. Improve quality of daily activities (eating, toileting, stairs).',
        exercises: [
          { code: 'SIT_STAND',        sets: '5-10 reps x 2-3 sets',   frequency: '2x/day',     progression: 'Slow tempo, incline surface' },
          { code: 'DOWN_STAND',       sets: '5-8 reps x 2 sets',      frequency: '1-2x/day',   progression: 'Add surface difficulty' },
          { code: 'SLOW_WALK',        sets: '5-15 min',               frequency: '2-4x/day',   progression: 'Increase duration 10-15% weekly' },
          { code: 'FIGURE_8',         sets: '3-5 figures x 2 sets',   frequency: '1-2x/day',   progression: 'Tighten turns, vary speed' },
          { code: 'BACKING_UP',       sets: '5-10 steps x 3-5 sets',  frequency: '1-2x/day',   progression: 'Increase distance, add incline' },
          { code: 'HILL_CLIMB',       sets: '5-10 min',               frequency: '1-2x/day',   progression: 'Steeper incline, longer duration' },
          { code: 'CAVALETTI_RAILS',  sets: '3-5 passes x 2 sets',    frequency: '1-2x/day',   progression: 'Raise height incrementally' },
          { code: 'LADDER_WALK',      sets: '3-5 passes',             frequency: '1x/day',     progression: 'Vary rung spacing' },
          { code: 'WOBBLE_BOARD',     sets: '30-60 sec x 3-5',        frequency: '1-2x/day',   progression: 'Decrease base of support' },
          { code: 'FOAM_PAD_STAND',   sets: '5-10 passes',            frequency: '1-2x/day',   progression: 'Thicker/softer pads' },
          { code: 'TRAMPOLINE_STAND', sets: '20-45 sec x 3',          frequency: '1x/day',     progression: 'Handler-induced gentle bounce' },
          { code: 'UNDERWATER_TREAD', sets: '5-20 min',               frequency: '2-3x/week',  progression: 'Increase duration, speed, water level' },
          { code: 'WATER_WALKING',    sets: '5-10 min',               frequency: '2-3x/week',  progression: 'Deeper water for more resistance' }
        ],
        contraindications: 'Avoid fatigue. No exercises causing confusion or anxiety. Reduce program on days with cognitive decline symptoms. Keep sessions < 20 min.',
        progressionCriteria: 'Independent toileting posture. Able to navigate home environment without assistance. Falls reduced by > 50%. Owner reports improved quality of life.'
      },
      {
        number: 4,
        name: 'Lifelong Quality of Life Maintenance',
        weekRange: 'Ongoing',
        phaseFraction: [1.0, 1.5],
        goal: 'Sustain functional capacity as long as possible. Adapt program to declining capacity. Support owner in end-of-life quality decisions.',
        exercises: [
          // Source-of-truth: canine_rehab_protocols.docx — Geriatric Phase 4 (9 exercises)
          { code: 'MASSAGE_THERA',    sets: '5-10 min per area',      frequency: '1-2x/day',   progression: 'Deeper techniques as tolerated' },
          { code: 'HEAT_THERAPY',     sets: '10-15 min',              frequency: 'Before exercise', progression: 'Consistent use pre-stretching' },
          { code: 'STRETCH_HAMS',     sets: '3-5 reps, 15-30 sec hold', frequency: 'After warm-up', progression: 'Increase hold duration' },
          { code: 'SIT_STAND',        sets: '5-10 reps x 2-3 sets',   frequency: '2x/day',     progression: 'Slow tempo, incline surface' },
          { code: 'SLOW_WALK',        sets: '5-15 min',               frequency: '2-4x/day',   progression: 'Increase duration 10-15% weekly' },
          { code: 'FOAM_PAD_STAND',   sets: '5-10 passes',            frequency: '1-2x/day',   progression: 'Thicker/softer pads' },
          { code: 'CAVALETTI_RAILS',  sets: '3-5 passes x 2 sets',    frequency: '1-2x/day',   progression: 'Raise height incrementally' },
          { code: 'UNDERWATER_TREAD', sets: '5-20 min',               frequency: '2-3x/week',  progression: 'Increase duration, speed, water level' },
          { code: 'LASER_IV',         sets: 'Per protocol',           frequency: '2-3x/week',  progression: 'Reduce frequency as healing progresses' }
        ],
        contraindications: 'Adapt continuously. Reduce volume and intensity as capacity declines. Prioritize comfort over performance. Eliminate any exercise no longer tolerated.',
        progressionCriteria: 'Ongoing quality-of-life assessment. Monthly reassessment with owner. Adjust program downward gracefully. Transition to comfort-focused care when appropriate.'
      }
    ]
  }
};


// ============================================================================
// CONDITION CATEGORY ROUTING
// Maps frontend diagnosis values to one of the 4 protocol types
// ============================================================================
function getProtocolType(diagnosis, affectedRegion, treatmentApproach) {
  const d = (diagnosis || '').toLowerCase();
  const r = (affectedRegion || '').toLowerCase();
  const t = (treatmentApproach || '').toLowerCase();

  // ── PALLIATIVE → GERIATRIC PROTOCOL ──
  // If clinician selects palliative approach, route to geriatric/comfort protocol
  // regardless of diagnosis (palliative intent overrides condition-based routing)
  if (t === 'palliative') {
    return 'geriatric';
  }

  // ── AMPUTATION → GERIATRIC (compensatory balance, QoL-focused) ──
  // Source-of-truth: Amputation rehab is compensatory — strengthen remaining
  // limbs, core stability, balance. Geriatric protocol Phase 2-3 is best fit.
  if (d.includes('amputation')) {
    return 'geriatric';
  }

  // ── TPLO / STIFLE POST-SURGICAL ──
  // Source-of-truth: Protocol 1 is TPLO-specific (stifle joint recovery)
  // Only stifle/knee conditions route here — NOT hip, fractures, or polytrauma
  if (d.includes('tplo') || d.includes('tta') ||
      d.includes('ccl') || d.includes('lateral suture') ||
      d.includes('meniscal') || d.includes('patella') ||
      d.includes('stifle') ||
      r.includes('stifle') || r.includes('knee')) {
    return 'tplo';
  }

  // ── HIP SURGICAL (FHO, THR) → OA PROTOCOL ──
  // Source-of-truth: FHO/THR are hip surgeries, not stifle. OA protocol
  // includes PROM_HIP, hip-focused exercises, and multimodal pain management.
  if (d.includes('fho') || /\bthr\b/.test(d) || d.includes('total hip') ||
      d.includes('hip luxation') || d.includes('legg') || d.includes('perthes')) {
    return 'oa';
  }

  // ── IVDD / SPINE / NEUROLOGICAL ──
  if (d.includes('ivdd') || d.includes('fce') ||
      d.includes('myelopathy') || d.includes('degenerative m') ||
      d.includes('lumbosacral') || d.includes('cauda equina') ||
      d.includes('spondylomyelopathy') || d.includes('wobbler') ||
      d.includes('vestibular') || d.includes('neuropathy') ||
      d.includes('spinal') ||
      r.includes('spine') || r.includes('cervical') ||
      r.includes('thoracolumbar') || r.includes('lumbosacral')) {
    return 'ivdd';
  }

  // ── GERIATRIC / PALLIATIVE ──
  if (d.includes('geriatric') || d.includes('palliative') ||
      d.includes('comfort') || d.includes('immune-mediated') ||
      d.includes('sarcopenia') || d.includes('cognitive') ||
      d.includes('age-related') || d.includes('mobility decline') ||
      d.includes('senior') || d.includes('aging')) {
    return 'geriatric';
  }

  // ── OA / EVERYTHING ELSE ──
  // Hip dysplasia, elbow dysplasia, OA, obesity, soft tissue, fractures,
  // polytrauma, forelimb conditions all use the OA multimodal protocol.
  // Source-of-truth: Fractures and polytrauma are general orthopedic —
  // they need multimodal pain management + progressive weight bearing,
  // NOT stifle-specific TPLO rehab.
  return 'oa';
}


// ============================================================================
// PHASE DETERMINATION
// Maps week number to the correct phase based on protocol-specific timelines
// ============================================================================
function getPhaseForWeek(weekNum, totalWeeks, protocolType) {
  const protocol = PROTOCOL_DEFINITIONS[protocolType];
  if (!protocol) return 0;

  const progress = weekNum / totalWeeks;

  for (let i = protocol.phases.length - 1; i >= 0; i--) {
    if (progress >= protocol.phases[i].phaseFraction[0]) {
      return i;
    }
  }
  return 0;
}


// ============================================================================
// EXERCISE SELECTION FOR EACH WEEK
// Returns ALL exercises for the current phase (per clinical protocol)
// Each patient gets the complete phase prescription, not a rotating subset
// ============================================================================
// ============================================================================
// INTAKE VALIDATION
// Ensures required fields are present before protocol generation
// ============================================================================
function validateIntake(formData) {
  const errors = [];
  const warnings = [];

  // Required fields
  if (!formData.diagnosis)          errors.push('Diagnosis is required');
  if (!formData.affectedRegion)     errors.push('Affected region is required');
  if (!formData.patientName)        errors.push('Patient name is required');
  if (!formData.treatmentApproach)  errors.push('Treatment approach is required (Surgical, Conservative, or Palliative)');

  // Pain score — WARNING at >= 8, auto-route to palliative/comfort protocol
  // Source-of-truth: High-pain patients still need care — passive ROM, modalities,
  // pain management. Blocking entirely leaves the clinician with no protocol.
  const painScore = parseInt(formData.painScore || formData.painLevel, 10);
  if (!isNaN(painScore) && painScore >= 8) {
    warnings.push(`Pain score ${painScore}/10 is severe. Protocol will auto-route to palliative/comfort care with passive exercises and pain management modalities only. Stabilize pain before advancing to active rehabilitation phases.`);
    // Flag for generator to restrict to Phase 1 passive exercises
    formData._highPainOverride = true;
  }

  // ── CLINICAL GRADING SCALE VALIDATION ──
  // MMT (Manual Muscle Testing) 0-5: influences exercise intensity
  const mmtGrade = parseInt(formData.mmtGrade, 10);
  if (!isNaN(mmtGrade) && mmtGrade <= 1) {
    warnings.push(`MMT Grade ${mmtGrade}/5: Severe muscle weakness (${mmtGrade === 0 ? 'paralysis' : 'trace contraction only'}). Protocol will restrict to passive ROM, NMES, and assisted standing only.`);
    formData._severeWeakness = true;
  } else if (!isNaN(mmtGrade) && mmtGrade === 2) {
    warnings.push('MMT Grade 2/5: Movement only with gravity eliminated. Protocol will emphasize active-assisted exercises and NMES.');
  }

  // IVDD Hansen Grade I-V: severity-based phase restriction
  const ivddGrade = (formData.ivddGrade || '').toUpperCase();
  if (ivddGrade === 'IV' || ivddGrade === 'V') {
    warnings.push(`IVDD Grade ${ivddGrade}: ${ivddGrade === 'V' ? 'Paraplegia with absent deep pain — guarded prognosis' : 'Non-ambulatory paraplegia — deep pain intact'}. Protocol restricted to Phase 1 neurological support until improvement confirmed.`);
    formData._ivddSevere = true;
  } else if (ivddGrade === 'III') {
    warnings.push('IVDD Grade III: Non-ambulatory paraparesis. Begin neuromotor re-education. Monitor for deterioration.');
  }

  // OA Kellgren-Lawrence 0-4: influences exercise selection intensity
  const oaStage = parseInt(formData.oaStage, 10);
  if (!isNaN(oaStage) && oaStage >= 4) {
    warnings.push('OA Kellgren-Lawrence Grade 4 (severe): Large osteophytes, marked joint space narrowing. Protocol will favor low-impact and aquatic exercises. Avoid impact loading.');
    formData._severeOA = true;
  } else if (!isNaN(oaStage) && oaStage === 3) {
    warnings.push('OA Kellgren-Lawrence Grade 3 (moderate): Definite joint space narrowing. Aquatic therapy recommended. Avoid high-impact activities.');
  }

  // RED-FLAG: Neurological deficit detection
  const neuroFields = [formData.neuroProprioception, formData.neuroWithdrawal, formData.neuroDeepPain, formData.neuroMotorGrade];
  const neuroText = neuroFields.filter(Boolean).join(' ').toLowerCase();
  if (neuroText.includes('absent') || neuroText.includes('none') || neuroText.includes('0/5') || neuroText.includes('grade 0')) {
    warnings.push('RED FLAG: Absent neurological function detected. Verify deep pain perception and motor grade before initiating weight-bearing exercises.');
  }
  if (formData.neuroDeepPain && formData.neuroDeepPain.toLowerCase().includes('absent')) {
    errors.push('Deep pain perception absent. Protocol generation blocked. Immediate veterinary neurological evaluation required.');
  }

  // RED-FLAG: Post-op complication detection
  const incision = (formData.incisionStatus || '').toLowerCase();
  if (incision.includes('dehisc') || incision.includes('infected') || incision.includes('open') || incision.includes('draining')) {
    errors.push(`Post-operative complication detected (incision: ${formData.incisionStatus}). Resolve surgical site issue before initiating rehabilitation.`);
  }

  // RED-FLAG: Post-op timing
  if (formData.surgeryDate && formData.treatmentApproach === 'surgical') {
    const daysSinceOp = Math.floor((Date.now() - new Date(formData.surgeryDate).getTime()) / 86400000);
    if (daysSinceOp < 0) {
      warnings.push('Surgery date is in the future. Protocol will generate for pre-surgical planning.');
    }
  }

  // RED-FLAG: Lameness severity
  const lameness = parseInt(formData.lamenessGrade, 10);
  if (!isNaN(lameness) && lameness >= 5) {
    warnings.push('Lameness grade 5 (non-weight-bearing). Protocol will restrict to passive and non-weight-bearing exercises only.');
  }

  // RED-FLAG: Complication keywords in medical history
  const historyText = (formData.medicalHistory || '').toLowerCase() + ' ' + (formData.complicationsNoted || '').toLowerCase();
  const flagKeywords = ['seroma', 'implant failure', 'implant migration', 'non-union', 'osteomyelitis', 'septic'];
  for (const kw of flagKeywords) {
    if (historyText.includes(kw)) {
      warnings.push(`RED FLAG: "${kw}" noted in history. Verify complication is resolved before advancing weight-bearing phases.`);
      break;
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}


// ============================================================================
// CONTRAINDICATION ENFORCEMENT
// Cross-checks patient conditions against exercise-level contraindications
// ============================================================================
const CONTRAINDICATION_MAP = {
  // Patient condition keywords → exercise codes to EXCLUDE
  // Codes aligned to PROTOCOL_DEFINITIONS exercise codes
  // Source-of-truth: canine_rehab_protocols.docx contraindication sections
  'cardiac':       ['UNDERWATER_TREAD', 'POOL_SWIM', 'WATER_WALKING', 'WATER_RETRIEVE', 'SLOW_TROT', 'STAIR_CLIMB', 'HILL_CLIMB'],
  'heart':         ['UNDERWATER_TREAD', 'POOL_SWIM', 'WATER_WALKING', 'WATER_RETRIEVE', 'SLOW_TROT', 'STAIR_CLIMB', 'HILL_CLIMB'],
  'respiratory':   ['UNDERWATER_TREAD', 'POOL_SWIM', 'WATER_WALKING', 'WATER_RETRIEVE'],
  'seizure':       ['UNDERWATER_TREAD', 'POOL_SWIM', 'WATER_WALKING', 'WATER_RETRIEVE'],
  'epilepsy':      ['UNDERWATER_TREAD', 'POOL_SWIM', 'WATER_WALKING', 'WATER_RETRIEVE'],
  'open wound':    ['UNDERWATER_TREAD', 'POOL_SWIM', 'WATER_WALKING', 'WATER_RETRIEVE', 'US_PULSED'],
  'infection':     ['UNDERWATER_TREAD', 'POOL_SWIM', 'WATER_WALKING', 'WATER_RETRIEVE'],
  'neoplasia':     ['US_PULSED', 'LASER_IV'],
  'cancer':        ['US_PULSED', 'LASER_IV'],
  'tumor':         ['US_PULSED', 'LASER_IV'],
  'pregnant':      ['US_PULSED', 'NMES_QUAD', 'TENS_THERAPY', 'PEMF_THERAPY', 'SHOCKWAVE'],
  'pacemaker':     ['NMES_QUAD', 'TENS_THERAPY', 'PEMF_THERAPY', 'SHOCKWAVE'],
  'implant':       ['SHOCKWAVE', 'US_PULSED'],
  'non-ambulatory':['SLOW_TROT', 'JOG_LEASH', 'SLOW_WALK', 'CAVALETTI_RAILS', 'CAVALETTI_VAR', 'CAVALETTI_ELEV', 'CAVALETTI_WEAVE', 'STAIR_CLIMB', 'STAIR_DESCEND', 'HILL_CLIMB', 'BACKWARD_HILL', 'POLE_WEAVE', 'FIGURE_8', 'UNEVEN_TERRAIN', 'DIAGONAL_WALK', 'LAND_TREADMILL', 'FETCH_CONTROLLED', 'WEIGHT_SHIFT_CC', 'LADDER_WALK'],
  'fracture unstable': ['WEIGHT_SHIFT', 'WOBBLE_BOARD', 'WOBBLE_BOARD_ADV', 'ROCKER_BOARD', 'BALANCE_PAD', 'BOSU_STAND', 'BOSU_FRONT', 'BOSU_HIND', 'CAVALETTI_RAILS', 'CAVALETTI_VAR', 'CAVALETTI_ELEV', 'CAVALETTI_WEAVE', 'STAIR_CLIMB', 'PERTURBATION', 'PERTURBATION_ADV', 'TRAMPOLINE_STAND'],
};

// ============================================================================
// WEIGHT-BEARING STATUS EXERCISE GATES
// Maps WB status to exercise codes that MUST be excluded
// NWB/TTWB patients must NOT receive weight-bearing exercises
// ============================================================================
const WEIGHT_BEARING_EXCLUSIONS = {
  'NWB': [  // Non-weight-bearing — passive exercises + modalities ONLY
    'SIT_STAND', 'DOWN_STAND', 'SLOW_WALK', 'FIGURE_8', 'BACKING_UP',
    'SIDE_STEP', 'HILL_CLIMB', 'BACKWARD_HILL', 'STAIR_CLIMB', 'STAIR_DESCEND',
    'STEP_OVER', 'LADDER_WALK', 'CAVALETTI_RAILS', 'CAVALETTI_VAR', 'CAVALETTI_ELEV', 'CAVALETTI_WEAVE',
    'POLE_WEAVE', 'PLATFORM_TRANS',
    'SLOW_PIVOT', 'WOBBLE_BOARD', 'WOBBLE_BOARD_ADV', 'ROCKER_BOARD', 'BALANCE_PAD',
    'BOSU_STAND', 'BOSU_FRONT', 'BOSU_HIND', 'PHYSIO_BALL', 'FOAM_PAD_STAND',
    'PERTURBATION', 'PERTURBATION_ADV', 'TRAMPOLINE_STAND',
    'THREE_LEG_STAND', 'WEIGHT_SHIFT', 'WEIGHT_SHIFT_CC',
    'SLOW_TROT', 'JOG_LEASH', 'FETCH_CONTROLLED', 'DIAGONAL_WALK', 'LAND_TREADMILL',
    'UNEVEN_TERRAIN', 'UNDERWATER_TREAD', 'POOL_SWIM', 'WATER_WALKING',
    'WATER_RETRIEVE'
  ],
  'TTWB': [  // Toe-touch weight-bearing — no dynamic/high-load exercises
    'SIT_STAND', 'DOWN_STAND', 'SLOW_TROT', 'JOG_LEASH', 'FETCH_CONTROLLED',
    'STAIR_CLIMB', 'STAIR_DESCEND', 'HILL_CLIMB', 'BACKWARD_HILL',
    'CAVALETTI_RAILS', 'CAVALETTI_VAR', 'CAVALETTI_ELEV', 'CAVALETTI_WEAVE',
    'WOBBLE_BOARD', 'WOBBLE_BOARD_ADV', 'ROCKER_BOARD',
    'BOSU_STAND', 'BOSU_FRONT', 'BOSU_HIND', 'PHYSIO_BALL',
    'PERTURBATION', 'PERTURBATION_ADV', 'TRAMPOLINE_STAND',
    'THREE_LEG_STAND', 'POLE_WEAVE', 'PLATFORM_TRANS', 'POOL_SWIM',
    'WATER_RETRIEVE', 'UNEVEN_TERRAIN', 'DIAGONAL_WALK', 'LAND_TREADMILL',
    'LADDER_WALK'
  ],
  'PWB': [  // Partial weight-bearing — no high-impact/plyometric exercises
    'SLOW_TROT', 'JOG_LEASH', 'FETCH_CONTROLLED', 'STAIR_CLIMB', 'STAIR_DESCEND',
    'POOL_SWIM', 'WATER_RETRIEVE', 'PERTURBATION_ADV', 'WOBBLE_BOARD_ADV',
    'TRAMPOLINE_STAND', 'ROCKER_BOARD'
  ]
  // WBAT and FWB have no additional exclusions
};

// ============================================================================
// INCISION STATUS EXERCISE GATES
// Patients with compromised incisions must NOT enter water
// ============================================================================
const INCISION_EXCLUSIONS = {
  'Mild Swelling':   [],  // Monitor but allow most exercises
  'Seroma':          ['UNDERWATER_TREAD', 'POOL_SWIM', 'WATER_WALKING', 'WATER_RETRIEVE'],
  'Dehiscence':      ['UNDERWATER_TREAD', 'POOL_SWIM', 'WATER_WALKING', 'WATER_RETRIEVE', 'SIT_STAND', 'DOWN_STAND', 'STAIR_CLIMB'],
  'Infection':       ['UNDERWATER_TREAD', 'POOL_SWIM', 'WATER_WALKING', 'WATER_RETRIEVE'],
};

// ============================================================================
// ACTIVITY RESTRICTION EXERCISE GATES
// E-collar, crate rest, and sling assist flags gate exercise selection
// ============================================================================
const ACTIVITY_RESTRICTION_EXCLUSIONS = {
  'crateRestRequired': [  // Strict crate rest — passive + modalities ONLY
    'SIT_STAND', 'DOWN_STAND', 'SLOW_WALK', 'FIGURE_8', 'BACKING_UP',
    'SIDE_STEP', 'HILL_CLIMB', 'BACKWARD_HILL', 'STAIR_CLIMB', 'STAIR_DESCEND',
    'STEP_OVER', 'LADDER_WALK', 'CAVALETTI_RAILS', 'CAVALETTI_VAR', 'CAVALETTI_ELEV', 'CAVALETTI_WEAVE',
    'POLE_WEAVE', 'PLATFORM_TRANS',
    'SLOW_PIVOT', 'WOBBLE_BOARD', 'WOBBLE_BOARD_ADV', 'ROCKER_BOARD', 'BALANCE_PAD',
    'BOSU_STAND', 'BOSU_FRONT', 'BOSU_HIND', 'PHYSIO_BALL', 'FOAM_PAD_STAND',
    'PERTURBATION', 'PERTURBATION_ADV', 'TRAMPOLINE_STAND',
    'THREE_LEG_STAND', 'WEIGHT_SHIFT', 'WEIGHT_SHIFT_CC',
    'SLOW_TROT', 'JOG_LEASH', 'FETCH_CONTROLLED', 'DIAGONAL_WALK', 'LAND_TREADMILL',
    'UNEVEN_TERRAIN', 'UNDERWATER_TREAD', 'POOL_SWIM', 'WATER_WALKING',
    'WATER_RETRIEVE'
  ],
  'eCollarRequired': [  // E-collar limits complex proprioceptive work
    'WOBBLE_BOARD', 'WOBBLE_BOARD_ADV', 'ROCKER_BOARD',
    'BOSU_STAND', 'BOSU_FRONT', 'BOSU_HIND', 'PHYSIO_BALL',
    'PERTURBATION', 'PERTURBATION_ADV', 'TRAMPOLINE_STAND',
    'UNDERWATER_TREAD', 'POOL_SWIM', 'WATER_WALKING', 'WATER_RETRIEVE'
  ]
  // slingAssistRequired does NOT exclude exercises — it changes how they are performed
};

function getExcludedCodes(formData) {
  const excluded = new Set();

  // ── 1. CONDITION-BASED CONTRAINDICATIONS ──
  const fields = [
    formData.diagnosis || '',
    formData.medicalHistory || '',
    formData.currentMedications || '',
    formData.mobilityLevel || '',
    formData.specialInstructions || '',
  ].join(' ').toLowerCase();

  for (const [keyword, codes] of Object.entries(CONTRAINDICATION_MAP)) {
    if (fields.includes(keyword)) {
      codes.forEach(code => excluded.add(code));
    }
  }

  // ── 2. WEIGHT-BEARING STATUS GATES (SAFETY-CRITICAL) ──
  // NWB/TTWB/PWB patients must NOT receive exercises beyond their WB capacity
  const wbStatus = (formData.weightBearingStatus || '').trim();
  if (wbStatus && WEIGHT_BEARING_EXCLUSIONS[wbStatus]) {
    WEIGHT_BEARING_EXCLUSIONS[wbStatus].forEach(code => excluded.add(code));
  }

  // ── 3. INCISION STATUS GATES ──
  // Compromised incisions block aquatic + high-tension exercises
  const incision = (formData.incisionStatus || '').trim();
  if (incision && INCISION_EXCLUSIONS[incision]) {
    INCISION_EXCLUSIONS[incision].forEach(code => excluded.add(code));
  }

  // ── 4. ACTIVITY RESTRICTION GATES ──
  // E-collar and crate rest flags limit exercise scope
  if (formData.crateRestRequired === true || formData.crateRestRequired === 'true') {
    ACTIVITY_RESTRICTION_EXCLUSIONS['crateRestRequired'].forEach(code => excluded.add(code));
  }
  if (formData.eCollarRequired === true || formData.eCollarRequired === 'true') {
    ACTIVITY_RESTRICTION_EXCLUSIONS['eCollarRequired'].forEach(code => excluded.add(code));
  }

  // ── 5. LAMENESS GRADE 5 (non-weight-bearing lameness) ──
  // Supplement NWB exclusions if lameness grade indicates no weight bearing
  const lameness = parseInt(formData.lamenessGrade, 10);
  if (!isNaN(lameness) && lameness >= 5 && !wbStatus) {
    // If no explicit WB status set but lameness is grade 5, apply NWB gates
    WEIGHT_BEARING_EXCLUSIONS['NWB'].forEach(code => excluded.add(code));
  }

  // ── 6. SEVERE OA (Kellgren-Lawrence Grade 4) ──
  // Exclude high-impact exercises for severe OA joints
  if (formData._severeOA) {
    ['STAIR_CLIMB', 'STAIR_DESCEND', 'SLOW_TROT', 'JOG_LEASH', 'HILL_CLIMB',
     'BACKWARD_HILL', 'PERTURBATION_ADV', 'TRAMPOLINE_STAND', 'WATER_RETRIEVE'].forEach(code => excluded.add(code));
  }

  // ── 7. SEVERE MUSCLE WEAKNESS (MMT 0-1) ──
  // Only passive exercises + NMES + assisted standing allowed
  if (formData._severeWeakness) {
    WEIGHT_BEARING_EXCLUSIONS['NWB'].forEach(code => excluded.add(code));
  }

  return excluded;
}


// ============================================================================
// EVIDENCE CITATION MAP
// Maps exercise codes to primary evidence references
// ============================================================================
const EVIDENCE_MAP = {
  // ── Passive / Manual Therapy ──
  'PROM_STIFLE':      'Millis & Levine, Ch. 9 — Therapeutic Exercises',
  'PROM_STIFLE_SPEC': 'Millis & Levine, Ch. 14 — Stifle Joint; Targeted PROM for Post-CCL Repair',
  'PROM_HIP':         'Millis & Levine, Ch. 9 — Range of Motion',
  'JOINT_MOB_G1':     'Millis & Levine, Ch. 10 — Joint Mobilization',
  'MASSAGE_THERA':    'Millis & Levine, Ch. 11 — Massage & Manual Therapy',
  'COLD_THERAPY':     'Millis & Levine, Ch. 6 — Cryotherapy',
  'HEAT_THERAPY':     'Millis & Levine, Ch. 6 — Superficial Thermal Agents',
  'STRETCH_HAMS':     'Millis & Levine, Ch. 9 — Stretching & Flexibility',
  'MYOFASC_ILIO':     'Millis & Levine, Ch. 11 — Myofascial Release',
  'STRETCH_ILIO':     'Millis & Levine, Ch. 17 — Range of Motion & Stretching; Passive Iliopsoas Extension',
  // ── Weight Bearing / Static ──
  'ASSISTED_STANDING':'Millis & Levine, Ch. 9 — Weight Bearing Exercises',
  'WEIGHT_SHIFT':     'Millis & Levine, Ch. 9 — Active Exercises',
  'WEIGHT_SHIFT_CC':  'Millis & Levine, Ch. 16 — Therapeutic Exercises; Cranial/Caudal Weight Shifting',
  'THREE_LEG_STAND':  'Millis & Levine, Ch. 9 — Single-Limb Loading',
  'PERTURBATION':     'Millis & Levine, Ch. 9 — Proprioception; Zink & Van Dyke 2013',
  'PERTURBATION_ADV': 'Millis & Levine, Ch. 9 — Advanced Proprioception',
  // ── Active Therapeutic Exercises ──
  'SIT_STAND':        'Millis & Levine, Ch. 9 — Strengthening; Zink & Van Dyke 2013',
  'DOWN_STAND':       'Millis & Levine, Ch. 9 — Eccentric Strengthening',
  'SLOW_WALK':        'Millis & Levine, Ch. 9 — Controlled Gait Training',
  'FIGURE_8':         'Millis & Levine, Ch. 9 — Weight Shifting During Gait',
  'BACKING_UP':       'Millis & Levine, Ch. 9 — Hind Limb Proprioception',
  'SIDE_STEP':        'Millis & Levine, Ch. 9 — Adductor/Abductor Strengthening',
  'HILL_CLIMB':       'Millis & Levine, Ch. 9 — Incline Training',
  'BACKWARD_HILL':    'Millis & Levine, Ch. 9 — Eccentric Quad Control',
  'STAIR_CLIMB':      'Millis & Levine, Ch. 9 — Functional Exercises',
  'STEP_OVER':        'Millis & Levine, Ch. 9 — Spatial Awareness',
  'LADDER_WALK':      'Millis & Levine, Ch. 9 — Sequential Foot Placement & Proprioception',
  'TRAMPOLINE_STAND': 'Millis & Levine, Ch. 9 — Unstable Surface Proprioception; Zink & Van Dyke 2013',
  'UNEVEN_TERRAIN':   'Millis & Levine, Ch. 9 — Cross-Body Coordination',
  // ── Balance & Proprioception ──
  'WOBBLE_BOARD':     'Millis & Levine, Ch. 9 — Proprioception',
  'WOBBLE_BOARD_ADV': 'Millis & Levine, Ch. 9 — Advanced Proprioception',
  'ROCKER_BOARD':     'Millis & Levine, Ch. 9 — Uni-Planar Balance Challenge',
  'BALANCE_PAD':      'Millis & Levine, Ch. 9 — Multi-Plane Instability',
  'BOSU_STAND':       'Millis & Levine, Ch. 9 — Front/Hind Limb Proprioception',
  'BOSU_FRONT':       'Millis & Levine, Ch. 9 — Forelimb Proprioception & Scapular Stabilization',
  'BOSU_HIND':        'Millis & Levine, Ch. 9 — Hindlimb Proprioception & Pelvic Stabilization',
  'PHYSIO_BALL':      'Millis & Levine, Ch. 9 — Core Activation & Spinal Stabilization',
  'FOAM_PAD_STAND':   'Millis & Levine, Ch. 9 — Surface Proprioception',
  // ── Cavaletti & Obstacle Work ──
  'CAVALETTI_RAILS':  'Millis & Levine, Ch. 9 — Gait Training; Holler et al. 2010',
  'CAVALETTI_VAR':    'Millis & Levine, Ch. 9 — Advanced Cavaletti Progressions',
  'CAVALETTI_ELEV':   'Millis & Levine, Ch. 9 — Elevated Cavaletti for ROM & Strengthening; Holler et al. 2010',
  'CAVALETTI_WEAVE':  'Millis & Levine, Ch. 9 — Cavaletti Weave Pattern for Lateral Weight Shifting',
  'POLE_WEAVE':       'Millis & Levine, Ch. 9 — Lateral Weight Shifting',
  'PLATFORM_TRANS':   'Millis & Levine, Ch. 9 — Concentric Hind Limb Strengthening',
  'SLOW_PIVOT':       'Millis & Levine, Ch. 9 — Hip Engagement & Active ROM',
  // ── Aquatic Therapy ──
  'UNDERWATER_TREAD': 'Millis & Levine, Ch. 15 — Aquatic Therapy; Monk et al. 2006',
  'POOL_SWIM':        'Millis & Levine, Ch. 15 — Aquatic Therapy',
  'WATER_WALKING':    'Millis & Levine, Ch. 15 — Aquatic Therapy',
  'WATER_RETRIEVE':   'Millis & Levine, Ch. 15 — Aquatic Retrieval Training',
  // ── Modalities ──
  'LASER_IV':         'Millis & Levine, Ch. 8 — Photobiomodulation; Pryor & Millis 2015',
  'NMES_QUAD':        'Millis & Levine, Ch. 12 — Electrical Stimulation; Johnson et al. 1997',
  'PEMF_THERAPY':     'Millis & Levine, Ch. 13 — Electromagnetic Therapy',
  'TENS_THERAPY':     'Millis & Levine, Ch. 12 — TENS; Levine & Bockstahler 2014',
  'US_PULSED':        'Millis & Levine, Ch. 7 — Therapeutic Ultrasound',
  'SHOCKWAVE':        'Millis & Levine, Ch. 14 — Extracorporeal Shockwave',
  // ── Advanced / Return-to-Function ──
  'SLOW_TROT':        'Millis & Levine, Ch. 9 — Cardiovascular Fitness & Gait Endurance',
  'STAIR_DESCEND':    'Millis & Levine, Ch. 9 — Eccentric Strengthening; Functional Exercises',
  'DIAGONAL_WALK':    'Millis & Levine, Ch. 9 — Cross-Body Coordination & Core Engagement',
  'JOG_LEASH':        'Millis & Levine, Ch. 9 — Return-to-Function Conditioning; Zink & Van Dyke 2013',
  'LAND_TREADMILL':   'Millis & Levine, Ch. 9 — Controlled Gait Training; Treadmill Conditioning',
  'FETCH_CONTROLLED': 'Millis & Levine, Ch. 9 — Sprint Acceleration/Deceleration; Return-to-Function',
  'PROM_STIFLE_SPEC': 'Millis & Levine, Ch. 9 — Stifle-Specific Passive ROM; Post-TPLO Recovery',
  'WEIGHT_SHIFT_CC':  'Millis & Levine, Ch. 9 — Cranial/Caudal Weight Loading; Active Exercises',
};


// ============================================================================
// EXERCISE SELECTION FOR EACH WEEK
// Returns ALL exercises for the current phase (per clinical protocol)
// Each patient gets the complete phase prescription, not a rotating subset
// Includes: equipment gating, contraindication enforcement, evidence citations
// ============================================================================
function selectExercisesForWeek(weekNum, totalWeeks, allExercises, formData) {
  // High-pain override: force palliative routing + Phase 1 only
  const effectiveApproach = formData._highPainOverride ? 'palliative' : formData.treatmentApproach;

  const protocolType = getProtocolType(
    formData.diagnosis,
    formData.affectedRegion,
    effectiveApproach
  );

  const protocol = PROTOCOL_DEFINITIONS[protocolType];
  if (!protocol) return [];

  // Phase locking for severe clinical flags:
  // - High pain (>=8): Phase 1 only (passive + pain management)
  // - IVDD Grade IV/V: Phase 1 only (neurological support until improvement)
  // - MMT Grade 0-1: Phase 1 only (passive ROM, NMES, assisted standing)
  const phaseLocked = formData._highPainOverride || formData._ivddSevere || formData._severeWeakness;
  let phaseIndex = phaseLocked ? 0 : getPhaseForWeek(weekNum, totalWeeks, protocolType);
  const phase = protocol.phases[phaseIndex];
  if (!phase) return [];

  // Build exercise lookup from database
  const exercisesByCode = {};
  allExercises.forEach(ex => { exercisesByCode[ex.code] = ex; });

  // Gate aquatic exercises by clinic availability (aquaticAccess OR modalityUWTM)
  const hasAquatic = formData.aquaticAccess === true || formData.aquaticAccess === 'true'
    || formData.modalityUWTM === true || formData.modalityUWTM === 'true';
  const aquaticCodes = new Set(['UNDERWATER_TREAD', 'POOL_SWIM', 'WATER_WALKING', 'WATER_RETRIEVE']);

  // Gate modality exercises by clinic equipment
  const modalityGates = {
    'LASER_IV':      formData.modalityLaser,
    'TENS_THERAPY':  formData.modalityTENS,
    'NMES_QUAD':     formData.modalityNMES,
    'US_PULSED':     formData.modalityTherapeuticUS,
    'US_CONTINUOUS': formData.modalityTherapeuticUS,
    'PEMF_THERAPY':  formData.modalityPulsedEMF,
    'SHOCKWAVE':     formData.modalityShockwave,
    'COLD_THERAPY':  formData.modalityCryotherapy,
    'HEAT_THERAPY':  formData.modalityHeatTherapy
  };

  // CONTRAINDICATION ENFORCEMENT — cross-check patient conditions
  const excludedCodes = getExcludedCodes(formData);

  // Select exercises for this phase
  const selectedExercises = [];

  for (const rx of phase.exercises) {
    // Skip aquatic if clinic doesn't have it
    if (aquaticCodes.has(rx.code) && !hasAquatic) continue;

    // Skip modalities the clinic doesn't have
    if (modalityGates[rx.code] !== undefined) {
      const hasModality = modalityGates[rx.code] === true || modalityGates[rx.code] === 'true';
      if (!hasModality) continue;
    }

    // CONTRAINDICATION CHECK — skip exercises contraindicated for this patient
    if (excludedCodes.has(rx.code)) continue;

    // Look up exercise in database
    const dbExercise = exercisesByCode[rx.code];
    if (!dbExercise) continue;

    selectedExercises.push({
      code: dbExercise.code,
      name: dbExercise.name,
      category: dbExercise.category,
      description: dbExercise.description,
      sets: rx.sets,
      reps: parseReps(rx.sets),  // Parsed reps count from prescription
      frequency: rx.frequency,
      duration_minutes: parseDuration(rx.sets),
      progression: rx.progression,
      equipment: dbExercise.equipment,
      setup: dbExercise.setup,
      steps: dbExercise.steps,
      good_form: dbExercise.good_form,
      common_mistakes: dbExercise.common_mistakes,
      red_flags: dbExercise.red_flags,
      contraindications: dbExercise.contraindications,
      difficulty_level: dbExercise.difficulty_level,
      notes: dbExercise.notes || null,
      // EVIDENCE CITATION — attach reference per exercise
      evidence_citation: EVIDENCE_MAP[rx.code] || 'Millis & Levine, Canine Rehabilitation and Physical Therapy',
    });
  }

  // ── PHASE FALLBACK ──
  // If all exercises in the current phase were excluded (e.g., NWB patient in
  // Phase 3 where all exercises are active), fall back to the highest earlier
  // phase that still produces exercises. This ensures no empty weeks.
  if (selectedExercises.length === 0 && phaseIndex > 0) {
    for (let fallbackIdx = phaseIndex - 1; fallbackIdx >= 0; fallbackIdx--) {
      const fallbackPhase = protocol.phases[fallbackIdx];
      if (!fallbackPhase) continue;

      const fallbackExercises = [];
      for (const rx of fallbackPhase.exercises) {
        if (aquaticCodes.has(rx.code) && !hasAquatic) continue;
        if (modalityGates[rx.code] !== undefined) {
          const hasModality = modalityGates[rx.code] === true || modalityGates[rx.code] === 'true';
          if (!hasModality) continue;
        }
        if (excludedCodes.has(rx.code)) continue;
        const dbExercise = exercisesByCode[rx.code];
        if (!dbExercise) continue;

        fallbackExercises.push({
          code: dbExercise.code, name: dbExercise.name, category: dbExercise.category,
          description: dbExercise.description, sets: rx.sets, reps: parseReps(rx.sets),
          frequency: rx.frequency, duration_minutes: parseDuration(rx.sets),
          progression: rx.progression, equipment: dbExercise.equipment, setup: dbExercise.setup,
          steps: dbExercise.steps, good_form: dbExercise.good_form,
          common_mistakes: dbExercise.common_mistakes, red_flags: dbExercise.red_flags,
          contraindications: dbExercise.contraindications, difficulty_level: dbExercise.difficulty_level,
          notes: dbExercise.notes || null,
          evidence_citation: EVIDENCE_MAP[rx.code] || 'Millis & Levine, Canine Rehabilitation and Physical Therapy',
        });
      }

      if (fallbackExercises.length > 0) {
        // Use fallback exercises with note about restriction
        fallbackExercises.forEach(ex => selectedExercises.push(ex));
        // Override phase info to indicate fallback
        phaseIndex = fallbackIdx;
        break;
      }
    }
  }

  // Attach phase metadata to first exercise for frontend display
  const displayPhase = protocol.phases[phaseIndex];
  if (selectedExercises.length > 0 && displayPhase) {
    selectedExercises[0]._phaseInfo = {
      number: displayPhase.number,
      name: displayPhase.name,
      goal: displayPhase.goal,
      contraindications: displayPhase.contraindications,
      progressionCriteria: displayPhase.progressionCriteria
    };
  }

  return selectedExercises;
}


// ============================================================================
// HELPERS
// ============================================================================

// Parse duration from sets string (e.g., "10-15 min" → 12, "5-10 reps x 2" → 10)
function parseDuration(setsStr) {
  if (!setsStr) return 10;
  const minMatch = setsStr.match(/(\d+)-?(\d+)?\s*min/);
  if (minMatch) {
    return minMatch[2] ? Math.round((parseInt(minMatch[1]) + parseInt(minMatch[2])) / 2) : parseInt(minMatch[1]);
  }
  const secMatch = setsStr.match(/(\d+)-?(\d+)?\s*sec/);
  if (secMatch) {
    const secs = secMatch[2] ? Math.round((parseInt(secMatch[1]) + parseInt(secMatch[2])) / 2) : parseInt(secMatch[1]);
    return Math.max(Math.round(secs / 60), 1);
  }
  return 10;
}

// Parse reps count from prescription string (e.g. "10-15 reps/joint" → "10-15")
function parseReps(setsStr) {
  if (!setsStr) return null;
  // Match "X-Y reps" or "X reps"
  const repMatch = setsStr.match(/(\d+)(?:-(\d+))?\s*reps/i);
  if (repMatch) return repMatch[2] ? `${repMatch[1]}-${repMatch[2]}` : repMatch[1];
  // Match "X-Y circles/passes/steps/laps"
  const countMatch = setsStr.match(/(\d+)(?:-(\d+))?\s*(circles|passes|steps|laps|times)/i);
  if (countMatch) return countMatch[2] ? `${countMatch[1]}-${countMatch[2]}` : countMatch[1];
  // Match "X-Y x N sets" pattern — reps is the first number group
  const sxrMatch = setsStr.match(/^(\d+)(?:-(\d+))?\s*x\s*\d+/i);
  if (sxrMatch) return sxrMatch[2] ? `${sxrMatch[1]}-${sxrMatch[2]}` : sxrMatch[1];
  // Duration-based (min/sec) — no reps applicable
  if (/\d+\s*(min|sec|minutes|seconds)/i.test(setsStr)) return null;
  return null;
}


// ============================================================================
// EXPORTS
// ============================================================================
module.exports = {
  selectExercisesForWeek,
  getProtocolType,
  getPhaseForWeek,
  validateIntake,
  getExcludedCodes,
  PROTOCOL_DEFINITIONS,
  EVIDENCE_MAP,
  parseReps
};
