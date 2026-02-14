/**
 * K9-REHAB-PRO BACKEND API SERVER v2.0
 * Integrated Exercise Library + Protocol Generation Engine
 * 
 * CLINICAL STANDARDS:
 * - Millis & Levine (2014) rehabilitation protocols
 * - Evidence-based exercise selection
 * - Comprehensive safety screening
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { initializeDatabase, PatientDB, ProtocolDB, ExerciseLogDB, ProgressDB } = require('./database');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ============================================================================
// COMPREHENSIVE EXERCISE LIBRARY (33 exercises)
// ============================================================================

const EXERCISE_LIBRARY = {
  // WARM-UP & MOBILITY (11 exercises)
  'EX-001': {
    name: 'Passive ROM - Shoulder Flexion/Extension',
    category: 'Warm-up & Mobility',
    primaryGoal: 'Maintain joint mobility, prevent contracture',
    targetRegion: 'Shoulder (scapulohumeral joint)',
    indications: ['POST_SURGICAL_ORTHOPEDIC', 'TPLO', 'TTA', 'FRACTURE_REPAIR', 'NEUROLOGIC', 'MUSCLE_ATROPHY'],
    contraindications: ['ACTIVE_INFECTION', 'OPEN_INCISION', 'PAIN_SCORE_8_PLUS', 'UNSTABLE_FRACTURE'],
    equipment: [],
    dosage: {
      ACUTE: '10 repetitions × 2-3 sets × 2-3 times daily (hold 5 seconds)',
      SUBACUTE: '15 repetitions × 3 sets × 2 times daily (hold 10 seconds)',
      CHRONIC: '20 repetitions × 2 sets × 1 time daily'
    },
    evidenceLevel: 'HIGH',
    references: 'Millis & Levine 2014, Chapter 17'
  },

  'EX-002': {
    name: 'Passive ROM - Hip Flexion/Extension',
    category: 'Warm-up & Mobility',
    primaryGoal: 'Maintain hip mobility, reduce stiffness',
    targetRegion: 'Hip (coxofemoral joint)',
    indications: ['POST_FHO', 'HIP_DYSPLASIA', 'HIP_REPLACEMENT', 'CCL_SURGERY', 'IVDD'],
    contraindications: ['HIP_LUXATION_RISK', 'UNSTABLE_FRACTURE', 'SEVERE_PAIN', 'ACUTE_HIP_TRAUMA'],
    equipment: [],
    dosage: {
      ACUTE: '10 repetitions × 2 sets × 2 times daily (hold 5 seconds)',
      SUBACUTE: '15 repetitions × 3 sets × 2 times daily (hold 10 seconds)',
      CHRONIC: '20 repetitions × 2 sets × 1 time daily'
    },
    evidenceLevel: 'HIGH',
    references: 'Millis & Levine 2014'
  },

  'EX-003': {
    name: 'Passive ROM - Elbow Flexion/Extension',
    category: 'Warm-up & Mobility',
    primaryGoal: 'Prevent elbow contracture',
    targetRegion: 'Elbow (humeroradial/ulnar joint)',
    indications: ['ELBOW_DYSPLASIA', 'FCP_SURGERY', 'OCD_SURGERY', 'FORELIMB_FRACTURE'],
    contraindications: ['ACUTE_ELBOW_LUXATION', 'SEVERE_JOINT_EFFUSION'],
    equipment: [],
    dosage: {
      ACUTE: '10 repetitions × 2 sets × 2-3 times daily (hold 3-5 seconds)',
      SUBACUTE: '15 repetitions × 3 sets × 2 times daily (hold 5-10 seconds)',
      CHRONIC: '15-20 repetitions × 2 sets × 1 time daily'
    },
    evidenceLevel: 'MODERATE',
    references: 'Levine et al. 2010'
  },

  'EX-004': {
    name: 'Passive ROM - Stifle (Knee) Flexion/Extension',
    category: 'Warm-up & Mobility',
    primaryGoal: 'Maintain stifle mobility post-surgery',
    targetRegion: 'Stifle (tibiofemoral joint)',
    indications: ['TPLO', 'TTA', 'LATERAL_SUTURE', 'MENISCAL_REPAIR', 'PATELLAR_LUXATION'],
    contraindications: ['IMPLANT_FAILURE_SUSPECTED', 'ACUTE_INFECTION', 'PATELLAR_LUXATION_GRADE_4'],
    equipment: [],
    dosage: {
      ACUTE: '10-15 repetitions × 3 sets × 2-3 times daily (hold 5-10 seconds)',
      SUBACUTE: '15-20 repetitions × 3 sets × 2 times daily (hold 10 seconds)',
      CHRONIC: '20 repetitions × 2 sets × 1 time daily'
    },
    evidenceLevel: 'HIGH',
    references: 'Millis et al. 2004, Monk et al. 2006'
  },

  'EX-007': {
    name: 'Passive Stifle Flexion Hold',
    category: 'Warm-up & Mobility',
    primaryGoal: 'Maximize post-surgical flexion ROM',
    targetRegion: 'Stifle',
    indications: ['TPLO', 'TTA', 'CCL_SURGERY'],
    contraindications: ['MENISCAL_TEAR_SUSPECTED', 'SEVERE_PAIN'],
    equipment: [],
    dosage: {
      SUBACUTE: '15-20 holds × 10 seconds × 2 times daily',
      CHRONIC: '20-30 holds × 10 seconds × 1-2 times daily'
    },
    evidenceLevel: 'MODERATE',
    references: 'Marsolais et al. 2002'
  },

  'EX-008': {
    name: 'Gentle Stretching - Hind Limb',
    category: 'Warm-up & Mobility',
    primaryGoal: 'Prevent muscle contracture',
    targetRegion: 'Biceps femoris, hamstrings',
    indications: ['POST_SURGICAL_ORTHOPEDIC', 'MUSCLE_ATROPHY', 'SOFT_TISSUE_INJURY'],
    contraindications: ['ACUTE_MUSCLE_STRAIN', 'SEVERE_PAIN'],
    equipment: [],
    dosage: {
      SUBACUTE: '3-5 repetitions × 15-30 second hold × 2 times daily',
      CHRONIC: '5-10 repetitions × 30-60 second hold × 1-2 times daily'
    },
    evidenceLevel: 'MODERATE',
    references: 'Canine Sports Medicine 2018'
  },

  'EX-020': {
    name: 'Cookie Stretches - Lateral Flexion',
    category: 'Active Mobility',
    primaryGoal: 'Improve spinal flexibility',
    targetRegion: 'Thoracolumbar spine',
    indications: ['IVDD', 'SPONDYLOSIS', 'BACK_PAIN', 'GERIATRIC'],
    contraindications: ['ACUTE_IVDD', 'SEVERE_BACK_PAIN', 'RECENT_SPINAL_SURGERY'],
    equipment: ['treats'],
    dosage: {
      SUBACUTE: '5 repetitions per side × 2-3 times daily',
      CHRONIC: '10 repetitions per side × 1-2 times daily'
    },
    evidenceLevel: 'MODERATE',
    references: 'Millis & Levine 2014, Chapter 19'
  },

  // STRENGTH & ACTIVATION (8 exercises)
  'EX-040': {
    name: 'Sit-to-Stand',
    category: 'Strength & Activation',
    primaryGoal: 'Quadriceps strengthening, pelvic limb activation',
    targetRegion: 'Quadriceps, gluteals, hamstrings',
    indications: ['POST_SURGICAL_ORTHOPEDIC', 'TPLO', 'TTA', 'HIP_DYSPLASIA', 'PATELLAR_LUXATION', 'GERIATRIC'],
    contraindications: ['NON_WEIGHT_BEARING', 'PAIN_SCORE_7_PLUS', 'UNABLE_TO_SIT'],
    equipment: [],
    dosage: {
      SUBACUTE: '3-5 repetitions × 2 sets × 1 time daily',
      CHRONIC: '8-15 repetitions × 2-3 sets × 1-2 times daily',
      RETURN_TO_FUNCTION: '15-20 repetitions × 3 sets × 3-5 times weekly'
    },
    evidenceLevel: 'HIGH',
    references: 'Monk et al. 2006, Levine et al. 2010'
  },

  'EX-041': {
    name: 'Down-to-Stand',
    category: 'Strength & Activation',
    primaryGoal: 'Hip flexor, hamstring strengthening',
    targetRegion: 'Hip flexors, hamstrings, core',
    indications: ['HAMSTRING_STRENGTH', 'HIP_STRENGTH', 'CORE_STABILITY'],
    contraindications: ['SPINAL_PAIN', 'HIP_LUXATION_RISK'],
    equipment: [],
    dosage: {
      SUBACUTE: '5-10 repetitions × 2-3 sets × 1 time daily',
      CHRONIC: '10-15 repetitions × 3 sets × 1-2 times daily'
    },
    evidenceLevel: 'MODERATE',
    references: 'Millis & Levine 2014'
  },

  'EX-042': {
    name: 'Three-Leg Standing',
    category: 'Strength & Activation',
    primaryGoal: 'Increase weight-bearing on affected limb',
    targetRegion: 'All limbs (targeted strengthening)',
    indications: ['TOE_TOUCHING', 'PARTIAL_WEIGHT_BEARING', 'MUSCLE_ATROPHY'],
    contraindications: ['NON_WEIGHT_BEARING', 'SEVERE_INSTABILITY'],
    equipment: [],
    dosage: {
      SUBACUTE: '5-10 second holds × 3-5 repetitions per limb × 2 times daily',
      CHRONIC: '10-20 second holds × 5-10 repetitions × 1-2 times daily'
    },
    evidenceLevel: 'HIGH',
    references: 'Millis et al. 2004'
  },

  'EX-044': {
    name: 'Cavaletti Rails',
    category: 'Strength & Activation',
    primaryGoal: 'Hip flexion, limb coordination',
    targetRegion: 'Hip flexors, stifle extensors',
    indications: ['PROPRIOCEPTIVE_DEFICIT', 'GAIT_TRAINING', 'POST_NEUROLOGIC'],
    contraindications: ['ACUTE_PAIN', 'SEVERE_ATAXIA'],
    equipment: ['cavaletti_rails'],
    dosage: {
      CHRONIC: '2-3 passes over 4-6 rails × 1-2 times daily (height: 2-4 inches)',
      RETURN_TO_FUNCTION: '3-5 passes × 2-3 times daily (height: 4-6 inches)'
    },
    evidenceLevel: 'MODERATE',
    references: 'McGonagle et al. 2020'
  },

  'EX-045': {
    name: 'Backwards Walking',
    category: 'Strength & Activation',
    primaryGoal: 'Gluteal activation, hamstring eccentric strengthening',
    targetRegion: 'Gluteals, hamstrings, core',
    indications: ['HIP_DYSPLASIA', 'POST_FHO', 'CORE_WEAKNESS'],
    contraindications: ['SEVERE_ATAXIA', 'ACUTE_PAIN'],
    equipment: [],
    dosage: {
      CHRONIC: '10-15 steps × 2-3 sets × 1-2 times daily',
      RETURN_TO_FUNCTION: '20-30 steps × 3 sets × 2-3 times daily'
    },
    evidenceLevel: 'MODERATE',
    references: 'Millis & Levine 2014, Chapter 18'
  },

  // PROPRIOCEPTION & BALANCE (7 exercises)
  'EX-091': {
    name: 'Static Standing Balance',
    category: 'Proprioception & Balance',
    primaryGoal: 'Improve postural stability',
    targetRegion: 'All limbs, core stabilizers',
    indications: ['ALL_CONDITIONS', 'PROPRIOCEPTIVE_DEFICIT', 'NEUROLOGIC'],
    contraindications: ['NON_WEIGHT_BEARING'],
    equipment: [],
    dosage: {
      SUBACUTE: '10-15 second holds × 3-5 repetitions × 1 time daily',
      CHRONIC: '20-30 second holds × 5-10 repetitions × 1-2 times daily',
      RETURN_TO_FUNCTION: '30-60 second holds × 3-5 repetitions × 1-2 times daily'
    },
    evidenceLevel: 'HIGH',
    references: 'Millis & Levine 2014, Chapter 21'
  },

  'EX-092': {
    name: 'Weight Shifting - Medial/Lateral',
    category: 'Proprioception & Balance',
    primaryGoal: 'Improve lateral stability',
    targetRegion: 'Hip abductors/adductors, shoulder stabilizers',
    indications: ['PROPRIOCEPTIVE_DEFICIT', 'POST_SURGICAL', 'GAIT_ASYMMETRY'],
    contraindications: ['SEVERE_INSTABILITY'],
    equipment: [],
    dosage: {
      SUBACUTE: '10-15 shifts × 2 sets × 1 time daily',
      CHRONIC: '15-20 shifts × 2-3 sets × 1-2 times daily'
    },
    evidenceLevel: 'MODERATE',
    references: 'Canine Rehabilitation Institute 2018'
  },

  'EX-093': {
    name: 'Weight Shifting - Cranial/Caudal',
    category: 'Proprioception & Balance',
    primaryGoal: 'Improve front-to-rear weight distribution',
    targetRegion: 'Forelimb/hindlimb stabilizers',
    indications: ['PROPRIOCEPTIVE_DEFICIT', 'GAIT_SYMMETRY'],
    contraindications: [],
    equipment: [],
    dosage: {
      SUBACUTE: '10-15 shifts × 2 sets × 1 time daily',
      CHRONIC: '15-20 shifts × 2-3 sets × 1-2 times daily'
    },
    evidenceLevel: 'MODERATE',
    references: 'Levine et al. 2010'
  },

  'EX-094': {
    name: 'Unstable Surface Standing (Wobble Board)',
    category: 'Proprioception & Balance',
    primaryGoal: 'Advanced proprioceptive challenge',
    targetRegion: 'All stabilizers, core',
    indications: ['PROPRIOCEPTIVE_DEFICIT', 'RETURN_TO_SPORT'],
    contraindications: ['ACUTE_INJURY', 'SEVERE_ATAXIA'],
    equipment: ['wobble_board'],
    dosage: {
      CHRONIC: '10-20 second holds × 3-5 repetitions × 1-2 times daily',
      RETURN_TO_FUNCTION: '30-60 second holds × 3-5 repetitions × 2-3 times daily'
    },
    evidenceLevel: 'MODERATE',
    references: 'McGonagle et al. 2020'
  },

  // AQUATIC THERAPY (2 exercises)
  'EX-110': {
    name: 'Underwater Treadmill Walking',
    category: 'Aquatic Therapy',
    primaryGoal: 'Low-impact strengthening, gait training',
    targetRegion: 'All limbs, cardiovascular system',
    indications: ['POST_SURGICAL_ORTHOPEDIC', 'HIP_DYSPLASIA', 'OBESITY', 'GERIATRIC', 'NEUROLOGIC'],
    contraindications: ['OPEN_WOUNDS', 'INCISION_NOT_HEALED', 'SEVERE_FEAR_OF_WATER'],
    equipment: ['underwater_treadmill'],
    dosage: {
      SUBACUTE: '5-10 minutes × 2-3 times weekly (water level: mid-femur)',
      CHRONIC: '10-20 minutes × 3-4 times weekly',
      RETURN_TO_FUNCTION: '20-30 minutes × 3-5 times weekly'
    },
    evidenceLevel: 'HIGH',
    references: 'Levine et al. 2010, Marsolais et al. 2003'
  },

  // CONDITIONING & ENDURANCE (5 exercises)
  'EX-130': {
    name: 'Leash Walking - Level Ground',
    category: 'Conditioning & Endurance',
    primaryGoal: 'Cardiovascular conditioning, gait normalization',
    targetRegion: 'All limbs, cardiovascular system',
    indications: ['ALL_CONDITIONS', 'RETURN_TO_FUNCTION'],
    contraindications: ['NON_WEIGHT_BEARING', 'PAIN_7_PLUS'],
    equipment: ['leash'],
    dosage: {
      SUBACUTE: '5-10 minutes × 2-3 times daily (slow pace)',
      CHRONIC: '10-20 minutes × 1-2 times daily (moderate pace)',
      RETURN_TO_FUNCTION: '20-30 minutes × 1-2 times daily (brisk pace)'
    },
    evidenceLevel: 'HIGH',
    references: 'Millis & Levine 2014'
  },

  'EX-131': {
    name: 'Leash Walking - Incline (Uphill)',
    category: 'Conditioning & Endurance',
    primaryGoal: 'Hind limb strengthening, gluteal activation',
    targetRegion: 'Gluteals, hamstrings, quadriceps',
    indications: ['HIP_DYSPLASIA', 'CCL_SURGERY', 'MUSCLE_ATROPHY'],
    contraindications: ['ACUTE_PAIN', 'EARLY_POST_OP'],
    equipment: ['leash'],
    dosage: {
      CHRONIC: '5-10 minutes uphill × 1 time daily',
      RETURN_TO_FUNCTION: '10-15 minutes uphill × 1-2 times daily'
    },
    evidenceLevel: 'HIGH',
    references: 'Monk et al. 2006'
  },

  'EX-132': {
    name: 'Controlled Stair Climbing',
    category: 'Conditioning & Endurance',
    primaryGoal: 'Hip/stifle strengthening',
    targetRegion: 'Hind limb extensors',
    indications: ['ADVANCED_STRENGTHENING'],
    contraindications: ['ACUTE_POST_OP', 'PAIN', 'POOR_BALANCE'],
    equipment: ['stairs'],
    dosage: {
      CHRONIC: '3-5 repetitions up/down × 1 time daily',
      RETURN_TO_FUNCTION: '5-10 repetitions × 1-2 times daily'
    },
    evidenceLevel: 'MODERATE',
    references: 'Millis & Levine 2014'
  },

  // ADDITIONAL WARM-UP & MOBILITY
  'EX-005': {
    name: 'Passive ROM - Carpus (Wrist)',
    category: 'Warm-up & Mobility',
    primaryGoal: 'Maintain carpal flexibility',
    targetRegion: 'Carpus (radiocarpal joint)',
    indications: ['CARPAL_FRACTURE', 'FORELIMB_SURGERY', 'NEUROLOGIC'],
    contraindications: ['UNSTABLE_FRACTURE', 'ACUTE_LIGAMENT_RUPTURE'],
    equipment: [],
    dosage: {
      ACUTE: '10 repetitions × 2 sets × 2 times daily (hold 5 seconds)',
      SUBACUTE: '15 repetitions × 3 sets × 2 times daily',
      CHRONIC: '15-20 repetitions × 2 sets × 1 time daily'
    },
    evidenceLevel: 'MODERATE',
    references: 'Canine Rehabilitation Institute 2018'
  },

  'EX-006': {
    name: 'Passive ROM - Tarsus (Hock)',
    category: 'Warm-up & Mobility',
    primaryGoal: 'Prevent tarsal contracture',
    targetRegion: 'Tarsus (tibiotarsal joint)',
    indications: ['ACHILLES_TENDON_REPAIR', 'TARSAL_FRACTURE', 'NEUROLOGIC'],
    contraindications: ['ACUTE_ACHILLES_RUPTURE', 'UNSTABLE_FRACTURE'],
    equipment: [],
    dosage: {
      ACUTE: '10 repetitions × 2 sets × 2 times daily',
      SUBACUTE: '15 repetitions × 3 sets × 2 times daily',
      CHRONIC: '20 repetitions × 2 sets × 1 time daily'
    },
    evidenceLevel: 'MODERATE',
    references: 'Millis & Levine 2014'
  },

  'EX-009': {
    name: 'Passive ROM - Digits (Toes)',
    category: 'Warm-up & Mobility',
    primaryGoal: 'Maintain digit flexibility',
    targetRegion: 'Phalanges',
    indications: ['DIGIT_FRACTURE', 'PAW_PAD_INJURY', 'NERVE_INJURY'],
    contraindications: ['OPEN_WOUNDS', 'INFECTION'],
    equipment: [],
    dosage: {
      ACUTE: '5 repetitions per digit × 2 sets × 2 times daily',
      SUBACUTE: '10 repetitions per digit × 2 sets × 2 times daily',
      CHRONIC: '10 repetitions per digit × 1-2 times daily'
    },
    evidenceLevel: 'LOW-MODERATE',
    references: 'Clinical practice guidelines'
  },

  'EX-021': {
    name: 'Cookie Stretches - Chin-to-Chest',
    category: 'Active Mobility',
    primaryGoal: 'Cervical spine flexibility',
    targetRegion: 'Cervical spine',
    indications: ['NECK_PAIN', 'CERVICAL_IVDD', 'GERIATRIC'],
    contraindications: ['ACUTE_CERVICAL_PAIN', 'CERVICAL_INSTABILITY'],
    equipment: ['treats'],
    dosage: {
      SUBACUTE: '5 repetitions × 2 times daily (hold 3-5 seconds)',
      CHRONIC: '10 repetitions × 1-2 times daily'
    },
    evidenceLevel: 'LOW-MODERATE',
    references: 'Canine Rehab Institute 2019'
  },

  'EX-022': {
    name: 'Cookie Stretches - Upward Extension',
    category: 'Active Mobility',
    primaryGoal: 'Cervical extension, balance',
    targetRegion: 'Cervical spine, core',
    indications: ['CERVICAL_MOBILITY', 'CORE_STABILITY'],
    contraindications: ['CERVICAL_PAIN', 'SEVERE_ATAXIA'],
    equipment: ['treats'],
    dosage: {
      SUBACUTE: '5 repetitions × 2-3 times daily (hold 5 seconds)',
      CHRONIC: '10 repetitions × 1-2 times daily (hold 10 seconds)'
    },
    evidenceLevel: 'LOW-MODERATE',
    references: 'Canine Sports Medicine 2018'
  },

  // ADDITIONAL STRENGTH & ACTIVATION
  'EX-043': {
    name: 'Wheelbarrowing',
    category: 'Strength & Activation',
    primaryGoal: 'Forelimb strength, core stability',
    targetRegion: 'Triceps, shoulder stabilizers, core',
    indications: ['FORELIMB_SURGERY', 'ELBOW_DYSPLASIA', 'SHOULDER_INSTABILITY'],
    contraindications: ['ELBOW_PAIN', 'SHOULDER_LUXATION'],
    equipment: [],
    dosage: {
      CHRONIC: '10-20 steps × 2-3 sets × 1-2 times daily',
      RETURN_TO_FUNCTION: '20-30 steps × 3 sets × 3-5 times weekly'
    },
    evidenceLevel: 'MODERATE',
    references: 'Levine et al. 2010'
  },

  'EX-046': {
    name: 'Lateral Walking (Sidestepping)',
    category: 'Strength & Activation',
    primaryGoal: 'Hip abductor/adductor strengthening',
    targetRegion: 'Hip abductors, adductors, core',
    indications: ['HIP_DYSPLASIA', 'CORE_STABILITY', 'ADVANCED_STRENGTHENING'],
    contraindications: ['ACUTE_HIP_PAIN'],
    equipment: [],
    dosage: {
      CHRONIC: '5-10 steps per direction × 2-3 sets × 1-2 times daily',
      RETURN_TO_FUNCTION: '10-15 steps per direction × 3 sets × 2-3 times daily'
    },
    evidenceLevel: 'MODERATE',
    references: 'Levine et al. 2010'
  },

  'EX-047': {
    name: 'Figure-8 Walking',
    category: 'Strength & Activation',
    primaryGoal: 'Limb coordination, balance',
    targetRegion: 'All limbs, core stabilizers',
    indications: ['PROPRIOCEPTIVE_TRAINING', 'GAIT_SYMMETRY', 'ADVANCED_CONDITIONING'],
    contraindications: ['SEVERE_LAMENESS', 'ACUTE_PAIN'],
    equipment: ['cones'],
    dosage: {
      CHRONIC: '3-5 figure-8 patterns × 1-2 times daily',
      RETURN_TO_FUNCTION: '5-10 figure-8 patterns × 2-3 times daily'
    },
    evidenceLevel: 'MODERATE',
    references: 'Canine Sports Medicine 2018'
  },

  'EX-048': {
    name: 'Dancing (Bipedal Standing)',
    category: 'Strength & Activation',
    primaryGoal: 'Hind limb strengthening, core stability',
    targetRegion: 'Hind limb extensors, core',
    indications: ['ADVANCED_STRENGTHENING', 'RETURN_TO_SPORT'],
    contraindications: ['BACK_PAIN', 'HIP_LUXATION_RISK', 'POOR_BALANCE'],
    equipment: ['treats'],
    dosage: {
      CHRONIC: '3-5 second holds × 3-5 repetitions × 1 time daily',
      RETURN_TO_FUNCTION: '5-10 second holds × 5-10 repetitions × 1-2 times daily'
    },
    evidenceLevel: 'LOW-MODERATE',
    references: 'Clinical practice guidelines'
  },

  'EX-049': {
    name: 'Tug-of-War (Controlled)',
    category: 'Strength & Activation',
    primaryGoal: 'Neck, shoulder, forelimb strengthening',
    targetRegion: 'Neck extensors, shoulder stabilizers',
    indications: ['FORELIMB_STRENGTHENING', 'NECK_STRENGTH'],
    contraindications: ['CERVICAL_PAIN', 'SHOULDER_INJURY', 'DENTAL_ISSUES'],
    equipment: ['rope_toy'],
    dosage: {
      CHRONIC: '5-10 pulls × 2-3 sets × 1 time daily (gentle resistance)',
      RETURN_TO_FUNCTION: '10-15 pulls × 3 sets × 2-3 times daily'
    },
    evidenceLevel: 'LOW',
    references: 'Clinical practice guidelines'
  },

  // ADDITIONAL PROPRIOCEPTION & BALANCE
  'EX-095': {
    name: 'Foam Pad Standing',
    category: 'Proprioception & Balance',
    primaryGoal: 'Proprioceptive challenge, joint stabilization',
    targetRegion: 'Ankle/wrist stabilizers, proprioceptors',
    indications: ['PROPRIOCEPTIVE_DEFICIT', 'NEUROLOGIC'],
    contraindications: ['SEVERE_ATAXIA', 'NON_WEIGHT_BEARING'],
    equipment: ['foam_pad'],
    dosage: {
      CHRONIC: '20-30 second holds × 3-5 repetitions × 1-2 times daily',
      RETURN_TO_FUNCTION: '30-60 second holds × 5-10 repetitions × 1-2 times daily'
    },
    evidenceLevel: 'MODERATE',
    references: 'Millis & Levine 2014'
  },

  'EX-096': {
    name: 'Physio Ball Exercises',
    category: 'Proprioception & Balance',
    primaryGoal: 'Core strengthening, dynamic balance',
    targetRegion: 'Core musculature, spinal stabilizers',
    indications: ['CORE_WEAKNESS', 'BACK_PAIN_PREVENTION', 'ADVANCED_TRAINING'],
    contraindications: ['ACUTE_BACK_PAIN', 'IVDD_ACUTE'],
    equipment: ['physio_ball'],
    dosage: {
      CHRONIC: '10-20 second holds × 3-5 repetitions × 1-2 times daily',
      RETURN_TO_FUNCTION: '30-60 second holds × 5-10 repetitions × 2-3 times daily'
    },
    evidenceLevel: 'MODERATE',
    references: 'Canine Rehabilitation Institute 2019'
  },

  'EX-097': {
    name: 'Paw Target Training',
    category: 'Proprioception & Balance',
    primaryGoal: 'Limb awareness, targeted placement',
    targetRegion: 'All limbs, neuromuscular control',
    indications: ['PROPRIOCEPTIVE_DEFICIT', 'NEUROLOGIC', 'GAIT_TRAINING'],
    contraindications: [],
    equipment: ['target_pads'],
    dosage: {
      SUBACUTE: '10-15 repetitions per limb × 2-3 sets × 1-2 times daily',
      CHRONIC: '15-20 repetitions per limb × 3 sets × 1-2 times daily'
    },
    evidenceLevel: 'LOW-MODERATE',
    references: 'Clinical practice guidelines'
  },

  'EX-098': {
    name: 'Balance Board (Rocker)',
    category: 'Proprioception & Balance',
    primaryGoal: 'Dynamic balance, ankle stability',
    targetRegion: 'Distal limb stabilizers',
    indications: ['ADVANCED_PROPRIOCEPTION', 'RETURN_TO_SPORT'],
    contraindications: ['SEVERE_INSTABILITY', 'ACUTE_INJURY'],
    equipment: ['rocker_board'],
    dosage: {
      CHRONIC: '15-30 second holds × 3-5 repetitions × 1 time daily',
      RETURN_TO_FUNCTION: '30-60 second holds × 5-10 repetitions × 2 times daily'
    },
    evidenceLevel: 'MODERATE',
    references: 'McGonagle et al. 2020'
  },

  'EX-099': {
    name: 'Trampoline Standing',
    category: 'Proprioception & Balance',
    primaryGoal: 'Advanced unstable surface training',
    targetRegion: 'All stabilizers, core',
    indications: ['ADVANCED_PROPRIOCEPTION', 'RETURN_TO_SPORT'],
    contraindications: ['ACUTE_INJURY', 'SEVERE_ATAXIA', 'ANXIETY'],
    equipment: ['mini_trampoline'],
    dosage: {
      CHRONIC: '20-30 second holds × 3-5 repetitions × 1 time daily',
      RETURN_TO_FUNCTION: '30-60 second holds × 5-10 repetitions × 2 times daily'
    },
    evidenceLevel: 'MODERATE',
    references: 'Canine Sports Medicine 2018'
  },

  // ADDITIONAL AQUATIC THERAPY
  'EX-111': {
    name: 'Swimming (Pool)',
    category: 'Aquatic Therapy',
    primaryGoal: 'Full-body conditioning, low-impact',
    targetRegion: 'All muscle groups, cardiovascular',
    indications: ['OBESITY', 'HIP_DYSPLASIA', 'ELBOW_DYSPLASIA', 'GERIATRIC', 'RETURN_TO_SPORT'],
    contraindications: ['FEAR_OF_WATER', 'OPEN_WOUNDS', 'EAR_INFECTION', 'RESPIRATORY_ISSUES'],
    equipment: ['pool', 'life_vest'],
    dosage: {
      CHRONIC: '5-10 minutes × 2-3 times weekly',
      RETURN_TO_FUNCTION: '10-20 minutes × 3-5 times weekly'
    },
    evidenceLevel: 'HIGH',
    references: 'Marsolais et al. 2002, Millis & Levine 2014'
  },

  'EX-112': {
    name: 'Aquatic Treadmill - Deep Water',
    category: 'Aquatic Therapy',
    primaryGoal: 'Maximum buoyancy for non-weight-bearing',
    targetRegion: 'All limbs',
    indications: ['EARLY_POST_OP', 'SEVERE_ARTHRITIS', 'OBESITY'],
    contraindications: ['FEAR_OF_WATER', 'INCISION_NOT_HEALED'],
    equipment: ['underwater_treadmill'],
    dosage: {
      ACUTE: '3-5 minutes × 2-3 times weekly (water at shoulder level)',
      SUBACUTE: '5-10 minutes × 3-4 times weekly'
    },
    evidenceLevel: 'HIGH',
    references: 'Levine et al. 2010'
  },

  'EX-113': {
    name: 'Aquatic Treadmill - Shallow Water',
    category: 'Aquatic Therapy',
    primaryGoal: 'Progressive weight-bearing with resistance',
    targetRegion: 'Hind limbs, core',
    indications: ['STRENGTH_BUILDING', 'GAIT_TRAINING'],
    contraindications: ['OPEN_WOUNDS', 'FEAR_OF_WATER'],
    equipment: ['underwater_treadmill'],
    dosage: {
      CHRONIC: '10-15 minutes × 3-4 times weekly (water at carpus/tarsus)',
      RETURN_TO_FUNCTION: '15-20 minutes × 4-5 times weekly'
    },
    evidenceLevel: 'HIGH',
    references: 'Marsolais et al. 2003'
  },

  // ADDITIONAL CONDITIONING & ENDURANCE
  'EX-133': {
    name: 'Trotting (On-Leash)',
    category: 'Conditioning & Endurance',
    primaryGoal: 'Cardiovascular conditioning, gait symmetry',
    targetRegion: 'All limbs, cardiovascular',
    indications: ['RETURN_TO_SPORT', 'ADVANCED_CONDITIONING'],
    contraindications: ['LAMENESS', 'PAIN', 'EARLY_POST_OP'],
    equipment: ['leash'],
    dosage: {
      RETURN_TO_FUNCTION: '5-10 minutes trotting × 3-5 times weekly'
    },
    evidenceLevel: 'MODERATE',
    references: 'Canine Sports Medicine 2018'
  },

  'EX-134': {
    name: 'Controlled Ball Chase',
    category: 'Conditioning & Endurance',
    primaryGoal: 'Functional return to play',
    targetRegion: 'Full body, agility, cardiovascular',
    indications: ['RETURN_TO_SPORT', 'WORKING_DOG_CONDITIONING'],
    contraindications: ['LAMENESS', 'PAIN', 'NOT_CLEARED_BY_VET'],
    equipment: ['ball', 'long_leash'],
    dosage: {
      RETURN_TO_FUNCTION: '5-10 controlled throws × 2-3 times weekly'
    },
    evidenceLevel: 'LOW-MODERATE',
    references: 'Clinical practice guidelines'
  },

  'EX-135': {
    name: 'Jogging (On-Leash)',
    category: 'Conditioning & Endurance',
    primaryGoal: 'Progressive cardiovascular conditioning',
    targetRegion: 'All limbs, cardiovascular',
    indications: ['ADVANCED_CONDITIONING', 'RETURN_TO_SPORT'],
    contraindications: ['LAMENESS', 'PAIN'],
    equipment: ['leash'],
    dosage: {
      RETURN_TO_FUNCTION: '5-15 minutes × 3-4 times weekly'
    },
    evidenceLevel: 'MODERATE',
    references: 'Millis & Levine 2014'
  },

  'EX-136': {
    name: 'Sand/Beach Walking',
    category: 'Conditioning & Endurance',
    primaryGoal: 'Resistance training, proprioception',
    targetRegion: 'All limbs, core',
    indications: ['STRENGTH_BUILDING', 'ADVANCED_CONDITIONING'],
    contraindications: ['SEVERE_LAMENESS', 'ACUTE_PAIN'],
    equipment: [],
    dosage: {
      CHRONIC: '5-10 minutes × 2-3 times weekly',
      RETURN_TO_FUNCTION: '10-20 minutes × 3-4 times weekly'
    },
    evidenceLevel: 'MODERATE',
    references: 'Levine et al. 2010'
  },

  // THERAPEUTIC MODALITIES
  'EX-200': {
    name: 'Cryotherapy (Ice Application)',
    category: 'Therapeutic Modalities',
    primaryGoal: 'Reduce inflammation, pain control',
    targetRegion: 'Affected area',
    indications: ['ACUTE_INFLAMMATION', 'POST_EXERCISE', 'SWELLING', 'ACUTE_INJURY'],
    contraindications: ['CIRCULATORY_DISORDERS', 'COLD_HYPERSENSITIVITY'],
    equipment: ['ice_pack', 'towel'],
    dosage: {
      ACUTE: '10-15 minutes × 3-4 times daily (wrap in towel)',
      SUBACUTE: '10-15 minutes × 2-3 times daily after exercise'
    },
    evidenceLevel: 'HIGH',
    references: 'Millis & Levine 2014, Chapter 11'
  },

  'EX-201': {
    name: 'Thermotherapy (Heat Application)',
    category: 'Therapeutic Modalities',
    primaryGoal: 'Increase tissue extensibility, pain relief',
    targetRegion: 'Muscles, joints',
    indications: ['CHRONIC_PAIN', 'MUSCLE_STIFFNESS', 'PRE_EXERCISE_WARMUP'],
    contraindications: ['ACUTE_INFLAMMATION', 'SWELLING', 'INFECTION', 'TUMOR'],
    equipment: ['heat_pack', 'towel'],
    dosage: {
      CHRONIC: '15-20 minutes × 2-3 times daily (wrap in towel)',
      RETURN_TO_FUNCTION: '10-15 minutes before exercise as warm-up'
    },
    evidenceLevel: 'MODERATE',
    references: 'Millis & Levine 2014'
  },

  'EX-202': {
    name: 'Massage - Effleurage (Light Stroking)',
    category: 'Therapeutic Modalities',
    primaryGoal: 'Relaxation, circulation',
    targetRegion: 'Muscles, soft tissue',
    indications: ['ALL_CONDITIONS', 'MUSCLE_TENSION', 'ANXIETY', 'PRE_EXERCISE'],
    contraindications: ['OPEN_WOUNDS', 'INFECTION', 'FRACTURE'],
    equipment: [],
    dosage: {
      ACUTE: '5-10 minutes × 2-3 times daily (gentle)',
      CHRONIC: '10-15 minutes × 1-2 times daily'
    },
    evidenceLevel: 'MODERATE',
    references: 'Canine Massage Therapy 2016'
  },

  'EX-203': {
    name: 'Massage - Petrissage (Kneading)',
    category: 'Therapeutic Modalities',
    primaryGoal: 'Muscle relaxation, break adhesions',
    targetRegion: 'Deep muscles',
    indications: ['MUSCLE_TENSION', 'TRIGGER_POINTS', 'CHRONIC_PAIN'],
    contraindications: ['ACUTE_INJURY', 'INFLAMMATION', 'FRACTURE'],
    equipment: [],
    dosage: {
      SUBACUTE: '5-10 minutes × 1-2 times daily',
      CHRONIC: '10-15 minutes × 1 time daily'
    },
    evidenceLevel: 'MODERATE',
    references: 'Canine Massage Therapy 2016'
  },

  'EX-204': {
    name: 'Laser Therapy (Class IV)',
    category: 'Therapeutic Modalities',
    primaryGoal: 'Pain relief, tissue healing, reduce inflammation',
    targetRegion: 'Affected area',
    indications: ['POST_SURGICAL', 'ARTHRITIS', 'SOFT_TISSUE_INJURY', 'WOUND_HEALING'],
    contraindications: ['PREGNANCY', 'TUMOR', 'THYROID', 'EYES'],
    equipment: ['class_iv_laser'],
    dosage: {
      ACUTE: '5-10 minutes per site × 3-5 times weekly',
      SUBACUTE: '5-10 minutes per site × 3-4 times weekly',
      CHRONIC: '5-10 minutes per site × 2-3 times weekly'
    },
    evidenceLevel: 'HIGH',
    references: 'Looney et al. 2018, Draper et al. 2012'
  },

  'EX-205': {
    name: 'TENS (Transcutaneous Electrical Nerve Stimulation)',
    category: 'Therapeutic Modalities',
    primaryGoal: 'Pain modulation',
    targetRegion: 'Painful area',
    indications: ['CHRONIC_PAIN', 'NEUROPATHIC_PAIN', 'ARTHRITIS'],
    contraindications: ['PACEMAKER', 'PREGNANCY', 'EPILEPSY', 'TUMOR'],
    equipment: ['tens_unit'],
    dosage: {
      CHRONIC: '15-30 minutes × 1-2 times daily',
      RETURN_TO_FUNCTION: '20 minutes × 1 time daily as needed'
    },
    evidenceLevel: 'MODERATE',
    references: 'Millis & Levine 2014, Chapter 13'
  },

  'EX-206': {
    name: 'Neuromuscular Electrical Stimulation (NMES)',
    category: 'Therapeutic Modalities',
    primaryGoal: 'Muscle re-education, prevent atrophy',
    targetRegion: 'Atrophied muscles',
    indications: ['MUSCLE_ATROPHY', 'NEUROLOGIC', 'POST_SURGICAL'],
    contraindications: ['PACEMAKER', 'PREGNANCY', 'INFECTION', 'TUMOR'],
    equipment: ['nmes_unit'],
    dosage: {
      SUBACUTE: '15-20 minutes × 1-2 times daily',
      CHRONIC: '20-30 minutes × 1 time daily'
    },
    evidenceLevel: 'HIGH',
    references: 'Millis & Levine 2014, Johnson et al. 2019'
  },

  'EX-300': {
    name: 'Cryotherapy (Ice Pack Application)',
    category: 'Therapeutic Modalities',
    primaryGoal: 'Reduce inflammation, manage acute pain',
    targetRegion: 'Affected joint or soft tissue',
    indications: ['ACUTE_POST_OP', 'ACUTE_INJURY', 'POST_EXERCISE_INFLAMMATION', 'TPLO', 'TTA', 'FRACTURE_REPAIR'],
    contraindications: ['COLD_INTOLERANCE', 'PERIPHERAL_VASCULAR_DISEASE', 'OPEN_WOUNDS'],
    equipment: ['Ice pack or cold compress', 'Towel barrier'],
    dosage: {
      ACUTE: '15-20 minutes × 3-4 times daily (within first 72 hours post-injury)',
      SUBACUTE: '15 minutes × 2-3 times daily (post-exercise)',
      CHRONIC: '10-15 minutes × 1-2 times daily (as needed for flare-ups)'
    },
    technique: 'Apply ice pack wrapped in thin towel to affected area. Monitor skin for excessive cold response. Remove if patient shows discomfort.',
    evidenceLevel: 'HIGH',
    references: 'Millis & Levine 2014 Chapter 16 - Cryotherapy protocols'
  }
};

// TOTAL: 50 COMPREHENSIVE, EVIDENCE-BASED EXERCISES
// Core rehabilitation exercises covering all phases: ACUTE → SUBACUTE → CHRONIC → RETURN_TO_FUNCTION

// ============================================================================
// CONDITIONS DATABASE
// ============================================================================

const CONDITIONS = {
  'TPLO': {
    name: 'Tibial Plateau Leveling Osteotomy',
    category: 'POST_SURGICAL_ORTHOPEDIC',
    affectedRegion: 'STIFLE',
    stageMapping: {
      ACUTE: { daysMin: 0, daysMax: 14 },
      SUBACUTE: { daysMin: 15, daysMax: 42 },
      CHRONIC: { daysMin: 43, daysMax: 180 },
      RETURN_TO_FUNCTION: { daysMin: 181, daysMax: 999 }
    },
    criticalContraindications: ['IMPLANT_FAILURE_SUSPECTED', 'ACUTE_INFECTION', 'NON_WEIGHT_BEARING_AFTER_DAY_7']
  },

  'TTA': {
    name: 'Tibial Tuberosity Advancement',
    category: 'POST_SURGICAL_ORTHOPEDIC',
    affectedRegion: 'STIFLE',
    stageMapping: {
      ACUTE: { daysMin: 0, daysMax: 14 },
      SUBACUTE: { daysMin: 15, daysMax: 42 },
      CHRONIC: { daysMin: 43, daysMax: 180 },
      RETURN_TO_FUNCTION: { daysMin: 181, daysMax: 999 }
    },
    criticalContraindications: ['IMPLANT_FAILURE_SUSPECTED', 'ACUTE_INFECTION']
  },

  'FHO': {
    name: 'Femoral Head Ostectomy',
    category: 'POST_SURGICAL_ORTHOPEDIC',
    affectedRegion: 'HIP',
    stageMapping: {
      ACUTE: { daysMin: 0, daysMax: 14 },
      SUBACUTE: { daysMin: 15, daysMax: 56 },
      CHRONIC: { daysMin: 57, daysMax: 180 },
      RETURN_TO_FUNCTION: { daysMin: 181, daysMax: 999 }
    }
  },

  'HIP_DYSPLASIA': {
    name: 'Hip Dysplasia',
    category: 'NON_SURGICAL_ORTHOPEDIC',
    affectedRegion: 'HIP'
  },

  'CCL_TEAR': {
    name: 'Cranial Cruciate Ligament Tear',
    category: 'NON_SURGICAL_ORTHOPEDIC',
    affectedRegion: 'STIFLE'
  },

  'IVDD': {
    name: 'Intervertebral Disc Disease',
    category: 'NEUROLOGIC',
    affectedRegion: 'SPINE'
  },

  'ELBOW_DYSPLASIA': {
    name: 'Elbow Dysplasia',
    category: 'NON_SURGICAL_ORTHOPEDIC',
    affectedRegion: 'ELBOW'
  },

  'PATELLAR_LUXATION': {
    name: 'Patellar Luxation',
    category: 'NON_SURGICAL_ORTHOPEDIC',
    affectedRegion: 'STIFLE'
  }
};

// ============================================================================
// ENHANCED SAFETY FILTERING
// ============================================================================

/**
 * Comprehensive safety screening system
 * Returns contraindications that patient currently has
 */
function identifyPatientContraindications(intake) {
  const contraindications = [];

  // Pain-based contraindications
  if (intake.painWithActivity >= 8) {
    contraindications.push('PAIN_SCORE_8_PLUS');
  }
  if (intake.painWithActivity >= 7) {
    contraindications.push('PAIN_SCORE_7_PLUS');
  }
  if (intake.painWithActivity >= 6) {
    contraindications.push('PAIN_7_PLUS'); // Alternate naming
  }

  // Weight-bearing status
  if (intake.mobilityLevel === 'NON_WEIGHT_BEARING') {
    contraindications.push('NON_WEIGHT_BEARING');
  }

  // Incision status
  if (intake.incisionStatus === 'OPEN' || intake.incisionStatus === 'INFECTED') {
    contraindications.push('OPEN_INCISION');
    contraindications.push('ACTIVE_INFECTION');
    contraindications.push('INCISION_NOT_HEALED');
  }
  
  if (intake.incisionStatus === 'NOT_HEALED') {
    contraindications.push('INCISION_NOT_HEALED');
  }

  // Post-surgical timeline
  if (intake.daysPostSurgery !== undefined) {
    if (intake.daysPostSurgery <= 7) {
      contraindications.push('EARLY_POST_OP');
    }
    if (intake.daysPostSurgery <= 14) {
      contraindications.push('ACUTE_POST_OP');
    }
  }

  // Instability flags
  if (intake.jointInstability === true) {
    contraindications.push('SEVERE_INSTABILITY');
  }

  // Neurologic status
  if (intake.ataxiaSeverity === 'SEVERE') {
    contraindications.push('SEVERE_ATAXIA');
  }

  return contraindications;
}

/**
 * Filter exercises based on patient contraindications
 */
function filterExercisesByContraindications(exerciseIds, patientContraindications) {
  const safeExercises = [];
  const filteredOut = [];

  exerciseIds.forEach(exId => {
    const exercise = EXERCISE_LIBRARY[exId];
    if (!exercise) return;

    // Check if exercise has any contraindication that patient has
    const hasContraindication = exercise.contraindications.some(contra =>
      patientContraindications.includes(contra)
    );

    if (hasContraindication) {
      filteredOut.push({
        exerciseId: exId,
        name: exercise.name,
        reason: 'Contraindication match'
      });
    } else {
      safeExercises.push(exId);
    }
  });

  return { safeExercises, filteredOut };
}

/**
 * Red flag detection system
 */
function detectRedFlags(intake) {
  const redFlags = [];

  // Critical pain level
  if (intake.painWithActivity >= 8) {
    redFlags.push({
      severity: 'CRITICAL',
      message: 'Pain level ≥8/10 - immediate veterinary consultation required',
      action: 'STOP_ALL_EXERCISES'
    });
  }

  // Non-weight-bearing after expected timeline
  if (intake.daysPostSurgery > 7 && intake.mobilityLevel === 'NON_WEIGHT_BEARING') {
    redFlags.push({
      severity: 'HIGH',
      message: 'Non-weight-bearing beyond day 7 post-surgery',
      action: 'VETERINARY_RECHECK_REQUIRED'
    });
  }

  // Active infection
  if (intake.incisionStatus === 'INFECTED') {
    redFlags.push({
      severity: 'CRITICAL',
      message: 'Active infection present',
      action: 'IMMEDIATE_VETERINARY_CARE'
    });
  }

  // Suspected implant failure (user-reported)
  if (intake.implantConcern === true) {
    redFlags.push({
      severity: 'CRITICAL',
      message: 'Implant failure suspected',
      action: 'EMERGENCY_VETERINARY_CONSULTATION'
    });
  }

  return redFlags;
}

// ============================================================================
// STAGE DETERMINATION
// ============================================================================

function determineRehabStage(intake) {
  const condition = CONDITIONS[intake.diagnosis];
  
  if (!condition) {
    return 'CHRONIC'; // Default fallback
  }

  // Post-surgical conditions use days post-surgery
  if (condition.category === 'POST_SURGICAL_ORTHOPEDIC' && intake.daysPostSurgery !== undefined) {
    const days = intake.daysPostSurgery;
    const mapping = condition.stageMapping;

    if (days >= mapping.ACUTE.daysMin && days <= mapping.ACUTE.daysMax) {
      return 'ACUTE';
    }
    if (days >= mapping.SUBACUTE.daysMin && days <= mapping.SUBACUTE.daysMax) {
      return 'SUBACUTE';
    }
    if (days >= mapping.CHRONIC.daysMin && days <= mapping.CHRONIC.daysMax) {
      return 'CHRONIC';
    }
    if (days >= mapping.RETURN_TO_FUNCTION.daysMin) {
      return 'RETURN_TO_FUNCTION';
    }
  }

  // Non-surgical conditions use pain and mobility level
  const pain = intake.painWithActivity || 0;
  
  if (pain >= 7) return 'ACUTE';
  if (pain >= 4) return 'SUBACUTE';
  
  return 'CHRONIC';
}

// ============================================================================
// EXERCISE SELECTION ENGINE
// ============================================================================

/**
 * Select appropriate exercises based on condition, stage, and safety
 */
function selectExercisesForProtocol(intake, stage, patientContraindications) {
  const condition = CONDITIONS[intake.diagnosis];
  const selectedIds = [];

  // Step 1: Get all exercises that match the stage
  const stageExercises = Object.keys(EXERCISE_LIBRARY).filter(exId => {
    const ex = EXERCISE_LIBRARY[exId];
    return ex.dosage[stage] !== undefined;
  });

  // Step 2: Filter by indications (condition match)
  const indicationMatched = stageExercises.filter(exId => {
    const ex = EXERCISE_LIBRARY[exId];
    return ex.indications.includes(intake.diagnosis) || 
           ex.indications.includes('ALL_CONDITIONS') ||
           ex.indications.includes(condition?.category);
  });

  // Step 3: Filter by contraindications
  const { safeExercises } = filterExercisesByContraindications(
    indicationMatched,
    patientContraindications
  );

  // Step 4: Category distribution for comprehensive protocol
  const byCategory = {
    'Warm-up & Mobility': [],
    'Strength & Activation': [],
    'Proprioception & Balance': [],
    'Conditioning & Endurance': [],
    'Aquatic Therapy': []
  };

  safeExercises.forEach(exId => {
    const ex = EXERCISE_LIBRARY[exId];
    if (byCategory[ex.category]) {
      byCategory[ex.category].push(exId);
    }
  });

  // Step 5: Select balanced protocol
  // Warm-up: 2-3 exercises
  selectedIds.push(...byCategory['Warm-up & Mobility'].slice(0, 3));
  
  // Strength: 1-2 exercises
  selectedIds.push(...byCategory['Strength & Activation'].slice(0, 2));
  
  // Proprioception: 1-2 exercises (skip in acute)
  if (stage !== 'ACUTE') {
    selectedIds.push(...byCategory['Proprioception & Balance'].slice(0, 2));
  }
  
  // Conditioning: 1 exercise
  selectedIds.push(...byCategory['Conditioning & Endurance'].slice(0, 1));

  return selectedIds;
}

// ============================================================================
// PROTOCOL GENERATION ENGINE
// ============================================================================

function generateWeeklyProtocol(stage, exerciseIds, weekNumber) {
  const exercises = exerciseIds.map(exId => {
    const ex = EXERCISE_LIBRARY[exId];
    return {
      exerciseId: exId,
      name: ex.name,
      category: ex.category,
      dosage: ex.dosage[stage] || 'As tolerated',
      technique: ex.technique,
      targetRegion: ex.targetRegion
    };
  });

  // Weekly focus changes based on stage and week
  let weeklyFocus = '';
  if (stage === 'ACUTE') {
    weeklyFocus = 'Pain management, gentle ROM, minimize inflammation';
  } else if (stage === 'SUBACUTE') {
    if (weekNumber <= 2) weeklyFocus = 'Increase ROM, begin weight-bearing exercises';
    else weeklyFocus = 'Progressive strengthening, improve gait symmetry';
  } else if (stage === 'CHRONIC') {
    if (weekNumber <= 2) weeklyFocus = 'Strength development, functional movement patterns';
    else weeklyFocus = 'Endurance building, advanced proprioception';
  } else {
    weeklyFocus = 'Return to sport conditioning, high-level functional tasks';
  }

  return {
    weekNumber,
    stage,
    focus: weeklyFocus,
    exercises,
    notes: generateWeeklyNotes(stage, weekNumber)
  };
}

function generateWeeklyNotes(stage, weekNumber) {
  const notes = [];

  if (stage === 'ACUTE') {
    notes.push('Monitor for increased pain or swelling after exercises');
    notes.push('Ice after exercise sessions (10-15 minutes)');
    notes.push('Restrict jumping, running, and stairs');
  } else if (stage === 'SUBACUTE') {
    notes.push('Gradually increase exercise duration as tolerated');
    notes.push('Watch for limping or favoring limb');
    notes.push('Continue leash restrictions');
  } else if (stage === 'CHRONIC') {
    notes.push('Increase challenge as strength improves');
    notes.push('Begin introducing stairs (controlled)');
    notes.push('Monitor for signs of overexertion');
  }

  return notes;
}

function generateFullProtocol(intake) {
  const protocolId = `K9RP-${Date.now()}`;
  const stage = determineRehabStage(intake);
  const patientContraindications = identifyPatientContraindications(intake);
  const redFlags = detectRedFlags(intake);

  // CRITICAL: Stop if red flags present
  if (redFlags.some(flag => flag.severity === 'CRITICAL')) {
    return {
      protocolId,
      status: 'REJECTED',
      redFlags,
      message: 'PROTOCOL CANNOT BE GENERATED - Critical safety concerns detected. Immediate veterinary consultation required.'
    };
  }

  // Select exercises
  const selectedExerciseIds = selectExercisesForProtocol(
    intake,
    stage,
    patientContraindications
  );

  // Generate 8-week protocol
  const weeklyProtocol = [];
  for (let week = 1; week <= 8; week++) {
    weeklyProtocol.push(
      generateWeeklyProtocol(stage, selectedExerciseIds, week)
    );
  }

  // Build complete protocol
  return {
    protocolId,
    status: 'APPROVED',
    generatedDate: new Date().toISOString(),
    
    // Patient Information
    patient: {
      clientName: intake.clientName,
      patientName: intake.patientName,
      breed: intake.breed,
      weight: intake.weight,
      age: intake.age
    },

    // Clinical Information
    clinical: {
      diagnosis: intake.diagnosis,
      diagnosisName: CONDITIONS[intake.diagnosis]?.name,
      daysPostSurgery: intake.daysPostSurgery,
      painLevel: intake.painWithActivity,
      mobilityLevel: intake.mobilityLevel,
      stage: stage
    },

    // Safety Information
    safety: {
      redFlags: redFlags,
      contraindications: patientContraindications,
      exercisesFiltered: 'See protocol notes'
    },

    // Weekly Protocol
    weeklyProtocol: weeklyProtocol,

    // Legal Disclaimer
    legalDisclaimer: {
      veterinaryOversight: 'This rehabilitation protocol must be supervised by a licensed veterinarian. Do not begin any exercise program without veterinary approval.',
      monitoring: 'Monitor patient closely during all exercises. Stop immediately if pain, limping, or distress occurs.',
      modifications: 'Protocol may need modification based on patient progress. Schedule regular veterinary rechecks.',
      emergencyContact: 'Contact veterinarian immediately if: severe pain, non-weight-bearing, swelling, heat, or wound complications.'
    }
  };
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

// POST /api/generate-protocol
app.post('/api/generate-protocol', async (req, res) => {
  try {
    const intake = req.body;

    // Validate required fields
    const required = ['clientName', 'patientName', 'diagnosis', 'painWithActivity', 'mobilityLevel'];
    const missing = required.filter(field => !intake[field]);
    
    if (missing.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missing: missing
      });
    }

    // Generate protocol
    const protocol = generateFullProtocol(intake);

    // Save to database
    try {
      // 1. Create or find patient
      const patientData = {
        clientName: intake.clientName,
        patientName: intake.patientName,
        species: intake.species || 'Canine',
        breed: intake.breed || 'Mixed Breed',
        age: intake.age || null,
        weight: intake.weight || null
      };
      
      const patient = await PatientDB.create(patientData);

      // 2. Save protocol
      const weeklyExercises = protocol.weeklyProtocol.flatMap(week => 
        week.exercises.map(ex => ({
          weekNumber: week.weekNumber,
          exerciseId: ex.exerciseId,
          exerciseName: ex.name,
          dosage: ex.dosage,
          frequency: ex.frequency || 'As prescribed',
          notes: ex.notes || ''
        }))
      );

      const protocolDbData = {
        protocolId: protocol.protocolId,
        patient_id: patient.patient_id,
        diagnosis: protocol.clinical.diagnosis,
        diagnosisName: protocol.clinical.diagnosisName,
        surgeryDate: intake.surgeryDate || null,
        painLevel: protocol.clinical.painLevel,
        mobilityLevel: protocol.clinical.mobilityLevel,
        rehabStage: protocol.clinical.stage,
        protocolLength: protocol.weeklyProtocol.length,
        weeklyExercises: weeklyExercises,
        notes: `Generated for ${intake.goals ? intake.goals.join(', ') : 'rehabilitation'}`
      };

      await ProtocolDB.save(protocolDbData);

      console.log(`✅ Protocol ${protocol.protocolId} saved to database (Patient ID: ${patient.patient_id})`);

    } catch (dbError) {
      console.error('⚠️ Database save error (protocol still generated):', dbError.message);
      // Continue - return protocol even if DB save fails
    }

    res.status(200).json({
      success: true,
      protocol: protocol
    });

  } catch (error) {
    console.error('Protocol generation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'K9-Rehab-Pro Backend v2.0',
    timestamp: new Date().toISOString(),
    exerciseLibrary: {
      total: Object.keys(EXERCISE_LIBRARY).length,
      version: '1.0.0'
    }
  });
});

// GET /api/exercises
app.get('/api/exercises', (req, res) => {
  const stage = req.query.stage;
  const category = req.query.category;

  let filtered = Object.entries(EXERCISE_LIBRARY);

  if (stage) {
    filtered = filtered.filter(([id, ex]) => ex.dosage[stage]);
  }

  if (category) {
    filtered = filtered.filter(([id, ex]) => ex.category === category);
  }

  const result = Object.fromEntries(filtered);

  res.json({
    total: Object.keys(result).length,
    filters: { stage, category },
    exercises: result
  });
});

// GET /api/conditions
app.get('/api/conditions', (req, res) => {
  res.json({
    total: Object.keys(CONDITIONS).length,
    conditions: CONDITIONS
  });
});

// GET /api/exercise/:id
app.get('/api/exercise/:id', (req, res) => {
  const exercise = EXERCISE_LIBRARY[req.params.id];
  
  if (!exercise) {
    return res.status(404).json({ error: 'Exercise not found' });
  }

  res.json({
    exerciseId: req.params.id,
    ...exercise
  });
});

// ============================================================================
// DATABASE API ENDPOINTS
// ============================================================================

// GET /api/patients - Get all patients
app.get('/api/patients', async (req, res) => {
  try {
    const patients = await PatientDB.findAll();
    res.json({
      success: true,
      total: patients.length,
      patients: patients
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/patients/search - Search patients
app.get('/api/patients/search', async (req, res) => {
  try {
    const searchTerm = req.query.q;
    if (!searchTerm) {
      return res.status(400).json({ error: 'Search query required' });
    }
    const patients = await PatientDB.search(searchTerm);
    res.json({
      success: true,
      total: patients.length,
      searchTerm: searchTerm,
      patients: patients
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/patient/:id - Get specific patient
app.get('/api/patient/:id', async (req, res) => {
  try {
    const patient = await PatientDB.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json({
      success: true,
      patient: patient
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/protocols - Get all active protocols
app.get('/api/protocols', async (req, res) => {
  try {
    const protocols = await ProtocolDB.findActive();
    res.json({
      success: true,
      total: protocols.length,
      protocols: protocols
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/protocol/:id - Get specific protocol with exercises
app.get('/api/protocol/:id', async (req, res) => {
  try {
    const protocol = await ProtocolDB.findById(req.params.id);
    if (!protocol) {
      return res.status(404).json({ error: 'Protocol not found' });
    }
    res.json({
      success: true,
      protocol: protocol
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/patient/:id/protocols - Get all protocols for a patient
app.get('/api/patient/:id/protocols', async (req, res) => {
  try {
    const protocols = await ProtocolDB.findByPatient(req.params.id);
    res.json({
      success: true,
      total: protocols.length,
      protocols: protocols
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/exercise-log - Log completed exercise
app.post('/api/exercise-log', async (req, res) => {
  try {
    const required = ['protocolId', 'exerciseId', 'completedDate'];
    const missing = required.filter(field => !req.body[field]);
    
    if (missing.length > 0) {
      return res.status(400).json({ error: 'Missing required fields', missing });
    }

    const result = await ExerciseLogDB.log(req.body);
    res.json({
      success: true,
      log_id: result.log_id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/protocol/:id/logs - Get exercise logs for a protocol
app.get('/api/protocol/:id/logs', async (req, res) => {
  try {
    const weekNumber = req.query.week ? parseInt(req.query.week) : null;
    const logs = await ExerciseLogDB.findByProtocol(req.params.id, weekNumber);
    res.json({
      success: true,
      total: logs.length,
      logs: logs
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/protocol/:id/compliance - Get compliance statistics
app.get('/api/protocol/:id/compliance', async (req, res) => {
  try {
    const stats = await ExerciseLogDB.getComplianceStats(req.params.id);
    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/progress-assessment - Save progress assessment
app.post('/api/progress-assessment', async (req, res) => {
  try {
    const required = ['protocolId', 'weekNumber', 'assessmentDate'];
    const missing = required.filter(field => !req.body[field]);
    
    if (missing.length > 0) {
      return res.status(400).json({ error: 'Missing required fields', missing });
    }

    const result = await ProgressDB.save(req.body);
    res.json({
      success: true,
      assessment_id: result.assessment_id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/protocol/:id/assessments - Get progress assessments
app.get('/api/protocol/:id/assessments', async (req, res) => {
  try {
    const assessments = await ProgressDB.findByProtocol(req.params.id);
    res.json({
      success: true,
      total: assessments.length,
      assessments: assessments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/protocol/:id/status - Update protocol status
app.put('/api/protocol/:id/status', async (req, res) => {
  try {
    const { status, completedDate } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status required' });
    }
    
    const result = await ProtocolDB.updateStatus(req.params.id, status, completedDate);
    res.json({
      success: true,
      changes: result.changes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

const PORT = process.env.PORT || 3000;

// Initialize database and start server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(70));
      console.log('  K9-REHAB-PRO BACKEND API SERVER v2.0');
      console.log('  Integrated Exercise Library + Protocol Generation + Database');
      console.log('='.repeat(70));
      console.log(`\n  Server running on: http://localhost:${PORT}`);
      console.log('\n  API Endpoints:');
      console.log('  POST /api/generate-protocol      - Generate rehabilitation protocol');
      console.log('  GET  /api/patients                - List all patients');
      console.log('  GET  /api/patient/:id             - Get specific patient');
      console.log('  GET  /api/patient/:id/protocols   - Get patient protocols');
      console.log('  GET  /api/protocols               - List active protocols');
      console.log('  GET  /api/protocol/:id            - Get specific protocol');
      console.log('  POST /api/exercise-log            - Log completed exercise');
      console.log('  GET  /api/protocol/:id/logs       - Get exercise logs');
      console.log('  GET  /api/protocol/:id/compliance - Get compliance stats');
      console.log('  POST /api/progress-assessment     - Save progress assessment');
      console.log('  GET  /api/health                  - Server health check');
      console.log('  GET  /api/exercises               - List all exercises');
      console.log('  GET  /api/exercise/:id            - Get specific exercise');
      console.log('  GET  /api/conditions              - List all conditions');
      console.log('\n  Database:');
      console.log('    ✅ SQLite Database Connected');
      console.log('    📁 File: k9_rehab_pro.db');
      console.log('    📊 Tables: patients, protocols, protocol_exercises, exercise_logs, progress_assessments');
      console.log('\n  Exercise Library:');
      console.log(`    Total Exercises: ${Object.keys(EXERCISE_LIBRARY).length}`);
      console.log('    Evidence-Based: Millis & Levine 2014 Standards');
      console.log('    Safety Filters: Active');
      console.log('\n' + '='.repeat(70) + '\n');
    });
  })
  .catch(err => {
    console.error('❌ Failed to initialize database:', err);
    process.exit(1);
  });

module.exports = app;
