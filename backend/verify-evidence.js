// Evidence & Resource verification script — checks live API
const http = require('http');

http.get('http://localhost:3000/api/exercises', (res) => {
  const chunks = [];
  res.on('data', c => chunks.push(c));
  res.on('end', () => {
    const exercises = JSON.parse(Buffer.concat(chunks).toString());
    console.log('Total exercises from API:', exercises.length);
    console.log('');

    const noRefs = [];
    const noGrade = [];
    let allGood = 0;
    const byCat = {};

    exercises.forEach(ex => {
      const cat = ex.category || 'Unknown';
      if (byCat[cat] === undefined) byCat[cat] = { total: 0, ok: 0, noRef: [], noGrade: [] };
      byCat[cat].total++;

      const eb = ex.evidence_base || {};
      const grade = eb.grade;
      const refs = eb.references || [];
      const hasGrade = grade && grade !== 'N/A';
      const hasRefs = refs.length > 0;

      if (hasGrade === false) {
        noGrade.push(ex.code + ': ' + ex.name + ' (' + cat + ')');
        byCat[cat].noGrade.push(ex.code);
      }
      if (hasRefs === false) {
        noRefs.push(ex.code + ': ' + ex.name + ' (' + cat + ')');
        byCat[cat].noRef.push(ex.code);
      }
      if (hasGrade && hasRefs) {
        allGood++;
        byCat[cat].ok++;
      }
    });

    console.log('═══════════════════════════════════════════════════');
    console.log('  LIVE API — EVIDENCE & RESOURCE AUDIT');
    console.log('═══════════════════════════════════════════════════');
    console.log('');

    const cats = Object.keys(byCat).sort();
    cats.forEach(cat => {
      const c = byCat[cat];
      const status = c.ok === c.total ? 'ALL CONFIRMED' : (c.total - c.ok) + ' ISSUES';
      console.log('  ' + cat + ' (' + c.total + '): ' + status);
      c.noRef.forEach(code => console.log('      MISSING REFS: ' + code));
      c.noGrade.forEach(code => console.log('      MISSING GRADE: ' + code));
    });

    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('  SUMMARY');
    console.log('═══════════════════════════════════════════════════');
    console.log('  Total exercises:          ' + exercises.length);
    console.log('  Evidence + Refs OK:       ' + allGood + '/' + exercises.length);
    console.log('  Missing evidence grade:   ' + noGrade.length);
    console.log('  Missing references:       ' + noRefs.length);
    console.log('');

    if (noRefs.length > 0) {
      console.log('  FLAGGED — NO REFERENCES:');
      noRefs.forEach(f => console.log('    ' + f));
    }
    if (noGrade.length > 0) {
      console.log('  FLAGGED — NO EVIDENCE GRADE:');
      noGrade.forEach(f => console.log('    ' + f));
    }
    if (noRefs.length === 0 && noGrade.length === 0) {
      console.log('  ALL ' + exercises.length + ' EXERCISES HAVE EVIDENCE-BASED REFERENCES & RESOURCES');
    }
  });
}).on('error', err => {
  console.log('ERROR: Could not reach API. Is the backend running?', err.message);
});
