const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const { getExerciseSlugsForPhase, getAvailableConditions, getPhasesForCondition } = require('../../backend/protocol-rules');

// GET /programs/conditions
router.get('/conditions', (_req, res) => {
  res.json({ success: true, data: getAvailableConditions() });
});

// GET /programs/conditions/:condition/phases
router.get('/conditions/:condition/phases', (req, res) => {
  const phases = getPhasesForCondition(req.params.condition);
  if (!phases) return res.status(404).json({ success: false, error: 'Condition not found' });
  res.json({ success: true, data: phases });
});

// POST /programs/generate
// Body: { condition: "TPLO", phase: "early" }
router.post('/generate', async (req, res) => {
  try {
    const { condition, phase } = req.body;

    if (!condition || !phase) {
      return res.status(400).json({ success: false, error: 'condition and phase are required' });
    }

    // Get exercise slugs from rules engine
    const ruleResult = getExerciseSlugsForPhase(condition, phase);
    if (!ruleResult) {
      return res.status(404).json({
        success: false,
        error: `No protocol rules found for condition="${condition}" phase="${phase}"`,
        available_conditions: getAvailableConditions()
      });
    }

    // Fetch full exercise records from Supabase
    const { data: exercises, error } = await supabase
      .from('exercises')
      .select('*')
      .in('slug', ruleResult.slugs);

    if (error) throw error;

    res.json({
      success: true,
      data: {
        id: `PROG-${Date.now()}`,
        condition: ruleResult.condition,
        phase: ruleResult.phase,
        phase_label: ruleResult.label,
        goals: ruleResult.goals,
        exercises,
        generated_at: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
