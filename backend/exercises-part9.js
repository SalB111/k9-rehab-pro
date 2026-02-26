// ============================================================================
// EXERCISE DATABASE EXPANSION - PART 9 (FINAL)
// K9-REHAB-PRO - 25 SPECIALIZED VET-APPROVED EXERCISES
// Following Dr. Denis Millis & Dr. Darryl Levine Standards
// Certified Canine Rehabilitation Protocols
// COMPLETING THE 200+ EXERCISE LIBRARY
// ============================================================================

const EXERCISES_PART9 = [
  
  // ========================================
  // PEDIATRIC REHABILITATION (10 exercises)
  // ========================================
  {
    code: 'PUPPY_DEV_GYM',
    name: 'Puppy Developmental Gym',
    category: 'Pediatric Rehabilitation',
    description: 'Age-appropriate developmental exercises for puppies recovering from injury or surgery while respecting growth plates.',
    equipment: ['Soft surfaces', 'Low obstacles', 'Age-appropriate toys'],
    setup: 'Safe, supervised environment. Very low-impact activities. Focus on normal development.',
    steps: [
      'Gentle play-based movement',
      'Soft surface walking practice',
      'Very low cavaletti work (2-3 inches)',
      'Gentle socialization with movement',
      'Short duration sessions (5-10 minutes)',
      'Multiple short sessions daily',
      'Monitor for fatigue carefully',
      'Allow rest between activities'
    ],
    good_form: [
      'Puppy enthusiastic and playful',
      'No signs of pain or fatigue',
      'Normal puppy behavior maintained',
      'Appropriate energy level',
      'Good surgical site healing'
    ],
    common_mistakes: [
      'Activities too strenuous',
      'Sessions too long',
      'Not respecting growth plates',
      'Forcing reluctant puppy',
      'Inadequate supervision'
    ],
    red_flags: [
      'Limping or lameness',
      'Surgical site problems',
      'Excessive fatigue',
      'Pain vocalizations',
      'Loss of appetite or energy'
    ],
    progression: 'Very gradual increase in duration and difficulty. Always age-appropriate. Consult with veterinarian regularly. Growth plate monitoring',
    contraindications: 'Unstable fractures, severe pain, systemic illness, veterinary restrictions',
    difficulty_level: 'Easy'
  },

  {
    code: 'ANGULAR_LIMB',
    name: 'Angular Limb Deformity Management',
    category: 'Pediatric Rehabilitation',
    description: 'Therapeutic exercises to support growth and function in puppies with angular limb deformities.',
    equipment: ['Supportive bracing if prescribed', 'Soft surfaces', 'Balance tools'],
    setup: 'Veterinary supervised program. May include bracing, surgery, or conservative management.',
    steps: [
      'Weight-bearing exercises on soft surfaces',
      'Gentle ROM exercises',
      'Balance activities to promote symmetry',
      'Swimming if approved (non-weight bearing)',
      'Brace compliance if applicable',
      'Monitor limb alignment',
      'Short frequent sessions',
      'Regular veterinary reassessment'
    ],
    good_form: [
      'Improved weight bearing',
      'Better balance and symmetry',
      'Good brace tolerance if used',
      'Normal puppy behavior',
      'Progressive improvement'
    ],
    common_mistakes: [
      'High-impact activities',
      'Not following brace protocols',
      'Excessive exercise',
      'Missing veterinary follow-ups',
      'Unrealistic expectations'
    ],
    red_flags: [
      'Worsening deformity',
      'Increasing lameness',
      'Pain or swelling',
      'Brace complications',
      'Poor growth progression'
    ],
    progression: 'Adjust based on growth and veterinary exams. May progress after surgical correction. Long-term monitoring essential',
    contraindications: 'Determined by veterinarian based on severity and treatment plan',
    difficulty_level: 'Moderate'
  },

  {
    code: 'NEONATAL_CARE',
    name: 'Neonatal Puppy Therapeutic Handling',
    category: 'Pediatric Rehabilitation',
    description: 'Gentle therapeutic handling and movement for very young puppies with congenital issues or injuries.',
    equipment: ['Warm environment', 'Soft bedding', 'Gentle handling'],
    setup: 'Very young puppies (0-4 weeks). Veterinary supervised. Intensive care setting.',
    steps: [
      'Gentle passive range of motion',
      'Assisted position changes every 2-4 hours',
      'Support for nursing if needed',
      'Gentle sensory stimulation',
      'Maintain body temperature',
      'Monitor weight gain',
      'Very brief handling sessions',
      'Coordinate with dam if possible'
    ],
    good_form: [
      'Puppy remains warm and comfortable',
      'Good weight gain',
      'Normal nursing behavior',
      'Appropriate development',
      'No distress'
    ],
    common_mistakes: [
      'Excessive handling causing hypothermia',
      'Separating from dam too long',
      'Not maintaining temperature',
      'Missing feeding times',
      'Over-stimulation'
    ],
    red_flags: [
      'Failure to gain weight',
      'Hypothermia',
      'Fading puppy syndrome',
      'Inability to nurse',
      'Declining condition'
    ],
    progression: 'Progress as puppy grows and condition allows. Transition to normal puppy activities. Close veterinary supervision',
    contraindications: 'Critical illness, certain congenital defects, veterinary restrictions',
    difficulty_level: 'Advanced'
  },

  {
    code: 'SWIMMER_PUPPY',
    name: 'Swimmer Puppy Syndrome Therapy',
    category: 'Pediatric Rehabilitation',
    description: 'Intensive rehabilitation protocol for puppies with swimmer puppy syndrome (flat puppy syndrome).',
    equipment: ['Hobbles/tape', 'Textured surfaces', 'Support tools', 'Therapeutic positioning aids'],
    setup: 'Early intervention critical. Multiple daily sessions. Hobbles to maintain limb position.',
    steps: [
      'Apply hobbles to maintain proper limb position',
      'Place on textured/grippy surfaces only',
      'Assisted standing practice every 2-3 hours',
      'Passive ROM exercises',
      'Encourage crawling movements',
      'Chest support to promote upright position',
      'Minimize time on slippery surfaces',
      'Progress to standing and walking'
    ],
    good_form: [
      'Improved limb positioning',
      'Beginning to bear weight',
      'Attempting normal movement',
      'Good hobble tolerance',
      'Progressive development'
    ],
    common_mistakes: [
      'Starting intervention too late',
      'Allowing time on slippery surfaces',
      'Hobbles too loose or tight',
      'Not practicing standing enough',
      'Giving up too soon'
    ],
    red_flags: [
      'No improvement after 1-2 weeks',
      'Skin breakdown from hobbles',
      'Failure to thrive',
      'Concurrent health issues',
      'Severe structural abnormalities'
    ],
    progression: 'Intensive therapy for 1-4 weeks. Most respond well with early intervention. Progress to normal puppy activities. Remove hobbles gradually',
    contraindications: 'Severe neurological deficits, other major health issues, structural impossibility',
    difficulty_level: 'Moderate'
  },

  {
    code: 'CONGENITAL_HD',
    name: 'Congenital Hip Dysplasia Management (Juvenile)',
    category: 'Pediatric Rehabilitation',
    description: 'Conservative management exercises for young dogs with diagnosed hip dysplasia.',
    equipment: ['Soft surfaces', 'Swimming access', 'Balance tools'],
    setup: 'Veterinary supervised program. May be pre-surgical conditioning or conservative management.',
    steps: [
      'Low-impact controlled leash walking',
      'Swimming for strength without impact',
      'Gentle sit-to-stand exercises',
      'Balance work on soft surfaces',
      'Avoid high-impact activities',
      'Maintain lean body condition',
      'Hip ROM exercises',
      'Core strengthening appropriate for age'
    ],
    good_form: [
      'Improved hip stability',
      'Better muscle development',
      'Reduced lameness',
      'Good activity tolerance',
      'Maintained quality of life'
    ],
    common_mistakes: [
      'Allowing high-impact activities',
      'Excess weight gain',
      'Not building muscle support',
      'Inconsistent exercise program',
      'Missing veterinary monitoring'
    ],
    red_flags: [
      'Increasing lameness',
      'Pain or discomfort',
      'Muscle atrophy',
      'Declining function',
      'Need for surgical intervention'
    ],
    progression: 'May progress to surgical candidate. Maintain conservative program if managing medically. Lifelong hip health focus',
    contraindications: 'Determined by veterinary assessment and surgical planning',
    difficulty_level: 'Moderate'
  },

  {
    code: 'LUXATING_PATELLA_JUV',
    name: 'Juvenile Patellar Luxation Management',
    category: 'Pediatric Rehabilitation',
    description: 'Conservative management or post-surgical rehabilitation for young dogs with luxating patellas.',
    equipment: ['Controlled environment', 'Low obstacles', 'Soft surfaces'],
    setup: 'Grade-dependent approach. May be conservative or post-surgical. Veterinary supervised.',
    steps: [
      'Controlled leash walking on flat surfaces',
      'No jumping or stairs',
      'Gentle quadriceps strengthening',
      'Straight-line walking exercises',
      'Swimming for non-impact strengthening',
      'Avoid twisting movements',
      'Maintain appropriate body weight',
      'Monitor for luxation events'
    ],
    good_form: [
      'Improved stifle stability',
      'Stronger quadriceps',
      'Reduced luxation frequency',
      'Better gait quality',
      'Good limb use'
    ],
    common_mistakes: [
      'Allowing jumping and rough play',
      'Not controlling environment',
      'Inadequate muscle building',
      'Excess body weight',
      'High-impact activities'
    ],
    red_flags: [
      'Frequent luxation events',
      'Increasing lameness',
      'Cartilage damage developing',
      'Pain or swelling',
      'Failed conservative management'
    ],
    progression: 'May progress to surgical correction. Post-op protocol if surgery performed. Lifelong stifle health management',
    contraindications: 'Determined by grade of luxation and veterinary assessment',
    difficulty_level: 'Moderate'
  },

  {
    code: 'OCD_JUVENILE',
    name: 'Osteochondritis Dissecans (OCD) Rehab',
    category: 'Pediatric Rehabilitation',
    description: 'Post-surgical or conservative management for juvenile dogs with OCD lesions.',
    equipment: ['Controlled surfaces', 'Swimming access', 'Low-impact tools'],
    setup: 'Site-specific (shoulder, elbow, stifle, hock). Veterinary protocol. Conservative or post-surgical.',
    steps: [
      'Strict rest period initially (2-4 weeks)',
      'Controlled leash walks gradually',
      'Swimming for non-impact exercise',
      'Joint-specific ROM exercises',
      'Avoid high-impact activities',
      'Progressive weight-bearing',
      'Monitor for pain or swelling',
      'Long-term joint health focus'
    ],
    good_form: [
      'Improving lameness',
      'Better joint function',
      'Good weight bearing',
      'No pain or swelling',
      'Successful healing'
    ],
    common_mistakes: [
      'Returning to activity too soon',
      'Allowing high-impact activities',
      'Not following rest protocols',
      'Inadequate post-op care',
      'Poor long-term management'
    ],
    red_flags: [
      'Persistent or worsening lameness',
      'Joint effusion',
      'Pain on manipulation',
      'Failed conservative treatment',
      'Complications'
    ],
    progression: 'Very gradual return to activity over 3-6 months. May require arthroscopy. Lifelong joint health and osteoarthritis prevention',
    contraindications: 'Determined by veterinary assessment and surgical indications',
    difficulty_level: 'Moderate'
  },

  {
    code: 'PREMATURE_CLOSURE',
    name: 'Premature Growth Plate Closure Management',
    category: 'Pediatric Rehabilitation',
    description: 'Rehabilitation for limb length discrepancies and deformities from growth plate injuries.',
    equipment: ['Supportive devices if needed', 'Balance tools', 'Soft surfaces'],
    setup: 'Post-traumatic or iatrogenic. May involve surgical correction. Compensation training.',
    steps: [
      'Exercises to promote symmetrical weight bearing',
      'Balance training for compensation',
      'Strength work on affected limb',
      'Swimming for symmetrical strengthening',
      'May use lifts or support if indicated',
      'Monitor limb length discrepancy',
      'Core stability work',
      'Adapt to permanent changes if present'
    ],
    good_form: [
      'Improved weight bearing',
      'Better balance and compensation',
      'Functional gait',
      'Good muscle development',
      'Adapted to changes'
    ],
    common_mistakes: [
      'Not addressing compensation',
      'Inadequate strengthening',
      'Poor long-term planning',
      'Missing surgical intervention timing',
      'Unrealistic expectations'
    ],
    red_flags: [
      'Progressive deformity',
      'Increasing lameness',
      'Pain or arthritis developing',
      'Poor adaptation',
      'Complications'
    ],
    progression: 'Adapt program as dog grows. May involve surgical lengthening or corrective procedures. Lifelong management of secondary changes',
    contraindications: 'Determined by severity and surgical planning',
    difficulty_level: 'Advanced'
  },

  {
    code: 'JUVENILE_WOBBLER',
    name: 'Juvenile Wobbler Syndrome Management',
    category: 'Pediatric Rehabilitation',
    description: 'Conservative or post-surgical rehabilitation for young large breed dogs with cervical spondylomyelopathy.',
    equipment: ['Supportive harness', 'Non-slip surfaces', 'Balance tools'],
    setup: 'Neurological condition. Veterinary supervised. Conservative or post-surgical protocol.',
    steps: [
      'Controlled leash walking with harness support',
      'Avoid neck stress and jumping',
      'Gentle proprioceptive exercises',
      'Balance work on stable surfaces',
      'Swimming with neck support',
      'Core strengthening',
      'Monitor neurological status',
      'Adapt to progression or improvement'
    ],
    good_form: [
      'Improved proprioception',
      'Better balance',
      'Reduced ataxia',
      'Stable neurological status',
      'Safe mobility'
    ],
    common_mistakes: [
      'Using neck collars',
      'Allowing jumping or rough play',
      'Not supporting during activities',
      'Inadequate environment modification',
      'Poor neurological monitoring'
    ],
    red_flags: [
      'Neurological deterioration',
      'Increasing ataxia',
      'Tetraparesis developing',
      'Pain',
      'Failed conservative management'
    ],
    progression: 'May progress to surgical decompression. Adapt to condition. Lifelong careful management. Quality of life assessments',
    contraindications: 'Severe neurological deficits may limit exercise. Determined by veterinary assessment',
    difficulty_level: 'Advanced'
  },

  {
    code: 'HYPERTROPHIC_OSTEODYSTROPHY',
    name: 'Hypertrophic Osteodystrophy (HOD) Recovery',
    category: 'Pediatric Rehabilitation',
    description: 'Supportive rehabilitation during and after HOD episodes in large breed puppies.',
    equipment: ['Soft bedding', 'Supportive surfaces', 'Gentle handling'],
    setup: 'Acute disease management. Pain control priority. Very gentle, supportive care.',
    steps: [
      'Aggressive pain management (veterinary)',
      'Gentle passive ROM during acute phase',
      'Supportive bedding and positioning',
      'Gradual return to activity as pain resolves',
      'Short gentle walks when able',
      'Monitor for recurrence',
      'Nutritional management',
      'Long-term monitoring'
    ],
    good_form: [
      'Resolution of acute signs',
      'Return to normal mobility',
      'No pain',
      'Good limb use',
      'Normal growth progression'
    ],
    common_mistakes: [
      'Forcing activity during acute phase',
      'Inadequate pain management',
      'Missing diagnosis initially',
      'Not monitoring for recurrence',
      'Inappropriate nutrition'
    ],
    red_flags: [
      'Severe persistent pain',
      'Multiple recurrences',
      'Permanent deformities',
      'Failure to recover',
      'Systemic illness'
    ],
    progression: 'Recovery usually complete if managed well. Monitor for long-term effects. Prevention of recurrence. Normal activity when resolved',
    contraindications: 'Activities limited during acute phase per veterinary guidance',
    difficulty_level: 'Moderate'
  },

  // ========================================
  // PALLIATIVE & END-OF-LIFE CARE (8 exercises)
  // ========================================
  
  {
    code: 'HOSPICE_MOBILITY',
    name: 'Hospice Mobility Support',
    category: 'Palliative Care',
    description: 'Gentle mobility assistance and comfort measures for end-of-life care.',
    equipment: ['Soft bedding', 'Support harnesses', 'Non-slip surfaces', 'Mobility aids'],
    setup: 'Focus on comfort and quality of life. Minimal demands. Dignified support.',
    steps: [
      'Assist with position changes every 2-4 hours',
      'Support for elimination if needed',
      'Very gentle short walks if desired',
      'Passive ROM for comfort',
      'Pressure relief and bedding care',
      'Allow rest as primary activity',
      'Follow dog\'s lead on movement',
      'Maintain dignity and comfort'
    ],
    good_form: [
      'Dog comfortable',
      'No pressure sores developing',
      'Maintained dignity',
      'Quality of life preserved',
      'Family supported'
    ],
    common_mistakes: [
      'Pushing for too much activity',
      'Not managing pain adequately',
      'Poor pressure sore prevention',
      'Not following dog\'s cues',
      'Focusing on rehabilitation vs comfort'
    ],
    red_flags: [
      'Uncontrolled pain',
      'Severe distress',
      'Declining quality of life',
      'Pressure sores',
      'Inability to meet basic needs'
    ],
    progression: 'Decrease demands as appropriate. Focus entirely on comfort. Support family decisions. Quality of life assessments',
    contraindications: 'Activities that cause distress or pain',
    difficulty_level: 'Easy'
  },

  {
    code: 'PALLIATIVE_OSTEOARTHRITIS',
    name: 'Palliative Osteoarthritis Management',
    category: 'Palliative Care',
    description: 'End-stage arthritis management focusing on pain relief and maintaining basic function.',
    equipment: ['Soft bedding', 'Ramps', 'Support slings', 'Heat therapy'],
    setup: 'Multimodal pain management. Environmental modifications. Comfort priority.',
    steps: [
      'Aggressive pain management (veterinary)',
      'Very short gentle walks if tolerated',
      'Heat therapy for comfort',
      'Gentle massage',
      'Assist with standing and mobility',
      'Minimize stair use',
      'Soft supportive bedding',
      'Quality of life monitoring'
    ],
    good_form: [
      'Adequate pain control',
      'Some preserved mobility',
      'Comfortable at rest',
      'Able to meet basic needs',
      'Quality of life maintained'
    ],
    common_mistakes: [
      'Inadequate pain management',
      'Trying to maintain previous activity levels',
      'Not using mobility aids',
      'Poor environment adaptation',
      'Not recognizing declining quality of life'
    ],
    red_flags: [
      'Pain not controlled with medications',
      'Unable to rise',
      'Unwilling to move',
      'Declining quality of life',
      'Loss of dignity'
    ],
    progression: 'Adjust to declining function. Increase support. Quality of life primary consideration. End-of-life discussions',
    contraindications: 'Activities causing pain or distress',
    difficulty_level: 'Easy'
  },

  {
    code: 'NEOPLASIA_COMFORT',
    name: 'Cancer Patient Mobility Support',
    category: 'Palliative Care',
    description: 'Gentle movement and comfort measures for dogs with advanced cancer.',
    equipment: ['Soft bedding', 'Support aids', 'Comfortable environment'],
    setup: 'Comfort-focused. Energy conservation. Quality of life priority.',
    steps: [
      'Very gentle short walks if desired',
      'Assist with position changes',
      'Gentle passive ROM',
      'Pain and nausea management',
      'Support for basic activities',
      'Monitor for complications',
      'Environmental comfort',
      'Follow dog\'s energy levels'
    ],
    good_form: [
      'Dog comfortable',
      'Basic needs met',
      'Some mobility preserved',
      'Pain controlled',
      'Quality time with family'
    ],
    common_mistakes: [
      'Expectations too high',
      'Not managing symptoms',
      'Forcing activity',
      'Missing complications',
      'Not communicating with oncologist'
    ],
    red_flags: [
      'Uncontrolled pain',
      'Severe weakness',
      'Respiratory distress',
      'Declining quality of life',
      'Metastatic complications'
    ],
    progression: 'Adapt to disease progression. Decrease demands. Comfort measures primary. End-of-life planning',
    contraindications: 'Activities causing pain, distress, or rapid fatigue',
    difficulty_level: 'Easy'
  },

  {
    code: 'ADVANCED_HEART_DISEASE',
    name: 'Advanced Heart Disease Management',
    category: 'Palliative Care',
    description: 'Very limited activity program for end-stage cardiac disease.',
    equipment: ['Soft bedding', 'Cool environment', 'Oxygen if needed'],
    setup: 'Severe activity restriction. Medical management priority. Comfort focus.',
    steps: [
      'Very short gentle walks only (50-100 feet)',
      'Assist with position changes',
      'Maintain cool comfortable environment',
      'Monitor respiratory effort',
      'No stairs or exertion',
      'Eliminate stress',
      'Support for basic needs',
      'Quality of life priority'
    ],
    good_form: [
      'Respiratory comfort maintained',
      'No exercise intolerance',
      'Stable clinical signs',
      'Basic needs met',
      'Quality of life preserved'
    ],
    common_mistakes: [
      'Allowing too much activity',
      'Not monitoring breathing',
      'Environmental stress',
      'Poor medication compliance',
      'Missing decompensation signs'
    ],
    red_flags: [
      'Increasing respiratory effort',
      'Syncope',
      'Severe exercise intolerance',
      'Declining quality of life',
      'Heart failure decompensation'
    ],
    progression: 'Decrease activity as disease progresses. Medical management primary. Quality of life assessments. End-of-life planning',
    contraindications: 'Any significant exertion, stairs, excitement, stress',
    difficulty_level: 'Easy'
  },

  {
    code: 'CHRONIC_KIDNEY',
    name: 'Chronic Kidney Disease Mobility Support',
    category: 'Palliative Care',
    description: 'Gentle activity program for dogs with advanced renal disease.',
    equipment: ['Soft surfaces', 'Easy outdoor access', 'Supportive care'],
    setup: 'Limited activity. Focus on quality of life. Medical management primary.',
    steps: [
      'Very short gentle walks for elimination',
      'Easy access to outdoor areas',
      'Monitor for weakness',
      'Gentle passive ROM',
      'Support for basic activities',
      'Avoid overexertion',
      'Temperature regulation',
      'Quality of life monitoring'
    ],
    good_form: [
      'Basic mobility maintained',
      'Able to eliminate independently',
      'No excessive fatigue',
      'Adequate hydration',
      'Quality of life preserved'
    ],
    common_mistakes: [
      'Activity beyond tolerance',
      'Not monitoring hydration',
      'Poor medication compliance',
      'Missing uremic signs',
      'Not assessing quality of life'
    ],
    red_flags: [
      'Severe weakness',
      'Uremic crisis',
      'Declining mobility',
      'Poor quality of life',
      'Medical crisis'
    ],
    progression: 'Adapt to disease progression. Support basic needs. Quality of life primary. End-of-life considerations',
    contraindications: 'Activities beyond tolerance or causing distress',
    difficulty_level: 'Easy'
  },

  {
    code: 'COGNITIVE_DYSFUNCTION',
    name: 'Canine Cognitive Dysfunction Support',
    category: 'Palliative Care',
    description: 'Mobility and environmental support for dogs with advanced cognitive decline.',
    equipment: ['Night lights', 'Non-slip surfaces', 'Safe enclosed areas', 'Familiar items'],
    setup: 'Safety priority. Routine maintenance. Environmental management.',
    steps: [
      'Maintain consistent routines',
      'Short frequent walks in familiar areas',
      'Environmental enrichment appropriate for cognitive level',
      'Night lights and safety measures',
      'Prevent disorientation and anxiety',
      'Support for basic needs',
      'Gentle guidance when confused',
      'Quality of life monitoring'
    ],
    good_form: [
      'Dog calm and oriented',
      'Basic routines maintained',
      'Safe environment',
      'Anxiety minimized',
      'Quality of life preserved'
    ],
    common_mistakes: [
      'Expecting normal cognitive function',
      'Not maintaining routines',
      'Poor environmental safety',
      'Not managing anxiety',
      'Missing quality of life decline'
    ],
    red_flags: [
      'Severe disorientation',
      'High anxiety',
      'Loss of housetraining',
      'Dangerous behaviors',
      'Declining quality of life'
    ],
    progression: 'Adapt to cognitive decline. Increase support and structure. Safety priority. Quality of life assessments',
    contraindications: 'Novel or stressful environments and activities',
    difficulty_level: 'Easy'
  },

  {
    code: 'MEGAESOPHAGUS_PALLIATE',
    name: 'Megaesophagus Mobility Support',
    category: 'Palliative Care',
    description: 'Positioning and support for dogs with advanced megaesophagus.',
    equipment: ['Bailey chair or elevated feeding', 'Supportive positioning', 'Aspiration monitoring'],
    setup: 'Feeding management primary. Positioning critical. Aspiration prevention.',
    steps: [
      'Elevated feeding position maintenance',
      'Upright time after feeding (10-15 min)',
      'Gentle walks to promote motility',
      'Monitor for aspiration pneumonia',
      'Position support as needed',
      'Avoid stress and overexertion',
      'Respiratory monitoring',
      'Quality of life assessment'
    ],
    good_form: [
      'Successful feeding',
      'No aspiration signs',
      'Maintained body condition',
      'Respiratory health',
      'Quality of life preserved'
    ],
    common_mistakes: [
      'Poor feeding position',
      'Not maintaining upright time',
      'Missing aspiration signs',
      'Inadequate monitoring',
      'Poor quality of life assessment'
    ],
    red_flags: [
      'Aspiration pneumonia',
      'Severe regurgitation',
      'Weight loss',
      'Respiratory distress',
      'Declining quality of life'
    ],
    progression: 'Maintain management protocols. Monitor for complications. Quality of life priority. Realistic expectations',
    contraindications: 'Activities increasing aspiration risk',
    difficulty_level: 'Moderate'
  },

  {
    code: 'VESTIBULAR_GERIATRIC',
    name: 'Geriatric Vestibular Disease Recovery Support',
    category: 'Palliative Care',
    description: 'Support and rehabilitation for senior dogs recovering from vestibular episodes.',
    equipment: ['Support harness', 'Non-slip surfaces', 'Padding', 'Confined area'],
    setup: 'Acute episode support. Safety priority. Gradual recovery support.',
    steps: [
      'Provide constant support initially',
      'Prevent falls and injury',
      'Very short supported walks',
      'Gradual increase in independence',
      'Monitor for improvement or decline',
      'Manage nausea if present',
      'Safe confined environment initially',
      'Adapt to recovery or residual deficits'
    ],
    good_form: [
      'Progressive improvement',
      'Increasing independence',
      'No falls or injuries',
      'Good compensation',
      'Return to function'
    ],
    common_mistakes: [
      'Not providing adequate support',
      'Allowing falls',
      'Assuming permanent when may recover',
      'Poor safety measures',
      'Not distinguishing from central disease'
    ],
    red_flags: [
      'No improvement after 3-5 days',
      'Worsening signs',
      'Central vestibular signs',
      'Recurrent episodes',
      'Falling despite support'
    ],
    progression: 'Most recover well with support. Gradual increase in independence. Some residual head tilt common. Adapt if permanent',
    contraindications: 'Activities causing falls, distress, or overexertion',
    difficulty_level: 'Moderate'
  },

  // ========================================
  // BREED-SPECIFIC PROTOCOLS (7 exercises)
  // ========================================
  
  {
    code: 'DACHSHUND_BACK',
    name: 'Dachshund Back Health Protocol',
    category: 'Breed-Specific',
    description: 'Lifelong back health program for Dachshunds and other chondrodystrophic breeds.',
    equipment: ['Ramps', 'Core strengthening tools', 'Supportive harness'],
    setup: 'Prevention-focused. Core strength priority. Lifelong program.',
    steps: [
      'Core strengthening exercises daily',
      'Ramps for all elevated surfaces',
      'No jumping allowed',
      'Maintain lean body weight',
      'Swimming for fitness',
      'Back flexibility exercises',
      'Proper lifting and handling',
      'Lifelong back protection'
    ],
    good_form: [
      'Strong core muscles',
      'No jumping behaviors',
      'Ideal body weight',
      'Good back flexibility',
      'No IVDD signs'
    ],
    common_mistakes: [
      'Allowing jumping',
      'Not using ramps',
      'Excess weight',
      'Poor core strength',
      'Not educating owners'
    ],
    red_flags: [
      'Back pain developing',
      'Rear limb weakness',
      'IVDD signs',
      'Weight gain',
      'Activity intolerance'
    ],
    progression: 'Maintain throughout life. Prevention primary goal. Early intervention for any signs. Regular veterinary monitoring',
    contraindications: 'High-impact activities, jumping, stairs without management',
    difficulty_level: 'Moderate'
  },

  {
    code: 'BULLDOG_RESPIRATORY',
    name: 'Brachycephalic Exercise Management',
    category: 'Breed-Specific',
    description: 'Safe exercise protocol for brachycephalic breeds with respiratory limitations.',
    equipment: ['Cool environment', 'Water access', 'Monitoring tools'],
    setup: 'Respiratory safety priority. Cool conditions. Close monitoring.',
    steps: [
      'Exercise only in cool temperatures',
      'Very short sessions (5-10 minutes)',
      'Multiple rest breaks',
      'Monitor breathing constantly',
      'Water available always',
      'Avoid excitement and stress',
      'Stop immediately if distress',
      'Indoor exercise preferred in heat'
    ],
    good_form: [
      'Normal respiratory effort',
      'Good recovery between sessions',
      'No cyanosis or distress',
      'Maintaining fitness safely',
      'Owner compliance'
    ],
    common_mistakes: [
      'Exercise in hot weather',
      'Sessions too long',
      'Not monitoring breathing',
      'Allowing overexertion',
      'Ignoring distress signs'
    ],
    red_flags: [
      'Respiratory distress',
      'Cyanosis',
      'Collapse',
      'Heat stroke',
      'Worsening respiratory signs'
    ],
    progression: 'Maintain safe exercise patterns. Consider surgical correction if indicated. Lifelong management. Quality of life focus',
    contraindications: 'Hot weather, strenuous activity, high altitude, stressful situations',
    difficulty_level: 'Moderate'
  },

  {
    code: 'GIANT_BREED',
    name: 'Giant Breed Joint Protection',
    category: 'Breed-Specific',
    description: 'Joint health and appropriate exercise for giant breed dogs.',
    equipment: ['Soft surfaces', 'Swimming access', 'Appropriate nutrition'],
    setup: 'Joint protection priority. Controlled growth. Appropriate exercise.',
    steps: [
      'Controlled exercise to prevent overload',
      'Avoid jumping in young dogs',
      'Swimming for fitness',
      'Maintain lean body condition',
      'Appropriate nutrition for growth',
      'Soft surface activities',
      'Build endurance gradually',
      'Lifelong joint health focus'
    ],
    good_form: [
      'Appropriate growth rate',
      'Healthy joints',
      'Good muscle development',
      'Ideal body condition',
      'No lameness'
    ],
    common_mistakes: [
      'Overfeeding and rapid growth',
      'Too much high-impact activity',
      'Not monitoring joint health',
      'Inadequate muscle support',
      'Poor surface management'
    ],
    red_flags: [
      'Lameness developing',
      'Excessive growth rate',
      'Joint problems',
      'Weight issues',
      'Activity intolerance'
    ],
    progression: 'Adapt to growth stages. Maintain appropriate exercise throughout life. Joint health monitoring. Osteoarthritis prevention',
    contraindications: 'Excessive high-impact activity, especially when young',
    difficulty_level: 'Moderate'
  },

  {
    code: 'HERDING_HIPS',
    name: 'Herding Breed Hip Health',
    category: 'Breed-Specific',
    description: 'Hip health program for breeds prone to dysplasia (German Shepherds, etc.).',
    equipment: ['Swimming access', 'Balance tools', 'Soft surfaces'],
    setup: 'Hip health priority. Muscle support focus. Lifelong program.',
    steps: [
      'Hip muscle strengthening exercises',
      'Swimming for non-impact fitness',
      'Balance and proprioception work',
      'Maintain ideal body weight',
      'Controlled activities',
      'Monitor hip health',
      'Early intervention for problems',
      'Lifelong management'
    ],
    good_form: [
      'Strong hip musculature',
      'Good hip stability',
      'No lameness',
      'Appropriate body weight',
      'Good activity tolerance'
    ],
    common_mistakes: [
      'Inadequate hip muscle development',
      'Excess weight',
      'High-impact activities if dysplastic',
      'Not screening for dysplasia',
      'Poor management of diagnosed dysplasia'
    ],
    red_flags: [
      'Hip lameness',
      'Muscle atrophy',
      'Declining activity',
      'Pain signs',
      'Radiographic changes'
    ],
    progression: 'Maintain hip strength throughout life. Adapt if dysplasia diagnosed. Consider surgical options. Osteoarthritis management',
    contraindications: 'Determined by hip status and clinical signs',
    difficulty_level: 'Moderate'
  },

  {
    code: 'SPORTING_SHOULDER',
    name: 'Sporting Breed Shoulder Health',
    category: 'Breed-Specific',
    description: 'Shoulder conditioning for retrievers and sporting breeds prone to shoulder issues.',
    equipment: ['Swimming access', 'Retrieval equipment', 'Strengthening tools'],
    setup: 'Shoulder health focus. Appropriate conditioning. Injury prevention.',
    steps: [
      'Shoulder strengthening exercises',
      'Swimming with proper technique',
      'Controlled retrieval work',
      'Avoid excessive jumping',
      'Warm-up before activities',
      'Monitor for shoulder pain',
      'Appropriate rest between activities',
      'Career longevity focus'
    ],
    good_form: [
      'Strong shoulder musculature',
      'Pain-free movement',
      'Good swimming technique',
      'No lameness',
      'Maintained performance'
    ],
    common_mistakes: [
      'Excessive repetitive retrieving',
      'Not warming up',
      'Ignoring early shoulder pain',
      'Poor swimming technique',
      'Overwork without conditioning'
    ],
    red_flags: [
      'Shoulder lameness',
      'Pain on palpation',
      'Decreased performance',
      'Muscle atrophy',
      'Chronic issues'
    ],
    progression: 'Maintain shoulder health throughout career. Early intervention for problems. Appropriate retirement. Osteoarthritis management',
    contraindications: 'Activities causing shoulder pain or overuse',
    difficulty_level: 'Moderate'
  },

  {
    code: 'TOY_BREED',
    name: 'Toy Breed Musculoskeletal Health',
    category: 'Breed-Specific',
    description: 'Appropriate exercise and care for toy breed orthopedic health.',
    equipment: ['Small scale equipment', 'Safe surfaces', 'Appropriate toys'],
    setup: 'Size-appropriate activities. Injury prevention. Lifelong health.',
    steps: [
      'Controlled activity to prevent injury',
      'Prevent falls from furniture',
      'Appropriate play partners',
      'Maintain healthy weight',
      'Core and limb strengthening',
      'Dental health (affects jaw)',
      'Safe handling practices',
      'Monitor for breed-specific issues'
    ],
    good_form: [
      'Appropriate activity level',
      'No injuries from falls',
      'Good musculoskeletal health',
      'Healthy weight',
      'Active and comfortable'
    ],
    common_mistakes: [
      'Allowing dangerous jumps',
      'Inappropriate play partners',
      'Not managing patella luxation risk',
      'Excess weight',
      'Poor dental care'
    ],
    red_flags: [
      'Lameness',
      'Fractures from falls',
      'Patella luxation',
      'Dental disease',
      'Weight issues'
    ],
    progression: 'Maintain appropriate activity throughout life. Monitor for common toy breed issues. Early intervention. Quality of life focus',
    contraindications: 'Activities with fall risk, inappropriate play partners, high-impact activities',
    difficulty_level: 'Easy'
  },

  {
    code: 'SIGHTHOUND_SPECIAL',
    name: 'Sighthound-Specific Conditioning',
    category: 'Breed-Specific',
    description: 'Conditioning program addressing unique sighthound characteristics and needs.',
    equipment: ['Large running areas', 'Soft surfaces', 'Appropriate nutrition'],
    setup: 'Breed-specific considerations. Sprint vs endurance. Injury prevention.',
    steps: [
      'Sprint conditioning appropriate for breed',
      'Maintain muscle mass and fitness',
      'Protect delicate skin',
      'Soft surfaces for fast activities',
      'Warm-up essential before sprinting',
      'Monitor for common sighthound issues',
      'Appropriate rest between activities',
      'Career-appropriate conditioning'
    ],
    good_form: [
      'Excellent sprint ability',
      'Appropriate muscle mass',
      'No injuries',
      'Good skin health',
      'Breed-typical fitness'
    ],
    common_mistakes: [
      'Not warming up before sprinting',
      'Hard surfaces for fast running',
      'Inadequate muscle maintenance',
      'Missing breed-specific health issues',
      'Poor nutrition for body type'
    ],
    red_flags: [
      'Muscle injuries',
      'Toe injuries',
      'Tail injuries',
      'Declining sprint performance',
      'Weight or muscle loss'
    ],
    progression: 'Maintain throughout athletic career. Appropriate conditioning for purpose. Careful retirement. Senior management',
    contraindications: 'Determined by individual health status',
    difficulty_level: 'Advanced'
  },

  // ════════════════════════════════════════════════════════════════════════════
  // SOURCE-OF-TRUTH ALIGNMENT EXERCISES
  // canine_rehab_protocols.docx — exercises required by protocol definitions
  // ════════════════════════════════════════════════════════════════════════════

  {
    code: 'STAIR_DESCEND',
    name: 'Stair Descending (Controlled)',
    category: 'Active Therapeutic',
    description: 'Controlled stair descent for eccentric muscle strengthening of the quadriceps and hip extensors. Descending stairs requires coordinated eccentric contraction to control body weight against gravity, building functional strength for daily living activities.',
    equipment: ['Stairs with non-slip surface', 'Leash', 'Harness or sling (if needed)', 'Non-slip stair treads recommended'],
    setup: 'Select stairs with non-slip surface and good footing. Handler positions on the downhill side for safety. For post-surgical patients, use a sling or harness for initial support.',
    steps: [
      'Position dog at top of stairs on leash',
      'Handler descends one step ahead or alongside',
      'Allow dog to step down one step at a time',
      'Ensure controlled, deliberate placement of each foot',
      'Pause between steps if needed for balance',
      'Maintain slow, steady pace throughout descent',
      'Complete 3-5 flights with rest between'
    ],
    good_form: [
      'Controlled, deliberate step-down on each stair',
      'Even weight distribution between limbs',
      'No rushing or jumping multiple stairs',
      'Steady head position, looking forward'
    ],
    common_mistakes: [
      'Allowing dog to rush or bound down stairs',
      'Stairs too steep for current ability level',
      'No handler support when needed',
      'Too many flights without rest breaks'
    ],
    red_flags: [
      'Bunny-hopping down stairs (avoiding limb use)',
      'Visible pain or vocalization during descent',
      'Loss of balance or stumbling',
      'Refusal to descend (may indicate pain or fear)'
    ],
    progression: 'Increase number of flights. Remove sling support. Add slight speed increase. Progress to outdoor/uneven stairs.',
    contraindications: 'Non-weight-bearing status, acute post-surgical (< 6 weeks TPLO), severe ataxia, unstable fractures, severe cardiac/respiratory compromise',
    difficulty_level: 'Moderate'
  },

  {
    code: 'DIAGONAL_WALK',
    name: 'Diagonal Walking',
    category: 'Active Therapeutic',
    description: 'Cross-body coordination exercise where the dog walks in diagonal patterns to engage contralateral limb pairs simultaneously. Promotes core stabilization, spinal health, and neuromotor coordination — especially valuable for IVDD maintenance and spinal rehab.',
    equipment: ['Non-slip surface', 'Leash', 'Cones or markers (optional)', 'Treats for motivation'],
    setup: 'Set up a clear, non-slip walking area. Optional: place cones in a diagonal grid pattern to guide the path. Handler walks alongside to direct diagonal movement.',
    steps: [
      'Begin walking forward in a straight line',
      'Gently guide dog to walk at a 45-degree diagonal angle',
      'Maintain diagonal path for 10-20 steps',
      'Reverse direction to walk the opposite diagonal',
      'Encourage deliberate, slow foot placement',
      'Alternate left and right diagonal patterns',
      'Complete 2 sets of 10-20 steps each direction'
    ],
    good_form: [
      'Smooth, coordinated gait with cross-body engagement',
      'Core visibly engaged (no swaying trunk)',
      'Equal stride length on all four limbs',
      'Controlled, purposeful movement'
    ],
    common_mistakes: [
      'Moving too fast (loses coordination benefit)',
      'Walking straight instead of true diagonal',
      'Handler pulling rather than guiding',
      'Session too long causing fatigue'
    ],
    red_flags: [
      'Worsening ataxia during exercise',
      'Scuffing or knuckling of paws',
      'Pain on spinal palpation after exercise',
      'Reluctance or resistance to directional changes'
    ],
    progression: 'Increase distance. Tighter diagonal angles. Add slight incline. Vary surface texture.',
    contraindications: 'Acute disc herniation, severe ataxia, non-ambulatory status, acute spinal pain',
    difficulty_level: 'Moderate'
  },

  {
    code: 'JOG_LEASH',
    name: 'Jogging (Controlled Leash)',
    category: 'Active Therapeutic',
    description: 'Controlled on-leash jogging at a pace faster than trot but slower than full run. Builds cardiovascular fitness, normalizes gait speed, and prepares for return to unrestricted activity. Used in the final phase of post-surgical rehabilitation.',
    equipment: ['Flat collar or harness', 'Standard 4-6 foot leash', 'Level, non-slip surface', 'Appropriate footwear for handler'],
    setup: 'Select a flat, even surface (grass field, rubberized track, or smooth path). Ensure dog has been warmed up with 5-10 minutes of walking. Handler must be able to jog comfortably alongside.',
    steps: [
      'Begin with 5-minute controlled walk warm-up',
      'Gradually increase pace to a steady jog',
      'Maintain consistent speed (handler sets pace)',
      'Jog for 1-2 minute intervals initially',
      'Intersperse with 2-minute walking recovery',
      'Monitor gait symmetry throughout',
      'Complete 5-8 jog/walk intervals',
      'End with 5-minute cool-down walk'
    ],
    good_form: [
      'Symmetrical gait at jogging speed',
      'Relaxed head and neck carriage',
      'Even stride length all four limbs',
      'No visible favoring of surgical limb'
    ],
    common_mistakes: [
      'Starting jogging before cleared by veterinarian',
      'Pace too fast (should be controlled, not sprinting)',
      'Inadequate warm-up before jogging',
      'Jogging on hard surfaces (asphalt/concrete)'
    ],
    red_flags: [
      'Lameness visible at jog that was absent at walk',
      'Head bob indicating weight-bearing asymmetry',
      'Reluctance to maintain pace',
      'Post-exercise soreness lasting > 24 hours'
    ],
    progression: 'Increase jog interval duration. Reduce walk recovery time. Add gentle inclines. Increase total session time.',
    contraindications: 'Not cleared for Phase 4, visible lameness at walk or trot, less than 12 weeks post-TPLO, incomplete bone healing, pain score > 3/10',
    difficulty_level: 'Advanced'
  },

  {
    code: 'LAND_TREADMILL',
    name: 'Land Treadmill Walking/Trotting',
    category: 'Active Therapeutic',
    description: 'Controlled walking or trotting on a motorized land treadmill for consistent-pace gait training. Allows precise speed control, eliminates terrain variables, enables indoor training, and facilitates gait observation. Different from underwater treadmill — no buoyancy support.',
    equipment: ['Canine or human treadmill (low-speed capable)', 'Side rails or safety leash attachment', 'Non-slip treadmill belt', 'Treats for motivation'],
    setup: 'Introduce treadmill while OFF first. Allow dog to stand on stationary belt. Secure with a short safety leash to overhead point — never tighten around neck. Start at slowest speed setting.',
    steps: [
      'Position dog on stationary treadmill',
      'Start belt at slowest speed setting',
      'Allow dog to find rhythm at walking pace',
      'Gradually increase speed as comfort allows',
      'Maintain controlled walk for 5-10 minutes initially',
      'For trotting: increase speed smoothly after warm-up',
      'Monitor gait quality and limb symmetry throughout',
      'Cool down by gradually reducing speed',
      'Stop belt and allow dog to step off'
    ],
    good_form: [
      'Comfortable, relaxed gait on the belt',
      'Symmetrical stride length and timing',
      'Head forward, not looking down at belt',
      'Consistent pace without surging or lagging'
    ],
    common_mistakes: [
      'Speed too fast for current ability',
      'No warm-up period on treadmill',
      'Leaving dog unattended on treadmill',
      'Belt too narrow for dog size'
    ],
    red_flags: [
      'Panicking or scrambling on the belt',
      'Drifting to one side consistently',
      'Gait asymmetry developing during session',
      'Excessive panting or distress signs'
    ],
    progression: 'Increase duration. Gradually increase speed. Progress from walk to trot intervals. Add incline if treadmill supports it.',
    contraindications: 'Extreme anxiety, non-weight-bearing status, acute post-surgical (< 2 weeks), severe cardiac/respiratory compromise, vestibular disease',
    difficulty_level: 'Moderate'
  },

  {
    code: 'FETCH_CONTROLLED',
    name: 'Retrieve / Fetch (Controlled Distance)',
    category: 'Active Therapeutic',
    description: 'Controlled land-based fetch at short distances to develop sprint acceleration and deceleration control. Used in final rehabilitation phases to restore functional activity patterns. Distance is strictly limited to prevent overexertion on the surgical limb.',
    equipment: ['Tennis ball or soft toy', 'Flat, non-slip surface (grass preferred)', 'Long leash for safety (20-30 ft)', 'Treats for recall'],
    setup: 'Select a flat grass surface free of holes or obstacles. Attach long line for safety. Mark a maximum distance with a cone. Keep throws low and straight — no high tosses.',
    steps: [
      'Warm up with 5-minute controlled walk',
      'Position dog at starting point on long line',
      'Throw toy/ball short distance (5-10 feet initially)',
      'Allow controlled trot to retrieve',
      'Call dog back — should return at controlled pace',
      'Rest 30-60 seconds between throws',
      'Complete 3-5 throws per session',
      'Cool down with 5-minute walk'
    ],
    good_form: [
      'Controlled acceleration to retrieve object',
      'Smooth deceleration on pickup',
      'Even gait during return',
      'No limping or head-bobbing at any speed'
    ],
    common_mistakes: [
      'Throwing too far before cleared',
      'Allowing high-speed sprinting',
      'Playing on hard/slippery surfaces',
      'Too many repetitions causing fatigue'
    ],
    red_flags: [
      'Limping after any retrieve',
      'Refusing to bear weight after running',
      'Head bob visible during acceleration',
      'Post-session lameness lasting > 2 hours'
    ],
    progression: 'Increase distance gradually. Add slight direction changes. Progress to off-leash in enclosed area when cleared.',
    contraindications: 'Not cleared for Phase 4, visible lameness, less than 12 weeks post-surgery, incomplete bone healing, pain score > 3/10',
    difficulty_level: 'Advanced'
  },

  {
    code: 'PROM_STIFLE_SPEC',
    name: 'Passive ROM — Stifle Flexion/Extension (Targeted)',
    category: 'Passive Therapy',
    description: 'Stifle-specific passive range of motion focusing on controlled flexion and extension of the stifle joint. Higher frequency than general PROM due to stifle-specific adhesion risk post-TPLO. Emphasis on maintaining full flexion/extension arc and transitioning to active-assisted movement.',
    equipment: ['Non-slip mat or padded surface', 'Warm pack (optional, for pre-treatment)'],
    setup: 'Position dog in lateral recumbency with affected limb up. Apply gentle warm pack to stifle for 2-3 minutes before starting if indicated. Handler supports proximal and distal to the stifle joint.',
    steps: [
      'Stabilize femur with one hand proximal to stifle',
      'Grasp tibia distal to stifle with the other hand',
      'Slowly flex stifle through comfortable range',
      'Hold at end-range flexion for 5-10 seconds',
      'Slowly extend stifle through comfortable range',
      'Hold at end-range extension for 5-10 seconds',
      'Complete 10-15 full flexion/extension cycles',
      'Monitor for pain response throughout'
    ],
    good_form: [
      'Smooth, controlled movement through full available arc',
      'No crepitus or catching during motion',
      'Dog remains relaxed during the exercise',
      'End-range holds without guarding'
    ],
    common_mistakes: [
      'Forcing ROM past pain threshold',
      'Moving too quickly through the arc',
      'Not stabilizing femur during movement',
      'Skipping warm-up on stiff joints'
    ],
    red_flags: [
      'Acute pain response or vocalization',
      'Crepitus indicating hardware complication',
      'Progressive loss of ROM between sessions',
      'Effusion increase after PROM session'
    ],
    progression: 'Transition to active-assisted ROM. Increase end-range hold time. Add gentle overpressure at end-range.',
    contraindications: 'Acute surgical site inflammation, hardware failure suspected, severe effusion, fracture instability',
    difficulty_level: 'Easy'
  },

  {
    code: 'WEIGHT_SHIFT_CC',
    name: 'Weight-Shift Standing (Cranial/Caudal)',
    category: 'Active Therapeutic',
    description: 'Controlled forward and backward weight shifting to load forelimbs and hindlimbs alternately. Complements lateral weight shifting by challenging the sagittal plane. Promotes hind limb loading awareness and pelvic stabilization, especially important post-TPLO and for OA patients.',
    equipment: ['Non-slip mat', 'Treats or toy for motivation', 'Handler support if needed'],
    setup: 'Position dog in square standing stance on non-slip surface. Handler stands beside the dog with treats positioned to guide forward/backward shifting.',
    steps: [
      'Position dog in square, even stance',
      'Hold treat low and forward to encourage forward weight shift (forelimb loading)',
      'Hold position for 2-3 seconds',
      'Move treat backward past chest to encourage backward weight shift (hindlimb loading)',
      'Hold position for 2-3 seconds',
      'Repeat 5-10 cranial/caudal shifts per set',
      'Complete 2-3 sets with brief rest between'
    ],
    good_form: [
      'Visible weight transfer between forelimbs and hindlimbs',
      'Feet remain planted during the shift',
      'Core engaged, no trunk sway',
      'Equal loading of left and right within the shifted direction'
    ],
    common_mistakes: [
      'Dog stepping forward/backward instead of shifting weight',
      'Treats held too far away (causes walking, not shifting)',
      'Not holding shifted position long enough',
      'Ignoring asymmetric loading patterns'
    ],
    red_flags: [
      'Consistent refusal to load hindlimbs',
      'Trembling or shaking during holds',
      'Shifting weight OFF the affected limb',
      'Pain posturing during backward shifts'
    ],
    progression: 'Uneven surface. Longer holds (5-10 sec). Add gentle perturbation during hold.',
    contraindications: 'Non-weight-bearing status, acute post-surgical (< 2 weeks), severe pain, unstable fracture',
    difficulty_level: 'Easy'
  },

  // ============================================================================
  // SOURCE-OF-TRUTH AUDIT (Feb 2026) — New distinct exercise codes
  // These replace conflated mappings identified during clinical audit
  // ============================================================================

  {
    code: 'STRETCH_ILIO',
    name: 'Stretching - Passive Iliopsoas',
    category: 'Passive Therapy',
    description: 'Passive stretching of the iliopsoas (hip flexor) muscle to improve hip extension range. The handler holds the limb in sustained extension to lengthen the iliopsoas muscle-tendon unit. Distinct from myofascial release — this targets muscle length through prolonged low-load stretch, not fascial adhesion release.',
    equipment: ['Non-slip mat or padded surface', 'Warm pack (optional, pre-treatment)'],
    setup: 'Position dog in lateral recumbency with affected side up. Apply warm pack to hip flexor region for 2-3 minutes if indicated. Handler supports the femur proximal to the stifle.',
    steps: [
      'Apply warm pack to hip flexor region for 2-3 minutes',
      'Stabilize pelvis with one hand',
      'Grasp femur proximal to stifle with other hand',
      'Slowly extend hip joint caudally into extension',
      'Hold at end-range extension for 15-30 seconds',
      'Release slowly and allow limb to return to neutral',
      'Repeat 3-5 times per session',
      'Monitor for pain response — stop if guarding occurs'
    ],
    good_form: [
      'Sustained, gentle stretch at end-range without bouncing',
      'Dog remains relaxed throughout the hold',
      'Measurable improvement in hip extension over sessions',
      'Pelvis remains stabilized during stretch'
    ],
    common_mistakes: [
      'Bouncing or pulsing instead of sustained hold',
      'Not holding stretch long enough (< 15 sec)',
      'Allowing pelvic rotation to compensate',
      'Stretching cold tissue without warm-up'
    ],
    red_flags: [
      'Acute pain response during stretch',
      'Progressive loss of ROM between sessions',
      'Muscle spasm during hold',
      'Post-stretch soreness lasting > 4 hours'
    ],
    progression: 'Increase hold duration to 30 seconds. Increase extension range as tissue accommodates. Progress to active-assisted stretching.',
    contraindications: 'Acute iliopsoas strain, hip luxation risk, unstable pelvic fracture, severe hip dysplasia with subluxation',
    difficulty_level: 'Easy'
  },

  {
    code: 'ROCKER_BOARD',
    name: 'Rocker Board Standing',
    category: 'Balance & Proprioception',
    description: 'Standing on a uni-planar rocker board that tilts in one plane only (side-to-side or front-to-back). Provides a controlled, intermediate balance challenge between flat surface and multi-planar wobble board. Targets lateral or sagittal-plane stabilizers depending on board orientation.',
    equipment: ['Rocker board (uni-planar)', 'Non-slip surface or yoga mat underneath', 'Treats for motivation', 'Handler for support'],
    setup: 'Place rocker board on non-slip surface. Orient the rocker axis based on target plane (perpendicular to dog for lateral challenge, parallel for front-to-back challenge). Position handler at side for support.',
    steps: [
      'Lure dog onto rocker board with all four feet',
      'Allow dog to find equilibrium on the tilting surface',
      'Hold position for 20-30 seconds initially',
      'Observe weight shifting as board rocks',
      'Handler provides minimal support at shoulders/hips if needed',
      'Rest 30 seconds between sets',
      'Complete 3 sets per session'
    ],
    good_form: [
      'Controlled weight shifts to maintain balance',
      'Head and spine aligned during tilting',
      'Four-point contact maintained on board',
      'Smooth recovery when board tips'
    ],
    common_mistakes: [
      'Dog jumping off instead of correcting balance',
      'Handler providing too much support',
      'Board placed on slippery surface',
      'Sessions too long causing fatigue'
    ],
    red_flags: [
      'Consistent falling off board',
      'Trembling or shaking indicating fatigue',
      'Pain response during weight shifting',
      'Inability to maintain standing position'
    ],
    progression: 'Increase hold time. Combine with weight shifts. Add gentle perturbation from handler. Progress to multi-planar wobble board when stable.',
    contraindications: 'Non-weight-bearing status, acute post-surgical (< 6 weeks for balance work), severe vestibular disease, fracture instability',
    difficulty_level: 'Intermediate'
  },

  {
    code: 'TRAMPOLINE_STAND',
    name: 'Trampoline Standing',
    category: 'Balance & Proprioception',
    description: 'Standing on a small rehabilitation mini-trampoline surface for proprioceptive challenge. The compliant, bouncy surface creates a unique unstable environment that challenges postural reflexes and joint stabilizers differently than foam or balance boards. Especially valuable for geriatric patients to improve reactive balance.',
    equipment: ['Rehabilitation mini-trampoline (small, firm)', 'Non-slip surrounds', 'Treats for motivation', 'Handler for safety'],
    setup: 'Place mini-trampoline on non-slip floor. Position handler at side ready to support dog. Have treats ready to maintain dog on the trampoline surface.',
    steps: [
      'Lure dog onto trampoline surface with treats',
      'Allow dog to acclimate to the surface compliance',
      'Hold standing position for 20-45 seconds',
      'Handler may induce gentle bouncing by pressing edge of trampoline',
      'Observe postural corrections and stabilization responses',
      'Rest between sets',
      'Complete 3 sets per session'
    ],
    good_form: [
      'Stable standing with all four feet on trampoline surface',
      'Active postural corrections visible',
      'Dog engages core musculature for stabilization',
      'Relaxed, confident posture (not bracing)'
    ],
    common_mistakes: [
      'Trampoline too bouncy for patient level',
      'Dog allowed to jump off repeatedly',
      'Handler bounce too aggressive',
      'Not supervising closely enough for falls'
    ],
    red_flags: [
      'Panic or anxiety on the surface',
      'Falling off with inability to self-correct',
      'Visible pain during weight bearing',
      'Fatigue-induced trembling or collapse'
    ],
    progression: 'Increase standing duration. Add handler-induced gentle bouncing. Add treat-reaching challenges while on surface.',
    contraindications: 'Non-weight-bearing status, severe vestibular disease, cognitive dysfunction causing anxiety, severe OA (KL Grade 4), fracture instability',
    difficulty_level: 'Intermediate'
  },

  {
    code: 'LADDER_WALK',
    name: 'Ladder Walking',
    category: 'Balance & Proprioception',
    description: 'Walking through a ground ladder (laid flat) to enforce rhythmic, sequential foot placement in defined spacing. Each rung requires conscious limb placement, training proprioceptive awareness and motor planning. Distinct from cavaletti rails (which clear vertical obstacles) — ladder walking targets horizontal foot targeting between rungs.',
    equipment: ['Ground ladder (flat or agility ladder)', 'Non-slip surface', 'Treats for motivation', 'Leash for pacing control'],
    setup: 'Lay ladder flat on non-slip surface. Ensure rungs are evenly spaced. Position handler at head with leash and treats to guide pace.',
    steps: [
      'Position dog at one end of the ladder',
      'Lure dog forward slowly with treats at nose level',
      'Encourage placement of each foot between rungs',
      'Maintain slow, deliberate pace through entire ladder',
      'Reward at the end of each pass',
      'Walk back through or circle around for next pass',
      'Complete 3-5 passes per session'
    ],
    good_form: [
      'Each foot placed deliberately between rungs without touching',
      'Consistent stride rhythm throughout the ladder',
      'Head neutral, not reaching excessively for treats',
      'Even weight distribution on all four limbs'
    ],
    common_mistakes: [
      'Rushing through the ladder',
      'Stepping on rungs instead of between them',
      'Ladder on slippery surface causing movement',
      'Rung spacing too tight for patient size'
    ],
    red_flags: [
      'Repeated tripping on rungs',
      'Inability to coordinate limb placement',
      'Dragging limbs through rungs (neurological sign)',
      'Pain response or lameness during exercise'
    ],
    progression: 'Vary rung spacing. Increase speed slightly. Add curved or angled ladder. Elevate ladder slightly off ground for additional challenge.',
    contraindications: 'Non-weight-bearing status, severe ataxia without handler support, crate rest required, acute neurological deterioration',
    difficulty_level: 'Intermediate'
  },

  {
    code: 'BOSU_FRONT',
    name: 'BOSU Ball Standing (Front Feet Only)',
    category: 'Balance & Proprioception',
    description: 'Front feet placed on a BOSU ball (dome side up) while hind feet remain on stable ground. Specifically targets forelimb proprioception, scapular stabilization, and cranial core activation. The cranial weight-shift position challenges shoulder stabilizers and thoracic spine control. Used in IVDD recovery for neuromotor re-education of the forelimbs.',
    equipment: ['BOSU ball (dome side up)', 'Non-slip surface', 'Treats', 'Handler for support'],
    setup: 'Place BOSU ball dome-up on non-slip surface. Position handler at side for support. Have treats ready at nose height to lure front feet placement.',
    steps: [
      'Lure dog to place front feet on BOSU dome',
      'Hind feet remain on stable ground surface',
      'Allow dog to find balance on the unstable surface',
      'Hold position for 20-45 seconds',
      'Handler supports at shoulders if needed initially',
      'Rest between sets',
      'Complete 3 sets per session'
    ],
    good_form: [
      'Both front feet centered on dome surface',
      'Active scapular stabilization visible',
      'Core engagement with slight thoracic flexion',
      'Hind feet stable and evenly weighted'
    ],
    common_mistakes: [
      'Front feet too far forward on dome edge',
      'Dog sliding off due to incorrect paw placement',
      'Handler providing too much support',
      'Hind feet stepping forward onto BOSU'
    ],
    red_flags: [
      'Forelimb trembling indicating excessive fatigue',
      'Pain response in neck or thoracic region',
      'Inability to maintain front paw contact',
      'Neurological deterioration during exercise'
    ],
    progression: 'Increase hold time. Add perturbation at shoulders. Add treat reaching while balancing. Progress to all four feet on BOSU.',
    contraindications: 'Non-weight-bearing (forelimbs), cervical instability, acute spinal cord compression, severe forelimb weakness',
    difficulty_level: 'Intermediate'
  },

  {
    code: 'BOSU_HIND',
    name: 'BOSU Ball Standing (Hind Feet Only)',
    category: 'Balance & Proprioception',
    description: 'Hind feet placed on a BOSU ball (dome side up) while front feet remain on stable ground. Specifically targets hindlimb proprioception, hip/stifle stabilization, and caudal core activation. The caudal weight-shift position challenges pelvic stabilizers and hip extensors. Critical for post-TPLO recovery to rebuild stifle joint stability.',
    equipment: ['BOSU ball (dome side up)', 'Non-slip surface', 'Treats', 'Handler for support'],
    setup: 'Place BOSU ball dome-up on non-slip surface. Position dog facing away from BOSU. Lure dog to back hind feet onto dome. Handler ready at hips for support.',
    steps: [
      'Position dog in front of BOSU ball',
      'Lure dog backward to place hind feet on BOSU dome',
      'Front feet remain on stable ground surface',
      'Allow dog to find balance with hindlimbs on unstable surface',
      'Hold position for 20-45 seconds',
      'Handler supports at hips if needed initially',
      'Rest between sets',
      'Complete 3 sets per session'
    ],
    good_form: [
      'Both hind feet centered on dome surface',
      'Active pelvic stabilization visible',
      'Core engagement with slight lumbar flexion',
      'Even weight bearing on both hind limbs'
    ],
    common_mistakes: [
      'Hind feet too far back on dome edge',
      'Dog compensating by shifting weight cranially',
      'Handler providing too much hip support',
      'Allowing dog to sit instead of standing'
    ],
    red_flags: [
      'Hindlimb trembling or giving way',
      'Visible stifle valgus under loading',
      'Pain response in surgical limb',
      'Asymmetric weight bearing on BOSU'
    ],
    progression: 'Increase hold time. Add perturbation at hips. Add gentle lateral shifts. Progress to all four feet on BOSU.',
    contraindications: 'Non-weight-bearing (hindlimbs), acute post-TPLO (< 6 weeks), patellar luxation with instability, severe hip dysplasia',
    difficulty_level: 'Intermediate'
  },

  {
    code: 'CAVALETTI_ELEV',
    name: 'Cavaletti - Elevated Height',
    category: 'Cavaletti & Obstacle',
    description: 'Walking over cavaletti rails set at elevated height to increase joint flexion demand during stepping. Higher rail height forces greater stifle, hip, and hock flexion compared to standard-height cavaletti. Targets ROM improvement and strengthening through increased range demand. Distinct from CAVALETTI_RAILS (low height for gait patterning).',
    equipment: ['Cavaletti rail set (adjustable height)', 'Non-slip surface', 'Treats', 'Leash for pacing'],
    setup: 'Set cavaletti rails at elevated height appropriate for dog size (approximately hock height or slightly above). Space rails 1-1.5 body lengths apart. Place on non-slip surface.',
    steps: [
      'Position dog at the start of the cavaletti line',
      'Lead dog slowly over the elevated rails',
      'Encourage deliberate, high-stepping gait',
      'Maintain slow, controlled pace throughout',
      'Reward at the end of each pass',
      'Complete 3-5 passes per set, 2 sets per session'
    ],
    good_form: [
      'Clean clearance of each rail without touching',
      'Exaggerated joint flexion during stepping',
      'Consistent stride length between rails',
      'Head and spine aligned during exercise'
    ],
    common_mistakes: [
      'Rails set too high for current ability',
      'Pace too fast — rushing reduces joint flexion benefit',
      'Spacing too tight causing shortened stride',
      'Not adjusting height for dog size'
    ],
    red_flags: [
      'Consistent rail contact indicating insufficient ROM',
      'Tripping or stumbling',
      'Pain response during high-stepping',
      'Post-exercise lameness or stiffness'
    ],
    progression: 'Increase height incrementally. Vary rail spacing. Add slight incline. Combine with curved path.',
    contraindications: 'Non-weight-bearing status, severe ROM limitation, acute joint inflammation, crate rest required',
    difficulty_level: 'Intermediate'
  },

  {
    code: 'CAVALETTI_WEAVE',
    name: 'Cavaletti - Weave Pattern',
    category: 'Cavaletti & Obstacle',
    description: 'Walking through cavaletti rails arranged in a weave or curved pattern to add lateral weight shifting challenge. Combines the stepping demands of cavaletti with directional changes. Targets multi-directional proprioception, lateral stabilization, and dynamic balance during locomotion. Used as an advanced cavaletti progression.',
    equipment: ['Cavaletti rail set', 'Non-slip surface', 'Treats', 'Leash for pacing'],
    setup: 'Arrange cavaletti rails in a curved or offset pattern creating a weave path. Rail height at standard or slightly elevated. Ensure adequate spacing for the turn radius.',
    steps: [
      'Position dog at the start of the weave pattern',
      'Lead dog through the curved path at slow, controlled pace',
      'Encourage smooth directional changes between rails',
      'Maintain consistent pace throughout the weave',
      'Reward at the end of each complete pass',
      'Complete 3-5 passes per session'
    ],
    good_form: [
      'Smooth directional transitions between rails',
      'Clean rail clearance maintained during turns',
      'Balanced weight distribution through curves',
      'Engaged core throughout the pattern'
    ],
    common_mistakes: [
      'Pattern too tight for dog size',
      'Pace too fast through curves',
      'Cutting corners instead of following the weave',
      'Rails knocked by dragging limbs on turns'
    ],
    red_flags: [
      'Loss of balance during directional changes',
      'Consistent rail contact on turns',
      'Lameness visible during lateral weight shifting',
      'Refusal or anxiety approaching the pattern'
    ],
    progression: 'Tighter weave pattern. Increase speed slightly. Add elevation to rails. Combine with speed variation.',
    contraindications: 'Non-weight-bearing status, severe ataxia, acute vestibular disease, crate rest required',
    difficulty_level: 'Advanced'
  }
];

module.exports = EXERCISES_PART9;