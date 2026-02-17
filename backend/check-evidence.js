const all = require('./all-exercises');
const ex = Array.isArray(all) ? all : (all.COMPLETE_EXERCISES || all.ALL_EXERCISES || Object.values(all)[0] || []);
console.log('Total exercises:', ex.length);

const s = ex[0];
console.log('\nFirst exercise code:', s.code);
console.log('Has evidence_base:', !!s.evidence_base);
if (s.evidence_base) {
  console.log('Grade:', s.evidence_base.grade);
  const refs = s.evidence_base.references;
  console.log('Refs count:', refs ? refs.length : 0);
  if (refs && refs[0]) {
    console.log('First ref keys:', Object.keys(refs[0]));
    console.log('First ref citation:', refs[0].citation ? refs[0].citation.slice(0, 80) : 'NONE');
    console.log('First ref url:', refs[0].url || 'NO URL FIELD');
  }
}

// Check how many exercises have evidence data
const withEvidence = ex.filter(e => e.evidence_base && e.evidence_base.references && e.evidence_base.references.length > 0);
console.log('\nExercises with references:', withEvidence.length, '/', ex.length);

// Show which exercise codes have evidence mapped
const { EXERCISE_EVIDENCE_MAP } = require('./evidence-references');
console.log('\nMapped exercise codes in EXERCISE_EVIDENCE_MAP:', Object.keys(EXERCISE_EVIDENCE_MAP));
console.log('\nSample exercise codes from data:', ex.slice(0, 10).map(e => e.code));
