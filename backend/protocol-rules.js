// ============================================================================
// PROTOCOL RULES ENGINE — LEGACY (V1 API)
// ⚠️  DEPRECATED: This file uses informal display slugs ('prom', 'leash-walking')
// that do NOT match the canonical exercise codes in the exercise database
// (PROM_STIFLE, SLOW_WALK). The V1 API endpoints that consume this file
// return slugs only, not full exercise data.
//
// The authoritative protocol system is protocol-generator.js which uses
// PROTOCOL_DEFINITIONS with canonical UPPER_SNAKE_CASE exercise codes.
//
// This file is retained for backward compatibility with V1 API consumers.
// New integrations should use POST /api/generate-protocol instead.
// ============================================================================

const PROTOCOL_RULES = {

  // --------------------------------------------------------------------------
  // TPLO — Tibial Plateau Leveling Osteotomy
  // --------------------------------------------------------------------------
  TPLO: {
    early: {
      label: 'Early Recovery (Weeks 1–4)',
      goals: 'Reduce swelling, restore passive ROM, initiate controlled weight bearing',
      exercises: ['prom', 'leash-walking', 'weight-shifting']
    },
    mid: {
      label: 'Mid Recovery (Weeks 5–8)',
      goals: 'Build functional strength, improve gait pattern, increase load tolerance',
      exercises: ['sit-to-stand', 'cavaletti-rails', 'incline-walking']
    },
    late: {
      label: 'Late Recovery (Weeks 9–12)',
      goals: 'Return to full function, improve neuromuscular control, sport readiness',
      exercises: ['step-ups', 'figure-8-walking', 'balance-disc']
    }
  },

  // --------------------------------------------------------------------------
  // TTA — Tibial Tuberosity Advancement
  // --------------------------------------------------------------------------
  TTA: {
    early: {
      label: 'Early Recovery (Weeks 1–4)',
      goals: 'Protect surgical repair, restore passive mobility, initiate stance',
      exercises: ['prom', 'leash-walking', 'weight-shifting']
    },
    mid: {
      label: 'Mid Recovery (Weeks 5–8)',
      goals: 'Progressive loading, improve gait symmetry',
      exercises: ['sit-to-stand', 'treadmill-walking', 'incline-walking']
    },
    late: {
      label: 'Late Recovery (Weeks 9–12)',
      goals: 'Functional reintegration, advanced proprioception',
      exercises: ['step-ups', 'figure-8-walking', 'wobble-board']
    }
  },

  // --------------------------------------------------------------------------
  // FHO — Femoral Head Ostectomy
  // --------------------------------------------------------------------------
  FHO: {
    early: {
      label: 'Early Recovery (Weeks 1–3)',
      goals: 'Encourage early weight bearing, reduce disuse atrophy',
      exercises: ['leash-walking', 'weight-shifting', 'prom']
    },
    mid: {
      label: 'Mid Recovery (Weeks 4–8)',
      goals: 'Build hip musculature, improve limb use',
      exercises: ['sit-to-stand', 'incline-walking', 'hip-extension']
    },
    late: {
      label: 'Late Recovery (Weeks 9–12)',
      goals: 'Full functional return, endurance building',
      exercises: ['stair-climbing', 'hill-climbing', 'cavaletti-rails']
    }
  },

  // --------------------------------------------------------------------------
  // IVDD — Intervertebral Disc Disease
  // --------------------------------------------------------------------------
  IVDD: {
    early: {
      label: 'Acute Phase (Weeks 1–3)',
      goals: 'Neurological recovery support, controlled passive movement',
      exercises: ['prom', 'arom', 'leash-walking']
    },
    mid: {
      label: 'Subacute Phase (Weeks 4–7)',
      goals: 'Core stability, proprioception retraining, gait improvement',
      exercises: ['cookie-stretches', 'diagonal-leg-lifts', 'treadmill-walking']
    },
    late: {
      label: 'Chronic/Maintenance Phase (Weeks 8+)',
      goals: 'Core endurance, balance, functional movement',
      exercises: ['sit-pretty', 'wobble-board', 'cavaletti-rails']
    }
  },

  // --------------------------------------------------------------------------
  // HIP_DYSPLASIA — Canine Hip Dysplasia
  // --------------------------------------------------------------------------
  HIP_DYSPLASIA: {
    early: {
      label: 'Initial Phase (Weeks 1–4)',
      goals: 'Pain reduction, improve hip mobility, gentle conditioning',
      exercises: ['underwater-treadmill', 'prom', 'leash-walking']
    },
    mid: {
      label: 'Strengthening Phase (Weeks 5–10)',
      goals: 'Hip stabilizer strengthening, weight distribution',
      exercises: ['sit-to-stand', 'incline-walking', 'hip-extension']
    },
    late: {
      label: 'Maintenance Phase (Ongoing)',
      goals: 'Maintain function, reduce arthritis progression',
      exercises: ['swimming', 'hill-climbing', 'balance-disc']
    }
  },

  // --------------------------------------------------------------------------
  // DEGENERATIVE_MYELOPATHY — DM / Progressive Myelopathy
  // --------------------------------------------------------------------------
  DEGENERATIVE_MYELOPATHY: {
    early: {
      label: 'Stage 1 — Ambulatory Ataxia',
      goals: 'Maximize muscle preservation, slow atrophy, maintain mobility as long as possible',
      exercises: ['underwater-treadmill', 'cavaletti-rails', 'figure-8-walking', 'backward-walking', 'sit-to-stand', 'balance-disc']
    },
    mid: {
      label: 'Stage 2 — Assisted Ambulation',
      goals: 'Supported weight bearing, cart evaluation, forelimb strength maintenance',
      exercises: ['underwater-treadmill', 'sling-walking', 'prom', 'front-step-ups', 'lateral-stepping']
    },
    late: {
      label: 'Stage 3 — Non-Ambulatory / Cart Phase',
      goals: 'Cart ambulation, forelimb strength, pressure sore prevention, quality of life',
      exercises: ['cart-ambulation', 'prom', 'forelimb-strengthening', 'repositioning-program']
    }
  },

  // --------------------------------------------------------------------------
  // LUMBOSACRAL — Lumbosacral Disease / Cauda Equina Syndrome
  // --------------------------------------------------------------------------
  LUMBOSACRAL: {
    early: {
      label: 'Acute Phase (Weeks 1–4)',
      goals: 'Pain reduction, core activation without lumbar extension stress',
      exercises: ['leash-walking', 'prom', 'cookie-stretches', 'underwater-treadmill']
    },
    mid: {
      label: 'Subacute Phase (Weeks 4–8)',
      goals: 'Core stabilization, proprioception, controlled loading',
      exercises: ['core-stabilization', 'balance-disc', 'cavaletti-rails', 'treadmill-walking']
    },
    late: {
      label: 'Maintenance Phase (Weeks 8+)',
      goals: 'Maintain core strength, prevent recurrence, functional return',
      exercises: ['sit-pretty', 'hill-climbing', 'wobble-board', 'backward-walking']
    }
  },

  // --------------------------------------------------------------------------
  // THR — Total Hip Replacement
  // --------------------------------------------------------------------------
  THR: {
    early: {
      label: 'Early Recovery (Weeks 1–4)',
      goals: 'Protect prosthesis, initiate gentle weight bearing, reduce swelling',
      exercises: ['prom', 'leash-walking', 'weight-shifting']
    },
    mid: {
      label: 'Mid Recovery (Weeks 4–8)',
      goals: 'Hip strengthening, gait normalization, controlled stair reintroduction',
      exercises: ['sit-to-stand', 'incline-walking', 'underwater-treadmill', 'hip-extension']
    },
    late: {
      label: 'Return to Function (Weeks 8–16)',
      goals: 'Full functional return, endurance, advanced proprioception',
      exercises: ['hill-climbing', 'cavaletti-rails', 'balance-disc', 'figure-8-walking']
    }
  },

  // --------------------------------------------------------------------------
  // LUXATING_PATELLA — Medial or Lateral Patellar Luxation
  // --------------------------------------------------------------------------
  LUXATING_PATELLA: {
    early: {
      label: 'Post-Op Early (Weeks 1–4)',
      goals: 'Controlled weight bearing, stifle ROM, quadriceps activation',
      exercises: ['prom', 'leash-walking', 'weight-shifting', 'underwater-treadmill']
    },
    mid: {
      label: 'Strengthening Phase (Weeks 4–8)',
      goals: 'Quadriceps and hip stabilizer strengthening, gait improvement',
      exercises: ['sit-to-stand', 'step-ups', 'cavaletti-rails', 'incline-walking']
    },
    late: {
      label: 'Return to Function (Weeks 8–12)',
      goals: 'Full weight bearing, agility foundations, neuromuscular control',
      exercises: ['figure-8-walking', 'backward-walking', 'balance-disc', 'hill-climbing']
    }
  },

  // --------------------------------------------------------------------------
  // OCD_SHOULDER — Osteochondrosis Dissecans of the Shoulder
  // --------------------------------------------------------------------------
  OCD_SHOULDER: {
    early: {
      label: 'Post-Op / Conservative Phase (Weeks 1–4)',
      goals: 'Reduce shoulder swelling, restore passive ROM, prevent muscle atrophy',
      exercises: ['prom', 'leash-walking', 'weight-shifting', 'cold-therapy']
    },
    mid: {
      label: 'Strengthening Phase (Weeks 4–8)',
      goals: 'Forelimb load tolerance, scapular stabilizer strengthening',
      exercises: ['treadmill-walking', 'front-step-ups', 'foam-pad', 'wheelbarrow']
    },
    late: {
      label: 'Return to Function (Weeks 8–12)',
      goals: 'Full forelimb function, sport readiness',
      exercises: ['cavaletti-rails', 'obstacle-course', 'figure-8-walking', 'incline-walking']
    }
  },

  // --------------------------------------------------------------------------
  // OA_GENERAL — Osteoarthritis / Degenerative Joint Disease (General)
  // --------------------------------------------------------------------------
  OA_GENERAL: {
    early: {
      label: 'Flare Management Phase',
      goals: 'Pain reduction, gentle ROM maintenance, aquatic priority',
      exercises: ['underwater-treadmill', 'prom', 'leash-walking', 'cold-therapy']
    },
    mid: {
      label: 'Conditioning Phase',
      goals: 'Muscle strengthening to offload joints, improve gait symmetry',
      exercises: ['sit-to-stand', 'cavaletti-rails', 'incline-walking', 'balance-disc']
    },
    late: {
      label: 'Lifelong Maintenance Phase',
      goals: 'Sustain muscle mass, manage body weight, prevent OA progression',
      exercises: ['figure-8-walking', 'swimming', 'hill-climbing', 'backward-walking', 'lateral-stepping']
    }
  },

  // --------------------------------------------------------------------------
  // POST_FRACTURE — Post-Fracture Repair (Plating, Nailing, External Fixator)
  // --------------------------------------------------------------------------
  POST_FRACTURE: {
    early: {
      label: 'Bone Protection Phase (Weeks 1–4)',
      goals: 'Maintain ROM in adjacent joints, prevent disuse atrophy, per-surgeon weight bearing guidance',
      exercises: ['prom', 'arom', 'leash-walking']
    },
    mid: {
      label: 'Callus Formation Phase (Weeks 4–8)',
      goals: 'Progressive loading per radiographic healing, muscle strengthening',
      exercises: ['sit-to-stand', 'treadmill-walking', 'weight-shifting', 'underwater-treadmill']
    },
    late: {
      label: 'Remodeling Phase (Weeks 8–16)',
      goals: 'Return to full function, bone stress adaptation',
      exercises: ['cavaletti-rails', 'incline-walking', 'figure-8-walking', 'balance-disc']
    }
  },

  // --------------------------------------------------------------------------
  // ELBOW_DYSPLASIA — Elbow Dysplasia / FCP / OCD
  // --------------------------------------------------------------------------
  ELBOW_DYSPLASIA: {
    early: {
      label: 'Post-Op / Early Conservative (Weeks 1–4)',
      goals: 'Restore elbow ROM, reduce swelling, controlled weight bearing',
      exercises: ['prom', 'leash-walking', 'weight-shifting']
    },
    mid: {
      label: 'Strengthening Phase (Weeks 5–8)',
      goals: 'Forelimb load tolerance, proprioception',
      exercises: ['treadmill-walking', 'front-step-ups', 'foam-pad']
    },
    late: {
      label: 'Return to Function (Weeks 9–12)',
      goals: 'Full forelimb use, coordination, endurance',
      exercises: ['wheelbarrow', 'cavaletti-rails', 'obstacle-course']
    }
  },

  // ==========================================================================
  // ═══════════════════════ FELINE CONDITIONS ════════════════════════════════
  // Species: CAT | Authority: Drum/Bockstahler/Levine 2015; Sharp 2012;
  //          Goldberg 2025; Hardie 2002; Benito 2013 (FMPI)
  // All feline exercise codes prefixed FELINE_
  // Pain assessment: FGS (acute, ≥4/10 = treat), FMPI (chronic DJD, 17-item)
  // Principle: ALL exercises linked to hunt/play/feed. Sessions shorter than canine.
  // ==========================================================================

  // --------------------------------------------------------------------------
  // FELINE_OA — Feline Osteoarthritis (Appendicular)
  // 90% of cats >12yr have radiographic OA; only 4% are clinically identified.
  // Lameness is NOT a reliable sign — behavioral changes are primary indicators.
  // Behavioral red flags: reduced jumping, stair avoidance, decreased grooming,
  //   inappropriate elimination, social withdrawal, aggression.
  // --------------------------------------------------------------------------
  FELINE_OA: {
    early: {
      label: 'Flare Management / Acute OA Phase',
      goals: 'FGS pain assessment, analgesia optimisation, PBMT for initial pain relief, gentle PROM, environmental modification prescribed',
      exercises: ['FELINE_PBMT', 'FELINE_MASSAGE', 'FELINE_PROM', 'FELINE_THERMAL', 'FELINE_ENVIRON_MOD']
    },
    mid: {
      label: 'Active Rehabilitation Phase',
      goals: 'Active ROM via prey drive, treat-target weight shifting, proprioception retraining, FMPI baseline recorded',
      exercises: ['FELINE_MASSAGE', 'FELINE_WAND_AROM', 'FELINE_TREAT_SHIFT', 'FELINE_SIT_STAND', 'FELINE_PBMT', 'FELINE_TENS', 'FELINE_ENVIRON_MOD']
    },
    late: {
      label: 'Maintenance Phase (Lifelong)',
      goals: 'Preserve muscle mass, maintain joint mobility, FMPI tracking, stair reintegration, home program reinforcement',
      exercises: ['FELINE_CAVALETTI', 'FELINE_THREE_LEG', 'FELINE_WOBBLE', 'FELINE_STAIR_WAND', 'FELINE_SIT_STAND', 'FELINE_ENVIRON_MOD', 'FELINE_PBMT']
    }
  },

  // --------------------------------------------------------------------------
  // FELINE_OA_AXIAL — Feline Axial / Spinal OA (Spondylosis, DLS)
  // Shoulders, elbows, spine are primary sites (Hardie 2002; Lascelles 2010).
  // Cervical OA: difficulty eating from floor bowl — prescribe raised bowl.
  // Lumbosacral: inappropriate elimination due to pain entering litter box.
  // --------------------------------------------------------------------------
  FELINE_OA_AXIAL: {
    early: {
      label: 'Pain Control Phase',
      goals: 'PBMT lumbosacral/spinal, paraspinal massage, environmental modification (litter box, raised bowls)',
      exercises: ['FELINE_PBMT', 'FELINE_MASSAGE', 'FELINE_TENS', 'FELINE_THERMAL', 'FELINE_ENVIRON_MOD']
    },
    mid: {
      label: 'Mobility Restoration Phase',
      goals: 'Cervical/spinal AROM via wand, core activation, treat-target lateral flexion',
      exercises: ['FELINE_WAND_AROM', 'FELINE_MASSAGE', 'FELINE_TREAT_SHIFT', 'FELINE_PBMT', 'FELINE_ENVIRON_MOD']
    },
    late: {
      label: 'Maintenance Phase',
      goals: 'Maintain spinal mobility, cavaletti for dynamic spinal flexion, ongoing home program',
      exercises: ['FELINE_CAVALETTI', 'FELINE_WOBBLE', 'FELINE_MASSAGE', 'FELINE_PBMT', 'FELINE_ENVIRON_MOD']
    }
  },

  // --------------------------------------------------------------------------
  // FELINE_IVDD_CAT — Feline IVDD (Intervertebral Disc Disease)
  // Lumbar most common (59%), then thoracolumbar (31%), cervical (5%).
  // Hansen Type I extrusion most common. 85% positive outcome regardless of Rx.
  // Deep pain preserved in 87% of cats at presentation.
  // CRITICAL DIFFERENTIAL: Distinguish from FATE before ANY exercise prescription.
  //   FATE: cold limbs, absent femoral pulse, acute onset, +5P rule
  //   IVDD: painful spinal palpation, normal limb temperature/circulation
  // --------------------------------------------------------------------------
  FELINE_IVDD_CAT: {
    early: {
      label: 'Acute Neurological Phase (Weeks 1–3)',
      goals: 'Confirm FATE excluded (check femoral pulses), PBMT spinal, physio-roll standing, sensory stimulation, PROM all joints',
      exercises: ['FELINE_PBMT', 'FELINE_PROM', 'FELINE_STAND_ROLL', 'FELINE_MASSAGE', 'FELINE_THERMAL']
    },
    mid: {
      label: 'Neurological Recovery Phase (Weeks 3–8)',
      goals: 'Assisted standing progressed to unassisted, wand AROM, treat-target weight shifting, cavaletti for foot placement',
      exercises: ['FELINE_STAND_ROLL', 'FELINE_WAND_AROM', 'FELINE_TREAT_SHIFT', 'FELINE_CAVALETTI', 'FELINE_WOBBLE', 'FELINE_PBMT', 'FELINE_TENS']
    },
    late: {
      label: 'Return to Function Phase (Weeks 8+)',
      goals: 'Stair reintegration, full environmental independence, balance challenge, prevent recurrence via body weight management',
      exercises: ['FELINE_STAIR_WAND', 'FELINE_THREE_LEG', 'FELINE_CAVALETTI', 'FELINE_SIT_STAND', 'FELINE_ENVIRON_MOD', 'FELINE_UWTM']
    }
  },

  // --------------------------------------------------------------------------
  // FELINE_FATE_RECOVERY — Post-FATE (Feline Aortic Thromboembolism) Recovery
  // FATE = most common thromboembolism in veterinary medicine (1/175 tertiary cases).
  // 80% of FATE cats have unrecognized HCM as underlying cause.
  // Diagnosed by 5P rule: Pain, Pulselessness, Paralysis/Paresis, Polar (cold), Pallor.
  // Survival with supportive care: 30-40%. Median survival >1 year post-thromboprophylaxis.
  //
  // ⚠️  CARDIAC SAFETY GATES — MANDATORY:
  //   - Echocardiography required before ANY exercise prescription
  //   - Exercise intensity governed by cardiac status, NOT neurological recovery
  //   - HCM Stage C/D: ABSOLUTE contraindication to therapeutic exercise
  //   - HCM Stage B2: cardiologist clearance required, low-intensity only
  //   - NO UWTM in any FATE cat (water immersion increases cardiac preload)
  //   - NO heat modalities over thorax
  //   - STRESS IS A KILLER — minimal restraint, quiet environment mandatory
  // --------------------------------------------------------------------------
  FELINE_FATE_RECOVERY: {
    early: {
      label: 'Post-FATE Stabilization (Weeks 1–2)',
      goals: 'Cardiac assessment mandatory, FGS pain scoring, PROM only to prevent contracture, NO active exercise until cardiac status confirmed stable',
      exercises: ['FELINE_PROM', 'FELINE_MASSAGE', 'FELINE_PBMT', 'FELINE_ENVIRON_MOD']
    },
    mid: {
      label: 'Neurological Recovery Phase (Weeks 2–6, cardiac-cleared only)',
      goals: 'Physio-roll assisted standing, treat-target weight shifting, sensory stimulation, low-stress approach mandatory',
      exercises: ['FELINE_STAND_ROLL', 'FELINE_TREAT_SHIFT', 'FELINE_WAND_AROM', 'FELINE_MASSAGE', 'FELINE_PBMT', 'FELINE_TENS']
    },
    late: {
      label: 'Functional Recovery (Weeks 6+, cardiac-cleared only)',
      goals: 'Stair reintegration, environmental modification, sit-to-stand strengthening — always with cardiac status monitoring',
      exercises: ['FELINE_SIT_STAND', 'FELINE_CAVALETTI', 'FELINE_THREE_LEG', 'FELINE_ENVIRON_MOD', 'FELINE_STAIR_WAND']
    }
  },

  // --------------------------------------------------------------------------
  // FELINE_HCM_SUBCLINICAL — Feline HCM (Subclinical, Stage A/B1)
  // HCM affects ~15% of domestic cat population (most subclinical).
  // High-risk breeds: Maine Coon (A31P MYBPC3 mutation), Ragdoll, Sphynx,
  //   Persian, Norwegian Forest, Bengal, British Shorthair, American Shorthair.
  // Stage A/B1: No clinical signs, minimal LA dilation — managed conservatively.
  // Exercise permitted at low-moderate intensity with cardiac monitoring.
  // NO murmur does NOT rule out HCM (31-62% of HCM cats have no audible murmur).
  // STRESS KILLS — all feline rehab in HCM cats must be low-stress.
  // --------------------------------------------------------------------------
  FELINE_HCM_SUBCLINICAL: {
    early: {
      label: 'Initial Assessment Phase',
      goals: 'Confirm stage (echo), prescribe low-stress environment modification, PBMT acceptable, NO exercise until staged',
      exercises: ['FELINE_ENVIRON_MOD', 'FELINE_MASSAGE', 'FELINE_PBMT']
    },
    mid: {
      label: 'Low-Intensity Rehab Phase (Stage B1 cleared)',
      goals: 'Gentle wand play (short sessions), treat-target shifting, environmental enrichment — monitor for dyspnea during activity',
      exercises: ['FELINE_WAND_AROM', 'FELINE_TREAT_SHIFT', 'FELINE_MASSAGE', 'FELINE_ENVIRON_MOD']
    },
    late: {
      label: 'Maintenance Phase',
      goals: 'Ongoing low-intensity activity, environmental enrichment, body weight management, 6-monthly cardiac reassessment',
      exercises: ['FELINE_WAND_AROM', 'FELINE_SIT_STAND', 'FELINE_ENVIRON_MOD', 'FELINE_MASSAGE']
    }
  },

  // --------------------------------------------------------------------------
  // FELINE_POST_FRACTURE_CAT — Post-Fracture Repair (Feline)
  // Major cause: vehicular trauma, high-rise syndrome, animal fights.
  // Feline fracture rehab starts day 1 post-op (Sharp 2012).
  // Shorter session duration than canine. Hunt/play exercise motivation.
  // Therapeutic ultrasound: lower intensities due to less dense feline tissue.
  // --------------------------------------------------------------------------
  FELINE_POST_FRACTURE_CAT: {
    early: {
      label: 'Bone Protection Phase (Weeks 1–4)',
      goals: 'Day-1 PROM, cold therapy acute, prevent contracture, maintain adjacent joint mobility, PBMT for healing',
      exercises: ['FELINE_PROM', 'FELINE_THERMAL', 'FELINE_MASSAGE', 'FELINE_PBMT', 'FELINE_ENVIRON_MOD']
    },
    mid: {
      label: 'Callus Formation Phase (Weeks 4–8)',
      goals: 'Treat-target weight shifting onto healing limb, wand AROM, cavaletti for foot placement re-education',
      exercises: ['FELINE_TREAT_SHIFT', 'FELINE_WAND_AROM', 'FELINE_SIT_STAND', 'FELINE_CAVALETTI', 'FELINE_PBMT', 'FELINE_TENS']
    },
    late: {
      label: 'Remodeling / Return to Function (Weeks 8–16)',
      goals: 'Stair reintegration, balance challenge, three-leg standing, full environmental independence',
      exercises: ['FELINE_STAIR_WAND', 'FELINE_THREE_LEG', 'FELINE_WOBBLE', 'FELINE_CAVALETTI', 'FELINE_ENVIRON_MOD']
    }
  },

  // --------------------------------------------------------------------------
  // FELINE_NEURO_CAT — Feline Neurological Rehabilitation (General)
  // Covers: FCE (rare in cats), spinal trauma, brachial plexus avulsion,
  //   post-surgical neuro recovery, traumatic peripheral neuropathy.
  // Sharp (2012): Many neurological strategies for humans with SCI were
  //   developed through research ON CATS — cats can now benefit from this knowledge.
  // LMN (lower motor neuron): flaccid paresis, aggressive intervention needed.
  // UMN (upper motor neuron): spastic paresis, careful ROM to prevent contracture.
  // --------------------------------------------------------------------------
  FELINE_NEURO_CAT: {
    early: {
      label: 'Acute Neurological Phase',
      goals: 'FATE differential excluded, PROM to prevent contracture, sensory stimulation of paw pads, physio-roll standing',
      exercises: ['FELINE_PROM', 'FELINE_STAND_ROLL', 'FELINE_MASSAGE', 'FELINE_PBMT', 'FELINE_TENS']
    },
    mid: {
      label: 'Neurological Re-Education Phase',
      goals: 'Assisted standing to unassisted, wand AROM, cavaletti foot placement, unstable surface proprioception',
      exercises: ['FELINE_STAND_ROLL', 'FELINE_WAND_AROM', 'FELINE_CAVALETTI', 'FELINE_WOBBLE', 'FELINE_TREAT_SHIFT', 'FELINE_UWTM', 'FELINE_PBMT']
    },
    late: {
      label: 'Return to Function Phase',
      goals: 'Stair independence, three-leg balance, full environmental integration, home program',
      exercises: ['FELINE_STAIR_WAND', 'FELINE_THREE_LEG', 'FELINE_SIT_STAND', 'FELINE_CAVALETTI', 'FELINE_ENVIRON_MOD']
    }
  }

};

// ============================================================================
// RULE LOOKUP FUNCTION
// Returns the exercise slugs for a given condition + phase
// ============================================================================

function getExerciseSlugsForPhase(condition, phase) {
  const conditionKey = condition.toUpperCase().replace(/[- ]/g, '_');
  const phaseKey = phase.toLowerCase();

  const conditionRules = PROTOCOL_RULES[conditionKey];
  if (!conditionRules) return null;

  const phaseRules = conditionRules[phaseKey];
  if (!phaseRules) return null;

  return {
    condition: conditionKey,
    phase: phaseKey,
    label: phaseRules.label,
    goals: phaseRules.goals,
    slugs: phaseRules.exercises
  };
}

// List all available conditions
function getAvailableConditions() {
  return Object.keys(PROTOCOL_RULES);
}

// List all phases for a condition
function getPhasesForCondition(condition) {
  const conditionKey = condition.toUpperCase().replace(/[- ]/g, '_');
  const rules = PROTOCOL_RULES[conditionKey];
  if (!rules) return null;
  return Object.keys(rules).map(phase => ({
    phase,
    label: rules[phase].label,
    goals: rules[phase].goals
  }));
}

module.exports = {
  PROTOCOL_RULES,
  getExerciseSlugsForPhase,
  getAvailableConditions,
  getPhasesForCondition
};
