// ============================================================================
// EXERCISE DATABASE SEEDER
// Seeds MongoDB with 190+ vet-approved rehabilitation exercises
// ============================================================================

const mongoose = require('mongoose');
const { ALL_EXERCISES, EXERCISE_STATS, validateAllExercises } = require('./all-exercises');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/k9-rehab-pro';

// Exercise Schema
const exerciseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  category: { type: String, required: true, index: true },
  description: { type: String, required: true },
  equipment: [String],
  setup: String,
  steps: [String],
  good_form: [String],
  common_mistakes: [String],
  red_flags: [String],
  progression: String,
  contraindications: String,
  difficulty_level: { type: String, enum: ['Easy', 'Moderate', 'Advanced'], index: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const Exercise = mongoose.model('Exercise', exerciseSchema);

// ============================================================================
// SEED FUNCTION
// ============================================================================
async function seedExercises() {
  try {
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║          K9-REHAB-PRO EXERCISE DATABASE SEEDER                 ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log('');
    
    // Validate exercises before seeding
    console.log('🔍 Validating exercise database...');
    const validation = validateAllExercises();
    
    if (!validation.valid) {
      console.error('❌ Validation failed!');
      if (validation.errors.length > 0) {
        console.error('Errors found:');
        validation.errors.forEach(err => {
          console.error(`  Exercise #${err.index} (${err.code}):`, err.errors);
        });
      }
      if (validation.duplicateCodes.length > 0) {
        console.error('Duplicate codes found:', validation.duplicateCodes);
      }
      process.exit(1);
    }
    
    console.log(`✅ Validation passed! ${validation.totalExercises} exercises verified`);
    console.log('');
    
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    console.log('');
    
    // Clear existing exercises
    console.log('🗑️  Clearing existing exercises...');
    const deleteResult = await Exercise.deleteMany({});
    console.log(`✅ Cleared ${deleteResult.deletedCount} existing exercises`);
    console.log('');
    
    // Insert all exercises
    console.log('📥 Inserting exercises...');
    const insertResult = await Exercise.insertMany(ALL_EXERCISES);
    console.log(`✅ Successfully inserted ${insertResult.length} exercises`);
    console.log('');
    
    // Display statistics
    console.log('📊 Exercise Database Statistics:');
    console.log('════════════════════════════════════════════════════════════════');
    console.log(`   Total Exercises: ${EXERCISE_STATS.total}`);
    console.log('');
    console.log('   By Difficulty:');
    console.log(`      Easy: ${EXERCISE_STATS.by_difficulty.easy}`);
    console.log(`      Moderate: ${EXERCISE_STATS.by_difficulty.moderate}`);
    console.log(`      Advanced: ${EXERCISE_STATS.by_difficulty.advanced}`);
    console.log('');
    console.log('   By Category:');
    Object.entries(EXERCISE_STATS.by_category)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`      ${category}: ${count}`);
      });
    console.log('');
    console.log('════════════════════════════════════════════════════════════════');
    console.log('✨ Database seeded successfully!');
    console.log('');
    
    // Verify data
    console.log('🔍 Verifying seeded data...');
    const verifyCount = await Exercise.countDocuments();
    const categories = await Exercise.distinct('category');
    
    console.log(`✅ Verified ${verifyCount} exercises in database`);
    console.log(`✅ Found ${categories.length} unique categories`);
    console.log('');
    
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║                    SEEDING COMPLETE! ✨                        ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    
  } catch (error) {
    console.error('');
    console.error('╔════════════════════════════════════════════════════════════════╗');
    console.error('║                      ERROR OCCURRED ❌                         ║');
    console.error('╚════════════════════════════════════════════════════════════════╝');
    console.error('');
    console.error('Error details:', error.message);
    console.error('');
    if (error.stack) {
      console.error('Stack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('');
    console.log('🔌 Database connection closed');
  }
}

// ============================================================================
// RUN SEEDER
// ============================================================================
if (require.main === module) {
  seedExercises()
    .then(() => {
      console.log('');
      console.log('✅ Seeding process completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('');
      console.error('❌ Seeding process failed:', error.message);
      process.exit(1);
    });
}

module.exports = { seedExercises, Exercise };