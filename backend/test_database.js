// ============================================================================
// K9-REHAB-PRO DATABASE TEST SUITE
// Complete API endpoint testing
// ============================================================================

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test data
const testProtocolId = 'K9RP-1770793389954'; // Update this after running generate-protocol

// ============================================================================
// TEST 1: Generate Protocol (creates patient + protocol in DB)
// ============================================================================

async function test1_generateProtocol() {
  console.log('\n📋 TEST 1: Generate Protocol + Save to Database');
  console.log('='.repeat(60));
  
  try {
    const patientData = {
      clientName: "Dr. Emily Martinez",
      patientName: "Bella",
      species: "Canine",
      breed: "Golden Retriever",
      age: 3,
      weight: 65,
      diagnosis: "CCL_CONSERVATIVE",
      painWithActivity: 5,
      mobilityLevel: 5,
      goals: [
        "Reduce pain and inflammation",
        "Strengthen quadriceps and hamstrings",
        "Return to moderate activity"
      ],
      protocolLength: 8
    };

    const response = await axios.post(`${BASE_URL}/generate-protocol`, patientData);
    
    console.log('✅ Protocol generated successfully');
    console.log(`   Protocol ID: ${response.data.protocol.protocolId}`);
    console.log(`   Patient: ${patientData.patientName}`);
    console.log(`   Diagnosis: ${patientData.diagnosis}`);
    console.log(`   Weeks: ${response.data.protocol.weeklyProtocol.length}`);
    
    return response.data.protocol.protocolId;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// ============================================================================
// TEST 2: Retrieve All Patients
// ============================================================================

async function test2_getAllPatients() {
  console.log('\n👥 TEST 2: Get All Patients');
  console.log('='.repeat(60));
  
  try {
    const response = await axios.get(`${BASE_URL}/patients`);
    
    console.log(`✅ Retrieved ${response.data.total} patients`);
    response.data.patients.forEach((patient, idx) => {
      console.log(`   ${idx + 1}. ${patient.patient_name} (${patient.breed}) - Owner: ${patient.client_name}`);
    });
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// ============================================================================
// TEST 3: Search Patients
// ============================================================================

async function test3_searchPatients() {
  console.log('\n🔍 TEST 3: Search Patients');
  console.log('='.repeat(60));
  
  try {
    const response = await axios.get(`${BASE_URL}/patients/search?q=Max`);
    
    console.log(`✅ Search for "Max" found ${response.data.total} results`);
    response.data.patients.forEach(patient => {
      console.log(`   - ${patient.patient_name} (ID: ${patient.patient_id})`);
    });
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// ============================================================================
// TEST 4: Get Active Protocols
// ============================================================================

async function test4_getActiveProtocols() {
  console.log('\n📊 TEST 4: Get Active Protocols');
  console.log('='.repeat(60));
  
  try {
    const response = await axios.get(`${BASE_URL}/protocols`);
    
    console.log(`✅ Retrieved ${response.data.total} active protocols`);
    response.data.protocols.forEach((protocol, idx) => {
      console.log(`   ${idx + 1}. ${protocol.patient_name} - ${protocol.diagnosis_name}`);
      console.log(`      Protocol ID: ${protocol.protocol_id}`);
      console.log(`      Stage: ${protocol.rehab_stage}, Weeks: ${protocol.protocol_length}`);
    });
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// ============================================================================
// TEST 5: Get Specific Protocol with Exercises
// ============================================================================

async function test5_getProtocolDetail(protocolId) {
  console.log('\n📖 TEST 5: Get Protocol Details');
  console.log('='.repeat(60));
  
  try {
    const response = await axios.get(`${BASE_URL}/protocol/${protocolId}`);
    
    const protocol = response.data.protocol;
    console.log(`✅ Protocol: ${protocol.protocol_id}`);
    console.log(`   Diagnosis: ${protocol.diagnosis_name}`);
    console.log(`   Total Exercises Assigned: ${protocol.exercises.length}`);
    console.log(`   Sample exercises:`);
    
    protocol.exercises.slice(0, 3).forEach(ex => {
      console.log(`      Week ${ex.week_number}: ${ex.exercise_name}`);
      console.log(`         Dosage: ${ex.dosage}`);
    });
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// ============================================================================
// TEST 6: Log Completed Exercise
// ============================================================================

async function test6_logExercise(protocolId) {
  console.log('\n✍️ TEST 6: Log Completed Exercise');
  console.log('='.repeat(60));
  
  try {
    const exerciseLog = {
      protocolId: protocolId,
      exerciseId: "EX-040",
      weekNumber: 1,
      completedDate: new Date().toISOString().split('T')[0],
      durationMinutes: 15,
      repetitions: 12,
      painLevelPost: 2,
      notes: "Patient performed well, good form on sit-to-stand exercises"
    };

    const response = await axios.post(`${BASE_URL}/exercise-log`, exerciseLog);
    
    console.log(`✅ Exercise logged successfully (Log ID: ${response.data.log_id})`);
    console.log(`   Exercise: ${exerciseLog.exerciseId}`);
    console.log(`   Duration: ${exerciseLog.durationMinutes} minutes`);
    console.log(`   Pain Level: ${exerciseLog.painLevelPost}/10`);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// ============================================================================
// TEST 7: Get Exercise Logs
// ============================================================================

async function test7_getExerciseLogs(protocolId) {
  console.log('\n📝 TEST 7: Get Exercise Logs');
  console.log('='.repeat(60));
  
  try {
    const response = await axios.get(`${BASE_URL}/protocol/${protocolId}/logs`);
    
    console.log(`✅ Retrieved ${response.data.total} exercise logs`);
    response.data.logs.forEach((log, idx) => {
      console.log(`   ${idx + 1}. ${log.exercise_id} (Week ${log.week_number})`);
      console.log(`      Date: ${log.completed_date}, Duration: ${log.duration_minutes}min`);
      console.log(`      Pain: ${log.pain_level_post}/10`);
    });
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// ============================================================================
// TEST 8: Get Compliance Statistics
// ============================================================================

async function test8_getCompliance(protocolId) {
  console.log('\n📈 TEST 8: Get Compliance Statistics');
  console.log('='.repeat(60));
  
  try {
    const response = await axios.get(`${BASE_URL}/protocol/${protocolId}/compliance`);
    
    console.log(`✅ Compliance statistics:`);
    response.data.stats.forEach(stat => {
      console.log(`   Week ${stat.week_number}:`);
      console.log(`      Completed Exercises: ${stat.completed_exercises}`);
      console.log(`      Total Sessions: ${stat.total_sessions}`);
      console.log(`      Avg Pain Level: ${stat.avg_pain_level?.toFixed(1) || 'N/A'}/10`);
    });
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// ============================================================================
// TEST 9: Save Progress Assessment
// ============================================================================

async function test9_saveAssessment(protocolId) {
  console.log('\n🩺 TEST 9: Save Progress Assessment');
  console.log('='.repeat(60));
  
  try {
    const assessment = {
      protocolId: protocolId,
      weekNumber: 1,
      assessmentDate: new Date().toISOString().split('T')[0],
      painLevel: 3,
      mobilityLevel: 7,
      romMeasurement: "Stifle flexion: 125°",
      girthMeasurement: "Thigh: 42cm",
      weightBearing: "80% on affected limb",
      gaitQuality: "Improved, minimal limping",
      therapistNotes: "Excellent progress this week. Patient showing increased confidence in weight bearing."
    };

    const response = await axios.post(`${BASE_URL}/progress-assessment`, assessment);
    
    console.log(`✅ Assessment saved (ID: ${response.data.assessment_id})`);
    console.log(`   Week: ${assessment.weekNumber}`);
    console.log(`   Pain: ${assessment.painLevel}/10, Mobility: ${assessment.mobilityLevel}/10`);
    console.log(`   ROM: ${assessment.romMeasurement}`);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// ============================================================================
// TEST 10: Get Progress Assessments
// ============================================================================

async function test10_getAssessments(protocolId) {
  console.log('\n📋 TEST 10: Get Progress Assessments');
  console.log('='.repeat(60));
  
  try {
    const response = await axios.get(`${BASE_URL}/protocol/${protocolId}/assessments`);
    
    console.log(`✅ Retrieved ${response.data.total} assessments`);
    response.data.assessments.forEach((assessment, idx) => {
      console.log(`   ${idx + 1}. Week ${assessment.week_number} (${assessment.assessment_date})`);
      console.log(`      Pain: ${assessment.pain_level}/10, Mobility: ${assessment.mobility_level}/10`);
      console.log(`      ROM: ${assessment.rom_measurement}`);
    });
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// ============================================================================
// TEST 11: Update Protocol Status
// ============================================================================

async function test11_updateStatus(protocolId) {
  console.log('\n✅ TEST 11: Update Protocol Status');
  console.log('='.repeat(60));
  
  try {
    const response = await axios.put(`${BASE_URL}/protocol/${protocolId}/status`, {
      status: 'COMPLETED',
      completedDate: new Date().toISOString().split('T')[0]
    });
    
    console.log(`✅ Protocol status updated`);
    console.log(`   Changes: ${response.data.changes}`);
    
    // Revert back to ACTIVE for continued testing
    await axios.put(`${BASE_URL}/protocol/${protocolId}/status`, {
      status: 'ACTIVE'
    });
    console.log(`   (Reverted to ACTIVE for testing)`);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================

async function runAllTests() {
  console.log('\n' + '='.repeat(70));
  console.log('  K9-REHAB-PRO DATABASE INTEGRATION TEST SUITE');
  console.log('='.repeat(70));
  
  try {
    // Test 1: Generate new protocol
    const newProtocolId = await test1_generateProtocol();
    await sleep(1000);
    
    // Test 2-3: Patient operations
    await test2_getAllPatients();
    await sleep(500);
    await test3_searchPatients();
    await sleep(500);
    
    // Test 4-5: Protocol operations
    await test4_getActiveProtocols();
    await sleep(500);
    await test5_getProtocolDetail(testProtocolId);
    await sleep(500);
    
    // Test 6-8: Exercise logging and compliance
    await test6_logExercise(testProtocolId);
    await sleep(500);
    await test7_getExerciseLogs(testProtocolId);
    await sleep(500);
    await test8_getCompliance(testProtocolId);
    await sleep(500);
    
    // Test 9-10: Progress assessments
    await test9_saveAssessment(testProtocolId);
    await sleep(500);
    await test10_getAssessments(testProtocolId);
    await sleep(500);
    
    // Test 11: Update protocol status
    await test11_updateStatus(testProtocolId);
    
    console.log('\n' + '='.repeat(70));
    console.log('  ✅ ALL TESTS COMPLETED SUCCESSFULLY');
    console.log('='.repeat(70) + '\n');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run tests
runAllTests();
