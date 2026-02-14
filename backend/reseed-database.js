// ============================================================================
// RE-SEED DATABASE WITH COMPLETE EXERCISE DETAILS
// Using sqlite3 (not better-sqlite3)
// ============================================================================

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to database
const db = new sqlite3.Database(path.join(__dirname, 'k9_rehab_pro.db'), (err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database');
});

// Load complete exercise database
const ALL_EXERCISES = require('./all-exercises');

console.log('\n🔥 RE-SEEDING DATABASE WITH COMPLETE EXERCISES...');
console.log(`📚 Loading ${ALL_EXERCISES.length} exercises...`);

// First, let's check a sample to see what we have
const sampleExercise = ALL_EXERCISES[0];
console.log('\n📋 SAMPLE EXERCISE CHECK:');
console.log('Code:', sampleExercise.code);
console.log('Steps array length:', sampleExercise.steps ? sampleExercise.steps.length : 0);
console.log('First 3 steps:', sampleExercise.steps.slice(0, 3));

// Delete existing exercises (fresh start)
console.log('\n🗑️  Clearing existing exercises...');

db.serialize(() => {
  db.run('DELETE FROM exercises', (err) => {
    if (err) {
      console.error('Error clearing exercises:', err.message);
      return;
    }
    console.log('✅ Cleared old exercises');
    
    // Insert all exercises with COMPLETE data
    const stmt = db.prepare(`
      INSERT INTO exercises (
        code, name, category, description, equipment, setup, 
        steps, good_form, common_mistakes, red_flags, 
        progression, contraindications, difficulty_level
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    let seededCount = 0;
    let errorCount = 0;
    
    ALL_EXERCISES.forEach((ex, index) => {
      try {
        // Verify steps exist
        if (!ex.steps || ex.steps.length === 0) {
          console.error(`❌ Exercise ${ex.code} has no steps!`);
          errorCount++;
          return;
        }
        
        stmt.run(
          ex.code,
          ex.name,
          ex.category,
          ex.description || '',
          JSON.stringify(ex.equipment || []),
          ex.setup || '',
          JSON.stringify(ex.steps),  // COMPLETE STEPS
          JSON.stringify(ex.good_form || []),
          JSON.stringify(ex.common_mistakes || []),
          JSON.stringify(ex.red_flags || []),
          ex.progression || '',
          ex.contraindications || '',
          ex.difficulty_level || 'Moderate'
        );
        seededCount++;
        
        if (index === 0) {
          console.log(`\n✅ FIRST EXERCISE INSERTED:`);
          console.log(`   Code: ${ex.code}`);
          console.log(`   Steps count: ${ex.steps.length}`);
        }
      } catch (err) {
        console.error(`❌ Error seeding exercise ${ex.code}:`, err.message);
        errorCount++;
      }
    });
    
    stmt.finalize((err) => {
      if (err) {
        console.error('Error finalizing statement:', err.message);
        return;
      }
      
      console.log(`\n✅ SEEDING COMPLETE!`);
      console.log(`   Successfully seeded: ${seededCount} exercises`);
      console.log(`   Errors: ${errorCount}`);
      
      // Verify the data in database
      console.log('\n🔍 VERIFYING DATABASE CONTENT...');
      
      db.get('SELECT COUNT(*) as count FROM exercises', (err, row) => {
        if (err) {
          console.error('Error counting exercises:', err.message);
          return;
        }
        console.log(`✅ Total exercises in database: ${row.count}`);
        
        // Check sample exercise
        db.get('SELECT * FROM exercises WHERE code = ?', ['PROM_STIFLE'], (err, ex) => {
          if (err) {
            console.error('Error fetching sample:', err.message);
            return;
          }
          if (ex) {
            const stepsFromDb = JSON.parse(ex.steps);
            console.log(`\n✅ SAMPLE VERIFICATION (PROM_STIFLE):`);
            console.log(`   Steps in database: ${stepsFromDb.length}`);
            console.log(`   First step: ${stepsFromDb[0]}`);
            console.log(`   Last step: ${stepsFromDb[stepsFromDb.length - 1]}`);
          }
          
          // Check for any exercises with placeholder text
          db.all(`
            SELECT code, name, steps 
            FROM exercises 
            WHERE steps LIKE '%will be provided%' 
               OR steps LIKE '%TBD%'
               OR steps LIKE '%placeholder%'
          `, (err, placeholders) => {
            if (err) {
              console.error('Error checking placeholders:', err.message);
            } else if (placeholders && placeholders.length > 0) {
              console.log(`\n⚠️  WARNING: Found ${placeholders.length} exercises with placeholder text!`);
              placeholders.forEach(ex => {
                console.log(`   - ${ex.code}: ${ex.name}`);
              });
            } else {
              console.log('\n✅ NO PLACEHOLDERS FOUND - ALL EXERCISES HAVE COMPLETE INSTRUCTIONS!');
            }
            
            // Close database
            db.close((err) => {
              if (err) {
                console.error('Error closing database:', err.message);
              } else {
                console.log('\n🎉 DATABASE UPDATE COMPLETE!\n');
              }
            });
          });
        });
      });
    });
  });
});
