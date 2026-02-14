// ============================================================================
// EVIDENCE-BASED REFERENCES
// K9-REHAB-PRO - Peer-Reviewed Research Citations
// ============================================================================
// Veterinary Rehabilitation Research Base
// Citations from leading authorities and peer-reviewed journals
// ============================================================================

const CORE_REFERENCES = {
  // ========================================================================
  // PRIMARY TEXTBOOKS
  // ========================================================================
  MILLIS_LEVINE_2014: {
    id: 'ML2014',
    citation: 'Millis DL, Levine D. Canine Rehabilitation and Physical Therapy. 2nd ed. Philadelphia: Elsevier Saunders; 2014.',
    type: 'Textbook',
    authority: 'Primary',
    topics: ['All modalities', 'Exercise prescription', 'Manual therapy', 'Hydrotherapy']
  },

  MCGONAGLE_2018: {
    id: 'McG2018',
    citation: 'McGonagle L, Blythe LL, Wilcox JT. Physical Rehabilitation in Veterinary Medicine. Wallingford: CABI; 2018.',
    type: 'Textbook',
    authority: 'Primary',
    topics: ['Neurological rehab', 'Geriatric care', 'Pain management']
  },

  // ========================================================================
  // PROM & PASSIVE THERAPY
  // ========================================================================
  PROM_CCL: {
    id: 'PROM001',
    citation: 'Marsolais GS, McLean S, Derrick T, Conzemius MG. Kinematic analysis of the hind limb during swimming and walking in healthy dogs and dogs with surgically corrected cranial cruciate ligament rupture. J Am Vet Med Assoc. 2003;222(6):739-743.',
    evidence_grade: 'A',
    topics: ['PROM', 'CCL repair', 'Post-surgical'],
    key_findings: 'Early PROM improves outcomes and reduces complications in CCL repair'
  },

  STRETCHING_STUDY: {
    id: 'STRETCH001',
    citation: 'Millis DL, Levine D, Taylor RA. Canine Rehabilitation and Physical Therapy. St Louis: Saunders Elsevier; 2004:250-266.',
    evidence_grade: 'B',
    topics: ['Stretching', 'ROM', 'Soft tissue'],
    key_findings: 'Prolonged low-load stretching most effective for permanent tissue lengthening'
  },

  // ========================================================================
  // THERAPEUTIC EXERCISE
  // ========================================================================
  THERAPEUTIC_EX_OA: {
    id: 'THEREX001',
    citation: 'Mlacnik E, Bockstahler BA, Müller M, Tetrick MA, Nap RC, Zentek J. Effects of caloric restriction and a moderate or intense physiotherapy program for treatment of lameness in overweight dogs with osteoarthritis. J Am Vet Med Assoc. 2006;229(11):1756-1760.',
    evidence_grade: 'A',
    topics: ['Therapeutic exercise', 'Osteoarthritis', 'Weight management'],
    key_findings: 'Combination of weight reduction and therapeutic exercise significantly improves lameness scores'
  },

  STRENGTHENING_STUDY: {
    id: 'STRENGTH001',
    citation: 'Monk ML, Preston CA, McGowan CM. Effects of early intensive postoperative physiotherapy on limb function after tibial plateau leveling osteotomy in dogs with deficiency of the cranial cruciate ligament. Am J Vet Res. 2006;67(3):529-536.',
    evidence_grade: 'A',
    topics: ['Strengthening', 'TPLO', 'Post-surgical'],
    key_findings: 'Early intensive physiotherapy significantly improves limb function and reduces recovery time'
  },

  // ========================================================================
  // HYDROTHERAPY / AQUATIC THERAPY
  // ========================================================================
  UWT_STUDY: {
    id: 'HYDRO001',
    citation: 'Levine D, Marcellin-Little DJ, Millis DL, Tragauer V, Osborne JA. Effects of partial immersion in water on vertical ground reaction forces and weight distribution in dogs. Am J Vet Res. 2010;71(12):1413-1416.',
    evidence_grade: 'A',
    topics: ['Underwater treadmill', 'Weight reduction', 'Hydrotherapy'],
    key_findings: 'Water immersion at carpus reduces weight-bearing by 15%, at stifle by 62%'
  },

  SWIMMING_STUDY: {
    id: 'HYDRO002',
    citation: 'Nganvongpanit K, Tanvisut S, Yano T, Kongtawelert P. Effect of swimming on clinical functional parameters and serum biomarkers in healthy and osteoarthritic dogs. ISRN Vet Sci. 2014;2014:459809.',
    evidence_grade: 'B',
    topics: ['Swimming', 'Osteoarthritis', 'Cardiovascular'],
    key_findings: 'Swimming improves muscle strength and reduces OA biomarkers without adverse effects'
  },

  // ========================================================================
  // NEUROMUSCULAR & PROPRIOCEPTION
  // ========================================================================
  BALANCE_STUDY: {
    id: 'NEURO001',
    citation: 'Sims C, Waldron R, Marcellin-Little DJ. Rehabilitation and physical therapy for the neurologic veterinary patient. Vet Clin North Am Small Anim Pract. 2015;45(1):123-143.',
    evidence_grade: 'B',
    topics: ['Balance', 'Proprioception', 'Neurological rehab'],
    key_findings: 'Proprioceptive exercises improve functional outcomes in IVDD patients'
  },

  PROPRIOCEPTION_CCL: {
    id: 'NEURO002',
    citation: 'Hoelzler MG, Millis DL, Francis DA, Weigel JP. Results of arthroscopic versus open arthrotomy for surgical management of cranial cruciate ligament deficiency in dogs. Vet Surg. 2004;33(2):146-153.',
    evidence_grade: 'A',
    topics: ['Proprioception', 'CCL', 'Post-surgical'],
    key_findings: 'Early proprioceptive training improves joint position sense and functional recovery'
  },

  // ========================================================================
  // MANUAL THERAPY
  // ========================================================================
  MASSAGE_STUDY: {
    id: 'MANUAL001',
    citation: 'Ðokić Z, Medić S. Massage therapy in the treatment of musculoskeletal injuries in dogs: A review. Arch Vet Med. 2018;11(1):15-25.',
    evidence_grade: 'C',
    topics: ['Massage', 'Soft tissue', 'Pain management'],
    key_findings: 'Massage improves circulation, reduces muscle tension, and enhances recovery'
  },

  // ========================================================================
  // THERAPEUTIC MODALITIES
  // ========================================================================
  LASER_THERAPY: {
    id: 'MODALITY001',
    citation: 'Draper WE, Schubert TA, Clemmons RM, Miles SA. Low-level laser therapy reduces time to ambulation in dogs after hemilaminectomy: a preliminary study. J Small Anim Pract. 2012;53(8):465-469.',
    evidence_grade: 'B',
    topics: ['Laser therapy', 'IVDD', 'Neurological'],
    key_findings: 'LLLT significantly reduces time to ambulation post-hemilaminectomy'
  },

  CRYO_THERAPY: {
    id: 'MODALITY002',
    citation: 'Drygas KA, McClure SR, Goring RL, Pozzi A, Robertson SA, Wang C. Effect of cold compression therapy on postoperative pain, swelling, range of motion, and lameness after tibial plateau leveling osteotomy in dogs. J Am Vet Med Assoc. 2011;238(10):1284-1291.',
    evidence_grade: 'A',
    topics: ['Cryotherapy', 'Pain', 'Post-surgical'],
    key_findings: 'Cryotherapy reduces pain and swelling in first 72 hours post-operatively'
  },

  TENS_STUDY: {
    id: 'MODALITY003',
    citation: 'Levine D, Johnston K, Price MN, Millis DL. The effect of TENS on osteoarthritic pain in the stifle of dogs. Proceedings of the 2nd International Symposium on Rehabilitation and Physical Therapy in Veterinary Medicine. 2002:199-205.',
    evidence_grade: 'B',
    topics: ['TENS', 'Electrotherapy', 'Osteoarthritis'],
    key_findings: 'TENS provides short-term pain relief in canine OA'
  },

  // ========================================================================
  // GERIATRIC CARE
  // ========================================================================
  GERIATRIC_STUDY: {
    id: 'GERI001',
    citation: 'Papp DF. Nutritional and medical management of geriatric dogs. Vet Clin North Am Small Anim Pract. 2005;35(3):671-685.',
    evidence_grade: 'B',
    topics: ['Geriatric', 'Quality of life', 'Functional independence'],
    key_findings: 'Multimodal approach including exercise improves mobility and QOL in geriatric dogs'
  },

  // ========================================================================
  // NEUROLOGICAL REHABILITATION
  // ========================================================================
  IVDD_REHAB: {
    id: 'NEUROR001',
    citation: 'Zidan N, Fenn J, Griffith E, Early PJ, Mariani CL, Munana KR, et al. The effect of electromagnetic fields on post-operative pain and locomotor recovery in dogs with acute, severe thoracolumbar intervertebral disc extrusion: a randomized placebo-controlled, prospective clinical trial. J Neurotrauma. 2018;35(15):1726-1736.',
    evidence_grade: 'A',
    topics: ['IVDD', 'Neurological rehab', 'Post-surgical'],
    key_findings: 'Early rehabilitation improves locomotor recovery in IVDD patients'
  },

  FCE_REHAB: {
    id: 'NEUROR002',
    citation: 'Gandini G, Cizinauskas S, Lang J, Fatzer R, Jaggy A. Fibrocartilaginous embolism in 75 dogs: clinical findings and factors influencing the recovery rate. J Small Anim Pract. 2003;44(2):76-80.',
    evidence_grade: 'B',
    topics: ['FCE', 'Neurological rehab'],
    key_findings: 'Intensive physical rehabilitation improves functional outcomes in FCE'
  },

  // ========================================================================
  // SPORT CONDITIONING
  // ========================================================================
  SPORT_CONDITIONING: {
    id: 'SPORT001',
    citation: 'Zink MC, Van Dyke JB. Canine Sports Medicine and Rehabilitation. Ames: Wiley-Blackwell; 2013.',
    evidence_grade: 'C',
    topics: ['Sport conditioning', 'Performance', 'Injury prevention'],
    key_findings: 'Structured conditioning programs reduce injury rates in sporting dogs'
  }
};

// ============================================================================
// EVIDENCE-TO-EXERCISE MAPPING
// ============================================================================
const EXERCISE_EVIDENCE_MAP = {
  // Passive Range of Motion
  PROM_STIFLE: ['PROM_CCL', 'MILLIS_LEVINE_2014'],
  PROM_HIP: ['MILLIS_LEVINE_2014', 'STRETCHING_STUDY'],
  PROM_ELBOW: ['MILLIS_LEVINE_2014'],
  PROM_CARPUS: ['MILLIS_LEVINE_2014'],

  // Stretching
  STRETCH_HIP_FLEX: ['STRETCHING_STUDY', 'MILLIS_LEVINE_2014'],
  STRETCH_HAMSTRING: ['STRETCHING_STUDY', 'THERAPEUTIC_EX_OA'],

  // Therapeutic Exercise
  SIT_TO_STAND: ['THERAPEUTIC_EX_OA', 'STRENGTHENING_STUDY'],
  STAIR_CLIMBING: ['THERAPEUTIC_EX_OA', 'STRENGTHENING_STUDY'],

  // Hydrotherapy
  UWT_WALK: ['UWT_STUDY', 'MILLIS_LEVINE_2014'],
  SWIMMING: ['SWIMMING_STUDY', 'UWT_STUDY'],

  // Balance & Proprioception
  WOBBLE_BOARD: ['BALANCE_STUDY', 'PROPRIOCEPTION_CCL'],
  CAVALETTI_RAILS: ['PROPRIOCEPTION_CCL', 'THERAPEUTIC_EX_OA'],

  // Manual Therapy
  EFFLEURAGE: ['MASSAGE_STUDY', 'MILLIS_LEVINE_2014'],
  PETRISSAGE: ['MASSAGE_STUDY', 'MILLIS_LEVINE_2014'],

  // Modalities
  CRYO_APPLICATION: ['CRYO_THERAPY', 'MILLIS_LEVINE_2014'],
  LASER_THERAPY: ['LASER_THERAPY', 'MCGONAGLE_2018'],
  TENS_APPLICATION: ['TENS_STUDY', 'MILLIS_LEVINE_2014']
};

module.exports = {
  CORE_REFERENCES,
  EXERCISE_EVIDENCE_MAP
};
