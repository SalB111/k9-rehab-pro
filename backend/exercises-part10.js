// ============================================================================
// ATHLETIC FOUNDATIONS: GENERAL REHAB EXERCISES — 30 EXERCISES
// K9-REHAB-PRO - Veterinary-Grade Exercise Library
// For general-practice veterinarians treating strains, sprains,
// mild lameness, and deconditioning.
// ============================================================================

const ATHLETIC_FOUNDATIONS = [

  // ========================================
  // STRENGTH (15 exercises)
  // ========================================

  {
    code: 'AF_DIG',
    name: 'Dig',
    category: 'Athletic Foundations',
    description: 'Controlled digging motion on a designated surface to strengthen forelimb flexors/extensors, shoulder stabilizers, and core musculature. The repetitive pawing engages the biceps brachii, supraspinatus, and digital flexors in a functional movement pattern.',
    equipment: ['Sandbox or designated dig area', 'High-value buried treats', 'Towel for cleanup'],
    setup: 'Place high-value treats or toy partially buried in a sandbox or soft dirt area. Position dog standing in front of dig area on stable footing.',
    steps: [
      'Direct dog to the dig area with a target cue',
      'Allow dog to paw and dig toward the buried reward',
      'Encourage controlled, rhythmic digging — not frantic',
      'Allow 15–20 seconds of active digging per bout',
      'Pause between bouts for 10 seconds rest',
      'Repeat for 3–5 bouts per session',
      'Reward with the buried treat upon completion'
    ],
    good_form: [
      'Alternating forelimbs during digging',
      'Weight evenly distributed on hind limbs',
      'Controlled intensity — not frantic or obsessive',
      'Dog remains engaged without overexertion'
    ],
    common_mistakes: [
      'Allowing frantic, uncontrolled digging',
      'Sessions too long causing forelimb fatigue',
      'Digging surface too hard or abrasive',
      'Not alternating limbs (favoring one side)'
    ],
    red_flags: [
      'Lameness in forelimb during or after session',
      'Nail damage or pad abrasions',
      'Signs of shoulder or carpal pain',
      'Dog refusing to bear weight on a forelimb'
    ],
    progression: 'Increase bout duration to 30 seconds. Bury treats deeper. Add soft sand for increased resistance.',
    contraindications: 'Forelimb fractures, carpal injuries, shoulder instability, open wounds on pads or digits',
    difficulty_level: 'Easy'
  },

  {
    code: 'AF_HIGH_FIVE_WAVE',
    name: 'High Five and Wave',
    category: 'Athletic Foundations',
    description: 'Unilateral forelimb elevation from a sitting or standing position to strengthen shoulder flexors, improve scapular stability, and challenge core balance. The controlled paw lift activates the deltoideus, supraspinatus, and triceps of the weight-bearing limb.',
    equipment: ['Non-slip surface', 'High-value treats', 'Target stick (optional)'],
    setup: 'Dog in a stable sit or stand on a non-slip surface. Handler positioned in front at eye level.',
    steps: [
      'Cue dog to sit or stand squarely',
      'Present hand or target at shoulder height',
      'Encourage dog to lift one forepaw to touch your hand (High Five)',
      'Hold the lifted position for 2–3 seconds',
      'For Wave: encourage dog to lift paw higher without contact and hold',
      'Lower paw back to ground in a controlled manner',
      'Alternate between left and right forelimbs',
      'Perform 5–8 repetitions per side'
    ],
    good_form: [
      'Dog maintains upright posture without leaning',
      'Controlled lift and lower — no slapping',
      'Hind limbs remain square and weight-bearing',
      'Minimal trunk sway during paw elevation'
    ],
    common_mistakes: [
      'Dog lunging forward to reach the hand',
      'Allowing trunk rotation or lateral lean',
      'Paw lift too rapid without a controlled hold',
      'Not alternating sides equally'
    ],
    red_flags: [
      'Reluctance to lift one forelimb consistently',
      'Compensatory weight shift to one hind limb',
      'Pain on shoulder flexion or extension',
      'Loss of balance or stumbling'
    ],
    progression: 'Increase hold duration to 5 seconds. Perform on an unstable surface (foam pad). Add sequential left-right alternation.',
    contraindications: 'Shoulder luxation, bicipital tenosynovitis, forelimb fractures, severe forelimb lameness',
    difficulty_level: 'Easy'
  },

  {
    code: 'AF_SNOOPYS',
    name: 'Snoopys',
    category: 'Athletic Foundations',
    description: 'Rhythmic bilateral forelimb elevation while in a standing position, mimicking a happy dance. Strengthens the shoulder girdle, improves bilateral forelimb coordination, and activates core stabilizers as the dog shifts weight between hind limbs.',
    equipment: ['Non-slip surface', 'High-value treats', 'Handler lure hand'],
    setup: 'Dog standing squarely on a non-slip surface. Handler stands directly in front holding a treat above the dog\'s head.',
    steps: [
      'Hold treat slightly above the dog\'s nose to encourage upright posture',
      'Slowly raise the lure to encourage both forepaws to lift off the ground briefly',
      'Allow a controlled bounce — forepaws lift together, then return to floor',
      'Encourage rhythmic, alternating forelimb lifts',
      'Maintain for 5–10 seconds of active movement',
      'Rest 10 seconds between bouts',
      'Repeat for 3–5 bouts per session'
    ],
    good_form: [
      'Both forelimbs lifting evenly',
      'Hind limbs remain grounded and stable',
      'Controlled rhythm — not frantic',
      'Dog maintains upright alignment'
    ],
    common_mistakes: [
      'Dog jumping fully off the ground',
      'Lure held too high causing rearing',
      'Allowing excessive spinal hyperextension',
      'Uncontrolled, frantic movement'
    ],
    red_flags: [
      'Hind limb weakness or collapse',
      'Spinal discomfort (hunching, yelping)',
      'Forelimb asymmetry in lift height',
      'Excessive panting or fatigue'
    ],
    progression: 'Increase bout duration to 15 seconds. Perform on foam pad. Add gentle lateral weight shifts.',
    contraindications: 'Lumbosacral disease, hind limb instability, cervical spine pathology, cardiac conditions',
    difficulty_level: 'Moderate'
  },

  {
    code: 'AF_ABDOM_COOKIE',
    name: 'Abdominal Cookie Reach',
    category: 'Athletic Foundations',
    description: 'Targeted core activation exercise where the dog reaches laterally or ventrally toward a treat from a standing position, engaging the oblique and rectus abdominis muscles. Promotes trunk flexion control and lateral stability.',
    equipment: ['Non-slip surface', 'Small high-value treats'],
    setup: 'Dog standing squarely on a non-slip surface. Handler kneels beside the dog with treats in hand.',
    steps: [
      'Hold a treat at the dog\'s flank level (between ribs and hip)',
      'Slowly guide the dog to reach toward the treat by bending laterally',
      'Allow the dog to take the treat when full lateral flexion is achieved',
      'Hold the flexed position for 2–3 seconds before releasing treat',
      'Perform to the left side, then the right side',
      'Guide a ventral reach (between front legs) for rectus abdominis activation',
      'Perform 5 repetitions per direction (left, right, ventral)'
    ],
    good_form: [
      'Feet remain planted — no stepping to reach the treat',
      'Smooth, controlled lateral trunk flexion',
      'Dog holds the curved position before receiving the treat',
      'Equal range of motion bilaterally'
    ],
    common_mistakes: [
      'Dog stepping sideways instead of bending',
      'Releasing the treat before the hold is completed',
      'Insufficient lateral reach (treat too close)',
      'Ignoring asymmetry between left and right sides'
    ],
    red_flags: [
      'Reluctance to bend in one direction',
      'Vocalization during lateral flexion',
      'Visible asymmetry in trunk flexibility',
      'Signs of abdominal guarding'
    ],
    progression: 'Increase hold to 5 seconds. Reach further toward hip. Perform on foam pad for added instability.',
    contraindications: 'Abdominal surgery recovery (first 6 weeks), spinal fractures, acute disc disease, rib fractures',
    difficulty_level: 'Easy'
  },

  {
    code: 'AF_ROCKERBOARD',
    name: 'Rockerboard Exercises',
    category: 'Athletic Foundations',
    description: 'Controlled weight shifting on an unstable rocker surface to strengthen bilateral limb stabilizers, activate proprioceptive pathways, and improve dynamic postural control. Engages core, shoulder, and pelvic stabilizers simultaneously.',
    equipment: ['Rocker board (commercial or DIY)', 'Non-slip mat beneath board', 'High-value treats', 'Spotter'],
    setup: 'Place rocker board on a non-slip surface. Have spotter present for safety. Dog approaches from the side.',
    steps: [
      'Lure dog onto the rocker board with all four paws',
      'Allow dog to find balance point — board rocking gently',
      'Encourage controlled weight shifts side-to-side',
      'Hold balanced center position for 10 seconds',
      'Reward for calm, steady posture',
      'Progress to front-to-back rocking once comfortable',
      'Perform 3–5 repetitions of 10–15 second holds'
    ],
    good_form: [
      'All four paws on the board simultaneously',
      'Controlled, smooth weight shifts',
      'Head and spine in neutral alignment',
      'Dog calm and focused — not panicked'
    ],
    common_mistakes: [
      'Allowing the dog to jump on or off rapidly',
      'Board tilting too aggressively',
      'No spotter for initial sessions',
      'Forcing a fearful dog onto the board'
    ],
    red_flags: [
      'Dog refuses to remain on the board',
      'Trembling or excessive muscle fatigue',
      'Slipping or loss of footing',
      'Vocalization or signs of joint pain'
    ],
    progression: 'Increase hold to 30 seconds. Combine with High Five or cookie reach on the board. Use a full wobble board (360-degree instability).',
    contraindications: 'Acute joint instability, vestibular disease, severe proprioceptive deficit, post-surgical limb restrictions',
    difficulty_level: 'Moderate'
  },

  {
    code: 'AF_ROLL_OVER',
    name: 'Roll Over',
    category: 'Athletic Foundations',
    description: 'Full trunk rotation from lateral recumbency through dorsal to opposite lateral, engaging the obliques, paraspinals, and hip rotators. Promotes spinal mobility, core flexibility, and body awareness.',
    equipment: ['Soft padded surface', 'High-value treats'],
    setup: 'Dog in a down position on a soft, padded surface. Handler kneels beside the dog.',
    steps: [
      'From a down, lure the dog\'s nose toward its shoulder',
      'Continue guiding the nose toward the hip to encourage lateral roll',
      'Support the movement as the dog rolls onto its back',
      'Continue the lure to guide the dog to complete the full roll',
      'Reward immediately upon completing the rotation',
      'Allow 5 seconds rest between repetitions',
      'Perform 3–5 rolls per session, alternating direction'
    ],
    good_form: [
      'Smooth, continuous rolling motion',
      'Dog relaxed through the dorsal (on-back) phase',
      'Equal willingness to roll left and right',
      'Controlled pace — not a rapid flip'
    ],
    common_mistakes: [
      'Dog popping up to standing mid-roll',
      'Only rolling one direction',
      'Performing on hard or slippery surface',
      'Forcing a dog that resists dorsal exposure'
    ],
    red_flags: [
      'Pain or vocalization during trunk rotation',
      'Refusal to roll in one direction (may indicate unilateral pain)',
      'Difficulty getting up after rolling',
      'Spinal rigidity or muscle guarding'
    ],
    progression: 'Increase to consecutive rolls (2–3 without stopping). Add a pause on the back (dorsal hold). Perform on a slight incline.',
    contraindications: 'Spinal surgery (first 8 weeks), disc herniation, thoracolumbar instability, rib fractures, bloat-prone breeds post-meal',
    difficulty_level: 'Easy'
  },

  {
    code: 'AF_SIT_TO_STAND',
    name: 'Sit to Stand',
    category: 'Athletic Foundations',
    description: 'Repetitive sit-to-stand transitions to strengthen the quadriceps, hamstrings, gluteals, and gastrocnemius. Functions as a controlled squat, building hind limb strength critical for stair climbing, rising, and gait quality.',
    equipment: ['Non-slip surface', 'Treats for luring'],
    setup: 'Dog on a non-slip surface with adequate room. Handler stands in front of the dog.',
    steps: [
      'Cue dog to sit squarely (both hocks tucked evenly)',
      'Hold treat at nose level and slowly move it forward and slightly upward',
      'Encourage the dog to rise to a stand without stepping forward',
      'Hold the stand for 3 seconds with even weight distribution',
      'Cue the sit again, ensuring a controlled descent',
      'Repeat 8–10 repetitions per set',
      'Perform 2–3 sets per session with 30-second rest between sets'
    ],
    good_form: [
      'Square sit — no hip kick or lazy sit',
      'Pushes up through hind limbs evenly',
      'Minimal forward creeping during stand transition',
      'Stands squarely before sitting again'
    ],
    common_mistakes: [
      'Dog walking forward instead of standing in place',
      'Allowing a sloppy or lateral sit position',
      'Rushing through reps without holding the stand',
      'Not addressing asymmetric push-off'
    ],
    red_flags: [
      'Consistent refusal to sit squarely (may indicate stifle or hip pain)',
      'Bunny hopping during the stand phase',
      'Trembling in hind limbs under load',
      'Reluctance to sit or difficulty rising'
    ],
    progression: 'Increase to 15 reps. Perform on an incline (hind limbs uphill). Add a 5-second stand hold. Place front paws on a low platform.',
    contraindications: 'Acute stifle injury, post-TPLO (first 4 weeks), hip luxation, severe coxofemoral osteoarthritis with pain on flexion',
    difficulty_level: 'Easy'
  },

  {
    code: 'AF_BEG_STAND_BEG',
    name: 'Beg-Stand-Beg',
    category: 'Athletic Foundations',
    description: 'Three-position transition exercise cycling between a beg (seated forelimb lift), standing, and back to beg. Targets hind limb strength, core stability, and hip extensor endurance. The beg position loads the lumbar paraspinals and hip flexors.',
    equipment: ['Non-slip surface', 'High-value treats', 'Wall or corner for initial support (optional)'],
    setup: 'Dog on a non-slip surface. Handler stands in front. For initial sessions, position dog near a wall for support.',
    steps: [
      'Cue dog to sit squarely',
      'Lure upward to encourage a beg position (forepaws lifted, sitting on haunches)',
      'Hold the beg for 2–3 seconds',
      'Lure forward to encourage a stand',
      'Hold the stand for 2–3 seconds',
      'Lure upward again back into beg',
      'Complete 5 full cycles (beg-stand-beg) per set',
      'Rest 30 seconds between sets. Perform 2 sets'
    ],
    good_form: [
      'Balanced beg position — not listing to one side',
      'Smooth transitions without lunging or stumbling',
      'Hind limbs remain planted during beg',
      'Controlled pace through all three positions'
    ],
    common_mistakes: [
      'Dog hopping forward during beg',
      'Skipping the hold at each position',
      'Allowing the dog to lean against a support after initial learning',
      'Performing too many reps causing hind limb fatigue'
    ],
    red_flags: [
      'Inability to maintain beg position for more than 1 second',
      'Hind limb trembling or shaking',
      'Pain on rising from sit to beg',
      'Loss of balance or falling sideways'
    ],
    progression: 'Increase hold to 5 seconds at each position. Remove wall support. Perform on foam pad. Add a down between stand and beg.',
    contraindications: 'Lumbosacral disease, patellar luxation (Grade III+), severe hip dysplasia, post-spinal surgery (first 12 weeks)',
    difficulty_level: 'Moderate'
  },

  {
    code: 'AF_PEABODYS',
    name: 'Peabodys',
    category: 'Athletic Foundations',
    description: 'Walking exercise where the dog is lured to maintain a head-up, collected posture with shortened stride and elevated weight-bearing on the hind limbs. Named after the classic marching posture, this exercise targets hamstrings, gluteals, and lumbar extensors.',
    equipment: ['Non-slip surface or firm grass', 'High-value treats', 'Short leash'],
    setup: 'Dog on leash in a standing position. Handler walks beside the dog with treat held just above nose level.',
    steps: [
      'Hold treat slightly above and in front of the dog\'s nose',
      'Walk forward at a slow, controlled pace',
      'Maintain the lure height to encourage a head-up, collected frame',
      'The dog should take short, deliberate hind limb steps',
      'Observe for exaggerated hind limb flexion (high stepping)',
      'Walk 10–15 meters per repetition',
      'Rest 15 seconds, then repeat for 3–5 repetitions'
    ],
    good_form: [
      'Elevated head carriage with neutral spine',
      'Short, deliberate hind limb strides',
      'Increased hind limb flexion visible',
      'Smooth, rhythmic gait without rushing'
    ],
    common_mistakes: [
      'Lure too high causing cervical hyperextension',
      'Walking too fast — stride becomes normal',
      'Dog jumping for the treat instead of walking',
      'Not enough repetitions to achieve training effect'
    ],
    red_flags: [
      'Hind limb dragging or scuffing',
      'Reluctance to flex hips or stifles',
      'Asymmetric stride length between hind limbs',
      'Signs of lumbar pain or discomfort'
    ],
    progression: 'Increase distance to 20–30 meters. Walk on gentle incline. Add pause-stands every 5 meters.',
    contraindications: 'Cervical disc disease, severe hind limb lameness, acute lumbosacral pain, post-TPLO (first 6 weeks)',
    difficulty_level: 'Moderate'
  },

  {
    code: 'AF_WALK_BACKWARD',
    name: 'Walk Backward',
    category: 'Athletic Foundations',
    description: 'Controlled reverse ambulation to target hip extensors, hamstrings, and proprioceptive awareness. Backward walking increases hind limb joint flexion angles and requires deliberate conscious placement, making it valuable for neurological and orthopedic rehabilitation.',
    equipment: ['Non-slip surface', 'Treats', 'Narrow hallway or guide rails (optional)'],
    setup: 'Dog standing in a hallway or between two guide rails. Handler faces the dog with treats at chest level.',
    steps: [
      'Stand facing the dog with a treat at nose level',
      'Step slowly toward the dog to encourage backward movement',
      'Allow the dog to take 2–3 backward steps before rewarding',
      'Ensure the dog moves straight backward without turning',
      'Use guide rails or a hallway to maintain straight-line movement',
      'Perform 5–8 repetitions of 3–5 steps backward',
      'Rest 10 seconds between repetitions'
    ],
    good_form: [
      'Straight-line backward movement without veering',
      'Deliberate, conscious hind paw placement',
      'Head and neck in neutral — not elevated excessively',
      'Even stride length both hind limbs'
    ],
    common_mistakes: [
      'Dog turning to one side instead of backing up',
      'Moving too quickly — shuffling instead of stepping',
      'Handler approaching too aggressively',
      'Not rewarding frequently enough to maintain behavior'
    ],
    red_flags: [
      'Knuckling or dragging of hind paws',
      'Crossing of hind limbs (ataxia)',
      'Refusal to back up (possible pain response)',
      'Asymmetric stride or weight-bearing'
    ],
    progression: 'Increase to 10 steps per rep. Back up on an incline. Back up over low cavaletti poles. Remove guide rails.',
    contraindications: 'Severe proprioceptive deficit (without supervision), acute disc herniation, bilateral hind limb paralysis',
    difficulty_level: 'Moderate'
  },

  {
    code: 'AF_RETRIEVE_UPHILL',
    name: 'Retrieve Uphill',
    category: 'Athletic Foundations',
    description: 'Controlled fetch on an inclined surface to increase hind limb drive during the uphill return phase. The incline loads the gluteals, hamstrings, and gastrocnemius eccentrically on descent and concentrically on ascent, providing functional strengthening.',
    equipment: ['Moderate incline or hill (10–20 degrees)', 'Fetch toy or ball', 'Long leash for control'],
    setup: 'Handler at the top of a moderate grassy incline. Dog at the handler\'s side, leashed for initial sessions.',
    steps: [
      'Toss the toy a short distance downhill (5–10 meters)',
      'Release the dog to retrieve (or walk down together on leash)',
      'Dog retrieves the toy and returns uphill to handler',
      'Reward and rest 15–20 seconds at the top',
      'Repeat 5–8 retrieves per session',
      'Monitor for fatigue — reduce reps if panting excessively',
      'Always end while the dog is still eager, not exhausted'
    ],
    good_form: [
      'Controlled pace going downhill — not sprinting',
      'Strong hind limb drive on uphill return',
      'Smooth gait without stumbling on the slope',
      'Willing return without coaxing'
    ],
    common_mistakes: [
      'Incline too steep causing excessive joint loading',
      'Throwing too far — overexertion on return',
      'Not providing adequate rest between retrieves',
      'Performing on wet or slippery grass'
    ],
    red_flags: [
      'Bunny hopping uphill (bilateral hind limb loading)',
      'Reluctance to return uphill',
      'Lameness that worsens with repetitions',
      'Excessive fatigue, panting, or lying down on the slope'
    ],
    progression: 'Increase distance to 15–20 meters. Increase incline grade. Add a sit-stay at the top before release.',
    contraindications: 'Cruciate ligament injury (acute), severe hip dysplasia, cardiac disease, brachycephalic breeds in warm weather',
    difficulty_level: 'Moderate'
  },

  {
    code: 'AF_STAND_DOWN_STAND',
    name: 'Stand-Down-Stand',
    category: 'Athletic Foundations',
    description: 'Controlled transitions between standing and down positions to eccentrically load the quadriceps on descent and concentrically load hip/stifle extensors on ascent. Builds functional strength for daily activities like lying down and rising.',
    equipment: ['Non-slip surface', 'Treats for luring'],
    setup: 'Dog standing squarely on a non-slip surface. Handler in front or beside the dog.',
    steps: [
      'Start with dog in a square stand',
      'Lure into a controlled down — straight down, no stepping forward',
      'Hold the down position for 3 seconds',
      'Lure back to a stand without the dog creeping forward',
      'Hold the stand for 3 seconds',
      'Repeat 8–10 transitions per set',
      'Perform 2 sets with 30-second rest between sets'
    ],
    good_form: [
      'Down achieved by folding legs — not walking into a down',
      'Elbows and hocks positioned evenly',
      'Stands up using hind limbs without rocking forward',
      'Stays in the same floor position throughout'
    ],
    common_mistakes: [
      'Dog sliding forward into the down position',
      'Rocking onto forelimbs to stand (should push from hind)',
      'Asymmetric down posture (hip kick)',
      'Rushing through transitions without holds'
    ],
    red_flags: [
      'Difficulty lowering into the down (may indicate stifle pain)',
      'Struggling to stand (hind limb weakness)',
      'Groaning or vocalization during transition',
      'Consistent hip kick to one side'
    ],
    progression: 'Increase hold to 5 seconds. Perform on incline (hind limbs uphill). Add front paw elevation on a low platform.',
    contraindications: 'Acute stifle injury, post-surgical restrictions (first 4 weeks), severe elbow dysplasia',
    difficulty_level: 'Easy'
  },

  {
    code: 'AF_TUG',
    name: 'Tug',
    category: 'Athletic Foundations',
    description: 'Controlled tug-of-war to strengthen the cervical musculature, forelimb extensors, core stabilizers, and hind limb drive. When performed with rules, tug provides an isometric and concentric loading pattern that improves jaw strength, neck stability, and overall body engagement.',
    equipment: ['Sturdy tug toy (rope, rubber, or firehose)', 'Non-slip surface'],
    setup: 'Dog standing on a non-slip surface. Handler holds the tug toy with both hands. Ensure adequate space for movement.',
    steps: [
      'Present the tug toy at the dog\'s chest height',
      'Allow the dog to grip the toy firmly',
      'Apply gentle, steady resistance — pull horizontally, not upward',
      'Engage for 10–15 seconds of controlled tugging',
      'Cue a "drop" or "out" to release',
      'Rest 10 seconds, then re-engage',
      'Perform 5–8 bouts per session'
    ],
    good_form: [
      'Low, horizontal pull direction — not yanking upward',
      'Dog maintains all four paws grounded',
      'Even engagement — not violent head shaking',
      'Clean grip release on cue'
    ],
    common_mistakes: [
      'Pulling upward causing cervical hyperextension',
      'Allowing violent lateral head thrashing',
      'Too much resistance causing the dog to strain',
      'No release cue trained — dog becomes possessive'
    ],
    red_flags: [
      'Neck pain or guarding after session',
      'Tooth damage or bleeding gums',
      'Dog growling with stiff body posture (resource guarding)',
      'Forelimb lameness during session'
    ],
    progression: 'Increase bout duration to 20 seconds. Add gentle lateral resistance. Perform with the dog standing on a foam pad.',
    contraindications: 'Cervical disc disease, atlantoaxial instability, temporomandibular disorder, dental disease or tooth fractures, toy-aggressive dogs',
    difficulty_level: 'Easy'
  },

  {
    code: 'AF_CRAWL',
    name: 'Crawl',
    category: 'Athletic Foundations',
    description: 'Army crawl movement where the dog moves forward from a down position without rising to a stand. Engages the hip flexors, shoulder extensors, and core musculature in a low-profile, high-engagement pattern. Promotes body awareness and controlled limb coordination.',
    equipment: ['Non-slip surface', 'High-value treats', 'Low barrier (chair, limbo bar) optional'],
    setup: 'Dog in a down position on a non-slip surface. Handler kneels in front with a treat at ground level.',
    steps: [
      'With the dog in a down, hold a treat just in front of the nose at ground level',
      'Slowly draw the treat forward along the ground',
      'Encourage the dog to crawl forward without standing up',
      'Use a low barrier (table, chairs) to prevent standing if needed',
      'Reward after every 2–3 crawl steps initially',
      'Increase crawl distance as proficiency improves',
      'Perform 3–5 repetitions of 1–2 meters'
    ],
    good_form: [
      'Belly maintains contact with the ground',
      'Smooth, alternating limb movement',
      'Dog remains in the down posture throughout',
      'Controlled pace — not lunging for the treat'
    ],
    common_mistakes: [
      'Dog standing up mid-crawl',
      'Lure too far ahead causing the dog to break form',
      'Surface too slippery for traction',
      'Rewarding after the dog has stood up'
    ],
    red_flags: [
      'Yelping or reluctance to flex and extend in the down position',
      'Dragging hind limbs instead of crawling with them',
      'Skin abrasion on sternum or elbows',
      'Inability to crawl in one direction (lateralizing pain)'
    ],
    progression: 'Increase distance to 3–5 meters. Crawl under lower barriers. Crawl on gentle incline. Add directional changes.',
    contraindications: 'Elbow hygroma, sternal wound, acute thoracolumbar pain, skin lesions on ventrum',
    difficulty_level: 'Easy'
  },

  {
    code: 'AF_RETRIEVE_LAND_WATER',
    name: 'Retrieve on Land & Water',
    category: 'Athletic Foundations',
    description: 'Dual-environment fetch combining land-based sprinting with aquatic swimming during the return phase. The transition between terrain and water provides a comprehensive cardiovascular and musculoskeletal workout with the buoyancy-assisted recovery of the water phase.',
    equipment: ['Floating fetch toy', 'Shallow-entry body of water (lake, calm pond)', 'Long leash', 'Canine life vest'],
    setup: 'Handler at the water\'s edge with a gentle, gradual entry slope. Dog wearing a life vest (required for safety). Calm water conditions only.',
    steps: [
      'Toss the floating toy into shallow water (3–5 meters from shore)',
      'Release the dog to run across land and enter water',
      'Dog swims to retrieve the toy and returns to shore',
      'Allow a 30-second rest between retrieves',
      'Start with 3–5 retrieves and monitor fatigue',
      'Ensure the dog exits the water fully between retrieves',
      'Towel dry and check ears post-session'
    ],
    good_form: [
      'Controlled water entry — wading in, not diving',
      'Efficient swimming stroke without excessive splashing',
      'Willing return to handler without coaxing',
      'Appropriate rest between retrieves'
    ],
    common_mistakes: [
      'Throwing too far into deep water',
      'No life vest — safety risk',
      'Too many retrieves causing exhaustion',
      'Cold water without monitoring for hypothermia'
    ],
    red_flags: [
      'Dog struggling to swim or sinking low in water',
      'Reluctance to re-enter water',
      'Excessive fatigue, staggering, or collapse',
      'Hypothermia signs: shivering, lethargy, pale gums'
    ],
    progression: 'Increase throw distance. Add current (gentle stream). Increase number of retrieves to 8–10.',
    contraindications: 'Open wounds, ear infections, dogs that cannot swim, cardiac disease, brachycephalic breeds, cold water conditions',
    difficulty_level: 'Advanced'
  },


  // ========================================
  // BODY AWARENESS (4 exercises)
  // ========================================

  {
    code: 'AF_STEP_OVER_POLES',
    name: 'Step Over Poles',
    category: 'Athletic Foundations',
    description: 'Walking over a series of ground poles (cavaletti) set at a height that requires deliberate limb elevation. Improves joint flexion angles, stride length awareness, proprioceptive input, and conscious limb placement — critical after orthopedic or neurological injury.',
    equipment: ['4–6 ground poles or PVC pipes', 'Pole supports or cones (adjustable height)', 'Non-slip surface', 'Treats'],
    setup: 'Set poles in a straight line, spaced 1 body length apart. Start at ground level and raise as proficiency improves. Place on a non-slip surface.',
    steps: [
      'Walk the dog on leash toward the pole line at a slow, controlled walk',
      'Encourage the dog to step over each pole deliberately',
      'Reward after successfully clearing 2–3 poles',
      'Walk through the full set of 4–6 poles',
      'Turn and walk back through in the opposite direction',
      'Perform 3–5 passes per session',
      'Gradually raise pole height (2–5 cm increments)'
    ],
    good_form: [
      'Each paw clears the pole without touching',
      'Consistent stride length between poles',
      'Head level, not looking straight down',
      'Smooth, rhythmic gait maintained'
    ],
    common_mistakes: [
      'Walking too fast — dog trotting instead of stepping',
      'Poles too close together causing cramped steps',
      'Poles too high too soon — causing jumping instead of stepping',
      'Not adjusting spacing for the dog\'s size'
    ],
    red_flags: [
      'Consistently knocking poles (proprioceptive deficit)',
      'Refusing to walk through poles',
      'Hind limb dragging or knuckling over poles',
      'Marked asymmetry in step height'
    ],
    progression: 'Raise poles to hock height. Vary spacing for stride length work. Add curved pole arrangements. Alternate high and low poles.',
    contraindications: 'Severe ataxia without handler support, acute orthopedic injury, visual impairment (without adaptation)',
    difficulty_level: 'Easy'
  },

  {
    code: 'AF_STEP_THROUGH_LADDER',
    name: 'Step Through a Ladder',
    category: 'Athletic Foundations',
    description: 'Walking through a ladder placed flat on the ground to promote precise paw placement, spatial awareness, and deliberate limb coordination. Each rung space requires the dog to consciously plan foot falls, activating cortical motor pathways and proprioceptive processing.',
    equipment: ['Agility ladder or standard ladder laid flat', 'Non-slip surface', 'Treats'],
    setup: 'Place ladder flat on the ground on a non-slip surface. Ensure rungs are spaced appropriately for the dog\'s stride (one body-length segments work well).',
    steps: [
      'Position dog at one end of the ladder',
      'Walk the dog through the ladder at a slow walk on leash',
      'Encourage placement of each paw within a ladder space (not on the rungs)',
      'Reward after every 3–4 successful step-throughs',
      'Walk through the full ladder length',
      'Turn and repeat in the opposite direction',
      'Perform 3–5 passes per session'
    ],
    good_form: [
      'Paws placed inside the ladder spaces, not on rungs',
      'Deliberate, conscious foot placement',
      'Consistent pace without rushing',
      'Head neutral — not staring straight down'
    ],
    common_mistakes: [
      'Dog jumping over the ladder instead of stepping through',
      'Moving too quickly through the rungs',
      'Rung spacing too narrow for the dog\'s size',
      'Not rewarding frequently enough'
    ],
    red_flags: [
      'Consistent paw placement on rungs (proprioceptive deficit)',
      'Tripping or stumbling repeatedly',
      'Refusal to enter the ladder',
      'Dragging hind paws through spaces'
    ],
    progression: 'Increase walking speed to slow trot. Raise the ladder slightly off the ground. Use two ladders in an L-shape for directional changes.',
    contraindications: 'Severe proprioceptive loss without supervision, acute limb fracture, high anxiety dogs (desensitize first)',
    difficulty_level: 'Easy'
  },

  {
    code: 'AF_RANDOM_GROUND_POLES',
    name: 'Random Ground Poles',
    category: 'Athletic Foundations',
    description: 'Navigating poles scattered randomly on the ground at varying angles and spacings. Unlike structured cavaletti, this challenges adaptive motor planning, improves cognitive-motor integration, and requires real-time proprioceptive adjustment at each step.',
    equipment: ['6–10 ground poles or pool noodles', 'Non-slip surface', 'Treats'],
    setup: 'Scatter poles randomly across a 3x3 meter area at various angles and spacings. Some parallel, some crossed, some closer, some further apart.',
    steps: [
      'Walk the dog into the pole field on leash at a slow walk',
      'Allow the dog to navigate the random arrangement independently',
      'Do not guide over specific poles — let the dog problem-solve',
      'Reward calm, deliberate navigation',
      'Walk through the field in different paths each pass',
      'Perform 3–5 passes per session',
      'Rearrange poles between sessions for novelty'
    ],
    good_form: [
      'Deliberate foot placement over each obstacle',
      'Calm exploration without panic or rushing',
      'Adapting stride length to variable spacings',
      'Looking ahead — planning the path'
    ],
    common_mistakes: [
      'Dog avoiding poles entirely by walking around them',
      'Poles too dense — overwhelming the dog',
      'Not rearranging between sessions (dog memorizes path)',
      'Rushing through instead of encouraging deliberate movement'
    ],
    red_flags: [
      'Repeated stumbling or tripping',
      'Freezing or refusal to move through the field',
      'Hind limb knuckling when navigating',
      'Anxiety or stress behaviors (lip licking, whale eye)'
    ],
    progression: 'Raise some poles to different heights. Add textured surfaces between poles. Increase pole density. Navigate at a slow trot.',
    contraindications: 'Severe ataxia without close handler support, blindness (without adaptation), acute orthopedic injury',
    difficulty_level: 'Easy'
  },

  {
    code: 'AF_SPINS',
    name: 'Spins',
    category: 'Athletic Foundations',
    description: 'Lured tight-circle turning in both directions to promote lateral flexion, activate the obliques and lateral trunk stabilizers, and improve proprioceptive awareness through the inner and outer limbs. Reveals asymmetry in trunk flexibility and limb loading.',
    equipment: ['Non-slip surface', 'High-value treats'],
    setup: 'Dog standing on a non-slip surface with room to turn a full circle. Handler stands in front.',
    steps: [
      'Hold a treat at the dog\'s nose level',
      'Slowly guide the nose in a circle to the right',
      'Allow the dog to follow the lure through a full 360-degree turn',
      'Reward upon completion of the circle',
      'Repeat 3–5 spins to the right',
      'Then perform 3–5 spins to the left',
      'Note any difference in ease or speed between directions'
    ],
    good_form: [
      'Tight, controlled circle — not wide arcing',
      'All four paws moving throughout the turn',
      'Smooth, continuous motion without stopping mid-spin',
      'Equal ease in both directions'
    ],
    common_mistakes: [
      'Circles too wide — losing the lateral flexion benefit',
      'Only spinning in one direction',
      'Dog spinning too fast (losing controlled form)',
      'Lure too far from nose — dog breaks the circle'
    ],
    red_flags: [
      'Marked reluctance or difficulty turning one direction',
      'Stumbling or crossing limbs during turns',
      'Pain vocalization during tight turns',
      'Head tilt or circling tendency (vestibular concern)'
    ],
    progression: 'Decrease circle diameter for tighter spins. Add a sit at the end of each spin. Perform on unstable surface. Chain left-right-left sequences.',
    contraindications: 'Vestibular disease, cervical disc herniation, acute unilateral lameness, severe spinal arthritis',
    difficulty_level: 'Easy'
  },


  // ========================================
  // STRETCH (5 exercises)
  // ========================================

  {
    code: 'AF_COOKIE_STRETCHES',
    name: 'Cookie Stretches',
    category: 'Athletic Foundations',
    description: 'Lure-guided cervical and trunk stretches using treat targeting to achieve lateral flexion, ventral flexion, and extension. A cornerstone flexibility exercise that systematically mobilizes the cervical and thoracolumbar spine through full range of motion.',
    equipment: ['Non-slip surface', 'Small, soft treats (multiple)'],
    setup: 'Dog standing squarely on a non-slip surface. Handler kneels beside the dog. Have 10–15 small treats ready.',
    steps: [
      'Lateral stretch RIGHT: Guide treat from nose to right shoulder — hold 3 seconds',
      'Lateral stretch LEFT: Guide treat from nose to left shoulder — hold 3 seconds',
      'Lateral stretch to RIGHT hip: Guide treat toward right hip — hold 3 seconds',
      'Lateral stretch to LEFT hip: Guide treat toward left hip — hold 3 seconds',
      'Ventral stretch: Guide treat between front legs toward chest — hold 3 seconds',
      'Extension: Guide treat upward and slightly backward — hold 3 seconds',
      'Perform each stretch 3–5 times per direction'
    ],
    good_form: [
      'Feet remain planted — no stepping',
      'Smooth, controlled reach toward the treat',
      'Full available range of motion achieved',
      'Dog holds the stretch position before receiving the treat'
    ],
    common_mistakes: [
      'Dog stepping toward the treat instead of stretching',
      'Releasing the treat before the hold is complete',
      'Not stretching in all six directions',
      'Moving the lure too fast'
    ],
    red_flags: [
      'Pain or yelping at end range in any direction',
      'Asymmetry — notably less range to one side',
      'Muscle spasm during the stretch',
      'Reluctance to hold the stretched position'
    ],
    progression: 'Increase holds to 5 seconds. Reach further (toward tail base). Perform stretches while standing on a balance disc.',
    contraindications: 'Cervical disc disease (limit extension), acute spinal injury, post-spinal surgery (first 8 weeks), atlantoaxial instability',
    difficulty_level: 'Easy'
  },

  {
    code: 'AF_PLAY_BOW',
    name: 'Play Bow',
    category: 'Athletic Foundations',
    description: 'Lured or cued thoracic limb flexion with the chest lowering toward the ground while hind limbs remain standing. Stretches the thoracolumbar extensors, hip flexors, and latissimus dorsi while loading the hind limbs in a weight-bearing extended position.',
    equipment: ['Non-slip surface', 'High-value treats'],
    setup: 'Dog standing squarely on a non-slip surface. Handler in front at the dog\'s level.',
    steps: [
      'Hold a treat at the dog\'s nose level',
      'Slowly lower the treat straight down toward the ground between the front paws',
      'Encourage the dog to lower the chest while keeping hind end elevated',
      'The ideal position: elbows on ground, hips up (play bow posture)',
      'Hold the position for 3–5 seconds',
      'Lure back to a stand',
      'Repeat 5–8 times per session'
    ],
    good_form: [
      'Elbows touch or near the ground',
      'Hind limbs remain fully extended and weight-bearing',
      'Spine forms a gentle slope from hip to chest',
      'Dog is relaxed in the position — not tense'
    ],
    common_mistakes: [
      'Dog going into a full down instead of play bow',
      'Lure moving too far forward — dog walks into it',
      'Hind limbs bending (collapsing into a down)',
      'Not holding the position long enough'
    ],
    red_flags: [
      'Inability to lower chest without hind limbs collapsing',
      'Pain in the forelimbs on lowering (elbow issue)',
      'Spinal rigidity preventing the bow shape',
      'Trembling in hind limbs during the hold'
    ],
    progression: 'Increase hold to 10 seconds. Alternate play bow and stand rapidly. Perform on a gentle decline surface.',
    contraindications: 'Elbow dysplasia (acute), forelimb fracture, severe thoracolumbar pain, carpal instability',
    difficulty_level: 'Easy'
  },

  {
    code: 'AF_CAT_STRETCH',
    name: 'Cat Stretch',
    category: 'Athletic Foundations',
    description: 'Spinal flexion and extension stretch mimicking the feline arching and sagging posture. Mobilizes the thoracolumbar spine, stretches the ventral and dorsal trunk musculature, and promotes intervertebral segmental motion.',
    equipment: ['Non-slip surface', 'Treats', 'Gentle manual guidance (optional)'],
    setup: 'Dog standing squarely on a non-slip surface. Handler kneels beside the dog.',
    steps: [
      'Place one hand gently under the dog\'s abdomen',
      'Lure the dog\'s head downward between the front legs — spine rounds upward (flexion)',
      'Hold the rounded posture for 3 seconds',
      'Then lure the head upward and slightly forward — spine sags gently (extension)',
      'Hold the extended posture for 3 seconds',
      'Alternate between flexion and extension smoothly',
      'Perform 5–8 cycles per session'
    ],
    good_form: [
      'Visible spinal curvature change between flexion and extension',
      'All four limbs remain planted and still',
      'Smooth transition between positions',
      'Dog remains relaxed throughout'
    ],
    common_mistakes: [
      'Forcing the spine into position with manual pressure',
      'Dog stepping forward during extension',
      'Insufficient range — not achieving visible curvature',
      'Moving through positions too quickly'
    ],
    red_flags: [
      'Pain or vocalization during spinal flexion or extension',
      'Muscle guarding or rigidity',
      'Loss of balance during the stretch',
      'Inability to achieve flexion or extension'
    ],
    progression: 'Increase hold to 5 seconds. Perform on gentle incline. Combine with lateral flexion (cookie stretch) in a flow sequence.',
    contraindications: 'Disc herniation, spinal fracture, spondylosis with bridging, post-hemilaminectomy (first 8 weeks)',
    difficulty_level: 'Easy'
  },

  {
    code: 'AF_SPINE_STRETCH',
    name: 'Spine Stretch',
    category: 'Athletic Foundations',
    description: 'Sustained longitudinal spinal traction stretch achieved through a gentle play bow with forelimb walk-out. Decompresses intervertebral spaces, stretches the longissimus dorsi and multifidus muscles, and elongates the ventral abdominal fascia.',
    equipment: ['Non-slip surface', 'High-value treats'],
    setup: 'Dog standing on a non-slip surface. Handler in front with treats.',
    steps: [
      'Lure the dog into a play bow position',
      'Slowly draw the treat forward along the ground',
      'Encourage the dog to walk the front paws forward while hips stay elevated',
      'The dog stretches into a long, low position with maximal spinal elongation',
      'Hold the fully elongated position for 5 seconds',
      'Slowly lure back to standing',
      'Repeat 3–5 times per session'
    ],
    good_form: [
      'Gradual elongation — not a sudden drop',
      'Hind limbs remain extended and weight-bearing',
      'Spine in a long, neutral-to-extended line',
      'Dog relaxes into the stretch'
    ],
    common_mistakes: [
      'Dog collapsing into a full down',
      'Stretching too far too fast',
      'Hind limbs sliding backward on slippery surface',
      'Not holding the elongated position'
    ],
    red_flags: [
      'Pain during spinal elongation',
      'Muscle tremoring in the paraspinals',
      'Inability to maintain the position',
      'Hind limb weakness or buckling'
    ],
    progression: 'Increase hold to 10 seconds. Gently rock side-to-side in the stretched position. Perform on gentle decline.',
    contraindications: 'Acute disc disease, spinal instability, vertebral fracture, post-spinal surgery (first 10 weeks)',
    difficulty_level: 'Easy'
  },

  {
    code: 'AF_PASSIVE_ROM',
    name: 'Passive Range of Motion',
    category: 'Athletic Foundations',
    description: 'Manual joint mobilization through available range by the handler or therapist. Applied to all major appendicular joints to maintain flexibility, prevent contracture, and assess joint health. Fundamental to any rehabilitation program.',
    equipment: ['Soft padded surface', 'Treats for calming', 'Towel for limb support'],
    setup: 'Dog in lateral recumbency on a padded surface. Affected limb accessible. Handler positioned beside the dog.',
    steps: [
      'Begin with the most distal joint (digits) and work proximally',
      'Gently flex the joint to comfortable end range — hold 5 seconds',
      'Slowly extend the joint to comfortable end range — hold 5 seconds',
      'Repeat flexion-extension cycle 10–15 times per joint',
      'Progress to the next proximal joint (carpus/tarsus, elbow/stifle, shoulder/hip)',
      'Note any crepitus, decreased range, or pain response',
      'Perform on all affected limbs, 1–2 sessions per day'
    ],
    good_form: [
      'Slow, smooth, controlled movements',
      'Dog remains relaxed — no muscle guarding',
      'Consistent range achieved across repetitions',
      'Supporting the limb weight throughout'
    ],
    common_mistakes: [
      'Moving too rapidly through range',
      'Forcing past comfortable end range',
      'Not stabilizing the proximal joint segment',
      'Skipping joints in the kinetic chain'
    ],
    red_flags: [
      'Vocalization or biting attempts during ROM',
      'Audible crepitus or joint clicking',
      'Progressive loss of range over sessions',
      'Swelling or heat in the joint post-session'
    ],
    progression: 'Increase reps to 20. Add gentle overpressure at end range. Include circumduction. Progress to active-assisted ROM.',
    contraindications: 'Unstable fracture, joint luxation, severe acute inflammation, within 24 hours of joint surgery (unless directed)',
    difficulty_level: 'Easy'
  },


  // ========================================
  // ENDURANCE (6 exercises)
  // ========================================

  {
    code: 'AF_TROT_ON_LEASH',
    name: 'Trot on Leash',
    category: 'Athletic Foundations',
    description: 'Controlled leash trotting at a sustained pace to build cardiovascular endurance, improve gait symmetry, and condition the musculoskeletal system. The trot is the preferred gait for rehabilitation assessment as it is a symmetrical, diagonal gait pattern.',
    equipment: ['4–6 foot fixed leash (not retractable)', 'Flat collar or harness', 'Flat, even surface'],
    setup: 'Dog on leash at handler\'s side. Flat, even surface such as sidewalk, packed trail, or firm grass. Warm up with 5 minutes of walking first.',
    steps: [
      'Begin with a 5-minute walking warm-up',
      'Increase pace to a trot — handler may need to jog',
      'Maintain a steady, rhythmic trot for the prescribed duration',
      'Start with 5 minutes of trotting for deconditioned dogs',
      'Monitor gait for symmetry and lameness',
      'Cool down with 5 minutes of walking',
      'Gradually increase trot duration by 2 minutes per week'
    ],
    good_form: [
      'Symmetrical diagonal gait pattern',
      'Head carriage level and relaxed',
      'Consistent pace without surging or lagging',
      'Even stride length front and rear'
    ],
    common_mistakes: [
      'Starting at a trot without warm-up',
      'Pace too fast — dog cantering instead of trotting',
      'Using a retractable leash (no pace control)',
      'Trotting on hard pavement exclusively (joint stress)'
    ],
    red_flags: [
      'Gait asymmetry that worsens during the session',
      'Excessive panting disproportionate to exertion',
      'Bunny hopping at the trot',
      'Reluctance to maintain the trotting pace'
    ],
    progression: 'Increase duration by 2 minutes weekly (max 30 min). Add gentle hills. Incorporate interval trot-walk-trot patterns.',
    contraindications: 'Acute lameness, cardiac disease (without veterinary clearance), brachycephalic breeds in warm conditions, post-surgical activity restrictions',
    difficulty_level: 'Easy'
  },

  {
    code: 'AF_TREADMILL',
    name: 'Treadmill',
    category: 'Athletic Foundations',
    description: 'Controlled walking or trotting on a motorized or manual treadmill for consistent-pace cardiovascular conditioning. Allows precise speed control, eliminates terrain variables, and enables indoor training regardless of weather. Facilitates gait analysis during exercise.',
    equipment: ['Canine or human treadmill', 'Side rails or leash attachment point', 'Non-slip treadmill belt', 'Treats'],
    setup: 'Introduce the treadmill while OFF first. Allow the dog to stand on the stationary belt. Secure with a short leash to an overhead point — never around the neck unattended.',
    steps: [
      'Start with the dog standing on the stationary belt with treats',
      'Turn on the treadmill at the slowest speed setting',
      'Allow the dog to find its rhythm at a slow walk (1–2 mph)',
      'Gradually increase speed to a comfortable walk or slow trot',
      'Maintain for 5 minutes initially',
      'Slowly decrease speed to a stop',
      'Always have a handler present — never leave a dog on a treadmill unattended'
    ],
    good_form: [
      'Dog walking in the center of the belt',
      'Relaxed gait — not bracing or fearful',
      'Consistent stride matching belt speed',
      'Tail and head in neutral, relaxed position'
    ],
    common_mistakes: [
      'Speed too fast for the dog\'s fitness level',
      'Forcing a fearful dog onto the moving belt',
      'Leaving the dog unattended on the treadmill',
      'No warm-up or cool-down period'
    ],
    red_flags: [
      'Dog straddling the belt edges',
      'Panicking, scrambling, or freezing',
      'Gait deterioration as fatigue develops',
      'Paw pad burns from belt friction'
    ],
    progression: 'Increase speed incrementally (0.5 mph per week). Increase duration to 15–20 minutes. Add slight incline for hind limb loading.',
    contraindications: 'Fearful or anxious dogs (desensitize first), cardiac disease without clearance, severe orthopedic instability, brachycephalic breeds (monitor closely)',
    difficulty_level: 'Moderate'
  },

  {
    code: 'AF_PULL_SCOOTER',
    name: 'Pull a Scooter',
    category: 'Athletic Foundations',
    description: 'Controlled draft work where the dog pulls a person on a kick scooter at a trot. Provides sustained cardiovascular and musculoskeletal loading through harness-driven forward propulsion. Engages the chest, shoulders, core, and hind limb drive chain.',
    equipment: ['Well-fitted pulling harness (NOT collar)', 'Kick scooter with brakes', 'Bungee line attachment (shock absorption)', 'Flat, smooth surface'],
    setup: 'Fit the dog with a proper pulling harness distributing force across the chest. Attach bungee line from harness to scooter. Flat surface, low traffic area.',
    steps: [
      'Begin with the dog walking in harness — no pull load',
      'Step onto scooter and allow the dog to set the pace',
      'Use verbal cues for direction (gee/haw or left/right)',
      'Start with 5–10 minutes of light pulling',
      'Use scooter brakes to reduce load if dog tires',
      'Cool down with 5 minutes of walking',
      'Check harness fit and paw pads post-session'
    ],
    good_form: [
      'Leaning into harness with chest — not pulling from neck',
      'Steady, sustainable trotting pace',
      'Straight-line pulling without zigzagging',
      'Responsive to directional and stop cues'
    ],
    common_mistakes: [
      'Using a collar instead of a harness',
      'Rider adding too much resistance (dragging feet)',
      'Running on hot pavement',
      'No shock-absorbing bungee line (jarring stops)'
    ],
    red_flags: [
      'Dog slowing significantly or stopping',
      'Limping during or after the session',
      'Excessive panting or drooling',
      'Harness rub marks or skin abrasion'
    ],
    progression: 'Increase duration to 20 minutes. Add gentle inclines. Increase rider weight (within dog\'s pull capacity).',
    contraindications: 'Dogs under 30 lbs, cervical disease, shoulder injury, cardiac or respiratory disease, extreme heat, orthopedic instability',
    difficulty_level: 'Advanced'
  },

  {
    code: 'AF_TROT_POWERED_SCOOTER',
    name: 'Trot Behind a Powered Scooter',
    category: 'Athletic Foundations',
    description: 'Controlled trotting alongside or behind a slow-moving powered scooter for sustained cardiovascular conditioning. The scooter sets a consistent pace, allowing the handler to focus on monitoring gait quality. The dog is NOT pulling — it is pacing alongside.',
    equipment: ['Low-speed electric scooter or golf cart', 'Standard leash and harness', 'Flat, traffic-free surface', 'Water for hydration'],
    setup: 'Dog on leash attached to handler (NOT to the scooter). Handler rides the scooter at a slow, steady speed matching the dog\'s natural trot. Traffic-free area only.',
    steps: [
      'Warm up with 5 minutes of walking',
      'Set scooter to a speed matching the dog\'s comfortable trot (4–6 mph)',
      'Dog trots alongside on leash — handler holds leash by hand',
      'Maintain for 10 minutes initially',
      'Monitor gait quality continuously',
      'Stop for water breaks every 5–10 minutes in warm weather',
      'Cool down with 5 minutes of walking'
    ],
    good_form: [
      'Symmetrical trot alongside the scooter',
      'Dog maintains position without pulling ahead or lagging',
      'Relaxed head carriage',
      'Consistent pace throughout the session'
    ],
    common_mistakes: [
      'Speed too fast for the dog\'s fitness level',
      'Leash attached to the scooter (dangerous)',
      'Trotting on hot pavement',
      'No rest breaks on longer sessions'
    ],
    red_flags: [
      'Dog falling behind the scooter pace',
      'Gait deterioration or lameness emerging',
      'Excessive panting, drooling, or tongue discoloration',
      'Dog attempting to stop or lie down'
    ],
    progression: 'Increase duration to 20–30 minutes. Add gentle elevation changes. Alternate trot and walk intervals.',
    contraindications: 'Cardiac or respiratory disease, brachycephalic breeds, extreme heat, acute lameness, fearful or reactive dogs near motorized vehicles',
    difficulty_level: 'Advanced'
  },

  {
    code: 'AF_INLINE_SKATING_TROT',
    name: 'Trot with a Person Inline Skating',
    category: 'Athletic Foundations',
    description: 'Sustained trotting alongside a handler on inline skates for cardiovascular endurance training. The skating handler can match the dog\'s natural trot speed efficiently. Provides an extended, consistent-pace cardiovascular workout on smooth surfaces.',
    equipment: ['Inline skates with brakes', 'Hands-free waist leash system', 'Dog harness', 'Smooth, flat surface', 'Protective gear for handler'],
    setup: 'Handler in inline skates with protective gear. Dog in a well-fitted harness attached to a hands-free waist belt with bungee shock absorber. Smooth, flat, traffic-free path.',
    steps: [
      'Warm up with 5 minutes of walking (handler in shoes)',
      'Handler transitions to skates — begin at a slow glide pace',
      'Allow the dog to set the initial pace',
      'Gradually settle into a steady trot (5–8 mph)',
      'Maintain for 10–15 minutes initially',
      'Stop for hydration every 10 minutes',
      'Cool down with 5 minutes of walking'
    ],
    good_form: [
      'Dog trotting steadily alongside — not pulling',
      'Handler maintaining controlled, predictable speed',
      'Dog on consistent side (left by convention)',
      'Smooth, rhythmic gait without surging'
    ],
    common_mistakes: [
      'Handler cannot brake effectively — dangerous',
      'Rough or uneven surface causing stumbles',
      'Dog pulling handler into traffic or obstacles',
      'No warm-up or cool-down'
    ],
    red_flags: [
      'Dog attempting to chase squirrels or other dogs while handler on skates',
      'Pad abrasion on rough pavement',
      'Gait asymmetry or limping',
      'Handler losing control of the dog'
    ],
    progression: 'Increase duration to 30 minutes. Add gentle hills. Include interval training (trot-walk-trot cycles).',
    contraindications: 'Reactive or dog-aggressive dogs, handler inexperienced on skates, hot pavement, cardiac or respiratory disease, brachycephalic breeds, acute lameness',
    difficulty_level: 'Advanced'
  },

  {
    code: 'AF_SWIM_LONG_DISTANCE',
    name: 'Swim Long Distances',
    category: 'Athletic Foundations',
    description: 'Sustained open-water or pool swimming for cardiovascular endurance and full-body conditioning. Swimming is a non-weight-bearing exercise that provides resistance through all limbs while eliminating concussive joint forces, making it ideal for conditioning without joint stress.',
    equipment: ['Canine life vest (required)', 'Safe body of water (pool, lake, calm river)', 'Long line for safety', 'Towels', 'Fresh water for drinking'],
    setup: 'Dog fitted with a properly sized canine life vest. Water temperature between 24–28°C (75–82°F) is ideal. Gradual entry point available. Handler in water or at water\'s edge with safety line.',
    steps: [
      'Fit life vest and allow the dog to enter the water gradually',
      'Encourage swimming with a floating toy or gentle guidance',
      'Start with 5 minutes of continuous swimming',
      'Provide a rest break (standing in shallows or exiting) every 5 minutes',
      'Monitor swimming form — all four limbs should be active',
      'Gradually increase swim duration by 2–3 minutes per week',
      'Towel dry thoroughly post-swim, check ears for water retention'
    ],
    good_form: [
      'All four limbs actively paddling',
      'Body position horizontal in the water (not vertical)',
      'Rhythmic, efficient stroke pattern',
      'Head above water line with relaxed breathing'
    ],
    common_mistakes: [
      'No life vest — unsafe regardless of swimming ability',
      'Water too cold causing hypothermia risk',
      'Swimming too long in early sessions',
      'Not monitoring for fatigue (dog sinking lower in water)'
    ],
    red_flags: [
      'Dog sinking lower in the water (fatigue)',
      'Only paddling with front limbs (hind limb weakness)',
      'Panicking, splashing excessively, or vocalizing',
      'Shivering, pale gums, or lethargy (hypothermia)',
      'Water aspiration — coughing during or after swimming'
    ],
    progression: 'Increase swim duration to 20–30 minutes. Add current resistance (gentle stream). Include interval sprints within the session.',
    contraindications: 'Open wounds or skin infections, ear infections, dogs unable to swim, cardiac or respiratory disease, brachycephalic breeds (extreme caution), water temperature below 20°C',
    difficulty_level: 'Advanced'
  }

];

module.exports = ATHLETIC_FOUNDATIONS;
