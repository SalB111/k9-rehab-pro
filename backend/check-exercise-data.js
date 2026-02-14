const http = require('http');

http.get('http://localhost:3000/api/exercises/1', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const exercise = JSON.parse(data);
    console.log('\n=== CHECKING EXERCISE DATA ===');
    console.log('Exercise Name:', exercise.name);
    console.log('Has Steps:', exercise.steps ? 'YES' : 'NO');
    console.log('Steps Count:', exercise.steps ? exercise.steps.length : 0);
    console.log('\nFirst 3 Steps:');
    if (exercise.steps) {
      exercise.steps.slice(0, 3).forEach((step, i) => {
        console.log(`\nStep ${i + 1}:`, step);
      });
    }
    console.log('\n');
  });
}).on('error', (e) => {
  console.error('ERROR:', e.message);
});
