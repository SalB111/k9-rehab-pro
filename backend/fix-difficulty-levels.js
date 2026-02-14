// ============================================================================
// FIX NON-STANDARD DIFFICULTY LEVELS
// Standardizes all exercises to use: Easy, Moderate, Advanced
// ============================================================================

const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║        STANDARDIZING EXERCISE DIFFICULTY LEVELS                ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

// Define the mapping from non-standard to standard difficulty levels
const DIFFICULTY_MAPPING = {
  'Challenging': 'Advanced',
  'Easy-Moderate': 'Moderate',
  'Hard': 'Advanced',
  'Moderate-Hard': 'Advanced'
};

// Files to process
const FILES_TO_FIX = [
  'exercises-part2.js',
  'exercises-part3.js',
  'exercises-part4.js',
  'exercises-part5.js',
  'exercises-part6.js'
];

let totalFixed = 0;
let filesModified = 0;

FILES_TO_FIX.forEach(filename => {
  const filepath = path.join(__dirname, filename);
  
  console.log(`📝 Processing: ${filename}`);
  
  // Read the file
  let content = fs.readFileSync(filepath, 'utf8');
  let fileModified = false;
  let fixesInFile = 0;
  
  // Replace each non-standard difficulty level
  Object.entries(DIFFICULTY_MAPPING).forEach(([oldLevel, newLevel]) => {
    const searchStr = `difficulty_level: '${oldLevel}'`;
    const replaceStr = `difficulty_level: '${newLevel}'`;
    
    const matches = (content.match(new RegExp(searchStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    
    if (matches > 0) {
      content = content.replace(new RegExp(searchStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replaceStr);
      console.log(`   ✅ Fixed ${matches} instances: '${oldLevel}' → '${newLevel}'`);
      fixesInFile += matches;
      fileModified = true;
    }
  });
  
  // Write back if modified
  if (fileModified) {
    fs.writeFileSync(filepath, content, 'utf8');
    filesModified++;
    totalFixed += fixesInFile;
    console.log(`   💾 Saved with ${fixesInFile} fixes\n`);
  } else {
    console.log(`   ℹ️  No changes needed\n`);
  }
});

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║                    FIX SUMMARY                                 ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');
console.log(`   📊 Total Fixes: ${totalFixed} difficulty levels standardized`);
console.log(`   📁 Files Modified: ${filesModified} files`);
console.log('');
console.log('   Difficulty Level Conversions:');
console.log('   • Challenging → Advanced');
console.log('   • Easy-Moderate → Moderate');
console.log('   • Hard → Advanced');
console.log('   • Moderate-Hard → Advanced');
console.log('');
console.log('   Standard levels now: Easy, Moderate, Advanced');
console.log('');
console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║              DIFFICULTY LEVELS STANDARDIZED ✨                 ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');
console.log('✅ All exercises now use standard difficulty levels!');
console.log('🔄 Run seed-exercises-sqlite.js to update the database\n');
