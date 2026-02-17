require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

async function seed() {
  // Get protocol IDs
  const { data: protocols } = await supabase.from('protocols').select('id, slug')
  const p = {}
  protocols.forEach(x => p[x.slug] = x.id)
  console.log('Protocols found:', Object.keys(p))

  // Get exercise IDs
  const { data: exercises } = await supabase.from('exercises').select('id, slug')
  const e = {}
  exercises.forEach(x => e[x.slug] = x.id)
  console.log('Exercises found:', exercises.length)

  const rows = []

  // TPLO Weeks 0-2 — Week 1
  const w02 = p['tplo-weeks-0-2']
  if (w02) {
    ;['prom-stifle','cold-therapy','effleurage','massage-thera'].forEach(slug => {
      if (e[slug]) rows.push({ protocol_id: w02, exercise_id: e[slug], week_number: 1, sets: 3, reps: 10, frequency_per_day: 3, notes: 'Gentle passive ROM only. Ice after each session 15 min.' })
    })
    // Week 2
    ;['prom-stifle','prom-hip','cold-therapy','weight-shift'].forEach(slug => {
      if (e[slug]) rows.push({ protocol_id: w02, exercise_id: e[slug], week_number: 2, sets: 3, reps: 10, frequency_per_day: 3, notes: 'Add weight shifting when comfortable. Continue icing.' })
    })
  }

  // TPLO Weeks 2-6 — Week 3
  const w26 = p['tplo-weeks-2-6']
  if (w26) {
    ;['slow-walk','sit-stand','prom-stifle','heat-therapy'].forEach(slug => {
      if (e[slug]) rows.push({ protocol_id: w26, exercise_id: e[slug], week_number: 3, duration_seconds: 300, frequency_per_day: 3, notes: 'Begin 5 min leash walks, increase by 2 min/day.' })
    })
    // Week 4
    ;['sit-stand','slow-walk','curb-walk','cavaletti-rails'].forEach(slug => {
      if (e[slug]) rows.push({ protocol_id: w26, exercise_id: e[slug], week_number: 4, sets: 3, reps: 15, frequency_per_day: 2, notes: 'Add sit-stands. Goal: 15 reps without hesitation.' })
    })
    // Week 5
    ;['figure-8','balance-pad','hill-climb'].forEach(slug => {
      if (e[slug]) rows.push({ protocol_id: w26, exercise_id: e[slug], week_number: 5, sets: 3, reps: 10, frequency_per_day: 2, notes: 'Begin balance work on stable surfaces only.' })
    })
  }

  // TPLO Weeks 6-10 — Week 7
  const w610 = p['tplo-weeks-6-10']
  if (w610) {
    ;['hill-climb','three-leg-stand','stair-climb','cavaletti-rails','figure-8'].forEach(slug => {
      if (e[slug]) rows.push({ protocol_id: w610, exercise_id: e[slug], week_number: 7, sets: 3, reps: 12, frequency_per_day: 2, notes: 'Begin hill work and step exercises. Monitor for gait asymmetry.' })
    })
    // Week 9
    ;['wobble-board','balance-pad','slow-trot','resist-walk'].forEach(slug => {
      if (e[slug]) rows.push({ protocol_id: w610, exercise_id: e[slug], week_number: 9, sets: 3, reps: 12, frequency_per_day: 2, notes: 'Add balance equipment. Begin trotting on lead.' })
    })
  }

  // TPLO Weeks 10-16 — Week 11
  const w1016 = p['tplo-weeks-10-16']
  if (w1016) {
    ;['stair-run','resist-walk','slow-trot','down-stand','hill-climb'].forEach(slug => {
      if (e[slug]) rows.push({ protocol_id: w1016, exercise_id: e[slug], week_number: 11, sets: 4, reps: 15, frequency_per_day: 2, notes: 'Advanced strengthening. Clear for jogging if full weight bearing.' })
    })
    // Week 14
    ;['stair-run','physio-ball','figure-8','backing-up'].forEach(slug => {
      if (e[slug]) rows.push({ protocol_id: w1016, exercise_id: e[slug], week_number: 14, sets: 4, reps: 15, frequency_per_day: 2, notes: 'Sport conditioning phase. Full return to activity if gait normal.' })
    })
  }

  if (rows.length === 0) {
    console.log('No rows to insert — check protocol/exercise slugs above')
    return
  }

  const { data, error } = await supabase
    .from('protocol_exercises')
    .upsert(rows)
    .select()

  if (error) { console.error('Error:', error.message); process.exit(1) }
  console.log('Inserted', data.length, 'protocol_exercises rows')
}

seed()
