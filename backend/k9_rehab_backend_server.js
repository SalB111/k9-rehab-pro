// ============================================================================
// K9-REHAB-PRO BACKEND API SERVER
// Complete Exercise Integration - 190 VET-APPROVED EXERCISES
// ============================================================================

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const { ALL_EXERCISES, EXERCISE_STATS, getExerciseByCode, getAllCategories } = require('./all-exercises');

const app = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// ============================================================================
// EXERCISE LIBRARY - CONVERT FROM DETAILED FORMAT
// ============================================================================
// Convert our detailed 190-exercise database to backend format
const EXERCISE_LIBRARY = {};

ALL_EXERCISES.forEach((exercise, index) => {
  const exId = `EX-${String(index + 1).padStart(3, '0')}`;
  
  // Determine stage based on difficulty and category
  let stage = 'CHRONIC';
  if (exercise.category.includes('Geriatric') || exercise.category.includes('Acute')) {
    stage = 'ACUTE';
  } else if (exercise.difficulty_level === 'Easy') {
    stage = 'ACUTE';
  } else if (exercise.difficulty_level === 'Moderate') {
    stage = 'SUBACUTE';
  } else if (exercise.difficulty_level === 'Advanced') {
    stage = 'CHRONIC';
  }
  
  // Convert contraindications to array
  const contraindications = [];
  if (exercise.contraindications) {
    if (exercise.contraindications.includes('pain') || exercise.contraindications.includes('severe')) {
      contraindications.push('SEVERE_PAIN');
    }
    if (exercise.contraindications.includes('orthopedic') || exercise.contraindications.includes('fracture')) {
      contraindications.push('ACUTE_INJURY');
    }
  }
  
  // Determine indications based on description and category
  const indications = ['ALL']; // Default to all
  if (exercise.description.includes('post-surgical') || exercise.description.includes('post-op')) {
    indications.push('POST_SURGICAL_ORTHOPEDIC');
  }
  if (exercise.category.includes('Neurological')) {
    indications.push('NEUROLOGICAL');
  }
  if (exercise.category.includes('Sport')) {
    indications.push('SPORT_CONDITIONING');
  }
  
  EXERCISE_LIBRARY[exId] = {
    code: exercise.code,
    name: exercise.name,
    category: exercise.category,
    description: exercise.description,
    stage: stage,
    difficulty: exercise.difficulty_level,
    indications: indications,
    contraindications: contraindications,
    equipment: exercise.equipment,
    setup: exercise.setup,
    steps: exercise.steps,
    good_form: exercise.good_form,
    common_mistakes: exercise.common_mistakes,
    red_flags: exercise.red_flags,
    progression: exercise.progression,
    dosage: {
      ACUTE: generateDosage(exercise, 'ACUTE'),
      SUBACUTE: generateDosage(exercise, 'SUBACUTE'),
      CHRONIC: generateDosage(exercise, 'CHRONIC'),
      RETURN_TO_FUNCTION: generateDosage(exercise, 'RETURN_TO_FUNCTION')
    }
  };
});

// Helper function to generate stage-appropriate dosage
function generateDosage(exercise, stage) {
  const difficulty = exercise.difficulty_level;
  
  // Generate dosage based on stage and difficulty
  const dosages = {
    ACUTE: {
      Easy: '2-3 reps × 2 sets, 2-3× daily',
      Moderate: '2-5 reps × 1-2 sets, 1-2× daily',
      Advanced: 'Consult rehabilitation specialist'
    },
    SUBACUTE: {
      Easy: '5-10 reps × 2-3 sets, 2× daily',
      Moderate: '5-10 reps × 2-3 sets, 1-2× daily',
      Advanced: '3-5 reps × 2 sets, 1× daily'
    },
    CHRONIC: {
      Easy: '10-15 reps × 2-3 sets, daily',
      Moderate: '8-12 reps × 2-3 sets, 3-5× weekly',
      Advanced: '5-10 reps × 2-3 sets, 3-5× weekly'
    },
    RETURN_TO_FUNCTION: {
      Easy: '15-20 reps × 3 sets, as needed',
      Moderate: '10-15 reps × 3-4 sets, 3-5× weekly',
      Advanced: '8-12 reps × 3-4 sets, 4-6× weekly'
    }
  };
  
  return dosages[stage][difficulty] || 'As tolerated under supervision';
}

// ============================================================================
// CONDITIONS DATABASE
// ============================================================================
const CONDITIONS = {
  'TPLO': {
    name: 'Tibial Plateau Leveling Osteotomy',
    category: 'POST_SURGICAL_ORTHOPEDIC',
    stageMapping: {
      ACUTE: { daysMin: 0, daysMax: 10 },
      SUBACUTE: { daysMin: 11, daysMax: 42 },
      CHRONIC: { daysMin: 43, daysMax: 180 },
      RETURN_TO_FUNCTION: { daysMin: 181, daysMax: 999 }
    }
  },
  'TTA': {
    name: 'Tibial Tuberosity Advancement',
    category: 'POST_SURGICAL_ORTHOPEDIC',
    stageMapping: {
      ACUTE: { daysMin: 0, daysMax: 10 },
      SUBACUTE: { daysMin: 11, daysMax: 42 },
      CHRONIC: { daysMin: 43, daysMax: 180 },
      RETURN_TO_FUNCTION: { daysMin: 181, daysMax: 999 }
    }
  },
  'FHO': {
    name: 'Femoral Head Ostectomy',
    category: 'POST_SURGICAL_ORTHOPEDIC',
    stageMapping: {
      ACUTE: { daysMin: 0, daysMax: 14 },
      SUBACUTE: { daysMin: 15, daysMax: 56 },
      CHRONIC: { daysMin: 57, daysMax: 180 },
      RETURN_TO_FUNCTION: { daysMin: 181, daysMax: 999 }
    }
  },
  'THR': {
    name: 'Total Hip Replacement',
    category: 'POST_SURGICAL_ORTHOPEDIC',
    stageMapping: {
      ACUTE: { daysMin: 0, daysMax: 14 },
      SUBACUTE: { daysMin: 15, daysMax: 56 },
      CHRONIC: { daysMin: 57, daysMax: 180 },
      RETURN_TO_FUNCTION: { daysMin: 181, daysMax: 999 }
    }
  },
  'CCL_TEAR': {
    name: 'Cranial Cruciate Ligament Tear',
    category: 'NON_SURGICAL_ORTHOPEDIC'
  },
  'HIP_DYSPLASIA': {
    name: 'Hip Dysplasia',
    category: 'NON_SURGICAL_ORTHOPEDIC'
  },
  'IVDD': {
    name: 'Intervertebral Disc Disease',
    category: 'NEUROLOGIC'
  },
  'OA_GENERAL': {
    name: 'Osteoarthritis - General',
    category: 'NON_SURGICAL_ORTHOPEDIC'
  },
  'ELBOW_DYSPLASIA': {
    name: 'Elbow Dysplasia',
    category: 'NON_SURGICAL_ORTHOPEDIC'
  },
  'PATELLAR_LUXATION': {
    name: 'Patellar Luxation',
    category: 'POST_SURGICAL_ORTHOPEDIC'
  }
};

// ============================================================================
// PROTOCOL GENERATION LOGIC
// ============================================================================

function applySafetyFilters(intake) {
  const excluded = [];
  const warnings = [];
  
  // Critical pain level
  if (intake.painWithActivity >= 8) {
    warnings.push('CRITICAL: Pain level ≥8/10 - Immediate veterinary assessment recommended');
    excluded.push('WEIGHT_BEARING', 'HIGH_IMPACT', 'ADVANCED');
  }
  
  // High pain level
  if (intake.painWithActivity >= 6) {
    warnings.push('WARNING: Pain level ≥6/10 - Consider pain management');
    excluded.push('HIGH_IMPACT', 'ADVANCED');
  }
  
  // Mobility restrictions
  if (intake.mobilityLevel === 'NON_WEIGHT_BEARING') {
    excluded.push('WEIGHT_BEARING', 'STANDING', 'WALKING');
    warnings.push('Non-weight-bearing status - Passive exercises only');
  }
  
  // Early post-surgical
  if (intake.daysPostSurgery && intake.daysPostSurgery <= 42) {
    excluded.push('HIGH_IMPACT', 'JUMPING', 'RUNNING');
    warnings.push(`Post-surgery day ${intake.daysPostSurgery} - Restricted activities`);
  }
  
  return { excluded, warnings };
}

function determineStage(intake) {
  const condition = CONDITIONS[intake.diagnosis];
  
  // Post-surgical conditions with day-based staging
  if (condition && condition.category === 'POST_SURGICAL_ORTHOPEDIC' && intake.daysPostSurgery) {
    const days = intake.daysPostSurgery;
    const mapping = condition.stageMapping;
    
    if (days >= mapping.ACUTE.daysMin && days <= mapping.ACUTE.daysMax) return 'ACUTE';
    if (days >= mapping.SUBACUTE.daysMin && days <= mapping.SUBACUTE.daysMax) return 'SUBACUTE';
    if (days >= mapping.CHRONIC.daysMin && days <= mapping.CHRONIC.daysMax) return 'CHRONIC';
    if (days >= mapping.RETURN_TO_FUNCTION.daysMin) return 'RETURN_TO_FUNCTION';
  }
  
  // Pain-based staging for non-surgical conditions
  const pain = intake.painWithActivity || 0;
  if (pain >= 7) return 'ACUTE';
  if (pain >= 4) return 'SUBACUTE';
  
  return 'CHRONIC';
}

function selectExercises(stage, diagnosis, excluded = []) {
  const stageExercises = Object.entries(EXERCISE_LIBRARY)
    .filter(([id, ex]) => {
      // Match stage
      if (ex.stage !== stage && stage !== 'RETURN_TO_FUNCTION') return false;
      
      // Check if exercise is excluded
      if (excluded.some(exc => ex.category.includes(exc))) return false;
      
      // Check indications
      if (diagnosis && !ex.indications.includes('ALL')) {
        const condition = CONDITIONS[diagnosis];
        if (condition && !ex.indications.includes(condition.category)) {
          return false;
        }
      }
      
      return true;
    })
    .map(([id]) => id);
  
  // Select up to 15 exercises per stage, prioritizing variety
  const categories = {};
  const selected = [];
  
  for (const exId of stageExercises) {
    const ex = EXERCISE_LIBRARY[exId];
    const cat = ex.category;
    
    if (!categories[cat]) categories[cat] = 0;
    if (categories[cat] < 3 && selected.length < 15) {
      selected.push(exId);
      categories[cat]++;
    }
  }
  
  return selected;
}

function generateWeeklyProtocol(stage, exerciseIds) {
  const weeks = [];
  const totalWeeks = stage === 'ACUTE' ? 2 : stage === 'SUBACUTE' ? 6 : 8;
  
  for (let week = 1; week <= totalWeeks; week++) {
    const exercises = exerciseIds.map(exId => {
      const ex = EXERCISE_LIBRARY[exId];
      return {
        exerciseId: exId,
        code: ex.code,
        name: ex.name,
        category: ex.category,
        description: ex.description,
        dosage: ex.dosage[stage] || 'As tolerated',
        equipment: ex.equipment,
        setup: ex.setup,
        steps: ex.steps,
        good_form: ex.good_form,
        common_mistakes: ex.common_mistakes,
        red_flags: ex.red_flags,
        progression: ex.progression
      };
    });
    
    const focus = week <= 2 ? 'Pain Management & Protection' :
                  week <= 4 ? 'Range of Motion & Light Strengthening' :
                  week <= 6 ? 'Progressive Strengthening' :
                  'Return to Function & Conditioning';
    
    weeks.push({
      weekNumber: week,
      exercises,
      focus,
      precautions: stage === 'ACUTE' ? 'Strict activity restriction' :
                   stage === 'SUBACUTE' ? 'Controlled activity only' :
                   'Progressive return to normal activity'
    });
  }
  
  return weeks;
}

function generateProtocol(intake) {
  const protocolId = `K9RP-${Date.now()}-${uuidv4().slice(0, 8)}`;
  const stage = determineStage(intake);
  const { excluded, warnings } = applySafetyFilters(intake);
  const selectedExerciseIds = selectExercises(stage, intake.diagnosis, excluded);
  
  return {
    protocolId,
    clientInfo: {
      clientName: intake.clientName,
      patientName: intake.patientName,
      breed: intake.breed,
      weight: intake.weight,
      age: intake.age
    },
    clinicalInfo: {
      diagnosis: intake.diagnosis,
      diagnosisName: CONDITIONS[intake.diagnosis]?.name || intake.diagnosis,
      daysPostSurgery: intake.daysPostSurgery || null,
      painLevel: intake.painWithActivity || 0,
      mobilityLevel: intake.mobilityLevel,
      stage: stage
    },
    safetyInfo: {
      warnings,
      excludedCategories: excluded,
      vetApprovalRequired: warnings.some(w => w.includes('CRITICAL'))
    },
    protocol: {
      totalExercises: selectedExerciseIds.length,
      weeklyProtocol: generateWeeklyProtocol(stage, selectedExerciseIds)
    },
    metadata: {
      generatedDate: new Date().toISOString(),
      expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      version: '2.0',
      totalExercisesInDatabase: EXERCISE_STATS.total
    }
  };
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

// Generate rehabilitation protocol
app.post('/api/generate-protocol', (req, res) => {
  try {
    const intake = req.body;
    
    // Validation
    if (!intake.clientName || !intake.patientName || !intake.diagnosis) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['clientName', 'patientName', 'diagnosis']
      });
    }
    
    const protocol = generateProtocol(intake);
    
    res.status(200).json({
      success: true,
      protocol
    });
  } catch (error) {
    console.error('Protocol generation error:', error);
    res.status(500).json({
      error: 'Protocol generation failed',
      message: error.message
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'K9-Rehab-Pro Backend API',
    version: '2.0',
    exerciseCount: EXERCISE_STATS.total,
    timestamp: new Date().toISOString()
  });
});

// Get all exercises
app.get('/api/exercises', (req, res) => {
  const { category, difficulty, search } = req.query;
  
  let exercises = Object.entries(EXERCISE_LIBRARY);
  
  // Filter by category
  if (category) {
    exercises = exercises.filter(([_, ex]) => ex.category === category);
  }
  
  // Filter by difficulty
  if (difficulty) {
    exercises = exercises.filter(([_, ex]) => ex.difficulty === difficulty);
  }
  
  // Search by name or description
  if (search) {
    const searchLower = search.toLowerCase();
    exercises = exercises.filter(([_, ex]) =>
      ex.name.toLowerCase().includes(searchLower) ||
      ex.description.toLowerCase().includes(searchLower)
    );
  }
  
  res.json({
    total: exercises.length,
    totalInDatabase: EXERCISE_STATS.total,
    exercises: Object.fromEntries(exercises),
    stats: EXERCISE_STATS
  });
});

// Get single exercise by ID
app.get('/api/exercises/:id', (req, res) => {
  const exercise = EXERCISE_LIBRARY[req.params.id];
  
  if (!exercise) {
    return res.status(404).json({ error: 'Exercise not found' });
  }
  
  res.json({ exercise });
});

// Get all conditions
app.get('/api/conditions', (req, res) => {
  res.json({
    total: Object.keys(CONDITIONS).length,
    conditions: CONDITIONS
  });
});

// Get exercise statistics
app.get('/api/stats', (req, res) => {
  res.json({
    exerciseStats: EXERCISE_STATS,
    conditionCount: Object.keys(CONDITIONS).length,
    categories: getAllCategories()
  });
});

// ============================================================================
// START SERVER
// ============================================================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║         K9-REHAB-PRO BACKEND API SERVER v2.0                  ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log(`\n🚀 Server running on: http://localhost:${PORT}`);
  console.log('\n📊 DATABASE STATS:');
  console.log(`   Total Exercises: ${EXERCISE_STATS.total}`);
  console.log(`   Easy: ${EXERCISE_STATS.by_difficulty.easy}`);
  console.log(`   Moderate: ${EXERCISE_STATS.by_difficulty.moderate}`);
  console.log(`   Advanced: ${EXERCISE_STATS.by_difficulty.advanced}`);
  console.log(`   Conditions: ${Object.keys(CONDITIONS).length}`);
  console.log('\n📡 ENDPOINTS:');
  console.log('   POST /api/generate-protocol  - Generate rehabilitation protocol');
  console.log('   GET  /api/health              - Health check');
  console.log('   GET  /api/exercises           - Get all exercises (with filters)');
  console.log('   GET  /api/exercises/:id       - Get single exercise');
  console.log('   GET  /api/conditions          - Get all conditions');
  console.log('   GET  /api/stats               - Get database statistics');
  console.log('\n✨ All systems operational!\n');
  console.log('════════════════════════════════════════════════════════════════\n');
});

module.exports = app;
