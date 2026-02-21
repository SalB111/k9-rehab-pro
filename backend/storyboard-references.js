// ============================================================================
// K9 REHAB PRO — EXERCISE STORYBOARD REFERENCE LIBRARY
// Frame-by-frame clinical exercise demonstrations with SVG anatomical overlays
// Follows the 14-point storyboard specification
// ============================================================================

// ── Overlay types for clinical annotations on storyboard frames ──
const OVERLAY_TYPES = {
  ARROW:           'arrow',
  JOINT_ANGLE:     'joint_angle',
  WEIGHT_SHIFT:    'weight_shift',
  GOOD_FORM:       'good_form',
  COMMON_MISTAKE:  'common_mistake',
  SAFETY_WARNING:  'safety_warning',
};

// ── Frame access status ──
const FRAME_STATUS = {
  FREE:   'free',
  LOCKED: 'locked',
};

// ── SVG indicator types for anatomical illustration system ──
const SVG_INDICATOR_TYPES = {
  FLEXION_ARC:      'flexion_arc',
  EXTENSION_ARC:    'extension_arc',
  FORCE_VECTOR:     'force_vector',
  MUSCLE_HIGHLIGHT: 'muscle_highlight',
  JOINT_PIVOT:      'joint_pivot',
  HAND_PLACEMENT:   'hand_placement',
};

// ============================================================================
// STORYBOARD_LIBRARY
// Keyed by exercise code. Each entry covers all 14 specification points.
// ============================================================================

const STORYBOARD_LIBRARY = {

  // ═══════════════════════════════════════════════════════════════════════════
  // EXERCISE 1: PASSIVE RANGE OF MOTION — STIFLE
  // ═══════════════════════════════════════════════════════════════════════════
  PROM_STIFLE: {
    exercise_code: 'PROM_STIFLE',
    version: '1.0',
    last_updated: '2026-02-20',

    // ── 1. Exercise Name ──
    exercise_name: 'Passive Range of Motion — Stifle',

    // ── 2. Clinical Purpose ──
    clinical_purpose: 'Maintain joint mobility, prevent adhesion formation, promote synovial fluid circulation, and reduce pain via gate-control mechanism. Critical intervention in acute and subacute post-CCL recovery to prevent joint contracture and muscle atrophy.',

    // ── 3. Indications ──
    indications: [
      'Post-CCL repair (TPLO, lateral suture, TTA) — after 48 hours',
      'Post-patellar luxation surgery',
      'Stifle osteoarthritis — all stages',
      'Joint contracture prevention during immobilization',
      'Muscle atrophy mitigation during restricted activity',
      'Post-meniscectomy recovery',
    ],

    // ── 4. Contraindications ──
    contraindications: [
      'Within 48 hours post-surgery (unless cleared by surgeon)',
      'Acute joint sepsis or active infection',
      'Non-stabilized fractures involving the stifle',
      'Severe acute inflammation with significant effusion',
      'Undiagnosed joint instability',
      'Known malignancy at the joint site',
    ],

    // ── 5. Equipment Needed ──
    equipment_needed: [
      { item: 'Padded/cushioned surface (yoga mat or orthopedic bed)', required: true },
      { item: 'Treat rewards for positive reinforcement', required: false },
      { item: 'Goniometer (for ROM measurement and documentation)', required: false },
      { item: 'Towel rolls for body support if needed', required: false },
    ],

    // ── 6. Handler Setup ──
    handler_setup: 'Kneel or sit at the patient\'s side. Ensure the dog is in comfortable lateral recumbency on a padded surface with the affected limb uppermost. Position yourself so your proximal hand can stabilize the femur while your distal hand controls the tibia just above the hock. Assess baseline comfort and pain level before beginning.',

    // ── 7. Step-by-Step Movement Breakdown ──
    movement_breakdown: [
      { step: 1, action: 'Position patient in lateral recumbency on padded surface with affected limb up', muscle_focus: null, joint_motion: null },
      { step: 2, action: 'Stabilize femur with proximal hand — firm but gentle contact', muscle_focus: null, joint_motion: null },
      { step: 3, action: 'Grasp tibia just above hock with distal hand', muscle_focus: null, joint_motion: null },
      { step: 4, action: 'Slowly flex stifle through pain-free range over 3-5 seconds', muscle_focus: 'Quadriceps (eccentric stretch)', joint_motion: 'Tibiofemoral flexion' },
      { step: 5, action: 'Hold at end range for 5-10 seconds — assess end-feel quality', muscle_focus: 'Sustained stretch on quadriceps and joint capsule', joint_motion: 'Static flexion hold' },
      { step: 6, action: 'Slowly extend back to neutral over 3-5 seconds', muscle_focus: 'Hamstrings (eccentric stretch)', joint_motion: 'Tibiofemoral extension' },
      { step: 7, action: 'Repeat 10-15 repetitions per session, 2-3 sessions per day', muscle_focus: null, joint_motion: 'Full flexion-extension arc' },
    ],

    // ── 8. Storyboard Frames (5 frames) ──
    frames: [
      {
        frame_number: 1,
        frame_title: 'Patient Positioning',
        frame_description: 'Lateral recumbency setup on padded surface',
        dog_action: 'Lying in lateral recumbency, affected limb uppermost, body relaxed and supported',
        handler_action: 'Kneeling at patient\'s side, assessing comfort, preparing hand placement',
        clinical_cues: 'Verify patient comfort and relaxation before beginning. Assess baseline pain level. Check for swelling or warmth at the stifle.',
        safety_notes: 'Ensure non-slip surface. Support body with towel rolls if needed. Never restrain forcefully — patient must be relaxed.',
        duration_seconds: 5,
        status: FRAME_STATUS.FREE,
        svg_indicators: [
          { type: SVG_INDICATOR_TYPES.HAND_PLACEMENT, x: 42, y: 55, label: 'Proximal hand — femur stabilization', color: '#0EA5E9' },
          { type: SVG_INDICATOR_TYPES.HAND_PLACEMENT, x: 62, y: 72, label: 'Distal hand — tibial control', color: '#0EA5E9' },
          { type: SVG_INDICATOR_TYPES.JOINT_PIVOT, x: 52, y: 62, label: 'Stifle joint', color: '#D97706' },
        ],
      },
      {
        frame_number: 2,
        frame_title: 'Hand Placement & Stabilization',
        frame_description: 'Proper grip for femur stabilization and tibial control',
        dog_action: 'Relaxed lateral recumbency, limb supported by handler',
        handler_action: 'Proximal hand wraps around distal femur for stabilization. Distal hand grasps tibia just above hock. Fingers wrap naturally around the limb.',
        clinical_cues: 'Femur must not rotate during ROM. Palpate for warmth, effusion, or crepitus before starting movement. Note any guarding behavior.',
        safety_notes: 'Gentle but firm contact — do not compress the joint directly. Avoid gripping over the incision site if post-surgical.',
        duration_seconds: 5,
        status: FRAME_STATUS.FREE,
        svg_indicators: [
          { type: SVG_INDICATOR_TYPES.HAND_PLACEMENT, x: 40, y: 52, label: 'Stabilization grip — distal femur', color: '#059669' },
          { type: SVG_INDICATOR_TYPES.HAND_PLACEMENT, x: 60, y: 75, label: 'Control grip — proximal tibia', color: '#059669' },
          { type: SVG_INDICATOR_TYPES.JOINT_PIVOT, x: 50, y: 63, label: 'Stifle joint center', color: '#D97706' },
        ],
      },
      {
        frame_number: 3,
        frame_title: 'Flexion Phase',
        frame_description: 'Controlled stifle flexion through available pain-free range',
        dog_action: 'Stifle flexing as handler slowly moves tibia toward femur. Dog remains relaxed — no guarding or tension.',
        handler_action: 'Distal hand slowly brings tibia upward, flexing the stifle joint. Motion takes 3-5 seconds. Proximal hand maintains femur stabilization.',
        clinical_cues: 'Monitor end-feel quality throughout motion. Note any crepitus, clicking, or guarding response. Document available ROM.',
        safety_notes: 'STOP immediately if vocalization, muscle spasm, guarding, or withdrawal occurs. Never force past pain-free range.',
        duration_seconds: 6,
        status: FRAME_STATUS.FREE,
        svg_indicators: [
          { type: SVG_INDICATOR_TYPES.FLEXION_ARC, x: 50, y: 63, angle_start: 160, angle_end: 90, label: 'Flexion arc ~70°', color: '#0EA5E9' },
          { type: SVG_INDICATOR_TYPES.FORCE_VECTOR, x: 60, y: 70, dx: -5, dy: -18, label: 'Direction of motion', color: '#39FF7E' },
          { type: SVG_INDICATOR_TYPES.MUSCLE_HIGHLIGHT, region: 'quadriceps', x: 45, y: 55, rx: 12, ry: 20, label: 'Quadriceps stretching', color: 'rgba(14,165,233,0.25)' },
        ],
      },
      {
        frame_number: 4,
        frame_title: 'End-Range Hold',
        frame_description: 'Static hold at comfortable flexion limit — 5-10 seconds',
        dog_action: 'Stifle at maximum comfortable flexion. Muscles relaxed. No signs of distress.',
        handler_action: 'Maintaining gentle sustained pressure at end range. Counting 5-10 second hold aloud. Monitoring patient\'s facial expression and body language.',
        clinical_cues: 'Assess end-feel: soft tissue (normal) vs. bone-on-bone (abnormal). Document ROM with goniometer if available. Compare to contralateral limb.',
        safety_notes: 'Never force beyond pain-free range. Watch for subtle pain signs: ear pinning, lip licking, looking at the limb, body tension.',
        duration_seconds: 8,
        status: FRAME_STATUS.FREE,
        svg_indicators: [
          { type: SVG_INDICATOR_TYPES.JOINT_PIVOT, x: 50, y: 63, label: 'Hold position — maximum flexion', color: '#DC2626' },
          { type: SVG_INDICATOR_TYPES.FLEXION_ARC, x: 50, y: 63, angle_start: 160, angle_end: 85, label: 'ROM achieved ~75°', color: '#059669' },
        ],
      },
      {
        frame_number: 5,
        frame_title: 'Extension Return',
        frame_description: 'Controlled return to neutral position — 3-5 seconds',
        dog_action: 'Stifle extending back to neutral as handler guides the motion smoothly',
        handler_action: 'Slowly guiding tibia back to neutral with same controlled 3-5 second tempo. Maintaining stabilization throughout return.',
        clinical_cues: 'Maintain consistent rhythm and tempo. Monitor for any new crepitus during extension. Reassess comfort before next repetition.',
        safety_notes: 'Do not allow limb to snap back uncontrolled. Control the entire motion through full range. Pause between repetitions if patient shows fatigue.',
        duration_seconds: 5,
        status: FRAME_STATUS.FREE,
        svg_indicators: [
          { type: SVG_INDICATOR_TYPES.EXTENSION_ARC, x: 50, y: 63, angle_start: 85, angle_end: 160, label: 'Extension return', color: '#0EA5E9' },
          { type: SVG_INDICATOR_TYPES.FORCE_VECTOR, x: 60, y: 70, dx: 5, dy: 18, label: 'Direction of motion', color: '#39FF7E' },
        ],
      },
    ],

    // ── 9. On-Screen Clinical Overlays ──
    overlay_groups: {
      arrows: {
        label: 'Movement Arrows',
        description: 'Direction of limb motion during each phase',
        default_visible: true,
        color: '#39FF7E',
      },
      joint_angles: {
        label: 'Joint Angles',
        description: 'Goniometric measurements and ROM arcs',
        default_visible: true,
        color: '#0EA5E9',
      },
      weight_shift: {
        label: 'Weight Distribution',
        description: 'Center of mass and load-bearing indicators',
        default_visible: false,
        color: '#D97706',
      },
      good_form: {
        label: 'Good Form',
        description: 'Correct technique confirmation labels',
        default_visible: false,
        color: '#059669',
      },
      common_mistakes: {
        label: 'Common Mistakes',
        description: 'Warning labels for frequent errors',
        default_visible: false,
        color: '#D97706',
      },
      safety_warnings: {
        label: 'Safety Alerts',
        description: 'Critical safety warnings and stop signals',
        default_visible: true,
        color: '#DC2626',
      },
    },

    // ── 10. Branding Layer ──
    branding: {
      neon_accent: '#39FF7E',
      secondary_accent: '#0EA5E9',
      watermark_text: 'K9 Rehab Pro\u2122',
      watermark_opacity: 0.08,
      watermark_position: 'bottom-right',
      asclepius_symbol: true,
      asclepius_position: 'top-left',
      font_title: "'Exo 2', sans-serif",
      font_body: "'Inter', -apple-system, sans-serif",
      color_palette: { navy: '#0A2540', teal: '#0EA5E9', green: '#059669', neon: '#39FF7E' },
    },

    // ── 11. Client-Friendly Script (20-30 seconds) ──
    client_script: {
      duration_range: '20-30 seconds',
      text: "This exercise gently moves your dog's knee joint to help it heal properly after surgery. Have your dog lie comfortably on their side with the surgical leg on top. Place one hand on their thigh to hold it steady and your other hand below the knee. Slowly bend the knee toward the chest — take about 3 to 5 seconds. Hold for 5 seconds at the point where you feel gentle resistance, then slowly straighten it back out. Do this 10 to 15 times, 2 to 3 times a day. Stop immediately if your dog cries, pulls away, or tenses up. Call your veterinarian if you notice increased swelling, warmth, or limping after the exercise.",
      key_phrases: ['gently', 'slowly', 'stop immediately', 'call your veterinarian'],
    },

    // ── 12. Clinician-Level Script (20-40 seconds) ──
    clinician_script: {
      duration_range: '20-40 seconds',
      text: "Passive range of motion of the stifle joint. Position the patient in lateral recumbency with the affected limb uppermost. Stabilize the femur with your proximal hand at the distal third. Grasp the tibia just proximal to the hock with your distal hand. Perform controlled flexion through the available pain-free range at 3 to 5 seconds per arc. Assess end-feel quality — soft tissue stretch is expected; bone-on-bone contact is abnormal and requires documentation. Hold at end-range for 5 to 10 seconds. Return to neutral at the same controlled speed. Complete 10 to 15 repetitions, 2 to 3 times daily during the acute phase. Document ROM using goniometry at each session. Contraindicated within 48 hours post-surgery, during acute septic arthritis, or with unstabilized fractures. Evidence base: Marsolais et al. 2003 demonstrated 40% reduction in post-surgical complications with early passive ROM. Millis & Levine Chapter 14 — Therapeutic Exercises.",
      key_phrases: ['end-feel', 'goniometry', 'pain-free range', 'contraindicated', 'Marsolais et al. 2003'],
    },

    // ── 14. File Naming Convention ──
    file_naming: {
      convention: 'passive-prom_stifle-storyboard-v1',
      format_rule: '{category_slug}-{exercise_code_lower}-storyboard-v{version}',
    },
  },


  // ═══════════════════════════════════════════════════════════════════════════
  // EXERCISE 2: SIT-TO-STAND TRANSITIONS
  // ═══════════════════════════════════════════════════════════════════════════
  SIT_STAND: {
    exercise_code: 'SIT_STAND',
    version: '1.0',
    last_updated: '2026-02-20',

    // ── 1. Exercise Name ──
    exercise_name: 'Sit-to-Stand Transitions',

    // ── 2. Clinical Purpose ──
    clinical_purpose: 'Rebuild hindlimb strength, particularly quadriceps and gluteal muscle groups. Promotes controlled weight shifting through the pelvic limbs, improves stifle and hip extension, and retrains functional movement patterns essential for daily activities.',

    // ── 3. Indications ──
    indications: [
      'Post-CCL repair — Phase 2 (early mobilization) onward',
      'Post-TPLO — Weeks 2-6 and beyond',
      'Hip dysplasia — conservative and post-surgical management',
      'Stifle osteoarthritis — subacute and chronic stages',
      'Geriatric muscle atrophy — hindlimb weakness',
      'Neurologic patients — proprioceptive retraining (with assistance)',
      'General conditioning and fitness maintenance',
    ],

    // ── 4. Contraindications ──
    contraindications: [
      'Acute post-surgical phase (first 2 weeks post-TPLO/CCL repair)',
      'Unstabilized patellar luxation',
      'Acute disc herniation with motor deficits',
      'Severe pain (pain score > 6/10)',
      'Non-weight-bearing lameness',
      'Active joint sepsis',
    ],

    // ── 5. Equipment Needed ──
    equipment_needed: [
      { item: 'Non-slip surface (rubber mat or textured flooring)', required: true },
      { item: 'High-value treat rewards', required: true },
      { item: 'Harness or sling support (for assisted patients)', required: false },
      { item: 'Elevated platform or step (for progression)', required: false },
    ],

    // ── 6. Handler Setup ──
    handler_setup: 'Stand or kneel directly in front of the dog. Hold treat at the dog\'s nose level. Ensure the dog is on a non-slip surface with adequate space. If the patient requires assistance, position a support sling under the abdomen. The handler should be able to observe the hindquarters during the entire exercise for symmetry assessment.',

    // ── 7. Step-by-Step Movement Breakdown ──
    movement_breakdown: [
      { step: 1, action: 'Position dog in a square sit on non-slip surface', muscle_focus: null, joint_motion: 'Bilateral stifle and hip flexion' },
      { step: 2, action: 'Hold treat at nose level, slightly forward and upward', muscle_focus: null, joint_motion: null },
      { step: 3, action: 'Lure dog forward and upward to initiate standing', muscle_focus: 'Quadriceps (concentric contraction)', joint_motion: 'Bilateral stifle extension' },
      { step: 4, action: 'Dog drives through hindlimbs to reach full standing', muscle_focus: 'Gluteals and quadriceps (peak loading)', joint_motion: 'Hip and stifle extension' },
      { step: 5, action: 'Hold standing position for 2-3 seconds, reward', muscle_focus: 'Isometric hindlimb support', joint_motion: 'Static extension hold' },
      { step: 6, action: 'Lure back into sit position with controlled descent', muscle_focus: 'Quadriceps (eccentric control)', joint_motion: 'Controlled stifle and hip flexion' },
    ],

    // ── 8. Storyboard Frames (5 frames) ──
    frames: [
      {
        frame_number: 1,
        frame_title: 'Square Sit Position',
        frame_description: 'Starting position — symmetrical sit with both hindlimbs tucked',
        dog_action: 'Sitting squarely with weight evenly distributed on both hindlimbs. Both hocks tucked symmetrically under the body.',
        handler_action: 'Standing or kneeling in front. Assessing sit symmetry — does the dog favor one side? Hold treat ready at nose level.',
        clinical_cues: 'A "lazy sit" (one limb kicked out) indicates discomfort or weakness on the tucked side. Document sit symmetry as baseline.',
        safety_notes: 'Ensure non-slip surface. If dog cannot achieve a square sit, modify to assisted sit with sling before progressing.',
        duration_seconds: 5,
        status: FRAME_STATUS.FREE,
        svg_indicators: [
          { type: SVG_INDICATOR_TYPES.JOINT_PIVOT, x: 55, y: 65, label: 'Stifle — flexed position', color: '#0EA5E9' },
          { type: SVG_INDICATOR_TYPES.JOINT_PIVOT, x: 50, y: 50, label: 'Hip — flexed position', color: '#0EA5E9' },
          { type: SVG_INDICATOR_TYPES.MUSCLE_HIGHLIGHT, region: 'quadriceps', x: 52, y: 58, rx: 8, ry: 18, label: 'Quadriceps — loaded position', color: 'rgba(14,165,233,0.2)' },
        ],
      },
      {
        frame_number: 2,
        frame_title: 'Treat Lure & Weight Shift',
        frame_description: 'Initiating the stand — treat moves forward and slightly upward',
        dog_action: 'Dog begins to shift weight forward, leaning into the treat lure. Hindlimbs begin to engage.',
        handler_action: 'Moving treat slowly forward and slightly upward from the dog\'s nose. Speed is critical — too fast causes scrambling, too slow loses engagement.',
        clinical_cues: 'Watch for the moment of hindlimb loading — this is where the therapeutic benefit occurs. The dog should drive through the hindlimbs, not pull with the forelimbs.',
        safety_notes: 'If the dog lunges or scrambles, slow the lure speed. Maintain consistent, smooth motion.',
        duration_seconds: 4,
        status: FRAME_STATUS.FREE,
        svg_indicators: [
          { type: SVG_INDICATOR_TYPES.FORCE_VECTOR, x: 45, y: 45, dx: 12, dy: -8, label: 'Treat lure direction', color: '#39FF7E' },
          { type: SVG_INDICATOR_TYPES.FORCE_VECTOR, x: 55, y: 65, dx: 0, dy: -15, label: 'Hindlimb drive force', color: '#0EA5E9' },
          { type: SVG_INDICATOR_TYPES.MUSCLE_HIGHLIGHT, region: 'gluteals', x: 48, y: 48, rx: 10, ry: 10, label: 'Gluteals engaging', color: 'rgba(5,150,105,0.25)' },
        ],
      },
      {
        frame_number: 3,
        frame_title: 'Rising Transition — Peak Loading',
        frame_description: 'Maximum hindlimb loading as dog drives to standing',
        dog_action: 'Hindlimbs driving into extension. Weight primarily on pelvic limbs during the rising phase. Stifle and hip extending simultaneously.',
        handler_action: 'Continuing smooth upward lure. Observing hindlimb symmetry — does one limb push more than the other? Noting any hesitation.',
        clinical_cues: 'This is the highest-value moment therapeutically. Peak quadriceps and gluteal loading occurs during the transition. Asymmetric push indicates limb preference.',
        safety_notes: 'If the dog uses primarily forelimbs to stand (pulling up rather than pushing from behind), the exercise is not achieving its therapeutic purpose. Reposition and retry.',
        duration_seconds: 5,
        status: FRAME_STATUS.FREE,
        svg_indicators: [
          { type: SVG_INDICATOR_TYPES.FORCE_VECTOR, x: 55, y: 60, dx: 0, dy: -20, label: 'Vertical drive force', color: '#39FF7E' },
          { type: SVG_INDICATOR_TYPES.FLEXION_ARC, x: 55, y: 62, angle_start: 70, angle_end: 140, label: 'Stifle extending ~70°', color: '#0EA5E9' },
          { type: SVG_INDICATOR_TYPES.MUSCLE_HIGHLIGHT, region: 'quadriceps', x: 53, y: 58, rx: 8, ry: 18, label: 'Quadriceps — peak concentric contraction', color: 'rgba(14,165,233,0.3)' },
          { type: SVG_INDICATOR_TYPES.MUSCLE_HIGHLIGHT, region: 'gluteals', x: 48, y: 46, rx: 10, ry: 10, label: 'Gluteals — peak contraction', color: 'rgba(5,150,105,0.3)' },
        ],
      },
      {
        frame_number: 4,
        frame_title: 'Full Stand Achievement',
        frame_description: 'Standing position — reward and hold for 2-3 seconds',
        dog_action: 'Standing squarely on all four limbs. Weight evenly distributed. Stifle and hip in full extension.',
        handler_action: 'Delivering treat reward. Holding position for 2-3 seconds. Observing weight distribution and stance symmetry.',
        clinical_cues: 'Assess standing posture: is weight shifted to one side? Are stifles in full extension? Is the stance base widened (compensation)?',
        safety_notes: 'Do not hold the stand too long — fatigue leads to compensatory postures. 2-3 seconds is sufficient for early rehabilitation.',
        duration_seconds: 5,
        status: FRAME_STATUS.FREE,
        svg_indicators: [
          { type: SVG_INDICATOR_TYPES.JOINT_PIVOT, x: 55, y: 68, label: 'Stifle — full extension', color: '#059669' },
          { type: SVG_INDICATOR_TYPES.JOINT_PIVOT, x: 50, y: 50, label: 'Hip — full extension', color: '#059669' },
        ],
      },
      {
        frame_number: 5,
        frame_title: 'Controlled Descent to Sit',
        frame_description: 'Eccentric phase — controlled lowering back to sit position',
        dog_action: 'Dog lowers back into sit position with controlled descent. Hindlimbs flexing under eccentric load.',
        handler_action: 'Luring treat downward and slightly backward to guide into sit. Ensuring slow, controlled descent — not a collapse.',
        clinical_cues: 'The eccentric (lowering) phase is equally therapeutic. Watch for "plop sitting" — an uncontrolled drop indicates weakness. The descent should take 2-3 seconds.',
        safety_notes: 'If the dog collapses into the sit rather than lowering controllably, reduce repetitions or add sling support. Eccentric failure is a sign of fatigue.',
        duration_seconds: 5,
        status: FRAME_STATUS.FREE,
        svg_indicators: [
          { type: SVG_INDICATOR_TYPES.FORCE_VECTOR, x: 55, y: 60, dx: 0, dy: 15, label: 'Controlled descent', color: '#39FF7E' },
          { type: SVG_INDICATOR_TYPES.FLEXION_ARC, x: 55, y: 65, angle_start: 160, angle_end: 80, label: 'Stifle flexing — eccentric control', color: '#D97706' },
          { type: SVG_INDICATOR_TYPES.MUSCLE_HIGHLIGHT, region: 'quadriceps', x: 53, y: 58, rx: 8, ry: 18, label: 'Quadriceps — eccentric braking', color: 'rgba(217,119,6,0.25)' },
        ],
      },
    ],

    // ── 9. On-Screen Clinical Overlays ──
    overlay_groups: {
      arrows: {
        label: 'Movement Arrows',
        description: 'Direction of forces and lure movement',
        default_visible: true,
        color: '#39FF7E',
      },
      joint_angles: {
        label: 'Joint Angles',
        description: 'Stifle and hip angle indicators',
        default_visible: true,
        color: '#0EA5E9',
      },
      weight_shift: {
        label: 'Weight Distribution',
        description: 'Center of mass and limb loading indicators',
        default_visible: false,
        color: '#D97706',
      },
      good_form: {
        label: 'Good Form',
        description: 'Muscle activation and correct technique labels',
        default_visible: true,
        color: '#059669',
      },
      common_mistakes: {
        label: 'Common Mistakes',
        description: 'Warning labels for forelimb pulling and lazy sit',
        default_visible: false,
        color: '#D97706',
      },
      safety_warnings: {
        label: 'Safety Alerts',
        description: 'Fatigue indicators and stop signals',
        default_visible: true,
        color: '#DC2626',
      },
    },

    // ── 10. Branding Layer ──
    branding: {
      neon_accent: '#39FF7E',
      secondary_accent: '#0EA5E9',
      watermark_text: 'K9 Rehab Pro\u2122',
      watermark_opacity: 0.08,
      watermark_position: 'bottom-right',
      asclepius_symbol: true,
      asclepius_position: 'top-left',
      font_title: "'Exo 2', sans-serif",
      font_body: "'Inter', -apple-system, sans-serif",
      color_palette: { navy: '#0A2540', teal: '#0EA5E9', green: '#059669', neon: '#39FF7E' },
    },

    // ── 11. Client-Friendly Script (20-30 seconds) ──
    client_script: {
      duration_range: '20-30 seconds',
      text: "This exercise strengthens your dog's back legs by having them practice standing up from a sit. Start with your dog sitting on a non-slip surface. Hold a treat at nose level and slowly move it forward and up so your dog stands up to follow it. Let them stand for 2 to 3 seconds, give the treat, then guide them back into a sit by moving the treat down. Do 5 to 10 repetitions, 2 times a day. Watch that your dog pushes up with their back legs — not pulling with their front legs. Stop if your dog seems tired, sore, or starts collapsing into the sit instead of lowering slowly.",
      key_phrases: ['back legs', 'slowly', 'non-slip surface', 'stop if tired'],
    },

    // ── 12. Clinician-Level Script (20-40 seconds) ──
    clinician_script: {
      duration_range: '20-40 seconds',
      text: "Sit-to-stand transitions targeting concentric and eccentric quadriceps and gluteal loading. Position the patient in a square sit on a non-slip surface. Use a treat lure to guide into standing — the lure moves forward and slightly upward to encourage hindlimb drive rather than forelimb pulling. Peak loading occurs during the mid-transition phase when the stifle is at approximately 90 degrees of flexion. Hold the stand for 2 to 3 seconds, then lure back into a controlled sit. The eccentric descent is equally therapeutic — watch for plop sitting which indicates quadriceps fatigue. Start with 5 repetitions and progress to 10 to 15 as the patient builds strength. Monitor for sit symmetry as a marker of limb preference. Contraindicated in the acute post-surgical phase and with pain scores exceeding 6 out of 10. Millis & Levine Chapter 16 — Active Therapeutic Exercises.",
      key_phrases: ['concentric and eccentric', 'hindlimb drive', 'plop sitting', 'sit symmetry', 'Millis & Levine Chapter 16'],
    },

    // ── 14. File Naming Convention ──
    file_naming: {
      convention: 'active_assisted-sit_stand-storyboard-v1',
      format_rule: '{category_slug}-{exercise_code_lower}-storyboard-v{version}',
    },
  },


  // ═══════════════════════════════════════════════════════════════════════════
  // EXERCISE 3: CURB/STEP WALKING
  // ═══════════════════════════════════════════════════════════════════════════
  CURB_WALK: {
    exercise_code: 'CURB_WALK',
    version: '1.0',
    last_updated: '2026-02-20',

    exercise_name: 'Curb/Step Walking',

    clinical_purpose: 'Improve active joint flexion and extension through controlled elevation changes. Walking with ipsilateral limbs elevated on a curb produces asymmetric weight loading that increases stifle and hip range of motion, strengthens quadriceps and gluteals during the step-up phase, and challenges proprioceptive awareness through uneven surface navigation. Targets functional gait retraining by simulating real-world terrain variations.',

    indications: [
      'Post-CCL repair (TPLO, lateral suture, TTA) — Phase 2 onward (weeks 3+)',
      'Post-patellar luxation surgery — subacute phase',
      'Hip dysplasia — conservative and post-surgical management',
      'Stifle or hip osteoarthritis — subacute and chronic stages',
      'Neurologic patients — proprioceptive retraining (assisted)',
      'Geriatric muscle atrophy with preserved ambulatory status',
      'General conditioning — hindlimb and forelimb strengthening',
      'Post-femoral head ostectomy (FHO) — mid-to-late rehabilitation',
    ],

    contraindications: [
      'Severe ataxia or vestibular dysfunction',
      'Acute pain (pain score > 6/10)',
      'Unstable joints or non-stabilized fractures',
      'Non-weight-bearing lameness on any limb',
      'Acute post-surgical phase (first 2 weeks post-TPLO/CCL)',
      'Active joint sepsis or significant effusion',
      'Severe cardiac or respiratory compromise',
    ],

    equipment_needed: [
      { item: 'Leash (4-6 ft, short control)', required: true },
      { item: 'Curb or 2-4 inch step (concrete curb, low platform, or exercise step)', required: true },
      { item: 'Non-slip surface (rubber mat on step, textured concrete)', required: true },
      { item: 'Harness or support sling (for patients requiring assistance)', required: false },
      { item: 'Treat rewards', required: false },
    ],

    handler_setup: 'Position yourself on the road-side (lower surface) with the dog between you and the curb. Hold the leash short (2-3 ft) in your curb-side hand to control pace and positioning. Your free hand should be available to guide the dog\'s hip or provide light support if needed. Walk at the dog\'s pace — never pull. Ensure the curb surface is dry, non-slip, and free of debris.',

    movement_breakdown: [
      { step: 1, action: 'Position dog parallel to curb, inside legs on elevated surface', muscle_focus: null, joint_motion: null },
      { step: 2, action: 'Handler on lower surface, leash short, begin slow forward walk', muscle_focus: 'Ipsilateral quadriceps and gluteals (elevated limbs)', joint_motion: 'Increased hip and stifle flexion on elevated side' },
      { step: 3, action: 'Walk length of curb (10-15 ft) maintaining parallel alignment', muscle_focus: 'Core stabilizers, adductors/abductors for lateral balance', joint_motion: 'Asymmetric hip, stifle, and hock flexion/extension' },
      { step: 4, action: 'Halt at end of curb, reward, assess gait quality', muscle_focus: null, joint_motion: null },
      { step: 5, action: 'Turn 180 degrees — opposite legs now elevated', muscle_focus: 'Contralateral quadriceps and gluteals', joint_motion: 'Contralateral joint loading' },
      { step: 6, action: 'Complete 2-3 passes each direction (4-6 total passes)', muscle_focus: 'Bilateral loading across all passes', joint_motion: 'Full bilateral ROM challenge' },
      { step: 7, action: 'End session — reassess lameness, pain, and fatigue', muscle_focus: null, joint_motion: null },
    ],

    frames: [
      {
        frame_number: 1,
        frame_title: 'Parallel Curb Setup',
        frame_description: 'Starting position — dog parallel to curb with ipsilateral limbs elevated',
        dog_action: 'Standing parallel to curb with inside forelimb and hindlimb on the elevated surface. Outside limbs on the lower surface. Weight evenly distributed.',
        handler_action: 'Standing on the lower surface beside the dog. Leash short in curb-side hand. Free hand resting near the dog\'s hip for guidance.',
        clinical_cues: 'Confirm the dog is comfortable with the elevation difference. Assess baseline weight bearing on all four limbs. Verify curb surface is non-slip.',
        safety_notes: 'If the dog resists stepping onto the curb, use a treat lure. Never force placement. Start with a lower curb (2 inches) if hesitation occurs.',
        duration_seconds: 5,
        status: FRAME_STATUS.FREE,
        svg_indicators: [
          { type: SVG_INDICATOR_TYPES.JOINT_PIVOT, x: 55, y: 60, label: 'Stifle — elevated side', color: '#0EA5E9' },
          { type: SVG_INDICATOR_TYPES.JOINT_PIVOT, x: 60, y: 72, label: 'Hock — lower side', color: '#0EA5E9' },
          { type: SVG_INDICATOR_TYPES.HAND_PLACEMENT, x: 35, y: 45, label: 'Leash hand position', color: '#059669' },
        ],
      },
      {
        frame_number: 2,
        frame_title: 'Active Gait with Asymmetric Loading',
        frame_description: 'Forward walking — elevated limbs undergo increased flexion demand',
        dog_action: 'Walking forward at a controlled slow pace. Curb-side limbs stepping on the elevated surface with increased joint flexion. Lower-side limbs maintain normal gait.',
        handler_action: 'Walking at the dog\'s pace on the lower surface. Maintaining leash tension for parallel alignment. Observing gait symmetry and weight-bearing patterns.',
        clinical_cues: 'Watch for full weight acceptance on elevated limbs. Elevated side requires 10-15 degrees additional stifle and hip flexion — this is the therapeutic stimulus. Note any stride shortening.',
        safety_notes: 'Pace must be slow and controlled. If the dog accelerates, stop and reset. Watch for paw dragging on the curb edge — indicates proprioceptive deficit or fatigue.',
        duration_seconds: 6,
        status: FRAME_STATUS.FREE,
        svg_indicators: [
          { type: SVG_INDICATOR_TYPES.FORCE_VECTOR, x: 50, y: 50, dx: 15, dy: 0, label: 'Direction of travel', color: '#39FF7E' },
          { type: SVG_INDICATOR_TYPES.FLEXION_ARC, x: 55, y: 58, angle_start: 170, angle_end: 100, label: 'Increased stifle flexion ~15°', color: '#0EA5E9' },
          { type: SVG_INDICATOR_TYPES.MUSCLE_HIGHLIGHT, region: 'quadriceps_elevated', x: 53, y: 52, rx: 8, ry: 16, label: 'Quadriceps — elevated limb loading', color: 'rgba(14,165,233,0.25)' },
        ],
      },
      {
        frame_number: 3,
        frame_title: 'Sustained Asymmetric Loading',
        frame_description: 'Mid-pass — peak proprioceptive and strengthening zone',
        dog_action: 'Midway through the curb pass. Maintained parallel alignment. Trunk muscles actively stabilizing against lateral tilt from elevation difference.',
        handler_action: 'Steady pace, monitoring from the lower side. Verbal encouragement. Free hand hovering near the hip for support if the dog sways.',
        clinical_cues: 'Peak proprioceptive and strengthening stimulus. Dog must maintain lateral stability against surface height differential. Observe trunk lean — excessive lean toward low side indicates core weakness.',
        safety_notes: 'If the dog drifts off the curb or begins stumbling, stop the pass. Reduce curb height or add harness support before continuing.',
        duration_seconds: 6,
        status: FRAME_STATUS.FREE,
        svg_indicators: [
          { type: SVG_INDICATOR_TYPES.FORCE_VECTOR, x: 50, y: 40, dx: 0, dy: 8, label: 'Lateral tilt — core challenge', color: '#D97706' },
          { type: SVG_INDICATOR_TYPES.MUSCLE_HIGHLIGHT, region: 'core', x: 50, y: 48, rx: 14, ry: 8, label: 'Core stabilizers engaged', color: 'rgba(5,150,105,0.2)' },
        ],
      },
      {
        frame_number: 4,
        frame_title: 'Direction Change — Switch Elevated Limbs',
        frame_description: 'Turn 180 degrees to load contralateral limbs',
        dog_action: 'Reached end of curb. Turning 180 degrees. Previously low-side limbs now on elevated surface. Momentary four-on-the-floor stance during turn.',
        handler_action: 'Guiding the turn with leash. Allowing dog to reposition at own pace. Switching leash hands if needed.',
        clinical_cues: 'The turn is a proprioceptive and balance challenge. Observe negotiation of transition. Document asymmetry — does the dog turn more easily in one direction?',
        safety_notes: 'Do not rush the turn. Allow full repositioning before restarting. If the dog loses footing during the turn, stabilize and reassess.',
        duration_seconds: 5,
        status: FRAME_STATUS.FREE,
        svg_indicators: [
          { type: SVG_INDICATOR_TYPES.FORCE_VECTOR, x: 50, y: 50, dx: -10, dy: 10, label: '180° turn direction', color: '#39FF7E' },
          { type: SVG_INDICATOR_TYPES.JOINT_PIVOT, x: 45, y: 60, label: 'Contralateral stifle — now elevated', color: '#D97706' },
        ],
      },
      {
        frame_number: 5,
        frame_title: 'Post-Exercise Gait and Pain Check',
        frame_description: 'Session completion — assess gait, lameness, and pain on flat ground',
        dog_action: 'Standing on flat ground after completing all passes. Four-on-the-floor stance. Walking 20-30 feet for gait assessment.',
        handler_action: 'Walking the dog on flat ground, observing gait quality. Comparing to pre-exercise gait. Palpating affected joints for warmth or effusion.',
        clinical_cues: 'Post-exercise lameness exceeding baseline indicates session was too intense. Document gait quality, new lameness, and pain response. Adjust intensity next session if worsened.',
        safety_notes: 'If new lameness, increased pain, or visible swelling appears post-exercise, discontinue curb walking and notify the supervising veterinarian. Apply cryotherapy if indicated.',
        duration_seconds: 5,
        status: FRAME_STATUS.FREE,
        svg_indicators: [
          { type: SVG_INDICATOR_TYPES.JOINT_PIVOT, x: 55, y: 62, label: 'Stifle — post-exercise assessment', color: '#059669' },
          { type: SVG_INDICATOR_TYPES.JOINT_PIVOT, x: 48, y: 50, label: 'Hip — post-exercise assessment', color: '#059669' },
        ],
      },
    ],

    overlay_groups: {
      arrows: {
        label: 'Movement Arrows',
        description: 'Direction of travel and lateral tilt forces',
        default_visible: true,
        color: '#39FF7E',
      },
      joint_angles: {
        label: 'Joint Angles',
        description: 'Stifle, hip, and hock flexion indicators on elevated limbs',
        default_visible: true,
        color: '#0EA5E9',
      },
      weight_shift: {
        label: 'Weight Distribution',
        description: 'Center of mass shift and lateral tilt indicators',
        default_visible: false,
        color: '#D97706',
      },
      good_form: {
        label: 'Good Form',
        description: 'Correct alignment and muscle activation labels',
        default_visible: false,
        color: '#059669',
      },
      common_mistakes: {
        label: 'Common Mistakes',
        description: 'Pace errors, alignment drift, one-direction-only warnings',
        default_visible: false,
        color: '#D97706',
      },
      safety_warnings: {
        label: 'Safety Alerts',
        description: 'Paw dragging, weight-bearing refusal, and lameness alerts',
        default_visible: true,
        color: '#DC2626',
      },
    },

    branding: {
      neon_accent: '#39FF7E',
      secondary_accent: '#0EA5E9',
      watermark_text: 'K9 Rehab Pro\u2122',
      watermark_opacity: 0.08,
      watermark_position: 'bottom-right',
      asclepius_symbol: true,
      asclepius_position: 'top-left',
      font_title: "'Exo 2', sans-serif",
      font_body: "'Inter', -apple-system, sans-serif",
      color_palette: { navy: '#0A2540', teal: '#0EA5E9', green: '#059669', neon: '#39FF7E' },
    },

    client_script: {
      duration_range: '20-30 seconds',
      text: "This exercise strengthens your dog's legs by having them walk along a curb with two legs up and two legs down. Position your dog so the legs closest to the curb are up on the surface while the other two stay on the ground. Walk slowly for about 10 to 15 feet, then turn around so the other legs get a turn on top. Do 2 to 3 passes in each direction. Keep the pace slow — your dog should never rush. Stop immediately if your dog starts dragging their paws, limping more than before, or refusing to put weight on a leg. Call your vet if you see increased swelling or pain after the exercise.",
      key_phrases: ['slowly', 'turn around', 'stop immediately', 'call your vet'],
    },

    clinician_script: {
      duration_range: '20-40 seconds',
      text: "Curb walking with asymmetric limb elevation. Position the patient parallel to a 2-to-4-inch curb with the ipsilateral forelimb and hindlimb on the elevated surface. Walk forward at a controlled pace for 10 to 15 feet. The elevated limbs undergo 10 to 15 degrees of additional stifle and hip flexion compared to level walking, producing targeted concentric loading of the quadriceps and gluteals during the stance-to-swing transition. Reverse direction after each pass to load the contralateral limbs. Complete 2 to 3 passes per side. Monitor for trunk lean toward the lower surface, which indicates core instability. Paw dragging on the curb edge is a red flag for proprioceptive deficit. Progress by increasing curb height to 4 to 6 inches, adding perpendicular step-ups, or extending pass distance. Contraindicated with severe ataxia, non-weight-bearing lameness, acute post-surgical status, or pain exceeding 6 out of 10. Evidence base: Millis and Levine Chapter 16 — Active Therapeutic Exercises.",
      key_phrases: ['asymmetric limb elevation', 'concentric loading', 'trunk lean', 'proprioceptive deficit', 'Millis and Levine Chapter 16'],
    },

    file_naming: {
      convention: 'active_assisted-curb_walk-storyboard-v1',
      format_rule: '{category_slug}-{exercise_code_lower}-storyboard-v{version}',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EXERCISE 4: TPLO EARLY-STAGE CONTROLLED LEASH WALK
  // ═══════════════════════════════════════════════════════════════════════════
  TPLO_LEASH_WALK: {
    exercise_code: 'TPLO_LEASH_WALK',
    version: '1.0',
    last_updated: '2026-02-20',

    // ── 1. Exercise Name ──
    exercise_name: 'TPLO Early-Stage Controlled Leash Walk',

    // ── 2. Clinical Purpose ──
    clinical_purpose: 'Encourage controlled, partial weight-bearing ambulation during the acute post-operative phase (weeks 1-3) following TPLO surgery. Promotes early limb use to prevent quadriceps atrophy and stifle capsular fibrosis, stimulates articular cartilage nutrition via cyclic loading, and maintains cardiovascular baseline — all within strict tissue-healing constraints. Per Millis & Levine, controlled leash walking is the first active exercise introduced post-TPLO, progressing from elimination-only walks (week 1) to short therapeutic sessions (weeks 2-3).',

    // ── 3. Indications ──
    indications: [
      'Post-TPLO surgery — weeks 1-3 (Phase 1: Protection/Early Motion)',
      'Post-lateral suture stabilization — weeks 2-4',
      'Post-TTA — weeks 1-3',
      'Any early post-op stifle case cleared for toe-touch weight bearing',
      'Surgeon clearance confirmed',
    ],

    // ── 4. Contraindications ──
    contraindications: [
      'Implant complications (loosening, palpable hardware, infection)',
      'Incision dehiscence or active wound drainage',
      'Complete non-weight bearing beyond post-op day 5',
      'Uncontrolled pain (pain score > 3/5)',
      'Concurrent unstable fracture',
      'Surgeon-imposed strict cage rest without walking clearance',
    ],

    // ── 5. Equipment Needed ──
    equipment_needed: [
      { item: 'Short leash (4-6 ft, no retractable leads)', required: true },
      { item: 'Properly fitted body harness with rear-end support handle', required: true },
      { item: 'Hindquarter support sling (if needed)', required: false },
      { item: 'Non-slip surface (grass, rubber matting, indoor carpet)', required: true },
      { item: 'Booties (if surfaces are slippery or cold)', required: false },
    ],

    // ── 6. Handler Setup ──
    handler_setup: 'Handler positions on the surgical side of the dog. Leash held short with minimal slack — no more than 12 inches of play. If a support sling is used, handler cradles sling under the abdomen just cranial to the stifle, providing 10-20% body weight support as needed. Pace is deliberately slow — matching the dog\'s willingness, never pulling forward. Handler watches for toe-touching, knuckling, or gait deviation on every stride cycle.',

    // ── 7. Step-by-Step Movement Breakdown ──
    movement_breakdown: [
      { step: 1, action: 'Pre-walk assessment — Palpate surgical site for heat, swelling, or pain response. Assess resting comfort level. Confirm pain medication was administered per schedule.', muscle_focus: null, joint_motion: null },
      { step: 2, action: 'Harness and sling application — Fit harness snugly, attach sling if weight-bearing is tentative. Confirm leash is short and non-retractable.', muscle_focus: null, joint_motion: null },
      { step: 3, action: 'Threshold exit — Guide dog from rest area to walking surface. No stairs — use ramp or carry if needed.', muscle_focus: null, joint_motion: null },
      { step: 4, action: 'Initial standing pause — Allow dog to stand and weight-shift for 10-15 seconds before walking. Observe limb placement.', muscle_focus: 'Quadriceps, gluteals (isometric hold)', joint_motion: 'Static weight-bearing through stifle and hip' },
      { step: 5, action: 'Slow forward walking — Walk in straight lines only at the dog\'s chosen pace. Duration: 3-5 min (week 1), 5-10 min (weeks 2-3). Flat, even surface only.', muscle_focus: 'Quadriceps, hamstrings, gastrocnemius (cyclic activation)', joint_motion: 'Stifle flexion-extension through gait cycle' },
      { step: 6, action: 'Controlled turns — Wide, sweeping turns only. No tight pivots. Turn away from the surgical limb to reduce rotational stress on the stifle.', muscle_focus: 'Hip abductors/adductors during arc', joint_motion: 'Minimized tibial rotation during wide arc' },
      { step: 7, action: 'Rest monitoring — Pause every 1-2 minutes. Assess lameness, breathing, engagement. If lameness worsens, end session.', muscle_focus: null, joint_motion: null },
      { step: 8, action: 'Return and cool-down — Walk slowly back. Apply cold therapy (cryotherapy) 10-15 minutes post-walk to surgical stifle.', muscle_focus: null, joint_motion: null },
    ],

    // ── 8. Storyboard Frames ──
    frames: [
      {
        frame_number: 1,
        frame_title: 'Pre-Walk Assessment & Harness Fit',
        frame_description: 'Incision check, harness application, and pain assessment before ambulation',
        dog_action: 'Dog is in lateral or sternal recumbency. Remains still during incision check and harness application. Transitions to standing with handler support.',
        handler_action: 'Palpate surgical stifle for heat, swelling, and pain response. Apply body harness with rear-support handle. Attach short, non-retractable leash. Apply hindquarter sling if weight-bearing is tentative.',
        clinical_cues: 'Assess incision integrity — no dehiscence, erythema, or discharge. Note resting pain score. Confirm analgesic schedule is current. Palpate quadriceps for early atrophy signs.',
        safety_notes: 'Do not proceed if incision is draining, swelling has increased, or dog vocalizes on palpation. Confirm surgeon clearance for ambulation.',
        duration_seconds: 8,
        status: FRAME_STATUS.FREE,
        svg_indicators: [
          { type: SVG_INDICATOR_TYPES.HAND_PLACEMENT, x: 55, y: 50, label: 'Incision palpation zone', color: '#0EA5E9' },
          { type: SVG_INDICATOR_TYPES.HAND_PLACEMENT, x: 50, y: 60, label: 'Quadriceps assessment', color: '#0EA5E9' },
        ],
      },
      {
        frame_number: 2,
        frame_title: 'Assisted Stand & Static Weight Shift',
        frame_description: 'Supported standing with voluntary weight distribution assessment',
        dog_action: 'Dog rises to standing with assistance if needed. Bears weight on all four limbs. May show toe-touching on surgical limb initially. Holds standing position for 10-15 seconds.',
        handler_action: 'Support dog via sling or harness handle. Allow voluntary weight-shifting. Do not force full weight-bearing. Observe limb placement — paw should be plantigrade, not knuckling.',
        clinical_cues: 'Look for voluntary toe-touch to partial weight-bearing. Assess base of support width — widened stance may indicate pain or instability. Note any muscle tremor in the surgical limb.',
        safety_notes: 'If dog cannot achieve toe-touch weight-bearing by post-op day 5, notify surgeon. Do not force the limb down. Watch for compensatory overloading of contralateral hind limb.',
        duration_seconds: 12,
        status: FRAME_STATUS.FREE,
        svg_indicators: [
          { type: SVG_INDICATOR_TYPES.FORCE_VECTOR, x: 60, y: 75, dx: 0, dy: 20, label: 'Reduced WB surgical limb', color: '#D97706' },
          { type: SVG_INDICATOR_TYPES.FORCE_VECTOR, x: 40, y: 75, dx: 0, dy: 20, label: 'Compensatory WB contralateral', color: '#DC2626' },
          { type: SVG_INDICATOR_TYPES.JOINT_PIVOT, x: 58, y: 65, label: 'Stifle joint', color: '#D97706' },
        ],
      },
      {
        frame_number: 3,
        frame_title: 'Slow Forward Walking — Straight Line',
        frame_description: 'Controlled straight-line ambulation at slow, deliberate pace',
        dog_action: 'Dog walks forward at a slow, deliberate pace on flat, non-slip surface. Stride length may be shortened on surgical side. Consistent four-beat gait pattern encouraged.',
        handler_action: 'Walk on surgical side of dog. Hold leash short with 12 inches of slack maximum. Match the dog\'s pace — never pull forward. If using sling, provide 10-20% body weight support. Walk in straight lines only.',
        clinical_cues: 'Monitor stride symmetry — shortened swing phase on surgical limb is expected in week 1. Watch for progressive limb use during the session. Count stride cycles for objective tracking. Normal for dog to shift weight cranially away from surgical limb.',
        safety_notes: 'No trotting, no running, no off-leash. Flat surfaces only — no curbs, grades, or uneven terrain. If lameness increases during the walk, stop immediately and return to rest. Duration: 3-5 min (week 1), 5-10 min (weeks 2-3).',
        duration_seconds: 8,
        status: FRAME_STATUS.FREE,
        svg_indicators: [
          { type: SVG_INDICATOR_TYPES.FORCE_VECTOR, x: 30, y: 50, dx: 40, dy: 0, label: 'Gait direction', color: '#39FF7E' },
          { type: SVG_INDICATOR_TYPES.FLEXION_ARC, x: 58, y: 62, angle_start: -30, angle_end: 30, label: 'Stifle swing phase 40-60°', color: '#0EA5E9' },
          { type: SVG_INDICATOR_TYPES.FORCE_VECTOR, x: 60, y: 80, dx: 0, dy: 15, label: 'Reduced ground reaction force', color: '#D97706' },
          { type: SVG_INDICATOR_TYPES.MUSCLE_HIGHLIGHT, region: 'quadriceps', x: 55, y: 55, rx: 8, ry: 18, label: 'Quadriceps activation', color: 'rgba(14,165,233,0.25)' },
        ],
      },
      {
        frame_number: 4,
        frame_title: 'Controlled Wide Turn',
        frame_description: 'Wide sweeping arc away from the surgical limb',
        dog_action: 'Dog follows handler through a wide, sweeping arc. Maintains slow pace through the turn. Weight remains distributed — no sudden pivoting.',
        handler_action: 'Guide dog through a wide turn, arcing away from the surgical limb. Minimum turn radius of 6-8 feet. No U-turns, no tight circles. Use treats at nose level to guide direction smoothly without leash jerking.',
        clinical_cues: 'Turning away from the surgical limb reduces rotational torque on the healing tibial osteotomy. Watch for circumduction or limb abduction during the arc — may indicate stifle guarding or pain.',
        safety_notes: 'Never pivot. Never turn sharply toward the surgical limb. If the dog resists turning, do not force — walk forward and attempt a wider arc. Avoid figure-8s and circle walking during Phase 1.',
        duration_seconds: 6,
        status: FRAME_STATUS.FREE,
        svg_indicators: [
          { type: SVG_INDICATOR_TYPES.FLEXION_ARC, x: 50, y: 50, angle_start: -45, angle_end: 45, label: 'Wide turn arc ≥6 ft radius', color: '#0EA5E9' },
          { type: SVG_INDICATOR_TYPES.FORCE_VECTOR, x: 50, y: 50, dx: 25, dy: -20, label: 'Turn direction (away from surgical limb)', color: '#39FF7E' },
          { type: SVG_INDICATOR_TYPES.JOINT_PIVOT, x: 58, y: 65, label: 'Stifle — minimize rotation', color: '#DC2626' },
        ],
      },
      {
        frame_number: 5,
        frame_title: 'Return & Post-Walk Cryotherapy',
        frame_description: 'Return to rest area with post-ambulation cold therapy application',
        dog_action: 'Dog walks slowly back to rest area. Settles into sternal or lateral recumbency. Accepts cold pack application to surgical stifle.',
        handler_action: 'Guide dog back at same slow pace. Assist to lying position. Apply cold therapy (ice pack wrapped in thin towel) to lateral and medial aspects of surgical stifle for 10-15 minutes. Remove harness and sling. Offer water.',
        clinical_cues: 'Post-walk cryotherapy reduces inflammatory response and controls post-exercise swelling. Assess limb use during return — should be equal to or better than start. Note any reluctance to lie down (may indicate discomfort).',
        safety_notes: 'Never apply ice directly to skin — always use a barrier layer. Monitor for cold intolerance (pulling away, shivering). Remove after 15 minutes maximum to prevent tissue damage. Log walk duration, lameness score, and any observations.',
        duration_seconds: 8,
        status: FRAME_STATUS.FREE,
        svg_indicators: [
          { type: SVG_INDICATOR_TYPES.HAND_PLACEMENT, x: 60, y: 60, label: 'Cryotherapy — lateral stifle', color: '#0EA5E9' },
          { type: SVG_INDICATOR_TYPES.HAND_PLACEMENT, x: 45, y: 60, label: 'Cryotherapy — medial stifle', color: '#0EA5E9' },
        ],
      },
    ],

    // ── 9. On-Screen Clinical Overlays ──
    overlay_groups: {
      arrows: {
        label: 'Movement Arrows',
        description: 'Gait direction and force vectors along walking path',
        default_visible: true,
        color: '#39FF7E',
      },
      joint_angles: {
        label: 'Joint Angles',
        description: 'Stifle flexion/extension arcs during gait cycle',
        default_visible: true,
        color: '#0EA5E9',
      },
      weight_shift: {
        label: 'Weight Distribution',
        description: 'Limb loading asymmetry and compensatory patterns',
        default_visible: false,
        color: '#D97706',
      },
      good_form: {
        label: 'Good Form',
        description: 'Correct technique markers for handler and patient',
        default_visible: false,
        color: '#059669',
      },
      common_mistakes: {
        label: 'Common Mistakes',
        description: 'Frequent handler errors and gait deviations',
        default_visible: false,
        color: '#D97706',
      },
      safety_warnings: {
        label: 'Safety Alerts',
        description: 'Critical stop signals and post-op precautions',
        default_visible: true,
        color: '#DC2626',
      },
    },

    // ── 10. Branding Layer ──
    branding: {
      neon_accent: '#39FF7E',
      secondary_accent: '#0EA5E9',
      watermark_text: 'K9 Rehab Pro\u2122',
      watermark_opacity: 0.08,
      watermark_position: 'bottom-right',
      asclepius_symbol: true,
      asclepius_position: 'top-left',
      font_title: "'Exo 2', sans-serif",
      font_body: "'Inter', -apple-system, sans-serif",
      color_palette: { navy: '#0A2540', teal: '#0EA5E9', green: '#059669', neon: '#39FF7E' },
    },

    // ── 11. Client-Friendly Script ──
    client_script: {
      duration_range: '20-30 seconds',
      text: 'This short walk helps your dog begin using the surgical leg safely. Keep the leash short and walk slowly — let your dog set the pace. Only walk on flat, non-slip surfaces like grass or carpet. Week one, keep walks to 3-5 minutes, just for bathroom trips. Weeks two and three, you can slowly increase to 5-10 minutes. Always walk in straight lines and make only wide turns. After every walk, apply a cold pack wrapped in a towel to the knee area for 10-15 minutes. If your dog starts limping more during the walk, stop right away and head back. No running, no stairs, no playing — just calm, slow walking.',
      key_phrases: ['walk slowly', 'let your dog set the pace', 'stop right away', 'cold pack', 'no running, no stairs'],
    },

    // ── 12. Clinician-Level Script ──
    clinician_script: {
      duration_range: '20-40 seconds',
      text: 'Controlled leash ambulation initiates at post-op day 3-5 following TPLO, beginning with elimination walks (3-5 min) and progressing to therapeutic sessions (5-10 min) by weeks 2-3. Handler positions ipsilateral to the surgical limb with a fixed 4-6 ft lead. Hindquarter sling provides 10-20% BW support for dogs with < 50% weight-bearing. Walking surface must be flat, non-slip, and obstacle-free. Turns are wide arcs (minimum 6-8 ft radius), always directed away from the surgical limb to minimize tibial rotational forces on the healing osteotomy. Post-ambulation cryotherapy (10-15 min) is applied to control inflammatory response. Monitor for progressive limb use, stride length symmetry, and pain scoring at each session. Red flags: worsening lameness during ambulation, knuckling, complete non-weight bearing beyond day 5, incision complications. Progression to Phase 2 walking (15-20 min, gentle inclines) begins at week 4 pending radiographic confirmation of osteotomy healing.',
      key_phrases: ['ipsilateral', 'tibial rotational forces', 'cryotherapy', 'progressive limb use', 'radiographic confirmation'],
    },

    // ── 13. UI Layout (defined in StoryboardPlayer component) ──

    // ── 14. File Naming Convention ──
    file_naming: {
      convention: 'postop-tplo_early_leash_walk-storyboard-v1',
      format_rule: '{category_slug}-{exercise_code_lower}-storyboard-v{version}',
    },
  },
};


// ============================================================================
// AUTO-STORYBOARD GENERATOR
// Converts any exercise's existing data (steps, setup, equipment, good_form,
// common_mistakes, red_flags, contraindications, description) into the full
// 14-point storyboard specification. Used as fallback when no hand-authored
// storyboard exists in STORYBOARD_LIBRARY.
// ============================================================================

// Category-specific accent colors for auto-generated storyboards
const CATEGORY_ACCENTS = {
  'Passive Therapy':             '#0EA5E9',
  'Active Assisted':             '#10B981',
  'Strengthening':               '#F59E0B',
  'Balance & Proprioception':    '#8B5CF6',
  'Aquatic Therapy':             '#06B6D4',
  'Hydrotherapy':                '#06B6D4',
  'Manual Therapy':              '#059669',
  'Therapeutic Modalities':      '#EC4899',
  'Functional Training':         '#EF4444',
  'Sport Conditioning':          '#F97316',
  'Geriatric Care':              '#6366F1',
  'Neurological Rehab':          '#A855F7',
  'Post-Surgical':               '#DC2626',
  'Pediatric Rehabilitation':    '#22D3EE',
  'Palliative Care':             '#A78BFA',
  'Complementary Therapy':       '#14B8A6',
  'Breed-Specific':              '#F472B6',
  'Athletic Foundations':        '#39FF7E',
};

function extractFrameTitle(text) {
  if (!text) return 'Exercise Step';
  // Try natural break: first clause before comma, dash, period, or semicolon
  const breakMatch = text.match(/^([^,.\-—;:]+)/);
  let title = breakMatch ? breakMatch[1].trim() : text.substring(0, 45).trim();
  // Remove leading filler words
  title = title.replace(/^(slowly|gently|carefully|gradually|then|next|now|and)\s+/i, '');
  // Cap at 50 chars
  if (title.length > 50) title = title.substring(0, 47) + '...';
  // Title case
  return title.replace(/\b\w/g, c => c.toUpperCase());
}

function generateAutoStoryboard(exercise) {
  if (!exercise || !exercise.code) return null;

  const code = exercise.code;
  const name = exercise.name || code;
  const category = exercise.category || 'General';
  const categorySlug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const accent = CATEGORY_ACCENTS[category] || '#0EA5E9';

  // ── 4. Contraindications — parse from comma/semicolon-delimited string ──
  const contraindicationsList = exercise.contraindications
    ? exercise.contraindications.split(/[,;]/).map(s => s.trim()).filter(s => s.length > 3)
    : ['No specific contraindications documented — apply clinical judgment'];

  // ── 5. Equipment — map string array to { item, required } objects ──
  const equipmentNeeded = (exercise.equipment || []).map((item, i) => ({
    item,
    required: i < 2,  // First two items are typically essential
  }));
  if (equipmentNeeded.length === 0) {
    equipmentNeeded.push({ item: 'Non-slip surface', required: true });
  }

  // ── 7. Movement breakdown from steps ──
  const movementBreakdown = (exercise.steps || []).map((step, i) => ({
    step: i + 1,
    action: step,
    muscle_focus: null,
    joint_motion: null,
  }));

  // ── 8. Frames — build from setup + steps, capped at 6 ──
  const rawFrames = [];

  // Frame 1: Setup/Positioning
  if (exercise.setup) {
    rawFrames.push({
      title: 'Setup & Positioning',
      desc: exercise.setup,
      isSetup: true,
    });
  }

  // Remaining frames from steps
  (exercise.steps || []).forEach(step => {
    rawFrames.push({
      title: extractFrameTitle(step),
      desc: step,
      isSetup: false,
    });
  });

  // Cap at 6 frames
  const cappedFrames = rawFrames.slice(0, 6);
  const goodForm = exercise.good_form || [];
  const mistakes = exercise.common_mistakes || [];
  const redFlags = exercise.red_flags || [];

  const frames = cappedFrames.map((rf, i) => ({
    frame_number: i + 1,
    frame_title: rf.title,
    frame_description: rf.desc,
    dog_action: rf.isSetup
      ? 'Patient positioned as described. Relaxed and comfortable.'
      : rf.desc,
    handler_action: rf.isSetup
      ? rf.desc
      : 'Follow step instructions. Maintain proper technique throughout.',
    clinical_cues: goodForm[i] || goodForm[0] || 'Monitor patient comfort and response throughout.',
    safety_notes: redFlags[i] || redFlags[0] || 'Stop if patient shows signs of pain or distress.',
    duration_seconds: rf.isSetup ? 5 : 6,
    status: FRAME_STATUS.FREE,
    svg_indicators: [],
  }));

  // If no frames at all, create a minimal single frame
  if (frames.length === 0) {
    frames.push({
      frame_number: 1,
      frame_title: name,
      frame_description: exercise.description || 'Perform exercise as described.',
      dog_action: 'Patient in appropriate position for this exercise.',
      handler_action: exercise.description || 'Follow clinical guidelines for this exercise.',
      clinical_cues: goodForm[0] || 'Monitor patient comfort and response throughout.',
      safety_notes: redFlags[0] || 'Stop if patient shows signs of pain or distress.',
      duration_seconds: 6,
      status: FRAME_STATUS.FREE,
      svg_indicators: [],
    });
  }

  // ── 9. Standard overlay groups ──
  const overlay_groups = {
    arrows: {
      label: 'Movement Arrows',
      description: 'Direction of limb or body motion during each phase',
      default_visible: true,
      color: '#39FF7E',
    },
    joint_angles: {
      label: 'Joint Angles',
      description: 'Goniometric measurements and ROM arcs',
      default_visible: true,
      color: '#0EA5E9',
    },
    weight_shift: {
      label: 'Weight Distribution',
      description: 'Center of mass and load-bearing indicators',
      default_visible: false,
      color: '#D97706',
    },
    good_form: {
      label: 'Good Form',
      description: 'Correct technique confirmation labels',
      default_visible: false,
      color: '#059669',
    },
    common_mistakes: {
      label: 'Common Mistakes',
      description: 'Warning labels for frequent errors',
      default_visible: false,
      color: '#D97706',
    },
    safety_warnings: {
      label: 'Safety Alerts',
      description: 'Critical safety warnings and stop signals',
      default_visible: true,
      color: '#DC2626',
    },
  };

  // ── 10. Branding ──
  const branding = {
    neon_accent: accent,
    secondary_accent: '#0EA5E9',
    watermark_text: 'K9 Rehab Pro\u2122',
    watermark_opacity: 0.08,
    watermark_position: 'bottom-right',
    asclepius_symbol: true,
    asclepius_position: 'top-left',
    font_title: "'Exo 2', sans-serif",
    font_body: "'Inter', -apple-system, sans-serif",
    color_palette: { navy: '#0A2540', teal: '#0EA5E9', green: '#059669', neon: '#39FF7E' },
  };

  // ── 11. Client script — plain-language summary ──
  const clientSteps = (exercise.steps || []).slice(0, 4).map((s, i) => `Step ${i + 1}: ${s}`).join(' ');
  const clientText = `This exercise is called "${name}". ${exercise.description || ''} Here is what to do: ${exercise.setup || 'Position your dog comfortably.'} ${clientSteps} ${redFlags.length > 0 ? 'Important: ' + redFlags[0] : 'Stop if your dog shows signs of pain or discomfort.'} Always follow your veterinarian\'s guidance.`;
  const client_script = {
    duration_range: '20-30 seconds',
    text: clientText.replace(/\s+/g, ' ').trim(),
    key_phrases: ['stop', 'veterinarian', 'comfort', 'slowly'].filter(kp =>
      clientText.toLowerCase().includes(kp)
    ).concat(['follow your veterinarian\'s guidance']),
  };

  // ── 12. Clinician script — clinical-grade summary ──
  const clinGoodForm = goodForm.length > 0 ? ' Key technique points: ' + goodForm.join('. ') + '.' : '';
  const clinMistakes = mistakes.length > 0 ? ' Common errors: ' + mistakes.join('. ') + '.' : '';
  const clinProgression = exercise.progression ? ' Progression: ' + exercise.progression : '';
  const clinContra = contraindicationsList.length > 0 ? ' Contraindications: ' + contraindicationsList.join('; ') + '.' : '';
  const clinText = `${name} — ${category}. ${exercise.description || ''}${clinGoodForm}${clinMistakes}${clinProgression}${clinContra}`;
  const clinician_script = {
    duration_range: '20-40 seconds',
    text: clinText.replace(/\s+/g, ' ').trim(),
    key_phrases: [name, category, 'contraindication'].filter(kp =>
      clinText.toLowerCase().includes(kp.toLowerCase())
    ),
  };

  // ── Full 14-point storyboard ──
  return {
    exercise_code: code,
    exercise_name: name,
    version: '1.0-auto',
    last_updated: '2026-02-21',
    auto_generated: true,
    clinical_purpose: exercise.description || '',
    indications: [`${category} — as indicated per clinical assessment and patient evaluation`],
    contraindications: contraindicationsList,
    equipment_needed: equipmentNeeded,
    handler_setup: exercise.setup || 'Follow standard positioning for this exercise category.',
    movement_breakdown: movementBreakdown,
    frames,
    overlay_groups,
    branding,
    client_script,
    clinician_script,
    file_naming: {
      convention: `${categorySlug}-${code.toLowerCase()}-storyboard-v1`,
      format_rule: '{category_slug}-{exercise_code_lower}-storyboard-v{version}',
    },
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Cache for auto-generated storyboards (avoids regenerating on every call)
const _autoStoryboardCache = {};

function getStoryboardByCode(exerciseCode) {
  return STORYBOARD_LIBRARY[exerciseCode] || null;
}

function getOrGenerateStoryboard(exerciseCode, exerciseData) {
  // Manual storyboard takes priority
  const manual = STORYBOARD_LIBRARY[exerciseCode];
  if (manual) return manual;
  // Auto-generate from exercise data
  if (!exerciseData) return null;
  if (_autoStoryboardCache[exerciseCode]) return _autoStoryboardCache[exerciseCode];
  const auto = generateAutoStoryboard(exerciseData);
  if (auto) _autoStoryboardCache[exerciseCode] = auto;
  return auto;
}

function getStoryboardFrames(exerciseCode, exerciseData) {
  const sb = getOrGenerateStoryboard(exerciseCode, exerciseData);
  return sb ? sb.frames : null;
}

function getStoryboardScript(exerciseCode, mode, exerciseData) {
  const sb = getOrGenerateStoryboard(exerciseCode, exerciseData);
  if (!sb) return null;
  if (mode === 'clinician') return sb.clinician_script;
  return sb.client_script;
}

function getExercisesWithStoryboards() {
  return Object.keys(STORYBOARD_LIBRARY).map(code => ({
    code,
    exercise_name: STORYBOARD_LIBRARY[code].exercise_name,
    frame_count: STORYBOARD_LIBRARY[code].frames.length,
    version: STORYBOARD_LIBRARY[code].version,
  }));
}

function getStoryboardStats() {
  const codes = Object.keys(STORYBOARD_LIBRARY);
  const totalFrames = codes.reduce((sum, code) => sum + STORYBOARD_LIBRARY[code].frames.length, 0);
  return {
    total_storyboards: codes.length,
    total_frames: totalFrames,
    exercises_covered: codes,
    average_frames_per_exercise: codes.length > 0 ? (totalFrames / codes.length).toFixed(1) : 0,
  };
}


// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  STORYBOARD_LIBRARY,
  OVERLAY_TYPES,
  FRAME_STATUS,
  SVG_INDICATOR_TYPES,
  getStoryboardByCode,
  getOrGenerateStoryboard,
  generateAutoStoryboard,
  getStoryboardFrames,
  getStoryboardScript,
  getExercisesWithStoryboards,
  getStoryboardStats,
};
