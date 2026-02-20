// ============================================================================
// ACTIVE ASSISTED EXERCISES (10 exercises)
// ============================================================================

const ACTIVE_ASSISTED_EXERCISES = [
  {
    code: 'SIT_STAND',
    name: 'Sit-to-Stand Transitions',
    category: 'Active Assisted',
    description: 'Controlled sitting and standing to strengthen hindlimb muscles and improve weight-bearing.',
    equipment: ['Non-slip surface', 'Treats', 'Optional: assistance harness'],
    setup: 'Position dog on non-slip flooring with clear space. Have treats ready for motivation.',
    steps: [
      'Command dog to sit with proper square position',
      'Ensure weight evenly distributed on both hindlimbs',
      'Use treat to lure into standing position',
      'Verify all four feet maintain contact',
      'Hold standing for 3-5 seconds',
      'Return to sit position with control',
      'Repeat 5-10 times per session'
    ],
    good_form: [
      'Square, symmetrical sit position',
      'Smooth transition without rushing',
      'Equal weight bearing on hindlimbs',
      'Controlled eccentric lowering'
    ],
    common_mistakes: [
      'Allowing crooked or tucked sits',
      'Moving too quickly through transitions',
      'Dog shifting weight to forelimbs',
      'Using slippery surfaces'
    ],
    red_flags: [
      'Unwillingness to bear weight',
      'Obvious lameness during transition',
      'Collapsing or loss of balance',
      'Pain vocalization',
      'Trembling or weakness'
    ],
    progression: 'Increase reps to 15-20. Add 3-5 second holds in standing. Progress to sit-stand on incline.',
    contraindications: 'Severe pain, unstable joints, fracture healing <6 weeks, severe weakness',
    difficulty_level: 'Easy'
  },

  {
    code: 'WEIGHT_SHIFT',
    name: 'Weight Shifting Exercises',
    category: 'Active Assisted',
    description: 'Dynamic weight transfer exercises to improve balance, proprioception, and limb loading.',
    equipment: ['Treats', 'Your hands for guidance'],
    setup: 'Dog standing square on level, non-slip surface.',
    steps: [
      'Ensure dog starts in square standing position',
      'Use treat to shift dog\'s weight to one side',
      'Hold shifted position for 5-10 seconds',
      'Return to center square stance',
      'Shift weight to opposite side',
      'Encourage loading onto affected limb',
      'Complete 5 shifts each direction'
    ],
    good_form: [
      'Controlled, deliberate weight transfers',
      'Dog maintains balance throughout',
      'All four feet remain planted',
      'Smooth return to center'
    ],
    common_mistakes: [
      'Shifting too far causing imbalance',
      'Moving too quickly',
      'Not holding shifted position',
      'Allowing foot lifting'
    ],
    red_flags: [
      'Unable to maintain any balance',
      'Extreme reluctance to load affected limb',
      'Trembling or weakness',
      'Joint collapse under load'
    ],
    progression: 'Increase hold to 15 seconds. Add unstable surface (pad). Increase degree of shift.',
    contraindications: 'Severe ataxia, acute pain, joint instability, recent surgery <2 weeks',
    difficulty_level: 'Easy'
  },

  {
    code: 'SLOW_WALK',
    name: 'Controlled Slow Walking',
    category: 'Active Assisted',
    description: 'Deliberate slow-paced walking to promote proper gait mechanics and weight bearing.',
    equipment: ['Leash', 'Harness', 'Non-slip surface or grass'],
    setup: 'Short leash, dog at side. Start on level, non-slip surface.',
    steps: [
      'Begin walking at very slow, controlled pace',
      'Use short leash to prevent rushing',
      'Encourage full weight bearing each step',
      'Watch for proper limb placement',
      'Walk straight lines for 20-30 feet',
      'Turn slowly and deliberately',
      'Total session 5-10 minutes'
    ],
    good_form: [
      'Consistent slow pace maintained',
      'Even weight bearing on all limbs',
      'Proper paw placement',
      'Smooth, controlled gait'
    ],
    common_mistakes: [
      'Allowing dog to rush or pull',
      'Walking on slippery surfaces',
      'Session too long causing fatigue',
      'Not monitoring gait quality'
    ],
    red_flags: [
      'Increased lameness during walk',
      'Toe dragging or knuckling',
      'Dog stops frequently',
      'Obvious pain or reluctance'
    ],
    progression: 'Increase duration to 15-20 minutes. Add gentle inclines. Progress to varied terrain.',
    contraindications: 'Non-weight bearing lameness, acute fracture, severe ataxia',
    difficulty_level: 'Easy'
  },

  {
    code: 'STAND_TALL',
    name: 'Standing Tall (Rear Leg Dance)',
    category: 'Active Assisted',
    description: 'Rear limb strengthening by having dog stand on hindlimbs with forelimbs elevated.',
    equipment: ['Treats', 'Wall or stable surface for support'],
    setup: 'Dog facing wall or owner. Clear space around. Have high-value treats.',
    steps: [
      'Hold treat above dog\'s head',
      'Encourage dog to stand on hindlimbs only',
      'Forelimbs can touch wall for balance',
      'Hold position for 3-5 seconds initially',
      'Lower slowly back to all fours',
      'Reward immediately',
      'Repeat 3-5 times per session'
    ],
    good_form: [
      'Balanced stance on both hindlimbs',
      'Straight spine alignment',
      'Controlled ascent and descent',
      'Hold duration consistent'
    ],
    common_mistakes: [
      'Allowing twisting or leaning',
      'Not providing wall support initially',
      'Hold duration too long causing fatigue',
      'Rushing descent causing impact'
    ],
    red_flags: [
      'Inability to bear weight on hindlimbs',
      'Severe wobbling or imbalance',
      'Pain response',
      'Collapse from position'
    ],
    progression: 'Increase hold to 10-15 seconds. Remove wall support. Add small hops.',
    contraindications: 'Severe hip/stifle pathology, spinal issues, balance disorders, weakness',
    difficulty_level: 'Moderate'
  },

  {
    code: 'CURB_WALK',
    name: 'Curb/Step Walking',
    category: 'Active Assisted',
    description: 'Walking up and down small curbs or steps to improve joint flexion and strength.',
    equipment: ['Leash', 'Curb or 2-4 inch step', 'Non-slip surface'],
    setup: 'Position dog parallel to curb. Use short leash for control.',
    steps: [
      'Walk slowly parallel to curb',
      'Position inside legs on curb surface',
      'Outside legs remain on lower surface',
      'Walk length of curb maintaining position',
      'Turn and reverse (switch which legs elevated)',
      'Complete 2-3 passes each direction',
      'Monitor gait and fatigue'
    ],
    good_form: [
      'Consistent pace maintained',
      'Full weight bearing on elevated legs',
      'Proper joint flexion/extension',
      'Smooth gait pattern'
    ],
    common_mistakes: [
      'Pace too fast',
      'Not maintaining parallel position',
      'One direction only (not alternating)',
      'Session too long'
    ],
    red_flags: [
      'Dragging paws on curb',
      'Refusal to place weight on elevation',
      'Increased lameness',
      'Loss of balance'
    ],
    progression: 'Increase height to 4-6 inches. Add perpendicular step-ups. Extend duration.',
    contraindications: 'Severe ataxia, acute pain, unstable joints, non-weight bearing status',
    difficulty_level: 'Moderate'
  },

  {
    code: 'FIGURE_8',
    name: 'Figure-Eight Walking',
    category: 'Active Assisted',
    description: 'Walking in figure-eight pattern to promote lateral flexion and improved proprioception.',
    equipment: ['Two cones or markers', 'Leash', 'Non-slip surface'],
    setup: 'Place cones 6-8 feet apart. Dog on short leash.',
    steps: [
      'Walk slow figure-eight around cones',
      'Maintain consistent slow pace',
      'Focus on smooth turns',
      'Complete 5 figure-eights clockwise',
      'Repeat 5 figure-eights counter-clockwise',
      'Watch for weight bearing through turns',
      'Rest between sets'
    ],
    good_form: [
      'Smooth, continuous movement',
      'Proper weight bearing through turns',
      'Consistent pace',
      'Balanced loading both directions'
    ],
    common_mistakes: [
      'Rushing through pattern',
      'Making turns too tight',
      'Only circling one direction',
      'Poor head/body positioning'
    ],
    red_flags: [
      'Stumbling or loss of balance',
      'Resistance to turning one direction',
      'Increased lameness',
      'Crossing over or interference'
    ],
    progression: 'Decrease cone distance. Increase repetitions. Add elevation changes.',
    contraindications: 'Severe vestibular disease, acute joint pain, non-weight bearing limbs',
    difficulty_level: 'Moderate'
  },

  {
    code: 'BACKING_UP',
    name: 'Backing Up Exercise',
    category: 'Active Assisted',
    description: 'Controlled backward walking to engage different muscle groups and improve coordination.',
    equipment: ['Hallway or narrow space', 'Treats'],
    setup: 'Position in hallway or between furniture to guide direction.',
    steps: [
      'Stand facing dog',
      'Give verbal "back" command',
      'Step toward dog encouraging backward steps',
      'Use hand signal or treat lure if needed',
      'Have dog take 5-10 steps backward',
      'Ensure controlled, deliberate steps',
      'Repeat 3-5 times'
    ],
    good_form: [
      'Straight backward path',
      'Controlled, deliberate steps',
      'Proper paw placement',
      'Full weight bearing each step'
    ],
    common_mistakes: [
      'Allowing crooked backing',
      'Moving too quickly',
      'Not enough repetitions',
      'Backing on slippery surface'
    ],
    red_flags: [
      'Inability to coordinate backward movement',
      'Dragging toes',
      'Loss of balance',
      'Pain response'
    ],
    progression: 'Increase distance to 15-20 steps. Add uphill backward walk. Include obstacles.',
    contraindications: 'Severe ataxia, balance disorders, acute pain, fear/anxiety',
    difficulty_level: 'Moderate'
  },

  {
    code: 'SIDE_STEP',
    name: 'Side-Stepping (Lateral Walking)',
    category: 'Active Assisted',
    description: 'Lateral movement to strengthen hip abductors/adductors and improve lateral balance.',
    equipment: ['Wall or guide rail', 'Treats', 'Non-slip surface'],
    setup: 'Position dog parallel to wall with one side closest to wall.',
    steps: [
      'Stand in front of dog',
      'Use treat or hand signal to encourage side-step',
      'Have dog take 5-10 steps laterally',
      'Maintain parallel position to wall',
      'Turn and side-step opposite direction',
      'Keep movements slow and controlled',
      'Complete 3 sets each direction'
    ],
    good_form: [
      'True lateral movement (not forward)',
      'Proper crossing over of limbs',
      'Smooth, controlled steps',
      'Equal work both directions'
    ],
    common_mistakes: [
      'Allowing forward movement',
      'Moving too quickly',
      'Uneven work each direction',
      'Poor limb coordination'
    ],
    red_flags: [
      'Severe difficulty coordinating movement',
      'Tripping over own feet',
      'Refusal to move laterally',
      'Pain or reluctance one direction'
    ],
    progression: 'Increase steps to 15-20. Remove wall guidance. Add gentle resistance.',
    contraindications: 'Severe neurological deficits, acute hip pain, joint instability',
    difficulty_level: 'Moderate'
  },

  {
    code: 'SLOW_TROT',
    name: 'Controlled Slow Trot',
    category: 'Active Assisted',
    description: 'Progression from walking to slow trotting gait to increase cardiovascular demand and strength.',
    equipment: ['Leash', 'Harness', 'Level ground or gentle incline'],
    setup: 'Dog on leash at side. Begin on level, non-slip surface.',
    steps: [
      'Start with slow walk for warm-up',
      'Gradually increase pace to slow trot',
      'Maintain controlled, consistent speed',
      'Monitor gait quality and symmetry',
      'Continue for 30-60 seconds initially',
      'Return to walk pace',
      'Repeat 3-5 trot intervals'
    ],
    good_form: [
      'Consistent trot rhythm',
      'Diagonal limb pairing maintained',
      'Even weight distribution',
      'No rushing or bolting'
    ],
    common_mistakes: [
      'Allowing too fast of pace',
      'Intervals too long',
      'Not warming up first',
      'Irregular terrain'
    ],
    red_flags: [
      'Bunny hopping instead of trotting',
      'Obvious lameness at trot',
      'Excessive panting or fatigue',
      'Reluctance to trot'
    ],
    progression: 'Increase interval duration to 2-3 minutes. Add gentle hills. Transition to off-leash trot.',
    contraindications: 'Grade 3+ lameness, acute pain, cardiac issues, respiratory disease',
    difficulty_level: 'Moderate'
  },

  {
    code: 'STAIR_CLIMB',
    name: 'Stair Climbing (Assisted)',
    category: 'Active Assisted',
    description: 'Controlled stair ascent and descent to build hindlimb strength and improve joint range of motion.',
    equipment: ['Stairs with handrail', 'Harness or sling', 'Non-slip stair treads'],
    setup: 'Dog in harness. Handler ready to assist. Start with 2-4 steps only.',
    steps: [
      'Position dog at base of stairs',
      'Provide support via harness if needed',
      'Command dog to climb slowly',
      'Encourage one step at a time',
      'Watch for proper limb placement',
      'Pause at top for brief rest',
      'Descend slowly with support',
      'Begin with 2-4 steps only'
    ],
    good_form: [
      'Deliberate, controlled pace',
      'Full weight bearing each step',
      'Proper paw placement on treads',
      'No rushing or jumping'
    ],
    common_mistakes: [
      'Too many steps initially',
      'Allowing dog to rush',
      'Not providing adequate support',
      'Descending too quickly'
    ],
    red_flags: [
      'Refusal or extreme reluctance',
      'Bunny-hopping up stairs',
      'Collapsing or weakness',
      'Increased lameness after'
    ],
    progression: 'Increase to 6-8 steps. Reduce support. Add 2-3 flights. Progress to independent climbing.',
    contraindications: 'Severe ataxia, grade 4+ lameness, acute pain, recent major surgery',
    difficulty_level: 'Advanced'
  }
];

module.exports = ACTIVE_ASSISTED_EXERCISES;
