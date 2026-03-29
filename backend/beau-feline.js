// ============================================================================
// B.E.A.U. — Feline Clinical Intelligence Module
// Species-Specific Rehab Logic for Feline Patients
// ============================================================================

module.exports = {

  // --------------------------------------------------------------------------
  // 1. Feline Pain Indicators
  // --------------------------------------------------------------------------
  painIndicators: [
    "decreased grooming",
    "hiding",
    "crouched posture",
    "reduced jumping",
    "irritability",
    "decreased play",
    "reluctance to move",
    "change in appetite"
  ],

  // --------------------------------------------------------------------------
  // 2. Feline Tolerance Model
  // --------------------------------------------------------------------------
  tolerance: {
    sessionLength: "short",
    repetition: "low",
    autonomy: "high",
    stopIf: ["withdraws", "hides", "stops engaging", "ears flatten", "tail flicking"]
  },

  // --------------------------------------------------------------------------
  // 3. Feline Exercise Library
  // --------------------------------------------------------------------------
  exercises: {
    mobility: [
      "Gentle Assisted Walking",
      "Controlled Exploration Path",
      "Assisted Step-Up/Step-Down (2–4 inches)",
      "Targeted Movement (Nose-to-Target)"
    ],
    rom: [
      "Low-Stress Passive ROM",
      "Towel-Assisted Positioning",
      "Micro Lateral Weight Shifts"
    ],
    strength: [
      "Controlled Reaching",
      "Short-Duration Weight Shifts",
      "Paw Targeting",
      "Slow Step-Overs (1–2 inches)"
    ],
    environment: [
      "Ramp Access to Preferred Surfaces",
      "Non-Slip Surface Zones",
      "Elevated Resting Areas with Safe Access",
      "Litterbox Optimization (low entry, non-slip mat)"
    ],
    enrichment: [
      "Wand Toy Tracking (slow arcs)",
      "Food Puzzle Movement",
      "Target Games (nose or paw)"
    ],
    postSurgical: [
      "Crate Rest Mobility Breaks (3–5 min)",
      "Low-Stress Handling Mobility",
      "Gradual Reintroduction to Environment"
    ]
  },

  // --------------------------------------------------------------------------
  // 4. Feline Protocol Templates
  // --------------------------------------------------------------------------
  protocols: {

    oa: {
      stageA: [
        "Non-slip flooring",
        "Low-entry litterbox",
        "Elevated resting areas with ramps",
        "Gentle mobility (2–3 minutes)"
      ],
      stageB: [
        "Controlled exploration path",
        "Assisted step-ups (2–4 inches)",
        "Slow wand toy arcs",
        "ROM only if tolerated"
      ],
      stageC: [
        "Controlled reaching",
        "Slow step-overs",
        "Food puzzle movement",
        "Short weight shifts"
      ],
      stageD: [
        "Gradual reintroduction to preferred perches",
        "Increased exploration time",
        "Play-based strengthening"
      ]
    },

    postSurgical: {
      stageA: [
        "Strict rest",
        "Low-stress handling",
        "Litterbox optimization",
        "Pain control monitoring"
      ],
      stageB: [
        "Controlled exploration (1–2 minutes)",
        "Assisted walking",
        "Towel-assisted ROM (only if tolerated)"
      ],
      stageC: [
        "Step-ups (2–4 inches)",
        "Controlled reaching",
        "Slow step-overs"
      ],
      stageD: [
        "Gradual territory expansion",
        "Play-based movement",
        "Environmental enrichment"
      ]
    },

    neuro: {
      stageA: [
        "Non-slip surfaces",
        "Assisted standing",
        "Supported weight shifts"
      ],
      stageB: [
        "Assisted stepping",
        "Controlled exploration path",
        "Targeted stepping (nose-to-target)"
      ],
      stageC: [
        "Step-overs",
        "Controlled reaching",
        "Paw-targeting"
      ],
      stageD: [
        "Play-based neuromuscular work",
        "Gradual increase in movement duration",
        "Environmental optimization"
      ]
    },

    geriatric: {
      stageA: [
        "Warm resting areas",
        "Non-slip flooring",
        "Litterbox optimization"
      ],
      stageB: [
        "Controlled exploration",
        "Assisted walking",
        "Slow wand toy arcs"
      ],
      stageC: [
        "Step-ups",
        "Controlled reaching",
        "Food puzzle movement"
      ],
      stageD: [
        "Daily low-stress play",
        "Environmental enrichment",
        "Routine mobility circuits"
      ]
    }
  },

  // --------------------------------------------------------------------------
  // 5. Feline Exercise Selector (Core Logic)
  // --------------------------------------------------------------------------
  selectExercises(intake) {
    return {
      mobility: this.exercises.mobility,
      rom: this.exercises.rom,
      strength: this.exercises.strength,
      environment: this.exercises.environment,
      enrichment: this.exercises.enrichment,
      postSurgical: this.exercises.postSurgical
    };
  },

  // --------------------------------------------------------------------------
  // 6. Generate Full Feline Rehab Plan
  // --------------------------------------------------------------------------
  generateFelinePlan(intake) {
    const species = intake?.species?.toLowerCase() || "feline";

    return {
      species,
      painIndicators: this.painIndicators,
      tolerance: this.tolerance,
      exercises: this.selectExercises(intake),
      protocols: this.protocols
    };
  }
};