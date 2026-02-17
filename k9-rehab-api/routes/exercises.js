const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

// GET /exercises — optional ?category=&body_region=
router.get('/', async (req, res) => {
  try {
    let query = supabase.from('exercises').select('*');

    if (req.query.category)    query = query.eq('category', req.query.category);
    if (req.query.body_region) query = query.eq('body_region', req.query.body_region);

    const { data, error } = await query.order('name');
    if (error) throw error;

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /exercises/:slug
router.get('/:slug', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('slug', req.params.slug)
      .single();

    if (error) return res.status(404).json({ success: false, error: 'Exercise not found' });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
