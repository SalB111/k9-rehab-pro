// ============================================================================
// CREATE EXERCISES TABLE AND SEED WITH COMPLETE DATA
// ============================================================================

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the CORRECT database (database.db, NOT k9_rehab_pro.db)
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database.db');
});

// Load complete exercise database
const ALL_EXERCISES = require('./all-exercises');

console.log('\n🔥 CREATING EXERCISES TABLE AND SEEDING COMPLETE DATA...');
console.log(`📚 Loading ${ALL_EXERCISES.length} exercises...`);

// First, let's check a sample to see what we have
const sampleExercise = ALL_EXERCISES[0];
console.log('\n📋 SAMPLE EXERCISE CHECK:');
console.log('Code:', sampleExercise.code);
console.log('Steps array length:', sampleExercise.steps ? sampleExercise.steps.length : 0);
console.log('First 3 steps:');
sampleExercise.steps.slice(0, 3).forEach((step, i) => {
  console.log(`   ${i + 1}. ${step}`);
});

db.serialize(() => {
  
  // Drop existing table if it exists
  db.run('DROP TABLE IF EXISTS exercises', (err) => {
    if (err) {
      console.error('Error dropping table:', err.message);
      return;
    }
    console.log('\n🗑️  Dropped old exercises table (if existed)');
    
    // Create exercises table with COMPLETE schema
    db.run(`
      CREATE TABLE exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        equipment TEXT,
        setup TEXT,
        steps TEXT,
        good_form TEXT,
        common_mistakes TEXT,
        red_flags TEXT,
        progression TEXT,
        contraindications TEXT,
        difficulty_level TEXT DEFAULT 'Moderate',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('❌ Error creating exercises table:', err.message);
        process.exit(1);
      }
      console.log('✅ Created exercises table');
      
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
      
      console.log('\n📥 INSERTING EXERCISES...');
      
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
          
          // Show progress every 10 exercises
          if ((index + 1) % 10 === 0) {
            console.log(`   ✓ Inserted ${index + 1} exercises...`);
          }
        } catch (err) {
          console.error(`❌ Error seeding exercise ${ex.code}:`, err.message);
          errorCount++;
        }
      });
      
      stmt.finalize((err) => {
        if (err) {
          console.error('❌ Error finalizing statement:', err.message);
          process.exit(1);
        }
        
        console.log(`\n✅ SEEDING COMPLETE!`);
        console.log(`   Successfully seeded: ${seededCount} exercises`);
        console.log(`   Errors: ${errorCount}`);
        
        // Verify the data in database
        console.log('\n🔍 VERIFYING DATABASE CONTENT...');
        
        db.get('SELECT COUNT(*) as count FROM exercises', (err, row) => {
          if (err) {
            console.error('❌ Error counting exercises:', err.message);
            return;
          }
          console.log(`✅ Total exercises in database: ${row.count}`);
          
          // Check sample exercise - PROM_STIFLE
          db.get('SELECT * FROM exercises WHERE code = ?', ['PROM_STIFLE'], (err, ex) => {
            if (err) {
              console.error('❌ Error fetching sample:', err.message);
              return;
            }
            if (ex) {
              const stepsFromDb = JSON.parse(ex.steps);
              console.log(`\n✅ SAMPLE VERIFICATION (PROM_STIFLE):`);
              console.log(`   Name: ${ex.name}`);
              console.log(`   Category: ${ex.category}`);
              console.log(`   Steps in database: ${stepsFromDb.length}`);
              console.log(`   First step: "${stepsFromDb[0]}"`);
              console.log(`   Last step: "${stepsFromDb[stepsFromDb.length - 1]}"`);
            } else {
              console.error('❌ Could not find PROM_STIFLE exercise!');
            }
            
            // Check for any exercises with placeholder text
            db.all(`
              SELECT code, name
              FROM exercises 
              WHERE steps LIKE '%will be provided%' 
                 OR steps LIKE '%TBD%'
                 OR steps LIKE '%placeholder%'
            `, (err, placeholders) => {
              if (err) {
                console.error('❌ Error checking placeholders:', err.message);
              } else if (placeholders && placeholders.length > 0) {
                console.log(`\n⚠️  WARNING: Found ${placeholders.length} exercises with placeholder text!`);
                placeholders.forEach(ex => {
                  console.log(`   - ${ex.code}: ${ex.name}`);
                });
              } else {
                console.log('\n🎉 NO PLACEHOLDERS FOUND!');
                console.log('✅ ALL EXERCISES HAVE COMPLETE VETERINARY-ACCURATE INSTRUCTIONS!');
              }
              
              // List all categories
              db.all('SELECT DISTINCT category FROM exercises ORDER BY category', (err, categories) => {
                if (!err && categories) {
                  console.log('\n📚 EXERCISE CATEGORIES:');
                  categories.forEach(cat => {
                    db.get(`SELECT COUNT(*) as count FROM exercises WHERE category = ?`, [cat.category], (err, row) => {
                      if (row) {
                        console.log(`   - ${cat.category}: ${row.count} exercises`);
                      }
                    });
                  });
                }
                
                // Close database
                setTimeout(() => {
                  db.close((err) => {
                    if (err) {
                      console.error('❌ Error closing database:', err.message);
                    } else {
                      console.log('\n🎉 DATABASE SETUP COMPLETE!');
                      console.log('🚀 You can now restart the server and generate protocols!\n');
                    }
                  });
                }, 1000);
              });
            });
          });
        });
      });
    });
  });
});
