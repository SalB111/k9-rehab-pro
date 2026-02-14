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
  }
];

module.exports = EXERCISES_PART9;