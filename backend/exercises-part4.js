// ============================================================================
// BALANCE & PROPRIOCEPTION EXERCISES (10 exercises)
// ============================================================================

const BALANCE_EXERCISES = [
  {
    code: 'WOBBLE_BOARD',
    name: 'Wobble Board Training',
    category: 'Balance & Proprioception',
    description: 'Standing on unstable platform to improve balance, proprioception, and core stability.',
    equipment: ['Wobble board or balance disc', 'Treats', 'Non-slip base'],
    setup: 'Place wobble board on stable surface. Have treats ready for encouragement.',
    steps: [
      'Introduce dog to board (let sniff/investigate)',
      'Lure dog to place front feet on board',
      'Once comfortable, add rear feet',
      'Stand with all four feet on board',
      'Hold position for 10-15 seconds initially',
      'Reward calm, balanced standing',
      'Complete 5-8 repetitions'
    ],
    good_form: [
      'All four feet remain on board',
      'Dog adjusts to maintain balance',
      'Calm, controlled posture',
      'Core engagement visible'
    ],
    common_mistakes: [
      'Progressing too quickly',
      'Board too unstable initially',
      'Hold duration too long',
      'Not rewarding calm behavior'
    ],
    red_flags: [
      'Extreme fear or panic',
      'Inability to maintain any balance',
      'Jumping off repeatedly',
      'Pain response'
    ],
    progression: 'Increase hold to 30-60 seconds. Add weight shifts. Use more unstable surface. Add perturbations.',
    contraindications: 'Severe vestibular disease, acute pain, extreme fear, recent surgery <3 weeks',
    difficulty_level: 'Moderate'
  },

  {
    code: 'BALANCE_PAD',
    name: 'Balance Pad Exercises',
    category: 'Balance & Proprioception',
    description: 'Standing or performing exercises on foam pad to challenge balance and proprioception.',
    equipment: ['Foam balance pad or cushion', 'Treats'],
    setup: 'Place balance pad on floor. Clear space around for safety.',
    steps: [
      'Have dog step onto pad with all four feet',
      'Stand quietly for 15-20 seconds',
      'Add sit-stand transitions on pad',
      'Perform 5 sit-stands',
      'Progress to weight shifts on pad',
      'Hold each weight shift 5 seconds',
      'Complete 3-5 sets'
    ],
    good_form: [
      'All feet remain on pad',
      'Controlled movements',
      'Good balance maintenance',
      'Proper posture throughout'
    ],
    common_mistakes: [
      'Pad too soft/unstable initially',
      'Too many exercises on pad',
      'Not ensuring safety',
      'Rushing progressions'
    ],
    red_flags: [
      'Falling or severe imbalance',
      'Fear response',
      'Pain during exercises',
      'Refusal to stand on pad'
    ],
    progression: 'Use softer/thicker pad. Add three-leg stands. Perform cavaletti on pad. Increase duration.',
    contraindications: 'Severe ataxia, acute joint instability, vestibular disease, extreme fear',
    difficulty_level: 'Moderate'
  },

  {
    code: 'PHYSIO_BALL',
    name: 'Physioball (Peanut Ball) Exercises',
    category: 'Balance & Proprioception',
    description: 'Core strengthening and balance training using inflatable peanut-shaped ball.',
    equipment: ['Peanut-shaped physioball', 'Treats', 'Assistant for safety'],
    setup: 'Partially inflate ball (firmer for beginners). Clear workspace.',
    steps: [
      'Support dog\'s hindquarters',
      'Place forelimbs on ball',
      'Rock ball gently forward/back',
      'Dog adjusts to maintain position',
      'Hold stable position 10 seconds',
      'Rock side to side gently',
      'Complete 5-8 rocking cycles'
    ],
    good_form: [
      'Dog engages core for stability',
      'Front feet maintain contact',
      'Controlled adjustments',
      'Calm, focused demeanor'
    ],
    common_mistakes: [
      'Ball too unstable',
      'Not providing adequate support',
      'Rocking too vigorously',
      'Session too long'
    ],
    red_flags: [
      'Extreme fear or panic',
      'Sliding off ball',
      'Pain response',
      'Inability to maintain any stability'
    ],
    progression: 'Increase ball movement. Add all four feet on ball. Reduce support. Add perturbations.',
    contraindications: 'Severe fear, acute shoulder/elbow pain, extreme weakness, balance disorders',
    difficulty_level: 'Advanced'
  },

  {
    code: 'BLINDFOLD_WALK',
    name: 'Proprioceptive Walking (Visual Restriction)',
    category: 'Balance & Proprioception',
    description: 'Walking with reduced visual input to enhance proprioceptive awareness.',
    equipment: ['Soft blindfold or head covering', 'Leash', 'Familiar area'],
    setup: 'Start in familiar, safe environment. Use gentle head covering.',
    steps: [
      'Apply light head covering over eyes',
      'Allow 30 seconds adjustment',
      'Walk slowly in straight line',
      'Use voice for guidance',
      'Walk 15-20 feet',
      'Remove covering',
      'Repeat 3-5 times'
    ],
    good_form: [
      'Calm acceptance of covering',
      'Deliberate paw placement',
      'Good spatial awareness',
      'Responsive to handler'
    ],
    common_mistakes: [
      'Covering too restrictive',
      'Walking in unfamiliar area',
      'Pace too fast',
      'Not allowing adjustment time'
    ],
    red_flags: [
      'Extreme distress or panic',
      'Complete disorientation',
      'Stumbling or falling',
      'Refusal to move'
    ],
    progression: 'Add gentle obstacles. Increase distance. Navigate turns. Vary terrain.',
    contraindications: 'Severe anxiety, complete vision loss, acute vestibular disease, extreme fear',
    difficulty_level: 'Moderate'
  },

  {
    code: 'UNEVEN_TERRAIN',
    name: 'Uneven Terrain Walking',
    category: 'Balance & Proprioception',
    description: 'Walking on varied surfaces to challenge proprioception and balance reactions.',
    equipment: ['Natural uneven terrain or textured mats', 'Leash'],
    setup: 'Select area with varied but safe surface (grass, gravel, gentle slopes).',
    steps: [
      'Begin on familiar level surface',
      'Transition to uneven terrain',
      'Walk slowly across varied surface',
      'Encourage careful paw placement',
      'Navigate 50-100 feet',
      'Return to level surface',
      'Complete 3-5 passes'
    ],
    good_form: [
      'Deliberate, controlled steps',
      'Good paw placement',
      'Balance adjustments as needed',
      'Confident movement'
    ],
    common_mistakes: [
      'Terrain too challenging initially',
      'Moving too quickly',
      'Not supervising closely',
      'Session too long'
    ],
    red_flags: [
      'Stumbling frequently',
      'Extreme caution or fear',
      'Increased lameness',
      'Loss of balance'
    ],
    progression: 'Increase terrain difficulty. Add gentle hills. Navigate rocky areas. Extend duration.',
    contraindications: 'Severe ataxia, acute lameness, vision impairment, extreme fear',
    difficulty_level: 'Moderate'
  },

  {
    code: 'BALL_NUDGE',
    name: 'Ball Nudging Exercise',
    category: 'Balance & Proprioception',
    description: 'Pushing large ball with nose/paws to improve coordination and spatial awareness.',
    equipment: ['Large exercise ball', 'Open space', 'Treats'],
    setup: 'Select ball appropriate to dog size (should reach chest height).',
    steps: [
      'Introduce dog to ball (allow investigation)',
      'Encourage nose targeting on ball',
      'Reward any contact with ball',
      'Progress to sustained pushing',
      'Guide ball in straight line 10 feet',
      'Change directions',
      'Complete 5-8 pushes'
    ],
    good_form: [
      'Controlled ball movement',
      'Coordinated pushing action',
      'Good balance while pushing',
      'Following ball effectively'
    ],
    common_mistakes: [
      'Ball too large or small',
      'Not rewarding initial contact',
      'Expecting too much too soon',
      'Session too long'
    ],
    red_flags: [
      'Fear of ball movement',
      'Aggressive response to ball',
      'Poor coordination',
      'Refusal to engage'
    ],
    progression: 'Add directional commands. Navigate around obstacles. Increase distance. Add figure-eights.',
    contraindications: 'Ball phobia, aggressive tendencies, severe coordination issues, acute pain',
    difficulty_level: 'Moderate'
  },

  {
    code: 'SURFACE_CHANGE',
    name: 'Surface Transition Exercise',
    category: 'Balance & Proprioception',
    description: 'Walking across different surface types to improve proprioceptive awareness and adaptation.',
    equipment: ['Multiple surface types (carpet, tile, grass, gravel, rubber)', 'Leash'],
    setup: 'Create path with 4-5 different surfaces in sequence.',
    steps: [
      'Start on familiar surface',
      'Walk across first surface type',
      'Transition to next surface',
      'Pause briefly on each new surface',
      'Continue through all surfaces',
      'Complete 3-5 full circuits',
      'Monitor adaptation to each surface'
    ],
    good_form: [
      'Smooth transitions between surfaces',
      'Quick adaptation to new texture',
      'Maintained pace throughout',
      'Confident stepping'
    ],
    common_mistakes: [
      'Surfaces too dissimilar',
      'Not allowing adjustment time',
      'Moving too quickly',
      'Skipping challenging surfaces'
    ],
    red_flags: [
      'Severe reluctance on certain surfaces',
      'Loss of balance during transitions',
      'Pain response on hard surfaces',
      'Increased lameness'
    ],
    progression: 'Add more diverse surfaces. Reduce visual cues. Increase pace. Add obstacles.',
    contraindications: 'Severe paw pad sensitivity, acute pain, extreme fear of certain textures',
    difficulty_level: 'Moderate'
  },

  {
    code: 'PERTURBATION',
    name: 'Perturbation Training',
    category: 'Balance & Proprioception',
    description: 'Gentle unexpected balance challenges to improve reactive balance responses.',
    equipment: ['Your hands', 'Non-slip surface', 'Optional: balance pad'],
    setup: 'Dog standing square on stable surface (can progress to unstable).',
    steps: [
      'Have dog stand in square position',
      'Apply gentle push to hip/shoulder',
      'Dog should react to maintain balance',
      'Apply from different directions',
      'Use light force initially',
      'Complete 8-10 perturbations',
      'Vary timing and direction'
    ],
    good_form: [
      'Quick, appropriate balance response',
      'Returns to square stance',
      'No loss of footing',
      'Calm acceptance'
    ],
    common_mistakes: [
      'Force too strong initially',
      'Not varying direction',
      'Too many repetitions',
      'Dog not prepared/aware'
    ],
    red_flags: [
      'Inability to maintain balance',
      'Falling or stumbling',
      'Pain response',
      'Fear or aggression'
    ],
    progression: 'Increase force gradually. Add unstable surface. Vary timing. Reduce visual cues.',
    contraindications: 'Joint instability, severe weakness, vestibular disease, trust issues',
    difficulty_level: 'Advanced'
  },

  {
    code: 'LASER_CHASE',
    name: 'Laser Pointer/Target Following',
    category: 'Balance & Proprioception',
    description: 'Following moving target to improve coordination, focus, and dynamic balance.',
    equipment: ['Laser pointer or target stick', 'Clear space'],
    setup: 'Ensure safe environment free of obstacles. Start in confined area.',
    steps: [
      'Introduce laser/target (allow investigation)',
      'Move target slowly in straight line',
      'Dog follows with controlled movement',
      'Create figure-eight patterns',
      'Add direction changes',
      'Session 3-5 minutes',
      'End with predictable capture/reward'
    ],
    good_form: [
      'Smooth, coordinated following',
      'Controlled pace',
      'Quick direction changes',
      'Maintained balance'
    ],
    common_mistakes: [
      'Moving target too quickly',
      'Session too long (overstimulation)',
      'Not providing "win" at end',
      'Allowing obsessive behavior'
    ],
    red_flags: [
      'Obsessive/compulsive response',
      'Frustration or stress',
      'Poor coordination',
      'Loss of balance during movement'
    ],
    progression: 'Increase speed slightly. Add elevation changes. Create complex patterns. Reduce size of target.',
    contraindications: 'Obsessive-compulsive tendencies, vision problems, extreme prey drive, seizure history',
    difficulty_level: 'Moderate'
  },

  {
    code: 'SLOW_PIVOT',
    name: 'Slow Pivot Turns',
    category: 'Balance & Proprioception',
    description: 'Rotating in place to improve proprioception, balance, and coordination.',
    equipment: ['Treats', 'Non-slip surface', 'Optional: platform'],
    setup: 'Dog standing on non-slip surface or small platform.',
    steps: [
      'Have dog stand square',
      'Use treat to lure head to side',
      'Encourage small steps to rotate',
      'Complete 180-degree turn',
      'Return to start position',
      'Repeat opposite direction',
      'Complete 5 rotations each way'
    ],
    good_form: [
      'Small, controlled steps',
      'Maintains balance throughout',
      'Equal work both directions',
      'Smooth, continuous rotation'
    ],
    common_mistakes: [
      'Rotating too quickly',
      'Allowing large steps/walking',
      'Not working both directions',
      'Poor starting position'
    ],
    red_flags: [
      'Severe difficulty coordinating',
      'Loss of balance',
      'Pain during rotation',
      'Reluctance one direction'
    ],
    progression: 'Add 360-degree rotations. Use smaller platform. Increase speed. Add holds during rotation.',
    contraindications: 'Vestibular disease, severe weakness, acute joint pain, coordination disorders',
    difficulty_level: 'Moderate'
  }
];

module.exports = BALANCE_EXERCISES;
