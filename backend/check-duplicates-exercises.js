// Check for duplicate exercises and missing evidence
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'k9_rehab_pro.db');
const db = new sqlite3.Database(DB_PATH);

console.log('🔍 Checking exercise database...\n');

// Check for duplicates by name
db.all(`
  SELECT name, COUNT(*) as count
  FROM exercises
  GROUP BY name
  HAVING count > 1
`, [], (err, rows) => {
  if (err) {
    console.error('Error checking duplicates:', err);
    return;
  }

  console.log('📋 DUPLICATE EXERCISES:');
  if (rows.length === 0) {
    console.log('✅ No duplicates found!\n');
  } else {
    console.log(`❌ Found ${rows.length} duplicate exercise names:\n`);
    rows.forEach(r => {
      console.log(`   - "${r.name}" appears ${r.count} times`);
    });
    console.log('');
  }

  // Check for missing evidence base
  db.all(`
    SELECT exercise_id, name, evidence_base
    FROM exercises
    WHERE evidence_base IS NULL OR evidence_base = '' OR evidence_base = '{}'
    LIMIT 20
  `, [], (err, rows) => {
    if (err) {
      console.error('Error checking evidence:', err);
      db.close();
      return;
    }

    console.log('📚 MISSING EVIDENCE BASE:');
    if (rows.length === 0) {
      console.log('✅ All exercises have evidence base!\n');
    } else {
      console.log(`❌ Found ${rows.length} exercises missing evidence:\n`);
      rows.slice(0, 10).forEach(r => {
        console.log(`   - [${r.exercise_id}] ${r.name}`);
      });
      if (rows.length > 10) {
        console.log(`   ... and ${rows.length - 10} more`);
      }
      console.log('');
    }

    // Get total count
    db.get('SELECT COUNT(*) as total FROM exercises', [], (err, row) => {
      if (err) {
        console.error('Error getting count:', err);
      } else {
        console.log(`📊 TOTAL EXERCISES: ${row.total}`);
      }
      db.close();
    });
  });
});
