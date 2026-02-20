// ============================================================================
// EXERCISE TAXONOMY - CLINICAL CLASSIFICATION SYSTEM
// K9-REHAB-PRO - Medical-Grade Exercise Organization
// ============================================================================
// Based on:
// - Millis & Levine: Canine Rehabilitation and Physical Therapy (2nd Ed.)
// - CCRP (Certified Canine Rehabilitation Practitioner) Standards
// - Evidence-Based Veterinary Physical Rehabilitation Protocols
// ============================================================================

// ============================================================================
// LEVEL 1: INTERVENTION TYPE (Primary Classification)
// ============================================================================
const INTERVENTION_TYPES = {
  PASSIVE_MODALITY: {
    code: 'PASSIVE',
    name: 'Passive Modality',
    description: 'Therapist-applied interventions without active patient participation',
    subcategories: ['PROM', 'Stretching', 'Passive Positioning', 'Cryotherapy', 'Thermotherapy'],
    billing_category: 'Manual Therapy',
    cpt_base: '97140'
  },

  ACTIVE_THERAPEUTIC: {
    code: 'ACTIVE',
    name: 'Active Therapeutic Exercise',
    description: 'Patient performs movement with varying levels of assistance',
    subcategories: ['Active-Assisted', 'Active', 'Active-Resisted'],
    billing_category: 'Therapeutic Exercise',
    cpt_base: '97110'
  },

  STRENGTHENING_RESISTANCE: {
    code: 'STRENGTH',
    name: 'Strengthening & Resistance Training',
    description: 'Progressive resistance exercises to improve muscle strength and endurance',
    subcategories: ['Isometric', 'Isotonic', 'Isokinetic', 'Plyometric'],
    billing_category: 'Therapeutic Exercise',
    cpt_base: '97110'
  },

  NEUROMUSCULAR_RETRAINING: {
    code: 'NEURO',
    name: 'Neuromuscular Re-education',
    description: 'Balance, proprioception, coordination, and gait training',
    subcategories: ['Balance', 'Proprioception', 'Coordination', 'Gait Training'],
    billing_category: 'Neuromuscular Re-education',
    cpt_base: '97112'
  },

  AQUATIC_HYDROTHERAPY: {
    code: 'AQUATIC',
    name: 'Aquatic Therapy / Hydrotherapy',
    description: 'Water-based therapeutic interventions',
    subcategories: ['Underwater Treadmill', 'Swimming', 'Whirlpool', 'Contrast Therapy'],
    billing_category: 'Therapeutic Activities',
    cpt_base: '97530'
  },

  MANUAL_THERAPY: {
    code: 'MANUAL',
    name: 'Manual Therapy',
    description: 'Hands-on therapeutic techniques',
    subcategories: ['Massage', 'Mobilization', 'Myofascial Release', 'Trigger Point'],
    billing_category: 'Manual Therapy',
    cpt_base: '97140'
  },

  THERAPEUTIC_MODALITIES: {
    code: 'MODALITY',
    name: 'Therapeutic Modalities',
    description: 'Physical agents for pain relief, inflammation reduction, tissue healing',
    subcategories: ['Electrotherapy', 'Ultrasound', 'Laser', 'Thermal'],
    billing_category: 'Physical Agent Modalities',
    cpt_base: '97032-97039'
  },

  FUNCTIONAL_REHABILITATION: {
    code: 'FUNCTIONAL',
    name: 'Functional Rehabilitation',
    description: 'Activities of daily living and sport-specific training',
    subcategories: ['ADL Training', 'Sport-Specific', 'Work Conditioning'],
    billing_category: 'Therapeutic Activities',
    cpt_base: '97530'
  }
};

// ============================================================================
// LEVEL 2: REHABILITATION PHASE
// ============================================================================
const REHAB_PHASES = {
  ACUTE: {
    code: 'ACUTE',
    name: 'Acute Phase',
    description: '0-72 hours post-injury/surgery',
    timeframe: '0-3 days',
    goals: ['Pain control', 'Inflammation management', 'Tissue protection', 'Prevent complications'],
    contraindications: ['Aggressive ROM', 'Weight-bearing', 'Strengthening']
  },

  SUBACUTE: {
    code: 'SUBACUTE',
    name: 'Subacute Phase',
    description: 'Tissue healing and controlled mobilization',
    timeframe: '3 days - 6 weeks',
    goals: ['Restore ROM', 'Improve circulation', 'Begin gentle strengthening', 'Neuromuscular re-education'],
    precautions: ['Monitor pain', 'Avoid overstress', 'Gradual progression']
  },

  CHRONIC: {
    code: 'CHRONIC',
    name: 'Chronic/Recovery Phase',
    description: 'Active rehabilitation and functional restoration',
    timeframe: '6-12 weeks',
    goals: ['Restore strength', 'Improve function', 'Return to activity', 'Prevent re-injury'],
    focus: ['Progressive resistance', 'Functional training', 'Sport-specific exercises']
  },

  MAINTENANCE: {
    code: 'MAINTENANCE',
    name: 'Maintenance Phase',
    description: 'Long-term management and fitness',
    timeframe: '12+ weeks',
    goals: ['Maintain strength', 'Prevent deconditioning', 'Quality of life', 'Disease management'],
    populations: ['Chronic conditions', 'Geriatric', 'Palliative']
  }
};

// ============================================================================
// LEVEL 3: BODY SYSTEMS / PATHOLOGY
// ============================================================================
const BODY_SYSTEMS = {
  MUSCULOSKELETAL: {
    code: 'MSK',
    name: 'Musculoskeletal',
    subcategories: {
      ORTHOPEDIC: ['CCL', 'Hip Dysplasia', 'Patellar Luxation', 'Fractures', 'OA'],
      SOFT_TISSUE: ['Tendinopathy', 'Ligament Injury', 'Muscle Strain'],
      SPINAL: ['IVDD', 'Spondylosis', 'Lumbosacral Stenosis']
    }
  },

  NEUROLOGICAL: {
    code: 'NEURO',
    name: 'Neurological',
    subcategories: {
      CENTRAL: ['IVDD', 'FCE', 'Degenerative Myelopathy', 'Vestibular'],
      PERIPHERAL: ['Nerve Injury', 'Neuropathy'],
      NEUROMUSCULAR: ['Myasthenia Gravis', 'Polyneuropathy']
    }
  },

  CARDIOVASCULAR: {
    code: 'CARDIO',
    name: 'Cardiovascular/Respiratory',
    subcategories: ['Deconditioning', 'Cardiopulmonary Disease', 'Obesity']
  },

  INTEGUMENTARY: {
    code: 'INTEG',
    name: 'Integumentary',
    subcategories: ['Wound Care', 'Edema Management', 'Scar Tissue']
  }
};

// ============================================================================
// LEVEL 4: EVIDENCE GRADES
// ============================================================================
const EVIDENCE_GRADES = {
  GRADE_A: {
    code: 'A',
    name: 'Grade A - Strong Evidence',
    description: 'Multiple high-quality randomized controlled trials',
    recommendation: 'Strongly recommended',
    confidence: 'High',
    examples: ['PROM for CCL repair', 'Therapeutic exercises for OA']
  },

  GRADE_B: {
    code: 'B',
    name: 'Grade B - Moderate Evidence',
    description: 'Some RCTs or multiple cohort studies',
    recommendation: 'Recommended',
    confidence: 'Moderate',
    examples: ['Hydrotherapy for muscle strengthening', 'Laser therapy for pain']
  },

  GRADE_C: {
    code: 'C',
    name: 'Grade C - Limited Evidence',
    description: 'Case series, observational studies, or extrapolated from human research',
    recommendation: 'May be considered',
    confidence: 'Low',
    examples: ['Specific balance exercises', 'Breed-specific protocols']
  },

  EXPERT_OPINION: {
    code: 'EO',
    name: 'Expert Opinion',
    description: 'Consensus from experienced practitioners (Millis, Levine, et al.)',
    recommendation: 'Based on clinical experience',
    confidence: 'Expert consensus',
    examples: ['Novel techniques', 'Emerging modalities']
  }
};

// ============================================================================
// LEVEL 5: CERTIFICATION REQUIREMENTS
// ============================================================================
const CERTIFICATION_LEVELS = {
  BASIC: {
    code: 'BASIC',
    name: 'Basic Level',
    description: 'CCRP/CCRT Level 1 or equivalent',
    requirements: ['Basic rehabilitation principles', 'Patient assessment', 'Therapeutic exercise fundamentals'],
    supervision: 'May require supervision'
  },

  ADVANCED: {
    code: 'ADVANCED',
    name: 'Advanced Level',
    description: 'CCRP/CCRT Level 2 or equivalent',
    requirements: ['Advanced manual therapy', 'Modality application', 'Complex case management'],
    supervision: 'Independent practice'
  },

  SPECIALIST: {
    code: 'SPECIALIST',
    name: 'Specialist Level',
    description: 'CCRP/CCRT + specialized certification',
    requirements: ['Neurological rehab', 'Aquatic therapy certification', 'Sport conditioning'],
    supervision: 'Expert level'
  }
};

// ============================================================================
// CLINICAL INDICATIONS (Primary Conditions)
// ============================================================================
const PRIMARY_INDICATIONS = {
  // Orthopedic
  CCL_REPAIR: 'Cranial Cruciate Ligament Repair',
  HIP_DYSPLASIA: 'Hip Dysplasia/THR',
  PATELLAR_LUXATION: 'Patellar Luxation',
  FRACTURE: 'Fracture Management',
  OSTEOARTHRITIS: 'Osteoarthritis',

  // Neurological
  IVDD: 'Intervertebral Disc Disease',
  FCE: 'Fibrocartilaginous Embolism',
  DEGENERATIVE_MYELO: 'Degenerative Myelopathy',

  // Other
  GERIATRIC: 'Geriatric Conditioning',
  SPORT: 'Sport Conditioning/Return to Sport',
  OBESITY: 'Weight Management',
  PALLIATIVE: 'Palliative/End-of-Life Care'
};

// ============================================================================
// SAFETY CLASSIFICATIONS
// ============================================================================
const SAFETY_CLASSIFICATIONS = {
  ABSOLUTE_CONTRAINDICATIONS: 'Must not perform under any circumstances',
  RELATIVE_CONTRAINDICATIONS: 'Caution required, may need modification',
  PRECAUTIONS: 'Monitor closely during performance',
  MONITORING_REQUIREMENTS: 'Specific parameters to assess'
};

// ============================================================================
// EXPORT
// ============================================================================
module.exports = {
  INTERVENTION_TYPES,
  REHAB_PHASES,
  BODY_SYSTEMS,
  EVIDENCE_GRADES,
  CERTIFICATION_LEVELS,
  PRIMARY_INDICATIONS,
  SAFETY_CLASSIFICATIONS
};
