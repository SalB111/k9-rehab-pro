// Generator constants — extracted from GeneratorView.jsx for decomposition

export const BREEDS = [
  "Akita","Australian Cattle Dog","Australian Shepherd",
  "Basset Hound","Beagle","Belgian Malinois","Bernese Mountain Dog","Bichon Frise","Bloodhound",
  "Border Collie","Boston Terrier","Boxer","Brittany","Bulldog",
  "Cane Corso","Cavalier King Charles Spaniel","Chesapeake Bay Retriever","Chihuahua","Cocker Spaniel","Collie",
  "Dachshund","Doberman Pinscher",
  "English Springer Spaniel",
  "French Bulldog",
  "German Shepherd","German Shorthaired Pointer","Golden Retriever","Great Dane","Greyhound",
  "Havanese",
  "Irish Setter",
  "Jack Russell Terrier",
  "Labrador Retriever",
  "Maltese","Mastiff","Miniature American Shepherd","Miniature Schnauzer",
  "Newfoundland",
  "Pembroke Welsh Corgi","Pit Bull Terrier","Pomeranian","Poodle (Miniature)","Poodle (Standard)",
  "Rhodesian Ridgeback","Rottweiler",
  "Saint Bernard","Shetland Sheepdog","Shih Tzu","Siberian Husky","Staffordshire Bull Terrier",
  "Vizsla",
  "Weimaraner","West Highland White Terrier",
  "Yorkshire Terrier",
  "Mixed Breed / Other"
];

export const HOSPITALS = [
  "BluePearl Pet Hospital","VCA Animal Hospital","Banfield Pet Hospital",
  "MedVet Medical & Cancer Center","Animal Emergency Center","ASPCA Animal Hospital",
  "Red Bank Veterinary Hospital","Angell Animal Medical Center","Gulf Coast Veterinary Specialists",
  "University of Pennsylvania — Ryan Veterinary Hospital","Colorado State University VTH",
  "Cornell University Hospital for Animals","UC Davis VMTH","Ohio State University VMC",
  "University of Florida Small Animal Hospital","Tufts Cummings School — Foster Hospital",
  "North Carolina State University VH","University of Tennessee VTH",
  "Texas A&M Small Animal Hospital","Purdue University VTH"
];

export const CONDITIONS = {
  "Stifle (Knee)": [
    { value: "TPLO",              label: "TPLO — Tibial Plateau Leveling Osteotomy" },
    { value: "TTA",               label: "TTA — Tibial Tuberosity Advancement" },
    { value: "CCL Conservative",  label: "CCL — Conservative Management" },
    { value: "Lateral Suture",    label: "Lateral Suture Stabilization" },
    { value: "Meniscal Injury",   label: "Meniscal Tear / Injury" },
    { value: "Patellar Luxation", label: "Patellar Luxation (Medial/Lateral)" },
    { value: "Stifle OA",        label: "Stifle Osteoarthritis" },
  ],
  "Hip": [
    { value: "FHO",              label: "FHO — Femoral Head Ostectomy" },
    { value: "Hip Dysplasia",    label: "Hip Dysplasia" },
    { value: "THR",              label: "THR — Total Hip Replacement" },
    { value: "Hip Luxation",     label: "Hip Luxation (Traumatic)" },
    { value: "Legg-Calve-Perthes", label: "Legg-Calv\u00e9-Perthes Disease" },
    { value: "Hip OA",           label: "Hip Osteoarthritis" },
  ],
  "Elbow & Shoulder": [
    { value: "Elbow Dysplasia",    label: "Elbow Dysplasia" },
    { value: "FCP",                label: "FCP — Fragmented Coronoid Process" },
    { value: "UAP",                label: "UAP — Ununited Anconeal Process" },
    { value: "Shoulder OCD",       label: "Shoulder OCD — Osteochondritis Dissecans" },
    { value: "Biceps Tenosynovitis", label: "Biceps Tenosynovitis" },
    { value: "Medial Shoulder Instability", label: "Medial Shoulder Instability" },
    { value: "Elbow OA",          label: "Elbow Osteoarthritis" },
    { value: "Shoulder Luxation",  label: "Shoulder Luxation" },
  ],
  "Spine & Neurological": [
    { value: "IVDD",                label: "IVDD — Intervertebral Disc Disease" },
    { value: "FCE",                 label: "FCE — Fibrocartilaginous Embolism" },
    { value: "Degenerative Myelopathy", label: "Degenerative Myelopathy (DM)" },
    { value: "Lumbosacral Stenosis", label: "Lumbosacral Stenosis / Cauda Equina" },
    { value: "Cervical Spondylomyelopathy", label: "Wobbler Syndrome (CSM)" },
    { value: "Spinal Fracture",     label: "Spinal Fracture / Luxation" },
    { value: "Vestibular Disease",   label: "Vestibular Disease" },
    { value: "Peripheral Neuropathy", label: "Peripheral Neuropathy" },
  ],
  "Fractures & Trauma": [
    { value: "Femoral Fracture",     label: "Femoral Fracture" },
    { value: "Tibial Fracture",      label: "Tibial Fracture" },
    { value: "Humeral Fracture",     label: "Humeral Fracture" },
    { value: "Radial Fracture",      label: "Radius / Ulna Fracture" },
    { value: "Pelvic Fracture",      label: "Pelvic Fracture" },
    { value: "Carpal/Tarsal Injury", label: "Carpal / Tarsal Injury" },
    { value: "Polytrauma",           label: "Polytrauma — Multiple Injuries" },
  ],
  "Soft Tissue & Tendon": [
    { value: "Achilles Rupture",     label: "Achilles Tendon Rupture" },
    { value: "Iliopsoas Strain",     label: "Iliopsoas Muscle Strain" },
    { value: "Gracilis Contracture", label: "Gracilis / Semitendinosus Contracture" },
    { value: "Infraspinatus Contracture", label: "Infraspinatus Contracture" },
    { value: "Muscle Strain",        label: "Muscle Strain / Tear (General)" },
    { value: "Ligament Sprain",      label: "Ligament Sprain (Non-CCL)" },
  ],
  "Multi-Joint / Geriatric / Other": [
    { value: "Osteoarthritis",       label: "Multi-Joint Osteoarthritis" },
    { value: "Geriatric Mobility",   label: "Geriatric Mobility Program" },
    { value: "Obesity Rehab",        label: "Obesity / Weight Management Program" },
    { value: "Post-Amputation",      label: "Post-Amputation Rehab" },
    { value: "Immune-Mediated Polyarthritis", label: "Immune-Mediated Polyarthritis" },
    { value: "Fibrotic Myopathy",    label: "Fibrotic Myopathy" },
    { value: "Palliative",           label: "Palliative / Comfort Care" },
  ],
  "Normal Assessment / Strengthening": [
    { value: "Conditioning",           label: "Fitness / Conditioning Program" },
    { value: "Sport Conditioning",     label: "Sport / Working Dog Conditioning" },
    { value: "Preventive Rehab",       label: "Preventive Rehabilitation (No Current Pathology)" },
    { value: "Post-Clearance Strength",label: "Post-Veterinary Clearance — Strengthening" },
    { value: "Puppy Development",      label: "Puppy / Juvenile Development Program" },
    { value: "Pre-Surgical Prehab",    label: "Pre-Surgical Prehabilitation" },
    { value: "Maintenance Program",    label: "Maintenance / Wellness Program" },
  ],
};

export const REGIONS = [
  "Left Stifle", "Right Stifle", "Bilateral Stifle",
  "Left Hip", "Right Hip", "Bilateral Hip",
  "Left Elbow", "Right Elbow", "Left Shoulder", "Right Shoulder",
  "Left Carpus", "Right Carpus", "Left Tarsus/Hock", "Right Tarsus/Hock",
  "Cervical Spine", "Thoracolumbar Spine", "Lumbosacral Spine",
  "Multiple Joints", "Generalized"
];

export const FELINE_BREEDS = [
  "Abyssinian","American Shorthair","Bengal","Birman","British Shorthair",
  "Burmese","Chartreux","Devon Rex","Egyptian Mau","Himalayan",
  "Maine Coon","Manx","Norwegian Forest Cat","Ocicat","Persian",
  "Ragdoll","Russian Blue","Scottish Fold","Siamese","Siberian",
  "Sphynx","Tonkinese","Turkish Angora","Turkish Van",
  "Domestic Shorthair (DSH)","Domestic Longhair (DLH)","Domestic Medium Hair (DMH)","Mixed Breed / Other"
];

// HCM high-risk breeds — auto-flag for cardiac screening
export const FELINE_HCM_BREEDS = new Set([
  "Maine Coon","Ragdoll","Sphynx","Persian","Norwegian Forest Cat",
  "Bengal","British Shorthair","American Shorthair","Siberian","Chartreux"
]);

export const FELINE_DIAGNOSES = {
  "Feline Musculoskeletal": [
    { value: "FELINE_OA",               label: "Feline OA — Appendicular Osteoarthritis" },
    { value: "FELINE_OA_AXIAL",         label: "Feline OA — Axial / Spinal (Spondylosis / DLS)" },
    { value: "FELINE_POST_FRACTURE_CAT",label: "Post-Fracture Repair (Feline)" },
  ],
  "Feline Neurological": [
    { value: "FELINE_IVDD_CAT",         label: "Feline IVDD — Intervertebral Disc Disease" },
    { value: "FELINE_NEURO_CAT",        label: "Feline Neurological Rehab (FCE / Trauma / Brachial Plexus)" },
  ],
  "Feline Cardiac / Vascular": [
    { value: "FELINE_FATE_RECOVERY",    label: "Post-FATE Recovery (Saddle Thrombus — Cardiac Cleared)" },
    { value: "FELINE_HCM_SUBCLINICAL",  label: "Feline HCM — Subclinical (Stage A / B1, Cardiac Cleared)" },
  ],
  "Feline Geriatric / Other": [
    { value: "FELINE_GERIATRIC",        label: "Feline Geriatric Mobility / Sarcopenia" },
    { value: "FELINE_POST_AMPUTATION",  label: "Feline Post-Amputation Adaptation" },
    { value: "FELINE_OBESITY",          label: "Feline Obesity / Weight Management" },
    { value: "FELINE_PALLIATIVE",       label: "Feline Palliative / Comfort Care" },
  ],
  "Feline Normal Assessment / Strengthening": [
    { value: "FELINE_CONDITIONING",     label: "Feline Fitness / Conditioning Program" },
    { value: "FELINE_PREVENTIVE",       label: "Feline Preventive Rehabilitation (No Current Pathology)" },
    { value: "FELINE_POST_CLEARANCE",   label: "Feline Post-Clearance — Strengthening" },
    { value: "FELINE_MAINTENANCE",      label: "Feline Maintenance / Wellness Program" },
  ],
};

export const INITIAL_FORM = {
  species: "Canine",
  patientName: "", breed: "", age: "", dob: "",
  weightKg: "", weightLbs: "", sex: "Male Intact",
  diagnosis: "", affectedRegion: "",
  lamenessGrade: "", bodyConditionScore: "5",
  painLevel: "", mobilityLevel: "",
  currentMedications: "", medsLastGiven: "", medicalHistory: "",
  specialInstructions: "", protocolLength: "8",
  clientLastName: "", clientFirstName: "", clientEmail: "", clientPhone: "", clientPhone2: "",
  referringVet: "", referringClinicPhone: "", referringClinicEmail: "",
  mailingAddress: "", city: "", state: "", zipCode: "",
  nearbyHospital: "",
  insuranceProvider: "", insurancePolicyNumber: "", paymentMethod: "",
  treatingClinician: "", clinicianCredentials: "",
  clientConsentObtained: false, clientConsentDate: "",
  treatmentApproach: "",
  surgeryType: "",
  surgeryDate: "",
  surgeonName: "",
  surgicalFacility: "",
  anesthesiaRisk: "ASA II",
  postOpDay: "",
  vetRecommendation: "",
  ownerElection: "",
  ownerDeclineReason: "",
  priorSurgeries: "",
  complicationsNoted: "",
  weightBearingStatus: "Toe-touching",
  activityRestrictions: "",
  eCollarRequired: false,
  crateRestRequired: false,
  slingAssistRequired: false,
  incisionStatus: "Clean/Dry/Intact",
  sutureRemovalDate: "",
  allergies: "",
  temperament: "Cooperative",
  circumferenceAffected: "", circumferenceContralateral: "", circumferenceSite: "15cm proximal to patella",
  romFlexion: "", romExtension: "", romJoint: "",
  romFlexionContralateral: "", romExtensionContralateral: "",
  jointEffusion: "0", muscleCondition: "Normal",
  gaitDescriptors: [],
  postureFindings: [],
  mmtGrade: "",
  ivddGrade: "",
  oaStage: "",
  neuroProprioception: "", neuroWithdrawal: "", neuroDeepPain: "", neuroMotorGrade: "",
  hcpiScore: "",
  cbpiPSS: "",
  cbpiPIS: "",
  loadScore: "",
  rehabGoals: [], implantDetails: "",
  problems: [],
  stGoals: [],
  ltGoals: [],
  outcomeMeasures: [],
  prognosisRating: "",
  estimatedTimeline: "",
  dischargeCriteria: [],
  precautions: [],
  homeEquipment: [],
  homeEnvironment: [],
  sessionFrequency: "2", homeExerciseProgram: true, ownerCompliance: "Motivated",
  aquaticAccess: false,
  modalityUWTM: false, modalityLaser: false, modalityTENS: false, modalityNMES: false,
  modalityTherapeuticUS: false, modalityShockwave: false, modalityCryotherapy: false,
  modalityHeatTherapy: false, modalityPulsedEMF: false,
  diagRadiographs: false, diagRadiographsNotes: "",
  diagCT: false, diagCTNotes: "",
  diagMRI: false, diagMRINotes: "",
  diagUltrasound: false, diagUltrasoundNotes: "",
  diagCBC: false, diagCBCNotes: "",
  diagChemPanel: false, diagChemPanelNotes: "",
  diagUrinalysis: false, diagUrinalysisNotes: "",
  diagThyroid: false, diagThyroidNotes: "",
  diagCRP: false, diagCRPNotes: "",
  diagSynovial: false, diagSynovialNotes: "",
  diagEMG: false, diagEMGNotes: "",
  diagArthroscopy: false, diagArthroscopyNotes: "",
  diagGaitAnalysis: false, diagGaitAnalysisNotes: "",
  diagForcePlate: false, diagForcePlateNotes: "",
  diagROM: false, diagROMNotes: "",
  diagOtherDiag: false, diagOtherNotes: ""
};

export const WIZARD_STEPS = [
  { num: 1, label: "Patient & Owner" },
  { num: 2, label: "Assessment" },
  { num: 3, label: "Treatment" },
  { num: 4, label: "Goals" },
  { num: 5, label: "Generate" },
];

export const NEURO_DIAGNOSES = [
  "IVDD", "FCE", "Degenerative Myelopathy", "Lumbosacral Stenosis",
  "Cervical Spondylomyelopathy", "Spinal Fracture", "Vestibular Disease", "Peripheral Neuropathy"
];

export const MODALITIES = [
  { key: "modalityUWTM", label: "Underwater Treadmill", icon: "\u{1F30A}" },
  { key: "modalityLaser", label: "Therapeutic Laser (PBM)", icon: "\u{1F534}" },
  { key: "modalityTENS", label: "TENS", icon: "\u26A1" },
  { key: "modalityNMES", label: "NMES / E-Stim", icon: "\u26A1" },
  { key: "modalityTherapeuticUS", label: "Therapeutic Ultrasound", icon: "\u{1F4E1}" },
  { key: "modalityShockwave", label: "Shockwave (ESWT)", icon: "\u{1F4A5}" },
  { key: "modalityCryotherapy", label: "Cryotherapy", icon: "\u2744\uFE0F" },
  { key: "modalityHeatTherapy", label: "Heat Therapy", icon: "\u{1F525}" },
  { key: "modalityPulsedEMF", label: "Pulsed EMF (PEMF)", icon: "\u{1F9F2}" },
];

export const HOME_EQUIPMENT = [
  "Yoga / exercise mat", "Balance disc / wobble cushion", "Cavaletti poles / PVC rails",
  "Resistance band", "Ramp (car or furniture)", "Stairs (indoor)",
  "Underwater treadmill access", "Pool / swim access", "Therapy ball / peanut ball",
  "Harness / sling", "Cones / weave markers", "Elevated food/water bowls",
  "Orthopedic bed", "Ice packs / cold compress", "Heat pack / warm compress",
  "Treat-dispensing toy (enrichment)"
];

export const HOME_ENVIRONMENT_OPTIONS = [
  "House — single story", "House — multi-story", "Apartment / condo",
  "Tile / hardwood floors", "Carpet / rugs throughout", "Fenced yard",
  "No yard / urban setting", "Rural / acreage", "Stairs to enter home",
  "Ramp to enter home", "Dog door available", "Crate / confined space available",
  "Other pets in home", "Small children in home"
];

export const GAIT_DESCRIPTORS = [
  "Circumducting", "Bunny-hopping", "Knuckling", "Toe-dragging", "Crossing over",
  "Short-striding", "Weight-shifting", "Ataxic", "Spastic", "Hypermetric", "Scuffing", "Head bob"
];

export const POSTURE_FINDINGS = [
  "Kyphosis", "Lordosis", "Head-down stance", "Base-wide stance", "Base-narrow stance",
  "Weight shifted cranially", "Weight shifted caudally", "Trunk lean", "Pelvic tilt", "Normal posture"
];

export const DIAGNOSTIC_SECTIONS = [
  {
    heading: "Imaging Studies",
    items: [
      { key: "diagRadiographs", label: "Radiographs (X-Rays)", hint: "Views obtained, findings, date" },
      { key: "diagCT", label: "CT Scan (Computed Tomography)", hint: "Region scanned, contrast Y/N, findings" },
      { key: "diagMRI", label: "MRI (Magnetic Resonance Imaging)", hint: "Sequences, region, findings" },
      { key: "diagUltrasound", label: "Musculoskeletal Ultrasound", hint: "Structure evaluated, findings" },
    ],
  },
  {
    heading: "Laboratory Studies",
    items: [
      { key: "diagCBC", label: "CBC (Complete Blood Count)", hint: "WBC, RBC, HCT, PLT — flag abnormalities" },
      { key: "diagChemPanel", label: "Chemistry Panel / Metabolic", hint: "BUN, CREA, ALT, ALP, GLU — flag abnormalities" },
      { key: "diagUrinalysis", label: "Urinalysis", hint: "USG, protein, sediment findings" },
      { key: "diagThyroid", label: "Thyroid Panel (T4 / TSH)", hint: "Total T4, free T4, TSH values" },
      { key: "diagCRP", label: "C-Reactive Protein (CRP)", hint: "Value and reference range" },
      { key: "diagSynovial", label: "Synovial Fluid Analysis", hint: "Cell count, cytology, culture results" },
    ],
  },
  {
    heading: "Functional & Procedural Diagnostics",
    items: [
      { key: "diagEMG", label: "EMG / Nerve Conduction Study", hint: "Muscles tested, latency, amplitude findings" },
      { key: "diagArthroscopy", label: "Arthroscopy", hint: "Joint, findings, interventions performed" },
      { key: "diagGaitAnalysis", label: "Instrumented Gait Analysis", hint: "Kinematic/kinetic findings, symmetry index" },
      { key: "diagForcePlate", label: "Force Plate Analysis", hint: "Peak vertical force, impulse, symmetry ratio" },
      { key: "diagROM", label: "Goniometric Assessment", hint: "Joints measured, flexion/extension values" },
      { key: "diagOtherDiag", label: "Additional Diagnostic", hint: "Specify study and findings" },
    ],
  },
];

export const PHASE_COLORS = ["#DC2626", "#D97706", "#0EA5E9", "#059669"];

export const CLINIC_ONLY_CODES = new Set([
  "LASER_IV","TENS_THERAPY","NMES_QUAD","US_PULSED",
  "PEMF_THERAPY","SHOCKWAVE","UNDERWATER_TREAD","POOL_SWIM","WATER_WALKING","WATER_RETRIEVE"
]);
