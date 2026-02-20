// ============================================================================
// EXERCISE DATABASE - PART 6 (Exercises 51-75)
// K9-REHAB-PRO - Professional Veterinary Exercise Library
// Dr. Millis & Dr. Levine Evidence-Based Standards
// ============================================================================

const EXERCISES_PART6 = [
  // ========================================
  // ADVANCED BALANCE & PROPRIOCEPTION (10 exercises: 51-60)
  // ========================================
  {
    code: 'BOSU_STAND',
    name: 'BOSU Ball Static Standing',
    category: 'Balance & Proprioception',
    description: 'Advanced balance training using BOSU ball to challenge proprioceptive awareness and core stabilization on unstable surface.',
    equipment: ['BOSU ball (dome side up)', 'Treats', 'Safety harness or spotter'],
    setup: 'Place BOSU ball on non-slip surface. Position dog beside ball. Have high-value treats ready.',
    steps: [
      'Lure dog to place front paws on BOSU dome',
      'Encourage rear paws to follow onto ball',
      'Support dog at chest/rear as needed for balance',
      'Hold standing position for 10-15 seconds initially',
      'Reward calm, balanced stance',
      'Allow dog to step off safely',
      'Rest 30 seconds between repetitions',
      'Repeat 5-8 times per session',
      'Progress hold time by 5 seconds weekly',
      'Watch for compensatory shifting or muscle fatigue'
    ],
    good_form: [
      'All four paws remain on BOSU surface',
      'Weight distributed evenly across limbs',
      'Core engaged with minimal swaying',
      'Dog appears confident and controlled',
      'No excessive head bobbing or body tension'
    ],
    common_mistakes: [
      'Progressing too quickly to longer holds',
      'Insufficient support causing anxiety',
      'Allowing dog to favor one limb',
      'Training when dog is already fatigued',
      'Using ball that is too small for dog size'
    ],
    red_flags: [
      'Dog shows fear or reluctance to mount',
      'Severe wobbling or inability to maintain balance',
      'Visible muscle trembling beyond normal effort',
      'Dog repeatedly steps off or refuses',
      'Increased lameness after session'
    ],
    progression: 'Increase hold time to 60 seconds. Add gentle perturbations (light pushes). Flip BOSU to flat side up for greater challenge. Combine with treat tosses.',
    contraindications: 'Acute injury, severe proprioceptive deficits, vestibular disease, severe arthritis, post-surgical instability',
    difficulty_level: 'Advanced'
  },

  {
    code: 'WOBBLE_BOARD_ADV',
    name: 'Advanced Wobble Board Training',
    category: 'Balance & Proprioception',
    description: 'Multi-directional balance challenge using rocker board to improve dynamic stability and weight shifting.',
    equipment: ['Wobble board or rocker board', 'Non-slip mat', 'Treats', 'Spotter'],
    setup: 'Place wobble board on stable, non-slip surface. Start with minimal tilt angle for safety.',
    steps: [
      'Allow dog to investigate board while stable',
      'Lure dog to step front paws onto board',
      'Encourage rear paws to follow',
      'Support dog as board begins to tilt',
      'Hold balanced position for 15-20 seconds',
      'Encourage small weight shifts side to side',
      'Maintain control throughout movement',
      'Assist dog in stepping off safely',
      'Complete 6-8 repetitions',
      'Monitor for signs of fatigue or compensation'
    ],
    good_form: [
      'Smooth, controlled weight shifts',
      'Dog actively corrects balance',
      'Four paws maintain contact throughout',
      'Core muscles visibly engaged',
      'Minimal anxiety or stress behaviors'
    ],
    common_mistakes: [
      'Starting with excessive tilt angle',
      'Allowing dog to hop off repeatedly',
      'Training sessions too long',
      'Not supporting dog adequately',
      'Using board inappropriate for dog size'
    ],
    red_flags: [
      'Dog refuses to engage with board',
      'Excessive fear or panic responses',
      'Loss of balance resulting in fall',
      'Muscle cramping or trembling',
      'Limping after dismount'
    ],
    progression: 'Increase tilt angle gradually. Add duration to 45-60 seconds. Incorporate treat catches while on board. Progress to eyes-closed balance work.',
    contraindications: 'Neurological deficits, recent surgery, acute pain, severe weakness, balance disorders without supervision',
    difficulty_level: 'Advanced'
  },

  {
    code: 'FOAM_PAD_STAND',
    name: 'Foam Pad Static Standing',
    category: 'Balance & Proprioception',
    description: 'Proprioceptive training on dense foam to enhance sensory feedback and postural control.',
    equipment: ['Dense foam pad (2-4 inches thick)', 'Non-slip base', 'Treats'],
    setup: 'Place foam pad on stable floor. Ensure adequate space around pad for safety.',
    steps: [
      'Guide dog to step all four paws onto foam',
      'Allow 5-10 seconds for adjustment to surface',
      'Encourage balanced, square stance',
      'Hold position for 20-30 seconds',
      'Observe weight distribution across limbs',
      'Reward calm, controlled stance',
      'Allow dog to step off slowly',
      'Rest between repetitions',
      'Perform 8-10 repetitions per session'
    ],
    good_form: [
      'Equal weight bearing on all limbs',
      'Minimal postural sway',
      'Paws actively grip foam surface',
      'Dog appears relaxed yet engaged',
      'Maintains position without drift'
    ],
    common_mistakes: [
      'Using foam that is too soft initially',
      'Not allowing adjustment period',
      'Rushing through repetitions',
      'Inadequate rest between sets',
      'Training on uneven or unstable base'
    ],
    red_flags: [
      'Dog repeatedly shifts off foam',
      'Visible discomfort or anxiety',
      'Muscle tremors beyond normal fatigue',
      'Compensatory postures developing',
      'Post-exercise lameness'
    ],
    progression: 'Use softer foam for greater challenge. Increase hold time to 60-90 seconds. Add head turns or treat searches. Combine with limb lifts.',
    contraindications: 'Acute inflammation, recent fracture, severe osteoarthritis, balance disorders, neurological impairment',
    difficulty_level: 'Moderate'
  },

  {
    code: 'CAVALETTI_VAR',
    name: 'Variable Height Cavaletti Work',
    category: 'Balance & Proprioception',
    description: 'Advanced gait training using cavaletti poles at varying heights to enhance limb awareness and coordination.',
    equipment: ['6-8 cavaletti poles or PVC pipes', 'Adjustable stands', 'Measuring tape', 'Treats'],
    setup: 'Set up 6 poles in series with alternating heights: low (2-4 inches), medium (4-6 inches). Space based on dog stride length.',
    steps: [
      'Start with dog at standstill before poles',
      'Walk dog through at controlled pace',
      'Encourage deliberate lifting over each pole',
      'Maintain straight line through course',
      'Monitor limb clearance over obstacles',
      'Complete full series without stopping',
      'Return to start via different path',
      'Repeat 4-6 passes per session',
      'Adjust heights based on performance',
      'Watch for signs of fatigue or compensation'
    ],
    good_form: [
      'Consistent clearance over all poles',
      'Smooth, rhythmic gait pattern',
      'Equal limb elevation bilaterally',
      'Head and neck position stable',
      'No rushing or hesitation at poles'
    ],
    common_mistakes: [
      'Poles spaced incorrectly for stride',
      'Heights too challenging initially',
      'Walking too fast through course',
      'Not enough repetitions for motor learning',
      'Inadequate rest between passes'
    ],
    red_flags: [
      'Dog consistently hits or knocks poles',
      'Obvious avoidance of affected limb',
      'Stopping or refusing to continue',
      'Increased lameness during or after',
      'Loss of previously achieved coordination'
    ],
    progression: 'Increase pole heights gradually. Add curve or serpentine patterns. Introduce random height variations. Progress to trot speed.',
    contraindications: 'Acute lameness, neurological deficits affecting coordination, severe arthritis, post-fracture with incomplete healing',
    difficulty_level: 'Moderate'
  },

  {
    code: 'THERABAND_WTS',
    name: 'TheraBand Weight Shifting',
    category: 'Balance & Proprioception',
    description: 'Controlled lateral and forward weight shifts using resistance band to challenge dynamic balance and core strength.',
    equipment: ['TheraBand or resistance loop', 'Harness', 'Non-slip mat', 'Treats'],
    setup: 'Fit harness on dog. Attach TheraBand to harness at chest level. Position dog on non-slip surface.',
    steps: [
      'Hold TheraBand with gentle tension',
      'Apply light lateral pull to one side',
      'Dog should resist and maintain balance',
      'Hold resistance for 5-10 seconds',
      'Release tension slowly',
      'Repeat pull to opposite side',
      'Apply gentle forward resistance',
      'Dog should resist backward lean',
      'Complete 8-10 directional pulls per session',
      'Monitor for proper weight shifting patterns'
    ],
    good_form: [
      'Dog actively resists applied force',
      'Smooth weight transfer to opposing limbs',
      'Core muscles visibly engaged',
      'Paws remain planted throughout',
      'Controlled return to neutral stance'
    ],
    common_mistakes: [
      'Applying excessive force',
      'Pulling too quickly without time to respond',
      'Not balancing pulls across all directions',
      'Training on slippery surface',
      'Session duration too long causing fatigue'
    ],
    red_flags: [
      'Dog unable to resist even light pressure',
      'Paws slide on surface',
      'Signs of pain or guarding',
      'Obvious strength asymmetry',
      'Dog appears anxious or stressed'
    ],
    progression: 'Increase resistance gradually. Add diagonal pull directions. Combine with static holds. Progress to standing on unstable surface.',
    contraindications: 'Spinal instability, recent surgery, acute pain, severe proprioceptive deficits, cardiac conditions',
    difficulty_level: 'Moderate'
  },

  {
    code: 'FIGURE8_CONE',
    name: 'Figure-8 Cone Weaving',
    category: 'Balance & Proprioception',
    description: 'Advanced coordination exercise requiring tight turns and weight shifts through serpentine pattern.',
    equipment: ['4-6 training cones', 'Measuring tape', 'Leash', 'Treats'],
    setup: 'Arrange cones in figure-8 or serpentine pattern. Space cones 3-6 feet apart based on dog size and ability.',
    steps: [
      'Begin with dog at starting cone',
      'Walk dog in controlled figure-8 around cones',
      'Maintain close weave requiring tight turns',
      'Keep consistent pace throughout pattern',
      'Complete 2-3 full figure-8 circuits',
      'Change direction and repeat',
      'Monitor for equal weight bearing through turns',
      'Rest 60 seconds between sets',
      'Perform 3-4 sets per session',
      'Watch for signs of fatigue or compensation'
    ],
    good_form: [
      'Smooth, fluid turns around cones',
      'Equal performance turning both directions',
      'Hindquarters track properly through turns',
      'Consistent pace maintained',
      'No wide swinging or cutting corners'
    ],
    common_mistakes: [
      'Cones spaced too close initially',
      'Walking too fast for controlled turns',
      'Not balancing right and left direction work',
      'Too many repetitions causing fatigue',
      'Poor leash control affecting dog motion'
    ],
    red_flags: [
      'Dog consistently hits or avoids cones',
      'Obvious lameness during turns',
      'Refusal to turn in one direction',
      'Loss of coordination mid-exercise',
      'Increased limping after completion'
    ],
    progression: 'Tighten cone spacing gradually. Increase speed to trot. Remove visual cones and use floor markers. Add random pattern changes.',
    contraindications: 'Acute joint injury, severe arthritis, neurological deficits, vestibular disease, recent surgery',
    difficulty_level: 'Moderate'
  },

  {
    code: 'PERTURBATION_ADV',
    name: 'Advanced Controlled Perturbation Training',
    category: 'Balance & Proprioception',
    description: 'Manual application of unexpected balance challenges to improve reactive postural responses.',
    equipment: ['Non-slip mat', 'Treats', 'Spotter if needed'],
    setup: 'Position dog in square stance on non-slip surface. Ensure clear space around dog.',
    steps: [
      'Allow dog to establish balanced stance',
      'Apply gentle push at shoulder level',
      'Dog should actively resist and rebalance',
      'Hold position while dog adjusts',
      'Apply push from different direction',
      'Vary force and direction unpredictably',
      'Allow 5-10 seconds recovery between pushes',
      'Start with light forces, progress gradually',
      'Complete 8-12 perturbations per session',
      'Monitor quality of balance reactions'
    ],
    good_form: [
      'Quick, appropriate postural adjustments',
      'Dog returns to balanced stance smoothly',
      'Minimal excessive movement or overreaction',
      'Consistent responses across directions',
      'Dog appears confident and controlled'
    ],
    common_mistakes: [
      'Applying too much force initially',
      'Not varying direction sufficiently',
      'Pushing during dog movement',
      'Insufficient rest between perturbations',
      'Training on unstable base surface'
    ],
    red_flags: [
      'Dog unable to recover balance',
      'Excessive anxiety or stress',
      'Signs of pain during recovery',
      'Asymmetric or delayed responses',
      'Dog avoids or fears pushes'
    ],
    progression: 'Increase perturbation force. Shorten warning time. Apply during limb lifting. Combine with unstable surface training.',
    contraindications: 'Vestibular disorders, severe neurological deficits, acute pain, post-surgical instability, extreme fear or aggression',
    difficulty_level: 'Advanced'
  },

  {
    code: 'BLINDFOLD_BAL',
    name: 'Blindfold Balance (Visual Deprivation)',
    category: 'Balance & Proprioception',
    description: 'Advanced proprioceptive training eliminating visual compensation to enhance somatosensory reliance.',
    equipment: ['Soft blindfold or eye cover', 'Non-slip mat', 'Spotter', 'Treats'],
    setup: 'Apply comfortable, secure blindfold. Position dog on stable surface. Have spotter assist.',
    steps: [
      'Allow 30-60 seconds adjustment to blindfold',
      'Guide dog to square stance position',
      'Monitor initial balance response',
      'Hold static stance for 20-30 seconds',
      'Observe compensation patterns',
      'Remove blindfold slowly',
      'Allow visual reorientation period',
      'Rest 2-3 minutes between repetitions',
      'Repeat 3-4 times per session',
      'Progress hold time by 10 seconds weekly'
    ],
    good_form: [
      'Dog remains calm despite vision loss',
      'Increased proprioceptive awareness evident',
      'Minimal excessive swaying or movement',
      'Weight distributed appropriately',
      'Dog tolerates blindfold without panic'
    ],
    common_mistakes: [
      'Not acclimating dog to blindfold first',
      'Holding position too long initially',
      'Inadequate spotting for safety',
      'Using restrictive or uncomfortable blindfold',
      'Progressing too quickly in difficulty'
    ],
    red_flags: [
      'Extreme anxiety or panic response',
      'Dog freezes and refuses to move',
      'Loss of balance with risk of falling',
      'Aggressive or fearful behavior',
      'Increased post-exercise lameness'
    ],
    progression: 'Increase hold time to 60-90 seconds. Add slow walking with blindfold. Combine with foam pad standing. Introduce gentle perturbations.',
    contraindications: 'Severe anxiety disorders, vision-dependent balance disorders, acute injury, neurological deficits, extreme fear responses',
    difficulty_level: 'Advanced'
  },

  {
    code: 'DIAGONAL_LIFT',
    name: 'Diagonal Limb Lift Holds',
    category: 'Balance & Proprioception',
    description: 'Three-legged standing balance with diagonal limb elevation to challenge core stability and contralateral limb loading.',
    equipment: ['Non-slip mat', 'Treats', 'Stopwatch'],
    setup: 'Position dog in square stance on non-slip mat. Have treats ready for motivation.',
    steps: [
      'Cue dog to lift one front paw',
      'Simultaneously lift opposite rear paw',
      'Dog balances on diagonal limb pair',
      'Hold position for 5-10 seconds initially',
      'Lower limbs smoothly to ground',
      'Rest 30 seconds',
      'Repeat with opposite diagonal pair',
      'Complete 6-8 lifts per session',
      'Alternate diagonals consistently',
      'Monitor for compensatory postures'
    ],
    good_form: [
      'Balanced weight distribution on standing limbs',
      'Core engaged throughout hold',
      'Lifted limbs held in flexed position',
      'Minimal body sway or shifting',
      'Smooth transitions in and out of position'
    ],
    common_mistakes: [
      'Not properly cueing limb lifts',
      'Holding position too long initially',
      'Failing to alternate diagonal pairs',
      'Training when dog is already fatigued',
      'Insufficient stabilization of stance limbs'
    ],
    red_flags: [
      'Dog unable to hold position briefly',
      'Obvious pain or discomfort',
      'Severe trembling in supporting limbs',
      'Dog repeatedly attempts to put paw down',
      'Increased lameness after session'
    ],
    progression: 'Increase hold time to 30 seconds. Add perturbations during hold. Perform on unstable surface. Include treat catching during hold.',
    contraindications: 'Bilateral limb weakness, severe arthritis, acute injury, neurological impairment, post-surgical restrictions',
    difficulty_level: 'Advanced'
  },

  {
    code: 'PLATFORM_TRANS',
    name: 'Platform-to-Platform Transitions',
    category: 'Balance & Proprioception',
    description: 'Dynamic balance training requiring controlled stepping between elevated platforms of varying heights.',
    equipment: ['2-3 stable platforms (6-12 inches high)', 'Non-slip surface on platforms', 'Treats', 'Spotter'],
    setup: 'Arrange platforms 12-24 inches apart based on dog size. Ensure platforms are stable and secure.',
    steps: [
      'Position dog standing on first platform',
      'Allow adjustment to elevated position',
      'Lure or cue dog to step onto adjacent platform',
      'Dog navigates transition between surfaces',
      'Hold position on new platform 10 seconds',
      'Continue to next platform in sequence',
      'Monitor foot placement during transitions',
      'Complete 4-6 full sequences per session',
      'Reverse direction for balance',
      'Watch for hesitation or compensatory movement'
    ],
    good_form: [
      'Confident stepping between platforms',
      'Controlled weight transfer during transitions',
      'Balanced stance on each platform',
      'Smooth, deliberate movements',
      'Equal performance in both directions'
    ],
    common_mistakes: [
      'Platforms spaced too far apart',
      'Height differences too extreme',
      'Rushing through transitions',
      'Inadequate platform stability',
      'Training session too long'
    ],
    red_flags: [
      'Dog refuses to transition between platforms',
      'Visible fear or anxiety',
      'Loss of balance during transition',
      'Favoring one limb during stepping',
      'Post-exercise increase in lameness'
    ],
    progression: 'Increase platform heights gradually. Vary distances between platforms. Add unstable surface on platforms. Introduce speed variations.',
    contraindications: 'Acrophobia (fear of heights), severe arthritis limiting mobility, acute injury, balance disorders, visual impairment',
    difficulty_level: 'Advanced'
  },

  // ========================================
  // THERAPEUTIC MODALITIES (10 exercises: 61-70)
  // ========================================
  {
    code: 'TENS_THERAPY',
    name: 'TENS (Transcutaneous Electrical Nerve Stimulation)',
    category: 'Therapeutic Modalities',
    description: 'Application of low-voltage electrical current through skin to modulate pain perception and promote muscle re-education.',
    equipment: ['TENS unit with veterinary settings', 'Conductive gel', 'Electrodes', 'Clipper if needed'],
    setup: 'Clip hair if necessary for electrode contact. Clean and dry skin. Apply conductive gel to electrode sites.',
    steps: [
      'Place electrodes around painful or target area',
      'Position electrodes 2-4 inches apart',
      'Secure electrodes with tape or wraps',
      'Set TENS unit to conventional mode initially',
      'Frequency: 50-100 Hz for pain relief',
      'Pulse width: 50-200 microseconds',
      'Gradually increase intensity to visible muscle twitch',
      'Treat for 15-20 minutes per session',
      'Monitor dog for comfort throughout',
      'Remove electrodes and clean gel after session'
    ],
    good_form: [
      'Dog remains calm and comfortable',
      'Visible muscle contractions at appropriate intensity',
      'Consistent electrode contact throughout',
      'Symmetric response if bilateral application',
      'Pain reduction evident during or after treatment'
    ],
    common_mistakes: [
      'Inadequate skin preparation',
      'Electrodes placed too close together',
      'Intensity too high causing discomfort',
      'Treatment duration too short',
      'Not testing impedance before treatment'
    ],
    red_flags: [
      'Dog shows signs of discomfort or anxiety',
      'Skin irritation at electrode sites',
      'Muscle fasciculations beyond intended area',
      'No pain relief after multiple sessions',
      'Adverse reaction to electrical stimulation'
    ],
    progression: 'Increase intensity for stronger muscle contraction. Switch to burst mode for chronic pain. Extend duration to 30 minutes. Use during functional activities.',
    contraindications: 'Pacemaker, pregnancy, malignancy in treatment area, acute infection, open wounds at electrode sites, seizure disorders',
    difficulty_level: 'Moderate'
  },

  {
    code: 'NMES_QUAD',
    name: 'NMES (Neuromuscular Electrical Stimulation) - Quadriceps',
    category: 'Therapeutic Modalities',
    description: 'High-intensity electrical stimulation to prevent muscle atrophy and maintain muscle mass in quadriceps during immobilization or disuse.',
    equipment: ['NMES unit', 'Large surface electrodes', 'Conductive gel', 'Veterinary-specific device'],
    setup: 'Clip hair over quadriceps muscle belly. Clean skin thoroughly. Apply conductive gel to electrodes.',
    steps: [
      'Place active electrode over quadriceps motor point',
      'Position dispersive electrode over distal quadriceps',
      'Secure electrodes with cohesive bandage',
      'Set stimulator to NMES mode',
      'Frequency: 35-50 Hz for muscle strengthening',
      'Pulse width: 200-400 microseconds',
      'On time: 10 seconds, Off time: 50 seconds',
      'Ramp up: 2-3 seconds, Ramp down: 2 seconds',
      'Intensity: visible strong muscle contraction',
      'Perform 10-15 contractions per session',
      'Treat 5 days per week for atrophy prevention'
    ],
    good_form: [
      'Strong, tetanic muscle contraction visible',
      'Stifle extends during contraction phase',
      'Dog tolerates treatment without anxiety',
      'Consistent contraction quality across session',
      'Adequate rest between contractions'
    ],
    common_mistakes: [
      'Intensity insufficient for therapeutic effect',
      'On/off ratio not appropriate for muscle fatigue',
      'Electrodes not positioned over motor point',
      'Treatment frequency insufficient',
      'Not adjusting intensity as tolerance builds'
    ],
    red_flags: [
      'Muscle cramping or spasm',
      'Skin burns at electrode sites',
      'No visible muscle contraction achieved',
      'Extreme discomfort or agitation',
      'Increased joint pain after treatment'
    ],
    progression: 'Increase intensity as tolerance improves. Extend on-time to 15 seconds. Add co-contraction with voluntary movement. Progress to functional electrical stimulation.',
    contraindications: 'Pacemaker, pregnancy, malignancy, acute inflammation, thrombophlebitis, open wounds, fracture non-union',
    difficulty_level: 'Moderate'
  },

  {
    code: 'US_PULSED',
    name: 'Therapeutic Ultrasound (Pulsed Mode)',
    category: 'Therapeutic Modalities',
    description: 'Application of pulsed ultrasound waves to promote tissue healing without thermal effects, ideal for acute injuries.',
    equipment: ['Therapeutic ultrasound unit', 'Ultrasound gel', 'Clipper'],
    setup: 'Clip hair over treatment area for acoustic coupling. Apply generous layer of ultrasound gel.',
    steps: [
      'Set ultrasound to pulsed mode (20% duty cycle)',
      'Frequency: 3 MHz for superficial tissues',
      'Intensity: 0.5-1.0 W/cm² for acute conditions',
      'Place sound head perpendicular to skin',
      'Move in slow, overlapping circles',
      'Cover treatment area systematically',
      'Maintain constant contact with skin',
      'Treat for 5-8 minutes per area',
      'Monitor for any adverse reactions',
      'Remove gel thoroughly after treatment'
    ],
    good_form: [
      'Sound head maintains full contact',
      'Slow, methodical movements',
      'Dog remains comfortable throughout',
      'No air pockets between sound head and skin',
      'Treatment area thoroughly covered'
    ],
    common_mistakes: [
      'Moving sound head too quickly',
      'Insufficient gel application',
      'Treating over bony prominences directly',
      'Using continuous mode on acute injuries',
      'Treatment duration inadequate'
    ],
    red_flags: [
      'Dog vocalizes or shows pain',
      'Skin becomes hot or irritated',
      'Increased swelling after treatment',
      'No improvement after 6-8 treatments',
      'Periosteal pain during treatment'
    ],
    progression: 'Increase intensity to 1.5 W/cm² as healing progresses. Switch to continuous mode after acute phase. Combine with stretching or PROM.',
    contraindications: 'Pregnancy, malignancy, acute infection, thrombophlebitis, over growth plates in young dogs, pacemaker in treatment field',
    difficulty_level: 'Moderate'
  },

  {
    code: 'US_CONTINUOUS',
    name: 'Therapeutic Ultrasound (Continuous Mode)',
    category: 'Therapeutic Modalities',
    description: 'Continuous ultrasound application to increase tissue temperature and extensibility before stretching in chronic conditions.',
    equipment: ['Therapeutic ultrasound unit', 'Ultrasound gel', 'Clipper', 'Thermometer'],
    setup: 'Clip treatment area. Apply thick layer of ultrasound gel. Set up for immediate stretching post-treatment.',
    steps: [
      'Set ultrasound to continuous mode (100% duty cycle)',
      'Frequency: 1 MHz for deep tissues (3 MHz for superficial)',
      'Intensity: 1.5-2.0 W/cm² for heating',
      'Apply sound head in slow circular motions',
      'Cover entire treatment area methodically',
      'Treat for 8-10 minutes per area',
      'Immediately follow with stretching exercise',
      'Maintain tissue temperature elevation',
      'Do not exceed 10 minutes per treatment',
      'Cool down gradually after session'
    ],
    good_form: [
      'Tissue temperature rises 3-5°F',
      'Patient comfort maintained throughout',
      'Immediate progression to stretching',
      'Even distribution of ultrasound energy',
      'Appropriate frequency for tissue depth'
    ],
    common_mistakes: [
      'Not following immediately with stretch',
      'Intensity too high causing discomfort',
      'Treating too superficially with 1 MHz',
      'Allowing thermal effects to dissipate before stretch',
      'Treating over implants or metal'
    ],
    red_flags: [
      'Excessive heating sensation',
      'Pain during or immediately after treatment',
      'No increase in ROM after treatment',
      'Skin irritation or burns',
      'Increased inflammation post-treatment'
    ],
    progression: 'Increase intensity to 2.5 W/cm² for deeper heating. Extend treatment to 12 minutes. Combine with aggressive stretching protocols.',
    contraindications: 'Acute inflammation, pregnancy, malignancy, thrombophlebitis, over growth plates, anesthetic areas, over eyes or reproductive organs',
    difficulty_level: 'Moderate'
  },

  {
    code: 'LASER_IV',
    name: 'Class IV Laser Therapy',
    category: 'Therapeutic Modalities',
    description: 'High-powered laser photobiomodulation to reduce pain, inflammation, and accelerate tissue healing through cellular stimulation.',
    equipment: ['Class IV therapeutic laser (10-15W)', 'Protective eyewear', 'Treatment protocol chart'],
    setup: 'Ensure both operator and patient wear appropriate eye protection. Position dog comfortably with treatment area accessible.',
    steps: [
      'Don protective eyewear on dog and handler',
      'Select appropriate treatment protocol',
      'Wavelength: 800-1000 nm typical',
      'Power density: 0.5-3 W/cm² depending on condition',
      'Apply laser probe perpendicular to tissue',
      'Use continuous sweeping motion or grid pattern',
      'Treat painful area and surrounding tissues',
      'Acute conditions: 4-8 J/cm² per point',
      'Chronic conditions: 6-10 J/cm² per point',
      'Total treatment time: 3-8 minutes per area',
      'Document settings and response'
    ],
    good_form: [
      'Protective eyewear worn throughout',
      'Laser probe maintains appropriate distance',
      'Systematic coverage of treatment area',
      'Dog remains calm during treatment',
      'Appropriate dosimetry for condition'
    ],
    common_mistakes: [
      'Insufficient eye protection',
      'Probe held too far from skin',
      'Inadequate treatment area coverage',
      'Underdosing for chronic conditions',
      'Treating too frequently initially'
    ],
    red_flags: [
      'Increased pain after treatment',
      'No response after 6-8 treatments',
      'Eye exposure without protection',
      'Thermal discomfort reported',
      'Adverse tissue response'
    ],
    progression: 'Increase energy density gradually. Extend treatment area. Increase frequency to 5x/week for acute. Combine with other modalities.',
    contraindications: 'Malignancy in treatment area, pregnancy over abdomen, direct irradiation of eyes, photosensitivity, over thyroid gland',
    difficulty_level: 'Moderate'
  },

  {
    code: 'PEMF_THERAPY',
    name: 'Pulsed Electromagnetic Field (PEMF) Therapy',
    category: 'Therapeutic Modalities',
    description: 'Application of electromagnetic fields to enhance bone healing, reduce pain, and decrease inflammation through cellular mechanisms.',
    equipment: ['PEMF therapy unit', 'Applicator loops or mat', 'Blanket for comfort'],
    setup: 'Position dog comfortably on PEMF mat or place loop applicator around affected area.',
    steps: [
      'Position PEMF applicator appropriately',
      'Set frequency: 10-50 Hz for pain/healing',
      'Intensity: Low to medium initially',
      'Program duration: 20-30 minutes',
      'Allow dog to rest comfortably during treatment',
      'Do not restrain if dog is uncomfortable',
      'Monitor for any behavioral changes',
      'Treat 1-2 times daily for acute conditions',
      'Session can occur during rest or sleep',
      'Document treatment parameters and response'
    ],
    good_form: [
      'Dog appears relaxed during treatment',
      'Appropriate field strength for condition',
      'Consistent treatment schedule maintained',
      'Treatment area properly positioned in field',
      'Duration adequate for therapeutic effect'
    ],
    common_mistakes: [
      'Intensity set too high initially',
      'Inadequate treatment duration',
      'Inconsistent treatment schedule',
      'Poor positioning of applicator',
      'Not monitoring for adverse responses'
    ],
    red_flags: [
      'Increased agitation during treatment',
      'No improvement after 3-4 weeks',
      'Adverse behavioral changes',
      'Heating sensation in treated area',
      'Condition worsens during treatment course'
    ],
    progression: 'Increase intensity gradually. Extend duration to 45 minutes. Increase frequency to 2-3x daily. Use for maintenance after healing.',
    contraindications: 'Pacemaker, pregnancy, active hemorrhage, acute infections, malignancy, electronic implants',
    difficulty_level: 'Easy'
  },

  {
    code: 'HYDRO_WHIRL',
    name: 'Hydrotherapy Whirlpool',
    category: 'Therapeutic Modalities',
    description: 'Warm water immersion with jet agitation to enhance circulation, promote wound healing, and reduce edema.',
    equipment: ['Veterinary whirlpool tank', 'Thermometer', 'Towels', 'Non-slip mat'],
    setup: 'Fill whirlpool with warm water (92-98°F). Test temperature. Have towels ready for drying.',
    steps: [
      'Check water temperature: 92-98°F for most conditions',
      'Carefully place dog in whirlpool',
      'Water level should cover affected area',
      'Activate jets at low to moderate intensity',
      'Monitor dog comfort throughout session',
      'Treat for 10-15 minutes initially',
      'Observe skin for excessive redness',
      'Assist dog out of tank carefully',
      'Dry thoroughly, especially between toes',
      'Monitor for post-treatment effects'
    ],
    good_form: [
      'Dog remains calm and comfortable',
      'Water temperature consistent throughout',
      'Adequate water circulation around limb',
      'Skin appears pink but not overly red',
      'No signs of distress or anxiety'
    ],
    common_mistakes: [
      'Water temperature too hot',
      'Jet intensity too aggressive',
      'Treatment duration too long initially',
      'Inadequate drying post-treatment',
      'Not monitoring for thermal stress'
    ],
    red_flags: [
      'Excessive panting or thermal stress',
      'Increased agitation or escape attempts',
      'Skin maceration or excessive softening',
      'Increased wound drainage',
      'Post-treatment weakness or collapse'
    ],
    progression: 'Increase duration to 20-25 minutes. Raise water temperature slightly if tolerated. Increase jet intensity. Add Epsom salts for edema.',
    contraindications: 'Acute fracture, open surgical wounds, fever, cardiovascular compromise, uncontrolled bleeding, severe debilitation',
    difficulty_level: 'Moderate'
  },

  {
    code: 'ICE_MASSAGE',
    name: 'Ice Massage',
    category: 'Therapeutic Modalities',
    description: 'Direct application of ice in circular massage pattern to reduce acute inflammation, pain, and muscle spasm.',
    equipment: ['Ice cup or frozen water bottle', 'Towel', 'Timer'],
    setup: 'Prepare ice massage tool (frozen water in paper cup works well). Have towel to catch melt water.',
    steps: [
      'Expose treatment area completely',
      'Apply ice directly to skin',
      'Move ice in slow circular pattern',
      'Cover area systematically',
      'Continue for 5-10 minutes',
      'Patient will feel cold, aching, burning, then numbness',
      'Stop when numbness achieved',
      'Dry area thoroughly',
      'Allow tissue to rewarm naturally',
      'Can repeat 3-4 times daily for acute conditions'
    ],
    good_form: [
      'Constant circular motion maintained',
      'Entire treatment area covered',
      'Appropriate duration (not excessive)',
      'Dog tolerates treatment well',
      'Skin appears pink/red after treatment'
    ],
    common_mistakes: [
      'Keeping ice stationary too long',
      'Treatment duration too short',
      'Not achieving numbness',
      'Applying over bony prominences exclusively',
      'Inadequate pressure during application'
    ],
    red_flags: [
      'Excessive redness or blanching',
      'Dog shows signs of extreme discomfort',
      'Skin damage or frostbite',
      'No pain relief achieved',
      'Increased muscle guarding after treatment'
    ],
    progression: 'Extend duration to 12-15 minutes. Add stretch after numbing achieved. Use prior to exercise for pain control.',
    contraindications: 'Raynauds phenomenon, cold hypersensitivity, compromised circulation, anesthetic skin areas, over superficial nerves',
    difficulty_level: 'Easy'
  },

  {
    code: 'CONTRAST_BATH',
    name: 'Contrast Therapy (Alternating Hot/Cold)',
    category: 'Therapeutic Modalities',
    description: 'Alternating immersion in warm and cold water to create vascular pumping effect for chronic edema and circulation enhancement.',
    equipment: ['Two containers/tubs', 'Thermometer', 'Hot and cold water', 'Towels'],
    setup: 'Fill one container with warm water (95-100°F) and one with cold water (50-60°F). Test temperatures.',
    steps: [
      'Immerse affected limb in warm water first',
      'Hold for 3-4 minutes',
      'Transfer limb to cold water',
      'Hold for 1 minute',
      'Return to warm water for 3-4 minutes',
      'Repeat hot/cold cycle 3-4 times',
      'Always end with cold immersion',
      'Total treatment time: 15-20 minutes',
      'Dry limb thoroughly after treatment',
      'Perform 1-2 times daily for chronic edema'
    ],
    good_form: [
      'Smooth transitions between temperatures',
      'Consistent timing of each phase',
      'Dog remains cooperative throughout',
      'Temperature differential maintained',
      'Adequate limb coverage in water'
    ],
    common_mistakes: [
      'Hot water too hot causing thermal stress',
      'Cold water not cold enough',
      'Insufficient contrast between temperatures',
      'Not ending with cold',
      'Inadequate treatment duration'
    ],
    red_flags: [
      'Increased edema after treatment',
      'Skin damage from temperature extremes',
      'Significant distress during treatment',
      'No improvement after 2 weeks',
      'Development of thermal sensitivity'
    ],
    progression: 'Increase temperature differential slightly. Extend duration of each phase. Perform 2-3 times daily. Add active ROM during warm phases.',
    contraindications: 'Acute inflammation, compromised circulation, neuropathy, cold or heat hypersensitivity, open wounds',
    difficulty_level: 'Moderate'
  },

  {
    code: 'COMPRESSION_TX',
    name: 'Compression Therapy',
    category: 'Therapeutic Modalities',
    description: 'Application of graduated compression bandaging to control edema, support tissues, and enhance lymphatic drainage.',
    equipment: ['Graduated compression bandage', 'Padding material', 'Cohesive wrap', 'Scissors'],
    setup: 'Have all bandaging materials ready. Position dog comfortably with affected limb accessible.',
    steps: [
      'Apply light padding over bony prominences',
      'Start compression wrap at distal end of limb',
      'Apply with 50% overlap on each pass',
      'Maintain consistent tension throughout',
      'Compression should be firm but not restrictive',
      'Wrap proximally toward heart',
      'Secure with cohesive wrap at top',
      'Check toes for warmth and color',
      'Leave on for 2-4 hours initially',
      'Remove if any signs of compromise',
      'Repeat 2-3 times daily as needed'
    ],
    good_form: [
      'Even, graduated compression applied',
      'No wrinkles or bunching in bandage',
      'Toes remain warm and normal color',
      'Dog walks without excessive restriction',
      'Visible reduction in edema after session'
    ],
    common_mistakes: [
      'Compression too tight distally',
      'Uneven tension during application',
      'Not protecting bony prominences',
      'Leaving on too long initially',
      'Starting wrap too proximally'
    ],
    red_flags: [
      'Toes become cold or discolored',
      'Dog excessively licks or chews bandage',
      'Increased swelling above bandage',
      'Loss of sensation in limb',
      'Skin breakdown under bandage'
    ],
    progression: 'Increase compression slightly. Extend wear time to 6-8 hours. Combine with elevation. Use during exercise for support.',
    contraindications: 'Acute DVT, severe arterial disease, congestive heart failure, cellulitis, hypersensitivity to bandage materials',
    difficulty_level: 'Moderate'
  },

  // ========================================
  // MANUAL THERAPY TECHNIQUES (5 exercises: 71-75)
  // ========================================
  {
    code: 'JOINT_MOB_G1',
    name: 'Joint Mobilization - Grade I (Stifle)',
    category: 'Manual Therapy',
    description: 'Small amplitude oscillatory movements at beginning of range to reduce pain through mechanoreceptor stimulation.',
    equipment: ['Treatment table or padded surface', 'Towel roll for support'],
    setup: 'Position dog in lateral recumbency with affected limb up. Place towel roll under limb for support.',
    steps: [
      'Stabilize femur firmly with one hand',
      'Grasp proximal tibia with other hand',
      'Find resting position of joint',
      'Apply very small amplitude oscillations',
      'Movement barely perceptible (1-2mm)',
      'Maintain steady rhythm at 2-3 cycles per second',
      'Continue for 30-60 seconds',
      'No force beyond initial tissue resistance',
      'Monitor patient response continuously',
      'Repeat 3-4 times with rest between'
    ],
    good_form: [
      'Minimal movement amplitude maintained',
      'Rhythmic, consistent oscillations',
      'Dog appears relaxed throughout',
      'No protective muscle guarding',
      'Pain appears reduced during treatment'
    ],
    common_mistakes: [
      'Amplitude too large (exceeding Grade I)',
      'Moving too quickly or erratically',
      'Applying excessive force',
      'Not stabilizing proximal segment',
      'Treatment duration too short'
    ],
    red_flags: [
      'Increased pain during mobilization',
      'Muscle spasm or guarding intensifies',
      'Joint effusion increases',
      'Dog vocalizes or shows distress',
      'No pain reduction after treatment'
    ],
    progression: 'Progress to Grade II mobilizations. Increase treatment duration to 90 seconds. Combine with other manual techniques.',
    contraindications: 'Acute fracture, ligament rupture, joint infection, severe osteoporosis, hypermobility, acute inflammatory arthritis',
    difficulty_level: 'Moderate'
  },

  {
    code: 'JOINT_MOB_G2',
    name: 'Joint Mobilization - Grade II (Stifle)',
    category: 'Manual Therapy',
    description: 'Large amplitude oscillations within available range to reduce pain and improve joint play without stretching tissues.',
    equipment: ['Treatment table', 'Towel support', 'Goniometer for ROM measurement'],
    setup: 'Dog in lateral recumbency. Measure baseline ROM. Position towel under distal limb.',
    steps: [
      'Stabilize femur with proximal hand',
      'Grasp tibia with mobilizing hand',
      'Find mid-range of available motion',
      'Perform large amplitude oscillations',
      'Movement through middle 50% of available range',
      'Maintain rhythm at 2 cycles per second',
      'Continue for 45-90 seconds',
      'Stay within pain-free range',
      'Reassess ROM after treatment',
      'Repeat 2-3 sets per session'
    ],
    good_form: [
      'Large, smooth amplitude movements',
      'Consistent rhythm maintained',
      'No forcing into restricted range',
      'Dog remains comfortable',
      'Measurable ROM improvement post-treatment'
    ],
    common_mistakes: [
      'Amplitude too small (Grade I instead of II)',
      'Pushing into tissue resistance',
      'Irregular rhythm or speed',
      'Inadequate stabilization',
      'Not reassessing ROM'
    ],
    red_flags: [
      'Pain increases during treatment',
      'Joint effusion develops',
      'ROM decreases after treatment',
      'Muscle guarding intensifies',
      'Signs of joint instability'
    ],
    progression: 'Progress to Grade III mobilizations. Increase treatment duration. Add end-range holds. Combine with thermal modalities.',
    contraindications: 'Joint instability, acute inflammation, recent surgery, fracture, severe pain, hypermobility syndrome',
    difficulty_level: 'Moderate'
  },

  {
    code: 'JOINT_MOB_G3',
    name: 'Joint Mobilization - Grade III (Stifle)',
    category: 'Manual Therapy',
    description: 'Large amplitude oscillations into tissue resistance to stretch periarticular structures and break adhesions.',
    equipment: ['Treatment table', 'Goniometer', 'Hot pack for pre-treatment'],
    setup: 'Apply heat to joint for 10 minutes. Position dog in lateral recumbency. Measure baseline ROM.',
    steps: [
      'Pre-heat joint capsule with hot pack',
      'Stabilize femur firmly',
      'Grasp tibia for mobilization',
      'Perform large amplitude movements',
      'Push into tissue resistance at end-range',
      'Oscillate at 1-2 cycles per second',
      'Continue for 30-60 seconds',
      'Feel for tissue release or give',
      'Progress force gradually if no adverse response',
      'Immediately follow with stretching',
      'Reassess ROM after treatment'
    ],
    good_form: [
      'Sustained pressure into restriction',
      'Controlled oscillations at barrier',
      'Patient tolerates with minimal discomfort',
      'Palpable tissue release achieved',
      'Immediate ROM improvement measured'
    ],
    common_mistakes: [
      'Insufficient force to reach restriction',
      'Not pre-heating tissues',
      'Moving too aggressively causing pain',
      'Failing to follow with stretching',
      'Not measuring ROM changes'
    ],
    red_flags: [
      'Sharp pain during mobilization',
      'Audible abnormal joint sounds',
      'Immediate joint swelling',
      'Loss of previously gained range',
      'Signs of instability post-treatment'
    ],
    progression: 'Increase force gradually. Add sustained holds at end-range. Combine with contract-relax stretching. Progress to Grade IV if appropriate.',
    contraindications: 'Osteoporosis, acute inflammation, joint effusion, hypermobility, ligament injury, bone disease',
    difficulty_level: 'Advanced'
  },

  {
    code: 'MYOFASC_ILIO',
    name: 'Myofascial Release - Iliopsoas',
    category: 'Manual Therapy',
    description: 'Sustained pressure and stretching of iliopsoas muscle and fascia to release hip flexor tension and improve hip extension.',
    equipment: ['Treatment table', 'Pillows for positioning', 'Warm compress'],
    setup: 'Position dog in lateral recumbency with affected side up. Place pillow under abdomen for comfort.',
    steps: [
      'Apply warm compress to hip flexor region 5 minutes',
      'Locate iliopsoas muscle medial to ilium',
      'Apply sustained gentle pressure with fingertips',
      'Press medially and slightly cranially',
      'Hold pressure for 30-90 seconds',
      'Feel for fascial release or softening',
      'Progress pressure deeper as tissue relaxes',
      'Perform slow strokes along muscle length',
      'Combine with hip extension stretch',
      'Treat for total 5-8 minutes',
      'Reassess hip extension ROM'
    ],
    good_form: [
      'Gradual, sustained pressure application',
      'Palpable tissue release achieved',
      'Dog remains relaxed throughout',
      'Hip extension ROM improves measurably',
      'No excessive discomfort'
    ],
    common_mistakes: [
      'Insufficient pressure to affect deep tissue',
      'Not holding pressure long enough',
      'Treating too aggressively initially',
      'Missing true iliopsoas location',
      'Not combining with stretching'
    ],
    red_flags: [
      'Dog shows significant pain response',
      'Muscle spasm increases',
      'No tissue release felt',
      'Post-treatment soreness excessive',
      'ROM decreases after treatment'
    ],
    progression: 'Increase pressure depth. Extend treatment duration. Add contract-relax technique. Combine with active hip extension exercises.',
    contraindications: 'Acute muscle strain, iliopsoas tendinopathy, lumbar disc disease with nerve impingement, abdominal mass, pregnancy',
    difficulty_level: 'Advanced'
  },

  {
    code: 'MYOFASC_BF',
    name: 'Myofascial Release - Biceps Femoris',
    category: 'Manual Therapy',
    description: 'Manual fascial stretching and release of biceps femoris to address hamstring tension and improve stifle ROM.',
    equipment: ['Treatment table', 'Massage cream', 'Hot pack'],
    setup: 'Dog in lateral recumbency. Apply heat to hamstring region for 8-10 minutes.',
    steps: [
      'Pre-heat biceps femoris muscle belly',
      'Apply massage cream for glide',
      'Locate biceps femoris on caudal thigh',
      'Place both hands along muscle length',
      'Apply broad, sustained pressure',
      'Push hands in opposite directions to stretch fascia',
      'Hold 60-90 seconds per position',
      'Progress along entire muscle length',
      'Perform cross-friction at trigger points',
      'Include pin-and-stretch technique',
      'Total treatment 8-12 minutes',
      'Follow immediately with hamstring stretch'
    ],
    good_form: [
      'Sustained, even pressure maintained',
      'Fascial glide and release palpable',
      'Muscle visibly softens during treatment',
      'Dog shows relaxation signs',
      'Improved stifle flexion after treatment'
    ],
    common_mistakes: [
      'Pressure too light to affect fascia',
      'Moving too quickly without sustained holds',
      'Not addressing entire muscle length',
      'Missing trigger point areas',
      'Inadequate pre-heating'
    ],
    red_flags: [
      'Excessive pain response',
      'Muscle cramping during treatment',
      'Increased hamstring tightness after',
      'Bruising at treatment site',
      'Dog becomes aggressive or fearful'
    ],
    progression: 'Add trigger point ischemic compression. Increase pressure depth. Extend treatment to 15 minutes. Combine with NMES to hamstrings.',
    contraindications: 'Acute hamstring strain, recent surgery, severe muscle atrophy, bleeding disorders, infection',
    difficulty_level: 'Moderate'
  }
];

module.exports = EXERCISES_PART6;