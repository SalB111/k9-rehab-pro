// ============================================================================
// EXERCISE DATABASE EXPANSION - PART 7
// K9-REHAB-PRO - 80 ADDITIONAL VET-APPROVED EXERCISES
// Following Dr. Denis Millis & Dr. Darryl Levine Standards
// Certified Canine Rehabilitation Protocols
// ============================================================================

const EXERCISES_PART7 = [
  
  // ========================================
  // ADVANCED HYDROTHERAPY (15 exercises)
  // ========================================
  {
    code: 'UWTM_FORWARD',
    name: 'Underwater Treadmill - Forward Walking',
    category: 'Hydrotherapy',
    description: 'Controlled forward walking in underwater treadmill utilizing buoyancy and resistance for controlled loading and cardiovascular conditioning.',
    equipment: ['Underwater treadmill', 'Water temperature 82-92°F', 'Life vest if needed'],
    setup: 'Fill water to desired height: hip level for weight bearing reduction, chest level for increased cardiovascular demand.',
    steps: [
      'Acclimate dog to treadmill environment before starting',
      'Place dog on stationary belt, ensure proper positioning',
      'Start belt at slowest speed (0.5 mph)',
      'Gradually increase to working speed over 2-3 minutes',
      'Maintain even gait pattern throughout session',
      'Monitor for fatigue, breathing rate, and lameness',
      'Cool down with 2-minute slow walk before stopping',
      'Session duration: 10-30 minutes based on conditioning'
    ],
    good_form: [
      'Even weight distribution across all limbs',
      'Coordinated gait pattern without circumduction',
      'Head and neck in neutral alignment',
      'Visible propulsion from affected limb',
      'Smooth transitions between speeds'
    ],
    common_mistakes: [
      'Starting speed too fast causing anxiety',
      'Insufficient acclimation period',
      'Water temperature outside therapeutic range',
      'Session duration exceeding dog tolerance',
      'Not monitoring for signs of fatigue'
    ],
    red_flags: [
      'Severe lameness worsening during session',
      'Excessive panting or distress vocalizations',
      'Loss of coordination or stumbling',
      'Dog attempting to stop or exit prematurely',
      'Pale mucous membranes or altered mentation'
    ],
    progression: 'Increase speed in 0.2 mph increments. Lower water level to increase weight bearing. Add incline (5-15°) to increase hindlimb recruitment. Progress duration to 45 minutes',
    contraindications: 'Open wounds, ear infections, urinary/fecal incontinence, severe cardiopulmonary disease, uncontrolled seizures, extreme fear/aggression',
    difficulty_level: 'Moderate'
  },

  {
    code: 'UWTM_BACKWARD',
    name: 'Underwater Treadmill - Backward Walking (Retrograde)',
    category: 'Hydrotherapy',
    description: 'Backward walking in UWTM to activate hip extensors, increase stifle flexion, and improve proprioceptive awareness.',
    equipment: ['Underwater treadmill', 'Spotter', 'Treats for motivation'],
    setup: 'Water level at hip height. Ensure dog is comfortable with forward walking first.',
    steps: [
      'Position dog facing rear of treadmill',
      'Begin with belt stationary, lure dog backward with treats',
      'Start belt in reverse at 0.3 mph',
      'Use target stick or treats to encourage backward motion',
      'Maintain for 30-second intervals initially',
      'Monitor for proper limb placement',
      'Alternate with forward walking for variety',
      'Total backward walking: 5-15 minutes per session'
    ],
    good_form: [
      'Increased hip extension and stifle flexion',
      'Coordinated reciprocal stepping pattern',
      'Proper paw placement without dragging',
      'Smooth, controlled movements',
      'Dog maintains balance throughout'
    ],
    common_mistakes: [
      'Starting in reverse without forward acclimation',
      'Speed too fast causing loss of coordination',
      'Insufficient motivation causing resistance',
      'Not alternating with forward walking',
      'Excessive session duration causing fatigue'
    ],
    red_flags: [
      'Dog repeatedly losing balance or stumbling',
      'Excessive stress or panic response',
      'Dragging paws or knuckling',
      'Increased lameness after session',
      'Refusal to participate despite motivation'
    ],
    progression: 'Increase speed to 0.6 mph maximum. Increase duration to 5-minute intervals. Lower water level to mid-thigh. Add 5-10° incline for advanced conditioning',
    contraindications: 'Same as forward UWTM plus severe hip dysplasia with pain, acute spinal injury, severe ataxia',
    difficulty_level: 'Advanced'
  },

  {
    code: 'UWTM_LATERAL',
    name: 'Underwater Treadmill - Lateral Walking (Side-stepping)',
    category: 'Hydrotherapy',
    description: 'Side-stepping in UWTM to strengthen hip abductors/adductors and improve lateral stability.',
    equipment: ['Underwater treadmill', 'Target stick', 'Spotter'],
    setup: 'Water at hip height. Position dog perpendicular to treadmill direction.',
    steps: [
      'Position dog sideways on stationary belt',
      'Use target stick to guide lateral movement',
      'Start belt at very slow speed (0.2 mph)',
      'Guide dog to side-step across width of belt',
      'Maintain lateral orientation throughout',
      'Complete 10-15 passes per direction',
      'Switch sides to work both directions equally',
      'Total duration: 10-15 minutes'
    ],
    good_form: [
      'Cross-over stepping pattern without stumbling',
      'Abduction and adduction clearly visible',
      'Trunk stability maintained',
      'Even weight distribution between limbs',
      'Smooth transitions at belt edges'
    ],
    common_mistakes: [
      'Allowing dog to rotate and walk forward',
      'Speed too fast for controlled cross-over',
      'Working only one direction',
      'Not using proper luring technique',
      'Session too long causing loss of form'
    ],
    red_flags: [
      'Unable to maintain lateral orientation',
      'Knuckling or dragging paws',
      'Loss of balance requiring intervention',
      'Signs of hip pain or reluctance',
      'Muscle trembling or exhaustion'
    ],
    progression: 'Increase speed to 0.5 mph. Decrease water level to mid-thigh. Add elastic resistance bands. Progress to lateral walking on land with resistance',
    contraindications: 'Severe hip dysplasia, acute hip/stifle injury, poor balance requiring assistance, neurological deficits affecting coordination',
    difficulty_level: 'Advanced'
  },

  {
    code: 'POOL_SWIM_HYDRO',
    name: 'Pool Swimming - Freestyle',
    category: 'Hydrotherapy',
    description: 'Controlled swimming in therapy pool for cardiovascular conditioning, full body range of motion, and non-weight bearing exercise.',
    equipment: ['Therapy pool', 'Life vest', 'Pool thermometer', 'Floating toys'],
    setup: 'Water temperature 82-88°F. Ensure safe entry/exit. Have rescue equipment ready.',
    steps: [
      'Fit dog with properly sized life vest',
      'Guide dog into pool using ramp or stairs',
      'Begin with 2-3 minute swim intervals',
      'Maintain straight swimming path',
      'Monitor for proper limb movement',
      'Allow rest breaks between intervals',
      'Encourage with floating toys if needed',
      'Total swim time: 5-20 minutes based on conditioning'
    ],
    good_form: [
      'Symmetrical forelimb paddling motion',
      'Visible hindlimb propulsion',
      'Head above water with relaxed breathing',
      'Horizontal body position',
      'Smooth, coordinated movement'
    ],
    common_mistakes: [
      'Sessions too long for conditioning level',
      'Not using life vest for safety',
      'Water temperature outside therapeutic range',
      'Forcing anxious dog into pool',
      'Insufficient rest between intervals'
    ],
    red_flags: [
      'Vertical swimming position (insufficient hindlimb use)',
      'Excessive coughing or water aspiration',
      'Panic or extreme distress',
      'Asymmetrical limb use or lameness',
      'Rapid fatigue or weakness'
    ],
    progression: 'Increase intervals to 5 minutes. Progress total duration to 30 minutes. Remove life vest once conditioned. Add fetch/retrieval activities. Incorporate circles and figure-8 patterns',
    contraindications: 'Open wounds, ear infections, respiratory disease, seizure disorder, extreme fear of water, inadequate swim skill',
    difficulty_level: 'Moderate'
  },

  {
    code: 'POOL_TREADING',
    name: 'Deep Water Treading',
    category: 'Hydrotherapy',
    description: 'Stationary treading in deep water to maximize cardiovascular demand and promote full range joint movement without weight bearing.',
    equipment: ['Therapy pool with deep section', 'Life vest', 'Spotter', 'Stopwatch'],
    setup: 'Water depth where dog cannot touch bottom. Life vest required. Spotter within arm reach.',
    steps: [
      'Ensure dog is comfortable with basic swimming first',
      'Guide dog to deep water area',
      'Position yourself as stationary target',
      'Encourage dog to tread in place',
      'Begin with 30-second intervals',
      'Provide rest by allowing dog to touch bottom',
      'Repeat for 5-8 intervals',
      'Monitor breathing rate and effort level'
    ],
    good_form: [
      'Vigorous paddling motion all four limbs',
      'Head well above water line',
      'Vertical to slight forward body tilt',
      'Coordinated limb movement',
      'Controlled breathing without distress'
    ],
    common_mistakes: [
      'Intervals too long causing exhaustion',
      'Not monitoring cardiovascular effort',
      'Insufficient rest between intervals',
      'Starting with deep water before acclimation',
      'Not using life vest for safety'
    ],
    red_flags: [
      'Excessive fatigue within first minute',
      'Difficulty keeping head above water',
      'Agonal breathing or gasping',
      'Loss of coordination',
      'Panic response or vocalization'
    ],
    progression: 'Increase intervals to 60-90 seconds. Progress to 10-12 intervals. Add directional changes while treading. Incorporate figure-8 treading patterns',
    contraindications: 'Cardiopulmonary disease, severe weakness, poor swimming ability, extreme anxiety, brachycephalic breeds with respiratory compromise',
    difficulty_level: 'Advanced'
  },

  {
    code: 'HYDRO_JETS',
    name: 'Underwater Jet Resistance Walking',
    category: 'Hydrotherapy',
    description: 'Walking against directed water jets in underwater treadmill to increase muscle activation and cardiovascular demand.',
    equipment: ['Underwater treadmill with jet system', 'Jets positioned anterior or lateral'],
    setup: 'Water at hip level. Start with low jet pressure. Position jets for desired resistance direction.',
    steps: [
      'Acclimate dog to basic UWTM first',
      'Begin walking at comfortable speed',
      'Activate jets at lowest setting',
      'Gradually increase jet pressure',
      'Maintain 5-10 minute intervals against jets',
      'Alternate with non-jet walking for recovery',
      'Monitor for signs of fatigue',
      'Total session: 20-30 minutes'
    ],
    good_form: [
      'Increased limb flexion against resistance',
      'Strong propulsive phase',
      'Maintained forward progression',
      'Coordinated gait despite resistance',
      'Even weight distribution'
    ],
    common_mistakes: [
      'Starting with jet pressure too high',
      'Not alternating with recovery periods',
      'Excessive session duration',
      'Jets positioned incorrectly',
      'Not adjusting pressure based on response'
    ],
    red_flags: [
      'Unable to progress forward against jets',
      'Loss of gait coordination',
      'Excessive fatigue or weakness',
      'Increased lameness during or after',
      'Stress behaviors or avoidance'
    ],
    progression: 'Increase jet pressure incrementally. Increase continuous jet duration to 15 minutes. Add lateral jets for multidirectional resistance. Combine with incline',
    contraindications: 'Severe weakness, recent surgery <4 weeks, acute injuries, poor cardiovascular conditioning, extreme anxiety',
    difficulty_level: 'Advanced'
  },

  {
    code: 'WADING_WALK',
    name: 'Shallow Water Wading',
    category: 'Hydrotherapy',
    description: 'Walking in shallow water (ankle to mid-thigh depth) for gentle weight bearing reduction while maintaining proprioceptive input.',
    equipment: ['Shallow therapy pool or beach entry', 'Non-slip surface', 'Life vest optional'],
    setup: 'Water depth ankle to stifle height initially. Ensure secure footing. Temperature 80-88°F.',
    steps: [
      'Lead dog into shallow water',
      'Begin with 5-minute walking intervals',
      'Encourage normal walking gait',
      'Make figure-8 and circle patterns',
      'Gradually increase depth if tolerated',
      'Include sit-to-stand transitions in water',
      'Allow play/exploration to maintain engagement',
      'Total time: 15-30 minutes'
    ],
    good_form: [
      'Normal gait pattern maintained',
      'Even weight distribution',
      'Willingness to bear weight on affected limb',
      'Proper paw placement',
      'Natural stride length'
    ],
    common_mistakes: [
      'Water too deep eliminating weight bearing benefit',
      'Session too short to achieve therapeutic effect',
      'Not varying walking patterns',
      'Allowing dog to hop or skip affected limb',
      'Irregular attendance reducing effectiveness'
    ],
    red_flags: [
      'Increased lameness during wading',
      'Refusal to bear weight on limb',
      'Loss of balance in shallow water',
      'Excessive shivering (too cold)',
      'Pain behaviors or vocalization'
    ],
    progression: 'Decrease water depth gradually toward dry land. Increase duration to 45 minutes. Add trot intervals. Progress to walking on submerged obstacles. Transition to land-based exercise',
    contraindications: 'Open wounds, skin infections, severe cold intolerance, extreme fear of water, acute inflammation',
    difficulty_level: 'Easy'
  },

  {
    code: 'AQUA_CAVALETTI',
    name: 'Submerged Cavaletti Walking',
    category: 'Hydrotherapy',
    description: 'Walking over submerged poles/obstacles in water to enhance limb flexion and proprioception with reduced weight bearing.',
    equipment: ['Pool or UWTM', 'PVC poles or foam obstacles', 'Adjustable height stands'],
    setup: 'Water at hip level. Place 4-6 poles at appropriate spacing (1.5x shoulder height). Poles 2-4 inches below water surface.',
    steps: [
      'Acclimate dog to basic water walking first',
      'Set pole height appropriate to dog size',
      'Guide dog over poles at slow pace',
      'Ensure proper limb clearance over each pole',
      'Complete 5-10 passes',
      'Adjust spacing or height based on performance',
      'Include both forward and backward passes',
      'Rest between sets as needed'
    ],
    good_form: [
      'Increased limb flexion to clear poles',
      'Deliberate paw placement',
      'Coordinated stepping rhythm',
      'No contact with poles',
      'Maintained balance throughout'
    ],
    common_mistakes: [
      'Poles too high causing tripping',
      'Spacing inappropriate for dog size',
      'Speed too fast preventing proper clearance',
      'Not adjusting difficulty progressively',
      'Insufficient rest between sets'
    ],
    red_flags: [
      'Frequent contact or tripping on poles',
      'Reluctance to attempt exercise',
      'Lameness worsening during exercise',
      'Loss of balance requiring assistance',
      'Signs of joint or muscle pain'
    ],
    progression: 'Increase pole height incrementally. Decrease water level. Add variable spacing patterns. Progress to diagonal pole arrangements. Transition to land-based cavaletti',
    contraindications: 'Severe ataxia, acute injuries, post-surgical <2 weeks, severe pain, poor balance requiring assistance',
    difficulty_level: 'Moderate'
  },

  {
    code: 'AQUA_WEAVE',
    name: 'Underwater Weave Poles',
    category: 'Hydrotherapy',
    description: 'Weaving through vertical poles in water to promote lateral flexibility, core engagement, and coordination.',
    equipment: ['Pool or large UWTM', '6-8 vertical poles', 'Weighted bases'],
    setup: 'Water at chest level. Poles spaced 18-24 inches apart in straight line.',
    steps: [
      'Position dog at start of pole sequence',
      'Guide dog to weave through poles',
      'Lure with treats to maintain proper pattern',
      'Complete full sequence without skipping poles',
      'Perform 3-5 complete passes',
      'Rest between passes',
      'Practice both directions',
      'Progress to independent weaving'
    ],
    good_form: [
      'Smooth lateral flexion through spine',
      'Even weight distribution during turns',
      'No skipping or cutting corners',
      'Controlled pace throughout',
      'Hindquarters following proper line'
    ],
    common_mistakes: [
      'Poles too close together',
      'Moving too quickly through sequence',
      'Allowing dog to skip poles',
      'Not working both directions',
      'Insufficient guidance initially'
    ],
    red_flags: [
      'Unable to perform lateral flexion',
      'Back pain or stiffness evident',
      'Loss of balance during turns',
      'Lameness increasing during exercise',
      'Avoidance or refusal behaviors'
    ],
    progression: 'Decrease pole spacing to 16 inches. Lower water level to hip height. Increase speed. Progress to 2 complete sequences consecutively. Add distraction work',
    contraindications: 'Severe spinal pain, acute IVDD, unstable spine, severe hip dysplasia, poor body awareness',
    difficulty_level: 'Advanced'
  },

  {
    code: 'AQUA_FETCH',
    name: 'Underwater Fetch and Retrieve',
    category: 'Hydrotherapy',
    description: 'Retrieving submerged objects to encourage diving motion, neck/thoracic extension, and breath control.',
    equipment: ['Pool', 'Sinkable toys (weighted)', 'Various depths available', 'Life vest'],
    setup: 'Start in shallow section (nose depth). Progress to deeper areas as skill develops.',
    steps: [
      'Begin with toy barely submerged',
      'Encourage dog to submerge nose/face',
      'Reward successful retrieves',
      'Gradually increase depth of toy placement',
      'Progress to chest-depth retrieves',
      'Limit to 8-10 retrieves per session',
      'Allow adequate rest between retrieves',
      'Monitor for water intake or coughing'
    ],
    good_form: [
      'Controlled submersion and surfacing',
      'Proper breath control',
      'Strong hindlimb propulsion to dive',
      'Coordinated retrieval motion',
      'Enthusiastic engagement'
    ],
    common_mistakes: [
      'Progressing depth too quickly',
      'Too many consecutive retrieves',
      'Using toys that float',
      'Not monitoring for water aspiration',
      'Pushing anxious dogs beyond comfort'
    ],
    red_flags: [
      'Coughing or gagging after surfacing',
      'Anxiety or panic while submerged',
      'Disorientation after dive',
      'Excessive water intake',
      'Reluctance to re-enter water'
    ],
    progression: 'Increase dive depth incrementally. Add distance retrieves. Incorporate directional changes. Progress to full body submersion (if appropriate)',
    contraindications: 'Brachycephalic breeds, respiratory disease, ear infections, anxiety disorders, poor swimming ability',
    difficulty_level: 'Advanced'
  },

  {
    code: 'HYDRO_BALANCE',
    name: 'Aquatic Balance Board',
    category: 'Hydrotherapy',
    description: 'Standing balance work on submerged platform or board to enhance proprioception with reduced fall risk.',
    equipment: ['Pool', 'Submerged balance board or platform', 'Non-slip surface', 'Spotter'],
    setup: 'Board 6-12 inches below water surface. Water at dog chest height. Ensure stability.',
    steps: [
      'Guide dog onto submerged platform',
      'Allow time to find balance',
      'Begin with 30-second holds',
      'Gradually increase to 2-minute holds',
      'Add gentle perturbations (water movement)',
      'Practice weight shifts in place',
      'Perform 5-8 repetitions',
      'Include sit and down transitions if advanced'
    ],
    good_form: [
      'All four paws on platform',
      'Even weight distribution',
      'Trunk stability maintained',
      'Small corrective movements visible',
      'Relaxed muscle tone'
    ],
    common_mistakes: [
      'Platform too unstable initially',
      'Not allowing adequate adjustment time',
      'Progressing too quickly',
      'Insufficient rest between trials',
      'Not spotting dog appropriately'
    ],
    red_flags: [
      'Unable to maintain position despite efforts',
      'Excessive anxiety or stress',
      'Pain behaviors when weight shifting',
      'Repeated falling or stepping off',
      'Muscle trembling indicating fatigue'
    ],
    progression: 'Increase platform instability. Lower water level. Add dynamic weight shifts. Progress to single limb lifts. Transition to land-based balance work',
    contraindications: 'Severe ataxia, acute injuries, vestibular disease, extreme anxiety, poor body awareness',
    difficulty_level: 'Advanced'
  },

  {
    code: 'AQUA_STAND',
    name: 'Static Water Standing',
    category: 'Hydrotherapy',
    description: 'Standing balance in water with manual perturbations to improve weight bearing tolerance and core stability.',
    equipment: ['Pool or UWTM', 'Treats', 'Spotter'],
    setup: 'Water at hip to ribcage level depending on weight bearing goals.',
    steps: [
      'Position dog in comfortable standing position',
      'Allow 1-2 minutes for adjustment',
      'Apply gentle manual perturbations (pushes)',
      'Vary direction: lateral, anterior-posterior',
      'Observe weight shifting responses',
      'Progress to one-handed perturbations',
      'Total standing time: 5-10 minutes',
      'Include sit-stand transitions'
    ],
    good_form: [
      'Immediate corrective responses to perturbations',
      'Equal weight bearing all limbs',
      'Core engagement visible',
      'Controlled, measured adjustments',
      'Maintained standing position'
    ],
    common_mistakes: [
      'Perturbations too forceful',
      'Not varying direction of challenges',
      'Insufficient standing duration',
      'Rushing through transitions',
      'Not allowing rest periods'
    ],
    red_flags: [
      'Unable to maintain standing despite efforts',
      'Excessive muscle trembling',
      'Lameness worsening during exercise',
      'Loss of balance requiring support',
      'Signs of pain or discomfort'
    ],
    progression: 'Increase perturbation force. Decrease water level. Add unstable surface under paws. Progress to single limb lifts during perturbations. Transition to land',
    contraindications: 'Acute injuries, severe weakness, vestibular disease, poor balance requiring constant assistance',
    difficulty_level: 'Moderate'
  },

  {
    code: 'AQUA_STEPS',
    name: 'Submerged Step-Ups',
    category: 'Hydrotherapy',
    description: 'Stepping up and down on submerged platform to promote controlled weight bearing and eccentric muscle control.',
    equipment: ['Pool', 'Submerged step (4-8 inches high)', 'Non-slip surface'],
    setup: 'Step 6-12 inches below water surface. Water level at step top should be chest height.',
    steps: [
      'Position dog beside submerged step',
      'Lure dog to step up onto platform',
      'Hold position for 5 seconds',
      'Cue step down slowly',
      'Emphasize controlled descent',
      'Repeat 10-15 times',
      'Alternate leading limb',
      'Rest between sets of 5'
    ],
    good_form: [
      'Controlled ascent and descent',
      'Equal use of both hindlimbs',
      'Full weight bearing on platform',
      'Smooth transitions up and down',
      'Proper paw placement'
    ],
    common_mistakes: [
      'Step too high for current ability',
      'Rushing through repetitions',
      'Not emphasizing controlled descent',
      'Only working one leading limb',
      'Platform too unstable'
    ],
    red_flags: [
      'Inability to step up despite effort',
      'Jumping rather than stepping',
      'Lameness increasing with repetitions',
      'Loss of balance on platform',
      'Refusal or extreme reluctance'
    ],
    progression: 'Increase step height incrementally. Decrease water level. Add multiple step levels. Progress to lateral step-ups. Transition to land-based steps',
    contraindications: 'Severe hindlimb weakness, acute joint injuries, post-surgical <2 weeks, severe pain on weight bearing',
    difficulty_level: 'Moderate'
  },

  {
    code: 'AQUA_CIRCLES',
    name: 'Tight Circle Walking in Water',
    category: 'Hydrotherapy',
    description: 'Walking small diameter circles in water to increase inside limb loading and core rotational strength.',
    equipment: ['Pool or UWTM', 'Central pivot point or target'],
    setup: 'Water at hip height. Mark center point. Circle diameter 6-10 feet.',
    steps: [
      'Position dog at circle perimeter',
      'Guide dog to walk circle around center',
      'Maintain tight circular path',
      'Complete 3-5 full rotations',
      'Rest, then reverse direction',
      'Perform equal repetitions both directions',
      'Monitor inside limb loading',
      'Total duration: 10-15 minutes'
    ],
    good_form: [
      'Consistent circle diameter maintained',
      'Inside limb showing increased flexion',
      'Spine lateral flexion visible',
      'Smooth, coordinated movement',
      'Even weight distribution'
    ],
    common_mistakes: [
      'Circle diameter too large',
      'Moving too quickly',
      'Not working both directions equally',
      'Allowing dog to cut corners',
      'Insufficient repetitions'
    ],
    red_flags: [
      'Severe lameness on inside limb',
      'Loss of balance during circles',
      'Back pain or stiffness evident',
      'Reluctance to perform one direction',
      'Muscle trembling or fatigue'
    ],
    progression: 'Decrease circle diameter. Lower water level. Increase speed. Add figure-8 patterns. Progress to land-based tight circles',
    contraindications: 'Severe hip dysplasia, acute spinal injuries, vestibular disease, extreme lameness, poor balance',
    difficulty_level: 'Moderate'
  },

  {
    code: 'AQUA_PLANK',
    name: 'Aquatic Plank Hold',
    category: 'Hydrotherapy',
    description: 'Front paws elevated on pool edge while hindlimbs tread water to promote core strength and hindlimb muscle activation.',
    equipment: ['Pool', 'Non-slip pool edge', 'Spotter', 'Timer'],
    setup: 'Dog positioned with front paws on pool deck/edge, body at 30-45 degree angle in water.',
    steps: [
      'Assist dog to place front paws on deck edge',
      'Support hindquarters initially if needed',
      'Allow hindlimbs to tread water',
      'Begin with 15-30 second holds',
      'Monitor for proper form',
      'Rest between repetitions',
      'Perform 5-8 repetitions',
      'Progress duration gradually'
    ],
    good_form: [
      'Active hindlimb treading motion',
      'Straight spine alignment',
      'Front limbs weight bearing on deck',
      'Core muscles visibly engaged',
      'Controlled breathing'
    ],
    common_mistakes: [
      'Body angle too steep or shallow',
      'Not supporting dog initially',
      'Duration too long causing fatigue',
      'Front limbs slipping on deck',
      'Insufficient rest between holds'
    ],
    red_flags: [
      'Inability to maintain position',
      'Excessive fatigue within 30 seconds',
      'Hindlimbs not actively working',
      'Back pain or discomfort visible',
      'Panic or distress'
    ],
    progression: 'Increase hold duration to 60-90 seconds. Add alternating hindlimb lifts. Progress to both hindlimbs on small submerged platform. Transition to land-based planks',
    contraindications: 'Severe forelimb weakness, shoulder injuries, spinal instability, extreme anxiety in water, poor swimming ability',
    difficulty_level: 'Advanced'
  },

  // ========================================
  // GERIATRIC-SPECIFIC PROTOCOLS (15 exercises)
  // ========================================
  {
    code: 'GENTLE_PROM',
    name: 'Geriatric-Adapted Passive ROM',
    category: 'Geriatric Care',
    description: 'Extra gentle passive range of motion specifically adapted for geriatric patients with arthritis and reduced tissue tolerance.',
    equipment: ['Thick orthopedic pad', 'Warm therapeutic packs', 'Treats'],
    setup: 'Pre-warm joints with warm packs for 10 minutes. Position dog on thick cushioned surface.',
    steps: [
      'Apply gentle warmth to target joints first',
      'Position dog in comfortable lateral recumbency',
      'Stabilize proximal joint segment',
      'Move through available range VERY slowly',
      'Hold at end range for only 3-5 seconds',
      'Never force beyond comfortable range',
      'Perform 5-8 repetitions per joint',
      'Multiple sessions daily preferred over one long session'
    ],
    good_form: [
      'Extremely slow, controlled movements',
      'Dog remains completely relaxed',
      'No resistance felt during movement',
      'Consistent gentle pressure',
      'Frequent breaks and position changes'
    ],
    common_mistakes: [
      'Moving too quickly even if gentle',
      'Not pre-warming joints adequately',
      'Too many repetitions causing soreness',
      'Forcing into uncomfortable positions',
      'Sessions too infrequent for effectiveness'
    ],
    red_flags: [
      'Any vocalization or discomfort',
      'Joint crepitus or clicking',
      'Increased lameness after session',
      'Muscle spasm or guarding',
      'Dog pulling away or showing avoidance'
    ],
    progression: 'Focus on maintaining current range rather than aggressive gains. Add gentle joint compressions. Introduce very easy active-assisted movements if tolerated',
    contraindications: 'Severe arthritis flare-ups, acute injuries, extreme pain levels, recent fracture or surgery',
    difficulty_level: 'Easy'
  },

  {
    code: 'SENIOR_WALK',
    name: 'Slow Controlled Leash Walking',
    category: 'Geriatric Care',
    description: 'Short, frequent walking sessions tailored to geriatric mobility and endurance limitations.',
    equipment: ['Properly fitted harness (not collar)', 'Short leash', 'Booties if needed'],
    setup: 'Flat, even surface free of obstacles. Temperature moderate (not extreme heat or cold).',
    steps: [
      'Allow 2-3 minutes warm-up at very slow pace',
      'Maintain comfortable walking speed (no pulling)',
      'Duration: 5-15 minutes based on tolerance',
      'Include rest stops every 3-5 minutes',
      'Monitor for signs of fatigue',
      'Perform 2-4 short walks daily rather than one long walk',
      'Cool down with 2-minute slow walk',
      'Provide water and rest after'
    ],
    good_form: [
      'Even, coordinated gait pattern',
      'Willingness to continue walking',
      'Normal breathing rate',
      'Alert and engaged',
      'Using all four limbs'
    ],
    common_mistakes: [
      'Walks too long for current conditioning',
      'Moving too quickly',
      'Not allowing adequate rest stops',
      'Walking on hard surfaces only',
      'Inconsistent daily schedule'
    ],
    red_flags: [
      'Reluctance to continue despite encouragement',
      'Excessive panting or fatigue',
      'Lameness worsening during walk',
      'Dragging paws or ataxia',
      'Dog stopping and refusing to move'
    ],
    progression: 'Slowly increase duration by 2-3 minutes weekly. Add gentle inclines if tolerated. Vary surfaces (grass, dirt) for proprioceptive input. Progress to longer walks as tolerated',
    contraindications: 'Severe cardiopulmonary disease, uncontrolled pain, acute injuries, extreme weakness requiring support',
    difficulty_level: 'Easy'
  },

  {
    code: 'MASSAGE_SENIOR',
    name: 'Therapeutic Massage for Seniors',
    category: 'Geriatric Care',
    description: 'Gentle massage techniques to improve circulation, reduce muscle tension, and provide pain relief for geriatric patients.',
    equipment: ['Comfortable padded surface', 'Massage oil or lotion (pet-safe)', 'Warm environment'],
    setup: 'Dog in relaxed lateral or sternal position. Room temperature comfortable. Calm, quiet environment.',
    steps: [
      'Begin with effleurage (light stroking) to relax',
      'Gradually increase pressure as tolerated',
      'Focus on areas of tension (lumbar, shoulders)',
      'Use circular motions on major muscle groups',
      'Include gentle joint mobilizations',
      'Avoid areas of acute inflammation',
      'Session duration: 15-20 minutes',
      'End with light effleurage to calm'
    ],
    good_form: [
      'Dog appears relaxed and comfortable',
      'Muscle tension visibly releasing',
      'Even, rhythmic pressure applied',
      'Smooth transitions between areas',
      'Maintaining contact throughout'
    ],
    common_mistakes: [
      'Pressure too firm on fragile patients',
      'Rushing through techniques',
      'Working over painful areas',
      'Not adjusting based on response',
      'Session too long causing discomfort'
    ],
    red_flags: [
      'Dog pulling away or showing discomfort',
      'Muscle spasms under touch',
      'Vocalization or tensing',
      'Areas of heat or swelling',
      'Increased lameness after session'
    ],
    progression: 'Increase session duration to 30 minutes. Add myofascial release techniques. Incorporate trigger point therapy if trained. Progress to daily sessions',
    contraindications: 'Acute inflammation, skin infections, tumors in massage area, severe osteoporosis, bleeding disorders',
    difficulty_level: 'Easy'
  },

  {
    code: 'SIT_STAND_SENIOR',
    name: 'Geriatric Sit-to-Stand Transitions',
    category: 'Geriatric Care',
    description: 'Controlled sit-to-stand exercises modified for senior dogs to maintain functional mobility and hindlimb strength.',
    equipment: ['Non-slip surface', 'Support harness if needed', 'Elevated platform optional'],
    setup: 'On non-slip surface. Ensure adequate space. Have treats at dog nose height.',
    steps: [
      'Start with dog in sitting position',
      'Lure dog to standing using treat',
      'Move slowly, no jumping',
      'Hold stand position for 3-5 seconds',
      'Cue sit using gentle downward motion',
      'Control descent into sit',
      'Repeat 5-8 times',
      'Perform 2-3 times daily'
    ],
    good_form: [
      'Smooth, controlled rise to stand',
      'Equal weight bearing on both hindlimbs',
      'No hopping or jumping',
      'Controlled descent into sit',
      'Willingness to perform repetitions'
    ],
    common_mistakes: [
      'Rising too quickly',
      'Not controlling the descent',
      'Too many repetitions causing fatigue',
      'Surface too slippery',
      'Not providing support if needed'
    ],
    red_flags: [
      'Inability to stand without support',
      'Extreme reluctance or refusal',
      'Vocalization during transition',
      'Lameness worsening with repetitions',
      'Trembling or weakness evident'
    ],
    progression: 'Increase repetitions to 10-12. Add longer hold times in standing. Progress to elevated platform sits. Remove support harness if used',
    contraindications: 'Severe arthritis flare-ups, acute back injuries, extreme weakness, uncontrolled pain',
    difficulty_level: 'Easy'
  },

  {
    code: 'SENIOR_BALANCE',
    name: 'Gentle Balance Training for Seniors',
    category: 'Geriatric Care',
    description: 'Modified standing balance work to prevent falls and maintain proprioceptive awareness in geriatric patients.',
    equipment: ['Non-slip mat', 'Support harness', 'Folded towels or thin cushions'],
    setup: 'Stable surface initially. Support harness attached for safety. Spotter present.',
    steps: [
      'Dog in comfortable standing position',
      'Allow 1-2 minutes to find balance',
      'Apply very gentle perturbations',
      'Touch lateral aspects lightly',
      'Observe weight shifting responses',
      'Hold standing position for 2-3 minutes',
      'Rest between trials',
      'Perform 3-5 repetitions'
    ],
    good_form: [
      'Small corrective movements visible',
      'Even weight distribution',
      'Alert and engaged',
      'No signs of strain',
      'Maintaining standing without support'
    ],
    common_mistakes: [
      'Perturbations too forceful',
      'Not using support harness for safety',
      'Standing duration too long',
      'Progressing surface difficulty too quickly',
      'Not monitoring for fatigue'
    ],
    red_flags: [
      'Unable to maintain standing balance',
      'Frequent stumbling or near falls',
      'Excessive trembling',
      'Disorientation or confusion',
      'Severe anxiety during exercise'
    ],
    progression: 'Increase standing duration to 5 minutes. Add slightly unstable surface (folded towel). Progress to gentle weight shifts. Add slow walking on textured surfaces',
    contraindications: 'Vestibular disease, severe weakness requiring constant support, acute neurological changes, extreme anxiety',
    difficulty_level: 'Easy'
  },

  {
    code: 'RAISED_FEED',
    name: 'Elevated Feeding Position Therapy',
    category: 'Geriatric Care',
    description: 'Using elevated feeding as therapeutic positioning to reduce neck/spine flexion and promote better posture during daily activities.',
    equipment: ['Elevated feeder (height appropriate)', 'Non-slip mat beneath'],
    setup: 'Feeder height so dog head at comfortable level when standing. Mat prevents slipping.',
    steps: [
      'Place food/water in elevated feeder',
      'Allow dog to approach naturally',
      'Observe standing posture while eating',
      'Encourage full weight bearing on all limbs',
      'Monitor eating duration and comfort',
      'Maintain elevated feeding permanently',
      'Adjust height if posture appears strained',
      'Use for all meals and water'
    ],
    good_form: [
      'Neutral head and neck position',
      'Even weight distribution while standing',
      'Comfortable eating posture',
      'No strain visible in neck or back',
      'Willing to eat full meal'
    ],
    common_mistakes: [
      'Feeder too high or too low',
      'Not securing feeder (tipping risk)',
      'Floor surface too slippery',
      'Inconsistent use of elevated feeder',
      'Wrong height for dog size'
    ],
    red_flags: [
      'Reluctance to eat from elevated position',
      'Straining or discomfort while eating',
      'Coughing or difficulty swallowing',
      'Loss of balance while feeding',
      'Decreased food intake'
    ],
    progression: 'Maintain elevated feeding permanently. Monitor for any changes in comfort. Adjust height as needed with aging. Combine with other geriatric therapies',
    contraindications: 'Megaesophagus (requires different approach), severe neck injuries, swallowing disorders',
    difficulty_level: 'Easy'
  },

  {
    code: 'RAMP_TRAINING',
    name: 'Ramp Training for Mobility',
    category: 'Geriatric Care',
    description: 'Teaching safe ramp use for accessing furniture and vehicles, reducing jump stress on joints.',
    equipment: ['Non-slip ramp (appropriate incline)', 'Support harness', 'High-value treats'],
    setup: 'Ramp at gentle incline (20-30 degrees max). Secure from movement. Non-slip surface.',
    steps: [
      'Introduce ramp on flat ground first',
      'Lure dog across flat ramp with treats',
      'Gradually increase incline over days',
      'Use support harness for confidence',
      'Practice ascending and descending',
      'Reward calm, controlled movement',
      'Perform daily practice sessions',
      'Progress to functional use (couch, car)'
    ],
    good_form: [
      'Confident approach to ramp',
      'Controlled ascent and descent',
      'All four paws remaining on ramp',
      'No hesitation or balking',
      'Smooth, coordinated movement'
    ],
    common_mistakes: [
      'Ramp too steep initially',
      'Surface too slippery',
      'Forcing dog rather than luring',
      'Not securing ramp properly',
      'Progressing too quickly'
    ],
    red_flags: [
      'Extreme fear or refusal',
      'Loss of balance on ramp',
      'Trying to jump off mid-ramp',
      'Increased lameness after use',
      'Panic or anxiety behaviors'
    ],
    progression: 'Decrease need for luring. Increase ramp incline if appropriate. Progress to everyday functional use. Ensure ramps available at all necessary locations',
    contraindications: 'Severe ataxia, extreme fear/anxiety, visual impairment without training, severe weakness',
    difficulty_level: 'Easy'
  },

  {
    code: 'HEAT_THERAPY_GERI',
    name: 'Therapeutic Heat Application',
    category: 'Geriatric Care',
    description: 'Moist heat therapy to reduce muscle tension, improve circulation, and provide pain relief before exercise.',
    equipment: ['Moist heating pads', 'Towels', 'Thermometer', 'Timer'],
    setup: 'Dog in comfortable position. Heating pad set to medium (100-110°F). Towel layer between skin and pad.',
    steps: [
      'Test heat on your inner wrist first',
      'Place towel over target area',
      'Apply heating pad over towel',
      'Secure gently with wrap if needed',
      'Monitor continuously during treatment',
      'Duration: 15-20 minutes',
      'Remove heat and evaluate',
      'Perform gentle ROM or exercise after'
    ],
    good_form: [
      'Dog remains relaxed throughout',
      'Heat feels warm but not hot',
      'Even distribution of warmth',
      'Skin normal color (not red)',
      'Visible muscle relaxation'
    ],
    common_mistakes: [
      'Heat too intense',
      'Insufficient barrier between skin and heat',
      'Leaving dog unattended',
      'Application duration too long',
      'Not checking skin frequently'
    ],
    red_flags: [
      'Skin redness or irritation',
      'Dog showing discomfort',
      'Increased swelling',
      'Burns or blisters',
      'Agitation or anxiety'
    ],
    progression: 'Use before each exercise session. May increase duration to 25 minutes if well-tolerated. Combine with massage post-heating. Consider home heat therapy program',
    contraindications: 'Acute inflammation, open wounds, decreased sensation, tumors in area, bleeding disorders, over implants',
    difficulty_level: 'Easy'
  },

  {
    code: 'COLD_THERAPY_GERI',
    name: 'Therapeutic Cold Application',
    category: 'Geriatric Care',
    description: 'Cryotherapy for managing acute inflammation and pain in geriatric arthritis flare-ups.',
    equipment: ['Cold packs or ice bags', 'Towels', 'Timer'],
    setup: 'Cold pack placed in towel. Dog in comfortable position. Target area accessible.',
    steps: [
      'Wrap cold pack in thin towel',
      'Apply to inflamed/painful area',
      'Secure lightly if needed',
      'Duration: 10-15 minutes',
      'Remove cold pack',
      'Gently dry area',
      'Allow skin to return to normal temp',
      'Can repeat 3-4 times daily for acute issues'
    ],
    good_form: [
      'Cold application tolerated well',
      'Skin protected by towel barrier',
      'Dog remains calm',
      'Even cold distribution',
      'Visible reduction in swelling if present'
    ],
    common_mistakes: [
      'Applying ice directly to skin',
      'Duration too long (>20 minutes)',
      'Not monitoring skin condition',
      'Using when not appropriate (chronic stiffness)',
      'Too frequent application'
    ],
    red_flags: [
      'Skin becoming white or mottled',
      'Excessive shivering or discomfort',
      'Skin breakdown',
      'No improvement in inflammation',
      'Dog pulling away or distressed'
    ],
    progression: 'Use primarily for acute flare-ups. Transition to heat therapy once acute inflammation resolves. May alternate heat/cold for some conditions',
    contraindications: 'Decreased circulation, extreme cold sensitivity, open wounds, Raynaud phenomenon',
    difficulty_level: 'Easy'
  },

  {
    code: 'BEDDING_EXERCISE',
    name: 'Therapeutic Bed Positioning',
    category: 'Geriatric Care',
    description: 'Using orthopedic bedding and positioning strategies to maintain joint alignment and comfort during rest.',
    equipment: ['Orthopedic bed (memory foam)', 'Positioning pillows', 'Non-slip base'],
    setup: 'Bed in quiet area. Temperature controlled. Adequate cushioning for bony prominences.',
    steps: [
      'Provide thick orthopedic bed (4-6 inches)',
      'Position bed away from drafts',
      'Use pillows to support neck and limbs',
      'Encourage lateral recumbency with support',
      'Rotate position every 2-3 hours',
      'Provide easy access (no jumping required)',
      'Keep bed clean and dry',
      'Monitor for pressure sores'
    ],
    good_form: [
      'Dog appears comfortable and relaxed',
      'Joints in neutral alignment',
      'No pressure on bony prominences',
      'Easy transitions on/off bed',
      'Adequate cushioning throughout'
    ],
    common_mistakes: [
      'Bed too thin or too firm',
      'Poor positioning allowing joint stress',
      'Bed too elevated (fall risk)',
      'Not rotating position regularly',
      'Bed in poor location (cold, drafty)'
    ],
    red_flags: [
      'Pressure sores developing',
      'Reluctance to use bed',
      'Difficulty getting on/off bed',
      'Increased stiffness after rest',
      'Dog choosing floor over bed'
    ],
    progression: 'Upgrade to memory foam if not already used. Add heated bed for winter. Provide multiple beds in different locations. Consider adjustable bed height',
    contraindications: 'None, but adapt for incontinence or other issues',
    difficulty_level: 'Easy'
  },

  {
    code: 'SENIOR_STAIRS',
    name: 'Stair Training - Geriatric Protocol',
    category: 'Geriatric Care',
    description: 'Controlled stair climbing practice with support to maintain functional independence and strength.',
    equipment: ['Stairs with non-slip treads', 'Support harness', 'High-value rewards'],
    setup: 'Start with 2-3 stairs only. Ensure adequate lighting. Non-slip surface on every tread.',
    steps: [
      'Fit support harness',
      'Approach stairs slowly',
      'Encourage one step at a time',
      'Support hindquarters if needed',
      'Pause at each landing',
      'Praise calm, controlled movement',
      'Practice both ascent and descent',
      'Limit to 1-2 flights maximum'
    ],
    good_form: [
      'Deliberate, controlled stepping',
      'Using all four limbs',
      'Confident approach',
      'Proper paw placement on each tread',
      'Maintaining balance throughout'
    ],
    common_mistakes: [
      'Allowing dog to rush',
      'Not providing adequate support',
      'Too many stairs for current ability',
      'Treads too slippery',
      'Not alternating lead limb'
    ],
    red_flags: [
      'Extreme reluctance or refusal',
      'Bunny-hopping up stairs',
      'Sliding or loss of footing',
      'Significant lameness worsening',
      'Fear or panic response'
    ],
    progression: 'Very gradually increase number of stairs. Reduce support as confidence builds. Practice regularly to maintain skill. Consider installing ramp as alternative',
    contraindications: 'Severe weakness, recent surgery, acute injuries, extreme fear, visual impairment',
    difficulty_level: 'Moderate'
  },

  {
    code: 'TUMMY_TIME',
    name: 'Prone Positioning (Sphinx Position)',
    category: 'Geriatric Care',
    description: 'Encouraging sternal recumbency to maintain alertness, improve respiration, and strengthen forelimb weight bearing.',
    equipment: ['Supportive bolsters or pillows', 'Comfortable mat'],
    setup: 'Dog in sphinx position (chest down, head up). Support under chest if needed.',
    steps: [
      'Encourage dog into sternal position',
      'Support chest with pillows if needed',
      'Forelimbs extended forward',
      'Head held naturally upright',
      'Maintain position 5-15 minutes',
      'Provide engaging stimuli (view, interaction)',
      'Assist to standing when complete',
      'Perform 2-4 times daily'
    ],
    good_form: [
      'Alert and engaged while positioned',
      'Weight supported on forelimbs',
      'Head held upright naturally',
      'Comfortable breathing',
      'Willingness to maintain position'
    ],
    common_mistakes: [
      'Duration too long causing discomfort',
      'Insufficient support causing collapse',
      'Forcing position against resistance',
      'Not monitoring for stress',
      'Poor timing (after meals)'
    ],
    red_flags: [
      'Respiratory distress',
      'Unable to maintain head upright',
      'Forelimb collapse',
      'Signs of pain or discomfort',
      'Extreme reluctance'
    ],
    progression: 'Increase duration to 30 minutes if tolerated. Reduce support needed. Incorporate feeding in this position if appropriate. Make preferred resting position',
    contraindications: 'Severe respiratory disease, cervical spine injuries, forelimb weakness preventing support, megaesophagus',
    difficulty_level: 'Easy'
  },

  {
    code: 'TAIL_LIFTS',
    name: 'Gentle Tail Support Assistance',
    category: 'Geriatric Care',
    description: 'Using tail support to assist hindquarter weight bearing during standing and walking.',
    equipment: ['Support harness with tail strap', 'Or hands-on tail support'],
    setup: 'Dog standing. Support applied to base of tail, lifting upward gently.',
    steps: [
      'Stand beside dog at hindquarters',
      'Place hand under tail base',
      'Lift gently upward (not pulling tail)',
      'Provide 20-40% weight assistance',
      'Encourage dog to walk with support',
      'Maintain support during transitions',
      'Gradually reduce support as strength improves',
      'Use for stairs, standing, and walking as needed'
    ],
    good_form: [
      'Support at tail base, not pulling tail itself',
      'Dog showing improved weight bearing',
      'Smooth, supported transitions',
      'Proper gait mechanics maintained',
      'Dog accepting assistance willingly'
    ],
    common_mistakes: [
      'Pulling on tail rather than supporting base',
      'Too much support (dog not working)',
      'Support too aggressive causing imbalance',
      'Not gradually reducing support',
      'Using as only intervention'
    ],
    red_flags: [
      'Dog collapse despite support',
      'Pain response to tail contact',
      'No improvement in function with support',
      'Complete dependence on support',
      'Tail injury from improper technique'
    ],
    progression: 'Gradually reduce amount of support provided. Progress to touch-only cueing. Transition to harness support. Eventually work without support',
    contraindications: 'Tail injuries, caudal spine disease, extreme sensitivity, aggression when touched',
    difficulty_level: 'Easy'
  },

  {
    code: 'COGNITIVE_ACTIVITY',
    name: 'Mental Enrichment for Cognitive Health',
    category: 'Geriatric Care',
    description: 'Cognitive exercises and enrichment activities to maintain mental acuity and prevent cognitive decline.',
    equipment: ['Puzzle toys', 'Snuffle mats', 'Novel toys', 'Treats'],
    setup: 'Quiet, comfortable area. Appropriate difficulty level for current cognitive status.',
    steps: [
      'Introduce one new puzzle or activity',
      'Demonstrate solution if needed',
      'Allow dog to problem-solve',
      'Provide guidance only when frustrated',
      'Reward success enthusiastically',
      'Keep sessions short (10-15 minutes)',
      'Rotate toys to maintain novelty',
      'Perform daily cognitive activities'
    ],
    good_form: [
      'Dog showing engagement and interest',
      'Problem-solving behaviors evident',
      'Appropriate frustration tolerance',
      'Success achieved with minimal help',
      'Improved speed with practice'
    ],
    common_mistakes: [
      'Puzzles too difficult causing frustration',
      'Not demonstrating solution initially',
      'Sessions too long',
      'Same activities repeatedly (no novelty)',
      'Not adjusting difficulty appropriately'
    ],
    red_flags: [
      'Extreme frustration or giving up immediately',
      'No interest despite high-value rewards',
      'Decline in previously mastered activities',
      'Confusion or disorientation during play',
      'Behavioral changes with cognitive games'
    ],
    progression: 'Gradually increase puzzle difficulty. Introduce multiple-step problems. Add scent work activities. Create obstacle courses requiring navigation planning',
    contraindications: 'Severe cognitive dysfunction (adapt activities), extreme anxiety, visual/hearing impairment (modify activities)',
    difficulty_level: 'Easy'
  },

  {
    code: 'NIGHTLIGHT',
    name: 'Environmental Modifications for Safety',
    category: 'Geriatric Care',
    description: 'Strategic environmental changes to prevent injuries and support mobility in aging dogs.',
    equipment: ['Night lights', 'Non-slip runners', 'Baby gates', 'Ramps'],
    setup: 'Home assessment to identify fall risks and mobility barriers.',
    steps: [
      'Install night lights in all pathways',
      'Apply non-slip mats to all hard floors',
      'Block stairs if unsafe',
      'Provide ramps for furniture access',
      'Remove obstacles and clutter',
      'Ensure water/food easily accessible',
      'Create safe confined area if needed',
      'Regularly reassess and modify'
    ],
    good_form: [
      'Dog navigating home confidently',
      'No falls or injuries',
      'Reduced anxiety in movement',
      'Easy access to all necessary areas',
      'Maintained independence'
    ],
    common_mistakes: [
      'Not assessing from dog perspective',
      'Assuming dog can navigate in dark',
      'Slippery floors not addressed',
      'Stairs left unprotected',
      'Furniture arrangements not dog-friendly'
    ],
    red_flags: [
      'Falls or injuries occurring',
      'Dog avoiding certain areas',
      'Increased anxiety or confusion',
      'Reluctance to move around home',
      'Isolation in one area only'
    ],
    progression: 'Continuously adapt to changing needs. Add more supports as mobility declines. Consider outdoor modifications too. Ensure 24-hour safety',
    contraindications: 'None - should be implemented for all geriatric patients',
    difficulty_level: 'Easy'
  },

  // ========================================
  // NEUROLOGICAL REHABILITATION (15 exercises)
  // ========================================
  {
    code: 'NEURO_PROM',
    name: 'Neurological Passive Range of Motion',
    category: 'Neurological Rehabilitation',
    description: 'PROM specifically adapted for neurological patients to prevent contracture and maintain neural pathways.',
    equipment: ['Padded surface', 'Towels for positioning'],
    setup: 'Dog in lateral recumbency with affected side up. Support limbs throughout.',
    steps: [
      'Stabilize proximal joint firmly',
      'Move through full available range slowly',
      'Hold at end range for 10 seconds',
      'Incorporate rotational movements',
      'Include all joints: shoulder, elbow, carpus, digits',
      'Repeat on hindlimb: hip, stifle, tarsus, digits',
      'Perform 15-20 repetitions per joint',
      'Repeat 3-4 times daily'
    ],
    good_form: [
      'Smooth, deliberate movements',
      'Full range achieved without forcing',
      'Rotational components included',
      'Consistent repetition count',
      'Dog remains relaxed throughout'
    ],
    common_mistakes: [
      'Moving too quickly',
      'Not achieving full range',
      'Insufficient daily frequency',
      'Neglecting digital flexion/extension',
      'Not including rotation'
    ],
    red_flags: [
      'Joint contracture developing despite therapy',
      'Pain or spasm during movement',
      'Worsening neurological status',
      'Skin breakdown over prominences',
      'Muscle atrophy progressing'
    ],
    progression: 'Add gentle stretching at end range. Include PNF (proprioceptive neuromuscular facilitation) patterns. Progress to active-assisted when motor function returns',
    contraindications: 'Unstable fractures, acute phase of FCE (<24 hours), severe spasticity, extreme pain',
    difficulty_level: 'Easy'
  },

  {
    code: 'NEURO_STIM',
    name: 'Sensory Stimulation Therapy',
    category: 'Neurological Rehabilitation',
    description: 'Tactile, thermal, and proprioceptive stimulation to awaken sensory pathways and promote neural recovery.',
    equipment: ['Various textures (brushes, towels)', 'Ice/warm packs', 'Massage tools'],
    setup: 'Dog in comfortable position. Access to all affected areas.',
    steps: [
      'Begin with light touch stimulation',
      'Progress to firmer pressure',
      'Apply ice briefly (5-10 seconds) to paws',
      'Follow with warm stimulation',
      'Use textured brushes on limbs',
      'Manipulate digits and paw pads',
      'Observe for any sensory responses',
      'Session duration: 15-20 minutes, 3-4x daily'
    ],
    good_form: [
      'Systematic coverage of all affected areas',
      'Varied stimulation types used',
      'Observation for any response documented',
      'Intensity appropriate to tolerance',
      'Regular, frequent sessions'
    ],
    common_mistakes: [
      'Stimulation too aggressive',
      'Not varying stimulus types',
      'Insufficient frequency',
      'Missing distal extremities',
      'Not documenting responses'
    ],
    red_flags: [
      'No response to any stimulation',
      'Hypersensitivity or pain response',
      'Skin breakdown from stimulation',
      'Worsening neurological signs',
      'Complete loss of deep pain'
    ],
    progression: 'Increase intensity as tolerated. Progress to more complex stimulation patterns. Incorporate into other activities. Add proprioceptive challenges',
    contraindications: 'Open wounds in treatment area, extreme pain, hypersensitivity conditions, owner unable to perform safely',
    difficulty_level: 'Easy'
  },

  {
    code: 'ASSISTED_STANDING',
    name: 'Supported Standing Practice',
    category: 'Neurological Rehabilitation',
    description: 'Using sling or support to maintain standing position, promoting weight bearing and proprioceptive input.',
    equipment: ['Rear support sling', 'Help-em-up harness', 'or towel sling', 'Non-slip surface'],
    setup: 'Fit support harness. Dog on non-slip mat. Caregiver positioned to support.',
    steps: [
      'Assist dog to standing position using sling',
      'Support hindquarters with appropriate force',
      'Encourage dog to bear weight',
      'Begin with 30-second holds',
      'Progress to 2-5 minute standing sessions',
      'Perform gentle weight shifts',
      'Allow rest between standing periods',
      'Repeat 4-6 times daily'
    ],
    good_form: [
      'Paws placed properly, not knuckling',
      'Some active weight bearing evident',
      'Spine in neutral alignment',
      'Head held upright',
      'No collapse despite support'
    ],
    common_mistakes: [
      'Supporting all weight (dog not working)',
      'Duration too long causing fatigue',
      'Allowing knuckling without correction',
      'Poor surface (slippery)',
      'Insufficient daily frequency'
    ],
    red_flags: [
      'Complete inability to support any weight',
      'Severe pain during standing',
      'Progressive worsening of function',
      'Skin sores from harness',
      'Cardiovascular stress (excessive panting)'
    ],
    progression: 'Decrease amount of support provided. Increase standing duration to 10 minutes. Add weight shifts and perturbations. Progress to assisted walking',
    contraindications: 'Unstable spine, unmanaged pain, cardiovascular contraindications to standing, severe limb deformities',
    difficulty_level: 'Moderate'
  },

  {
    code: 'CART_WALKING',
    name: 'Wheelchair/Cart Ambulation',
    category: 'Neurological Rehabilitation',
    description: 'Using mobility cart to maintain exercise capacity and provide supported ambulation for paraplegic/paralyzed patients.',
    equipment: ['Properly fitted mobility cart', 'Support harness', 'Non-slip boots'],
    setup: 'Cart fitted to dog size. Harness secure. Protected outdoor area or indoor space.',
    steps: [
      'Acclimate dog to cart over several sessions',
      'Secure dog in cart properly',
      'Support front end if needed initially',
      'Encourage forward movement with treats',
      'Begin with 5-10 minute sessions',
      'Gradually increase duration',
      'Allow rest periods',
      'Progress to 20-30 minute walks'
    ],
    good_form: [
      'Strong forelimb propulsion',
      'Straight tracking in cart',
      'Enthusiastic forward movement',
      'Proper cart fit (no rubbing)',
      'Good cardiovascular effort'
    ],
    common_mistakes: [
      'Cart poorly fitted',
      'Not protecting hindlimb paws',
      'Duration too long initially',
      'Rough terrain before acclimated',
      'Not monitoring for sores or irritation'
    ],
    red_flags: [
      'Pressure sores developing',
      'Forelimb lameness or strain',
      'Refusal to use cart',
      'Excessive fatigue',
      'Cart tipping or instability'
    ],
    progression: 'Increase distance and duration. Progress to varied terrain. Add light hills if appropriate. Incorporate cart use into daily routine',
    contraindications: 'Severe forelimb weakness, unmanaged pain, extreme anxiety, very small size (cart unavailable)',
    difficulty_level: 'Moderate'
  },

  {
    code: 'STEP_OVER',
    name: 'Assisted Step-Over Obstacles',
    category: 'Neurological Rehabilitation',
    description: 'Walking over low obstacles with support to promote hip/stifle flexion and limb coordination.',
    equipment: ['Low obstacles (1-3 inches)', 'Support sling', 'Non-slip surface'],
    setup: 'Place 4-6 obstacles in line, spaced appropriately. Support harness on dog.',
    steps: [
      'Support dog in walking position',
      'Guide toward first obstacle',
      'Assist hindlimb to lift over obstacle',
      'Tap back of limb to cue flexion if needed',
      'Complete full sequence of obstacles',
      'Repeat 5-10 passes',
      'Perform 2-3 times daily',
      'Document any voluntary limb movement'
    ],
    good_form: [
      'Progressive voluntary limb flexion',
      'Coordinated weight shifts',
      'Paw clearance over obstacles',
      'Maintained forward progression',
      'Some active participation evident'
    ],
    common_mistakes: [
      'Obstacles too high initially',
      'Spacing inappropriate for gait',
      'Dragging limbs over obstacles',
      'Too many repetitions causing fatigue',
      'Not progressing difficulty'
    ],
    red_flags: [
      'No progression of voluntary movement',
      'Increased spasticity',
      'Skin damage from dragging',
      'Pain behaviors during activity',
      'Worsening neurological status'
    ],
    progression: 'Gradually increase obstacle height. Decrease support provided. Increase sequence length. Add directional changes. Progress to independent ambulation',
    contraindications: 'Acute spinal instability, unhealed fractures, severe spasticity, extreme pain',
    difficulty_level: 'Moderate'
  },

  {
    code: 'WHEELBARROW',
    name: 'Wheelbarrowing Exercise',
    category: 'Neurological Rehabilitation',
    description: 'Supporting hindquarters while dog walks on forelimbs only, promoting forelimb strength and upper body awareness.',
    equipment: ['Non-slip surface', 'Support harness optional'],
    setup: 'Clear pathway. Dog standing. Handler positioned at hindquarters.',
    steps: [
      'Grasp dog hindlimbs or support with harness',
      'Lift hindquarters to horizontal position',
      'Support dog weight appropriately',
      'Encourage forward walking on forelimbs',
      'Begin with 10-20 feet distance',
      'Allow rest between attempts',
      'Repeat 5-8 times',
      'Perform 2-3 times daily'
    ],
    good_form: [
      'Strong forelimb push-off',
      'Straight spine alignment',
      'Coordinated forelimb stepping',
      'No face-planting',
      'Maintained for duration'
    ],
    common_mistakes: [
      'Supporting too much weight',
      'Distance too long for strength',
      'Not maintaining spine alignment',
      'Moving too quickly',
      'Surface too slippery'
    ],
    red_flags: [
      'Forelimb collapse',
      'Extreme difficulty or refusal',
      'Forelimb lameness developing',
      'Respiratory distress',
      'Cervical pain behaviors'
    ],
    progression: 'Increase distance to 50 feet. Decrease support provided. Add inclines. Progress to obstacle navigation. Combine with other exercises',
    contraindications: 'Forelimb arthritis or injury, cervical spine disease, shoulder problems, extreme weakness',
    difficulty_level: 'Moderate'
  },

  {
    code: 'DANCE_THERAPY',
    name: 'Rhythmic Weight Shifting (Dancing)',
    category: 'Neurological Rehabilitation',
    description: 'Rhythmic lateral weight shifts while supported to improve balance reactions and coordination.',
    equipment: ['Support harness', 'Non-slip surface', 'Music optional'],
    setup: 'Dog in supported standing position. Handler at side or rear.',
    steps: [
      'Support dog in standing position',
      'Gently shift weight laterally right',
      'Hold for 2-3 seconds',
      'Shift weight laterally left',
      'Hold for 2-3 seconds',
      'Maintain rhythmic pattern',
      'Continue for 2-3 minutes',
      'Repeat 3-4 times daily'
    ],
    good_form: [
      'Active weight shift responses',
      'Maintained standing throughout',
      'Rhythmic, controlled movements',
      'Corrective paw adjustments visible',
      'No loss of balance'
    ],
    common_mistakes: [
      'Shifts too aggressive',
      'No hold time at shifted position',
      'Duration too long',
      'Not supporting adequately',
      'Irregular rhythm'
    ],
    red_flags: [
      'Complete inability to adjust',
      'Falling despite support',
      'Pain response to weight shifts',
      'Increased spasticity',
      'Extreme anxiety'
    ],
    progression: 'Increase shift magnitude. Decrease support provided. Add anterior-posterior shifts. Progress to diagonal shifts. Advance to standing on unstable surface',
    contraindications: 'Acute injuries, unstable spine, severe vestibular disease, unmanaged pain',
    difficulty_level: 'Moderate'
  },

  {
    code: 'NEURO_MASSAGE',
    name: 'Therapeutic Massage - Neurological Focus',
    category: 'Neurological Rehabilitation',
    description: 'Specialized massage techniques to address spasticity, improve circulation, and provide sensory input.',
    equipment: ['Massage table or pad', 'Lotion or oil', 'Warm environment'],
    setup: 'Dog in comfortable position. Access to affected areas. Calm environment.',
    steps: [
      'Begin with effleurage to relax',
      'Address spastic muscles with petrissage',
      'Apply cross-fiber friction to tight bands',
      'Include all affected limbs',
      'Gentle joint mobilizations',
      'Finish with light effleurage',
      'Session duration: 20-30 minutes',
      'Perform 1-2 times daily'
    ],
    good_form: [
      'Progressive muscle relaxation evident',
      'Spasticity decreased during session',
      'Dog showing comfort/enjoyment',
      'Systematic coverage of areas',
      'Appropriate pressure for tissue response'
    ],
    common_mistakes: [
      'Too aggressive on spastic muscles',
      'Not addressing all affected areas',
      'Insufficient session frequency',
      'Wrong techniques for neurological patients',
      'Not noting response to treatment'
    ],
    red_flags: [
      'Increased spasticity after massage',
      'Pain response during treatment',
      'No improvement in mobility',
      'Skin damage from technique',
      'Worsening neurological signs'
    ],
    progression: 'Add myofascial release techniques. Incorporate trigger point therapy. Increase session duration to 45 minutes. Add stretching protocols',
    contraindications: 'Acute inflammation, skin infections, severe cardiovascular disease, extreme hypersensitivity',
    difficulty_level: 'Easy'
  },

  {
    code: 'LIMB_PLACEMENT',
    name: 'Conscious Proprioception Testing & Training',
    category: 'Neurological Rehabilitation',
    description: 'Repeatedly placing paw in abnormal position to encourage conscious correction response.',
    equipment: ['Non-slip surface', 'Treats for positive reinforcement'],
    setup: 'Dog in standing position. Handler positioned at affected limb.',
    steps: [
      'Knuckle dog paw over (dorsal surface down)',
      'Observe for correction response',
      'Time delay to correction',
      'If no correction, manually replace',
      'Repeat 10-15 times per limb',
      'Document response time',
      'Perform 3-4 times daily',
      'Track progression over weeks'
    ],
    good_form: [
      'Immediate correction response developing',
      'Faster response times with practice',
      'Bilateral testing performed',
      'Consistent documentation',
      'Dog showing improved awareness'
    ],
    common_mistakes: [
      'Not testing daily',
      'Only testing affected side',
      'Not documenting response times',
      'Too few repetitions',
      'Not progressing to other surfaces'
    ],
    red_flags: [
      'Complete absence of response',
      'Worsening response times',
      'No progression despite weeks of therapy',
      'Development of contractures',
      'Loss of deep pain'
    ],
    progression: 'Progress to testing on different surfaces. Add distractions during testing. Test during walking. Incorporate into functional activities',
    contraindications: 'Open wounds on paws, extreme pain, completely absent reflexes in acute phase',
    difficulty_level: 'Easy'
  },

  {
    code: 'TAIL_WAGS',
    name: 'Tail Wag Facilitation',
    category: 'Neurological Rehabilitation',
    description: 'Encouraging tail wagging through positive stimuli to promote lumbosacral motor function and assess recovery.',
    equipment: ['High-value treats', 'Favorite toys', 'Engaging stimuli'],
    setup: 'Dog in comfortable position. Caregiver with motivating items.',
    steps: [
      'Present highly motivating stimuli',
      'Observe for any tail movement',
      'Document tail range, speed, strength',
      'Use various motivators',
      'Attempt multiple times daily',
      'Note asymmetry if present',
      'Compare to baseline',
      'Celebrate any movement enthusiastically'
    ],
    good_form: [
      'Progressive improvement in tail movement',
      'Increased range of motion',
      'Faster wagging speed',
      'Bilateral movement',
      'Spontaneous wagging developing'
    ],
    common_mistakes: [
      'Not documenting objectively',
      'Insufficient motivating stimuli',
      'Only attempting once daily',
      'Not comparing to baseline',
      'Missing subtle improvements'
    ],
    red_flags: [
      'Complete loss of tail movement',
      'Pain with tail manipulation',
      'Asymmetric movement developing',
      'Tail tone completely absent',
      'Incontinence worsening'
    ],
    progression: 'Encourage more vigorous wagging. Incorporate into standing practice. Use as motivation during other exercises. Progress to spontaneous wagging',
    contraindications: 'Caudal spine fracture, acute cauda equina syndrome, tail amputation',
    difficulty_level: 'Easy'
  },

  {
    code: 'NEURO_BALANCE',
    name: 'Balance Disc Work - Neurological',
    category: 'Neurological Rehabilitation',
    description: 'Standing on partially inflated disc with support to enhance proprioception and balance reactions in neurological patients.',
    equipment: ['Partially deflated balance disc', 'Support harness', 'Non-slip mat beneath'],
    setup: 'Disc on stable surface. Dog supported in harness. Spotter present.',
    steps: [
      'Assist dog to place affected limbs on disc',
      'Support adequate weight for safety',
      'Begin with 15-30 second holds',
      'Observe for any corrective responses',
      'Gradually reduce support',
      'Progress to 1-2 minute holds',
      'Repeat 5-10 times',
      'Perform 2-3 times daily'
    ],
    good_form: [
      'Active engagement of postural muscles',
      'Corrective adjustments visible',
      'Some independent weight bearing',
      'Improved stability over time',
      'Controlled movements'
    ],
    common_mistakes: [
      'Disc too inflated initially',
      'Not providing adequate support',
      'Duration too long',
      'Progressing too quickly',
      'Only working one side'
    ],
    red_flags: [
      'No proprioceptive responses developing',
      'Repeated falling or inability to stand',
      'Pain behaviors',
      'Worsening neurological status',
      'Extreme anxiety or distress'
    ],
    progression: 'Increase disc inflation. Decrease support provided. Progress to all four paws on disc. Add perturbations. Transition to more challenging surfaces',
    contraindications: 'Acute spinal instability, severe ataxia without support, extreme fear, vestibular crisis',
    difficulty_level: 'Advanced'
  },

  {
    code: 'BICYCLING',
    name: 'Passive Bicycling Motion',
    category: 'Neurological Rehabilitation',
    description: 'Manual cycling motion of hindlimbs to maintain range, stimulate neural pathways, and prevent contracture.',
    equipment: ['Padded surface', 'Assistant helpful'],
    setup: 'Dog in lateral recumbency. Affected side up. Access to hindlimbs.',
    steps: [
      'Support upper hindlimb',
      'Flex hip and stifle fully',
      'Extend limb smoothly forward',
      'Return to flexed position',
      'Create smooth cycling motion',
      'Maintain for 2-3 minutes continuously',
      'Switch to other limb',
      'Perform 15-20 cycles per limb',
      'Repeat 3-4 times daily'
    ],
    good_form: [
      'Smooth, continuous motion',
      'Full flexion and extension achieved',
      'Rhythmic pattern maintained',
      'Dog relaxed throughout',
      'Bilateral treatment performed'
    ],
    common_mistakes: [
      'Jerky, discontinuous motion',
      'Not achieving full range',
      'Duration too short',
      'Only working one limb',
      'Insufficient daily frequency'
    ],
    red_flags: [
      'Pain or resistance during motion',
      'Joint contracture developing',
      'Increased spasticity',
      'Skin breakdown',
      'Worsening neurological status'
    ],
    progression: 'Increase cycling duration to 5 minutes. Add resistance as motor function returns. Progress to active-assisted cycling. Advance to independent movement',
    contraindications: 'Unstable fractures, acute joint injuries, severe spasticity preventing motion, extreme pain',
    difficulty_level: 'Easy'
  },

  {
    code: 'REFLEX_TESTING',
    name: 'Daily Neurological Reflex Assessment',
    category: 'Neurological Rehabilitation',
    description: 'Systematic testing of spinal reflexes to monitor neurological recovery and guide therapy progression.',
    equipment: ['Reflex hammer or pen', 'Assessment chart', 'Quiet examination area'],
    setup: 'Dog in lateral recumbency. Access to all limbs. Note-taking materials ready.',
    steps: [
      'Test patellar reflex bilaterally',
      'Test withdrawal reflex all limbs',
      'Test panniculus reflex',
      'Assess anal tone and tail tone',
      'Check cutaneous trunci reflex',
      'Document on scale (0-4+)',
      'Compare to previous assessments',
      'Note any changes immediately',
      'Perform daily at consistent time'
    ],
    good_form: [
      'Consistent testing technique',
      'Objective documentation',
      'Bilateral comparison',
      'Daily tracking',
      'Communication with veterinarian'
    ],
    common_mistakes: [
      'Inconsistent technique',
      'Not testing daily',
      'Subjective rather than objective documentation',
      'Not comparing to baseline',
      'Missing subtle changes'
    ],
    red_flags: [
      'Loss of previously present reflexes',
      'Asymmetry developing',
      'No reflexes despite time',
      'Upper motor neuron pattern worsening',
      'Loss of deep pain perception'
    ],
    progression: 'Continue daily monitoring throughout recovery. Use results to guide therapy intensity. Document return of reflexes. Communicate changes to veterinarian',
    contraindications: 'None - this is assessment, not treatment',
    difficulty_level: 'Easy'
  },

  {
    code: 'AQUATIC_NEURO',
    name: 'Aquatic Therapy for Neurological Recovery',
    category: 'Neurological Rehabilitation',
    description: 'Water-based exercise for neurological patients, utilizing buoyancy to enable movement practice without weight bearing demands.',
    equipment: ['Therapy pool or UWTM', 'Life vest', 'Support harness', 'Water temperature monitor'],
    setup: 'Water 82-90°F. Life vest fitted. Support available. Depth hip to chest level.',
    steps: [
      'Fit life vest securely',
      'Support dog into water gradually',
      'Begin with standing in water',
      'Encourage weight shifts',
      'Progress to assisted walking',
      'Support hindquarters as needed',
      'Gradually reduce support',
      'Session 10-20 minutes',
      'Perform 3-5 times weekly'
    ],
    good_form: [
      'Visible limb movement attempts',
      'Progressive increase in voluntary motion',
      'Good cardiovascular effort',
      'Appropriate buoyancy support',
      'Dog appearing comfortable'
    ],
    common_mistakes: [
      'Water too cold (muscle tension)',
      'Session too long (fatigue)',
      'Life vest too loose/tight',
      'Not monitoring for aspiration',
      'Progressing too quickly'
    ],
    red_flags: [
      'Respiratory distress',
      'Extreme anxiety or panic',
      'Aspiration of water',
      'No voluntary movement despite therapy',
      'Hypothermia signs'
    ],
    progression: 'Decrease water depth gradually. Reduce support provided. Increase session duration to 30 minutes. Progress to swimming. Add underwater obstacles',
    contraindications: 'Open wounds, infections, respiratory disease, seizure history, extreme fear of water',
    difficulty_level: 'Advanced'
  },

  {
    code: 'POSITIONAL_ROTATION',
    name: 'Therapeutic Position Changes',
    category: 'Neurological Rehabilitation',
    description: 'Systematic body position rotation to prevent pressure sores, maintain joint mobility, and provide varied sensory input.',
    equipment: ['Multiple cushions/wedges', 'Soft bedding', 'Positioning aids'],
    setup: 'Comfortable bedding. Position supports available. Timer for rotation schedule.',
    steps: [
      'Position dog in right lateral recumbency',
      'Support spine and limbs with cushions',
      'Maintain for 2-3 hours',
      'Rotate to left lateral recumbency',
      'Again support properly',
      'Maintain 2-3 hours',
      'Rotate to sternal position if tolerated',
      'Include prone positioning',
      'Document position schedule'
    ],
    good_form: [
      'Consistent 2-3 hour rotation schedule',
      'Proper support in each position',
      'No pressure on bony prominences',
      'All positions well-tolerated',
      'No skin breakdown developing'
    ],
    common_mistakes: [
      'Rotating too infrequently',
      'Inadequate support in positions',
      'Always choosing same side',
      'Not documenting position changes',
      'Missing overnight rotations'
    ],
    red_flags: [
      'Pressure sores developing',
      'Extreme discomfort in certain positions',
      'Respiratory difficulty when positioned',
      'Joint contractures forming',
      'Severe agitation with position changes'
    ],
    progression: 'Increase time in more challenging positions (sternal). Add sitting position if feasible. Progress toward self-positioning. Eventual unsupported position maintenance',
    contraindications: 'Unstable spine requiring strict positioning, unmanaged pain, respiratory distress in certain positions',
    difficulty_level: 'Easy'
  },

  // ========================================
  // POST-SURGICAL PROGRESSIVE PROTOCOLS (15 exercises)
  // ========================================
  
  {
    code: 'POST_TPLO_WEEK1',
    name: 'TPLO Post-Op Week 1 Protocol',
    category: 'Post-Surgical',
    description: 'Gentle passive range of motion and cold therapy for first week following TPLO surgery.',
    equipment: ['Cold packs', 'Towels', 'Soft bedding', 'Support sling'],
    setup: 'Confined rest area. Cold therapy supplies accessible. Non-slip surfaces.',
    steps: [
      'Apply cold therapy 10-15 minutes, 3-4 times daily',
      'Gentle PROM stifle: 10 reps, 3-4 times daily',
      'No weight bearing forced - allow toe touching only',
      'Short leash walks for elimination only (5 minutes)',
      'Massage quadriceps gently',
      'Monitor incision daily',
      'Restrict all activity, stairs, jumping',
      'Maintain strict exercise restriction'
    ],
    good_form: [
      'Minimal limb swelling',
      'Incision healing appropriately',
      'Some toe touching weight bearing',
      'Dog comfortable and calm',
      'Following exercise restrictions'
    ],
    common_mistakes: [
      'Allowing too much activity',
      'Not doing cold therapy consistently',
      'Forcing weight bearing',
      'PROM too aggressive',
      'Not monitoring incision'
    ],
    red_flags: [
      'Excessive swelling or heat',
      'Incision dehiscence or infection',
      'Complete non-weight bearing after day 5',
      'Extreme pain or distress',
      'Implant palpable or visible'
    ],
    progression: 'Progress to Week 2 protocol on day 8. Begin adding active-assisted motion. Increase walking time slightly. Continue cold therapy after activity',
    contraindications: 'Complications present (infection, implant issues), surgeon restrictions, concurrent injuries',
    difficulty_level: 'Easy'
  },

  {
    code: 'POST_TPLO_WEEK4',
    name: 'TPLO Post-Op Week 4-6 Protocol',
    category: 'Post-Surgical',
    description: 'Progressive strengthening and ROM for TPLO patients at 4-6 weeks post-op.',
    equipment: ['Leash', 'Hills/inclines', 'Balance disc', 'Cavaletti poles'],
    setup: 'Outdoor walking area with varied terrain. Equipment for home exercises.',
    steps: [
      'Leash walks 15-20 minutes, twice daily',
      'Add gentle hills (short duration)',
      'Sit-to-stand exercises: 5-10 reps, 3x daily',
      'Balance disc standing: 30-60 seconds, 3x daily',
      'Low cavaletti poles: 5 passes, twice daily',
      'Continue PROM if stiffness present',
      'Begin gentle play (controlled)',
      'Still no jumping, running, or rough play'
    ],
    good_form: [
      'Consistent weight bearing',
      'Improving stifle flexion',
      'Comfortable with all exercises',
      'Muscle mass maintaining or improving',
      'Good compliance with restrictions'
    ],
    common_mistakes: [
      'Progressing too quickly',
      'Allowing off-leash activity',
      'Hills too steep',
      'Cavaletti poles too high',
      'Neglecting ROM exercises'
    ],
    red_flags: [
      'Increased lameness',
      'Stifle swelling or heat',
      'Reduced ROM from previous week',
      'Pain during exercises',
      'Radiographic concerns at recheck'
    ],
    progression: 'At 6-8 weeks, add short trot intervals. Increase walking duration. Progress cavaletti height. Add aquatic therapy if available',
    contraindications: 'Healing complications, surgeon holds, persistent lameness, implant concerns',
    difficulty_level: 'Moderate'
  },

  {
    code: 'POST_TPLO_RETURN',
    name: 'TPLO Return to Function (8-12 weeks)',
    category: 'Post-Surgical',
    description: 'Advanced strengthening and conditioning for TPLO patients returning to full activity.',
    equipment: ['Various surfaces', 'Inclines', 'Agility equipment optional', 'Swimming access if available'],
    setup: 'Varied exercise environments. Progression based on individual healing.',
    steps: [
      'Leash walks 30-45 minutes daily',
      'Trotting intervals: 2-3 minutes, walking breaks',
      'Hill work: moderate inclines, 10-15 minutes',
      'Balance and proprioceptive exercises daily',
      'Cavaletti or low jumps (if appropriate)',
      'Swimming 2-3 times weekly if available',
      'Begin controlled running by week 12',
      'Gradual return to normal activity'
    ],
    good_form: [
      'Symmetrical gait at walk and trot',
      'Full stifle ROM achieved',
      'Muscle mass restored',
      'Confident with all activities',
      'No lameness observable'
    ],
    common_mistakes: [
      'Returning to full activity too quickly',
      'Not continuing strengthening exercises',
      'Allowing high-impact activities too early',
      'Inadequate warm-up before exercise',
      'Neglecting opposite limb conditioning'
    ],
    red_flags: [
      'Persistent lameness at 12 weeks',
      'Stifle effusion',
      'Limited ROM despite therapy',
      'Meniscal signs developing',
      'Contralateral limb lameness'
    ],
    progression: 'Continue building strength and endurance. Progress to sport-specific training if applicable. Maintain fitness program long-term. Annual monitoring',
    contraindications: 'Incomplete healing, persistent complications, surgeon restrictions, meniscal damage',
    difficulty_level: 'Advanced'
  },

  {
    code: 'POST_FHO_EARLY',
    name: 'FHO Post-Op Early Phase (Weeks 1-2)',
    category: 'Post-Surgical',
    description: 'Initial rehabilitation protocol for femoral head ostectomy patients focusing on early mobilization.',
    equipment: ['Support sling', 'Soft bedding', 'Cold therapy'],
    setup: 'Confined area. Support available. Non-slip flooring.',
    steps: [
      'Cold therapy 10-15 min, 3-4x daily',
      'Gentle hip PROM: 10-15 reps, 4x daily',
      'Encourage early weight bearing',
      'Short walks: 5 minutes, 3-4x daily',
      'Massage pelvic muscles gently',
      'Use sling for support if needed',
      'Monitor for proper limb use',
      'Strict exercise restriction otherwise'
    ],
    good_form: [
      'Progressive weight bearing by day 3-5',
      'Willingness to use limb',
      'Incision healing normally',
      'Minimal swelling',
      'Comfortable at rest'
    ],
    common_mistakes: [
      'Not encouraging early weight bearing',
      'PROM too aggressive',
      'Insufficient activity (too much rest)',
      'Allowing jumping or stairs',
      'Not using support if needed'
    ],
    red_flags: [
      'Non-weight bearing after day 7',
      'Incision complications',
      'Severe pain or distress',
      'Hip luxation',
      'Sciatic nerve involvement'
    ],
    progression: 'Progress to Week 3-4 protocol. Increase walking duration. Decrease support needed. Add gentle hills. Begin sit-to-stand exercises',
    contraindications: 'Surgical complications, infection, nerve damage, concurrent injuries',
    difficulty_level: 'Moderate'
  },

  {
    code: 'POST_FHO_ADVANCED',
    name: 'FHO Advanced Strengthening (Weeks 6-12)',
    category: 'Post-Surgical',
    description: 'Progressive muscle building and return to function for FHO patients.',
    equipment: ['Varied terrain', 'Steps/stairs', 'Swimming pool', 'Balance equipment'],
    setup: 'Multiple exercise environments. Equipment for varied activities.',
    steps: [
      'Walking 30-45 minutes daily',
      'Hill work: moderate inclines',
      'Stair climbing: 1-2 flights, controlled',
      'Swimming 15-20 minutes, 3x weekly',
      'Sit-to-stand: 15-20 reps, 3x daily',
      'Single limb standing affected side',
      'Balance disc exercises',
      'Progressive strengthening program'
    ],
    good_form: [
      'Functional pseudo-joint forming',
      'Good muscle mass development',
      'Minimal or no observable lameness',
      'Confident limb use',
      'Full ROM hip movements'
    ],
    common_mistakes: [
      'Not building muscle adequately',
      'Returning to high impact too soon',
      'Neglecting strengthening exercises',
      'Inconsistent exercise program',
      'Not monitoring muscle development'
    ],
    red_flags: [
      'Persistent lameness at 8-10 weeks',
      'Poor muscle development',
      'Significant limb length discrepancy',
      'Pain during exercises',
      'Limited hip motion'
    ],
    progression: 'Continue long-term strengthening. Progress to running by 12 weeks if appropriate. Maintain fitness program permanently. Monitor for long-term arthritis',
    contraindications: 'Healing complications, poor pseudo-joint formation, persistent pain, concurrent orthopedic issues',
    difficulty_level: 'Advanced'
  },

  {
    code: 'POST_IVDD_CONSV',
    name: 'IVDD Conservative Management Protocol',
    category: 'Post-Surgical',
    description: 'Strict cage rest and gentle therapy protocol for conservatively managed IVDD patients.',
    equipment: ['Cage or small pen', 'Support sling', 'Orthopedic bedding', 'Cold therapy'],
    setup: 'Confined area 4-6 weeks. Level floor. All necessities within pen.',
    steps: [
      'Strict cage rest 4-6 weeks',
      'Out only for elimination on leash',
      'Support with sling during elimination',
      'Gentle PROM all limbs: 10 reps, 3-4x daily',
      'Cold therapy to painful area PRN',
      'Passive spinal stretches if comfortable',
      'Monitor neurological status daily',
      'Medications per veterinarian'
    ],
    good_form: [
      'Compliance with cage rest',
      'Stable or improving neurological status',
      'Using affected limbs',
      'Comfortable in confinement',
      'Good attitude and appetite'
    ],
    common_mistakes: [
      'Not maintaining strict cage rest',
      'Allowing furniture access',
      'Insufficient sling support',
      'Missing early neurological changes',
      'Progressing activity too quickly'
    ],
    red_flags: [
      'Worsening neurological status',
      'Loss of bladder control',
      'Loss of deep pain',
      'Severe pain despite medications',
      'No improvement after 2 weeks'
    ],
    progression: 'After 4-6 weeks cage rest, begin very gradual activity increase. Add short walks. Progress to Week 8+ protocol. Continue restrictions 8-12 weeks total',
    contraindications: 'Loss of deep pain (surgery indicated), progressive neurological decline, severe pain unmanaged',
    difficulty_level: 'Moderate'
  },

  {
    code: 'POST_HEMI',
    name: 'Post-Hemilaminectomy IVDD Protocol',
    category: 'Post-Surgical',
    description: 'Comprehensive rehabilitation program for IVDD patients following spinal surgery.',
    equipment: ['Support harness', 'Balance equipment', 'UWTM access', 'Varied surfaces'],
    setup: 'Progress through phases based on neurological recovery and surgeon approval.',
    steps: [
      'Week 1-2: Cage rest, PROM, cold therapy, sensory stimulation',
      'Week 2-4: Supported standing, assisted walking, gentle stretches',
      'Week 4-6: Progressive walking, balance work, hydrotherapy starts',
      'Week 6-8: Strengthening, proprioceptive training, cavaletti',
      'Week 8-12: Advanced conditioning, functional activities',
      'Monitor neurological status throughout',
      'Adjust based on individual recovery',
      'Maintain long-term core strengthening'
    ],
    good_form: [
      'Progressive return of function',
      'Improving gait quality',
      'Increasing independence',
      'Pain well-controlled',
      'Good compliance with program'
    ],
    common_mistakes: [
      'Progressing phases too quickly',
      'Not individualizing program',
      'Insufficient core strengthening',
      'Neglecting proprioceptive training',
      'Stopping therapy once ambulatory'
    ],
    red_flags: [
      'Declining neurological status',
      'Incision complications',
      'No improvement by 4 weeks',
      'Development of chronic pain',
      'Adjacent segment disease signs'
    ],
    progression: 'Continue therapy 3-6 months minimum. Maintain core strengthening permanently. Monitor for recurrence. Lifestyle modifications long-term',
    contraindications: 'Surgical complications, progressive neurological decline, concurrent medical issues',
    difficulty_level: 'Advanced'
  },

  {
    code: 'POST_FRACTURE',
    name: 'Post-Fracture Repair Mobilization',
    category: 'Post-Surgical',
    description: 'Staged rehabilitation protocol for various long bone fracture repairs.',
    equipment: ['Protective boot if needed', 'Support devices', 'Varied equipment for later stages'],
    setup: 'Progress based on fracture location, fixation type, healing timeline, and surgeon approval.',
    steps: [
      'Weeks 1-3: Strict rest, gentle PROM, cold therapy',
      'Weeks 3-6: Controlled weight bearing, short walks',
      'Weeks 6-8: Progressive walking, early strengthening',
      'Weeks 8-12: Advanced strengthening, return to function',
      'Radiographs per surgeon schedule',
      'Adjust protocol based on healing',
      'Protect fixation throughout healing',
      'Gradual activity increases only'
    ],
    good_form: [
      'Fracture healing on schedule',
      'Progressive weight bearing',
      'Maintaining ROM',
      'Good limb use',
      'No complications'
    ],
    common_mistakes: [
      'Activity increases too rapid',
      'Not protecting fixation',
      'Forcing weight bearing',
      'Missing radiographic rechecks',
      'Not monitoring for complications'
    ],
    red_flags: [
      'Non-union or delayed union',
      'Implant failure',
      'Infection',
      'Loss of ROM',
      'Persistent non-weight bearing'
    ],
    progression: 'Follow surgeon recommendations. Progress based on radiographic healing. Eventually return to full activity. Long-term arthritis monitoring',
    contraindications: 'Healing complications, implant issues, infection, concurrent injuries',
    difficulty_level: 'Moderate'
  },

  {
    code: 'POST_PATELLA',
    name: 'Post-Patellar Luxation Repair Protocol',
    category: 'Post-Surgical',
    description: 'Rehabilitation following surgical correction of patellar luxation.',
    equipment: ['Bandage/splint initially', 'Support sling', 'Exercise equipment for later stages'],
    setup: 'Staged protocol based on surgical procedure performed and surgeon guidelines.',
    steps: [
      'Weeks 1-2: Bandage care, cold therapy, gentle PROM',
      'Week 2: Remove bandage, continue cold therapy',
      'Weeks 2-4: Short walks, encourage weight bearing',
      'Weeks 4-6: Progressive walking, sit-stand exercises',
      'Weeks 6-8: Add hills, cavaletti, balance work',
      'Weeks 8-12: Strengthening program, return to activity',
      'Monitor patellar stability throughout',
      'Watch for reluxation signs'
    ],
    good_form: [
      'Patellar remains reduced',
      'Progressive weight bearing',
      'Improving stifle ROM',
      'Good limb use developing',
      'Muscle development occurring'
    ],
    common_mistakes: [
      'Not monitoring patellar position',
      'Bandage complications',
      'Activity progression too fast',
      'Insufficient strengthening',
      'Missing early reluxation'
    ],
    red_flags: [
      'Patellar reluxation',
      'Persistent lameness',
      'Stifle effusion',
      'Limited ROM',
      'Implant complications'
    ],
    progression: 'Continue strengthening long-term. Progress to full activity by 12 weeks if healing well. Maintain muscle conditioning. Monitor for late complications',
    contraindications: 'Patellar reluxation, surgical complications, concurrent stifle pathology',
    difficulty_level: 'Moderate'
  },

  {
    code: 'POST_AMPUTATION',
    name: 'Limb Amputation Adaptation Protocol',
    category: 'Post-Surgical',
    description: 'Comprehensive rehabilitation for dogs adapting to limb amputation.',
    equipment: ['Support harness', 'Varied surfaces', 'Balance equipment', 'Strengthening tools'],
    setup: 'Focus on incision healing, pain management, and progressive conditioning of remaining limbs.',
    steps: [
      'Week 1-2: Incision care, cold therapy, gentle walking',
      'Week 2-4: Progressive walking duration, early strengthening',
      'Week 4-8: Comprehensive strengthening program',
      'Core strengthening emphasis throughout',
      'Balance and proprioceptive training',
      'Strengthen remaining limbs',
      'Adapt home environment',
      'Long-term fitness program'
    ],
    good_form: [
      'Incision healed',
      'Confident three-limb mobility',
      'Good balance',
      'Strong remaining limbs',
      'Adapted to new body awareness'
    ],
    common_mistakes: [
      'Not strengthening adequately',
      'Allowing weight gain',
      'Insufficient balance training',
      'Not modifying home environment',
      'Neglecting opposite/remaining limbs'
    ],
    red_flags: [
      'Incision complications',
      'Chronic pain at amputation site',
      'Overuse injury remaining limbs',
      'Poor adaptation/quality of life',
      'Severe balance deficits'
    ],
    progression: 'Continue strengthening permanently. Adapt exercises as dog ages. Monitor remaining limbs for overuse. Maintain ideal body weight. Ensure quality of life',
    contraindications: 'Healing complications, severe concurrent disease, poor quality of life despite adaptation',
    difficulty_level: 'Advanced'
  },

  {
    code: 'POST_THR',
    name: 'Total Hip Replacement Post-Op Protocol',
    category: 'Post-Surgical',
    description: 'Strict protocol following total hip replacement to prevent luxation and ensure implant success.',
    equipment: ['Sling support', 'Controlled environment', 'Exercise equipment for later stages'],
    setup: 'Extremely controlled early phases. Progress very gradually. Prevent luxation risk activities.',
    steps: [
      'Weeks 1-2: Strict confinement, cold therapy, gentle PROM',
      'Week 2: Begin short leash walks 5-10 minutes',
      'Weeks 3-6: Progressive walking 15-20 minutes',
      'Weeks 6-8: Add gentle hills, longer walks',
      'Week 8-12: Strengthening program begins',
      'STRICT RESTRICTIONS: No stairs, jumping, slippery floors, rough play for 12 weeks',
      'Monitor for luxation signs constantly',
      'Radiographs per surgeon schedule'
    ],
    good_form: [
      'Excellent weight bearing',
      'Full ROM without pain',
      'No signs of luxation',
      'Implant positioned correctly',
      'Improving muscle mass'
    ],
    common_mistakes: [
      'Activity progression too aggressive',
      'Allowing restricted activities',
      'Not monitoring for luxation',
      'Insufficient confinement early',
      'Missing radiographic rechecks'
    ],
    red_flags: [
      'Hip luxation',
      'Sudden onset lameness',
      'Implant loosening',
      'Infection',
      'Loss of ROM'
    ],
    progression: 'After 12 weeks, gradually increase activity. Continue strengthening. May return to normal activity if healing excellent. Lifelong monitoring needed',
    contraindications: 'Luxation, infection, implant failure, poor bone quality, concurrent disease',
    difficulty_level: 'Advanced'
  },

  {
    code: 'POST_SHOULDER',
    name: 'Post-Op Shoulder Surgery Protocol',
    category: 'Post-Surgical',
    description: 'Rehabilitation following shoulder surgery (OCD, biceps tendon, instability repairs).',
    equipment: ['Support wrap/bandage', 'Exercise equipment', 'Varied surfaces'],
    setup: 'Protocol varies by specific procedure. Generally very gradual progression.',
    steps: [
      'Weeks 1-2: Bandage care, cold therapy, PROM',
      'Weeks 2-4: Remove bandage, short walks, gentle ROM',
      'Weeks 4-6: Progressive walking, early strengthening',
      'Weeks 6-8: Add hills, swimming if appropriate',
      'Weeks 8-12: Comprehensive strengthening program',
      'Avoid pulling/weight bearing on forelimbs early',
      'No jumping or stair climbing for 8-12 weeks',
      'Focus on controlled, smooth movements'
    ],
    good_form: [
      'Progressive weight bearing',
      'Improving ROM',
      'Good limb use',
      'Muscle development',
      'No instability'
    ],
    common_mistakes: [
      'Allowing pulling on leash',
      'Jumping or rough play too early',
      'Not controlling activity adequately',
      'Insufficient ROM exercises',
      'Neglecting scapular stabilization'
    ],
    red_flags: [
      'Persistent lameness',
      'Shoulder effusion',
      'Limited ROM',
      'Instability signs',
      'Implant complications if applicable'
    ],
    progression: 'Progress to full activity by 12-16 weeks. Continue shoulder strengthening. Monitor for long-term degenerative changes. Maintain fitness program',
    contraindications: 'Healing complications, instability, infection, concurrent forelimb pathology',
    difficulty_level: 'Moderate'
  },

  {
    code: 'POST_ELBOW',
    name: 'Post-Elbow Surgery Protocol (FCP/UAP/OCD)',
    category: 'Post-Surgical',
    description: 'Rehabilitation following elbow surgery for fragmented coronoid, ununited anconeal, or OCD.',
    equipment: ['Support bandage', 'Cold therapy', 'Exercise progression equipment'],
    setup: 'Controlled early phase. Very gradual return to activity. Arthritis management focus.',
    steps: [
      'Weeks 1-2: Bandage, cold therapy, gentle PROM',
      'Weeks 2-4: Bandage removal, short walks',
      'Weeks 4-6: Progressive walking program',
      'Weeks 6-8: Add swimming, gentle strengthening',
      'Weeks 8-12: Comprehensive conditioning',
      'Avoid impact activities long-term',
      'Focus on low-impact exercise',
      'Long-term arthritis management'
    ],
    good_form: [
      'Functional weight bearing',
      'Acceptable ROM for daily activities',
      'Good muscle maintenance',
      'Comfortable with exercise',
      'Arthritis managed'
    ],
    common_mistakes: [
      'Expecting complete resolution',
      'High-impact activities',
      'Not managing long-term arthritis',
      'Insufficient conditioning',
      'Weight management neglected'
    ],
    red_flags: [
      'Severe persistent lameness',
      'Progressive arthritis',
      'Elbow effusion',
      'Restricted ROM',
      'Poor quality of life'
    ],
    progression: 'Realistic expectations for lifelong management. Low-impact fitness program. Weight management critical. Arthritis medications PRN. Regular monitoring',
    contraindications: 'Severe elbow arthritis despite surgery, healing complications, concurrent forelimb disease',
    difficulty_level: 'Advanced'
  },

  {
    code: 'POST_MULTI',
    name: 'Multiple Surgical Sites Protocol',
    category: 'Post-Surgical',
    description: 'Coordinated rehabilitation approach for dogs with multiple concurrent surgical sites.',
    equipment: ['Various supports and equipment', 'Individualized based on surgeries'],
    setup: 'Extremely individualized. Prioritize most critical healing. Balance competing needs.',
    steps: [
      'Identify most restrictive surgical site',
      'Follow most conservative protocol initially',
      'Coordinate timing of ROM exercises',
      'Balance activity needs of different sites',
      'Monitor all incisions and healing',
      'Adjust based on healing progress',
      'Consider interactions between sites',
      'Progress most conservatively overall'
    ],
    good_form: [
      'All sites healing appropriately',
      'Balanced functional recovery',
      'Good overall mobility',
      'Pain well-managed',
      'No complications any site'
    ],
    common_mistakes: [
      'Focusing only on one site',
      'Not considering site interactions',
      'Progressing too aggressively anywhere',
      'Missing complications due to complexity',
      'Insufficient monitoring'
    ],
    red_flags: [
      'Complications at any site',
      'Conflicting healing timelines',
      'Unable to comply with multiple restrictions',
      'Declining overall function',
      'Poor quality of life'
    ],
    progression: 'Carefully coordinate progression all sites. Ensure healing each area before advancing. Long-term management often more complex. Regular reassessments critical',
    contraindications: 'Complications any site, incompatible healing timelines, poor overall candidate',
    difficulty_level: 'Advanced'
  },

  {
    code: 'POST_REVISION',
    name: 'Revision Surgery Rehabilitation',
    category: 'Post-Surgical',
    description: 'Modified rehabilitation approach for dogs undergoing revision of previous orthopedic surgery.',
    equipment: ['Varied based on revision procedure', 'Often more supportive equipment needed'],
    setup: 'Generally more conservative than primary surgery. Expect longer timelines. Manage expectations.',
    steps: [
      'Follow protocol for specific revision procedure',
      'Extend timeframes 25-50% longer than primary',
      'More conservative activity progressions',
      'Intensive monitoring for complications',
      'Address factors contributing to revision need',
      'Realistic goal setting',
      'Comprehensive approach',
      'Potential for incomplete recovery'
    ],
    good_form: [
      'Healing progressing',
      'Functional improvement from pre-revision status',
      'No new complications',
      'Acceptable quality of life',
      'Realistic expectations met'
    ],
    common_mistakes: [
      'Expecting primary surgery outcomes',
      'Not extending timeframes adequately',
      'Insufficient conservatism',
      'Not addressing underlying factors',
      'Poor communication about prognosis'
    ],
    red_flags: [
      'Repeat failure',
      'Persistent complications',
      'No improvement over pre-revision',
      'Chronic pain',
      'Poor quality of life despite revision'
    ],
    progression: 'Very gradual, individualized progression. Extended rehabilitation period. Long-term management often required. Regular monitoring essential',
    contraindications: 'Depends on specific revision, but generally poor bone quality, infection, patient factors',
    difficulty_level: 'Advanced'
  }
];

module.exports = EXERCISES_PART7;