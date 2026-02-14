// ============================================================================
// ENHANCED EXERCISES - MEDICAL-GRADE METADATA EXAMPLE
// K9-REHAB-PRO - Clinical-Grade Exercise Structure
// ============================================================================
// This file demonstrates the enhanced exercise structure with:
// - Clinical classification taxonomy
// - Evidence-based references
// - Billing codes
// - Safety classifications
// - Certification requirements
// ============================================================================

const {
  INTERVENTION_TYPES,
  REHAB_PHASES,
  BODY_SYSTEMS,
  EVIDENCE_GRADES,
  CERTIFICATION_LEVELS,
  PRIMARY_INDICATIONS
} = require('./exercise-taxonomy');

const { CORE_REFERENCES } = require('./evidence-references');

// ============================================================================
// EXAMPLE: ENHANCED EXERCISE STRUCTURE
// ============================================================================

const ENHANCED_EXERCISES_EXAMPLES = [
  {
    // ========================================================================
    // EXISTING FIELDS (unchanged)
    // ========================================================================
    code: 'PROM_STIFLE',
    name: 'Passive Range of Motion - Stifle',
    category: 'Passive Therapy',
    description: 'Gentle manual manipulation of the stifle joint through its available range of motion without active muscle contraction from the patient.',

    equipment: ['Cushioned surface', 'Treat rewards'],

    setup: 'Position dog in lateral recumbency on soft surface. Support affected limb at thigh bone and shin bone. Ensure patient is relaxed.',

    steps: [
      'Stabilize femur with one hand',
      'Gently grasp tibia/foot with other hand',
      'Slowly flex stifle to comfortable end range',
      'Hold flexed position for 5-10 seconds',
      'Slowly extend back to neutral',
      'Maintain smooth, controlled motion throughout',
      'Complete 10-15 repetitions per session'
    ],

    good_form: [
      'Smooth, controlled movements without jerking',
      'Dog remains relaxed throughout',
      'No forcing beyond comfortable range',
      'Consistent range maintained across reps'
    ],

    common_mistakes: [
      'Moving too quickly or jerking',
      'Forcing past point of resistance',
      'Inadequate stabilization',
      'Performing when patient is tense'
    ],

    red_flags: [
      'Vocalization or signs of pain',
      'Muscle spasm or guarding',
      'Increased swelling post-session',
      'Loss of previously gained range',
      'Joint instability or grinding or crackling'
    ],

    progression: 'Increase repetitions to 20-25. Add gentle overpressure at end range once pain-free. Progress to active-assisted ROM.',

    contraindications: 'Acute fracture, unstable joint, severe pain, acute infection, malignancy near joint.',

    difficulty_level: 'Easy',

    // ========================================================================
    // NEW MEDICAL-GRADE FIELDS
    // ========================================================================

    clinical_classification: {
      // Primary intervention type
      intervention_type: INTERVENTION_TYPES.PASSIVE_MODALITY.code,
      intervention_subcategory: 'PROM',

      // Applicable rehabilitation phases
      rehab_phases: [
        REHAB_PHASES.SUBACUTE.code,
        REHAB_PHASES.CHRONIC.code,
        REHAB_PHASES.MAINTENANCE.code
      ],

      // Body systems addressed
      body_systems: [BODY_SYSTEMS.MUSCULOSKELETAL.code],

      // Primary indications (conditions this exercise treats)
      primary_indications: [
        PRIMARY_INDICATIONS.CCL_REPAIR,
        PRIMARY_INDICATIONS.OSTEOARTHRITIS,
        PRIMARY_INDICATIONS.PATELLAR_LUXATION,
        PRIMARY_INDICATIONS.FRACTURE
      ],

      // Secondary indications
      secondary_indications: [
        'Post-surgical stifle procedures',
        'Joint stiffness',
        'Capsular restrictions',
        'Chronic lameness'
      ]
    },

    // Evidence-based support
    evidence_base: {
      // Evidence quality rating
      grade: EVIDENCE_GRADES.GRADE_A.code,

      // Peer-reviewed references
      references: [
        CORE_REFERENCES.PROM_CCL,
        CORE_REFERENCES.MILLIS_LEVINE_2014
      ],

      // Key research findings
      key_findings: 'Early PROM after CCL surgery improves ROM recovery, reduces complications, and accelerates return to function. Grade A evidence from multiple RCTs.',

      // Certification level required
      certification_required: CERTIFICATION_LEVELS.BASIC.code
    },

    // Clinical parameters & dosage
    clinical_parameters: {
      // Recommended dosage
      dosage: {
        sets: '2-3',
        repetitions: '10-15',
        hold_time: '5-10 seconds',
        frequency: '2-3x daily',
        duration: '5-10 minutes per session'
      },

      // Timing post-surgery (if applicable)
      post_surgical_timing: {
        earliest_start: '24-48 hours',
        optimal_start: '3-5 days',
        phase: 'Subacute'
      },

      // Absolute contraindications
      contraindications_absolute: [
        'Acute fracture (non-stabilized)',
        'Unstable joint requiring surgical intervention',
        'Acute septic arthritis',
        'Malignancy at or near joint',
        'Recent joint injection (< 24 hours)'
      ],

      // Relative contraindications (proceed with caution)
      contraindications_relative: [
        'Severe osteoarthritis with significant crepitus',
        'Acute inflammatory flare-up',
        'Hemarthrosis',
        'Patient anxiety or aggression',
        'Severe pain (>6/10 on pain scale)'
      ],

      // Precautions during performance
      precautions: [
        'Monitor pain response continuously',
        'Stop if patient vocalizes or shows distress',
        'Avoid forcing past end-range resistance',
        'Ensure adequate analgesia before session',
        'Monitor for increased swelling 2-4 hours post-treatment'
      ],

      // Parameters to monitor
      monitoring_requirements: [
        'ROM measurements (goniometry)',
        'Pain scores (pre/post session)',
        'Joint effusion/swelling',
        'Lameness grade',
        'Patient tolerance'
      ],

      // Expected outcomes
      expected_outcomes: {
        short_term: '10-15° ROM improvement within 1-2 weeks',
        long_term: 'Full or near-full ROM restoration within 4-6 weeks',
        functional: 'Improved gait mechanics and weight-bearing'
      }
    },

    // Billing & documentation
    billing_codes: {
      cpt_code: '97140',  // Manual therapy techniques
      description: 'Manual therapy techniques, 1 or more regions, each 15 minutes',
      time_units: 1,      // 1 unit = 15 minutes
      icd10_codes: [
        'M25.561 - Pain in right knee',
        'M24.561 - Contracture, right knee',
        'Z47.89 - Aftercare following joint replacement surgery'
      ],
      documentation_requirements: [
        'Initial ROM measurements',
        'Pain assessment',
        'Treatment time and technique',
        'Patient response',
        'Home exercise compliance'
      ]
    },

    // Safety classification
    safety: {
      risk_level: 'Low',  // Low, Moderate, High
      supervision_required: 'Direct supervision recommended for first 2-3 sessions',
      patient_positioning: 'Lateral recumbency on padded surface',
      handler_safety: 'Minimal risk; watch for aggressive response to pain',

      adverse_events: {
        common: ['Temporary soreness', 'Mild muscle fatigue'],
        uncommon: ['Increased joint effusion', 'Pain exacerbation'],
        rare: ['Joint subluxation (if unstable)', 'Soft tissue injury']
      }
    },

    // Special populations
    special_populations: {
      geriatric: {
        applicable: true,
        modifications: 'Reduce ROM by 10-20%, shorter session duration',
        precautions: 'Monitor for arthritis flare-ups'
      },

      pediatric: {
        applicable: true,
        modifications: 'Gentler handling, distraction with treats',
        precautions: 'Growth plate considerations in young dogs'
      },

      neurological: {
        applicable: true,
        modifications: 'May have reduced sensation; monitor closely',
        precautions: 'Ensure no spasticity present'
      },

      giant_breed: {
        applicable: true,
        modifications: 'May require two handlers for support',
        precautions: 'Heavy limb weight consideration'
      },

      toy_breed: {
        applicable: true,
        modifications: 'Extra gentle handling, use of small props',
        precautions: 'Patellar luxation considerations'
      }
    },

    // Integration with other therapies
    multimodal_integration: {
      combines_well_with: [
        'Cryotherapy (before PROM to reduce pain/inflammation)',
        'Thermotherapy (before PROM to increase tissue extensibility)',
        'Massage (to relax muscles before PROM)',
        'Laser therapy (for pain management)',
        'TENS (for pain control during session)'
      ],

      contraindicated_combinations: [
        'Do not perform immediately after intra-articular injection',
        'Avoid if receiving NSAIDs that mask pain response'
      ],

      recommended_sequence: [
        '1. Thermotherapy (10 min)',
        '2. Massage/soft tissue mobilization (5 min)',
        '3. PROM (10 min)',
        '4. Cryotherapy (10 min)'
      ]
    },

    // Educational resources
    client_education: {
      home_program_suitable: true,
      teaching_time: '15-20 minutes',
      video_available: true,
      handout_available: true,

      key_teaching_points: [
        'Always warm up joint with gentle movement first',
        'Stop if dog shows any sign of pain',
        'Move slowly and smoothly - no bouncing',
        'Keep sessions short and positive',
        'Contact vet if swelling increases'
      ],

      common_client_questions: [
        {
          q: 'How will I know if I\'m hurting my dog?',
          a: 'Watch for vocalizations, pulling away, muscle tensing, or changes in facial expression. Stop immediately if any occur.'
        },
        {
          q: 'How soon will I see improvement?',
          a: 'Most dogs show measurable ROM improvement within 1-2 weeks with twice-daily sessions.'
        },
        {
          q: 'Can I do this too much?',
          a: 'Yes - limit to 2-3 sessions per day. Overworking can cause inflammation and setbacks.'
        }
      ]
    }
  }
];

module.exports = ENHANCED_EXERCISES_EXAMPLES;
