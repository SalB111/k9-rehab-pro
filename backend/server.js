// ============================================================================
// K9 REHAB PRO™ — ENHANCED SERVER
// © 2025 Salvatore Bonanno. All rights reserved.
// Proprietary software. Unauthorized use, reproduction, or distribution
// is strictly prohibited.
// ============================================================================

const express = require('express');
const cors = require('cors');
const path = require('path');

// ---- Protocol Engine Imports ----
const {
  selectExercisesForWeek,
  getProtocolType,
  getPhaseForWeek,
  validateIntake,
  getExcludedCodes,
  PROTOCOL_DEFINITIONS,
  EVIDENCE_MAP,
  parseReps
} = require('./protocol-generator');

const feline = require('./beau-feline');

// ---- App Setup ----
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ---- Health Check ----
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend running' });
});

// ---- Get All Protocol Definitions ----
app.get('/protocol-definitions', (req, res) => {
  res.json(PROTOCOL_DEFINITIONS);
});

// ---- Generate Weekly Exercises ----
app.post('/generate-week', (req, res) => {
  try {
    const { weekNum, totalWeeks, allExercises, formData } = req.body;

    const weekExercises = selectExercisesForWeek(
      weekNum,
      totalWeeks,
      allExercises,
      formData
    );

    res.json({ weekExercises });
  } catch (err) {
    console.error('Error generating week:', err);
    res.status(500).json({ error: 'Failed to generate week' });
  }
});

// ---- Feline Protocol Endpoint ----
app.post('/feline-protocol', async (req, res) => {
  try {
    const result = await feline.generateFelineProtocol(req.body);
    res.json(result);
  } catch (err) {
    console.error('Feline protocol error:', err);
    res.status(500).json({ error: 'Failed to generate feline protocol' });
  }
});

// ---- Start Server ----
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`K9 Rehab Pro backend running on port ${PORT}`);
});