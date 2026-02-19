// ============================================================================
// CANINE REHABILITATION PROTOCOL SYSTEM
// Full Hybrid Exercise Library Edition — Board-Certified Specialty Standard
// ACVSMR-Aligned Clinical Protocols
// 4 Conditions | 16 Phases | 55 Exercises | Full Modality Integration
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
          { code: 'CAVALETTI_VAR',   sets: '3-5 passes x 2 sets',   frequency: '1x/day',     progression: 'Vary spacing' },
          { code: 'PLATFORM_TRANS',  sets: '5-10 reps x 2',         frequency: '1x/day',     progression: 'Higher platform' },
          { code: 'SLOW_PIVOT',      sets: '5-10 pivots each dir',  frequency: '1x/day',     progression: 'Smaller platform' },
          { code: 'WOBBLE_BOARD',    sets: '30-60 sec x 3-5',       frequency: '1-2x/day',   progression: 'Decrease base of support' },
          { code: 'BALANCE_PAD',     sets: '30-60 sec x 3',         frequency: '1-2x/day',   progression: 'Eyes-off (handler-directed distraction)' },
          { code: 'BOSU_STAND',      sets: '20-45 sec x 3',         frequency: '1x/day',     progression: 'Add perturbation' },
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
          { code: 'STAIR_CLIMB',      sets: '3-5 flights x 2',       frequency: '1x/day',     progression: 'Increase flights' },
          { code: 'STEP_OVER',        sets: '3-5 passes',            frequency: '1x/day',     progression: 'Curved path, speed variation' },
          { code: 'POLE_WEAVE',       sets: '3-5 passes x 2',        frequency: '1x/day',     progression: 'Tighter spacing, faster pace' },
          { code: 'PHYSIO_BALL',      sets: '15-30 sec x 3-5',       frequency: '1x/day',     progression: 'Reduce handler support, add movement' },
          { code: 'UNDERWATER_TREAD', sets: '5-20 min',              frequency: '2-3x/week',  progression: 'Increase duration, speed, water level' },
          { code: 'POOL_SWIM',        sets: '5-15 min',              frequency: '1-3x/week',  progression: 'Increase duration, reduce flotation support' },
          { code: 'SLOW_TROT',        sets: '1 min trot / 2 min walk x 5', frequency: '1x/day', progression: 'Increase trot intervals' },
          { code: 'WATER_RETRIEVE',   sets: '3-5 throws, short dist', frequency: '1x/day',    progression: 'Increase distance gradually' }
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
          { code: 'STEP_OVER',        sets: '3-5 passes',            frequency: '1x/day',     progression: 'Vary rung spacing' },
          { code: 'WOBBLE_BOARD',     sets: '30-60 sec x 3-5',       frequency: '1-2x/day',   progression: 'Decrease base of support' },
          { code: 'BOSU_STAND',       sets: '20-45 sec x 3',         frequency: '1x/day',     progression: 'All 4 feet on BOSU' },
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
          { code: 'SIT_STAND',        sets: '5-10 reps x 2-3 sets',  frequency: '2x/day',     progression: 'Slow tempo, incline surface' },
          { code: 'UNEVEN_TERRAIN',   sets: '10-20 steps x 2',       frequency: '1x/day',     progression: 'Increase distance' },
          { code: 'HILL_CLIMB',       sets: '5-10 min',              frequency: '1-2x/day',   progression: 'Steeper incline, longer duration' },
          { code: 'CAVALETTI_RAILS',  sets: '3-5 passes x 2 sets',   frequency: '1-2x/day',   progression: 'Raise height incrementally' },
          { code: 'SLOW_PIVOT',       sets: '5-10 pivots each dir',  frequency: '1x/day',     progression: 'Smaller platform' },
          { code: 'WOBBLE_BOARD',     sets: '30-60 sec x 3-5',       frequency: '1-2x/day',   progression: 'Decrease base of support' },
          { code: 'PHYSIO_BALL',      sets: '15-30 sec x 3-5',       frequency: '1x/day',     progression: 'Reduce handler support, add movement' },
          { code: 'UNDERWATER_TREAD', sets: '5-20 min',              frequency: '2-3x/week',  progression: 'Increase duration, speed, water level' },
          { code: 'SLOW_TROT',        sets: '1 min trot / 2 min walk x 5', frequency: '1x/day', progression: 'Increase trot intervals' }
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
          { code: 'MYOFASC_ILIO',     sets: '3-5 reps, 15-30 sec hold', frequency: 'After warm-up', progression: 'Increase extension range' },
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
        name: 'Active Joint Protection',
        weekRange: 'Weeks 4-8',
        phaseFraction: [0.25, 0.50],
        goal: 'Build periarticular muscle support. Improve functional ROM. Introduce low-level balance challenges. Establish regular exercise routine.',
        exercises: [
          { code: 'MASSAGE_THERA',    sets: '5-10 min per area',      frequency: '1-2x/day',   progression: 'Deeper techniques as tolerated' },
          { code: 'HEAT_THERAPY',     sets: '10-15 min',              frequency: 'Before exercise', progression: 'Consistent use pre-stretching' },
          { code: 'STRETCH_HAMS',     sets: '3-5 reps, 15-30 sec hold', frequency: 'After warm-up', progression: 'Increase hold duration' },
          { code: 'MYOFASC_ILIO',     sets: '3-5 reps, 15-30 sec hold', frequency: 'After warm-up', progression: 'Increase extension range' },
          { code: 'WEIGHT_SHIFT',     sets: '5-10 shifts, 2-3 sec',   frequency: '2-3x/day',   progression: 'Longer holds, less handler support' },
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
          { code: 'WOBBLE_BOARD_ADV', sets: '30 sec x 3',             frequency: '1x/day',     progression: 'Combine with weight shifts' },
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
          { code: 'SLOW_TROT',        sets: '5-20 min',               frequency: '1-2x/day',  progression: 'Increase speed, incline' }
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
          { code: 'MYOFASC_ILIO',     sets: '3-5 reps, 15-30 sec hold', frequency: 'After warm-up', progression: 'Increase extension range' },
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
          { code: 'MYOFASC_ILIO',     sets: '3-5 reps, 15-30 sec hold', frequency: 'After warm-up', progression: 'Increase extension range' },
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
          { code: 'STEP_OVER',        sets: '3-5 passes',             frequency: '1x/day',     progression: 'Vary rung spacing' },
          { code: 'WOBBLE_BOARD',     sets: '30-60 sec x 3-5',        frequency: '1-2x/day',   progression: 'Decrease base of support' },
          { code: 'FOAM_PAD_STAND',   sets: '5-10 passes',            frequency: '1-2x/day',   progression: 'Thicker/softer pads' },
          { code: 'PERTURBATION_ADV', sets: '20-45 sec x 3',          frequency: '1x/day',     progression: 'Handler-induced gentle bounce' },
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
          { code: 'MASSAGE_THERA',    sets: '5-10 min per area',      frequency: '1-2x/day',   progression: 'Deeper techniques as tolerated' },
          { code: 'HEAT_THERAPY',     sets: '10-15 min',              frequency: 'Before exercise', progression: 'Consistent use pre-stretching' },
          { code: 'STRETCH_HAMS',     sets: '3-5 reps, 15-30 sec hold', frequency: 'After warm-up', progression: 'Increase hold duration' },
          { code: 'MYOFASC_ILIO',     sets: '3-5 reps, 15-30 sec hold', frequency: 'After warm-up', progression: 'Increase extension range' },
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

  // ── TPLO / STIFLE POST-SURGICAL ──
  if (d.includes('tplo') || d.includes('tta') ||
      d.includes('ccl') || d.includes('lateral suture') ||
      d.includes('meniscal') || d.includes('patella') ||
      d.includes('stifle') || d.includes('fracture') ||
      d.includes('polytrauma') || d.includes('amputation') ||
      d.includes('fho') || /\bthr\b/.test(d) || d.includes('total hip') ||
      r.includes('stifle') || r.includes('knee')) {
    return 'tplo';
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
      d.includes('sarcopenia') || d.includes('cognitive')) {
    return 'geriatric';
  }

  // ── OA / EVERYTHING ELSE ──
  // Hip dysplasia, elbow dysplasia, OA, obesity, soft tissue,
  // forelimb conditions all use the OA multimodal protocol
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
    if (progress > protocol.phases[i].phaseFraction[0]) {
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
function selectExercisesForWeek(weekNum, totalWeeks, allExercises, formData) {
  const protocolType = getProtocolType(
    formData.diagnosis,
    formData.affectedRegion,
    formData.treatmentApproach
  );

  const protocol = PROTOCOL_DEFINITIONS[protocolType];
  if (!protocol) return [];

  const phaseIndex = getPhaseForWeek(weekNum, totalWeeks, protocolType);
  const phase = protocol.phases[phaseIndex];
  if (!phase) return [];

  // Build exercise lookup from database
  const exercisesByCode = {};
  allExercises.forEach(ex => { exercisesByCode[ex.code] = ex; });

  // Gate aquatic exercises by clinic availability
  const hasAquatic = formData.aquaticAccess === true || formData.aquaticAccess === 'true';
  const aquaticCodes = new Set(['UNDERWATER_TREAD', 'POOL_SWIM', 'WATER_WALKING', 'WATER_RETRIEVE']);

  // Gate modality exercises by clinic equipment
  const modalityGates = {
    'LASER_IV':     formData.modalityLaser,
    'TENS_THERAPY': formData.modalityTENS,
    'NMES_QUAD':    formData.modalityNMES,
    'US_PULSED':    formData.modalityTherapeuticUS,
    'PEMF_THERAPY': formData.modalityPulsedEMF,
    'SHOCKWAVE':    formData.modalityShockwave
  };

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

    // Look up exercise in database
    const dbExercise = exercisesByCode[rx.code];
    if (!dbExercise) continue;

    selectedExercises.push({
      code: dbExercise.code,
      name: dbExercise.name,
      category: dbExercise.category,
      description: dbExercise.description,
      sets: rx.sets,
      reps: rx.sets,  // Using the document's prescription format
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
      notes: dbExercise.notes || null
    });
  }

  // Attach phase metadata to first exercise for frontend display
  if (selectedExercises.length > 0) {
    selectedExercises[0]._phaseInfo = {
      number: phase.number,
      name: phase.name,
      goal: phase.goal,
      contraindications: phase.contraindications,
      progressionCriteria: phase.progressionCriteria
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


// ============================================================================
// EXPORTS
// ============================================================================
module.exports = {
  selectExercisesForWeek,
  getProtocolType,
  getPhaseForWeek,
  PROTOCOL_DEFINITIONS
};
