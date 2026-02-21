const http = require('http');
http.get('http://localhost:3000/api/exercises', (res) => {
  const chunks = [];
  res.on('data', c => chunks.push(c));
  res.on('end', () => {
    const exercises = JSON.parse(Buffer.concat(chunks).toString());
    const total = exercises.length;
    const withSB = exercises.filter(e => e.client_education && e.client_education.storyboard_available).length;
    const withFrames = exercises.filter(e => e.client_education && e.client_education.storyboard_metadata && e.client_education.storyboard_metadata.frame_count > 0).length;
    console.log('Total exercises: ' + total);
    console.log('storyboard_available=true: ' + withSB + '/' + total);
    console.log('Has frame_count > 0: ' + withFrames + '/' + total);
    console.log('');
    if (withSB === total) {
      console.log('PASS: ALL ' + total + ' EXERCISES HAVE STORYBOARD COVERAGE');
    } else {
      console.log('FAIL: ' + (total - withSB) + ' exercises missing storyboards');
      exercises.filter(e => {
        const ce = e.client_education;
        return !(ce && ce.storyboard_available);
      }).forEach(e => console.log('  MISSING: ' + e.code));
    }
  });
}).on('error', err => {
  console.log('ERROR: Could not reach API.', err.message);
});
