// ============================================================================
// VISUAL ENGINE — Orchestrator (Ideogram AI Clone)
// Template-based visual cards for exercise instructions and infographics
// ============================================================================

const { CARD_TYPES, validateCard } = require("./card-templates");
const { ALL_EXERCISES } = require("../../all-exercises");

// Storyboard library
let STORYBOARD_LIBRARY = {};
try {
  const sb = require("../../storyboard-references");
  STORYBOARD_LIBRARY = sb.STORYBOARD_LIBRARY || sb;
  console.log(`[Visual Engine] Storyboard library loaded: ${Object.keys(STORYBOARD_LIBRARY).length} exercises`);
} catch (err) {
  console.warn("[Visual Engine] Storyboard library not available:", err.message);
}

// Exercise lookup for card generation
const exerciseMap = {};
ALL_EXERCISES.forEach(ex => { exerciseMap[ex.code] = ex; });

/**
 * Generate a visual card from exercise data.
 * @param {string} cardType — Card type key
 * @param {Object} params — Card parameters (exerciseCode, etc.)
 * @returns {{ valid: boolean, card?: Object, errors?: string[] }}
 */
function generateCard(cardType, params) {
  if (cardType === "exercise_instruction" && params.code) {
    const ex = exerciseMap[params.code];
    if (!ex) return { valid: false, errors: [`Exercise not found: ${params.code}`] };

    return {
      valid: true,
      card: {
        type: "exercise_instruction",
        exerciseName: ex.name,
        code: ex.code,
        category: ex.category,
        difficulty: ex.difficulty_level || "Moderate",
        steps: ex.steps || [],
        equipment: ex.equipment || [],
        formCues: ex.good_form || [],
        redFlags: ex.red_flags || [],
        sets: ex.clinical_parameters?.dosage || null,
        contraindications: ex.contraindications || null,
        progression: ex.progression || null,
        evidenceGrade: ex.evidence_base?.grade || null,
      },
    };
  }

  // Storyboard card — pull from STORYBOARD_LIBRARY
  if (cardType === "storyboard" && params.code) {
    const sb = STORYBOARD_LIBRARY[params.code];
    const ex = exerciseMap[params.code];
    if (!sb && !ex) return { valid: false, errors: [`No storyboard or exercise found for: ${params.code}`] };

    if (sb) {
      return {
        valid: true,
        card: {
          type: "storyboard",
          code: params.code,
          exerciseName: sb.exercise_name || ex?.name || params.code,
          breedModel: sb.breed_model || null,
          clinicalPurpose: sb.clinical_purpose || null,
          indications: sb.indications || [],
          contraindications: sb.contraindications || [],
          equipmentNeeded: sb.equipment_needed || [],
          handlerSetup: sb.handler_setup || null,
          movementBreakdown: sb.movement_breakdown || [],
          frames: (sb.frames || []).map(f => ({
            number: f.frame_number,
            title: f.frame_title,
            description: f.frame_description,
            dogAction: f.dog_action,
            handlerAction: f.handler_action,
            clinicalCues: f.clinical_cues,
            safetyNotes: f.safety_notes,
            duration: f.duration_seconds,
            svgIndicators: f.svg_indicators || [],
          })),
          clientScript: sb.client_friendly_script || null,
          clinicianScript: sb.clinician_level_script || null,
        },
      };
    }

    // Fallback: generate basic storyboard from exercise data
    return {
      valid: true,
      card: {
        type: "storyboard",
        code: params.code,
        exerciseName: ex.name,
        breedModel: null,
        clinicalPurpose: ex.description || null,
        indications: [],
        contraindications: ex.contraindications ? [ex.contraindications] : [],
        equipmentNeeded: (ex.equipment || []).map(e => ({ item: e, required: true })),
        handlerSetup: ex.setup || null,
        movementBreakdown: (ex.steps || []).map((s, i) => ({ step: i + 1, action: s })),
        frames: [],
        clientScript: null,
        clinicianScript: null,
      },
    };
  }

  // For other card types, validate and pass through
  const card = { type: cardType, ...params };
  const { valid, errors } = validateCard(card);
  return valid ? { valid: true, card } : { valid: false, errors };
}

/**
 * Get visual generation instructions for the system prompt.
 */
function getVisualInstructions() {
  return `## VISUAL CARD CAPABILITY
When the user asks for an exercise card, anatomy diagram, recovery timeline visual, or exercise progression chart, you can emit a visual block.

Format: Wrap the JSON in :::visual and ::: markers. Example:

:::visual
{"type":"exercise_instruction","exerciseName":"Sit-to-Stand Transitions","code":"SIT_STAND","category":"Active Assisted","difficulty":"Easy","steps":["Position dog in sitting position on non-slip surface","Lure with treat to standing position","Hold standing for 3-5 seconds","Slowly lure back to sit","Repeat"],"equipment":["Non-slip mat","Treat rewards"],"formCues":["Square sit position","Even weight distribution","Controlled speed"],"redFlags":["Bunny-hopping","Pain vocalization","Trembling"],"sets":"5-10 reps x 2-3 sets","frequency":"2x/day"}
:::

Available card types:
${Object.entries(CARD_TYPES).map(([key, t]) => `- **${key}**: ${t.description}`).join("\n")}

**exercise_instruction**: Use when showing a specific exercise with steps, equipment, and safety info.
**anatomy_diagram**: {"type":"anatomy_diagram","title":"Stifle Joint","region":"hindlimb","structures":[{"name":"Cranial Cruciate Ligament","status":"affected"},{"name":"Meniscus","status":"normal"},{"name":"Tibial Plateau","status":"surgical site"}]}
**recovery_timeline**: {"type":"recovery_timeline","title":"TPLO Recovery","totalWeeks":16,"currentPhase":2,"phases":[{"name":"Acute Protection","weeks":"0-2","color":"#0EA5E9"},{"name":"Early Mobilization","weeks":"2-6","color":"#1D9E75"},{"name":"Controlled Strengthening","weeks":"6-12","color":"#BA7517"},{"name":"Return to Function","weeks":"12-16+","color":"#8B5CF6"}]}
**exercise_progression**: {"type":"exercise_progression","title":"Balance Progression","currentLevel":1,"exercises":[{"name":"Wobble Board Stand","code":"WOBBLE_BOARD","level":1},{"name":"Balance Pad Exercises","code":"BALANCE_PAD","level":2},{"name":"Physioball Exercises","code":"PHYSIO_BALL","level":3}]}

**storyboard**: Frame-by-frame clinical exercise demonstration with breed model, SVG overlays, handler cues, and safety notes. Use when the user asks for a storyboard, demonstration, or "show me how to do" an exercise.
Example: :::visual
{"type":"storyboard","code":"PROM_STIFLE"}
:::

Available storyboard exercises: ${Object.keys(STORYBOARD_LIBRARY).length} exercises have full storyboard data with frames, SVG indicators, breed models, and clinical scripts.

Trigger phrases: "show me the exercise card", "exercise instructions for", "anatomy of", "show recovery timeline", "progression path", "storyboard for", "show me how to do", "demonstrate", "show me the storyboard"`;
}

function isReady() { return true; }
function getStatus() { return { ready: true, cardTypes: Object.keys(CARD_TYPES), exercisesAvailable: Object.keys(exerciseMap).length, storyboardsAvailable: Object.keys(STORYBOARD_LIBRARY).length }; }

module.exports = { generateCard, getVisualInstructions, isReady, getStatus };
