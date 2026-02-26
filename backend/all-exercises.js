// ============================================================================
// ALL EXERCISES - MASTER COMPILATION
// K9-REHAB-PRO - Complete Exercise Database
// ACVSMR-Aligned | Evidence-Based | Zero Duplicates
// ============================================================================
// Following Dr. Denis Millis & Dr. Darryl Levine Standards
// Certified Canine Rehabilitation Practitioner (CCRP) Guidelines
// Evidence-Based Veterinary Physical Rehabilitation
// ============================================================================

const EXERCISES_PART1 = require('./exercises-part1');
const EXERCISES_PART2 = require('./exercises-part2');
const EXERCISES_PART3 = require('./exercises-part3');
const EXERCISES_PART4 = require('./exercises-part4');
const EXERCISES_PART5 = require('./exercises-part5');
const EXERCISES_PART6 = require('./exercises-part6');
const EXERCISES_PART7 = require('./exercises-part7');
const EXERCISES_PART8 = require('./exercises-part8');
const EXERCISES_PART9 = require('./exercises-part9');
const EXERCISES_PART10 = require('./exercises-part10');

// ============================================================================
// MEDICAL-GRADE ENHANCEMENT SYSTEM
// ============================================================================
const { enhanceAllExercises } = require('./exercise-enhancer');

// ============================================================================
// SEMANTIC DUPLICATE REMOVAL
// These codes duplicate exercises that already exist under canonical codes.
// Canonical code (USED in protocols) → Removed duplicate
// ============================================================================
const DUPLICATE_CODES = new Set([
  'TENS',              // → use TENS_THERAPY
  'LASER_THERAPY',     // → use LASER_IV
  'ESTIM',             // → use NMES_QUAD
  'PULSED_EMF',        // → use PEMF_THERAPY
  'THERAPEUTIC_US',    // → use US_PULSED
  'MYOFASCIAL',        // → use MYOFASC_ILIO / MYOFASC_BF
  'ASSISI_LOOP',       // → use PEMF_THERAPY
  'WADING_WALK',       // → use WATER_WALKING
  'POOL_SWIM_HYDRO',   // → use POOL_SWIM
  'COLD_THERAPY_GERI', // → use COLD_THERAPY
  'HEAT_THERAPY_GERI', // → use HEAT_THERAPY
  'MASSAGE_SENIOR',    // → use MASSAGE_THERA
  'SIT_STAND_SENIOR',  // → use SIT_STAND
  'GENTLE_PROM',       // → use PROM_STIFLE
  'SENIOR_WALK',       // → use SLOW_WALK
  'NEURO_PROM',        // → use PROM_STIFLE
  'WHEEL_BARREL',      // → use WHEELBARROW (spelling fix)
]);

// ============================================================================
// COMBINE ALL EXERCISE PARTS (deduplicated)
// ============================================================================
const ALL_EXERCISES_RAW = [
  ...EXERCISES_PART1,  //  8 exercises - Basic Rehabilitation Exercises
  ...EXERCISES_PART2,  // 10 exercises - Advanced Mobility & Strengthening
  ...EXERCISES_PART3,  // 12 exercises - Balance, Coordination & Proprioception
  ...EXERCISES_PART4,  // 10 exercises - Pain Management & Manual Therapy
  ...EXERCISES_PART5,  // 10 exercises - Cardiovascular & Endurance Training
  ...EXERCISES_PART6,  // 25 exercises - Home Care & Maintenance Programs
  ...EXERCISES_PART7,  // 60 exercises - Advanced Hydrotherapy, Geriatric, Neuro, Post-Surgical
  ...EXERCISES_PART8,  // 35 exercises - Sport Conditioning & Complementary Therapies
  ...EXERCISES_PART9,  // 40 exercises - Pediatric, Palliative, Breed-Specific
  ...EXERCISES_PART10  // 30 exercises - Athletic Foundations: General Rehab
];

const ALL_EXERCISES_BASE = ALL_EXERCISES_RAW.filter(ex => !DUPLICATE_CODES.has(ex.code));

// ============================================================================
// APPLY MEDICAL-GRADE ENHANCEMENTS
// ============================================================================
console.log(`📚 Enhancing ${ALL_EXERCISES_BASE.length} exercises with clinical metadata...`);
const ALL_EXERCISES = enhanceAllExercises(ALL_EXERCISES_BASE);
console.log(`✅ Medical-grade exercise library ready: ${ALL_EXERCISES.length} exercises with full clinical taxonomy`);

// ============================================================================
// EXERCISE STATISTICS
// ============================================================================
const EXERCISE_STATS = {
  total: ALL_EXERCISES.length,
  by_difficulty: {
    easy: ALL_EXERCISES.filter(ex => ex.difficulty_level === 'Easy').length,
    moderate: ALL_EXERCISES.filter(ex => ex.difficulty_level === 'Moderate').length,
    advanced: ALL_EXERCISES.filter(ex => ex.difficulty_level === 'Advanced').length
  },
  by_category: {}
};

// Count exercises by category
ALL_EXERCISES.forEach(exercise => {
  const category = exercise.category;
  if (!EXERCISE_STATS.by_category[category]) {
    EXERCISE_STATS.by_category[category] = 0;
  }
  EXERCISE_STATS.by_category[category]++;
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get exercise by code
 */
function getExerciseByCode(code) {
  return ALL_EXERCISES.find(ex => ex.code === code);
}

/**
 * Get exercises by category
 */
function getExercisesByCategory(category) {
  return ALL_EXERCISES.filter(ex => ex.category === category);
}

/**
 * Get exercises by difficulty level
 */
function getExercisesByDifficulty(difficulty) {
  return ALL_EXERCISES.filter(ex => ex.difficulty_level === difficulty);
}

/**
 * Search exercises by name or description
 */
function searchExercises(searchTerm) {
  const term = searchTerm.toLowerCase();
  return ALL_EXERCISES.filter(ex => 
    ex.name.toLowerCase().includes(term) ||
    ex.description.toLowerCase().includes(term) ||
    ex.code.toLowerCase().includes(term)
  );
}

/**
 * Get all unique categories
 */
function getAllCategories() {
  const categories = new Set(ALL_EXERCISES.map(ex => ex.category));
  return Array.from(categories).sort();
}

/**
 * Get all unique equipment items
 */
function getAllEquipment() {
  const equipment = new Set();
  ALL_EXERCISES.forEach(ex => {
    ex.equipment.forEach(item => equipment.add(item));
  });
  return Array.from(equipment).sort();
}

/**
 * Validate exercise structure
 */
function validateExercise(exercise) {
  const requiredFields = [
    'code', 'name', 'category', 'description', 'equipment',
    'setup', 'steps', 'good_form', 'common_mistakes',
    'red_flags', 'progression', 'contraindications', 'difficulty_level'
  ];
  
  const missingFields = requiredFields.filter(field => !exercise[field]);
  
  if (missingFields.length > 0) {
    return {
      valid: false,
      errors: [`Missing required fields: ${missingFields.join(', ')}`]
    };
  }
  
  return { valid: true, errors: [] };
}

/**
 * Validate all exercises
 */
function validateAllExercises() {
  const errors = [];
  const duplicateCodes = [];
  const codes = new Set();
  
  ALL_EXERCISES.forEach((exercise, index) => {
    // Check for duplicate codes
    if (codes.has(exercise.code)) {
      duplicateCodes.push(exercise.code);
    }
    codes.add(exercise.code);
    
    // Validate structure
    const validation = validateExercise(exercise);
    if (!validation.valid) {
      errors.push({
        index,
        code: exercise.code,
        errors: validation.errors
      });
    }
  });
  
  return {
    valid: errors.length === 0 && duplicateCodes.length === 0,
    totalExercises: ALL_EXERCISES.length,
    errors,
    duplicateCodes
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  ALL_EXERCISES,
  EXERCISE_STATS,
  getExerciseByCode,
  getExercisesByCategory,
  getExercisesByDifficulty,
  searchExercises,
  getAllCategories,
  getAllEquipment,
  validateExercise,
  validateAllExercises
};

// ============================================================================
// LOG INITIALIZATION
// ============================================================================
console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║                K9-REHAB-PRO EXERCISE DATABASE                  ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log(`📚 Total Exercises: ${EXERCISE_STATS.total}`);
console.log(`✅ Easy: ${EXERCISE_STATS.by_difficulty.easy}`);
console.log(`⚡ Moderate: ${EXERCISE_STATS.by_difficulty.moderate}`);
console.log(`🔥 Advanced: ${EXERCISE_STATS.by_difficulty.advanced}`);
console.log('');
console.log('📋 Categories:');
Object.entries(EXERCISE_STATS.by_category)
  .sort((a, b) => b[1] - a[1])
  .forEach(([category, count]) => {
    console.log(`   ${category}: ${count}`);
  });
console.log('');
console.log('✨ Database loaded successfully!');
console.log('════════════════════════════════════════════════════════════════');