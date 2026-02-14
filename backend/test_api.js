/**
 * Test Script for K9-REHAB-PRO Backend API
 */

const http = require('http');

// Test data
const testRequest = {
  clientName: 'John Smith',
  patientName: 'Max',
  breed: 'Golden Retriever',
  weight: 75,
  age: 4,
  diagnosis: 'TPLO',
  daysPostSurgery: 21,
  painWithActivity: 3,
  mobilityLevel: 'PARTIAL_WEIGHT_BEARING',
  incisionStatus: 'HEALED',
  jointInstability: false,
  implantConcern: false
};

const data = JSON.stringify(testRequest);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/generate-protocol',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('\n🧪 TESTING K9-REHAB-PRO API');
console.log('================================\n');
console.log('Request:', testRequest);
console.log('\nSending POST to http://localhost:3000/api/generate-protocol...\n');

const req = http.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('\n✅ RESPONSE:\n');
    
    try {
      const parsed = JSON.parse(responseData);
      console.log(JSON.stringify(parsed, null, 2));
      
      // Validation
      if (parsed.success && parsed.protocol) {
        console.log('\n✅ SUCCESS - Protocol Generated!');
        console.log('\nProtocol Summary:');
        console.log('  Protocol ID:', parsed.protocol.protocolId);
        console.log('  Status:', parsed.protocol.status);
        console.log('  Stage:', parsed.protocol.clinical?.stage);
        console.log('  Weekly Plans:', parsed.protocol.weeklyProtocol?.length);
        console.log('  Exercises in Week 1:', parsed.protocol.weeklyProtocol?.[0]?.exercises?.length);
      } else {
        console.log('\n❌ FAILED - No protocol generated');
      }
    } catch (e) {
      console.log('Raw response:', responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ ERROR:', error.message);
});

req.write(data);
req.end();
