// ai-system-prompt.js — System prompt templates for K9 Rehab Pro Vet AI
// Constructs layered system prompts with clinical rules and context injection

const { ALL_EXERCISES, getExerciseByCode } = require('./all-exercises');
const { PROTOCOL_DEFINITIONS, EVIDENCE_MAP } = require('./protocol-generator');

// ─── Identity & Clinical Rules Layer (~500 tokens) ───
const IDENTITY_PROMPT = `You are K9 Rehab Pro AI, a veterinary rehabilitation intelligence designed to assist licensed veterinary professionals with canine rehabilitation protocol planning, exercise selection, and clinical decision support.

CORE CLINICAL RULES:
- No hallucinations. No fabricated exercises. No invented diagnoses.
- All exercises must be real, evidence-based, veterinary-approved, and used in clinical practice.
- All exercises must map to the correct diagnosis category.
- Never contradict veterinary safety standards.
- Never generalize; always be specific and clinically aligned.
- Always include evidence base references for exercise recommendations.
- You are a clinical decision-support system (CDSS), NOT a substitute for licensed veterinary judgment.

DIAGNOSIS CATEGORIES:
- Post-operative orthopedic (TPLO, TTA, FHO, THR, patellar repair)
- Non-surgical orthopedic (CCL conservative, hip dysplasia, OA)
- Neurologic (IVDD, FCE, DM, wobbler syndrome)
- Geriatric (mobility decline, sarcopenia, chronic pain)
- Soft-tissue (tendon, ligament, muscle injuries)
- Pain management
- Mobility support
- Conditioning / fitness

SAFETY RULES:
- Pain scores >= 8/10: restrict to passive modalities only
- Non-weight-bearing patients: exclude gait training exercises
- Post-op patients: respect tissue healing timelines and phase restrictions
- Cardiac conditions: exclude aquatic and high-intensity exercises
- Pacemaker: exclude all electrical stimulation modalities
- Neoplasia/cancer: exclude ultrasound and laser therapy
- Pregnancy: exclude electrical stimulation modalities
- Always flag red flags: absent neuro function, incision complications, implant failure signs

BEHAVIORAL RULES:
- Be concise and clinically precise.
- Use standard veterinary rehabilitation terminology.
- When recommending exercises, always specify the exercise code (e.g., PROM_STIFLE).
- When generating protocols, follow the structured format with phases and weekly progression.
- All generated content must be reviewed by a licensed veterinarian before clinical use.
- Include this disclaimer when generating protocols: "This protocol is generated as clinical decision support and must be reviewed by a licensed veterinarian before implementation."`;

// ─── Exercise Index Builder (~2000 tokens for 170+ exercises) ───
function buildExerciseIndex() {
  const index = ALL_EXERCISES.map(ex =>
    `${ex.code} | ${ex.name} | ${ex.category} | ${ex.difficulty_level || 'Moderate'}`
  ).join('\n');

  return `EXERCISE LIBRARY INDEX (${ALL_EXERCISES.length} exercises):
Use these codes when referencing exercises. Call the search_exercises or get_exercise_details tool for full clinical details.

Code | Name | Category | Difficulty
${index}`;
}

// ─── Protocol Definitions Layer (on demand) ───
function buildProtocolContext() {
  const protocolSummaries = Object.entries(PROTOCOL_DEFINITIONS).map(([type, def]) => {
    const phases = def.phases ? def.phases.map((p, i) =>
      `  Phase ${i + 1}: ${p.name} (${p.focus || 'progression'})`
    ).join('\n') : '  See protocol details via tool call';

    return `${type.toUpperCase()}:
  Total weeks: ${def.totalWeeks || 'variable'}
${phases}`;
  }).join('\n\n');

  return `PROTOCOL DEFINITIONS:
${protocolSummaries}

Protocol types map from diagnoses:
- TPLO/CCL/TTA/stifle/knee → tplo protocol
- IVDD/FCE/myelopathy/spine → ivdd protocol
- Geriatric/palliative/sarcopenia → geriatric protocol
- Hip dysplasia, OA, forelimbs, other → oa protocol`;
}

// ─── Conditions Summary Layer ───
function buildConditionsContext(conditions) {
  if (!conditions || conditions.length === 0) return '';

  const grouped = {};
  conditions.forEach(c => {
    const cat = c.category || 'Other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(`${c.code}: ${c.name} (severity: ${c.severity || 'variable'}, recovery: ${c.typical_recovery_weeks || '?'} weeks)`);
  });

  const sections = Object.entries(grouped).map(([cat, items]) =>
    `${cat}:\n${items.map(i => `  - ${i}`).join('\n')}`
  ).join('\n\n');

  return `SUPPORTED CONDITIONS:\n${sections}`;
}

// ─── Patient Context Layer (on demand) ───
function buildPatientContext(patient, protocols) {
  if (!patient) return '';

  let ctx = `CURRENT PATIENT CONTEXT:
- Name: ${patient.name}
- Breed: ${patient.breed}
- Age: ${patient.age}
- Weight: ${patient.weight} lbs
- Sex: ${patient.sex || 'unknown'}
- Diagnosis: ${patient.condition || patient.diagnosis || 'not specified'}
- Pain Level: ${patient.pain_level || 'not assessed'}
- Body Condition Score: ${patient.body_condition_score || 'not assessed'}
- Referring Vet: ${patient.referring_vet || 'not specified'}`;

  if (protocols && protocols.length > 0) {
    const latestProtocol = protocols[0];
    ctx += `\n\nACTIVE PROTOCOL:
- Created: ${latestProtocol.created_at}
- Protocol ID: ${latestProtocol.id}`;

    if (latestProtocol.protocol_data) {
      try {
        const data = typeof latestProtocol.protocol_data === 'string'
          ? JSON.parse(latestProtocol.protocol_data)
          : latestProtocol.protocol_data;
        if (data.protocolType) ctx += `\n- Type: ${data.protocolType}`;
        if (data.totalWeeks) ctx += `\n- Duration: ${data.totalWeeks} weeks`;
      } catch (e) { /* ignore parse errors */ }
    }
  }

  return ctx;
}

// ─── Storyboard Template Layer (on demand) ───
const STORYBOARD_TEMPLATE_PROMPT = `STORYBOARD GENERATION TEMPLATE (14-point spec):
When generating a storyboard, output JSON with this structure:
{
  "exercise_name": "string",
  "clinical_purpose": "string",
  "indications": ["string"],
  "contraindications": ["string"],
  "equipment_needed": ["string"],
  "handler_setup": "string",
  "movement_breakdown": ["step descriptions"],
  "frames": [
    {
      "frame_title": "string",
      "dog_action": "string",
      "handler_action": "string",
      "clinical_cues": "string",
      "safety_notes": "string"
    }
  ],
  "overlays": {
    "arrows": ["direction indicators"],
    "joint_angle_indicators": ["angle measurements"],
    "weight_shift_indicators": ["weight distribution"],
    "good_form_labels": ["correct position cues"],
    "common_mistake_labels": ["error examples"],
    "safety_warnings": ["red flag indicators"]
  },
  "client_script": "20-30 second owner-friendly narration",
  "clinician_script": "20-40 second technical narration",
  "file_naming": "category-exercise-storyboard-v1"
}

Rules for storyboard generation:
- 3-6 frames per exercise
- All content must be clinically accurate and evidence-based
- Follow Millis & Levine biomechanical principles
- Include safety notes for every frame
- Client script uses layman terms; clinician script uses medical terminology`;

// ─── Tool Definitions ───
const AI_TOOLS_ANTHROPIC = [
  {
    name: 'search_exercises',
    description: 'Search the K9 Rehab Pro exercise library by keyword, category, phase, indication, or difficulty. Returns matching exercises with codes and basic info.',
    input_schema: {
      type: 'object',
      properties: {
        keyword: { type: 'string', description: 'Search term to match against exercise names and descriptions' },
        category: { type: 'string', description: 'Filter by exercise category (e.g., Passive Therapy, Strengthening, Aquatic Therapy)' },
        difficulty: { type: 'string', enum: ['Easy', 'Moderate', 'Advanced'], description: 'Filter by difficulty level' }
      }
    }
  },
  {
    name: 'get_exercise_details',
    description: 'Get full clinical details for a specific exercise by its code. Returns equipment, steps, contraindications, progression rules, evidence base, etc.',
    input_schema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Exercise code (e.g., PROM_STIFLE, SIT_STAND, CAVALETTI)' }
      },
      required: ['code']
    }
  },
  {
    name: 'get_storyboard',
    description: 'Get or generate a 14-point clinical storyboard for an exercise. Returns frame-by-frame breakdown with clinical overlays and scripts.',
    input_schema: {
      type: 'object',
      properties: {
        exercise_code: { type: 'string', description: 'Exercise code to get/generate storyboard for' }
      },
      required: ['exercise_code']
    }
  },
  {
    name: 'validate_intake',
    description: 'Validate patient intake form data and check for red flags, contraindications, and missing required fields.',
    input_schema: {
      type: 'object',
      properties: {
        diagnosis: { type: 'string', description: 'Primary diagnosis code' },
        affected_region: { type: 'string', description: 'Affected body region' },
        patient_name: { type: 'string', description: 'Dog name' },
        pain_level: { type: 'number', description: 'Pain score 0-10' },
        treatment_approach: { type: 'string', description: 'post_op, non_surgical, or conservative_first' },
        contraindications: { type: 'string', description: 'Known contraindications' }
      },
      required: ['diagnosis']
    }
  },
  {
    name: 'get_conditions',
    description: 'Get all supported veterinary conditions/diagnoses with their categories, severity levels, and typical recovery timelines.',
    input_schema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'get_patient_data',
    description: 'Retrieve patient information and their associated protocols from the database.',
    input_schema: {
      type: 'object',
      properties: {
        patient_id: { type: 'number', description: 'Patient database ID' }
      },
      required: ['patient_id']
    }
  },
  {
    name: 'generate_protocol',
    description: 'Generate a rehabilitation protocol using the rule-based clinical engine for a specific patient configuration.',
    input_schema: {
      type: 'object',
      properties: {
        diagnosis: { type: 'string', description: 'Primary diagnosis code' },
        affected_region: { type: 'string', description: 'Affected body region' },
        patient_name: { type: 'string', description: 'Dog name' },
        total_weeks: { type: 'number', description: 'Protocol duration in weeks (4, 6, 8, or 12)' },
        pain_level: { type: 'number', description: 'Current pain score 0-10' },
        treatment_approach: { type: 'string', description: 'post_op, non_surgical, or conservative_first' },
        contraindications: { type: 'string', description: 'Known contraindications' }
      },
      required: ['diagnosis', 'patient_name']
    }
  }
];

// Convert Anthropic tool format to OpenAI function format
function getToolsForOpenAI() {
  return AI_TOOLS_ANTHROPIC.map(tool => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.input_schema
    }
  }));
}

// ─── Assemble Full System Prompt ───
function buildSystemPrompt(options = {}) {
  const parts = [IDENTITY_PROMPT];

  // Always include exercise index
  parts.push(buildExerciseIndex());

  // Include protocol definitions if context is protocol-related
  if (options.includeProtocols !== false) {
    parts.push(buildProtocolContext());
  }

  // Include conditions if available
  if (options.conditions) {
    parts.push(buildConditionsContext(options.conditions));
  }

  // Include patient context if provided
  if (options.patient) {
    parts.push(buildPatientContext(options.patient, options.protocols));
  }

  // Include storyboard template if storyboard context
  if (options.includeStoryboard) {
    parts.push(STORYBOARD_TEMPLATE_PROMPT);
  }

  return parts.join('\n\n---\n\n');
}

module.exports = {
  IDENTITY_PROMPT,
  STORYBOARD_TEMPLATE_PROMPT,
  AI_TOOLS_ANTHROPIC,
  buildSystemPrompt,
  buildExerciseIndex,
  buildProtocolContext,
  buildConditionsContext,
  buildPatientContext,
  getToolsForOpenAI
};
