// ============================================================================
// STRENGTHENING EXERCISES (12 exercises)
// ============================================================================

const STRENGTHENING_EXERCISES = [
  {
    code: 'THREE_LEG_STAND',
    name: 'Three-Legged Standing',
    category: 'Strengthening',
    description: 'Isometric strengthening by having dog hold weight on three legs while one limb is lifted.',
    equipment: ['Non-slip surface', 'Treats', 'Timer'],
    setup: 'Dog standing square on level surface. Handler ready to lift one limb.',
    steps: [
      'Begin with dog in square standing position',
      'Gently lift one forelimb off ground',
      'Hold for 5-10 seconds initially',
      'Set limb down gently',
      'Repeat with other forelimb',
      'Progress to lifting each hindlimb',
      'Complete 3-5 holds per limb'
    ],
    good_form: [
      'Dog maintains balance without swaying',
      'Weight evenly distributed on remaining limbs',
      'Straight spine alignment',
      'Controlled throughout hold'
    ],
    common_mistakes: [
      'Hold duration too long initially',
      'Not balancing weight properly',
      'Rushing between lifts',
      'Poor posture during hold'
    ],
    red_flags: [
      'Severe trembling or weakness',
      'Inability to hold position',
      'Pain response in weight-bearing limbs',
      'Loss of balance or falling'
    ],
    progression: 'Increase hold to 20-30 seconds. Add unstable surface. Lift diagonal limbs together.',
    contraindications: 'Severe weakness, acute pain in remaining limbs, balance disorders, fear',
    difficulty_level: 'Moderate'
  },

  {
    code: 'CAVALETTI_RAILS',
    name: 'Cavaletti Rails',
    category: 'Strengthening',
    description: 'Walking over raised poles to improve joint flexion, proprioception, and coordination.',
    equipment: ['4-6 poles or PVC pipes', 'Pole supports or blocks', 'Leash'],
    setup: 'Set poles 12-18 inches apart (adjust for dog size). Height 2-4 inches off ground.',
    steps: [
      'Lead dog slowly over first pole',
      'Encourage proper foot placement',
      'Maintain slow, controlled pace',
      'Step over each pole deliberately',
      'Complete 3-5 passes',
      'Rest between sets',
      'Monitor for fatigue'
    ],
    good_form: [
      'Controlled pace throughout',
      'High step over each pole',
      'No contact with poles',
      'Consistent stride length'
    ],
    common_mistakes: [
      'Pace too fast',
      'Poles spaced incorrectly',
      'Too many reps causing fatigue',
      'Allowing pole contact'
    ],
    red_flags: [
      'Dragging feet over poles',
      'Knocking poles consistently',
      'Refusal to complete course',
      'Increased lameness after'
    ],
    progression: 'Increase height to 6-8 inches. Vary spacing. Add more poles. Increase passes to 8-10.',
    contraindications: 'Severe ataxia, acute pain, recent surgery <4 weeks, extreme fear',
    difficulty_level: 'Moderate'
  },

  {
    code: 'SIT_STAND_WALL',
    name: 'Sit-Stands Against Wall',
    category: 'Strengthening',
    description: 'Sit-stand transitions with rear positioned against wall to prevent rocking and ensure proper form.',
    equipment: ['Wall', 'Non-slip surface', 'Treats'],
    setup: 'Position dog with hindquarters near wall (6-12 inches away). Non-slip floor.',
    steps: [
      'Have dog sit with proper square position',
      'Hindquarters should be close to wall',
      'Command stand with treat lure',
      'Dog must stand straight up (can\'t rock back)',
      'Hold standing for 3-5 seconds',
      'Return to sit with control',
      'Repeat 10-15 times'
    ],
    good_form: [
      'Straight vertical movement',
      'No rocking backward',
      'Equal hindlimb loading',
      'Controlled eccentric descent'
    ],
    common_mistakes: [
      'Dog too far from wall',
      'Allowing forward rocking',
      'Moving too quickly',
      'Crooked sits'
    ],
    red_flags: [
      'Inability to stand without rocking',
      'Severe weakness or trembling',
      'Pain vocalization',
      'Collapsing'
    ],
    progression: 'Increase to 20-25 reps. Add 5-10 second holds. Remove wall gradually.',
    contraindications: 'Severe hip/stifle pain, spinal issues, acute weakness, fear of confinement',
    difficulty_level: 'Moderate'
  },

  {
    code: 'HILL_CLIMB',
    name: 'Hill Walking (Uphill)',
    category: 'Strengthening',
    description: 'Walking up inclines to build hindlimb strength and improve cardiovascular fitness.',
    equipment: ['Hill or ramp', 'Leash', 'Harness', 'Water'],
    setup: 'Start with gentle slope (5-10 degrees). Dog on short leash.',
    steps: [
      'Warm up with 5 minutes level walking',
      'Approach hill at controlled pace',
      'Walk straight up at slow, steady pace',
      'Monitor gait and fatigue',
      'Walk for 30-60 seconds uphill',
      'Turn and descend slowly',
      'Complete 3-5 hill repetitions'
    ],
    good_form: [
      'Consistent, controlled pace',
      'Proper weight bearing all limbs',
      'No rushing or pulling',
      'Controlled descent'
    ],
    common_mistakes: [
      'Too steep initially',
      'Duration too long',
      'Allowing rushing uphill',
      'Rapid uncontrolled descent'
    ],
    red_flags: [
      'Excessive fatigue or panting',
      'Bunny-hopping uphill',
      'Refusal or extreme reluctance',
      'Increased lameness'
    ],
    progression: 'Increase slope angle. Extend duration to 2-3 minutes. Add multiple hills.',
    contraindications: 'Cardiac disease, severe respiratory issues, acute lameness, extreme weakness',
    difficulty_level: 'Advanced'
  },

  {
    code: 'DOWN_STAND',
    name: 'Down-to-Stand Transitions',
    category: 'Strengthening',
    description: 'Moving from down position to standing to strengthen all limbs and core.',
    equipment: ['Non-slip surface', 'Treats'],
    setup: 'Dog in down position on non-slip floor.',
    steps: [
      'Have dog start in proper down position',
      'Command stand with treat lure',
      'Encourage straight upward movement',
      'Avoid allowing dog to rock back first',
      'Hold standing for 3 seconds',
      'Return to down with control',
      'Complete 5-10 repetitions'
    ],
    good_form: [
      'Direct down-to-stand without intermediate sit',
      'Equal weight bearing',
      'Smooth, controlled movement',
      'Proper eccentric control down'
    ],
    common_mistakes: [
      'Allowing sit as intermediate step',
      'Too many reps causing fatigue',
      'Rapid, uncontrolled movements',
      'Poor starting down position'
    ],
    red_flags: [
      'Inability to stand without sit first',
      'Severe weakness or trembling',
      'Pain response',
      'Collapse during descent'
    ],
    progression: 'Increase to 15-20 reps. Add 5-second holds. Perform on slight incline.',
    contraindications: 'Severe elbow/shoulder pathology, acute hip/stifle pain, extreme weakness',
    difficulty_level: 'Advanced'
  },

  {
    code: 'WHEEL_BARREL',
    name: 'Wheelbarrow Walking',
    category: 'Strengthening',
    description: 'Walking on forelimbs only with hindlimbs supported to strengthen shoulders and core.',
    equipment: ['Your hands', 'Non-slip surface', 'Optional: sling'],
    setup: 'Dog standing. Handler positioned to lift hindlimbs.',
    steps: [
      'Stand behind dog',
      'Gently lift hindlimbs off ground',
      'Support at level of knees or thighs',
      'Encourage forward walking on forelimbs',
      'Walk 5-10 feet initially',
      'Lower hindlimbs gently',
      'Complete 3-5 repetitions'
    ],
    good_form: [
      'Straight line walking',
      'Proper forelimb extension',
      'Level body position',
      'Controlled pace'
    ],
    common_mistakes: [
      'Lifting hindquarters too high',
      'Distance too long initially',
      'Not supporting adequately',
      'Uneven forelimb work'
    ],
    red_flags: [
      'Collapse of forelimbs',
      'Severe trembling',
      'Pain response in shoulders',
      'Fear or extreme stress'
    ],
    progression: 'Increase distance to 20-30 feet. Reduce support gradually. Add gentle inclines.',
    contraindications: 'Shoulder pathology, elbow dysplasia, wrist instability, obesity, fear',
    difficulty_level: 'Advanced'
  },

  {
    code: 'STAIR_RUN',
    name: 'Stair Running (Advanced)',
    category: 'Strengthening',
    description: 'Dynamic stair climbing at faster pace for advanced strengthening and power development.',
    equipment: ['Full flight of stairs', 'Non-slip treads', 'Harness for safety'],
    setup: 'Dog at base of stairs. Handler ready with verbal encouragement.',
    steps: [
      'Warm up with 10 minutes walking',
      'Position at base of stairs',
      'Encourage moderate-paced ascent',
      'Climb full flight (10-15 steps)',
      'Rest 30-60 seconds at top',
      'Descend slowly with control',
      'Complete 3-5 repetitions'
    ],
    good_form: [
      'Controlled but dynamic pace up',
      'Proper paw placement',
      'No bunny-hopping',
      'Slow, controlled descent'
    ],
    common_mistakes: [
      'Too many reps initially',
      'Inadequate warm-up',
      'Rushing descent',
      'Insufficient rest between reps'
    ],
    red_flags: [
      'Bunny-hopping up stairs',
      'Refusal or extreme reluctance',
      'Excessive fatigue',
      'Increased lameness after'
    ],
    progression: 'Increase to 8-10 reps. Add multiple flights. Carry light weight in backpack.',
    contraindications: 'Cardiac disease, severe joint pathology, acute pain, poor conditioning',
    difficulty_level: 'Advanced'
  },

  {
    code: 'RESIST_WALK',
    name: 'Resisted Walking',
    category: 'Strengthening',
    description: 'Walking against resistance to build muscular strength and endurance.',
    equipment: ['Resistance band or elastic leash', 'Harness', 'Anchor point'],
    setup: 'Attach resistance band to harness and secure anchor. Level surface.',
    steps: [
      'Position dog with light tension on band',
      'Encourage forward walking',
      'Dog pulls against resistance',
      'Walk 10-15 feet forward',
      'Rest 30 seconds',
      'Repeat 5-8 times',
      'Monitor for proper form and fatigue'
    ],
    good_form: [
      'Steady, controlled pace',
      'Proper weight bearing',
      'Level topline',
      'Consistent tension'
    ],
    common_mistakes: [
      'Too much resistance initially',
      'Allowing dog to pull excessively',
      'Session too long',
      'Poor body mechanics'
    ],
    red_flags: [
      'Straining or extreme effort',
      'Loss of proper gait',
      'Pain response',
      'Refusal to move forward'
    ],
    progression: 'Increase resistance. Extend distance to 20-30 feet. Add gentle inclines.',
    contraindications: 'Cardiovascular issues, acute joint pain, recent surgery, tracheal problems',
    difficulty_level: 'Advanced'
  },

  {
    code: 'JUMP_BOARD',
    name: 'Jump Board Exercise',
    category: 'Strengthening',
    description: 'Jumping onto elevated platform to develop explosive power and hindlimb strength.',
    equipment: ['Sturdy platform or box', 'Non-slip surface on top', 'Treats'],
    setup: 'Platform height 6-12 inches (adjust for dog size). Secure and stable.',
    steps: [
      'Position dog 2-3 feet from platform',
      'Use treat or toy as lure',
      'Encourage jump onto platform',
      'Ensure all four feet land on platform',
      'Hold position 3-5 seconds',
      'Step down slowly (don\'t jump down)',
      'Complete 5-10 repetitions'
    ],
    good_form: [
      'Powerful, coordinated jump up',
      'All four feet land safely',
      'Balanced landing',
      'Controlled step down'
    ],
    common_mistakes: [
      'Platform too high initially',
      'Allowing jumping down',
      'Too many reps',
      'Slippery surface'
    ],
    red_flags: [
      'Refusal or fear',
      'Poor landing coordination',
      'Pain response',
      'Limping after exercise'
    ],
    progression: 'Increase height to 16-20 inches. Add multiple jumps. Increase reps to 15-20.',
    contraindications: 'Joint instability, acute pain, recent surgery, poor conditioning, fear',
    difficulty_level: 'Advanced'
  },

  {
    code: 'POLE_WEAVE',
    name: 'Pole Weaving',
    category: 'Strengthening',
    description: 'Weaving through poles to strengthen core, improve lateral flexibility and coordination.',
    equipment: ['6-8 poles or cones', 'Leash', 'Treats'],
    setup: 'Set poles 24-30 inches apart in straight line. Non-slip surface.',
    steps: [
      'Start with dog on left side',
      'Weave through poles at controlled pace',
      'Maintain proper weaving pattern',
      'Complete 2-3 passes',
      'Switch to dog on right side',
      'Complete 2-3 more passes',
      'Monitor for fatigue'
    ],
    good_form: [
      'Smooth, fluid weaving motion',
      'Proper body flexion through poles',
      'Consistent pace',
      'Equal work both directions'
    ],
    common_mistakes: [
      'Poles too close together',
      'Moving too quickly',
      'Only working one direction',
      'Poor handling technique'
    ],
    red_flags: [
      'Hitting or knocking poles',
      'Severe difficulty coordinating',
      'Pain response during flexion',
      'Refusal to complete'
    ],
    progression: 'Decrease pole spacing. Increase speed slightly. Add more poles. Remove leash.',
    contraindications: 'Severe spinal issues, acute pain, poor coordination, extreme fear',
    difficulty_level: 'Advanced'
  },

  {
    code: 'TROT_CIRCLES',
    name: 'Circle Trotting',
    category: 'Strengthening',
    description: 'Trotting in circles to strengthen inside hindlimb and improve balance during turns.',
    equipment: ['Cone or marker', 'Leash', 'Open area'],
    setup: 'Mark center point. Create 15-20 foot diameter circle.',
    steps: [
      'Trot dog in circle at moderate pace',
      'Complete 3-5 circles clockwise',
      'Rest 30-60 seconds',
      'Trot 3-5 circles counter-clockwise',
      'Monitor gait and symmetry',
      'Observe weight bearing through turns',
      'Total 6-10 circles each direction'
    ],
    good_form: [
      'Consistent trot rhythm',
      'Proper diagonal limb pairing',
      'Smooth turns',
      'Equal work both directions'
    ],
    common_mistakes: [
      'Circles too small (tight turns)',
      'Pace too fast',
      'Unequal work each direction',
      'Not monitoring fatigue'
    ],
    red_flags: [
      'Difficulty maintaining trot',
      'Obvious asymmetry',
      'Pain or reluctance one direction',
      'Excessive fatigue'
    ],
    progression: 'Decrease circle diameter. Increase speed. Extend to 8-12 circles. Add hills.',
    contraindications: 'Vestibular disease, severe lameness, acute pain, cardiac issues',
    difficulty_level: 'Advanced'
  },

  {
    code: 'BACKWARD_HILL',
    name: 'Backward Hill Walking',
    category: 'Strengthening',
    description: 'Walking backwards up incline for advanced quadriceps and core strengthening.',
    equipment: ['Gentle hill or ramp', 'Hallway or guide rails', 'Treats'],
    setup: 'Position dog at base of gentle incline (5-10 degrees). Use guides if available.',
    steps: [
      'Have dog face downhill',
      'Give "back" command',
      'Encourage slow backward steps uphill',
      'Use treat lure or guidance',
      'Back 5-10 steps up incline',
      'Turn and walk forward down',
      'Complete 3-5 repetitions'
    ],
    good_form: [
      'Controlled backward motion',
      'Straight line path',
      'Proper paw placement',
      'Strong hindlimb engagement'
    ],
    common_mistakes: [
      'Incline too steep initially',
      'Distance too long',
      'Not guiding direction',
      'Allowing crooked backing'
    ],
    red_flags: [
      'Inability to coordinate backward motion',
      'Severe difficulty or refusal',
      'Loss of balance',
      'Pain response'
    ],
    progression: 'Increase incline angle. Extend distance to 15-20 steps. Remove guides.',
    contraindications: 'Severe ataxia, acute joint pain, balance disorders, extreme fear',
    difficulty_level: 'Advanced'
  }
];

module.exports = STRENGTHENING_EXERCISES;
