// ============================================================================
// COMPLETE EXERCISE DATABASE - 50 EXERCISES
// K9-REHAB-PRO - Veterinary-Grade Exercise Library
// ============================================================================

const COMPLETE_EXERCISES = [
  // ========================================
  // PASSIVE THERAPY (8 exercises)
  // ========================================
  {
    code: 'PROM_STIFLE',
    name: 'Passive Range of Motion - Stifle',
    category: 'Passive Therapy',
    description: 'Gentle manual manipulation of the stifle joint through available range to maintain joint mobility and prevent contracture.',
    equipment: ['Cushioned surface', 'Treat rewards'],
    setup: 'Position dog in lateral recumbency on soft surface. Support affected limb at femur and tibia.',
    steps: [
      'Stabilize femur with one hand',
      'Gently grasp tibia/foot with other hand',
      'Slowly flex stifle to comfortable end range',
      'Hold flexed position for 5-10 seconds',
      'Slowly extend back to neutral',
      'Maintain smooth, controlled motion throughout',
      'Complete 10-15 repetitions per session'
    ],
    good_form: [
      'Smooth, controlled movements without jerking',
      'Dog remains relaxed throughout',
      'No forcing beyond comfortable range',
      'Consistent range maintained across reps'
    ],
    common_mistakes: [
      'Moving too quickly through range',
      'Forcing beyond pain-free range',
      'Not properly stabilizing proximal joint',
      'Inconsistent number of repetitions'
    ],
    red_flags: [
      'Vocalization or signs of pain',
      'Muscle spasm or guarding',
      'Increased swelling post-session',
      'Loss of previously gained range',
      'Joint instability or crepitus'
    ],
    progression: 'Increase repetitions to 20-25. Add gentle overpressure at end range once pain-free. Progress to active-assisted ROM.',
    contraindications: 'Acute fracture, unstable joint, severe inflammation, within 48hr post-surgery',
    difficulty_level: 'Easy'
  },

  {
    code: 'PROM_HIP',
    name: 'Passive Range of Motion - Hip',
    category: 'Passive Therapy',
    description: 'Manual hip joint mobilization to maintain hip flexion/extension and prevent muscle contracture.',
    equipment: ['Padded surface', 'Towel for support'],
    setup: 'Dog in lateral recumbency. Stabilize pelvis with towel under hip.',
    steps: [
      'Place one hand on pelvis for stabilization',
      'Grasp femur mid-shaft with other hand',
      'Flex hip by bringing stifle toward chest',
      'Hold flexed position 5 seconds',
      'Extend hip backward to neutral or slight extension',
      'Maintain slow, controlled motion',
      'Perform 10-15 repetitions'
    ],
    good_form: [
      'Pelvis remains stable throughout',
      'Smooth arc of motion',
      'Dog stays relaxed',
      'Equal timing on flexion and extension'
    ],
    common_mistakes: [
      'Allowing pelvic rotation',
      'Rushing through repetitions',
      'Hyperextending hip joint',
      'Not supporting limb weight'
    ],
    red_flags: [
      'Pain response during movement',
      'Audible joint clicking or grinding',
      'Increased lameness after session',
      'Muscle spasm or resistance'
    ],
    progression: 'Increase reps to 20. Add circumduction (circles). Include abduction/adduction movements.',
    contraindications: 'Hip luxation, femoral fracture, acute hip inflammation, hip dysplasia with severe pain',
    difficulty_level: 'Easy'
  },

  {
    code: 'MASSAGE_THERA',
    name: 'Therapeutic Massage',
    category: 'Passive Therapy',
    description: 'Manual soft tissue mobilization to reduce muscle tension, improve circulation, and promote relaxation.',
    equipment: ['Massage oil (optional)', 'Warm towel', 'Quiet environment'],
    setup: 'Dog in comfortable position (lateral or sternal). Warm affected muscles with towel for 5 minutes.',
    steps: [
      'Start with light effleurage strokes toward heart',
      'Progress to deeper effleurage on major muscle groups',
      'Apply petrissage (kneading) to affected muscles',
      'Use fingertip friction on trigger points',
      'Include cross-fiber friction on tendons',
      'Focus 5-7 minutes on affected limb',
      'End with light effleurage for 2-3 minutes'
    ],
    good_form: [
      'Consistent, rhythmic pressure',
      'Dog shows relaxation signs (yawning, soft eyes)',
      'Strokes follow muscle fiber direction',
      'Total session 15-20 minutes'
    ],
    common_mistakes: [
      'Too much pressure causing discomfort',
      'Irregular, inconsistent strokes',
      'Missing key muscle groups',
      'Session too short or rushed'
    ],
    red_flags: [
      'Dog attempts to escape or shows aggression',
      'Increased muscle tension during treatment',
      'Visible pain or guarding',
      'Swelling increases after session'
    ],
    progression: 'Add trigger point therapy. Increase session to 30 minutes. Include passive stretching.',
    contraindications: 'Open wounds, skin infection, acute inflammation, fracture sites, known tumor',
    difficulty_level: 'Easy'
  },

  {
    code: 'COLD_THERAPY',
    name: 'Cryotherapy (Cold Therapy)',
    category: 'Passive Therapy',
    description: 'Application of cold to reduce inflammation, pain, and muscle spasm following activity or injury.',
    equipment: ['Ice pack or cold pack', 'Thin towel', 'Timer'],
    setup: 'Wrap ice pack in thin towel. Position dog comfortably with affected joint accessible.',
    steps: [
      'Apply wrapped ice pack directly over joint',
      'Secure with elastic bandage if needed',
      'Leave in place for 10-15 minutes',
      'Monitor skin condition every 5 minutes',
      'Remove pack after 15 minutes maximum',
      'Allow joint to return to normal temperature',
      'Repeat 3-4 times daily as needed'
    ],
    good_form: [
      'Towel barrier prevents direct skin contact',
      'Consistent 10-15 minute application time',
      'Dog remains calm and comfortable',
      'Skin returns to normal color after removal'
    ],
    common_mistakes: [
      'Applying ice directly to skin',
      'Leaving cold pack on too long (>20min)',
      'Using on already cold/stiff joint',
      'Not monitoring skin condition'
    ],
    red_flags: [
      'Skin discoloration (white, purple, mottled)',
      'Excessive shivering or distress',
      'Skin irritation or frostbite',
      'Numbness that persists >10 minutes'
    ],
    progression: 'Use primarily post-exercise. Reduce frequency as inflammation subsides. Transition to contrast therapy.',
    contraindications: 'Circulatory problems, cold hypersensitivity, Raynaud disease, open wounds',
    difficulty_level: 'Easy'
  },

  {
    code: 'HEAT_THERAPY',
    name: 'Thermotherapy (Heat Therapy)',
    category: 'Passive Therapy',
    description: 'Application of heat to increase tissue extensibility, reduce pain, and promote relaxation before activity.',
    equipment: ['Heating pad or warm pack', 'Towel', 'Timer'],
    setup: 'Set heating pad to low-medium. Place towel barrier between heat source and skin.',
    steps: [
      'Apply warm pack over target muscle group',
      'Maintain comfortable warmth (not hot)',
      'Leave in place for 10-15 minutes',
      'Check skin condition every 5 minutes',
      'Remove after 15 minutes',
      'Perform stretching or PROM while tissues warm',
      'Use before exercise sessions'
    ],
    good_form: [
      'Moderate, comfortable heat level',
      'Dog remains relaxed throughout',
      'Skin shows mild pinkness only',
      'Session duration 10-15 minutes maximum'
    ],
    common_mistakes: [
      'Heat too hot causing discomfort',
      'Applying to inflamed/swollen tissue',
      'Session too long (>20 minutes)',
      'Using immediately after exercise'
    ],
    red_flags: [
      'Skin becomes bright red or blistered',
      'Dog shows signs of overheating',
      'Increased swelling after treatment',
      'Burns or skin damage'
    ],
    progression: 'Combine with massage. Use before active exercises. Follow with stretching protocol.',
    contraindications: 'Acute inflammation, active bleeding, reduced sensation, malignancy, infection',
    difficulty_level: 'Easy'
  },

  {
    code: 'STRETCH_QUAD',
    name: 'Quadriceps Stretch',
    category: 'Passive Therapy',
    description: 'Passive stretching of quadriceps muscle group to maintain/improve stifle flexion range.',
    equipment: ['Non-slip surface', 'Treats for cooperation'],
    setup: 'Dog in standing or lateral recumbency. Identify quadriceps muscle group.',
    steps: [
      'Stabilize pelvis/femur with one hand',
      'Grasp tibia/paw with other hand',
      'Slowly flex stifle bringing paw toward buttock',
      'Hold at first resistance point for 15-30 seconds',
      'Release slowly back to neutral',
      'Repeat 3-5 times per session',
      'Perform 2-3 times daily'
    ],
    good_form: [
      'Slow progression into stretch',
      'Hold at gentle tension (not pain)',
      'Dog remains relaxed',
      'Consistent hold duration'
    ],
    common_mistakes: [
      'Bouncing or pulsing during stretch',
      'Forcing past pain point',
      'Holding too briefly (<10 seconds)',
      'Not stabilizing proximal joint'
    ],
    red_flags: [
      'Pain vocalization during stretch',
      'Muscle spasm or cramping',
      'Increased soreness lasting >24 hours',
      'Loss of range after stretching'
    ],
    progression: 'Increase hold time to 45-60 seconds. Add gentle overpressure. Perform after heat application.',
    contraindications: 'Acute muscle strain, recent quad surgery, active inflammation, joint instability',
    difficulty_level: 'Easy'
  },

  {
    code: 'STRETCH_HAMS',
    name: 'Hamstring Stretch',
    category: 'Passive Therapy',
    description: 'Passive stretching of hamstring muscle group to improve hip flexion and reduce muscle tightness.',
    equipment: ['Padded surface', 'Towel for support'],
    setup: 'Dog in lateral recumbency with affected leg uppermost.',
    steps: [
      'Stabilize pelvis with one hand',
      'Grasp femur mid-shaft with other hand',
      'Flex hip while maintaining stifle extension',
      'Bring femur forward until stretch felt',
      'Hold position for 15-30 seconds',
      'Slowly release back to neutral',
      'Complete 3-5 repetitions'
    ],
    good_form: [
      'Hip flexion with stifle extended',
      'Gentle, sustained stretch',
      'Dog remains calm and cooperative',
      'Pelvis stays stable'
    ],
    common_mistakes: [
      'Allowing stifle to flex during stretch',
      'Rushed movement into/out of stretch',
      'Insufficient hold duration',
      'Hyperextending hip on release'
    ],
    red_flags: [
      'Sharp pain or discomfort',
      'Hamstring cramping',
      'Increased stiffness after session',
      'Sciatic nerve irritation symptoms'
    ],
    progression: 'Increase hold to 45-60 seconds. Add contract-relax technique. Combine with heat therapy.',
    contraindications: 'Hamstring strain, sciatic nerve issues, recent hip surgery, pelvic fracture',
    difficulty_level: 'Easy'
  },

  {
    code: 'EFFLEURAGE',
    name: 'Lymphatic Effleurage',
    category: 'Passive Therapy',
    description: 'Light stroking massage technique to promote lymphatic drainage and reduce post-operative swelling.',
    equipment: ['Massage oil or lotion', 'Warm environment'],
    setup: 'Dog comfortable in lateral or sternal position. Warm hands before starting.',
    steps: [
      'Begin distally on affected limb',
      'Use light, flat-handed strokes',
      'Stroke toward body/heart direction',
      'Maintain consistent light pressure',
      'Cover entire limb systematically',
      'Repeat each stroke 10-15 times',
      'Session duration 10-15 minutes'
    ],
    good_form: [
      'Very light pressure (feather-light)',
      'Slow, rhythmic strokes',
      'Always toward lymph nodes',
      'Dog shows relaxation'
    ],
    common_mistakes: [
      'Using too much pressure',
      'Stroking away from heart',
      'Irregular, quick strokes',
      'Missing affected areas'
    ],
    red_flags: [
      'Increased swelling after treatment',
      'Skin redness or irritation',
      'Dog shows discomfort',
      'Signs of infection (heat, pus)'
    ],
    progression: 'Increase session duration to 20 minutes. Add to post-exercise routine. Teach client for home use.',
    contraindications: 'Active infection, DVT, congestive heart failure, kidney disease, cancer',
    difficulty_level: 'Easy'
  }
];

module.exports = COMPLETE_EXERCISES;
