#!/usr/bin/env node
// ============================================================================
// K9-REHAB-PRO — Seed Supabase with Exercise Library v2 + Conditions + Exercises
// Usage: DB_PROVIDER=supabase node seed-supabase.js
// ============================================================================

require('dotenv').config();

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not set. Run: supabase start');
  process.exit(1);
}

const supabase = require('./supabase-client');

const DOMAINS = [
  { id: 'MOB', name: 'Mobility and Range of Motion' },
  { id: 'WB', name: 'Weight Bearing and Foundational Strength' },
  { id: 'CORE', name: 'Core Stability and Postural Control' },
  { id: 'BAL', name: 'Balance and Proprioception' },
  { id: 'GAIT', name: 'Gait Retraining' },
  { id: 'END', name: 'Endurance and Cardiovascular Conditioning' },
  { id: 'FUNC', name: 'Functional Strength and Task Training' },
  { id: 'ATH', name: 'Athletic Performance and Return to Sport' }
];

const PHASES = [
  { id: 1, name: 'Protection and Mobility' },
  { id: 2, name: 'Early Strength' },
  { id: 3, name: 'Advanced Strength and Coordination' },
  { id: 4, name: 'Functional Reintegration' },
  { id: 5, name: 'Return to Sport or Maintenance' }
];

const TIERS = [
  { id: 1, name: 'Passive or Fully Assisted' },
  { id: 2, name: 'Low Load Active' },
  { id: 3, name: 'Moderate Resistance or Coordination' },
  { id: 4, name: 'Advanced Strength or Balance' },
  { id: 5, name: 'Athletic or High Demand' }
];

const EXERCISES_V2 = [
  { id: 'MOB-P1-01', name: 'Passive Range of Motion', domain: 'MOB', category: 'Passive Mobility', phases: [1], tiers: [1] },
  { id: 'MOB-P1-02', name: 'Passive Cycling', domain: 'MOB', category: 'Passive Mobility', phases: [1], tiers: [1] },
  { id: 'MOB-P1-03', name: 'Joint Approximation', domain: 'MOB', category: 'Passive Mobility', phases: [1], tiers: [1] },
  { id: 'MOB-P1-04', name: 'Passive Stretching', domain: 'MOB', category: 'Passive Mobility', phases: [1,2], tiers: [1,2] },
  { id: 'MOB-P1-05', name: 'Assisted Limb Placement', domain: 'MOB', category: 'Assisted Mobility', phases: [1,2], tiers: [1,2] },
  { id: 'MOB-P1-06', name: 'Neurologic Toe Stimulation', domain: 'MOB', category: 'Assisted Mobility', phases: [1], tiers: [1] },
  { id: 'WB-TS-01', name: 'Sit to Stand', domain: 'WB', category: 'Transitional Strength', phases: [2,3,4], tiers: [2,3,4] },
  { id: 'WB-TS-02', name: 'Stand to Sit', domain: 'WB', category: 'Transitional Strength', phases: [2,3,4], tiers: [2,3,4] },
  { id: 'WB-ST-03', name: 'Square Stand', domain: 'WB', category: 'Static Strength', phases: [1,2,3], tiers: [1,2] },
  { id: 'WB-ST-04', name: 'Static Hold Stand', domain: 'WB', category: 'Static Strength', phases: [2,3], tiers: [2,3] },
  { id: 'WB-ST-05', name: 'Three Legged Stand', domain: 'WB', category: 'Static Strength', phases: [3,4], tiers: [3,4] },
  { id: 'WB-AS-06', name: 'Assisted Standing', domain: 'WB', category: 'Supported Stance', phases: [1,2], tiers: [1,2] },
  { id: 'WB-WS-07', name: 'Lateral Weight Shift', domain: 'WB', category: 'Weight Shifting', phases: [2,3], tiers: [2,3] },
  { id: 'WB-WS-08', name: 'Cranial Caudal Weight Shift', domain: 'WB', category: 'Weight Shifting', phases: [2,3], tiers: [2,3] },
  { id: 'CORE-ST-01', name: 'Peanut Ball Stand', domain: 'CORE', category: 'Static Core', phases: [2,3], tiers: [2,3] },
  { id: 'CORE-ST-02', name: 'Forelimb Elevation', domain: 'CORE', category: 'Static Core', phases: [2,3], tiers: [2,3] },
  { id: 'CORE-ST-03', name: 'Hindlimb Elevation', domain: 'CORE', category: 'Static Core', phases: [3,4], tiers: [3,4] },
  { id: 'CORE-DY-04', name: 'Diagonal Limb Lift', domain: 'CORE', category: 'Dynamic Core', phases: [3,4], tiers: [3,4] },
  { id: 'CORE-DY-05', name: 'Core Bracing Hold', domain: 'CORE', category: 'Dynamic Core', phases: [2,3], tiers: [2,3] },
  { id: 'BAL-ST-01', name: 'Balance Disc Stand', domain: 'BAL', category: 'Static Balance', phases: [2,3], tiers: [2,3] },
  { id: 'BAL-ST-02', name: 'Wobble Board Stand', domain: 'BAL', category: 'Static Balance', phases: [3,4], tiers: [3,4] },
  { id: 'BAL-DY-03', name: 'Rocking Weight Shift', domain: 'BAL', category: 'Dynamic Balance', phases: [2,3], tiers: [2,3] },
  { id: 'BAL-DY-04', name: 'Unstable Surface Stand', domain: 'BAL', category: 'Dynamic Balance', phases: [3,4], tiers: [3,4] },
  { id: 'BAL-DY-05', name: 'Lateral Platform Step', domain: 'BAL', category: 'Dynamic Balance', phases: [3,4], tiers: [3,4] },
  { id: 'GAIT-SL-01', name: 'Controlled Leash Walk', domain: 'GAIT', category: 'Straight Line', phases: [1,2,3,4], tiers: [1,2] },
  { id: 'GAIT-SL-02', name: 'Treadmill Walk', domain: 'GAIT', category: 'Straight Line', phases: [2,3,4], tiers: [2,3] },
  { id: 'GAIT-DIR-03', name: 'Figure 8 Walk', domain: 'GAIT', category: 'Directional', phases: [3,4], tiers: [3] },
  { id: 'GAIT-DIR-04', name: 'Circle Walk', domain: 'GAIT', category: 'Directional', phases: [2,3,4], tiers: [2,3] },
  { id: 'GAIT-DIR-05', name: 'Backward Walk', domain: 'GAIT', category: 'Directional', phases: [3,4], tiers: [3,4] },
  { id: 'GAIT-DIR-06', name: 'Side Step', domain: 'GAIT', category: 'Directional', phases: [3,4], tiers: [3,4] },
  { id: 'GAIT-OBS-07', name: 'Low Cavaletti', domain: 'GAIT', category: 'Obstacle', phases: [3,4], tiers: [3] },
  { id: 'GAIT-OBS-08', name: 'Raised Cavaletti', domain: 'GAIT', category: 'Obstacle', phases: [4,5], tiers: [4] },
  { id: 'GAIT-OBS-09', name: 'Obstacle Step', domain: 'GAIT', category: 'Obstacle', phases: [3,4], tiers: [3,4] },
  { id: 'END-AQ-01', name: 'Underwater Treadmill', domain: 'END', category: 'Aquatic', phases: [2,3,4], tiers: [2,3] },
  { id: 'END-AQ-02', name: 'Swimming', domain: 'END', category: 'Aquatic', phases: [3,4,5], tiers: [3,4] },
  { id: 'END-LD-03', name: 'Hill Walking', domain: 'END', category: 'Land Endurance', phases: [3,4,5], tiers: [3,4] },
  { id: 'END-LD-04', name: 'Incline Treadmill', domain: 'END', category: 'Land Endurance', phases: [3,4], tiers: [3,4] },
  { id: 'END-LD-05', name: 'Stair Climbing', domain: 'END', category: 'Land Endurance', phases: [3,4,5], tiers: [3,4] },
  { id: 'END-LD-06', name: 'Endurance Leash Walking', domain: 'END', category: 'Land Endurance', phases: [2,3,4], tiers: [2,3] },
  { id: 'FUNC-TR-01', name: 'Sit to Beg', domain: 'FUNC', category: 'Transitional Movements', phases: [3,4], tiers: [3,4] },
  { id: 'FUNC-TR-02', name: 'Pivot Exercise', domain: 'FUNC', category: 'Transitional Movements', phases: [3,4], tiers: [3,4] },
  { id: 'FUNC-TR-03', name: 'Tight Turns', domain: 'FUNC', category: 'Environmental Navigation', phases: [3,4], tiers: [3] },
  { id: 'FUNC-TR-04', name: 'Platform Step', domain: 'FUNC', category: 'Environmental Navigation', phases: [3,4,5], tiers: [3,4] },
  { id: 'FUNC-TR-05', name: 'Controlled Fetch', domain: 'FUNC', category: 'Task Specific', phases: [4,5], tiers: [4,5] },
  { id: 'ATH-PL-01', name: 'Low Jump Grid', domain: 'ATH', category: 'Plyometric', phases: [4,5], tiers: [4,5] },
  { id: 'ATH-PL-02', name: 'Sprint Intervals', domain: 'ATH', category: 'Sprint', phases: [5], tiers: [5] },
  { id: 'ATH-PL-03', name: 'Direction Change Drill', domain: 'ATH', category: 'Agility', phases: [4,5], tiers: [4,5] },
  { id: 'ATH-PL-04', name: 'Sport Obstacle Sequence', domain: 'ATH', category: 'Agility', phases: [5], tiers: [5] }
];

async function seed() {
  console.log('🌱 Seeding Supabase...\n');

  // Domains
  const { count: domainCount } = await supabase.from('domains').select('*', { count: 'exact', head: true });
  if (domainCount === 0) {
    const { error } = await supabase.from('domains').insert(DOMAINS);
    if (error) throw error;
    console.log(`✅ Seeded ${DOMAINS.length} domains`);
  } else {
    console.log('✅ Domains already seeded');
  }

  // Phases
  const { count: phaseCount } = await supabase.from('phases').select('*', { count: 'exact', head: true });
  if (phaseCount === 0) {
    const { error } = await supabase.from('phases').insert(PHASES);
    if (error) throw error;
    console.log(`✅ Seeded ${PHASES.length} phases`);
  } else {
    console.log('✅ Phases already seeded');
  }

  // Tiers
  const { count: tierCount } = await supabase.from('tiers').select('*', { count: 'exact', head: true });
  if (tierCount === 0) {
    const { error } = await supabase.from('tiers').insert(TIERS);
    if (error) throw error;
    console.log(`✅ Seeded ${TIERS.length} tiers`);
  } else {
    console.log('✅ Tiers already seeded');
  }

  // Exercises v2
  const { count: exCount } = await supabase.from('exercises_v2').select('*', { count: 'exact', head: true });
  if (exCount === 0) {
    const exRows = EXERCISES_V2.map(ex => ({
      id: ex.id, name: ex.name, domain: ex.domain, category: ex.category
    }));
    const { error } = await supabase.from('exercises_v2').insert(exRows);
    if (error) throw error;

    // Phase junctions
    const phaseJunctions = [];
    EXERCISES_V2.forEach(ex => {
      ex.phases.forEach(p => phaseJunctions.push({ exercise_id: ex.id, phase_id: p }));
    });
    const { error: pErr } = await supabase.from('exercise_phases_v2').insert(phaseJunctions);
    if (pErr) throw pErr;

    // Tier junctions
    const tierJunctions = [];
    EXERCISES_V2.forEach(ex => {
      ex.tiers.forEach(t => tierJunctions.push({ exercise_id: ex.id, tier_id: t }));
    });
    const { error: tErr } = await supabase.from('exercise_tiers_v2').insert(tierJunctions);
    if (tErr) throw tErr;

    console.log(`✅ Seeded ${exRows.length} exercises with phase/tier mappings`);
  } else {
    console.log('✅ Exercises v2 already seeded');
  }

  // Conditions (from server.js seed data)
  const { count: condCount } = await supabase.from('conditions').select('*', { count: 'exact', head: true });
  if (condCount === 0) {
    const conditions = [
      { code: 'CCL_CONSERV', name: 'CCL Rupture - Conservative', category: 'Stifle (Knee)', severity: 'Moderate', typical_recovery_weeks: 12 },
      { code: 'POST_TPLO', name: 'Post-Op TPLO', category: 'Stifle (Knee)', severity: 'Surgical', typical_recovery_weeks: 12 },
      { code: 'POST_TTA', name: 'Post-Op TTA', category: 'Stifle (Knee)', severity: 'Surgical', typical_recovery_weeks: 12 },
      { code: 'POST_LATERAL', name: 'Post-Op Lateral Suture', category: 'Stifle (Knee)', severity: 'Surgical', typical_recovery_weeks: 10 },
      { code: 'PATELLA_LUX', name: 'Patellar Luxation (Grade 1-2)', category: 'Stifle (Knee)', severity: 'Mild-Moderate', typical_recovery_weeks: 8 },
      { code: 'POST_PATELLA', name: 'Post-Op Patellar Repair', category: 'Stifle (Knee)', severity: 'Surgical', typical_recovery_weeks: 10 },
      { code: 'HIP_DYSPLASIA', name: 'Hip Dysplasia', category: 'Hip', severity: 'Moderate-Severe', typical_recovery_weeks: 12 },
      { code: 'POST_FHO', name: 'Post-Op FHO', category: 'Hip', severity: 'Surgical', typical_recovery_weeks: 10 },
      { code: 'POST_THR', name: 'Post-Op Total Hip Replacement', category: 'Hip', severity: 'Surgical', typical_recovery_weeks: 12 },
      { code: 'HIP_OA', name: 'Hip Osteoarthritis', category: 'Hip', severity: 'Chronic', typical_recovery_weeks: 16 },
      { code: 'ELBOW_DYSPLASIA', name: 'Elbow Dysplasia', category: 'Elbow & Shoulder', severity: 'Moderate', typical_recovery_weeks: 12 },
      { code: 'OCD_SHOULDER', name: 'OCD - Shoulder', category: 'Elbow & Shoulder', severity: 'Moderate', typical_recovery_weeks: 10 },
      { code: 'BICEPS_TENDON', name: 'Bicipital Tenosynovitis', category: 'Elbow & Shoulder', severity: 'Mild-Moderate', typical_recovery_weeks: 8 },
      { code: 'SHOULDER_INSTAB', name: 'Shoulder Instability', category: 'Elbow & Shoulder', severity: 'Moderate', typical_recovery_weeks: 10 },
      { code: 'IVDD_CONSERV', name: 'IVDD - Conservative Management', category: 'Spine & Neuro', severity: 'Moderate-Severe', typical_recovery_weeks: 8 },
      { code: 'IVDD_POSTOP', name: 'IVDD - Post-Op Hemilaminectomy', category: 'Spine & Neuro', severity: 'Surgical', typical_recovery_weeks: 12 },
      { code: 'FCE', name: 'FCE (Fibrocartilaginous Embolism)', category: 'Spine & Neuro', severity: 'Acute-Severe', typical_recovery_weeks: 12 },
      { code: 'DM', name: 'Degenerative Myelopathy', category: 'Spine & Neuro', severity: 'Progressive', typical_recovery_weeks: 16 },
      { code: 'WOBBLER', name: 'Wobbler Syndrome', category: 'Spine & Neuro', severity: 'Moderate-Severe', typical_recovery_weeks: 12 },
      { code: 'OA_MULTI', name: 'Osteoarthritis - Multiple Joints', category: 'Multi-Joint OA', severity: 'Chronic', typical_recovery_weeks: 16 },
      { code: 'GERIATRIC', name: 'Geriatric Mobility', category: 'Multi-Joint OA', severity: 'Age-Related', typical_recovery_weeks: 12 },
      { code: 'CHRONIC_PAIN', name: 'Chronic Pain Management', category: 'Multi-Joint OA', severity: 'Chronic', typical_recovery_weeks: 16 }
    ];
    const { error } = await supabase.from('conditions').insert(conditions);
    if (error) throw error;
    console.log(`✅ Seeded ${conditions.length} conditions`);
  } else {
    console.log('✅ Conditions already seeded');
  }

  // Exercises (from all-exercises.js)
  const { count: mainExCount } = await supabase.from('exercises').select('*', { count: 'exact', head: true });
  if (mainExCount === 0) {
    const ALL_EXERCISES = require('./all-exercises').ALL_EXERCISES || require('./all-exercises');
    const exList = (Array.isArray(ALL_EXERCISES) ? ALL_EXERCISES : []).map(ex => ({
      code: ex.code, name: ex.name, category: ex.category || 'General',
      description: ex.description || null,
      equipment: JSON.stringify(ex.equipment || []),
      setup: ex.setup || null,
      steps: JSON.stringify(ex.steps || []),
      good_form: JSON.stringify(ex.good_form || []),
      common_mistakes: JSON.stringify(ex.common_mistakes || []),
      red_flags: JSON.stringify(ex.red_flags || []),
      progression: ex.progression || null,
      contraindications: ex.contraindications || null,
      difficulty_level: ex.difficulty_level || 'Moderate'
    }));

    // Batch insert
    for (let i = 0; i < exList.length; i += 50) {
      const { error } = await supabase.from('exercises').insert(exList.slice(i, i + 50));
      if (error) throw error;
    }
    console.log(`✅ Seeded ${exList.length} exercises`);
  } else {
    console.log('✅ Exercises already seeded');
  }

  console.log('\n🎉 Supabase seeding complete!');
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
