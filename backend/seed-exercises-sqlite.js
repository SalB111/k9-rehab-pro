// ============================================================================
// EXERCISE DATABASE SEEDER - SQLITE VERSION
// Seeds SQLite with 170 vet-approved rehabilitation exercises
// ============================================================================

const sqlite3 = require('sqlite3').verbose();
const { ALL_EXERCISES, EXERCISE_STATS, validateAllExercises } = require('./all-exercises');

// Database connection
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  }
});

// ============================================================================
// SEED FUNCTION
// ============================================================================
async function seedExercises() {
  return new Promise((resolve, reject) => {
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
      reject(new Error('Validation failed'));
      return;
    }
    
    console.log(`✅ Validation passed! ${validation.totalExercises} exercises verified`);
    console.log('');
    
    db.serialize(() => {
      // Clear existing exercises
      console.log('🗑️  Clearing existing exercises...');
      db.run('DELETE FROM exercises', function(err) {
        if (err) {
          console.error('❌ Error clearing exercises:', err);
          reject(err);
          return;
        }
        console.log(`✅ Cleared ${this.changes} existing exercises`);
        console.log('');
        
        // Prepare insert statement
        console.log('📥 Inserting exercises...');
        const stmt = db.prepare(`
          INSERT INTO exercises (
            code, name, category, description, equipment, setup,
            steps, good_form, common_mistakes, red_flags,
            progression, contraindications, difficulty_level
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        let inserted = 0;
        let errors = 0;
        
        ALL_EXERCISES.forEach((exercise, index) => {
          stmt.run(
            exercise.code,
            exercise.name,
            exercise.category,
            exercise.description,
            JSON.stringify(exercise.equipment),
            exercise.setup,
            JSON.stringify(exercise.steps),
            JSON.stringify(exercise.good_form),
            JSON.stringify(exercise.common_mistakes),
            JSON.stringify(exercise.red_flags),
            exercise.progression,
            exercise.contraindications,
            exercise.difficulty_level,
            function(err) {
              if (err) {
                console.error(`❌ Error inserting exercise ${exercise.code}:`, err.message);
                errors++;
              } else {
                inserted++;
              }
              
              // Check if all done
              if (inserted + errors === ALL_EXERCISES.length) {
                stmt.finalize(() => {
                  console.log(`✅ Successfully inserted ${inserted} exercises`);
                  if (errors > 0) {
                    console.log(`⚠️  ${errors} errors occurred`);
                  }
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
                  db.get('SELECT COUNT(*) as count FROM exercises', (err, row) => {
                    if (err) {
                      console.error('❌ Error verifying:', err);
                      reject(err);
                      return;
                    }
                    console.log(`✅ Verified ${row.count} exercises in database`);
                    console.log('');
                    
                    db.all('SELECT DISTINCT category FROM exercises ORDER BY category', (err, rows) => {
                      if (err) {
                        console.error('❌ Error getting categories:', err);
                        reject(err);
                        return;
                      }
                      console.log(`✅ Found ${rows.length} unique categories`);
                      console.log('');
                      
                      console.log('╔════════════════════════════════════════════════════════════════╗');
                      console.log('║                    SEEDING COMPLETE! ✨                        ║');
                      console.log('╚════════════════════════════════════════════════════════════════╝');
                      
                      resolve({ inserted, errors });
                    });
                  });
                });
              }
            }
          );
        });
      });
    });
  });
}

// ============================================================================
// RUN SEEDER
// ============================================================================
if (require.main === module) {
  seedExercises()
    .then((result) => {
      console.log('');
      console.log(`✅ Seeding process completed successfully`);
      console.log(`   Inserted: ${result.inserted} exercises`);
      if (result.errors > 0) {
        console.log(`   Errors: ${result.errors}`);
      }
      db.close(() => {
        console.log('🔌 Database connection closed');
        process.exit(result.errors > 0 ? 1 : 0);
      });
    })
    .catch(error => {
      console.error('');
      console.error('❌ Seeding process failed:', error.message);
      db.close(() => {
        console.log('🔌 Database connection closed');
        process.exit(1);
      });
    });
}

module.exports = { seedExercises };
