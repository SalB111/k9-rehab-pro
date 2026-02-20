// ============================================================================
// EXERCISE DATABASE EXPANSION - PART 8
// K9-REHAB-PRO - 35 ADDITIONAL VET-APPROVED EXERCISES
// Following Dr. Denis Millis & Dr. Darryl Levine Standards
// Certified Canine Rehabilitation Protocols
// ============================================================================

const EXERCISES_PART8 = [
  
  // ========================================
  // SPORT-SPECIFIC CONDITIONING (20 exercises)
  // ========================================
  {
    code: 'AGILITY_PREP',
    name: 'Pre-Agility Conditioning Program',
    category: 'Sport Conditioning',
    description: 'Foundational fitness and injury prevention program for dogs preparing for agility training.',
    equipment: ['Various agility equipment', 'Conditioning tools', 'Safety gear'],
    setup: 'Progressive program over 8-12 weeks before starting formal agility training.',
    steps: [
      'Cardiovascular base: 30-45 min daily walking/jogging',
      'Core strengthening exercises daily',
      'Balance and proprioception work 3-4x weekly',
      'Plyometric training 2-3x weekly',
      'Flexibility and ROM exercises daily',
      'Jump grid work at low heights',
      'Tunnel confidence building',
      'Gradual introduction to equipment'
    ],
    good_form: [
      'Excellent cardiovascular fitness',
      'Strong core stability',
      'Good body awareness',
      'Flexible and mobile',
      'Confident with basic equipment'
    ],
    common_mistakes: [
      'Starting agility without conditioning',
      'Inadequate core strength',
      'Jumping too high too soon',
      'Not building cardiovascular base',
      'Rushing equipment introduction'
    ],
    red_flags: [
      'Lameness developing',
      'Fear of equipment',
      'Inadequate fitness for demands',
      'Joint pain or swelling',
      'Poor body control'
    ],
    progression: 'Progress to formal agility training. Continue conditioning program throughout career. Maintain fitness between competitions. Regular reassessment',
    contraindications: 'Orthopedic disease, inadequate skeletal maturity, cardiopulmonary disease, poor structural conformation',
    difficulty_level: 'Advanced'
  },

  {
    code: 'JUMP_GRIDS',
    name: 'Jump Grid Training',
    category: 'Sport Conditioning',
    description: 'Systematic jump training using grid patterns to develop proper jumping biomechanics and power.',
    equipment: ['4-6 jump standards', 'Adjustable bars', 'Measured spacing marks'],
    setup: 'Jumps set at appropriate height (start 50% of competition height). Spacing based on dog size and stride.',
    steps: [
      'Begin with single jump at low height',
      'Progress to 2-jump grid (bounce or stride)',
      'Add 3rd and 4th jump as skill develops',
      'Vary spacing: bounce (6-9 ft), one stride (12-15 ft)',
      'Increase height gradually (2 inch increments)',
      'Practice both directions',
      'Include rest between repetitions',
      'Perform 2-3 times weekly'
    ],
    good_form: [
      'Proper takeoff and landing',
      'Adjustable stride length',
      'Good body arc over jumps',
      'Confident approach',
      'Consistent form across repetitions'
    ],
    common_mistakes: [
      'Height too high initially',
      'Spacing inappropriate for size',
      'Too many repetitions',
      'Not varying patterns',
      'Insufficient warm-up'
    ],
    red_flags: [
      'Knocking bars consistently',
      'Limb lameness',
      'Fear or refusal',
      'Poor jumping form',
      'Post-exercise soreness'
    ],
    progression: 'Increase height to competition level. Add more complex patterns. Include turns and angles. Progress to full courses. Maintain technique focus',
    contraindications: 'Orthopedic injuries, growth plates open, cardiovascular disease, fear of jumping',
    difficulty_level: 'Advanced'
  },

  {
    code: 'WEAVE_CONDITIONING',
    name: 'Weave Pole Conditioning',
    category: 'Sport Conditioning',
    description: 'Progressive training to build weaving skills while protecting spine and preventing injury.',
    equipment: ['Weave poles (6-12)', 'Channel/guide wires optional'],
    setup: 'Start with wider spacing or channels. Progress to competition spacing (24 inches).',
    steps: [
      'Begin with channel method or 2x2 training',
      'Start with 6 poles, progress to 12',
      'Practice at moderate speed initially',
      'Build to 5-10 repetitions per session',
      'Include both entry directions',
      'Progress speed gradually',
      'Warm up thoroughly before weaving',
      'Practice 2-3 times weekly maximum'
    ],
    good_form: [
      'Smooth lateral flexion',
      'Proper entry technique',
      'Consistent footwork pattern',
      'Good speed with accuracy',
      'No skipping poles'
    ],
    common_mistakes: [
      'Too many repetitions (overuse)',
      'Speed before accuracy',
      'Not training both entries',
      'Inadequate warm-up',
      'Training when fatigued'
    ],
    red_flags: [
      'Back soreness or pain',
      'Decreased performance',
      'Popping out of poles',
      'Lameness during or after',
      'Reluctance to weave'
    ],
    progression: 'Build to competition speed. Practice varied entries. Add distraction proofing. Maintain technique focus. Regular form assessment',
    contraindications: 'Spinal disease, hip dysplasia, hindlimb lameness, inadequate body awareness',
    difficulty_level: 'Advanced'
  },

  {
    code: 'CONTACT_STRENGTH',
    name: 'Contact Obstacle Strengthening',
    category: 'Sport Conditioning',
    description: 'Building strength and confidence for A-frame, dog walk, and teeter contact obstacles.',
    equipment: ['Contact obstacles', 'Target plates', 'Non-slip surface'],
    setup: 'Start with obstacles at low/flat positions. Progress height gradually.',
    steps: [
      'Begin with flat planks for confidence',
      'Practice 2-on-2-off position',
      'Build to low A-frame (3-4 feet)',
      'Progress dog walk height gradually',
      'Teeter desensitization separately',
      'Focus on contact zone performance',
      'Include ascent and descent strengthening',
      'Practice 2-3 times weekly'
    ],
    good_form: [
      'Confident approach and ascent',
      'Controlled descent',
      'Proper contact behavior',
      'Good body control throughout',
      'No hesitation or balking'
    ],
    common_mistakes: [
      'Progressing height too quickly',
      'Not building descent strength',
      'Forcing fearful dogs',
      'Poor contact training',
      'Inadequate strength base'
    ],
    red_flags: [
      'Fear or avoidance',
      'Lameness after training',
      'Loss of control on descent',
      'Shoulder or forelimb pain',
      'Jumping off early'
    ],
    progression: 'Progress to full height obstacles. Build speed with control. Add sequences. Practice various approach angles. Competition preparation',
    contraindications: 'Orthopedic disease, extreme fear, inadequate fitness, poor body awareness',
    difficulty_level: 'Advanced'
  },

  {
    code: 'HERDING_FIT',
    name: 'Herding Dog Conditioning',
    category: 'Sport Conditioning',
    description: 'Fitness program for herding dogs focusing on agility, endurance, and rapid direction changes.',
    equipment: ['Large field area', 'Varied terrain', 'Conditioning tools'],
    setup: 'Progressive program building cardiovascular endurance and lateral agility.',
    steps: [
      'Daily cardiovascular work: 45-60 minutes',
      'Include varied terrain and footing',
      'Lateral agility drills 3x weekly',
      'Sprint interval training 2x weekly',
      'Core and hindlimb strengthening daily',
      'Balance and proprioceptive work',
      'Figure-8 and serpentine patterns',
      'Gradual introduction to stock work'
    ],
    good_form: [
      'Excellent endurance',
      'Quick lateral movements',
      'Strong hindquarters',
      'Good body control',
      'Maintained fitness during work'
    ],
    common_mistakes: [
      'Inadequate cardiovascular base',
      'Not training lateral agility',
      'Too much stock work without conditioning',
      'Neglecting strength training',
      'Poor surface conditioning'
    ],
    red_flags: [
      'Exercise intolerance',
      'Lameness from repetitive work',
      'Hip or stifle problems',
      'Foot pad injuries',
      'Chronic soreness'
    ],
    progression: 'Increase work duration and intensity. Progress to working livestock. Maintain fitness year-round. Regular veterinary monitoring',
    contraindications: 'Orthopedic disease, cardiovascular limitations, inadequate skeletal maturity',
    difficulty_level: 'Advanced'
  },

  {
    code: 'DOCK_DIVING',
    name: 'Dock Diving Preparation',
    category: 'Sport Conditioning',
    description: 'Progressive training for dock diving including jump power, swimming endurance, and impact conditioning.',
    equipment: ['Dock facility', 'Pool access', 'Training aids'],
    setup: 'Build confidence, strength, and skills progressively over several months.',
    steps: [
      'Swimming conditioning 2-3x weekly',
      'Land-based jump power training',
      'Gradual dock height introduction',
      'Build approach confidence',
      'Strengthen forelimbs for takeoff',
      'Core stability training',
      'Swimming endurance building',
      'Competition distance practice'
    ],
    good_form: [
      'Powerful jump takeoff',
      'Good air form',
      'Clean water entry',
      'Strong swimming',
      'Enthusiastic performance'
    ],
    common_mistakes: [
      'Inadequate swimming conditioning',
      'Not building jump power',
      'Forcing fearful dogs',
      'Too frequent training (overuse)',
      'Neglecting strength training'
    ],
    red_flags: [
      'Shoulder injuries',
      'Spinal pain',
      'Water aspiration',
      'Forelimb lameness',
      'Fear of jumping'
    ],
    progression: 'Build to competition distances. Refine technique. Maintain peak fitness. Regular strength training. Monitor for overuse',
    contraindications: 'Orthopedic disease, fear of water, respiratory disease, ear infections',
    difficulty_level: 'Advanced'
  },

  {
    code: 'FLYBALL_PREP',
    name: 'Flyball Conditioning Program',
    category: 'Sport Conditioning',
    description: 'Specialized conditioning for flyball focusing on speed, turning ability, and repetitive jump stress management.',
    equipment: ['Jump equipment', 'Flyball box', 'Sprint training area'],
    setup: 'Progressive training addressing all aspects of flyball performance and injury prevention.',
    steps: [
      'Sprint training for acceleration',
      'Jump conditioning at appropriate heights',
      'Box turn training and strengthening',
      'Core stability exercises daily',
      'Plyometric training for power',
      'Flexibility work for turns',
      'Build to multiple run endurance',
      'Practice 2-3 times weekly'
    ],
    good_form: [
      'Explosive acceleration',
      'Efficient box turns',
      'Consistent jump form',
      'Good endurance for heats',
      'Quick recovery between runs'
    ],
    common_mistakes: [
      'Inadequate box turn training',
      'Too many repetitions per session',
      'Jump heights too high',
      'Not building turn strength',
      'Insufficient rest between heats'
    ],
    red_flags: [
      'Shoulder injuries from turns',
      'Carpal hyperextension',
      'Iliopsoas strains',
      'Chronic soreness',
      'Decreased performance'
    ],
    progression: 'Build to full tournament schedule. Maintain peak fitness. Cross-training for balance. Regular veterinary monitoring. Injury prevention focus',
    contraindications: 'Orthopedic disease, inadequate fitness, poor box turn mechanics, structural issues',
    difficulty_level: 'Advanced'
  },

  {
    code: 'FIELD_TRIAL',
    name: 'Field Trial Conditioning',
    category: 'Sport Conditioning',
    description: 'Endurance and terrain conditioning for hunting and field trial dogs.',
    equipment: ['Varied terrain access', 'Swimming areas', 'Training birds optional'],
    setup: 'Progressive endurance building over 8-12 weeks before season.',
    steps: [
      'Long slow distance: 60-90 minutes daily',
      'Include varied terrain types',
      'Swimming 2-3 times weekly',
      'Add interval training progressively',
      'Foot pad conditioning on terrain',
      'Heat acclimation if applicable',
      'Build to 2-3 hour endurance',
      'Maintain throughout season'
    ],
    good_form: [
      'Excellent endurance',
      'Conditioned foot pads',
      'Strong steady pace',
      'Good heat tolerance',
      'Quick recovery'
    ],
    common_mistakes: [
      'Inadequate pre-season conditioning',
      'Not conditioning pads',
      'Too rapid distance increase',
      'Neglecting swimming fitness',
      'Poor heat acclimation'
    ],
    red_flags: [
      'Exercise intolerance',
      'Foot pad injuries',
      'Heat stress',
      'Lameness from overuse',
      'Declining performance'
    ],
    progression: 'Build to competition demands. Maintain fitness during season. Regular rest days. Post-season recovery. Year-round base fitness',
    contraindications: 'Cardiovascular disease, orthopedic limitations, poor heat tolerance, inadequate fitness',
    difficulty_level: 'Advanced'
  },

  {
    code: 'TRACKING_FIT',
    name: 'Tracking/Nosework Conditioning',
    category: 'Sport Conditioning',
    description: 'Fitness program for scent work dogs focusing on endurance and varied terrain work.',
    equipment: ['Varied terrain', 'Different surfaces', 'Weather exposure'],
    setup: 'Build endurance and surface tolerance for extended tracking work.',
    steps: [
      'Progressive distance building',
      'Train on varied surfaces',
      'Weather condition exposure',
      'Hill climbing for endurance',
      'Core strength for terrain navigation',
      'Foot pad conditioning',
      'Build to 2-3 hour tracks',
      'Regular practice on target terrain'
    ],
    good_form: [
      'Sustained work capacity',
      'Good terrain navigation',
      'Conditioned pads',
      'Weather tolerant',
      'Maintained focus'
    ],
    common_mistakes: [
      'Inadequate distance building',
      'Not training on varied surfaces',
      'Poor pad conditioning',
      'Insufficient strength training',
      'Neglecting weather preparation'
    ],
    red_flags: [
      'Exercise intolerance',
      'Pad injuries',
      'Lameness on terrain',
      'Loss of focus due to fatigue',
      'Weather-related problems'
    ],
    progression: 'Build to competition/working demands. Maintain year-round fitness. Surface variety training. Strength maintenance. Regular monitoring',
    contraindications: 'Orthopedic limitations, cardiovascular disease, severe pad sensitivity, inadequate fitness',
    difficulty_level: 'Moderate'
  },

  {
    code: 'DISC_DOG',
    name: 'Disc Dog Conditioning',
    category: 'Sport Conditioning',
    description: 'Comprehensive conditioning for disc dogs including jump power, aerial body control, and landing mechanics.',
    equipment: ['Discs', 'Jump training equipment', 'Conditioning tools'],
    setup: 'Progressive program building all physical requirements for disc competition.',
    steps: [
      'Jump power plyometrics 3x weekly',
      'Core strengthening daily',
      'Landing mechanics training',
      'Aerial body awareness exercises',
      'Sprint training for approach speed',
      'Flexibility for catches',
      'Build throw height progressively',
      'Practice 2-3 times weekly'
    ],
    good_form: [
      'Powerful vertical jump',
      'Good aerial control',
      'Safe landing mechanics',
      'Flexible for various catches',
      'Strong core stability'
    ],
    common_mistakes: [
      'Too high throws too soon',
      'Inadequate landing training',
      'Not building jump power properly',
      'Too many repetitions',
      'Poor surface selection'
    ],
    red_flags: [
      'Landing injuries',
      'Spinal pain',
      'Shoulder problems',
      'Hip or stifle lameness',
      'Chronic soreness'
    ],
    progression: 'Build to competition level throws. Refine techniques. Maintain peak fitness. Cross-training for balance. Regular injury prevention',
    contraindications: 'Orthopedic disease, spinal issues, poor landing mechanics, inadequate body control',
    difficulty_level: 'Advanced'
  },

  {
    code: 'LURE_COURSE',
    name: 'Lure Coursing Conditioning',
    category: 'Sport Conditioning',
    description: 'Speed and endurance conditioning for lure coursing sighthounds.',
    equipment: ['Large open area', 'Sprint training space', 'Conditioning tools'],
    setup: 'Progressive speed and endurance building appropriate for breed.',
    steps: [
      'Sprint interval training 3x weekly',
      'Long distance jogging for base',
      'Turn and acceleration practice',
      'Build to full course distances',
      'Strength training for power',
      'Flexibility for turns',
      'Surface conditioning',
      'Practice on varied terrain'
    ],
    good_form: [
      'Explosive acceleration',
      'Sustained speed',
      'Quick directional changes',
      'Good endurance for multiple runs',
      'Fast recovery'
    ],
    common_mistakes: [
      'Inadequate sprint conditioning',
      'Not training turns',
      'Too rapid distance increase',
      'Poor surface preparation',
      'Insufficient strength training'
    ],
    red_flags: [
      'Muscle injuries',
      'Carpal injuries',
      'Gracilis/semitendinosus strains',
      'Toe injuries',
      'Exercise intolerance'
    ],
    progression: 'Build to competition distances and speed. Maintain fitness between events. Cross-training for strength. Regular veterinary checks',
    contraindications: 'Cardiovascular disease, orthopedic issues, poor fitness level, structural problems',
    difficulty_level: 'Advanced'
  },

  {
    code: 'WEIGHT_PULL',
    name: 'Weight Pulling Conditioning',
    category: 'Sport Conditioning',
    description: 'Strength and technique training for weight pulling competition dogs.',
    equipment: ['Pulling harness', 'Training cart/sled', 'Weights', 'Training surface'],
    setup: 'Very progressive strength building with proper technique emphasis.',
    steps: [
      'Harness conditioning and fit',
      'Technique training with minimal weight',
      'Progressive weight increases (5-10% increments)',
      'Strength training: heavy pulls 1-2x weekly',
      'Power training: moderate weights 2x weekly',
      'Core and hindlimb strengthening daily',
      'Rest days between heavy pulls',
      'Surface-specific training'
    ],
    good_form: [
      'Proper pulling technique',
      'Strong drive and power',
      'Good harness fit',
      'Consistent form under load',
      'Appropriate progression'
    ],
    common_mistakes: [
      'Weight increases too rapid',
      'Poor technique',
      'Inadequate rest between pulls',
      'Wrong harness type/fit',
      'Not building base strength'
    ],
    red_flags: [
      'Back or hip pain',
      'Shoulder injuries',
      'Decreased performance',
      'Poor technique under load',
      'Chronic muscle soreness'
    ],
    progression: 'Progressive weight increases toward goals. Maintain technique focus. Peak for competitions. Off-season maintenance. Regular veterinary monitoring',
    contraindications: 'Orthopedic disease, spinal problems, cardiovascular limitations, structural issues',
    difficulty_level: 'Advanced'
  },

  {
    code: 'BIKEJOR',
    name: 'Bikejoring/Scootering Conditioning',
    category: 'Sport Conditioning',
    description: 'Endurance and strength conditioning for dogs pulling bike or scooter.',
    equipment: ['Bike/scooter', 'Pulling harness', 'Training area'],
    setup: 'Progressive distance and speed building with proper equipment.',
    steps: [
      'Equipment familiarization',
      'Begin with short easy distances',
      'Build base endurance gradually',
      'Add hill training progressively',
      'Interval training for speed',
      'Practice starts and stops',
      'Build to 10-20 mile distances',
      'Train 3-4 times weekly'
    ],
    good_form: [
      'Strong sustained pulling',
      'Good technique throughout',
      'Appropriate pace control',
      'Quick recovery',
      'Enthusiastic performance'
    ],
    common_mistakes: [
      'Distance increases too rapid',
      'Speed too high initially',
      'Poor harness fit',
      'Inadequate rest days',
      'Not training hill work'
    ],
    red_flags: [
      'Shoulder or back pain',
      'Exercise intolerance',
      'Pad injuries',
      'Iliopsoas strains',
      'Decreased enthusiasm'
    ],
    progression: 'Build to target distances and speeds. Maintain fitness year-round. Cross-training for balance. Equipment maintenance. Regular monitoring',
    contraindications: 'Orthopedic disease, cardiovascular limitations, poor fitness, structural issues',
    difficulty_level: 'Advanced'
  },

  {
    code: 'DOCK_RETRIEVE',
    name: 'Retriever Water Conditioning',
    category: 'Sport Conditioning',
    description: 'Swimming endurance and water work conditioning for retrievers.',
    equipment: ['Water access', 'Training bumpers', 'Float coat optional'],
    setup: 'Progressive swimming conditioning with retrieval work.',
    steps: [
      'Start with basic swimming',
      'Build swimming endurance progressively',
      'Add retrieval work gradually',
      'Practice entries and exits',
      'Train current/wave work if applicable',
      'Build to multiple retrieves',
      'Cold water acclimation if needed',
      'Practice 2-3 times weekly'
    ],
    good_form: [
      'Strong swimming technique',
      'Good endurance for multiple retrieves',
      'Confident water entries',
      'Proper retrieve hold',
      'Quick recovery between retrieves'
    ],
    common_mistakes: [
      'Too many retrieves per session',
      'Not building base swimming fitness',
      'Poor entry/exit technique',
      'Inadequate cold acclimation',
      'Overwork without conditioning'
    ],
    red_flags: [
      'Swimming difficulties',
      'Shoulder pain',
      'Hip problems',
      'Hypothermia',
      'Ear infections'
    ],
    progression: 'Build to hunting/trial demands. Maintain fitness during season. Water safety focus. Regular ear care. Off-season maintenance',
    contraindications: 'Orthopedic disease, ear problems, fear of water, poor swimming ability',
    difficulty_level: 'Moderate'
  },

  {
    code: 'BARN_HUNT',
    name: 'Barn Hunt Fitness',
    category: 'Sport Conditioning',
    description: 'Agility and strength conditioning for barn hunt competition.',
    equipment: ['Hay bales', 'Varied surfaces', 'Training area'],
    setup: 'Build climbing strength and agility for hay bale navigation.',
    steps: [
      'Hay bale climb training',
      'Balance on unstable hay',
      'Tunnel crawling conditioning',
      'Core strength for climbing',
      'Forelimb strengthening',
      'Flexibility for tight spaces',
      'Endurance for multiple runs',
      'Practice 1-2 times weekly'
    ],
    good_form: [
      'Confident climbing',
      'Good balance on hay',
      'Strong tunnel work',
      'Quick navigation',
      'Sustained search drive'
    ],
    common_mistakes: [
      'Not training climbing strength',
      'Inadequate balance work',
      'Too many repetitions',
      'Poor surface familiarization',
      'Forcing fearful dogs'
    ],
    red_flags: [
      'Lameness from climbing',
      'Shoulder pain',
      'Fear of heights/instability',
      'Pad injuries',
      'Loss of enthusiasm'
    ],
    progression: 'Build to competition demands. Maintain fitness between events. Cross-training for strength. Surface variety training',
    contraindications: 'Orthopedic disease, fear/anxiety, poor body awareness, inadequate fitness',
    difficulty_level: 'Moderate'
  },

  {
    code: 'SKIJOR',
    name: 'Skijoring Conditioning',
    category: 'Sport Conditioning',
    description: 'Winter sport conditioning for dogs pulling skier.',
    equipment: ['Skijoring harness', 'Line and belt', 'Snow conditions'],
    setup: 'Cold weather conditioning and pulling strength development.',
    steps: [
      'Cold acclimation progressive',
      'Pulling technique training',
      'Build cardiovascular endurance',
      'Strength training for pulling',
      'Practice on varied snow conditions',
      'Hill training',
      'Build to target distances',
      'Train 3-4 times weekly in season'
    ],
    good_form: [
      'Strong sustained pulling',
      'Good cold tolerance',
      'Appropriate pace maintenance',
      'Quick recovery',
      'Consistent technique'
    ],
    common_mistakes: [
      'Inadequate cold acclimation',
      'Poor pulling technique',
      'Distance progression too rapid',
      'Not training hills',
      'Insufficient rest'
    ],
    red_flags: [
      'Cold intolerance',
      'Pad injuries',
      'Shoulder or back pain',
      'Exercise intolerance',
      'Decreased enthusiasm'
    ],
    progression: 'Build to racing/touring distances. Peak for season. Off-season cross-training. Maintain base fitness. Regular monitoring',
    contraindications: 'Orthopedic disease, cold intolerance, cardiovascular issues, poor fitness',
    difficulty_level: 'Advanced'
  },

  {
    code: 'RALLY_FIT',
    name: 'Rally Obedience Fitness',
    category: 'Sport Conditioning',
    description: 'General fitness and focus conditioning for rally obedience.',
    equipment: ['Rally signs/course', 'Training area', 'Basic equipment'],
    setup: 'Maintain general fitness and mental focus for rally work.',
    steps: [
      'Daily walks 30-45 minutes',
      'Practice heeling and turns',
      'Core stability exercises',
      'Balance work for pivots',
      'Flexibility for movements',
      'Mental focus training',
      'Build stamina for full courses',
      'Practice 2-3 times weekly'
    ],
    good_form: [
      'Maintains focus throughout',
      'Good body control',
      'Smooth transitions',
      'Consistent performance',
      'Good physical condition'
    ],
    common_mistakes: [
      'Neglecting physical fitness',
      'Too much mental drilling',
      'Not training body control',
      'Poor flexibility',
      'Inadequate rest'
    ],
    red_flags: [
      'Loss of focus',
      'Lameness',
      'Difficulty with movements',
      'Decreased enthusiasm',
      'Physical limitations'
    ],
    progression: 'Maintain consistent fitness. Progress difficulty levels. Mental conditioning. Competition preparation. Enjoy the sport',
    contraindications: 'Severe orthopedic issues, major behavioral concerns, inadequate training foundation',
    difficulty_level: 'Easy'
  },

  {
    code: 'CONFORMATION',
    name: 'Show Dog Conditioning',
    category: 'Sport Conditioning',
    description: 'Fitness and muscle conditioning for conformation show dogs.',
    equipment: ['Treadmill optional', 'Various surfaces', 'Show lead'],
    setup: 'Build and maintain show condition and proper movement.',
    steps: [
      'Daily roadwork for muscle tone',
      'Trotting practice on lead',
      'Free stacking practice',
      'Maintain ideal body condition',
      'Build topline strength',
      'Proper gaiting technique',
      'Regular grooming and care',
      'Pre-show conditioning'
    ],
    good_form: [
      'Excellent muscle condition',
      'Proper body weight',
      'Confident movement',
      'Good show presence',
      'Correct structure presentation'
    ],
    common_mistakes: [
      'Over or under conditioning',
      'Poor gaiting practice',
      'Inadequate muscle development',
      'Weight management issues',
      'Inconsistent training'
    ],
    red_flags: [
      'Lameness',
      'Poor movement',
      'Incorrect body condition',
      'Behavioral issues',
      'Structural concerns'
    ],
    progression: 'Maintain peak condition for shows. Age-appropriate training. Regular veterinary care. Retirement planning. Health priority',
    contraindications: 'Orthopedic disease, behavioral unsuitability, structural faults causing pain',
    difficulty_level: 'Easy'
  },

  {
    code: 'DETECTION',
    name: 'Detection Dog Conditioning',
    category: 'Sport Conditioning',
    description: 'Fitness program for detection and working dogs with varied operational demands.',
    equipment: ['Varied terrain', 'Different surfaces', 'Environmental conditions'],
    setup: 'Build comprehensive fitness for diverse working conditions.',
    steps: [
      'Endurance training: 60+ minutes daily',
      'Varied surface conditioning',
      'Climbing and obstacle work',
      'Environmental tolerance training',
      'Strength and agility work',
      'Build work stamina',
      'Maintain year-round fitness',
      'Operational readiness focus'
    ],
    good_form: [
      'Excellent overall fitness',
      'Adaptable to conditions',
      'Strong work ethic',
      'Good recovery ability',
      'Injury resistant'
    ],
    common_mistakes: [
      'Inadequate base fitness',
      'Poor environmental preparation',
      'Not training varied surfaces',
      'Insufficient strength work',
      'Overwork without recovery'
    ],
    red_flags: [
      'Exercise intolerance',
      'Chronic injuries',
      'Environmental stress',
      'Declining performance',
      'Behavioral changes'
    ],
    progression: 'Maintain operational readiness. Regular fitness assessments. Injury prevention focus. Career longevity emphasis. Retirement planning',
    contraindications: 'Medical limitations, temperament unsuitability, chronic health issues',
    difficulty_level: 'Advanced'
  },

  {
    code: 'TREIBBALL',
    name: 'Treibball Conditioning',
    category: 'Sport Conditioning',
    description: 'Fitness for treibball (herding balls) focusing on pushing power and directional control.',
    equipment: ['Treibball balls', 'Training area', 'Goals'],
    setup: 'Build pushing strength and body control for ball herding.',
    steps: [
      'Core strengthening daily',
      'Pushing technique training',
      'Build shoulder and chest strength',
      'Balance and body control work',
      'Cardiovascular conditioning',
      'Directional control practice',
      'Build to full games',
      'Practice 2-3 times weekly'
    ],
    good_form: [
      'Strong controlled pushing',
      'Good directional control',
      'Maintained focus',
      'Proper technique',
      'Good fitness for duration'
    ],
    common_mistakes: [
      'Poor pushing technique',
      'Inadequate strength training',
      'Too long training sessions',
      'Not training body control',
      'Forcing uncomfortable dogs'
    ],
    red_flags: [
      'Shoulder pain',
      'Neck strain',
      'Loss of enthusiasm',
      'Poor technique causing injury',
      'Lameness'
    ],
    progression: 'Progress to competition level. Maintain fitness. Technique refinement. Mental conditioning. Injury prevention',
    contraindications: 'Shoulder problems, neck issues, extreme reluctance, orthopedic disease',
    difficulty_level: 'Moderate'
  },

  // ========================================
  // COMPLEMENTARY THERAPIES (15 exercises)
  // ========================================
  
  {
    code: 'LASER_THERAPY',
    name: 'Therapeutic Laser Treatment',
    category: 'Complementary Therapy',
    description: 'Class IV laser therapy for pain management, inflammation reduction, and tissue healing promotion.',
    equipment: ['Class IV therapeutic laser', 'Safety goggles', 'Treatment protocols'],
    setup: 'Professional administration by trained personnel. Treatment area prepared. Safety protocols followed.',
    steps: [
      'Identify treatment area and pathology',
      'Select appropriate laser parameters',
      'Apply safety goggles to dog and personnel',
      'Position laser probe appropriately',
      'Treat target area per protocol',
      'Typical session: 5-15 minutes',
      'Frequency: 2-3 times weekly initially',
      'Progress to maintenance as indicated'
    ],
    good_form: [
      'Dog remains calm during treatment',
      'Appropriate probe distance maintained',
      'Full treatment area covered',
      'Safety protocols followed',
      'Proper documentation'
    ],
    common_mistakes: [
      'Inappropriate laser parameters',
      'Insufficient safety measures',
      'Too short treatment duration',
      'Inconsistent treatment schedule',
      'Not monitoring response'
    ],
    red_flags: [
      'Skin burns or irritation',
      'Increased inflammation',
      'No improvement after 6-8 treatments',
      'Worsening clinical signs',
      'Adverse reactions'
    ],
    progression: 'Start with higher frequency, decrease to maintenance. May combine with other therapies. Long-term protocols for chronic conditions',
    contraindications: 'Neoplasia, pregnancy, photosensitivity, infected areas, growth plates (some protocols)',
    difficulty_level: 'Easy'
  },

  {
    code: 'THERAPEUTIC_US',
    name: 'Therapeutic Ultrasound',
    category: 'Complementary Therapy',
    description: 'Ultrasound therapy for deep tissue heating, pain relief, and promoting tissue repair.',
    equipment: ['Therapeutic ultrasound unit', 'Coupling gel', 'Clippers if needed'],
    setup: 'Treatment area clipped if needed. Gel applied. Parameters set appropriately.',
    steps: [
      'Clip hair from treatment area',
      'Apply adequate coupling gel',
      'Set frequency and intensity',
      'Move probe continuously in small circles',
      'Treat 5-10 minutes per area',
      'Clean gel after treatment',
      'Frequency: 3-5 times weekly',
      'Course: 6-12 treatments typically'
    ],
    good_form: [
      'Continuous probe movement',
      'Adequate gel maintained',
      'Appropriate parameters',
      'Patient comfortable',
      'Proper treatment duration'
    ],
    common_mistakes: [
      'Stationary probe (hot spots)',
      'Insufficient gel',
      'Wrong parameters for condition',
      'Over-treatment',
      'Treating over implants'
    ],
    red_flags: [
      'Skin burns or pain',
      'Increased inflammation',
      'Bone pain from periosteal heating',
      'No clinical improvement',
      'Adverse reactions'
    ],
    progression: 'May increase intensity as tolerated. Often combined with other modalities. Maintenance protocols available',
    contraindications: 'Infection, acute inflammation, neoplasia, implants, growth plates, pregnancy',
    difficulty_level: 'Easy'
  },

  {
    code: 'ESTIM',
    name: 'Electrical Muscle Stimulation (NMES)',
    category: 'Complementary Therapy',
    description: 'Neuromuscular electrical stimulation to prevent atrophy and retrain muscle function.',
    equipment: ['NMES unit', 'Electrodes', 'Gel or alcohol', 'Clippers'],
    setup: 'Area clipped. Electrodes positioned on target muscle. Parameters set for goal.',
    steps: [
      'Clip electrode sites',
      'Clean skin with alcohol',
      'Apply gel to electrodes',
      'Position electrodes on motor points',
      'Set parameters (frequency, pulse width, intensity)',
      'Gradually increase intensity to visible contraction',
      'Treatment duration: 15-20 minutes',
      'Frequency: Daily to 2-3x weekly'
    ],
    good_form: [
      'Visible muscle contractions',
      'Dog comfortable throughout',
      'Appropriate intensity',
      'Proper electrode placement',
      'Consistent treatments'
    ],
    common_mistakes: [
      'Electrodes not on motor points',
      'Intensity too low (no effect)',
      'Intensity too high (painful)',
      'Insufficient treatment duration',
      'Irregular schedule'
    ],
    red_flags: [
      'Pain or distress',
      'Skin irritation',
      'No muscle response',
      'Worsening atrophy',
      'Adverse reactions'
    ],
    progression: 'Increase intensity as tolerated. Progress to voluntary muscle use. Maintain until active exercise possible',
    contraindications: 'Pacemakers, seizures, neoplasia, pregnancy, skin conditions, cardiac arrhythmias',
    difficulty_level: 'Moderate'
  },

  {
    code: 'TENS',
    name: 'Transcutaneous Electrical Nerve Stimulation (TENS)',
    category: 'Complementary Therapy',
    description: 'TENS therapy for pain management through sensory nerve stimulation.',
    equipment: ['TENS unit', 'Electrodes', 'Gel', 'Clippers'],
    setup: 'Electrodes placed appropriately for pain distribution. Parameters for pain type.',
    steps: [
      'Clip and clean electrode sites',
      'Apply electrodes near pain area',
      'Select parameters (conventional vs acupuncture-like)',
      'Adjust intensity to comfortable tingling',
      'Treatment: 20-60 minutes',
      'May be used during other activities',
      'Frequency: Multiple times daily if needed',
      'Home units available'
    ],
    good_form: [
      'Dog appears comfortable',
      'Appropriate intensity',
      'Proper electrode placement',
      'Good pain relief',
      'Regular use as needed'
    ],
    common_mistakes: [
      'Intensity too high or too low',
      'Wrong parameters for pain type',
      'Poor electrode placement',
      'Duration too short',
      'Inconsistent use'
    ],
    red_flags: [
      'No pain relief',
      'Skin irritation',
      'Increased pain',
      'Dog distressed',
      'Adverse reactions'
    ],
    progression: 'Adjust parameters for best relief. May use PRN for pain. Home protocols available. Combine with other pain management',
    contraindications: 'Pacemakers, seizures, pregnancy, skin conditions, over carotid arteries',
    difficulty_level: 'Easy'
  },

  {
    code: 'ACUPUNCTURE',
    name: 'Veterinary Acupuncture Session',
    category: 'Complementary Therapy',
    description: 'Traditional Chinese veterinary acupuncture for pain management and functional improvement.',
    equipment: ['Sterile acupuncture needles', 'Alcohol swabs', 'Calm environment'],
    setup: 'Must be performed by certified veterinary acupuncturist. Quiet setting. Dog comfortable.',
    steps: [
      'Complete examination and point selection',
      'Clean points with alcohol',
      'Insert needles at selected points',
      'Leave in place 15-30 minutes',
      'May stimulate needles as appropriate',
      'Dog remains quiet during session',
      'Remove needles and monitor',
      'Typical frequency: Weekly initially'
    ],
    good_form: [
      'Dog relaxed during treatment',
      'Appropriate point selection',
      'Proper needle technique',
      'Clinical improvement noted',
      'Good tolerance'
    ],
    common_mistakes: [
      'Inappropriate point selection',
      'Poor technique',
      'Insufficient treatment course',
      'Not monitoring response',
      'Unrealistic expectations'
    ],
    red_flags: [
      'Extreme agitation',
      'Adverse reactions',
      'No improvement after 4-6 treatments',
      'Worsening condition',
      'Needle site reactions'
    ],
    progression: 'Decrease frequency as improvement seen. May progress to maintenance schedule. Often combined with other therapies',
    contraindications: 'Coagulopathies, extreme aggression, certain point contraindications per practitioner',
    difficulty_level: 'Easy'
  },

  {
    code: 'CHIROPRACTIC',
    name: 'Veterinary Chiropractic Adjustment',
    category: 'Complementary Therapy',
    description: 'Veterinary chiropractic manipulation for spinal and joint dysfunction.',
    equipment: ['Examination table', 'Trained practitioner'],
    setup: 'Performed by certified animal chiropractor. Thorough examination first.',
    steps: [
      'Complete assessment of spine and extremities',
      'Identify areas of dysfunction',
      'Perform appropriate adjustments',
      'Use high-velocity, low-amplitude thrusts',
      'Reassess after adjustments',
      'Provide aftercare instructions',
      'Typical frequency: Every 2-4 weeks',
      'May be more frequent initially'
    ],
    good_form: [
      'Dog accepts treatment',
      'Appropriate technique',
      'Improvement in function',
      'No adverse reactions',
      'Good tolerance'
    ],
    common_mistakes: [
      'Inappropriate force',
      'Treating without proper training',
      'Missing contraindications',
      'Not doing follow-up care',
      'Unrealistic expectations'
    ],
    red_flags: [
      'Increased pain after treatment',
      'Neurological changes',
      'Extreme distress',
      'No improvement over time',
      'Injuries from treatment'
    ],
    progression: 'Frequency decreases as condition improves. Maintenance adjustments ongoing. Combined with rehabilitation',
    contraindications: 'Instability, fractures, severe osteoporosis, infections, neoplasia, extreme pain',
    difficulty_level: 'Easy'
  },

  {
    code: 'MYOFASCIAL',
    name: 'Myofascial Release Therapy',
    category: 'Complementary Therapy',
    description: 'Hands-on fascial manipulation to release restrictions and improve mobility.',
    equipment: ['Treatment surface', 'Trained therapist hands'],
    setup: 'Dog in comfortable position. Quiet environment. Skilled practitioner.',
    steps: [
      'Palpate to identify fascial restrictions',
      'Apply sustained gentle pressure',
      'Wait for tissue release (1-5 minutes)',
      'Progress to adjacent areas',
      'Include whole body approach',
      'Session duration: 30-45 minutes',
      'Frequency: Weekly to biweekly',
      'Home care instruction'
    ],
    good_form: [
      'Gentle sustained pressure',
      'Dog relaxed throughout',
      'Tissue releases palpable',
      'Improved mobility observed',
      'Good treatment response'
    ],
    common_mistakes: [
      'Too aggressive pressure',
      'Not holding long enough for release',
      'Treating only symptomatic area',
      'Rushing through session',
      'Insufficient training'
    ],
    red_flags: [
      'Increased pain or inflammation',
      'Dog becoming distressed',
      'Tissue damage',
      'No improvement',
      'Adverse reactions'
    ],
    progression: 'Decrease frequency as restrictions resolve. Home care program. Maintain with stretching. Combined therapies',
    contraindications: 'Acute injuries, infections, open wounds, severe inflammation, certain skin conditions',
    difficulty_level: 'Moderate'
  },

  {
    code: 'KINESIO_TAPE',
    name: 'Kinesiology Taping',
    category: 'Complementary Therapy',
    description: 'Application of elastic therapeutic tape for support, pain relief, and improved function.',
    equipment: ['Kinesiology tape', 'Clippers', 'Alcohol', 'Scissors'],
    setup: 'Area clipped and clean. Appropriate tape tension and pattern selected.',
    steps: [
      'Assess condition and select tape application',
      'Clip hair from application area',
      'Clean skin with alcohol',
      'Cut tape to appropriate size and shape',
      'Apply with correct tension (0-50% typically)',
      'Rub to activate adhesive',
      'Leave in place 3-7 days',
      'Monitor for reactions'
    ],
    good_form: [
      'Appropriate tape pattern',
      'Correct tension for goal',
      'Good adhesion',
      'Improved function noted',
      'No skin reactions'
    ],
    common_mistakes: [
      'Wrong tape application pattern',
      'Incorrect tension',
      'Inadequate skin prep',
      'Leaving on too long',
      'Not monitoring skin'
    ],
    red_flags: [
      'Skin irritation or breakdown',
      'Increased pain or swelling',
      'Dog trying to remove',
      'No functional benefit',
      'Allergic reactions'
    ],
    progression: 'Reapply as needed. May adjust pattern based on response. Combine with exercises. Maintenance use',
    contraindications: 'Open wounds, skin infections, allergies to adhesive, certain skin conditions',
    difficulty_level: 'Moderate'
  },

  {
    code: 'PULSED_EMF',
    name: 'Pulsed Electromagnetic Field Therapy (PEMF)',
    category: 'Complementary Therapy',
    description: 'PEMF therapy for pain relief, improved circulation, and enhanced healing.',
    equipment: ['PEMF device', 'Appropriate applicators', 'Treatment area'],
    setup: 'Device positioned appropriately. Parameters set. Dog comfortable.',
    steps: [
      'Position PEMF applicator on or near target',
      'Select appropriate program/intensity',
      'Treatment duration: 15-30 minutes',
      'Dog may rest or sleep during session',
      'Frequency: Daily to 3x weekly',
      'Course length variable by condition',
      'May use at home',
      'Monitor response'
    ],
    good_form: [
      'Dog comfortable during treatment',
      'Appropriate parameters',
      'Consistent treatment schedule',
      'Clinical improvement noted',
      'Good compliance'
    ],
    common_mistakes: [
      'Intensity too high',
      'Inconsistent use',
      'Duration too short',
      'Wrong program for condition',
      'Poor positioning'
    ],
    red_flags: [
      'Increased pain',
      'Agitation during treatment',
      'No improvement',
      'Adverse reactions',
      'Worsening condition'
    ],
    progression: 'May adjust intensity as tolerated. Frequency may decrease over time. Maintenance protocols. Combine therapies',
    contraindications: 'Pacemakers, pregnancy, neoplasia (some types), acute bleeding',
    difficulty_level: 'Easy'
  },

  {
    code: 'PLATELET_RICH',
    name: 'Platelet-Rich Plasma (PRP) Injection',
    category: 'Complementary Therapy',
    description: 'Regenerative medicine using concentrated platelets for tissue healing.',
    equipment: ['Sterile procedure', 'PRP preparation system', 'Ultrasound guidance'],
    setup: 'Veterinary procedure. Blood draw, processing, injection under guidance.',
    steps: [
      'Veterinarian evaluation and indication',
      'Blood draw from patient',
      'Centrifuge to concentrate platelets',
      'Prepare injection site',
      'Inject PRP into target tissue',
      'Often ultrasound guided',
      'Rest period post-injection',
      'Rehabilitation protocol following'
    ],
    good_form: [
      'Sterile technique',
      'Appropriate concentration',
      'Accurate injection placement',
      'Post-procedure care followed',
      'Clinical improvement over weeks'
    ],
    common_mistakes: [
      'Poor injection technique',
      'Insufficient concentration',
      'Wrong tissue targeted',
      'Inadequate rest period',
      'No rehabilitation plan'
    ],
    red_flags: [
      'Infection',
      'Increased inflammation',
      'No improvement after 8-12 weeks',
      'Worsening condition',
      'Adverse reactions'
    ],
    progression: 'May repeat injection 4-6 weeks. Combine with rehabilitation. Long-term monitoring. Assess response',
    contraindications: 'Infection, neoplasia, coagulopathies, certain medications, septic joints',
    difficulty_level: 'Advanced'
  },

  {
    code: 'STEM_CELL',
    name: 'Stem Cell Therapy',
    category: 'Complementary Therapy',
    description: 'Regenerative medicine using stem cells for tissue repair and pain management.',
    equipment: ['Surgical harvest', 'Processing laboratory', 'Injection supplies'],
    setup: 'Veterinary procedure. Harvest (adipose typically), processing, injection.',
    steps: [
      'Veterinary evaluation and candidacy',
      'Surgical harvest of adipose tissue',
      'Laboratory processing',
      'Stem cell injection into target',
      'May be guided by imaging',
      'Post-procedure rest period',
      'Rehabilitation protocol',
      'Long-term monitoring'
    ],
    good_form: [
      'Appropriate candidate selection',
      'Quality cell processing',
      'Accurate delivery',
      'Post-procedure care followed',
      'Clinical improvement over months'
    ],
    common_mistakes: [
      'Poor patient selection',
      'Inadequate cell quality',
      'Wrong injection site',
      'Insufficient rest period',
      'Unrealistic expectations'
    ],
    red_flags: [
      'Surgical complications',
      'No improvement after 3-6 months',
      'Worsening condition',
      'Adverse reactions',
      'Poor response to therapy'
    ],
    progression: 'Effects develop over 3-6 months. May repeat. Combine with rehabilitation. Long-term management. Assess response',
    contraindications: 'Neoplasia, infections, severe systemic disease, poor surgical candidate',
    difficulty_level: 'Advanced'
  },

  {
    code: 'SHOCKWAVE',
    name: 'Extracorporeal Shockwave Therapy (ESWT)',
    category: 'Complementary Therapy',
    description: 'High-energy acoustic waves for chronic pain, non-healing injuries, and tissue regeneration.',
    equipment: ['Shockwave therapy unit', 'Coupling gel', 'Sedation may be needed'],
    setup: 'Professional administration. Area prepared. Sedation for comfort if needed.',
    steps: [
      'Identify treatment area precisely',
      'Apply coupling gel liberally',
      'Position probe perpendicular to tissue',
      'Deliver prescribed number of pulses',
      'Typical: 1000-3000 pulses',
      'Energy level based on condition',
      'Treatment duration: 5-15 minutes',
      'Frequency: Every 2-4 weeks x 3-5 treatments'
    ],
    good_form: [
      'Accurate targeting',
      'Appropriate energy level',
      'Sufficient pulse count',
      'Good coupling maintained',
      'Patient comfortable'
    ],
    common_mistakes: [
      'Energy too high (excessive pain)',
      'Insufficient pulses',
      'Poor tissue contact',
      'Wrong area treated',
      'Inadequate treatment course'
    ],
    red_flags: [
      'Severe pain during treatment',
      'Increased inflammation',
      'No improvement after 3-4 treatments',
      'Bruising or tissue damage',
      'Worsening condition'
    ],
    progression: 'Effects cumulative over treatments. May repeat series. Combine with rehabilitation. Long-term benefit',
    contraindications: 'Infection, neoplasia, pregnancy, coagulopathies, growth plates, over neural tissue',
    difficulty_level: 'Moderate'
  },

  {
    code: 'ASSISI_LOOP',
    name: 'Targeted Pulsed Electromagnetic Field (tPEMF)',
    category: 'Complementary Therapy',
    description: 'Assisi Loop or similar device providing localized PEMF for pain and inflammation.',
    equipment: ['Assisi Loop or tPEMF device', 'Positioning support'],
    setup: 'Home use device. Positioned over treatment area.',
    steps: [
      'Place device over target area',
      'Ensure within 4-6 inches of tissue',
      'Activate 15-minute cycle',
      'Dog may rest during treatment',
      'Use 2-4 times daily initially',
      'Can use through bandages',
      'Decrease frequency as improved',
      'Safe for long-term use'
    ],
    good_form: [
      'Consistent daily use',
      'Proper positioning',
      'Complete treatment cycles',
      'Good compliance',
      'Clinical improvement noted'
    ],
    common_mistakes: [
      'Inconsistent use',
      'Too far from tissue',
      'Insufficient frequency initially',
      'Stopping too soon',
      'Not monitoring response'
    ],
    red_flags: [
      'No improvement after 2-3 weeks',
      'Worsening condition',
      'Adverse reactions (rare)',
      'Device malfunction',
      'Poor tolerance'
    ],
    progression: 'Decrease frequency as improved. Maintain use as needed. Safe long-term. No known side effects. Combine therapies',
    contraindications: 'Pacemakers, pregnancy near device, over active neoplasia',
    difficulty_level: 'Easy'
  },

  {
    code: 'AROMATHERAPY',
    name: 'Therapeutic Aromatherapy',
    category: 'Complementary Therapy',
    description: 'Use of essential oils for stress reduction, pain management, and environmental enrichment.',
    equipment: ['Pet-safe essential oils', 'Diffuser', 'Carrier oils for topical'],
    setup: 'Only dog-safe oils. Proper dilution. Avoid nose/face contact. Well-ventilated area.',
    steps: [
      'Select appropriate pet-safe oil',
      'Diffuse in area (dog can leave)',
      'Use very diluted for topical',
      'Never apply neat to skin',
      'Watch for adverse reactions',
      'Keep oils secured from dog',
      'Limited duration exposure',
      'Always allow escape from scent'
    ],
    good_form: [
      'Only dog-safe oils used',
      'Proper dilution',
      'Dog can leave area',
      'No adverse reactions',
      'Apparent benefit'
    ],
    common_mistakes: [
      'Using toxic oils',
      'Improper dilution',
      'Forcing exposure',
      'Direct application near face',
      'Not monitoring response'
    ],
    red_flags: [
      'Respiratory distress',
      'Vomiting or drooling',
      'Agitation or trying to escape',
      'Skin irritation',
      'Lethargy or weakness'
    ],
    progression: 'Use as beneficial. Part of holistic care. Stress management tool. Environmental enrichment. Safety priority',
    contraindications: 'Respiratory disease, pregnancy, certain medications, known sensitivities, cats in household',
    difficulty_level: 'Easy'
  },

  {
    code: 'MUSIC_THERAPY',
    name: 'Canine Music Therapy',
    category: 'Complementary Therapy',
    description: 'Specially designed music for stress reduction, anxiety management, and relaxation.',
    equipment: ['Music player', 'Dog-specific music recordings', 'Comfortable environment'],
    setup: 'Quiet space. Moderate volume. Calming environment. Dog-specific frequencies.',
    steps: [
      'Select appropriate canine music',
      'Play at moderate volume',
      'Allow dog to settle naturally',
      'Use during stressful situations',
      'May use during treatments',
      'Monitor response',
      'Typical duration: 30-60 minutes',
      'Can use regularly'
    ],
    good_form: [
      'Dog appears relaxed',
      'Reduced stress behaviors',
      'Improved cooperation',
      'Settles faster',
      'Positive associations'
    ],
    common_mistakes: [
      'Volume too loud',
      'Wrong music type',
      'Not monitoring response',
      'Using during exciting activities',
      'Inconsistent use'
    ],
    red_flags: [
      'Increased anxiety',
      'Noise sensitivity',
      'No benefit observed',
      'Negative associations',
      'Adverse reactions'
    ],
    progression: 'Incorporate into routine. Use as needed for stress. Part of multimodal approach. Environmental management',
    contraindications: 'Hearing impairment (may still benefit from vibrations), extreme noise sensitivity',
    difficulty_level: 'Easy'
  }
];

module.exports = EXERCISES_PART8;