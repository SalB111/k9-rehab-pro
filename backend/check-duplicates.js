// Check for duplicate exercise codes
const ALL_EXERCISES = require('./all-exercises.js');

console.log(`\n📊 CHECKING ${ALL_EXERCISES.length} EXERCISES FOR DUPLICATES...\n`);

const codes = ALL_EXERCISES.map(e => e.code);
const codeCount = {};

codes.forEach(code => {
  codeCount[code] = (codeCount[code] || 0) + 1;
});

const duplicates = Object.keys(codeCount).filter(code => codeCount[code] > 1);

if (duplicates.length > 0) {
  console.log('❌ DUPLICATE CODES FOUND:');
  duplicates.forEach(code => {
    console.log(`   ${code}: appears ${codeCount[code]} times`);
  });
} else {
  console.log('✅ NO DUPLICATES - ALL CODES UNIQUE!');
}

console.log(`\n📋 ALL CODES (${codes.length} total):`);
codes.forEach((code, i) => {
  console.log(`${i+1}. ${code}`);
});
