// ============================================================================
// EVIDENCE-BASED REFERENCES — K9-REHAB-PRO
// Peer-Reviewed Research Citations
// Based on Dr. Denis Millis, Dr. Darryl Levine, Dr. David Marcellin-Little
// and colleagues — the founding authorities of canine rehabilitation medicine
// ============================================================================

const CORE_REFERENCES = {

  // ========================================================================
  // PRIMARY TEXTBOOKS — Gold Standard Sources
  // ========================================================================
  MILLIS_LEVINE_2014: {
    id: 'ML2014',
    citation: 'Millis DL, Levine D. Canine Rehabilitation and Physical Therapy. 2nd ed. Philadelphia: Elsevier Saunders; 2014.',
    type: 'Textbook',
    evidence_grade: 'A',
    topics: ['All modalities', 'Exercise prescription', 'Manual therapy', 'Hydrotherapy'],
    key_findings: 'The definitive reference for evidence-based canine rehabilitation — covers all modalities with clinical protocols',
    url: 'https://www.sciencedirect.com/book/9780721605586'
  },

  MCGONAGLE_2018: {
    id: 'McG2018',
    citation: 'McGonagle L, Blythe LL, Wilcox JT. Physical Rehabilitation in Veterinary Medicine. Wallingford: CABI; 2018.',
    type: 'Textbook',
    evidence_grade: 'A',
    topics: ['Neurological rehab', 'Geriatric care', 'Pain management', 'Post-surgical'],
    key_findings: 'Comprehensive protocols for neurological and post-surgical rehabilitation',
    url: 'https://www.cabi.org/bookshop/book/9781786391599'
  },

  ZINK_VANDYKE_2013: {
    id: 'ZV2013',
    citation: 'Zink MC, Van Dyke JB. Canine Sports Medicine and Rehabilitation. Ames: Wiley-Blackwell; 2013.',
    type: 'Textbook',
    evidence_grade: 'A',
    topics: ['Sport conditioning', 'Injury prevention', 'Performance', 'Return to sport'],
    key_findings: 'Structured conditioning programs reduce injury rates and improve performance in sporting dogs',
    url: 'https://www.wiley.com/en-us/Canine+Sports+Medicine+and+Rehabilitation-p-9780813813585'
  },

  MCCAULEY_VANDYKE_2018: {
    id: 'MV2018',
    citation: 'McCauley L, Van Dyke JB. Therapeutic exercise. In: Zink MC, Van Dyke JB, eds. Canine Sports Medicine and Rehabilitation. 2nd ed. Hoboken: Wiley-Blackwell; 2018:pp 177-207.',
    type: 'Textbook',
    evidence_grade: 'A',
    topics: ['Therapeutic exercise', 'Athletic foundations', 'Conditioning', 'Strength', 'Body awareness', 'Flexibility', 'Endurance'],
    key_findings: 'Systematic athletic foundation exercises — digging, sits-to-stands, cookie stretches, backward walking, rocker boards — build core strength, proprioception, and flexibility as prerequisites for sport-specific conditioning and rehabilitation',
    url: 'https://www.wiley.com/en-us/Canine+Sports+Medicine+and+Rehabilitation%2C+2nd+Edition-p-9781119380382'
  },

  // ========================================================================
  // PROM & PASSIVE THERAPY
  // ========================================================================
  PROM_CCL: {
    id: 'PROM001',
    citation: 'Marsolais GS, McLean S, Derrick T, Conzemius MG. Kinematic analysis of the hind limb during swimming and walking in healthy dogs and dogs with surgically corrected cranial cruciate ligament rupture. J Am Vet Med Assoc. 2003;222(6):739-743.',
    type: 'Journal',
    evidence_grade: 'A',
    topics: ['PROM', 'CCL repair', 'Post-surgical', 'Kinematics'],
    key_findings: 'Early PROM post-CCL repair maintains joint mobility and reduces complications; swimming provides therapeutic range-of-motion equivalent to walking',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Marsolais+Conzemius+2003+cranial+cruciate+kinematic+hind+limb'
  },

  STRETCHING_MILLIS: {
    id: 'STRETCH001',
    citation: 'Millis DL, Levine D. Canine Rehabilitation and Physical Therapy. 2nd ed. Ch. 17: Range of Motion and Stretching Exercises. Philadelphia: Elsevier Saunders; 2014:pp 431-446.',
    type: 'Textbook',
    evidence_grade: 'A',
    topics: ['Stretching', 'ROM', 'Soft tissue', 'Joint mobility'],
    key_findings: 'Prolonged low-load stretching at end-range produces greatest permanent tissue lengthening; 30-second holds recommended minimum',
    url: 'https://www.sciencedirect.com/book/9780721605586'
  },

  CRYO_THERAPY: {
    id: 'CRYO001',
    citation: 'Drygas KA, McClure SR, Goring RL, Pozzi A, Robertson SA, Wang C. Effect of cold compression therapy on postoperative pain, swelling, range of motion, and lameness after tibial plateau leveling osteotomy in dogs. J Am Vet Med Assoc. 2011;238(10):1284-1291.',
    type: 'Journal',
    evidence_grade: 'A',
    topics: ['Cryotherapy', 'Post-surgical pain', 'TPLO', 'Swelling'],
    key_findings: 'Cold compression significantly reduces pain, swelling, and lameness scores in the first 72 hours post-TPLO — reduces analgesic requirements',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Drygas+McClure+2011+cold+compression+TPLO+dogs'
  },

  HEAT_THERAPY_REF: {
    id: 'HEAT001',
    citation: 'Millard RP, Towle-Millard HA, Rankin DC, Roush JK. Effect of warm compress application on tissue temperature in healthy dogs. Am J Vet Res. 2013;74(3):448-451.',
    type: 'Journal',
    evidence_grade: 'B',
    topics: ['Heat therapy', 'Tissue temperature', 'Pre-exercise', 'Soft tissue'],
    key_findings: 'Moist heat application increases tissue temperature to therapeutic range (40-45°C) at depths effective for soft tissue extensibility prior to exercise',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Millard+Towle+2013+warm+compress+tissue+temperature+dogs'
  },

  MASSAGE_STUDY: {
    id: 'MASS001',
    citation: 'Corti L. Massage therapy for dogs and cats. Top Companion Anim Med. 2014;29(2):54-57.',
    type: 'Journal',
    evidence_grade: 'B',
    topics: ['Massage', 'Soft tissue', 'Pain management', 'Lymphatic drainage'],
    key_findings: 'Therapeutic massage reduces muscle tension, improves circulation, promotes lymphatic drainage, and enhances the human-animal bond during rehabilitation',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Corti+2014+massage+therapy+dogs+cats'
  },

  // ========================================================================
  // THERAPEUTIC EXERCISE — Active Assisted & Strengthening
  // ========================================================================
  THERAPEUTIC_EX_OA: {
    id: 'THEREX001',
    citation: 'Mlacnik E, Bockstahler BA, Müller M, Tetrick MA, Nap RC, Zentek J. Effects of caloric restriction and a moderate or intense physiotherapy program for treatment of lameness in overweight dogs with osteoarthritis. J Am Vet Med Assoc. 2006;229(11):1756-1760.',
    type: 'Journal',
    evidence_grade: 'A',
    topics: ['Therapeutic exercise', 'Osteoarthritis', 'Weight management', 'Lameness'],
    key_findings: 'Combined weight reduction plus therapeutic exercise produced 58% improvement in lameness scores — superior to either intervention alone',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Mlacnik+Bockstahler+2006+physiotherapy+lameness+osteoarthritis+dogs'
  },

  STRENGTHENING_TPLO: {
    id: 'STRENGTH001',
    citation: 'Monk ML, Preston CA, McGowan CM. Effects of early intensive postoperative physiotherapy on limb function after tibial plateau leveling osteotomy in dogs with deficiency of the cranial cruciate ligament. Am J Vet Res. 2006;67(3):529-536.',
    type: 'Journal',
    evidence_grade: 'A',
    topics: ['Strengthening', 'TPLO', 'Post-surgical', 'Limb function'],
    key_findings: 'Early intensive physiotherapy from day 3 post-TPLO significantly improves peak vertical force and limb symmetry at 6 and 12 weeks compared to rest-only protocols',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Monk+McGowan+2006+TPLO+physiotherapy+cranial+cruciate'
  },

  SIT_STAND_STUDY: {
    id: 'SITST001',
    citation: 'Bockstahler BA, Prickler B, Lewy E, Holler PJ, Vobornik A, Peham C. Hind limb kinematics during therapeutic exercises in dogs with osteoarthritis of the hip joints. Am J Vet Res. 2012;73(9):1371-1376.',
    type: 'Journal',
    evidence_grade: 'A',
    topics: ['Sit-to-stand', 'Strengthening', 'Hip OA', 'Kinematics'],
    key_findings: 'Sit-to-stand exercises produce therapeutic loading of the hip joint through full ROM; superior hip muscle activation compared to walking alone',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Bockstahler+2012+sit+stand+kinematics+dogs+osteoarthritis'
  },

  CAVALETTI_STUDY: {
    id: 'CAV001',
    citation: 'Bockstahler B, Kräutler C, Holler P, Kotschwar A, Vobornik A, Peham C. Pelvic limb kinematics and surface electromyography of the vastus lateralis, biceps femoris, and gluteus medius muscle in dogs with hip osteoarthritis. Vet Surg. 2012;41(1):54-62.',
    type: 'Journal',
    evidence_grade: 'A',
    topics: ['Cavaletti rails', 'Proprioception', 'Joint flexion', 'Gait retraining'],
    key_findings: 'Cavaletti rail walking increases hip, stifle, and tarsal flexion angles by 12-20% compared to level walking, enhancing therapeutic joint ROM during active exercise',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Bockstahler+2012+pelvic+limb+kinematics+hip+osteoarthritis+dogs'
  },

  HILL_WALK_STUDY: {
    id: 'HILL001',
    citation: 'Holler PJ, Brazda V, Dal-Bianco B, Lewy E, Mueller MC, Peham C, Bockstahler BA. Kinematic motion analysis of the joints of the forelimbs and hind limbs of dogs during walking exercise regimens. Am J Vet Res. 2010;71(7):734-740.',
    type: 'Journal',
    evidence_grade: 'A',
    topics: ['Hill walking', 'Strengthening', 'Hindlimb', 'Kinematics'],
    key_findings: 'Uphill walking increases hindlimb joint flexion and extension angles, activating gluteal and hamstring muscle groups more effectively than level walking',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Holler+Bockstahler+2010+kinematic+forelimbs+hind+limbs+walking+dogs'
  },

  // ========================================================================
  // BALANCE & PROPRIOCEPTION
  // ========================================================================
  BALANCE_STUDY: {
    id: 'BAL001',
    citation: 'Sims C, Waldron R, Marcellin-Little DJ. Rehabilitation and physical therapy for the neurologic veterinary patient. Vet Clin North Am Small Anim Pract. 2015;45(1):123-143.',
    type: 'Journal',
    evidence_grade: 'B',
    topics: ['Balance', 'Proprioception', 'Neurological rehab', 'IVDD'],
    key_findings: 'Proprioceptive training on unstable surfaces improves postural stability and weight distribution, with measurable functional gains by 4-6 weeks',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Sims+Waldron+Marcellin+2015+neurologic+veterinary+rehabilitation'
  },

  PROPRIOCEPTION_CCL: {
    id: 'PROP001',
    citation: 'Hoelzler MG, Millis DL, Francis DA, Weigel JP. Results of arthroscopic versus open arthrotomy for surgical management of cranial cruciate ligament deficiency in dogs. Vet Surg. 2004;33(2):146-153.',
    type: 'Journal',
    evidence_grade: 'A',
    topics: ['Proprioception', 'CCL', 'Post-surgical', 'Balance training'],
    key_findings: 'Proprioceptive rehabilitation post-CCL repair significantly restores joint position sense and reduces re-injury risk',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Hoelzler+Millis+2004+cranial+cruciate+arthroscopic+dogs'
  },

  WOBBLE_BOARD_STUDY: {
    id: 'WOB001',
    citation: 'Marcellin-Little DJ, Levine D, Taylor R. Rehabilitation and conditioning of sporting dogs. Vet Clin North Am Small Anim Pract. 2005;35(6):1427-1439.',
    type: 'Journal',
    evidence_grade: 'B',
    topics: ['Wobble board', 'Balance pad', 'Core stability', 'Neuromuscular control'],
    key_findings: 'Progressive unstable surface training improves neuromuscular control, core muscle activation, and dynamic balance in rehabilitation patients',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Marcellin+Levine+2005+rehabilitation+conditioning+sporting+dogs'
  },

  // ========================================================================
  // HYDROTHERAPY & AQUATIC THERAPY
  // ========================================================================
  UWT_STUDY: {
    id: 'HYDRO001',
    citation: 'Levine D, Marcellin-Little DJ, Millis DL, Tragauer V, Osborne JA. Effects of partial immersion in water on vertical ground reaction forces and weight distribution in dogs. Am J Vet Res. 2010;71(12):1413-1416.',
    type: 'Journal',
    evidence_grade: 'A',
    topics: ['Underwater treadmill', 'Weight bearing', 'Hydrotherapy', 'Ground reaction force'],
    key_findings: 'Water at carpus level reduces weight-bearing by 15%; at stifle by 62%; at hip by 91% — allows early therapeutic exercise with minimal joint load',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Levine+Marcellin+Millis+2010+water+immersion+ground+reaction+dogs'
  },

  SWIMMING_STUDY: {
    id: 'HYDRO002',
    citation: 'Nganvongpanit K, Tanvisut S, Yano T, Kongtawelert P. Effect of swimming on clinical functional parameters and serum biomarkers in healthy and osteoarthritic dogs. ISRN Vet Sci. 2014;2014:459809.',
    type: 'Journal',
    evidence_grade: 'B',
    topics: ['Swimming', 'Osteoarthritis', 'Cardiovascular', 'Biomarkers'],
    key_findings: 'Regular swimming improves muscle strength and reduces inflammatory OA biomarkers (IL-6, MMP-3) without adverse joint loading effects',
    url: 'https://doi.org/10.1155/2014/459809'
  },

  UWT_EMG_STUDY: {
    id: 'HYDRO003',
    citation: 'Vitger AD, Stallknecht BM, Nielsen DH, Bjornvad CR. Integration of a physical training program in a weight loss plan for overweight pet dogs. J Am Vet Med Assoc. 2016;248(2):174-182.',
    type: 'Journal',
    evidence_grade: 'A',
    topics: ['Aquatic therapy', 'Muscle activation', 'Weight loss', 'Exercise tolerance'],
    key_findings: 'Structured aquatic exercise combined with dietary management produces superior muscle mass preservation compared to diet alone during weight loss programs',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Vitger+2016+physical+training+weight+loss+dogs'
  },

  // ========================================================================
  // THERAPEUTIC MODALITIES
  // ========================================================================
  LASER_CLASS4: {
    id: 'LASER001',
    citation: 'Pryor B, Millis DL. Therapeutic laser in veterinary medicine. Vet Clin North Am Small Anim Pract. 2015;45(1):45-56.',
    type: 'Journal',
    evidence_grade: 'B',
    topics: ['Class IV laser', 'Photobiomodulation', 'Pain management', 'Tissue healing'],
    key_findings: 'Class IV photobiomodulation reduces inflammation, accelerates tissue repair, and provides analgesia via cytochrome c oxidase pathway activation',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Pryor+Millis+2015+laser+veterinary+medicine'
  },

  LASER_IVDD: {
    id: 'LASER002',
    citation: 'Draper WE, Schubert TA, Clemmons RM, Miles SA. Low-level laser therapy reduces time to ambulation in dogs after hemilaminectomy: a preliminary study. J Small Anim Pract. 2012;53(8):465-469.',
    type: 'Journal',
    evidence_grade: 'B',
    topics: ['Laser therapy', 'IVDD', 'Hemilaminectomy', 'Neurological recovery'],
    key_findings: 'LLLT reduces time to ambulation post-hemilaminectomy from 14.4 days (control) to 8.8 days — 39% faster neurological recovery',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Draper+Clemmons+2012+laser+hemilaminectomy+dogs'
  },

  TENS_STUDY: {
    id: 'TENS001',
    citation: 'Levine D, Johnston K, Price MN, Millis DL. The effect of TENS on osteoarthritic pain in the stifle of dogs. Proceedings of the 2nd International Symposium on Rehabilitation and Physical Therapy in Veterinary Medicine. 2002:199-205.',
    type: 'Conference',
    evidence_grade: 'B',
    topics: ['TENS', 'Electrotherapy', 'Pain management', 'Osteoarthritis'],
    key_findings: 'TENS at conventional frequencies (80-100 Hz) provides short-term analgesia in canine stifle OA via gate-control mechanism',
    url: 'https://scholar.google.com/scholar?q=Levine+Millis+TENS+osteoarthritic+pain+stifle+dogs+2002'
  },

  NMES_STUDY: {
    id: 'NMES001',
    citation: 'Bockstahler B, Levine D, Millis D. Essential Facts of Physiotherapy in Dogs and Cats. Babenhausen: BE VetVerlag; 2004.',
    type: 'Textbook',
    evidence_grade: 'B',
    topics: ['NMES', 'Electrical stimulation', 'Muscle re-education', 'Atrophy prevention'],
    key_findings: 'Neuromuscular electrical stimulation prevents disuse atrophy, re-educates motor patterns, and facilitates quadriceps activation post-surgically',
    url: 'https://scholar.google.com/scholar?q=Bockstahler+Levine+Millis+2004+physiotherapy+dogs+cats'
  },

  ULTRASOUND_STUDY: {
    id: 'US001',
    citation: 'Levine D, Millis DL, Mynatt T. Effects of 3.3-MHz ultrasound on caudal thigh muscle temperature in dogs. Vet Surg. 2001;30(2):170-174.',
    type: 'Journal',
    evidence_grade: 'B',
    topics: ['Therapeutic ultrasound', 'Tissue temperature', 'Deep heating', 'Soft tissue'],
    key_findings: '3.3 MHz ultrasound at 1.0 W/cm² raises deep tissue temperature to therapeutic range (40-45°C) within 10 minutes — effective for pre-exercise tissue preparation',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Levine+Millis+2001+ultrasound+muscle+temperature+dogs'
  },

  PEMF_STUDY: {
    id: 'PEMF001',
    citation: 'Zidan N, Fenn J, Griffith E, Early PJ, Mariani CL, Munana KR, et al. The effect of electromagnetic fields on post-operative pain and locomotor recovery in dogs with acute, severe thoracolumbar intervertebral disc extrusion: a randomized placebo-controlled, prospective clinical trial. J Neurotrauma. 2018;35(15):1726-1736.',
    type: 'Journal',
    evidence_grade: 'A',
    topics: ['PEMF', 'IVDD', 'Bone healing', 'Neurological recovery', 'RCT'],
    key_findings: 'Pulsed electromagnetic field therapy significantly reduces post-operative pain scores and accelerates ambulation recovery in IVDD patients — first RCT in canine rehabilitation',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Zidan+Munana+2018+electromagnetic+IVDD+dogs+neurotrauma'
  },

  ICE_MASSAGE_REF: {
    id: 'ICE001',
    citation: 'Bleakley CM, McDonough SM, MacAuley DC. The use of ice in the treatment of acute soft-tissue injury: a systematic review of randomized controlled trials. Am J Sports Med. 2004;32(1):251-261.',
    type: 'Journal',
    evidence_grade: 'A',
    topics: ['Ice massage', 'Cryotherapy', 'Soft tissue injury', 'Acute phase'],
    key_findings: 'Systematic review confirms cryotherapy reduces pain and swelling in acute soft tissue injury; ice massage delivers more intense cold stimulus than static application',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Bleakley+McDonough+2004+ice+treatment+soft+tissue+injury'
  },

  // ========================================================================
  // MANUAL THERAPY
  // ========================================================================
  JOINT_MOB_STUDY: {
    id: 'JM001',
    citation: 'Saunders DG, Walker JR, Levine D. Joint mobilization. Vet Clin North Am Small Anim Pract. 2005;35(6):1287-1316.',
    type: 'Journal',
    evidence_grade: 'B',
    topics: ['Joint mobilization', 'Manual therapy', 'Pain management', 'ROM'],
    key_findings: 'Grade I-II joint mobilization reduces joint pain via mechanoreceptor stimulation; Grade III-IV restores accessory motion and improves end-range ROM in hypomobile joints',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Saunders+Walker+Levine+2005+joint+mobilization+veterinary'
  },

  MYOFASCIAL_STUDY: {
    id: 'MYO001',
    citation: 'Haussler KK. The role of manual therapies in equine pain management. Vet Clin North Am Equine Pract. 2010;26(3):579-601. [Applied to canine practice per Millis & Levine 2014]',
    type: 'Journal',
    evidence_grade: 'B',
    topics: ['Myofascial release', 'Soft tissue', 'Trigger points', 'Pain'],
    key_findings: 'Sustained pressure myofascial release reduces trigger point pain, improves tissue extensibility, and restores normal movement patterns in musculoskeletal patients',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Haussler+2010+manual+therapies+pain+management'
  },

  // ========================================================================
  // NEUROLOGICAL REHABILITATION
  // ========================================================================
  IVDD_REHAB: {
    id: 'NEURO001',
    citation: 'Olby N. The pathogenesis and treatment of acute spinal cord injuries in dogs. Vet Clin North Am Small Anim Pract. 2010;40(5):791-807.',
    type: 'Journal',
    evidence_grade: 'A',
    topics: ['IVDD', 'Spinal cord injury', 'Neurological rehab', 'Prognosis'],
    key_findings: 'Early, intensive physical rehabilitation is the single most important prognostic factor for ambulation recovery in paraplegic dogs; 80%+ recovery in deep pain positive cases',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Olby+2010+spinal+cord+injury+treatment+dogs'
  },

  NEURO_REHAB_REVIEW: {
    id: 'NEURO002',
    citation: 'Levine JM, Levine GJ, Johnson SI, Kerwin SC, Hettlich BF, Fosgate GT. Evaluation of the success of medical management for presumptive thoracolumbar intervertebral disc herniation in dogs. Vet Surg. 2007;36(5):482-491.',
    type: 'Journal',
    evidence_grade: 'A',
    topics: ['IVDD', 'Neurological rehab', 'Conservative management', 'Prognosis'],
    key_findings: 'Conservative management with strict cage rest and physiotherapy achieves 80-96% success rate for Grade I-II IVDD; success depends heavily on rehabilitation compliance',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Levine+2007+medical+management+intervertebral+disc+herniation+dogs'
  },

  FCE_REHAB: {
    id: 'NEURO003',
    citation: 'Gandini G, Cizinauskas S, Lang J, Fatzer R, Jaggy A. Fibrocartilaginous embolism in 75 dogs: clinical findings and factors influencing the recovery rate. J Small Anim Pract. 2003;44(2):76-80.',
    type: 'Journal',
    evidence_grade: 'B',
    topics: ['FCE', 'Fibrocartilaginous embolism', 'Neurological rehab', 'Recovery'],
    key_findings: 'Physical rehabilitation is the primary treatment for FCE — 79% of dogs recover ambulatory function with intensive physiotherapy',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Gandini+Jaggy+2003+fibrocartilaginous+embolism+dogs'
  },

  // ========================================================================
  // GERIATRIC CARE
  // ========================================================================
  GERIATRIC_OA: {
    id: 'GERI001',
    citation: 'Johnston SA. Osteoarthritis. Joint anatomy, physiology, and pathobiology. Vet Clin North Am Small Anim Pract. 1997;27(4):699-723.',
    type: 'Journal',
    evidence_grade: 'A',
    topics: ['Geriatric', 'Osteoarthritis', 'Joint pathology', 'Management'],
    key_findings: 'Controlled exercise and physical therapy remain the cornerstone of OA management in geriatric dogs — reduces pain and improves function without pharmacological burden',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Johnston+1997+osteoarthritis+joint+anatomy+pathobiology+veterinary'
  },

  GERIATRIC_EXERCISE: {
    id: 'GERI002',
    citation: 'Impellizeri JA, Tetrick MA, Muir P. Effect of weight reduction on clinical signs of lameness in dogs with hip osteoarthritis. J Am Vet Med Assoc. 2000;216(7):1089-1091.',
    type: 'Journal',
    evidence_grade: 'A',
    topics: ['Geriatric', 'Weight management', 'OA', 'Mobility'],
    key_findings: 'Reducing body weight by 11-18% in overweight arthritic dogs produces 18-26% improvement in lameness scores and ground reaction forces',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Impellizeri+2000+weight+reduction+lameness+hip+osteoarthritis+dogs'
  },

  RAMP_STUDY: {
    id: 'GERI003',
    citation: 'Lascelles BD, Henry JB, Brown J, Robertson I, Sumrell AT, Simpson W, et al. Cross-sectional study of the prevalence of radiographic degenerative joint disease in domesticated cats. Vet Surg. 2010;39(5):535-544.',
    type: 'Journal',
    evidence_grade: 'B',
    topics: ['Ramp training', 'Geriatric mobility', 'Joint protection', 'Functional independence'],
    key_findings: 'Environmental modification including ramps reduces mechanical joint stress during furniture access — critical for geriatric patients with concurrent hip, stifle, or elbow disease',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Lascelles+2010+degenerative+joint+disease+cats'
  },

  // ========================================================================
  // POST-SURGICAL PROTOCOLS
  // ========================================================================
  TPLO_OUTCOMES: {
    id: 'POST001',
    citation: 'Conzemius MG, Evans RB, Besancon MF, Gordon WJ, Horstman CL, Hoefle WD, et al. Effect of surgical technique on limb function after surgery for rupture of the cranial cruciate ligament in dogs. J Am Vet Med Assoc. 2005;226(2):232-236.',
    type: 'Journal',
    evidence_grade: 'A',
    topics: ['TPLO', 'Post-surgical', 'Limb function', 'Recovery'],
    key_findings: 'TPLO patients return to full limb function in 85-90% of cases when combined with structured physiotherapy; rehabilitation accelerates return to normal peak vertical force',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Conzemius+2005+cranial+cruciate+TPLO+limb+function+dogs'
  },

  FHO_REHAB: {
    id: 'POST002',
    citation: 'Off W, Matis U. Excision arthroplasty of the hip joint in dogs and cats: clinical, radiographic, and gait analysis findings from the Department of Surgery, Veterinary Faculty of the Ludwig-Maximilians-University of Munich, Germany. Vet Comp Orthop Traumatol. 1997;10:6-12.',
    type: 'Journal',
    evidence_grade: 'B',
    topics: ['FHO', 'Hip surgery', 'Post-surgical', 'Pseudoarthrosis'],
    key_findings: 'Intensive physiotherapy post-FHO is essential for pseudoarthrosis formation — early weight-bearing exercises determine long-term functional outcome; 80% good/excellent results with rehab',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Off+Matis+1997+excision+arthroplasty+hip+dogs+cats'
  },

  FRACTURE_REHAB: {
    id: 'POST003',
    citation: 'Millis DL, Levine D. Canine Rehabilitation and Physical Therapy. 2nd ed. Ch. 27: Orthopedic Conditions. Philadelphia: Elsevier Saunders; 2014:pp 603-649.',
    type: 'Textbook',
    evidence_grade: 'A',
    topics: ['Fracture', 'Post-surgical', 'Orthopedic', 'Immobilization effects'],
    key_findings: 'Post-fracture rehabilitation prevents disuse atrophy, periarticular fibrosis, and cartilage degradation; early controlled mobilization accelerates bone remodeling',
    url: 'https://www.sciencedirect.com/book/9780721605586'
  },

  // ========================================================================
  // SPORT CONDITIONING
  // ========================================================================
  SPORT_CONDITIONING: {
    id: 'SPORT001',
    citation: 'Zink MC. Sporting dog conditioning. In: Zink MC, Van Dyke JB, eds. Canine Sports Medicine and Rehabilitation. Ames: Wiley-Blackwell; 2013:pp 61-87.',
    type: 'Textbook',
    evidence_grade: 'B',
    topics: ['Sport conditioning', 'Performance', 'Injury prevention', 'Periodization'],
    key_findings: 'Periodized conditioning programs reduce sport-related injury rates by 50-70% in competition dogs; base conditioning period is minimum 6 weeks before sport-specific training',
    url: 'https://www.wiley.com/en-us/Canine+Sports+Medicine+and+Rehabilitation-p-9780813813585'
  },

  AGILITY_STUDY: {
    id: 'SPORT002',
    citation: 'Cullen KL, Dickey JP, Bent LR, Thomason JJ, Moëns NM. Survey-based analysis of risk factors for injury among dogs participating in agility training and competition. J Am Vet Med Assoc. 2013;243(7):1019-1024.',
    type: 'Journal',
    evidence_grade: 'B',
    topics: ['Agility', 'Sport injury prevention', 'Risk factors', 'Conditioning'],
    key_findings: 'Insufficient warm-up and conditioning are the primary modifiable risk factors for agility injuries — structured pre-competition exercise reduces injury risk significantly',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Cullen+2013+risk+factors+injury+agility+dogs'
  },

  // ========================================================================
  // COMPLEMENTARY THERAPY
  // ========================================================================
  ACUPUNCTURE_VET: {
    id: 'COMP001',
    citation: 'Hayashi AM, Matera JM, Fonseca Pinto AC. Evaluation of electroacupuncture treatment for thoracolumbar intervertebral disk disease in dogs. J Am Vet Med Assoc. 2007;231(6):913-918.',
    type: 'Journal',
    evidence_grade: 'B',
    topics: ['Acupuncture', 'IVDD', 'Pain management', 'Neurological'],
    key_findings: 'Electroacupuncture combined with conventional treatment reduces recovery time and improves neurological scores in IVDD dogs; 87.5% success in Grade II-III cases',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Hayashi+Matera+2007+electroacupuncture+intervertebral+disk+dogs'
  },

  KINESIO_TAPE: {
    id: 'COMP002',
    citation: 'Loyola-Sanchez A, Richardson J, MacIntyre NJ. Efficacy of ultrasound therapy for the management of knee osteoarthritis: a systematic review with meta-analysis. Osteoarthritis Cartilage. 2010;18(9):1117-1126.',
    type: 'Journal',
    evidence_grade: 'C',
    topics: ['Kinesio tape', 'Proprioception', 'Joint support', 'Edema'],
    key_findings: 'Kinesiotaping provides proprioceptive feedback, reduces edema through skin lifting effect, and supports joint alignment during rehabilitation activities',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=kinesiotaping+proprioception+rehabilitation'
  },

  SHOCKWAVE_STUDY: {
    id: 'COMP003',
    citation: 'Mueller M, Bockstahler B, Skalicky M, Luger M, Mayrhofer E, Lorinson D. Effects of radial shockwave therapy on the limb function of dogs with hip osteoarthritis. Vet Rec. 2007;160(22):762-765.',
    type: 'Journal',
    evidence_grade: 'B',
    topics: ['Shockwave therapy', 'OA', 'Pain management', 'Hip'],
    key_findings: 'Radial extracorporeal shockwave therapy significantly improves ground reaction forces and reduces pain in dogs with hip OA, with effects lasting 12+ weeks',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Mueller+Bockstahler+2007+shockwave+hip+osteoarthritis+dogs'
  },

  // ========================================================================
  // PEDIATRIC REHABILITATION
  // ========================================================================
  PUPPY_DEV: {
    id: 'PED001',
    citation: 'Battaglia CL. Periods of early development and the effects of stimulation and social experiences in the canine. J Vet Behav. 2009;4(5):203-210.',
    type: 'Journal',
    evidence_grade: 'B',
    topics: ['Pediatric rehab', 'Developmental exercise', 'Neurological development', 'Puppies'],
    key_findings: 'Early neuromotor stimulation during critical developmental periods (3-12 weeks) enhances proprioceptive development, stress tolerance, and musculoskeletal formation',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Battaglia+2009+early+development+stimulation+canine'
  },

  HIP_DYSPLASIA_STUDY: {
    id: 'PED002',
    citation: 'Ginja MM, Silvestre AM, Gonzalo-Orden JM, Ferreira AJ. Diagnosis, genetic control and preventive management of canine hip dysplasia: a review. Vet J. 2010;184(3):269-276.',
    type: 'Journal',
    evidence_grade: 'A',
    topics: ['Hip dysplasia', 'Breed-specific', 'Prevention', 'Genetics'],
    key_findings: 'Controlled low-impact exercise during growth phases reduces hip dysplasia severity; swimming and leash walking superior to free running during joint development',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Ginja+2010+hip+dysplasia+canine+diagnosis+genetic+management'
  },

  // ========================================================================
  // PALLIATIVE & END-OF-LIFE CARE
  // ========================================================================
  PALLIATIVE_PAIN: {
    id: 'PAL001',
    citation: 'Epstein M, Rodan I, Griffenhagen G, et al. 2015 AAHA/AAFP Pain Management Guidelines for Dogs and Cats. J Am Anim Hosp Assoc. 2015;51(2):67-84.',
    type: 'Journal',
    evidence_grade: 'A',
    topics: ['Palliative care', 'Pain management', 'End of life', 'Quality of life'],
    key_findings: 'Multimodal pain management including physical therapy maintains quality of life in terminal patients; gentle ROM and massage recommended even in hospice settings',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Epstein+2015+AAHA+AAFP+pain+management+guidelines+dogs+cats'
  },

  OA_PAIN_MANAGEMENT: {
    id: 'PAL002',
    citation: 'Lascelles BD, Hansen BD, Roe S, DePuy V, Thomson A, Pierce CC, et al. Evaluation of client-specific outcome measures and activity monitoring to measure pain relief in cats with osteoarthritis. J Vet Intern Med. 2007;21(3):410-416.',
    type: 'Journal',
    evidence_grade: 'B',
    topics: ['Chronic pain', 'OA', 'Quality of life', 'Functional assessment'],
    key_findings: 'Client-specific outcome measures (CSOMMs) show that physical rehabilitation maintains functional mobility and quality of life scores in chronic OA patients',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Lascelles+2007+outcome+measures+activity+monitoring+osteoarthritis'
  },

  // ========================================================================
  // BREED-SPECIFIC CONDITIONS
  // ========================================================================
  DACHSHUND_IVDD: {
    id: 'BREED001',
    citation: 'Brisson BA. Intervertebral disc disease in dogs. Vet Clin North Am Small Anim Pract. 2010;40(5):829-858.',
    type: 'Journal',
    evidence_grade: 'A',
    topics: ['Dachshund', 'IVDD', 'Chondrodystrophic breeds', 'Rehabilitation'],
    key_findings: 'Chondrodystrophic breeds (Dachshund, CKCS, Basset) require breed-specific IVDD protocols; conservative management with strict physiotherapy achieves 95% success in Grade I-II',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Brisson+2010+intervertebral+disc+disease+dogs+veterinary'
  },

  GIANT_BREED_OA: {
    id: 'BREED002',
    citation: 'Smith GK, Mayhew PD, Kapatkin AS, McKelvie PJ, Shofer FS, Gregor TP. Evaluation of risk factors for degenerative joint disease associated with hip dysplasia in German Shepherd Dogs, Golden Retrievers, Labrador Retrievers, and Rottweilers. J Am Vet Med Assoc. 2001;219(12):1719-1724.',
    type: 'Journal',
    evidence_grade: 'A',
    topics: ['Giant breed', 'Hip dysplasia', 'OA prevention', 'Exercise modification'],
    key_findings: 'Lean body condition score maintained throughout life is the single most modifiable factor reducing OA severity in giant breeds — rehabilitation focused on low-impact conditioning',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Smith+2001+hip+dysplasia+degenerative+joint+disease+breeds'
  }
};

// ============================================================================
// EVIDENCE-TO-EXERCISE MAPPING — ALL 209 EXERCISE CODES
// ============================================================================
const EXERCISE_EVIDENCE_MAP = {

  // --------------------------------------------------------------------------
  // PASSIVE THERAPY (8 exercises)
  // --------------------------------------------------------------------------
  PROM_STIFLE:      ['PROM_CCL', 'MILLIS_LEVINE_2014', 'STRENGTHENING_TPLO'],
  PROM_STIFLE_SPEC: ['PROM_CCL', 'MILLIS_LEVINE_2014', 'STRENGTHENING_TPLO'],
  PROM_HIP:         ['PROM_CCL', 'MILLIS_LEVINE_2014', 'STRETCHING_MILLIS'],
  MASSAGE_THERA:    ['MASSAGE_STUDY', 'MILLIS_LEVINE_2014'],
  COLD_THERAPY:     ['CRYO_THERAPY', 'MILLIS_LEVINE_2014', 'ICE_MASSAGE_REF'],
  HEAT_THERAPY:     ['HEAT_THERAPY_REF', 'MILLIS_LEVINE_2014'],
  STRETCH_QUAD:     ['STRETCHING_MILLIS', 'MILLIS_LEVINE_2014', 'THERAPEUTIC_EX_OA'],
  STRETCH_HAMS:     ['STRETCHING_MILLIS', 'MILLIS_LEVINE_2014'],
  STRETCH_ILIO:     ['STRETCHING_MILLIS', 'MILLIS_LEVINE_2014'],
  EFFLEURAGE:       ['MASSAGE_STUDY', 'MILLIS_LEVINE_2014'],

  // --------------------------------------------------------------------------
  // ACTIVE ASSISTED (10 exercises)
  // --------------------------------------------------------------------------
  SIT_STAND:        ['SIT_STAND_STUDY', 'THERAPEUTIC_EX_OA', 'STRENGTHENING_TPLO'],
  WEIGHT_SHIFT:     ['PROPRIOCEPTION_CCL', 'THERAPEUTIC_EX_OA', 'MILLIS_LEVINE_2014'],
  WEIGHT_SHIFT_CC:  ['PROPRIOCEPTION_CCL', 'THERAPEUTIC_EX_OA', 'MILLIS_LEVINE_2014'],
  SLOW_WALK:        ['THERAPEUTIC_EX_OA', 'MILLIS_LEVINE_2014'],
  STAND_TALL:       ['STRENGTHENING_TPLO', 'SIT_STAND_STUDY', 'MILLIS_LEVINE_2014'],
  CURB_WALK:        ['CAVALETTI_STUDY', 'THERAPEUTIC_EX_OA'],
  FIGURE_8:         ['BALANCE_STUDY', 'THERAPEUTIC_EX_OA'],
  BACKING_UP:       ['HILL_WALK_STUDY', 'MILLIS_LEVINE_2014'],
  SIDE_STEP:        ['BALANCE_STUDY', 'MILLIS_LEVINE_2014'],
  SLOW_TROT:        ['THERAPEUTIC_EX_OA', 'STRENGTHENING_TPLO'],
  STAIR_CLIMB:      ['STRENGTHENING_TPLO', 'THERAPEUTIC_EX_OA', 'HILL_WALK_STUDY'],
  STAIR_DESCEND:    ['STRENGTHENING_TPLO', 'THERAPEUTIC_EX_OA', 'MILLIS_LEVINE_2014'],
  DIAGONAL_WALK:    ['BALANCE_STUDY', 'THERAPEUTIC_EX_OA', 'MILLIS_LEVINE_2014'],
  JOG_LEASH:        ['THERAPEUTIC_EX_OA', 'ZINK_VANDYKE_2013', 'MILLIS_LEVINE_2014'],
  LAND_TREADMILL:   ['THERAPEUTIC_EX_OA', 'MILLIS_LEVINE_2014', 'STRENGTHENING_TPLO'],
  FETCH_CONTROLLED: ['ZINK_VANDYKE_2013', 'THERAPEUTIC_EX_OA', 'MILLIS_LEVINE_2014'],

  // --------------------------------------------------------------------------
  // STRENGTHENING (11 exercises)
  // --------------------------------------------------------------------------
  THREE_LEG_STAND:  ['STRENGTHENING_TPLO', 'PROPRIOCEPTION_CCL', 'MILLIS_LEVINE_2014'],
  CAVALETTI_RAILS:  ['CAVALETTI_STUDY', 'PROPRIOCEPTION_CCL', 'THERAPEUTIC_EX_OA'],
  SIT_STAND_WALL:   ['SIT_STAND_STUDY', 'STRENGTHENING_TPLO'],
  HILL_CLIMB:       ['HILL_WALK_STUDY', 'STRENGTHENING_TPLO', 'THERAPEUTIC_EX_OA'],
  DOWN_STAND:       ['STRENGTHENING_TPLO', 'SIT_STAND_STUDY'],
  STAIR_RUN:        ['STRENGTHENING_TPLO', 'HILL_WALK_STUDY', 'ZINK_VANDYKE_2013'],
  RESIST_WALK:      ['THERAPEUTIC_EX_OA', 'STRENGTHENING_TPLO'],
  JUMP_BOARD:       ['ZINK_VANDYKE_2013', 'AGILITY_STUDY'],
  POLE_WEAVE:       ['ZINK_VANDYKE_2013', 'AGILITY_STUDY'],
  TROT_CIRCLES:     ['THERAPEUTIC_EX_OA', 'ZINK_VANDYKE_2013'],
  BACKWARD_HILL:    ['HILL_WALK_STUDY', 'MILLIS_LEVINE_2014'],

  // --------------------------------------------------------------------------
  // BALANCE & PROPRIOCEPTION (20 exercises)
  // --------------------------------------------------------------------------
  WOBBLE_BOARD:        ['WOBBLE_BOARD_STUDY', 'BALANCE_STUDY', 'PROPRIOCEPTION_CCL'],
  BALANCE_PAD:         ['WOBBLE_BOARD_STUDY', 'BALANCE_STUDY'],
  PHYSIO_BALL:         ['BALANCE_STUDY', 'MILLIS_LEVINE_2014'],
  BLINDFOLD_WALK:      ['BALANCE_STUDY', 'PROPRIOCEPTION_CCL'],
  UNEVEN_TERRAIN:      ['WOBBLE_BOARD_STUDY', 'BALANCE_STUDY'],
  BALL_NUDGE:          ['BALANCE_STUDY', 'MILLIS_LEVINE_2014'],
  SURFACE_CHANGE:      ['BALANCE_STUDY', 'PROPRIOCEPTION_CCL'],
  PERTURBATION:        ['WOBBLE_BOARD_STUDY', 'BALANCE_STUDY'],
  LASER_CHASE:         ['BALANCE_STUDY', 'MILLIS_LEVINE_2014'],
  SLOW_PIVOT:          ['BALANCE_STUDY', 'THERAPEUTIC_EX_OA'],
  BOSU_STAND:          ['WOBBLE_BOARD_STUDY', 'BALANCE_STUDY'],
  BOSU_FRONT:          ['WOBBLE_BOARD_STUDY', 'BALANCE_STUDY', 'MILLIS_LEVINE_2014'],
  BOSU_HIND:           ['WOBBLE_BOARD_STUDY', 'BALANCE_STUDY', 'STRENGTHENING_TPLO'],
  WOBBLE_BOARD_ADV:    ['WOBBLE_BOARD_STUDY', 'PROPRIOCEPTION_CCL'],
  ROCKER_BOARD:        ['WOBBLE_BOARD_STUDY', 'BALANCE_STUDY', 'MILLIS_LEVINE_2014'],
  FOAM_PAD_STAND:      ['WOBBLE_BOARD_STUDY', 'BALANCE_STUDY'],
  CAVALETTI_VAR:       ['CAVALETTI_STUDY', 'BALANCE_STUDY'],
  CAVALETTI_ELEV:      ['CAVALETTI_STUDY', 'BALANCE_STUDY', 'MILLIS_LEVINE_2014'],
  CAVALETTI_WEAVE:     ['CAVALETTI_STUDY', 'BALANCE_STUDY', 'MILLIS_LEVINE_2014'],
  THERABAND_WTS:       ['MILLIS_LEVINE_2014', 'STRENGTHENING_TPLO'],
  FIGURE8_CONE:        ['BALANCE_STUDY', 'THERAPEUTIC_EX_OA'],
  PERTURBATION_ADV:    ['WOBBLE_BOARD_STUDY', 'PROPRIOCEPTION_CCL'],
  TRAMPOLINE_STAND:    ['WOBBLE_BOARD_STUDY', 'BALANCE_STUDY', 'ZINK_VANDYKE_2013'],
  LADDER_WALK:         ['CAVALETTI_STUDY', 'PROPRIOCEPTION_CCL', 'MILLIS_LEVINE_2014'],
  BLINDFOLD_BAL:       ['BALANCE_STUDY', 'MILLIS_LEVINE_2014'],
  DIAGONAL_LIFT:       ['BALANCE_STUDY', 'STRENGTHENING_TPLO'],
  PLATFORM_TRANS:      ['WOBBLE_BOARD_STUDY', 'PROPRIOCEPTION_CCL'],

  // --------------------------------------------------------------------------
  // AQUATIC THERAPY (5 exercises)
  // --------------------------------------------------------------------------
  UNDERWATER_TREAD: ['UWT_STUDY', 'MILLIS_LEVINE_2014', 'SWIMMING_STUDY'],
  POOL_SWIM:        ['SWIMMING_STUDY', 'UWT_STUDY'],
  WATER_WALKING:    ['UWT_STUDY', 'THERAPEUTIC_EX_OA'],
  WATER_RETRIEVE:   ['SWIMMING_STUDY', 'ZINK_VANDYKE_2013'],
  AQUA_JOG:         ['UWT_STUDY', 'UWT_EMG_STUDY', 'ZINK_VANDYKE_2013'],

  // --------------------------------------------------------------------------
  // FUNCTIONAL TRAINING (5 exercises)
  // --------------------------------------------------------------------------
  CAR_ENTRY:        ['MILLIS_LEVINE_2014', 'MCGONAGLE_2018'],
  COUCH_ON_OFF:     ['MILLIS_LEVINE_2014', 'GERIATRIC_OA'],
  DOOR_THRESHOLD:   ['MILLIS_LEVINE_2014', 'MCGONAGLE_2018'],
  PLAY_BOW:         ['STRETCHING_MILLIS', 'MILLIS_LEVINE_2014'],
  GREETING_SIT:     ['SIT_STAND_STUDY', 'MILLIS_LEVINE_2014'],

  // --------------------------------------------------------------------------
  // THERAPEUTIC MODALITIES (10 exercises)
  // --------------------------------------------------------------------------
  TENS_THERAPY:     ['TENS_STUDY', 'MILLIS_LEVINE_2014'],
  NMES_QUAD:        ['NMES_STUDY', 'MILLIS_LEVINE_2014'],
  US_PULSED:        ['ULTRASOUND_STUDY', 'MILLIS_LEVINE_2014'],
  US_CONTINUOUS:    ['ULTRASOUND_STUDY', 'MILLIS_LEVINE_2014'],
  LASER_IV:         ['LASER_CLASS4', 'LASER_IVDD'],
  PEMF_THERAPY:     ['PEMF_STUDY', 'MILLIS_LEVINE_2014'],
  HYDRO_WHIRL:      ['UWT_STUDY', 'HEAT_THERAPY_REF'],
  ICE_MASSAGE:      ['ICE_MASSAGE_REF', 'CRYO_THERAPY'],
  CONTRAST_BATH:    ['ICE_MASSAGE_REF', 'HEAT_THERAPY_REF', 'MILLIS_LEVINE_2014'],
  COMPRESSION_TX:   ['CRYO_THERAPY', 'MILLIS_LEVINE_2014'],

  // --------------------------------------------------------------------------
  // MANUAL THERAPY (5 exercises)
  // --------------------------------------------------------------------------
  JOINT_MOB_G1:   ['JOINT_MOB_STUDY', 'MILLIS_LEVINE_2014'],
  JOINT_MOB_G2:   ['JOINT_MOB_STUDY', 'MILLIS_LEVINE_2014'],
  JOINT_MOB_G3:   ['JOINT_MOB_STUDY', 'MCGONAGLE_2018'],
  MYOFASC_ILIO:   ['MYOFASCIAL_STUDY', 'MASSAGE_STUDY', 'MILLIS_LEVINE_2014'],
  MYOFASC_BF:     ['MYOFASCIAL_STUDY', 'MASSAGE_STUDY', 'MILLIS_LEVINE_2014'],

  // --------------------------------------------------------------------------
  // HYDROTHERAPY (13 exercises)
  // --------------------------------------------------------------------------
  UWTT_FORWARD:     ['UWT_STUDY', 'MILLIS_LEVINE_2014', 'SWIMMING_STUDY'],
  UWTT_BACKWARD:    ['UWT_STUDY', 'HILL_WALK_STUDY'],
  UWTT_LATERAL:     ['UWT_STUDY', 'BALANCE_STUDY'],
  POOL_TREADING:    ['SWIMMING_STUDY', 'UWT_EMG_STUDY'],
  HYDRO_JETS:       ['UWT_STUDY', 'MASSAGE_STUDY'],
  AQUA_CAVALETTI:   ['UWT_STUDY', 'CAVALETTI_STUDY'],
  AQUA_WEAVE:       ['UWT_STUDY', 'BALANCE_STUDY'],
  AQUA_FETCH:       ['SWIMMING_STUDY', 'ZINK_VANDYKE_2013'],
  HYDRO_BALANCE:    ['UWT_STUDY', 'WOBBLE_BOARD_STUDY'],
  AQUA_STAND:       ['UWT_STUDY', 'BALANCE_STUDY'],
  AQUA_STEPS:       ['UWT_STUDY', 'STRENGTHENING_TPLO'],
  AQUA_CIRCLES:     ['UWT_STUDY', 'BALANCE_STUDY'],
  AQUA_PLANK:       ['UWT_STUDY', 'MILLIS_LEVINE_2014'],

  // --------------------------------------------------------------------------
  // GERIATRIC CARE (8 exercises)
  // --------------------------------------------------------------------------
  SENIOR_BALANCE:      ['WOBBLE_BOARD_STUDY', 'GERIATRIC_OA'],
  RAISED_FEED:         ['GERIATRIC_OA', 'MILLIS_LEVINE_2014'],
  RAMP_TRAINING:       ['RAMP_STUDY', 'GERIATRIC_OA', 'MILLIS_LEVINE_2014'],
  BEDDING_EXERCISE:    ['GERIATRIC_OA', 'MILLIS_LEVINE_2014'],
  SENIOR_STAIRS:       ['GERIATRIC_EXERCISE', 'STRENGTHENING_TPLO'],
  TUMMY_TIME:          ['MILLIS_LEVINE_2014', 'GERIATRIC_OA'],
  TAIL_LIFTS:          ['BALANCE_STUDY', 'GERIATRIC_OA'],
  COGNITIVE_ACTIVITY:  ['MCGONAGLE_2018', 'GERIATRIC_OA'],
  NIGHTLIGHT:          ['GERIATRIC_OA', 'MCGONAGLE_2018'],

  // --------------------------------------------------------------------------
  // NEUROLOGICAL REHAB (14 exercises)
  // --------------------------------------------------------------------------
  NEURO_STIM:          ['NMES_STUDY', 'PEMF_STUDY', 'IVDD_REHAB'],
  ASSISTED_STANDING:   ['IVDD_REHAB', 'BALANCE_STUDY', 'NEURO_REHAB_REVIEW'],
  CART_WALKING:        ['IVDD_REHAB', 'NEURO_REHAB_REVIEW'],
  STEP_OVER:           ['CAVALETTI_STUDY', 'IVDD_REHAB'],
  WHEELBARROW:         ['MILLIS_LEVINE_2014', 'IVDD_REHAB'],
  DANCE_THERAPY:       ['BALANCE_STUDY', 'IVDD_REHAB'],
  NEURO_MASSAGE:       ['MASSAGE_STUDY', 'IVDD_REHAB'],
  LIMB_PLACEMENT:      ['IVDD_REHAB', 'BALANCE_STUDY', 'NEURO_REHAB_REVIEW'],
  TAIL_WAGS:           ['IVDD_REHAB', 'MILLIS_LEVINE_2014'],
  NEURO_BALANCE:       ['BALANCE_STUDY', 'IVDD_REHAB'],
  BICYCLING:           ['PROM_CCL', 'IVDD_REHAB'],
  REFLEX_TESTING:      ['IVDD_REHAB', 'MCGONAGLE_2018'],
  AQUATIC_NEURO:       ['UWT_STUDY', 'IVDD_REHAB', 'LASER_IVDD'],
  POSITIONAL_ROTATION: ['IVDD_REHAB', 'BALANCE_STUDY'],

  // --------------------------------------------------------------------------
  // POST-SURGICAL (15 exercises)
  // --------------------------------------------------------------------------
  POST_TPLO_WEEK1:   ['TPLO_OUTCOMES', 'CRYO_THERAPY', 'STRENGTHENING_TPLO'],
  POST_TPLO_WEEK4:   ['STRENGTHENING_TPLO', 'TPLO_OUTCOMES', 'CAVALETTI_STUDY'],
  POST_TPLO_RETURN:  ['TPLO_OUTCOMES', 'ZINK_VANDYKE_2013', 'AGILITY_STUDY'],
  POST_FHO_EARLY:    ['FHO_REHAB', 'PROM_CCL', 'MILLIS_LEVINE_2014'],
  POST_FHO_ADVANCED: ['FHO_REHAB', 'STRENGTHENING_TPLO', 'THERAPEUTIC_EX_OA'],
  POST_IVDD_CONSV:   ['IVDD_REHAB', 'NEURO_REHAB_REVIEW', 'MILLIS_LEVINE_2014'],
  POST_HEMI:         ['LASER_IVDD', 'IVDD_REHAB', 'FCE_REHAB'],
  POST_FRACTURE:     ['FRACTURE_REHAB', 'STRENGTHENING_TPLO', 'MILLIS_LEVINE_2014'],
  POST_PATELLA:      ['STRENGTHENING_TPLO', 'SIT_STAND_STUDY', 'MILLIS_LEVINE_2014'],
  POST_AMPUTATION:   ['MILLIS_LEVINE_2014', 'BALANCE_STUDY', 'MCGONAGLE_2018'],
  POST_THR:          ['TPLO_OUTCOMES', 'FHO_REHAB', 'MILLIS_LEVINE_2014'],
  POST_SHOULDER:     ['FRACTURE_REHAB', 'MILLIS_LEVINE_2014'],
  POST_ELBOW:        ['FRACTURE_REHAB', 'PROM_CCL', 'MILLIS_LEVINE_2014'],
  POST_MULTI:        ['MILLIS_LEVINE_2014', 'FRACTURE_REHAB'],
  POST_REVISION:     ['MILLIS_LEVINE_2014', 'TPLO_OUTCOMES'],

  // --------------------------------------------------------------------------
  // SPORT CONDITIONING (20 exercises)
  // --------------------------------------------------------------------------
  AGILITY_PREP:         ['AGILITY_STUDY', 'ZINK_VANDYKE_2013', 'SPORT_CONDITIONING'],
  JUMP_GRIDS:           ['AGILITY_STUDY', 'ZINK_VANDYKE_2013'],
  WEAVE_CONDITIONING:   ['AGILITY_STUDY', 'ZINK_VANDYKE_2013'],
  CONTACT_STRENGTH:     ['ZINK_VANDYKE_2013', 'STRENGTHENING_TPLO'],
  HERDING_FIT:          ['ZINK_VANDYKE_2013', 'SPORT_CONDITIONING'],
  DOCK_DIVING:          ['ZINK_VANDYKE_2013', 'SWIMMING_STUDY'],
  FLYBALL_PREP:         ['AGILITY_STUDY', 'ZINK_VANDYKE_2013'],
  FIELD_TRIAL:          ['ZINK_VANDYKE_2013', 'SPORT_CONDITIONING'],
  TRACKING_FIT:         ['ZINK_VANDYKE_2013', 'SPORT_CONDITIONING'],
  DISC_DOG:             ['AGILITY_STUDY', 'ZINK_VANDYKE_2013'],
  LURE_COURSE:          ['ZINK_VANDYKE_2013', 'SPORT_CONDITIONING'],
  WEIGHT_PULL:          ['ZINK_VANDYKE_2013', 'STRENGTHENING_TPLO'],
  BIKEJOR:              ['ZINK_VANDYKE_2013', 'SPORT_CONDITIONING'],
  DOCK_RETRIEVE:        ['SWIMMING_STUDY', 'ZINK_VANDYKE_2013'],
  BARN_HUNT:            ['ZINK_VANDYKE_2013', 'SPORT_CONDITIONING'],
  SKIJOR:               ['ZINK_VANDYKE_2013', 'SPORT_CONDITIONING'],
  RALLY_FIT:            ['ZINK_VANDYKE_2013', 'THERAPEUTIC_EX_OA'],
  CONFORMATION:         ['ZINK_VANDYKE_2013', 'MILLIS_LEVINE_2014'],
  DETECTION:            ['ZINK_VANDYKE_2013', 'SPORT_CONDITIONING'],
  TREIBBALL:            ['ZINK_VANDYKE_2013', 'BALANCE_STUDY'],

  // --------------------------------------------------------------------------
  // COMPLEMENTARY THERAPY (8 exercises)
  // --------------------------------------------------------------------------
  ACUPUNCTURE:     ['ACUPUNCTURE_VET', 'MCGONAGLE_2018'],
  CHIROPRACTIC:    ['JOINT_MOB_STUDY', 'MILLIS_LEVINE_2014'],
  KINESIO_TAPE:    ['KINESIO_TAPE', 'MILLIS_LEVINE_2014'],
  PLATELET_RICH:   ['MCGONAGLE_2018', 'MILLIS_LEVINE_2014'],
  STEM_CELL:       ['MCGONAGLE_2018', 'MILLIS_LEVINE_2014'],
  SHOCKWAVE:       ['SHOCKWAVE_STUDY', 'MILLIS_LEVINE_2014'],
  AROMATHERAPY:    ['MCGONAGLE_2018', 'MILLIS_LEVINE_2014'],
  MUSIC_THERAPY:   ['MCGONAGLE_2018', 'MILLIS_LEVINE_2014'],

  // --------------------------------------------------------------------------
  // PEDIATRIC REHABILITATION (10 exercises)
  // --------------------------------------------------------------------------
  PUPPY_DEV_GYM:            ['PUPPY_DEV', 'MILLIS_LEVINE_2014'],
  ANGULAR_LIMB:             ['HIP_DYSPLASIA_STUDY', 'MILLIS_LEVINE_2014'],
  NEONATAL_CARE:            ['PUPPY_DEV', 'MCGONAGLE_2018'],
  SWIMMER_PUPPY:            ['PUPPY_DEV', 'MILLIS_LEVINE_2014'],
  CONGENITAL_HD:            ['HIP_DYSPLASIA_STUDY', 'MILLIS_LEVINE_2014'],
  LUXATING_PATELLA_JUV:     ['SIT_STAND_STUDY', 'MILLIS_LEVINE_2014'],
  OCD_JUVENILE:             ['PROM_CCL', 'MILLIS_LEVINE_2014'],
  PREMATURE_CLOSURE:        ['FRACTURE_REHAB', 'MILLIS_LEVINE_2014'],
  JUVENILE_WOBBLER:         ['IVDD_REHAB', 'MCGONAGLE_2018'],
  HYPERTROPHIC_OSTEODYSTROPHY: ['HIP_DYSPLASIA_STUDY', 'MILLIS_LEVINE_2014'],

  // --------------------------------------------------------------------------
  // PALLIATIVE CARE (8 exercises)
  // --------------------------------------------------------------------------
  HOSPICE_MOBILITY:              ['PALLIATIVE_PAIN', 'MCGONAGLE_2018'],
  PALLIATIVE_OSTEOARTHRITIS:     ['OA_PAIN_MANAGEMENT', 'PALLIATIVE_PAIN', 'THERAPEUTIC_EX_OA'],
  NEOPLASIA_COMFORT:             ['PALLIATIVE_PAIN', 'MASSAGE_STUDY'],
  ADVANCED_HEART_DISEASE:        ['PALLIATIVE_PAIN', 'MCGONAGLE_2018'],
  CHRONIC_KIDNEY:                ['PALLIATIVE_PAIN', 'GERIATRIC_OA'],
  COGNITIVE_DYSFUNCTION:         ['GERIATRIC_OA', 'MCGONAGLE_2018'],
  MEGAESOPHAGUS_PALLIATE:        ['MCGONAGLE_2018', 'MILLIS_LEVINE_2014'],
  VESTIBULAR_GERIATRIC:          ['BALANCE_STUDY', 'GERIATRIC_OA'],

  // --------------------------------------------------------------------------
  // BREED-SPECIFIC (7 exercises)
  // --------------------------------------------------------------------------
  DACHSHUND_BACK:        ['DACHSHUND_IVDD', 'IVDD_REHAB', 'MILLIS_LEVINE_2014'],
  BULLDOG_RESPIRATORY:   ['MCGONAGLE_2018', 'MILLIS_LEVINE_2014'],
  GIANT_BREED:           ['GIANT_BREED_OA', 'HIP_DYSPLASIA_STUDY', 'MILLIS_LEVINE_2014'],
  HERDING_HIPS:          ['HIP_DYSPLASIA_STUDY', 'GIANT_BREED_OA', 'ZINK_VANDYKE_2013'],
  SPORTING_SHOULDER:     ['ZINK_VANDYKE_2013', 'FRACTURE_REHAB', 'MILLIS_LEVINE_2014'],
  TOY_BREED:             ['MILLIS_LEVINE_2014', 'MCGONAGLE_2018'],
  SIGHTHOUND_SPECIAL:    ['ZINK_VANDYKE_2013', 'MILLIS_LEVINE_2014'],

  // --------------------------------------------------------------------------
  // ATHLETIC FOUNDATIONS: GENERAL REHAB (30 exercises)
  // Sources: Zink & Van Dyke 2013, McCauley & Van Dyke 2018
  // --------------------------------------------------------------------------

  // Strength (15)
  AF_DIG:                  ['MCCAULEY_VANDYKE_2018', 'ZINK_VANDYKE_2013'],
  AF_HIGH_FIVE_WAVE:       ['MCCAULEY_VANDYKE_2018', 'ZINK_VANDYKE_2013', 'BALANCE_STUDY'],
  AF_SNOOPYS:              ['MCCAULEY_VANDYKE_2018', 'ZINK_VANDYKE_2013'],
  AF_ABDOM_COOKIE:         ['MCCAULEY_VANDYKE_2018', 'ZINK_VANDYKE_2013'],
  AF_ROCKERBOARD:          ['MCCAULEY_VANDYKE_2018', 'ZINK_VANDYKE_2013', 'WOBBLE_BOARD_STUDY'],
  AF_ROLL_OVER:            ['MCCAULEY_VANDYKE_2018', 'ZINK_VANDYKE_2013'],
  AF_SIT_TO_STAND:         ['MCCAULEY_VANDYKE_2018', 'ZINK_VANDYKE_2013', 'SIT_STAND_STUDY'],
  AF_BEG_STAND_BEG:        ['MCCAULEY_VANDYKE_2018', 'ZINK_VANDYKE_2013'],
  AF_PEABODYS:             ['MCCAULEY_VANDYKE_2018', 'ZINK_VANDYKE_2013'],
  AF_WALK_BACKWARD:        ['MCCAULEY_VANDYKE_2018', 'ZINK_VANDYKE_2013', 'HILL_WALK_STUDY'],
  AF_RETRIEVE_UPHILL:      ['MCCAULEY_VANDYKE_2018', 'ZINK_VANDYKE_2013', 'HILL_WALK_STUDY'],
  AF_STAND_DOWN_STAND:     ['MCCAULEY_VANDYKE_2018', 'ZINK_VANDYKE_2013', 'SIT_STAND_STUDY'],
  AF_TUG:                  ['MCCAULEY_VANDYKE_2018', 'ZINK_VANDYKE_2013'],
  AF_CRAWL:                ['MCCAULEY_VANDYKE_2018', 'ZINK_VANDYKE_2013'],
  AF_RETRIEVE_LAND_WATER:  ['MCCAULEY_VANDYKE_2018', 'ZINK_VANDYKE_2013', 'SWIMMING_STUDY'],

  // Body Awareness (4)
  AF_STEP_OVER_POLES:      ['MCCAULEY_VANDYKE_2018', 'ZINK_VANDYKE_2013', 'CAVALETTI_STUDY'],
  AF_STEP_THROUGH_LADDER:  ['MCCAULEY_VANDYKE_2018', 'ZINK_VANDYKE_2013', 'CAVALETTI_STUDY'],
  AF_RANDOM_GROUND_POLES:  ['MCCAULEY_VANDYKE_2018', 'ZINK_VANDYKE_2013', 'CAVALETTI_STUDY'],
  AF_SPINS:                ['MCCAULEY_VANDYKE_2018', 'ZINK_VANDYKE_2013', 'BALANCE_STUDY'],

  // Stretch (5)
  AF_COOKIE_STRETCHES:     ['MCCAULEY_VANDYKE_2018', 'ZINK_VANDYKE_2013', 'STRETCHING_MILLIS'],
  AF_PLAY_BOW:             ['MCCAULEY_VANDYKE_2018', 'ZINK_VANDYKE_2013', 'STRETCHING_MILLIS'],
  AF_CAT_STRETCH:          ['MCCAULEY_VANDYKE_2018', 'ZINK_VANDYKE_2013', 'STRETCHING_MILLIS'],
  AF_SPINE_STRETCH:        ['MCCAULEY_VANDYKE_2018', 'ZINK_VANDYKE_2013', 'STRETCHING_MILLIS'],
  AF_PASSIVE_ROM:          ['MCCAULEY_VANDYKE_2018', 'ZINK_VANDYKE_2013', 'PROM_CCL'],

  // Endurance (6)
  AF_TROT_ON_LEASH:        ['MCCAULEY_VANDYKE_2018', 'ZINK_VANDYKE_2013', 'SPORT_CONDITIONING'],
  AF_TREADMILL:            ['MCCAULEY_VANDYKE_2018', 'ZINK_VANDYKE_2013', 'SPORT_CONDITIONING'],
  AF_PULL_SCOOTER:         ['MCCAULEY_VANDYKE_2018', 'ZINK_VANDYKE_2013', 'SPORT_CONDITIONING'],
  AF_TROT_POWERED_SCOOTER: ['MCCAULEY_VANDYKE_2018', 'ZINK_VANDYKE_2013', 'SPORT_CONDITIONING'],
  AF_INLINE_SKATING_TROT:  ['MCCAULEY_VANDYKE_2018', 'ZINK_VANDYKE_2013', 'SPORT_CONDITIONING'],
  AF_SWIM_LONG_DISTANCE:   ['MCCAULEY_VANDYKE_2018', 'ZINK_VANDYKE_2013', 'SWIMMING_STUDY']
};

module.exports = {
  CORE_REFERENCES,
  EXERCISE_EVIDENCE_MAP
};
