// Quick test script for enhanced exercise system
const {ALL_EXERCISES} = require('./all-exercises');

console.log('\n' + '='.repeat(60));
console.log('MEDICAL-GRADE EXERCISE SYSTEM TEST');
console.log('='.repeat(60));

console.log('\n📊 Total exercises:', ALL_EXERCISES.length);

if (ALL_EXERCISES.length > 0) {
  const firstEx = ALL_EXERCISES[0];

  console.log('\n✅ First exercise loaded:');
  console.log('  Code:', firstEx.code);
  console.log('  Name:', firstEx.name);
  console.log('  Category:', firstEx.category);

  console.log('\n🏥 Clinical Metadata Check:');
  console.log('  Has clinical_classification:', !!firstEx.clinical_classification);
  console.log('  Intervention type:', firstEx.clinical_classification?.intervention_type);
  console.log('  Rehab phases:', firstEx.clinical_classification?.rehab_phases?.join(', '));
  console.log('  Primary indications:', firstEx.clinical_classification?.primary_indications?.slice(0, 2).join(', '));

  console.log('\n📚 Evidence Base:');
  console.log('  Evidence grade:', firstEx.evidence_base?.grade);
  console.log('  Certification required:', firstEx.evidence_base?.certification_required);
  console.log('  References:', firstEx.evidence_base?.references?.length || 0);

  console.log('\n💊 Clinical Parameters:');
  console.log('  CPT Code:', firstEx.billing_codes?.cpt_code);
  console.log('  Risk level:', firstEx.safety?.risk_level);
  console.log('  Home program suitable:', firstEx.client_education?.home_program_suitable);

  // Count exercises with full metadata
  const withMetadata = ALL_EXERCISES.filter(ex =>
    ex.clinical_classification &&
    ex.evidence_base &&
    ex.billing_codes
  ).length;

  console.log('\n📈 Enhancement Summary:');
  console.log('  Exercises with full clinical metadata:', withMetadata);
  console.log('  Success rate:', ((withMetadata / ALL_EXERCISES.length) * 100).toFixed(1) + '%');
}

console.log('\n' + '='.repeat(60));
console.log('✅ TEST COMPLETE');
console.log('='.repeat(60) + '\n');
