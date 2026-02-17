require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { createClient } = require('@supabase/supabase-js')

const app = express()

const allowedOrigins = [
  'http://localhost:3001',
  'http://localhost:3000',
  'https://app.k9rehabpro.com',
  process.env.FRONTEND_URL
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true)
    else callback(new Error('Not allowed by CORS'))
  }
}))
app.use(express.json())

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

// ============================================================
// HEALTH CHECK
// ============================================================

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'k9-rehab-api', timestamp: new Date().toISOString() })
})

// ============================================================
// EXERCISES
// ============================================================

// GET /exercises?category=strength&body_region=hindlimb
app.get('/exercises', async (req, res) => {
  let query = supabase.from('exercises').select('*')

  if (req.query.category)    query = query.eq('category', req.query.category)
  if (req.query.body_region) query = query.eq('body_region', req.query.body_region)

  const { data, error } = await query.order('name')
  if (error) return res.status(500).json(error)
  res.json(data)
})

// GET /exercises/:slug
app.get('/exercises/:slug', async (req, res) => {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('slug', req.params.slug)
    .single()

  if (error) return res.status(404).json({ error: 'Exercise not found' })
  res.json(data)
})

// ============================================================
// PROTOCOLS
// ============================================================

// GET /protocols?condition=TPLO
app.get('/protocols', async (req, res) => {
  let query = supabase.from('protocols').select('*')

  if (req.query.condition) query = query.eq('condition', req.query.condition)

  const { data, error } = await query.order('condition')
  if (error) return res.status(500).json(error)
  res.json(data)
})

// GET /protocols/:slug — full protocol with all exercises
app.get('/protocols/:slug', async (req, res) => {
  const { data: protocol, error } = await supabase
    .from('protocols')
    .select('*')
    .eq('slug', req.params.slug)
    .single()

  if (error) return res.status(404).json({ error: 'Protocol not found' })

  const { data: exercises } = await supabase
    .from('protocol_exercises')
    .select('*, exercises(*)')
    .eq('protocol_id', protocol.id)
    .order('week_number')

  res.json({ protocol, exercises })
})

// ============================================================
// CLIENTS
// ============================================================

// GET /clients
app.get('/clients', async (_req, res) => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json(error)
  res.json(data)
})

// GET /clients/:id — client + their active programs
app.get('/clients/:id', async (req, res) => {
  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', req.params.id)
    .single()

  if (error) return res.status(404).json({ error: 'Client not found' })

  const { data: programs } = await supabase
    .from('client_programs')
    .select('*, protocols(*)')
    .eq('client_id', req.params.id)
    .order('start_date', { ascending: false })

  res.json({ client, programs })
})

// POST /clients
app.post('/clients', async (req, res) => {
  const { data, error } = await supabase
    .from('clients')
    .insert([req.body])
    .select()

  if (error) return res.status(500).json(error)
  res.status(201).json(data[0])
})

// ============================================================
// SESSION LOGS
// ============================================================

// POST /sessions — log a completed exercise session
app.post('/sessions', async (req, res) => {
  const { data, error } = await supabase
    .from('session_logs')
    .insert([{
      client_id:    req.body.client_id,
      exercise_id:  req.body.exercise_id,
      completed:    req.body.completed ?? true,
      pain_score:   req.body.pain_score,
      notes:        req.body.notes,
      performed_at: req.body.performed_at || new Date().toISOString()
    }])
    .select()

  if (error) return res.status(500).json(error)
  res.status(201).json(data[0])
})

// GET /clients/:id/sessions — full history for a client
app.get('/clients/:id/sessions', async (req, res) => {
  const { data, error } = await supabase
    .from('session_logs')
    .select('*, exercises(name, category, body_region)')
    .eq('client_id', req.params.id)
    .order('performed_at', { ascending: false })

  if (error) return res.status(500).json(error)
  res.json(data)
})

// ============================================================
// PROTOCOL GENERATOR
// Dr. Millis & Levine evidence-based plan generation
// ============================================================

// POST /generate-plan
// Body: { condition: "TPLO", phase: "weeks_0_2" }
// Returns: full protocol + week-by-week exercise prescriptions
app.post('/generate-plan', async (req, res) => {
  const { condition, phase } = req.body

  if (!condition || !phase)
    return res.status(400).json({ error: 'condition and phase are required' })

  // Find matching protocol
  const { data: protocols } = await supabase
    .from('protocols')
    .select('*')
    .eq('condition', condition)
    .eq('phase', phase)

  if (!protocols || protocols.length === 0)
    return res.status(404).json({
      error: 'No protocol found',
      hint: `Check condition and phase values. Valid phases for TPLO: weeks_0_2, weeks_2_6, weeks_6_10, weeks_10_16`
    })

  const protocol = protocols[0]

  // Fetch exercises with full prescriptions + exercise details
  const { data: exercises } = await supabase
    .from('protocol_exercises')
    .select('*, exercises(*)')
    .eq('protocol_id', protocol.id)
    .order('week_number')

  // Group exercises by week for clean output
  const byWeek = {}
  exercises.forEach(ex => {
    const week = `week_${ex.week_number}`
    if (!byWeek[week]) byWeek[week] = []
    byWeek[week].push({
      exercise:        ex.exercises,
      sets:            ex.sets,
      reps:            ex.reps,
      duration_seconds: ex.duration_seconds,
      frequency_per_day: ex.frequency_per_day,
      notes:           ex.notes
    })
  })

  res.json({
    plan: {
      id:          `PLAN-${Date.now()}`,
      protocol:    protocol.name,
      condition:   protocol.condition,
      phase:       protocol.phase,
      goal:        protocol.goal,
      description: protocol.description,
      generated_at: new Date().toISOString()
    },
    weeks: byWeek,
    exercises_flat: exercises
  })
})

// GET /generate-plan/conditions — list all available conditions
app.get('/generate-plan/conditions', async (_req, res) => {
  const { data, error } = await supabase
    .from('protocols')
    .select('condition, phase, name, goal')
    .order('condition')

  if (error) return res.status(500).json(error)

  // Group by condition
  const grouped = {}
  data.forEach(p => {
    if (!grouped[p.condition]) grouped[p.condition] = []
    grouped[p.condition].push({ phase: p.phase, name: p.name, goal: p.goal })
  })

  res.json(grouped)
})

// ============================================================
// CLINICS
// ============================================================

// GET /clinics
app.get('/clinics', async (_req, res) => {
  const { data, error } = await supabase
    .from('clinics')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json(error)
  res.json(data)
})

// GET /clinics/:id
app.get('/clinics/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('clinics')
    .select('*')
    .eq('id', req.params.id)
    .single()

  if (error) return res.status(404).json({ error: 'Clinic not found' })
  res.json(data)
})

// POST /clinics — create clinic
app.post('/clinics', async (req, res) => {
  const { data, error } = await supabase
    .from('clinics')
    .insert([req.body])
    .select()
    .single()

  if (error) return res.status(500).json(error)
  res.status(201).json(data)
})

// PUT /clinics/:id — update clinic
app.put('/clinics/:id', async (req, res) => {
  const { clinic_name, logo_url, primary_color, secondary_color, contact_email, phone, address } = req.body

  const { data, error } = await supabase
    .from('clinics')
    .update({ clinic_name, logo_url, primary_color, secondary_color, contact_email, phone, address })
    .eq('id', req.params.id)
    .select()
    .single()

  if (error) return res.status(500).json(error)
  res.json(data)
})

// ============================================================
// CLINIC USERS
// ============================================================

// GET /clinics/:id/users
app.get('/clinics/:id/users', async (req, res) => {
  const { data, error } = await supabase
    .from('clinic_users')
    .select('id, role, created_at, user_id')
    .eq('clinic_id', req.params.id)
    .order('created_at')

  if (error) return res.status(500).json(error)
  res.json(data)
})

// POST /clinics/:id/users — add user with role
app.post('/clinics/:id/users', async (req, res) => {
  const { user_id, role } = req.body

  if (!user_id) return res.status(400).json({ error: 'user_id is required' })

  const { data, error } = await supabase
    .from('clinic_users')
    .insert([{ clinic_id: req.params.id, user_id, role: role || 'clinician' }])
    .select()
    .single()

  if (error) return res.status(500).json(error)
  res.status(201).json(data)
})

// DELETE /clinics/:id/users/:userId — remove user from clinic
app.delete('/clinics/:id/users/:userId', async (req, res) => {
  const { error } = await supabase
    .from('clinic_users')
    .delete()
    .eq('clinic_id', req.params.id)
    .eq('user_id', req.params.userId)

  if (error) return res.status(500).json(error)
  res.json({ success: true })
})

// ============================================================
// START
// ============================================================

const PORT = process.env.PORT || 3000
app.listen(PORT, () =>
  console.log(`🐾 K9 Rehab API running on http://localhost:${PORT}`)
)
