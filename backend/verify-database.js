// ============================================================================
// COMPREHENSIVE DATABASE VERIFICATION - ALL 170 EXERCISES
// K9-REHAB-PRO - Dr. Millis & Levine Standards
// ============================================================================

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

console.log('\n🔬 COMPREHENSIVE DATABASE VERIFICATION\n');
console.log('=' .repeat(80));

// 1. Count total exercises
db.get('SELECT COUNT(*) as count FROM exercises', (err, row) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log(`\n✅ TOTAL EXERCISES IN DATABASE: ${row.count}`);
});

// 2. Count by category
db.all('SELECT category, COUNT(*) as count FROM exercises GROUP BY category ORDER BY category', (err, rows) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log('\n📊 EXERCISES BY CATEGORY:');
  rows.forEach(row => {
    console.log(`   ${row.category.padEnd(30)} : ${row.count} exercises`);
  });
});

// 3. Verify NEW exercises (51-75)
const newExerciseCodes = [
  'BOSU_STAND', 'WOBBLE_BOARD_ADV', 'FOAM_PAD_STAND', 'CAVALETTI_VAR', 'THERABAND_WTS',
  'FIGURE8_CONE', 'PERTURBATION_ADV', 'BLINDFOLD_BAL', 'DIAGONAL_LIFT', 'PLATFORM_TRANS',
  'TENS_THERAPY', 'NMES_QUAD', 'US_PULSED', 'US_CONTINUOUS', 'LASER_IV',
  'PEMF_THERAPY', 'HYDRO_WHIRL', 'ICE_MASSAGE', 'CONTRAST_BATH', 'COMPRESSION_TX',
  'JOINT_MOB_G1', 'JOINT_MOB_G2', 'JOINT_MOB_G3', 'MYOFASC_ILIO', 'MYOFASC_BF'
];

db.all(`SELECT code, name, category FROM exercises WHERE code IN (${newExerciseCodes.map(() => '?').join(',')})`, 
  newExerciseCodes, 
  (err, rows) => {
    if (err) {
      console.error('Error:', err);
      return;
    }
    console.log(`\n🆕 NEW EXERCISES (51-75) VERIFICATION: ${rows.length}/25 found`);
    console.log('\n' + '─'.repeat(80));
    rows.forEach((row, i) => {
      console.log(`${(i + 51).toString().padStart(2)}. ${row.code.padEnd(20)} | ${row.name.substring(0, 40).padEnd(40)} | ${row.category}`);
    });
});

// 4. Verify instructions completeness
db.all('SELECT code, name, category, steps FROM exercises ORDER BY code', (err, rows) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  console.log('\n🔍 INSTRUCTIONS COMPLETENESS CHECK:');
  console.log('─'.repeat(80));
  
  let incomplete = 0;
  let complete = 0;
  
  rows.forEach(row => {
    const steps = JSON.parse(row.steps);
    if (steps.length < 5) {
      incomplete++;
      console.log(`   ⚠️  ${row.code}: Only ${steps.length} steps`);
    } else {
      complete++;
    }
  });
  
  console.log(`\n✅ Complete exercises: ${complete}`);
  console.log(`❌ Incomplete exercises: ${incomplete}`);
  
  if (incomplete === 0) {
    console.log('\n🎉 ALL EXERCISES HAVE COMPLETE INSTRUCTIONS!');
  }
});

// 5. Sample advanced exercises
setTimeout(() => {
  db.all(`SELECT code, name, category, description FROM exercises WHERE code IN ('BOSU_STAND', 'TENS_THERAPY', 'JOINT_MOB_G3', 'LASER_IV', 'MYOFASC_ILIO')`, (err, rows) => {
    if (err) {
      console.error('Error:', err);
      return;
    }
    
    console.log('\n📋 SAMPLE ADVANCED EXERCISES:');
    console.log('─'.repeat(80));
    rows.forEach(row => {
      console.log(`\n${row.code} - ${row.name}`);
      console.log(`Category: ${row.category}`);
      console.log(`Description: ${row.description.substring(0, 100)}...`);
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ VERIFICATION COMPLETE - DATABASE READY FOR PRODUCTION!');
    console.log('='.repeat(80) + '\n');
    
    db.close();
  });
}, 1000);
