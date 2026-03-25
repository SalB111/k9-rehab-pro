// ============================================================================
// EXERCISES PART 13 — FELINE REHABILITATION LIBRARY
// © 2025 Salvatore Bonanno. All rights reserved. Proprietary.
// K9 Rehab Pro™ | B.E.A.U. Engine — Small Animal Expansion
// ============================================================================
// Clinical Authority:
//   Drum MG, Bockstahler B, Levine D, Marcellin-Little DJ (2015)
//   Feline Rehabilitation. Vet Clin North Am Small Anim Pract 45(1):185-201
//   Sharp B (2012) Feline Physiotherapy & Rehabilitation. JFMS 14:622-645
//   Goldberg ME (2025) Physical Rehabilitation of Cats. JFMS 27(7)
//
// Core Feline Principle (Drum/Levine 2015):
//   ALL therapeutic exercises must link to HUNTING, PLAYING, or FEEDING.
//   Sessions shorter than canine. Tactful, low-stress approach mandatory.
//   Cats respond to manipulation of prey drive, not repetitive commands.
//
// Pain Assessment Authority:
//   FGS (acute): 5 AUs, 0-10 scale, threshold ≥4
//   FMPI (chronic DJD): 17 items, 0-4 scale
//   UNESP-Botucatu: post-operative acute pain
// ============================================================================

const FELINE_REHAB_EXERCISES = [

  // ──────────────────────────────────────────────────────────────────────────
  // 1. FELINE PASSIVE ROM
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: 'FELINE_PROM',
    name: 'Feline Passive Range of Motion',
    category: 'Manual Therapy',
    difficulty_level: 'Easy',
    description: 'Gentle passive flexion/extension of feline joints. Cats tolerate PROM best when relaxed; begin only after stroking massage to achieve tissue relaxation. Critical post-op (start day 1), post-IVDD, and post-FATE neurological recovery. Maintains joint nutrition, prevents contracture, and preserves ROM during non-weight-bearing phases.',
    equipment: ['Padded surface at handler height', 'Optional: heated pad under towel'],
    setup: 'Cat in lateral recumbency on padded surface. Apply 2-3 min stroking massage first to induce relaxation. Never force — feline joints have dramatically different ROM than dogs.',
    steps: [
      'After stroking massage, support proximal limb segment with one hand',
      'With distal hand, move joint through available range ONLY to first point of resistance — never force',
      'Hold end-range for 3-5 seconds (shorter than canine — cats do not tolerate long holds)',
      'Return to neutral. Pause 2-3 seconds. Repeat 5-8 repetitions per joint',
      'Move to next joint. Total session: 10-15 minutes maximum',
      'Priority joint order: most affected joint first while cat is most relaxed',
      'Offer treat reward intermittently (every 2-3 reps) to maintain compliance'
    ],
    good_form: [
      'Cat remains relaxed — no vocalization, no muscle guarding, no tail lashing',
      'Movements smooth and slow — not bouncy or forced',
      'Always palpate for heat or crepitus before beginning — modify if present',
      'Proximal segment stabilized throughout — prevents compensation'
    ],
    red_flags: [
      'Vocalization or hissing — stop immediately, reassess FGS pain score',
      'Muscle guarding (tensing against movement) — pain is present, reduce range',
      'Swatting or biting — session too long or painful, end session',
      'Post-session increased stiffness — technique too aggressive'
    ],
    contraindications: 'Acute fracture (unstabilized), joint luxation (unreduced), open wounds over joint, acute infection, fever',
    progression: 'Progress to FELINE_WAND_AROM when cat tolerates full passive ROM without guarding.',
    clinical_classification: {
      primary_indications: ['FELINE_OA', 'FELINE_IVDD_CAT', 'FELINE_POST_FRACTURE_CAT', 'FELINE_FATE_RECOVERY', 'FELINE_NEURO_CAT'],
      rehab_phases: ['ACUTE', 'SUBACUTE'],
      intervention_type: 'MANUAL_THERAPY',
      evidence_grade: 'B',
      species: 'FELINE',
      authority: 'Drum/Bockstahler/Levine/Marcellin-Little 2015; Sharp 2012'
    }
  },


  // ──────────────────────────────────────────────────────────────────────────
  // 2. FELINE STROKING & KNEADING MASSAGE
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: 'FELINE_MASSAGE',
    name: 'Feline Therapeutic Massage (Stroking & Kneading)',
    category: 'Manual Therapy',
    difficulty_level: 'Easy',
    description: 'Two-phase massage protocol: stroking (effleurage) to relax and reduce sympathetic tone, followed by kneading (petrissage) to increase circulation and reduce muscle tension in paraspinal, gluteal, and limb musculature. Most widely tolerated manual therapy in cats. Foundation technique — precedes all other manual and exercise interventions. Pain and disuse cause considerable muscle tension in feline patients (Drum et al. 2015).',
    equipment: ['Padded surface', 'Quiet room — no dogs, minimal noise'],
    setup: 'Cat can be in any comfortable position. Do not force restraint. Allow cat to choose sternal, lateral, or standing position. A relaxed cat on their own terms will tolerate far longer sessions.',
    steps: [
      'PHASE 1 — STROKING (3-5 min): Long, slow strokes from neck to tail base and down limbs',
      'Maintain light-to-moderate pressure — enough to feel superficial muscle, not skin alone',
      'Rhythmic, continuous strokes. Speed: approx one stroke per 3-4 seconds',
      'Observe cat: purring, slow blinking, limb relaxation = correct',
      'PHASE 2 — KNEADING (3-5 min): Gentle compression and release of paraspinal muscles',
      'Target areas: paraspinal muscles bilaterally, gluteals, biceps femoris, triceps',
      'Kneading technique: thumb and first 2 fingers, rhythmic squeeze-release 1-2/second',
      'Feline musculature is small — use fingertip pressure only, not full hand grip',
      'Finish with return to stroking for 1-2 min to calm nervous system'
    ],
    good_form: [
      'Cat is visibly relaxed — may groom self (stress signal if excessive)',
      'Paraspinal kneading should be bilateral and symmetric',
      'Avoid bony prominences — spinous processes, scapular spine, greater trochanter',
      'Total session duration: 10-15 min for initial sessions, up to 20 min once trust established'
    ],
    red_flags: [
      'Cat attempts to leave — let them. Do not force restraint',
      'Skin rippling or twitching (feline hyperesthesia sign) — stop, reassess',
      'Excessive grooming immediately after — stress response, session too long'
    ],
    contraindications: 'Acute inflammation/infection, open wounds, suspected fracture, neoplasia overlying area, feline hyperesthesia syndrome (active episode)',
    progression: 'Combine as warm-up before all active exercise sessions. Also use post-session for cool-down.',
    clinical_classification: {
      primary_indications: ['FELINE_OA', 'FELINE_OA_AXIAL', 'FELINE_IVDD_CAT', 'FELINE_NEURO_CAT', 'FELINE_POST_FRACTURE_CAT'],
      rehab_phases: ['ACUTE', 'SUBACUTE', 'CHRONIC'],
      intervention_type: 'MANUAL_THERAPY',
      evidence_grade: 'B',
      species: 'FELINE',
      authority: 'Sharp 2012 Part 1; Drum et al. 2015; Goldberg 2025'
    }
  },


  // ──────────────────────────────────────────────────────────────────────────
  // 3. FELINE ACTIVE ROM — WAND/FEATHER TOY TARGETING
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: 'FELINE_WAND_AROM',
    name: 'Feline Active ROM — Wand & Feather Prey Targeting',
    category: 'Active Assisted',
    difficulty_level: 'Easy',
    description: 'Uses prey-drive stimulation (feather wand, laser pointer, toy mouse) to elicit voluntary active joint movement. The Drum/Levine principle: cats will not comply with repetitive command-based exercise — but will perform the exact same movements spontaneously when hunting/playing. Feather wand targeting promotes swatting (shoulder/elbow/carpal AROM), grasping (digit flexion), stalking (controlled weight shift and gait), and pouncing (hip/stifle/hock engagement). Hands-off rehabilitation.',
    equipment: ['Feather wand (preferred)', 'Toy mouse on string', 'Laser pointer (use sparingly — can cause frustration)', 'Optional: treat dispensing toy'],
    setup: 'Cat standing or in any comfortable position. Handler controls wand to direct movement specifically targeting affected joints. Session: 2-5 minutes active play, multiple sessions per day.',
    steps: [
      'Begin with wand movement that targets the most affected joint',
      'For shoulder/forelimb ROM: position wand at head height, move laterally — cat swats',
      'For hip/hindlimb ROM: position wand at floor level, move away — cat stalks and pounces',
      'For cervical ROM: position wand above head moving side-to-side — cat tracks with neck',
      'For carpal/tarsal ROM: drag wand along floor level — cat bats at ground level',
      'Allow 3-5 seconds of active engagement, then pause (rest), then re-stimulate',
      'Total active engagement: 2-5 minutes. Stop before fatigue (panting, lying down)',
      'End on success — reward with treat when cat engages'
    ],
    good_form: [
      'Movement controlled by handler — wand positions joint through therapeutic arc',
      'Cat initiates movement voluntarily — no forced positioning',
      'Rest periods between bouts prevent overexertion',
      'Session ends while cat is still interested — do not run to exhaustion'
    ],
    red_flags: [
      'Limping during or after play — too much intensity, reduce wand movement range',
      'Cat refuses to engage — FGS pain score before session; pain may be undertreated',
      'Post-session stiffness next morning — reduce duration'
    ],
    contraindications: 'Post-op within 24 hours (gentle PROM only), fever, open wounds on affected limb, acute IVDD (day 1-3)',
    progression: 'Progress to FELINE_STAIR_WAND when baseline AROM tolerance established. Increase duration from 2 to 5 min over 2 weeks.',
    clinical_classification: {
      primary_indications: ['FELINE_OA', 'FELINE_POST_FRACTURE_CAT', 'FELINE_IVDD_CAT', 'FELINE_NEURO_CAT'],
      rehab_phases: ['SUBACUTE', 'CHRONIC'],
      intervention_type: 'THERAPEUTIC_EXERCISE',
      evidence_grade: 'B',
      species: 'FELINE',
      authority: 'Drum/Levine 2015; Sharp 2012 Part 2; Goldberg 2025'
    }
  },


  // ──────────────────────────────────────────────────────────────────────────
  // 4. FELINE TREAT-TARGET WEIGHT SHIFTING
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: 'FELINE_TREAT_SHIFT',
    name: 'Feline Treat-Target Weight Shifting',
    category: 'Active Assisted',
    difficulty_level: 'Easy',
    description: 'Controlled weight redistribution onto affected limb(s) using treat positioning. Treat placed at specific positions relative to body axis forces voluntary weight transfer. For hindlimb OA/post-fracture: treat placed behind body plane forces hindlimb loading. For forelimb: treat placed lateral to affected limb at floor height. Equivalent to canine weight-shifting but cats will only comply when a food reward motivates the specific body position. Builds proprioception, muscle activation, and limb confidence.',
    equipment: ['High-value treats (small, smelly: tuna, chicken, commercial cat treats)', 'Anti-slip surface (yoga mat, rubber mat)', 'Treat dispensing toy (optional — extends engagement)'],
    setup: 'Cat standing on non-slip surface. Handler kneels to cat level. Assess that cat is weight-bearing on all 4 limbs before beginning. Do not force standing if cat is non-weight-bearing.',
    steps: [
      'HINDLIMB LOADING: Hold treat at nose level, then slowly move behind cat at hindquarter height',
      'As cat reaches back for treat, weight shifts onto hindlimbs — hold treat position 3-5 seconds',
      'FORELIMB LOADING: Hold treat at nose level, then slowly move treat 45° lateral to affected forelimb side',
      'Cat shifts weight toward affected side — reward immediately when weight shift occurs',
      'LATERAL LOADING: Move treat laterally at chest height — cat leans into affected limb',
      'Each direction: 5-8 reps with 5-second hold, 2 sets per session',
      'Entire session: 5-8 minutes maximum — feline attention span is short'
    ],
    good_form: [
      'Cat voluntarily shifts — never physically pushed or repositioned',
      'Non-slip mat prevents falls — critical for OA cats with reduced proprioception',
      'Weight shift held for 3-5 seconds minimum before releasing treat',
      'Handler observes limb symmetry — note if cat consistently avoids affected side'
    ],
    red_flags: [
      'Cat collapses onto affected limb suddenly — pain response or weakness, stop',
      'Cat consistently refuses to load affected side — pain reassessment required',
      'Trembling or shaking when weight-bearing — possible severe weakness, escalate to vet'
    ],
    contraindications: 'Non-weight-bearing acute fracture, post-op day 0-1, suspected joint instability',
    progression: 'Progress to FELINE_THREE_LEG_STAND when equal voluntary loading observed bilaterally.',
    clinical_classification: {
      primary_indications: ['FELINE_OA', 'FELINE_POST_FRACTURE_CAT', 'FELINE_FATE_RECOVERY', 'FELINE_NEURO_CAT'],
      rehab_phases: ['SUBACUTE', 'CHRONIC'],
      intervention_type: 'THERAPEUTIC_EXERCISE',
      evidence_grade: 'B',
      species: 'FELINE',
      authority: 'Sharp 2012 Part 2; Drum et al. 2015'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 5. FELINE THREE-LEGGED STANDING BALANCE
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: 'FELINE_THREE_LEG',
    name: 'Feline Three-Legged Standing Balance',
    category: 'Balance & Proprioception',
    difficulty_level: 'Moderate',
    description: 'Progressive single-limb loading exercise. One limb lifted gently while cat maintains 3-point stance, increasing load through the remaining 3 limbs (and specifically the contralateral limb to the lifted one). When contralateral hindlimb is lifted, the affected hindlimb must bear full unilateral hind weight. Sharp (2012) identifies three-legged standing as a key balance progression for feline patients once basic weight-bearing is established.',
    equipment: ['Non-slip surface', 'High-value treats'],
    setup: 'Cat standing on non-slip surface. Handler ready with treat. This is an intermediate exercise — cat must already be voluntarily weight-bearing before attempting.',
    steps: [
      'Begin by gently supporting one non-affected forelimb just slightly off ground (2-3 cm)',
      'Cat must balance on remaining 3 limbs — hold for 5-10 seconds',
      'Reward immediately. Rest 10 seconds. Repeat 3-5 reps',
      'Progress to lifting contralateral hindlimb of affected side — maximum load on affected limb',
      'Use treat positioned to engage cat\'s attention while limb is lifted',
      'Hold 5-10 seconds initially. Progress to 15-20 seconds over 2-3 weeks',
      'Progression: perform on slightly uneven surface (folded towel under mat) for advanced version'
    ],
    good_form: [
      'Lifted limb held just off surface — not raised high (triggers escape)',
      'Cat remains standing — does not sit or lie down',
      'Weight transfer visible on affected limb',
      'Handler prepared to release instantly if cat vocalizes'
    ],
    red_flags: [
      'Knuckling on affected limb during 3-leg stance — neurological deficit, escalate',
      'Inability to maintain stance for >3 seconds — weakness, regress to weight shifting'
    ],
    contraindications: 'Non-ambulatory patients, post-op <2 weeks, active joint effusion',
    progression: 'Progress to FELINE_WOBBLE for unstable surface challenge.',
    clinical_classification: {
      primary_indications: ['FELINE_OA', 'FELINE_POST_FRACTURE_CAT', 'FELINE_NEURO_CAT'],
      rehab_phases: ['SUBACUTE', 'CHRONIC'],
      intervention_type: 'THERAPEUTIC_EXERCISE',
      evidence_grade: 'B',
      species: 'FELINE',
      authority: 'Sharp 2012 Part 2; Goldberg 2025'
    }
  },


  // ──────────────────────────────────────────────────────────────────────────
  // 6. FELINE UNSTABLE SURFACE — BEAN BAG / WOBBLE CUSHION
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: 'FELINE_WOBBLE',
    name: 'Feline Unstable Surface Balance (Bean Bag / Wobble Cushion)',
    category: 'Balance & Proprioception',
    difficulty_level: 'Moderate',
    description: 'Static and dynamic balance training on compliant/unstable surfaces. Bean bags, low wobble cushions, or a pillow under a non-slip mat. Feline patients adapt proprioceptive responses rapidly on unstable surfaces — Sharp (2012) identifies bean bags and trampolines as primary balance tools for cats. Improves static balance, recruits stabilizer muscles across all limbs, and enhances spinal proprioception. Critical for geriatric OA cats and post-neurological recovery.',
    equipment: ['Small bean bag or pillow', 'Folded yoga mat over foam', 'Non-slip surface on top of unstable base', 'High-value treats'],
    setup: 'Begin with mildly compliant surface (folded blanket over foam mat). Progress to bean bag. Cat must be able to stand on flat surface before introducing instability.',
    steps: [
      'Place mild instability surface (folded blanket) on floor',
      'Lure cat onto surface with treat trail leading to surface center',
      'Once cat standing on surface: offer treat at nose height — does not require movement',
      'Duration: 10-30 seconds initially. Cat may choose to leave — allow this',
      'Progress: use higher bean bag or thicker foam for more instability challenge',
      'Advanced: use wand to encourage dynamic weight shifting while on unstable surface',
      'Session: 2-3 trials per session, 5-10 minutes total'
    ],
    good_form: [
      'Cat enters and stands voluntarily — never placed forcibly on unstable surface',
      'Core engagement visible — slight abdominal tensing',
      'Paws make natural weight-adjusting micro-movements on surface'
    ],
    red_flags: [
      'Cat loses balance completely — surface too challenging, regress',
      'Knuckling or toe-dragging on surface — neurological assessment required'
    ],
    contraindications: 'Non-ambulatory, post-op <3 weeks, severe vestibular disease',
    progression: 'Combine with FELINE_WAND_AROM for dynamic challenge on unstable surface.',
    clinical_classification: {
      primary_indications: ['FELINE_OA', 'FELINE_NEURO_CAT', 'FELINE_IVDD_CAT'],
      rehab_phases: ['SUBACUTE', 'CHRONIC'],
      intervention_type: 'THERAPEUTIC_EXERCISE',
      evidence_grade: 'B',
      species: 'FELINE',
      authority: 'Sharp 2012 Part 1 (bean bags/trampolines); Goldberg 2025'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 7. FELINE CAVALETTI / STEP-OVER RAILS (CAT SCALE)
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: 'FELINE_CAVALETTI',
    name: 'Feline Cavaletti Rails (Cat-Scale)',
    category: 'Balance & Proprioception',
    difficulty_level: 'Moderate',
    description: 'Cat-scaled cavaletti rails positioned to promote deliberate foot placement, increase joint flexion at walk, and re-educate proprioceptive gait patterns. Cat scale: rails 2-4 cm height (wooden dowels, rulers, rolled towels), spaced 10-15 cm apart (feline stride length). Lure with treat trail or wand through rails. Functional equivalent of canine cavaletti but scaled and wand-motivated. Improves hip/stifle/hock flexion in OA, re-educates foot placement in neuro patients.',
    equipment: ['4-6 wooden dowels (1 cm diameter)', 'OR 4-6 rulers', 'OR rolled towels', 'Non-slip mat to lay rails on', 'Treat trail (small pieces)', 'Feather wand optional'],
    setup: 'Lay 4-6 rails on non-slip mat. Spacing: 10-15 cm apart (adjust to patient stride length). Height: 2-4 cm. Create treat trail through entire rail sequence before cat approaches.',
    steps: [
      'Lay treat trail through all rails before cat approaches — one treat at each rail gap',
      'Allow cat to walk through under their own motivation following treats',
      'Use wand alternatively: drag feather wand through rails at cat nose height',
      'Normal walking pace preferred — not rushing. Slow deliberate foot placement = therapeutic',
      'Direction: walk through in one direction, rest, then return through same rails',
      'Reps: 3-5 passes per session. Multiple short sessions throughout day preferred',
      'Progress: raise rail height from 2 cm → 4 cm over 2-3 weeks'
    ],
    good_form: [
      'Each paw placed deliberately between rails — not stepping on rails',
      'Consistent visible hip/stifle/hock flexion with each step',
      'No rushing or jumping over rails (reduce spacing if this occurs)'
    ],
    red_flags: [
      'Knuckling through rails — neurological, reassess gait',
      'Consistently stepping on rails despite spacing — adjust spacing to match stride'
    ],
    contraindications: 'Non-ambulatory, post-op fracture <6 weeks, severe joint effusion',
    progression: 'Progress to angled or inclined cavaletti approach for hip extensor strengthening.',
    clinical_classification: {
      primary_indications: ['FELINE_OA', 'FELINE_IVDD_CAT', 'FELINE_NEURO_CAT', 'FELINE_POST_FRACTURE_CAT'],
      rehab_phases: ['SUBACUTE', 'CHRONIC'],
      intervention_type: 'THERAPEUTIC_EXERCISE',
      evidence_grade: 'B',
      species: 'FELINE',
      authority: 'Sharp 2012 Part 2; Drum et al. 2015'
    }
  },


  // ──────────────────────────────────────────────────────────────────────────
  // 8. FELINE STAIR / STEP REINTEGRATION WITH WAND
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: 'FELINE_STAIR_WAND',
    name: 'Feline Stair & Step Reintegration (Wand-Guided)',
    category: 'Functional Training',
    difficulty_level: 'Moderate',
    description: 'Progressive reintroduction to stair climbing using household stairs or platform steps. Sharp (2012) identifies stair use as a primary functional exercise for feline patients — cats are naturally climbing animals and will engage with stairs when wand-motivated. Stair ascent: primarily hip/stifle extensor strengthening (hindlimb push-off). Stair descent: eccentric quadriceps and biceps femoris loading. Also addresses environmental reintegration — a cat that cannot use stairs is functionally impaired in most home environments.',
    equipment: ['Household stairs (2-4 steps minimum)', 'OR single step (books stacked, sturdy box 10-15 cm)', 'Feather wand', 'Treats at top of step'],
    setup: 'Begin with single step (10-15 cm height). Place treat on top of step. Stand at top of step with wand moving at step-top height. Allow cat to approach voluntarily.',
    steps: [
      'ASCENT: Place treat on top of step. Guide with wand held above step-top level',
      'Cat steps up voluntarily — reward immediately upon footing both hindlimbs on step',
      'DESCENT: With cat on step, lower wand to ground level in front of step',
      'Cat steps down voluntarily — controlled descent is the therapeutic component',
      'Begin: 1 step, 3-5 reps ascent + descent per session',
      'Progress: 2 steps, then 3, then full stair flight over 4-6 weeks',
      'Home program: encourage cat to use stairs normally as confidence returns'
    ],
    good_form: [
      'Controlled single-step ascent and descent — not jumping entire flight',
      'All 4 paws placed on step before proceeding (not rushing)',
      'Hindlimbs clearly stepping up and down (not pulling with forelimbs only)'
    ],
    red_flags: [
      'Cat jumps directly to ground rather than stepping down — pain avoidance',
      'Refuses to ascend — reassess pain score, may need analgesia optimization',
      'Limping after stair use — reduce to 1 step, reduce reps'
    ],
    contraindications: 'Post-op fracture involving stifle/hock <8 weeks, grade IV-V neurological deficits, active effusion',
    progression: 'Full stair independence = functional return to normal home environment.',
    clinical_classification: {
      primary_indications: ['FELINE_OA', 'FELINE_POST_FRACTURE_CAT', 'FELINE_NEURO_CAT'],
      rehab_phases: ['CHRONIC'],
      intervention_type: 'THERAPEUTIC_EXERCISE',
      evidence_grade: 'B',
      species: 'FELINE',
      authority: 'Sharp 2012 Part 2; Drum et al. 2015'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 9. FELINE PHYSIO-ROLL ASSISTED STANDING (NEUROLOGICAL)
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: 'FELINE_STAND_ROLL',
    name: 'Feline Physio-Roll Assisted Standing (Neurological)',
    category: 'Neurological Rehabilitation',
    difficulty_level: 'Moderate',
    description: 'Neurological patients (post-IVDD, FATE recovery, paresis/paralysis) may be unable to stand independently. A physio-roll or small rolled towel placed under the abdomen allows standing position without handler physically supporting all weight. Sharp (2012) establishes that feline neurological therapy is most beneficial when initially performed in standing position — maintains natural muscle tone and provides training-specific motor learning for the spinal cord. Critical for sensory feedback from paws and muscles, which has been shown to improve standing ability.',
    equipment: ['Small physio-roll (10-15 cm diameter)', 'OR rolled bath towel in a cylinder shape', 'Non-slip mat', 'Support harness (optional for cats with severe paresis)'],
    setup: 'Patient in standing position. Place physio-roll under abdomen just cranial to hindlimbs. Adjust support level so hindlimbs are on ground with some weight bearing. Handler stabilizes cat at thorax if needed.',
    steps: [
      'Position cat standing with hindlimbs on non-slip mat',
      'Slide physio-roll under abdomen to provide abdominal support for standing',
      'Adjust until cat carries most of their own weight through hindlimbs',
      'Hold position for 10-30 seconds initially, building to 60 seconds',
      'During stance: gently tap/stimulate hindpaw pads to reinforce sensory input to spinal cord',
      'Optionally use wand at cat nose level to encourage active neck/trunk engagement',
      'Progress: gradually reduce roll support as hindlimb strength returns',
      '3-5 reps per session, multiple times daily'
    ],
    good_form: [
      'Hindlimbs bear meaningful weight — not just grazing floor',
      'Roll support is enough to enable standing, not so much that it eliminates effort',
      'Paw stimulation triggers rhythmic stepping motions (central pattern generator activation)'
    ],
    red_flags: [
      'Hindlimbs completely flaccid (no reflex) — LMN lesion, modify for passive only',
      'Signs of pain on spinal palpation — pain management priority before standing exercise'
    ],
    contraindications: 'Spinal instability (pre-surgical IVDD), non-stabilized fracture, acute CHF (FATE with concurrent heart failure)',
    progression: 'Progress to unassisted standing, then FELINE_WOBBLE, then FELINE_CAVALETTI.',
    clinical_classification: {
      primary_indications: ['FELINE_IVDD_CAT', 'FELINE_FATE_RECOVERY', 'FELINE_NEURO_CAT'],
      rehab_phases: ['ACUTE', 'SUBACUTE'],
      intervention_type: 'THERAPEUTIC_EXERCISE',
      evidence_grade: 'B',
      species: 'FELINE',
      authority: 'Sharp 2012 Part 2 (physio-roll, sensory stimulation, standing motor learning)'
    }
  },


  // ──────────────────────────────────────────────────────────────────────────
  // 10. FELINE UWTM — UNDERWATER TREADMILL (FELINE PROTOCOL)
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: 'FELINE_UWTM',
    name: 'Feline Underwater Treadmill (UWTM) — Feline Protocol',
    category: 'Hydrotherapy',
    difficulty_level: 'Advanced',
    description: 'Aquatic exercise for feline patients. Sharp (2012) shows photographic evidence of cats successfully ambulating in UWTM when too weak to support themselves on land — buoyancy enables therapeutic ambulation otherwise impossible. Key differences from canine: (1) Gradual acclimatization required — most cats have never been in water; (2) Shorter sessions (3-5 min initially); (3) Lower water level (to stifle joint — NOT above hip like dogs); (4) Slower belt speed; (5) Handler inside unit or directly adjacent providing continuous contact and reassurance. Comfort is primary — a stressed cat in water is non-therapeutic.',
    equipment: ['Underwater treadmill (feline-appropriate unit)', 'Water temperature: 32-33°C (slightly warmer than canine 29-32°C)', 'Life vest (optional for very anxious cats)', 'Dry, warm towels for post-session'],
    setup: 'Acclimatization session 1: No water — allow cat to explore treadmill chamber dry. Session 2: Fill water to paw level only (5 cm). Session 3+: Gradually raise water toward stifle over multiple sessions. Never proceed if cat shows panic.',
    steps: [
      'SESSION 1 (dry): Cat enters treadmill chamber. No belt movement. Treat reward for entry. 5 min exploration',
      'SESSION 2-3: Fill to paw level (5 cm). No belt. Allow standing in water with continuous treat rewards and handler contact',
      'SESSION 4+: Once cat accepts water to carpal/tarsal level — start belt at LOWEST speed (0.1-0.2 mph)',
      'Gradually raise water to stifle level (NOT above stifle in cats — risk of distress increases dramatically)',
      'Treat reward every 10-15 seconds during belt movement to maintain engagement',
      'Session duration: 3-5 min active belt time initially. Progress to 8-10 min over 3-4 weeks',
      'POST-SESSION: Towel dry immediately. Heated room. Reward with food'
    ],
    good_form: [
      'Cat is calm — ears forward or lateral (not flat), no vocalization',
      'Active stepping observed at all 4 limbs in water',
      'Handler maintains physical contact throughout — reassurance is part of the therapy',
      'Water level to stifle — carpal/tarsal joints flexing in water'
    ],
    red_flags: [
      'Panic, vocalization, attempting to climb out — EXIT IMMEDIATELY. Do not force. Acclimatize more slowly',
      'Hypothermia risk — towel dry immediately post-session, monitor temperature',
      'ANY open wounds, sutures, or skin infections — absolute contraindication'
    ],
    contraindications: 'Open wounds or recent incisions, fever or active infection, cardiac compromise (HCM Stage C/D — ABSOLUTE CONTRAINDICATION as water immersion increases preload), respiratory distress, panic or extreme stress response to water',
    progression: 'When 10 min sessions tolerated well — this is often the ceiling for feline UWTM. Transition to land-based exercises for strength progression.',
    clinical_classification: {
      primary_indications: ['FELINE_OA', 'FELINE_IVDD_CAT', 'FELINE_NEURO_CAT', 'FELINE_POST_FRACTURE_CAT'],
      rehab_phases: ['SUBACUTE', 'CHRONIC'],
      intervention_type: 'HYDROTHERAPY',
      evidence_grade: 'B',
      species: 'FELINE',
      authority: 'Sharp 2012 Part 1 (UWTM photos/evidence); Drum et al. 2015; Goldberg 2025'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 11. FELINE PBMT — PHOTOBIOMODULATION THERAPY (FELINE DOSING)
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: 'FELINE_PBMT',
    name: 'Feline Photobiomodulation Therapy (PBMT) — Feline Dosing Protocol',
    category: 'Therapeutic Modalities',
    difficulty_level: 'Easy',
    description: 'Laser therapy (PBMT) for feline patients. One of the BEST initial therapies for feline pain — non-invasive, generally well-tolerated, and provides analgesia that improves compliance with subsequent manual and exercise interventions (Goldberg 2025). CRITICAL: Feline dosing is LOWER than canine due to less dense soft tissue, thinner skin, smaller treatment areas. Use manufacturer feline protocols or reduce canine dose by 25-30%. Conditions: OA, DLS, fractures, chronic wounds, stomatitis, post-op incision. NEVER perform over thorax in HCM cats without cardiology clearance.',
    equipment: ['Class III or Class IV therapeutic laser (feline protocol available)', 'Protective eyewear (handler and patient)', 'Feline-safe restraint — minimal restraint preferred'],
    setup: 'Quiet room. Cat in comfortable position (lateral recumbency or sternal). Apply FELINE_MASSAGE first to achieve relaxation — PBMT tolerance is dramatically better in relaxed cats. Clip area if dark-coated cat (dark coat absorbs more energy, reduces penetration).',
    steps: [
      'DOSE CALCULATION (feline-specific):',
      '  - Superficial (OA appendicular joint): 4-6 J/cm² (vs. 8-12 J/cm² canine)',
      '  - Deep joint (hip, lumbosacral): 6-8 J/cm²',
      '  - Post-op incision: 1-2 J/cm² (lower than canine due to thinner tissue)',
      '  - Wound healing: 2-4 J/cm²',
      '  - Dark-coated cat: increase dose 25-30% OR clip area',
      'WAVELENGTH: 800-980 nm preferred for deep tissue. 630-660 nm for superficial/skin',
      'TECHNIQUE: Moving continuous contact method at 1-2 cm/second over treatment area',
      'Treat rewards during treatment to maintain compliance',
      'Session: 2-5 min per treatment area. Total session: 5-10 min',
      'FREQUENCY: Acute: every 48 hours x 3-4 sessions. Chronic OA: 2x/week x 4 weeks, then 1x/week maintenance',
      'REMOVE all ultrasound gel immediately post-treatment if using concurrent US therapy'
    ],
    good_form: [
      'Consistent probe-to-skin contact throughout treatment',
      'Continuous slow movement — not stationary (prevents hot spots in thin feline tissue)',
      'Monitor cat comfort continuously — ear position, whisker tension (FGS indicators)'
    ],
    red_flags: [
      'Cat vocalizes or flinches during treatment — possible overheating. Increase movement speed',
      'Skin redness post-treatment — dose too high for this patient. Reduce by 25%'
    ],
    contraindications: 'Eyes (always use protective eyewear), over active neoplasia, over gravid uterus, over thyroid area in hyperthyroid cats (common comorbidity), NEVER over thorax in HCM Stage B2/C/D without cardiac clearance',
    progression: 'PBMT is an enabling therapy — use before exercise sessions to reduce pain and improve compliance.',
    clinical_classification: {
      primary_indications: ['FELINE_OA', 'FELINE_OA_AXIAL', 'FELINE_POST_FRACTURE_CAT', 'FELINE_IVDD_CAT', 'FELINE_NEURO_CAT'],
      rehab_phases: ['ACUTE', 'SUBACUTE', 'CHRONIC'],
      intervention_type: 'THERAPEUTIC_MODALITIES',
      evidence_grade: 'B',
      species: 'FELINE',
      authority: 'Goldberg 2025; Drum et al. 2015; Hochman-Elam et al. 2020 (coat/penetration data)'
    }
  },


  // ──────────────────────────────────────────────────────────────────────────
  // 12. FELINE TENS — TRANSCUTANEOUS ELECTRICAL NERVE STIMULATION
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: 'FELINE_TENS',
    name: 'Feline TENS (Transcutaneous Electrical Nerve Stimulation)',
    category: 'Therapeutic Modalities',
    difficulty_level: 'Moderate',
    description: 'TENS for feline pain management. Drum et al. (2015) and Sharp (2012) both confirm that cats are generally tolerant of electrophysical modalities including TENS and NMES. TENS provides analgesia through gate control mechanism (high frequency) and endorphin release (low frequency). Particularly valuable for cats where NSAIDs are limited or contraindicated (renal disease common comorbidity). Improve analgesia without pharmacological burden — enables better exercise compliance. Small electrode pads required for feline body size.',
    equipment: ['TENS unit with feline-appropriate small pads (2x2 cm)', 'Conductive gel', 'Feline-safe adhesive or elastic bandage to hold leads'],
    setup: 'Cat relaxed (after massage). Clip area lightly if very thick coat. Apply small pads 2-3 cm apart over treatment area. Standard canine pad spacing is too wide for feline anatomy.',
    steps: [
      'FREQUENCY SELECTION:',
      '  - High frequency (80-120 Hz): Gate control analgesia. Duration: 20-30 min',
      '  - Low frequency (2-4 Hz): Endorphin release. Duration: 20-30 min',
      '  - Burst/modulated: Alternate to prevent accommodation',
      'Apply conductive gel. Place small pads (2x2 cm) over affected joint/muscle group',
      'Start intensity at ZERO. Increase slowly until cat shows mild muscle twitch',
      'Feline tolerance of intensity is lower than canine — stop 10-20% below visible twitch threshold',
      'Monitor continuously: ears, whiskers (FGS indicators). Reduce intensity if any discomfort',
      'Duration: 20-30 minutes. Cat can rest comfortably during session',
      'Frequency: Every other day during acute/subacute. 2-3x/week maintenance'
    ],
    good_form: [
      'Visible mild skin sensation (twitching) is NOT required — sensory level sufficient',
      'Cat remains relaxed throughout — may sleep during session',
      'Pads firmly adhered — poor contact creates hot spots'
    ],
    red_flags: [
      'Cat tries to remove pads — too much intensity, reduce',
      'Skin redness at pad sites — pad contact issue, reposition'
    ],
    contraindications: 'Over neoplasia, over broken skin, over thorax with HCM/pacemaker, seizure history, pregnancy',
    progression: 'Use as pre-exercise analgesia adjunct. Combine with FELINE_PBMT for multi-modal pain management.',
    clinical_classification: {
      primary_indications: ['FELINE_OA', 'FELINE_OA_AXIAL', 'FELINE_IVDD_CAT', 'FELINE_POST_FRACTURE_CAT'],
      rehab_phases: ['ACUTE', 'SUBACUTE', 'CHRONIC'],
      intervention_type: 'THERAPEUTIC_MODALITIES',
      evidence_grade: 'B',
      species: 'FELINE',
      authority: 'Drum et al. 2015; Sharp 2012 Part 1 (TENS/NMES feline tolerance)'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 13. FELINE TREAT-TARGET SIT-TO-STAND
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: 'FELINE_SIT_STAND',
    name: 'Feline Treat-Target Sit-to-Stand',
    category: 'Strengthening',
    difficulty_level: 'Moderate',
    description: 'Active hindlimb and hip extensor strengthening via voluntary sit-to-stand transitions motivated by treat position. Treat held above shoulder line at just above head height requires cat to extend from sit → stand. Equivalent to canine sit-to-stand squat pattern. Targets hip extensors (biceps femoris, gluteals), stifle extensors (quadriceps), and hock extensors (gastrocnemius). OA cats reduce this movement before formal gait changes — tracking improvement in sit-to-stand quality is an early OA outcome measure. FMPI (feline outcome measure) specifically tracks difficulty rising from sitting.',
    equipment: ['High-value treat', 'Non-slip surface', 'Optional: treat stick/target stick'],
    setup: 'Cat in natural sitting position on non-slip surface. Handler kneels to cat level. Do not push or assist — treat position alone motivates movement.',
    steps: [
      'Cat in sitting position. Hold treat at nose height (does not trigger standing)',
      'Slowly raise treat to just above cat head height (10-15 cm above ears)',
      'Cat reaches up and transitions from sit → stand to follow treat',
      'Reward immediately when all 4 feet on floor in standing position',
      'Allow cat to sit again voluntarily between reps (do not push into sit)',
      'Reps: 5-8 per session, 2 sessions per day',
      'Slow tempo preferred — each transition should take 2-3 seconds (not a quick spring up)'
    ],
    good_form: [
      'Both hindlimbs push equally from sit — watch for asymmetry (OA indicator)',
      'Controlled transition — not a fast jump or lunge for treat',
      'Cat achieves fully upright standing position before treat delivery'
    ],
    red_flags: [
      'Consistent asymmetry (always pushes off one hindlimb preferentially) — OA/pain indicator, reassess',
      'Inability to rise from sit without forelimb push-off — significant hindlimb weakness'
    ],
    contraindications: 'Hip luxation (post-reduction <4 weeks), femoral fracture <8 weeks',
    progression: 'Progress to FELINE_STAIR_WAND when sit-to-stand symmetrical and fluid.',
    clinical_classification: {
      primary_indications: ['FELINE_OA', 'FELINE_POST_FRACTURE_CAT', 'FELINE_FATE_RECOVERY'],
      rehab_phases: ['SUBACUTE', 'CHRONIC'],
      intervention_type: 'THERAPEUTIC_EXERCISE',
      evidence_grade: 'B',
      species: 'FELINE',
      authority: 'Drum et al. 2015; FMPI (Benito et al. 2013) — tracks rising from sit as OA outcome'
    }
  },


  // ──────────────────────────────────────────────────────────────────────────
  // 14. FELINE ENVIRONMENTAL MODIFICATION PRESCRIPTION
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: 'FELINE_ENVIRON_MOD',
    name: 'Feline Environmental Modification Prescription',
    category: 'Functional Training',
    difficulty_level: 'Easy',
    description: 'Unlike dogs, cats cannot be walked on a leash for home exercise. The feline home exercise program is ENVIRONMENTAL MODIFICATION — changing the home environment to accommodate the cat\'s physical limitations AND to progressively challenge recovery. OA behavioral signs include: reduced jumping (90% of cats >12yr have radiographic OA — Hardie 2002), avoidance of high surfaces, difficulty using litter box, reduced stair use. Environmental modification directly addresses these FMPI outcome domains: jumping up, jumping down, stair use, litter box access.',
    equipment: ['Cat ramp or steps to sofa/bed (commercial or DIY)', 'Low-entry litter box (cut down one side of box to 3-5 cm for OA cats)', 'Raised food/water bowl (reduces cervical OA pain during eating)', 'Heated bed or orthopedic cat bed', 'Non-slip mats throughout home (critical for OA cats on tile/hardwood)', 'Window perches with ramp access'],
    setup: 'Assess patient\'s primary functional limitations. Match home modification to specific FMPI domains affected.',
    steps: [
      'JUMPING: Install ramp or 2-3 step platform to allow cat to reach furniture without jumping',
      'Step height: maximum 10-15 cm per step. Cover with carpet for grip',
      'LITTER BOX: Cut entry side down to 3-5 cm height. Large open box preferred',
      'For neurological patients: wee-wee pad tray (1 cm rim) placed inside box',
      'FOOD/WATER: Raise bowls to elbow height (10-15 cm) on low platform for cervical OA',
      'SLEEPING: Heated orthopedic bed at floor level OR with ramp access',
      'FLOORS: Non-slip yoga mat strips on all slippery surfaces in cat\'s travel paths',
      'WARMTH: Environmental temperature 22-24°C minimum — cold worsens feline OA stiffness',
      'ENRICHMENT: Mental stimulation reduces pain behavior — puzzle feeders, window perches, paper bags to explore'
    ],
    good_form: [
      'Ramps/steps must be stable — test for wobble before cat uses them',
      'Transition period: place treats on each ramp step to encourage first use',
      'Monitor FMPI-tracked behaviors after each modification — jumping up/down, litter box frequency'
    ],
    red_flags: [
      'Cat stops using litter box entirely — pain is too severe, immediate vet assessment',
      'Cat stops eating/drinking at raised bowl — revert to floor level, may have cervical pain'
    ],
    contraindications: 'None — environmental modification is appropriate for ALL feline rehabilitation patients',
    progression: 'Reassess home environment at each visit. As cat improves, gradually raise step/ramp heights to restore challenge.',
    clinical_classification: {
      primary_indications: ['FELINE_OA', 'FELINE_OA_AXIAL', 'FELINE_IVDD_CAT', 'FELINE_NEURO_CAT', 'FELINE_HCM_SUBCLINICAL'],
      rehab_phases: ['ACUTE', 'SUBACUTE', 'CHRONIC'],
      intervention_type: 'HOME_PROGRAM',
      evidence_grade: 'B',
      species: 'FELINE',
      authority: 'Hardie 2002 (OA prevalence/behavior); FMPI domains (Benito et al. 2013); Drum et al. 2015'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 15. FELINE THERMAL THERAPY — WARM/COLD
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: 'FELINE_THERMAL',
    name: 'Feline Thermal Therapy (Warm & Cold)',
    category: 'Therapeutic Modalities',
    difficulty_level: 'Easy',
    description: 'Thermotherapy and cryotherapy applied to feline patients. Key differences from canine: (1) Cats seek warmth naturally — heated pads, warm compresses, and radiant heat are typically well-accepted and can significantly reduce OA pain and muscle tension; (2) Cryotherapy (ice/cold packs) is generally less well-tolerated — cats dislike cold on limbs. Use cold only post-acute injury/surgery; transition to heat once acute inflammation resolves (after 72 hours). Warmth before exercise improves tissue extensibility and increases compliance. Sharp (2012) recommends warm compress or heated pad as pre-treatment for all feline manual therapy sessions.',
    equipment: ['Heated pad (set to LOW — feline skin burns more easily than canine)', 'Warm damp towel (test on inner wrist: comfortable to human touch = safe for cat)', 'Ice pack wrapped in 2 towel layers (never direct cold contact on feline skin)', 'Thermometer to verify pad temperature <40°C'],
    setup: 'For heat: verify temperature is comfortable (38-40°C maximum). For cold: wrap ice pack in 2 towels. Never apply for >10 minutes on feline patients.',
    steps: [
      'HEAT (chronic OA, pre-exercise, pre-massage):',
      '  - Apply warm towel or low-setting heated pad to affected area for 5-10 min BEFORE exercise',
      '  - Temperature: 38-40°C. Test on human inner forearm before applying',
      '  - Cat must be monitored CONTINUOUSLY — cannot self-remove from heated pad',
      '  - Signs of overheating: panting, restlessness — remove immediately',
      'COLD (acute injury, post-op first 72 hours, acute OA flare):',
      '  - Wrap cold pack in 2 towel layers minimum. Apply 5-7 min MAXIMUM (shorter than canine)',
      '  - Monitor skin — feline skin is thin, frostbite risk higher than canine',
      '  - Most cats will object to cold application after 3-4 minutes — respect this',
      '  - Frequency: 3-4x daily in acute phase'
    ],
    good_form: [
      'Temperature verified before application every time',
      'Timer used — do not rely on memory for duration',
      'Cat monitored at all times during thermal therapy'
    ],
    red_flags: [
      'Any redness or skin change under heat pad — remove immediately, burn risk',
      'Cat moves away from heat — respect — do not force'
    ],
    contraindications: 'Heat: over neoplasia, acute injury first 72h, fever, impaired sensation (neurological). Cold: open wounds, peripheral vascular disease (HCM/FATE comorbidity)',
    progression: 'Transition from cold to heat at 72 hours post-injury as routine.',
    clinical_classification: {
      primary_indications: ['FELINE_OA', 'FELINE_POST_FRACTURE_CAT', 'FELINE_IVDD_CAT'],
      rehab_phases: ['ACUTE', 'SUBACUTE', 'CHRONIC'],
      intervention_type: 'THERAPEUTIC_MODALITIES',
      evidence_grade: 'B',
      species: 'FELINE',
      authority: 'Sharp 2012 Part 1; Drum et al. 2015'
    }
  }

]; // END FELINE_REHAB_EXERCISES

module.exports = FELINE_REHAB_EXERCISES;
