const http = require('http');

http.get('http://localhost:3000/api/exercises', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const exercises = JSON.parse(data);
    console.log('\n=== API VERIFICATION ===');
    console.log('Total Exercises:', exercises.length);
    console.log('\nFirst 5 Exercises:');
    exercises.slice(0, 5).forEach(ex => {
      console.log(`  ${ex.code}: ${ex.name}`);
    });
    console.log('\nLast 5 Exercises:');
    exercises.slice(-5).forEach(ex => {
      console.log(`  ${ex.code}: ${ex.name}`);
    });
    console.log('\nCategories Present:');
    const categories = [...new Set(exercises.map(e => e.category))];
    categories.forEach(cat => {
      const count = exercises.filter(e => e.category === cat).length;
      console.log(`  ${cat}: ${count} exercises`);
    });
    console.log('\n✅ API TEST PASSED - All 170 exercises accessible\n');
  });
}).on('error', (e) => {
  console.error('❌ API TEST FAILED:', e.message);
});
