// ============================================================================
// AQUATIC THERAPY EXERCISES (5 exercises)
// ============================================================================

const AQUATIC_EXERCISES = [
  {
    code: 'UNDERWATER_TREAD',
    name: 'Underwater Treadmill Walking',
    category: 'Hydrotherapy',
    description: 'Walking on submerged treadmill for low-impact strengthening and range of motion.',
    equipment: ['Underwater treadmill', 'Life vest (if needed)', 'Towels'],
    setup: 'Fill tank to appropriate depth (typically mid-femur to hip level). Water temperature 85-92°F.',
    steps: [
      'Allow dog to acclimate to empty tank',
      'Put on life vest if needed',
      'Slowly fill tank to desired level',
      'Start treadmill at very slow speed (0.5-1.0 mph)',
      'Walk for 5-10 minutes initially',
      'Monitor gait and fatigue',
      'Gradually drain and exit'
    ],
    good_form: [
      'Proper gait mechanics maintained',
      'Full limb extension',
      'Consistent pace',
      'Calm, relaxed demeanor'
    ],
    common_mistakes: [
      'Water too deep initially',
      'Speed too fast',
      'Session too long',
      'Water temperature incorrect'
    ],
    red_flags: [
      'Panic or extreme stress',
      'Inability to maintain gait',
      'Overheating (panting excessively)',
      'Loss of balance or floating'
    ],
    progression: 'Increase duration to 20-30 minutes. Increase speed to 2-3 mph. Adjust water depth. Add jets/resistance.',
    contraindications: 'Open wounds, skin infections, fear of water, cardiac issues, uncontrolled seizures',
    difficulty_level: 'Moderate'
  },

  {
    code: 'POOL_SWIM',
    name: 'Therapeutic Swimming',
    category: 'Hydrotherapy',
    description: 'Free swimming for cardiovascular fitness and full-body strengthening with minimal joint stress.',
    equipment: ['Pool or controlled water body', 'Life vest', 'Pool ramp or steps', 'Towels'],
    setup: 'Water should be 85-90°F. Clear area. Handler in water or at edge.',
    steps: [
      'Fit dog with appropriate life vest',
      'Enter water gradually using ramp',
      'Allow acclimation (1-2 minutes)',
      'Encourage swimming in straight line',
      'Swim for 30-60 seconds',
      'Rest on ramp or at edge',
      'Repeat 5-8 swimming intervals'
    ],
    good_form: [
      'Horizontal body position',
      'Symmetrical limb movement',
      'Controlled breathing',
      'Efficient forward propulsion'
    ],
    common_mistakes: [
      'Sessions too long initially',
      'Not using life vest',
      'Water temperature too cold',
      'Inadequate rest intervals'
    ],
    red_flags: [
      'Vertical swimming (poor form)',
      'Panic or severe stress',
      'Excessive fatigue',
      'Hypothermia signs'
    ],
    progression: 'Increase swim duration to 2-3 minutes. Add 10-15 intervals. Remove life vest gradually. Add retrieval activities.',
    contraindications: 'Water fear/phobia, open wounds, ear infections, cardiac disease, respiratory issues',
    difficulty_level: 'Moderate'
  },

  {
    code: 'WATER_WALKING',
    name: 'Shallow Water Walking',
    category: 'Hydrotherapy',
    description: 'Walking in shallow water (belly to mid-chest depth) for gentle resistance training.',
    equipment: ['Pool, pond, or beach access', 'Leash', 'Life vest (optional)', 'Towels'],
    setup: 'Select area with gradual depth. Water depth ankle to mid-chest.',
    steps: [
      'Enter water gradually',
      'Start in shallow depth (ankle-level)',
      'Walk slowly through water',
      'Gradually move to deeper water',
      'Walk at mid-chest depth for 5-10 minutes',
      'Return to shallow water',
      'Exit and dry thoroughly'
    ],
    good_form: [
      'Natural walking gait maintained',
      'Full limb extension',
      'Comfortable, confident movement',
      'Appropriate depth maintained'
    ],
    common_mistakes: [
      'Water too deep too quickly',
      'Walking on slippery bottom',
      'Session too long',
      'Not drying properly after'
    ],
    red_flags: [
      'Fear or reluctance',
      'Difficulty maintaining balance',
      'Swimming instead of walking',
      'Signs of cold stress'
    ],
    progression: 'Increase depth gradually. Extend duration to 15-20 minutes. Add faster pace. Include direction changes.',
    contraindications: 'Severe water fear, open wounds, skin conditions, extreme cold sensitivity',
    difficulty_level: 'Moderate'
  },

  {
    code: 'WATER_RETRIEVE',
    name: 'Water Retrieval Exercise',
    category: 'Hydrotherapy',
    description: 'Fetching objects in water to combine cardiovascular exercise with motivation and fun.',
    equipment: ['Floating toys or bumpers', 'Pool or shallow water', 'Life vest', 'Towels'],
    setup: 'Select appropriate water depth. Have floating toys ready.',
    steps: [
      'Begin in shallow water where dog can stand',
      'Throw floating toy short distance',
      'Encourage retrieval',
      'Progress to swimming depth gradually',
      'Complete 5-8 retrieves',
      'Include rest periods',
      'End while dog still motivated'
    ],
    good_form: [
      'Eager, motivated retrieval',
      'Efficient swimming',
      'Proper return to handler',
      'Good fatigue management'
    ],
    common_mistakes: [
      'Too many retrieves',
      'Objects thrown too far initially',
      'Not monitoring fatigue',
      'Continuing past interest'
    ],
    red_flags: [
      'Loss of interest or motivation',
      'Excessive fatigue',
      'Poor swimming form',
      'Resource guarding toy'
    ],
    progression: 'Increase distance. Add multiple retrieves. Remove life vest. Include varied entry/exit points.',
    contraindications: 'Non-retrievers, toy guarding issues, severe fatigue, cardiac limitations',
    difficulty_level: 'Moderate'
  },

  {
    code: 'AQUA_JOG',
    name: 'Aqua Jogging',
    category: 'Hydrotherapy',
    description: 'Jogging in chest-deep water for advanced cardiovascular and strengthening work.',
    equipment: ['Pool', 'Life vest', 'Leash', 'Towels'],
    setup: 'Water depth at mid-chest to shoulder level. Clear swimming lane.',
    steps: [
      'Enter water and acclimate',
      'Begin with walking pace',
      'Gradually increase to jogging pace',
      'Maintain for 30-60 seconds',
      'Return to walk pace for recovery',
      'Repeat 5-8 jog intervals',
      'Total session 15-20 minutes'
    ],
    good_form: [
      'Consistent elevated pace',
      'Proper limb extension',
      'Horizontal body position',
      'Controlled breathing'
    ],
    common_mistakes: [
      'Pace too fast too soon',
      'Intervals too long',
      'Inadequate recovery time',
      'Water too deep (dog swimming not jogging)'
    ],
    red_flags: [
      'Unable to maintain jogging form',
      'Excessive fatigue',
      'Transition to swimming',
      'Respiratory distress'
    ],
    progression: 'Increase interval duration to 2-3 minutes. Reduce recovery time. Add jets for resistance. Increase total session time.',
    contraindications: 'Cardiac disease, severe respiratory issues, poor swimming ability, extreme fatigue',
    difficulty_level: 'Advanced'
  }
];

// ============================================================================
// FUNCTIONAL TRAINING EXERCISES (5 exercises)
// ============================================================================

const FUNCTIONAL_EXERCISES = [
  {
    code: 'CAR_ENTRY',
    name: 'Car Entry/Exit Practice',
    category: 'Functional Training',
    description: 'Practicing getting in and out of vehicles safely to restore functional independence.',
    equipment: ['Vehicle with appropriate height', 'Ramp or steps (if needed)', 'Harness'],
    setup: 'Park vehicle safely. Open door. Prepare ramp if using.',
    steps: [
      'Position dog near vehicle opening',
      'Encourage entry using treat or command',
      'Support with harness if needed',
      'Have dog enter vehicle',
      'Hold position briefly',
      'Exit vehicle with support',
      'Repeat 3-5 times'
    ],
    good_form: [
      'Confident approach',
      'Controlled jump/climb up',
      'Safe positioning inside',
      'Controlled exit'
    ],
    common_mistakes: [
      'No ramp for inappropriate height',
      'Rushing the process',
      'Not providing support',
      'Vehicle moving or unstable'
    ],
    red_flags: [
      'Inability to complete entry',
      'Pain response during jump',
      'Fear or extreme reluctance',
      'Loss of balance or falling'
    ],
    progression: 'Reduce support gradually. Practice with different vehicles. Add distractions. Remove ramp if appropriate.',
    contraindications: 'Acute pain, recent surgery <4 weeks, severe weakness, extreme fear',
    difficulty_level: 'Moderate'
  },

  {
    code: 'COUCH_ON_OFF',
    name: 'Furniture Climbing (Couch/Bed)',
    category: 'Functional Training',
    description: 'Getting on and off furniture safely to restore normal household function.',
    equipment: ['Couch or bed', 'Steps or ramp (if needed)', 'Non-slip mat'],
    setup: 'Position near furniture. Ensure stable footing.',
    steps: [
      'Approach furniture at appropriate angle',
      'Command "up" with encouragement',
      'Jump or climb onto surface',
      'Settle briefly on furniture',
      'Command "off"',
      'Step or jump down with control',
      'Repeat 5-8 times'
    ],
    good_form: [
      'Controlled ascent',
      'Balanced landing',
      'Calm settling',
      'Controlled descent'
    ],
    common_mistakes: [
      'Furniture too high initially',
      'Not using ramp when needed',
      'Allowing unsafe jumping',
      'Too many repetitions'
    ],
    red_flags: [
      'Refusing to attempt',
      'Pain during jump',
      'Poor landing coordination',
      'Falling or slipping'
    ],
    progression: 'Increase furniture height. Remove ramp/steps. Add distractions. Practice from both sides.',
    contraindications: 'Joint instability, acute pain, recent surgery, severe weakness',
    difficulty_level: 'Moderate'
  },

  {
    code: 'DOOR_THRESHOLD',
    name: 'Door Threshold Navigation',
    category: 'Functional Training',
    description: 'Stepping over door thresholds and transitions to restore household mobility.',
    equipment: ['Doorways with thresholds', 'Leash (optional)', 'Non-slip surfaces'],
    setup: 'Practice at various thresholds in home.',
    steps: [
      'Approach threshold slowly',
      'Pause before threshold',
      'Step deliberately over threshold',
      'Place all four feet carefully',
      'Continue through doorway',
      'Practice in both directions',
      'Repeat 5-10 transitions'
    ],
    good_form: [
      'Deliberate foot placement',
      'Smooth transition',
      'No hesitation',
      'All feet clear threshold'
    ],
    common_mistakes: [
      'Moving too quickly',
      'Not watching foot placement',
      'Skipping challenging thresholds',
      'Only practicing one direction'
    ],
    red_flags: [
      'Tripping over threshold',
      'Extreme caution or fear',
      'Knuckling or dragging toes',
      'Inability to complete'
    ],
    progression: 'Add higher thresholds. Include in daily routines. Reduce visual attention. Increase pace.',
    contraindications: 'Severe ataxia, recent surgery on limbs, extreme weakness, vision impairment',
    difficulty_level: 'Easy'
  },

  {
    code: 'PLAY_BOW',
    name: 'Play Bow Stretch',
    category: 'Functional Training',
    description: 'Natural play bow position for shoulder stretching and functional movement pattern.',
    equipment: ['Treats', 'Non-slip surface', 'Optional: target object'],
    setup: 'Dog standing on non-slip surface. Clear space in front.',
    steps: [
      'Hold treat at ground level in front of dog',
      'Lure dog into bow position',
      'Chest lowered, hindquarters elevated',
      'Front legs extended forward',
      'Hold position 5-10 seconds',
      'Release to standing',
      'Repeat 5-8 times'
    ],
    good_form: [
      'Full shoulder extension',
      'Hindquarters remain elevated',
      'Smooth entry and exit',
      'Hold maintained steadily'
    ],
    common_mistakes: [
      'Not achieving full stretch',
      'Allowing hindquarters to drop',
      'Hold duration too long',
      'Forcing into position'
    ],
    red_flags: [
      'Pain in shoulders',
      'Inability to hold position',
      'Severe discomfort',
      'Loss of balance'
    ],
    progression: 'Increase hold duration to 15-20 seconds. Add multiple reps. Include in warm-up routine.',
    contraindications: 'Acute shoulder pain, biceps tendonitis, recent forelimb surgery, severe elbow dysplasia',
    difficulty_level: 'Easy'
  },

  {
    code: 'GREETING_SIT',
    name: 'Controlled Greeting/Sitting',
    category: 'Functional Training',
    description: 'Practicing calm sitting for greetings to restore social function and impulse control.',
    equipment: ['Treats', 'Leash', 'Helper for practice'],
    setup: 'Quiet environment initially. Helper approaches dog.',
    steps: [
      'Dog in standing position',
      'Approach by helper begins',
      'Command sit as helper approaches',
      'Maintain sit during greeting',
      'Hold for 10-15 seconds',
      'Release and reward',
      'Repeat with different approaches'
    ],
    good_form: [
      'Prompt sit response',
      'Maintained position',
      'Calm demeanor',
      'No jumping or lunging'
    ],
    common_mistakes: [
      'Helper too exciting initially',
      'Not reinforcing sit',
      'Expecting too long hold',
      'Inconsistent practice'
    ],
    red_flags: [
      'Inability to sit',
      'Extreme excitement preventing sit',
      'Pain during sit',
      'Aggression during greeting'
    ],
    progression: 'Add more distracting greeters. Extend hold duration. Practice in various locations. Reduce treat frequency.',
    contraindications: 'Severe pain during sitting, acute hip issues, extreme reactivity, aggression',
    difficulty_level: 'Moderate'
  }
];

// Combine all exercises from Part 5
const EXERCISES_PART5 = [
  ...AQUATIC_EXERCISES,
  ...FUNCTIONAL_EXERCISES
];

module.exports = EXERCISES_PART5;