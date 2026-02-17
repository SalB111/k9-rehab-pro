const all = require('./all-exercises');
const ex = Array.isArray(all) ? all : (all.COMPLETE_EXERCISES || all.ALL_EXERCISES || Object.values(all)[0] || []);
// Print all codes grouped by category
const byCategory = {};
ex.forEach(e => {
  if (!byCategory[e.category]) byCategory[e.category] = [];
  byCategory[e.category].push(e.code);
});
Object.entries(byCategory).forEach(([cat, codes]) => {
  console.log('\n' + cat + ':');
  codes.forEach(c => console.log('  ' + c));
});
