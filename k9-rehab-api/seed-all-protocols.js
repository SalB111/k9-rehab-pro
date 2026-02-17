require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

const protocols = [
  // ── TPLO ──────────────────────────────────────────────────────────────
  { slug: 'tplo-weeks-0-2',   name: 'TPLO Post-Op: Weeks 0–2',   condition: 'TPLO', phase: 'weeks_0_2',   goal: 'Reduce swelling, pain control, initiate weight bearing', description: 'Immediate post-surgical phase focusing on inflammation management and gentle tissue healing.' },
  { slug: 'tplo-weeks-2-6',   name: 'TPLO Post-Op: Weeks 2–6',   condition: 'TPLO', phase: 'weeks_2_6',   goal: 'Restore range of motion, begin strengthening', description: 'Progressive rehabilitation building controlled mobility and early strengthening.' },
  { slug: 'tplo-weeks-6-10',  name: 'TPLO Post-Op: Weeks 6–10',  condition: 'TPLO', phase: 'weeks_6_10',  goal: 'Build strength and endurance, improve gait', description: 'Intermediate phase emphasizing functional strength and normalized gait mechanics.' },
  { slug: 'tplo-weeks-10-16', name: 'TPLO Post-Op: Weeks 10–16', condition: 'TPLO', phase: 'weeks_10_16', goal: 'Return to full activity and sport conditioning', description: 'Final phase restoring full function and preparing for return to activity.' },

  // ── TTA ───────────────────────────────────────────────────────────────
  { slug: 'tta-weeks-0-2',   name: 'TTA Post-Op: Weeks 0–2',   condition: 'TTA', phase: 'weeks_0_2',   goal: 'Pain control, reduce swelling, protect repair', description: 'Immediate post-surgical phase with strict activity restriction and swelling management.' },
  { slug: 'tta-weeks-2-6',   name: 'TTA Post-Op: Weeks 2–6',   condition: 'TTA', phase: 'weeks_2_6',   goal: 'Restore joint mobility, early weight bearing', description: 'Gradual return to controlled weight bearing with ROM restoration.' },
  { slug: 'tta-weeks-6-10',  name: 'TTA Post-Op: Weeks 6–10',  condition: 'TTA', phase: 'weeks_6_10',  goal: 'Progressive strengthening, normalize gait', description: 'Strengthening phase targeting quadriceps and hip stabilizers.' },
  { slug: 'tta-weeks-10-16', name: 'TTA Post-Op: Weeks 10–16', condition: 'TTA', phase: 'weeks_10_16', goal: 'Return to full function and sport', description: 'Advanced conditioning and return to unrestricted activity.' },

  // ── FHO ───────────────────────────────────────────────────────────────
  { slug: 'fho-weeks-0-4',   name: 'FHO Post-Op: Weeks 0–4',   condition: 'FHO', phase: 'weeks_0_2',   goal: 'Minimize muscle atrophy, encourage early use', description: 'Early phase focusing on pain control and encouraging limb use to prevent muscle contracture.' },
  { slug: 'fho-weeks-4-8',   name: 'FHO Post-Op: Weeks 4–8',   condition: 'FHO', phase: 'weeks_2_6',   goal: 'Build false joint (pseudarthrosis), improve gait', description: 'Critical phase where scar tissue forms the new functional joint.' },
  { slug: 'fho-weeks-8-12',  name: 'FHO Post-Op: Weeks 8–12',  condition: 'FHO', phase: 'weeks_6_10',  goal: 'Strengthen hip musculature, improve range of motion', description: 'Strengthening phase targeting the muscles that now support the hip without the femoral head.' },
  { slug: 'fho-weeks-12-20', name: 'FHO Post-Op: Weeks 12–20', condition: 'FHO', phase: 'weeks_10_16', goal: 'Full functional return, maximize muscle strength', description: 'Long-term conditioning to maximize outcomes of FHO surgery.' },

  // ── IVDD ──────────────────────────────────────────────────────────────
  { slug: 'ivdd-weeks-0-2',   name: 'IVDD Recovery: Weeks 0–2',   condition: 'IVDD', phase: 'weeks_0_2',   goal: 'Spinal stabilization, pain management, prevent further injury', description: 'Strict rest phase with controlled passive therapy to manage inflammation.' },
  { slug: 'ivdd-weeks-2-6',   name: 'IVDD Recovery: Weeks 2–6',   condition: 'IVDD', phase: 'weeks_2_6',   goal: 'Neurological recovery, controlled mobility', description: 'Careful progression emphasizing proprioceptive retraining and spinal support.' },
  { slug: 'ivdd-weeks-6-10',  name: 'IVDD Recovery: Weeks 6–10',  condition: 'IVDD', phase: 'weeks_6_10',  goal: 'Core strengthening, gait normalization', description: 'Progressive strengthening of spinal stabilizers and hindlimb muscles.' },
  { slug: 'ivdd-weeks-10-16', name: 'IVDD Recovery: Weeks 10–16', condition: 'IVDD', phase: 'weeks_10_16', goal: 'Full neurological and functional recovery', description: 'Advanced rehabilitation restoring full coordination and strength.' },

  // ── HIP DYSPLASIA ─────────────────────────────────────────────────────
  { slug: 'hd-phase-1', name: 'Hip Dysplasia: Phase 1 — Acute Management',    condition: 'HIP_DYSPLASIA', phase: 'weeks_0_2',   goal: 'Pain relief, reduce inflammation, improve mobility', description: 'Manage acute flare-ups and establish baseline pain-free movement.' },
  { slug: 'hd-phase-2', name: 'Hip Dysplasia: Phase 2 — Strengthening',       condition: 'HIP_DYSPLASIA', phase: 'weeks_2_6',   goal: 'Build hip stabilizer strength, improve weight distribution', description: 'Strengthen muscles around the hip to compensate for joint laxity.' },
  { slug: 'hd-phase-3', name: 'Hip Dysplasia: Phase 3 — Functional Training', condition: 'HIP_DYSPLASIA', phase: 'weeks_6_10',  goal: 'Maximize function and quality of life', description: 'Long-term maintenance combining strengthening with low-impact exercise.' },
  { slug: 'hd-phase-4', name: 'Hip Dysplasia: Phase 4 — Maintenance',         condition: 'HIP_DYSPLASIA', phase: 'weeks_10_16', goal: 'Sustain gains, prevent deterioration, lifelong management', description: 'Ongoing maintenance protocol for chronic hip dysplasia management.' },

  // ── ELBOW DYSPLASIA ───────────────────────────────────────────────────
  { slug: 'ed-weeks-0-2',   name: 'Elbow Dysplasia: Weeks 0–2',   condition: 'ELBOW_DYSPLASIA', phase: 'weeks_0_2',   goal: 'Post-surgical protection, swelling control', description: 'Strict forelimb restriction with passive modalities for inflammation control.' },
  { slug: 'ed-weeks-2-6',   name: 'Elbow Dysplasia: Weeks 2–6',   condition: 'ELBOW_DYSPLASIA', phase: 'weeks_2_6',   goal: 'Restore elbow ROM, begin weight bearing', description: 'Gradual restoration of elbow range of motion and forelimb loading.' },
  { slug: 'ed-weeks-6-10',  name: 'Elbow Dysplasia: Weeks 6–10',  condition: 'ELBOW_DYSPLASIA', phase: 'weeks_6_10',  goal: 'Shoulder/elbow strengthening, normalize gait', description: 'Forelimb strengthening with emphasis on proprioception and stability.' },
  { slug: 'ed-weeks-10-16', name: 'Elbow Dysplasia: Weeks 10–16', condition: 'ELBOW_DYSPLASIA', phase: 'weeks_10_16', goal: 'Return to full forelimb function', description: 'Advanced conditioning for complete forelimb functional restoration.' },
]

// Exercise assignments per protocol slug
const assignments = {
  // ── TPLO ──────────────────────────────────────────────────────────────
  'tplo-weeks-0-2':   [
    { slugs: ['prom-stifle','cold-therapy','effleurage','massage-thera'], week: 1, sets: 3, reps: 10, freq: 3, notes: 'Gentle passive ROM only. Ice 15 min after each session.' },
    { slugs: ['prom-stifle','prom-hip','cold-therapy','weight-shift'],    week: 2, sets: 3, reps: 10, freq: 3, notes: 'Add weight shifting when comfortable. Continue icing.' },
  ],
  'tplo-weeks-2-6':   [
    { slugs: ['slow-walk','sit-stand','prom-stifle','heat-therapy'],      week: 3, dur: 300, freq: 3, notes: '5 min leash walks, increase 2 min/day as tolerated.' },
    { slugs: ['sit-stand','slow-walk','curb-walk','cavaletti-rails'],     week: 4, sets: 3, reps: 15, freq: 2, notes: 'Goal: 15 sit-stands without hesitation.' },
    { slugs: ['figure-8','balance-pad','weight-shift','heat-therapy'],    week: 6, sets: 3, reps: 10, freq: 2, notes: 'Begin balance work on stable surfaces only.' },
  ],
  'tplo-weeks-6-10':  [
    { slugs: ['hill-climb','three-leg-stand','stair-climb','cavaletti-rails','figure-8'], week: 7,  sets: 3, reps: 12, freq: 2, notes: 'Begin hill work. Monitor for gait asymmetry.' },
    { slugs: ['wobble-board','balance-pad','slow-trot','resist-walk'],                   week: 9,  sets: 3, reps: 12, freq: 2, notes: 'Add balance equipment. Begin trotting on lead.' },
  ],
  'tplo-weeks-10-16': [
    { slugs: ['stair-run','resist-walk','slow-trot','down-stand','hill-climb'], week: 11, sets: 4, reps: 15, freq: 2, notes: 'Advanced strengthening. Clear for jogging if full WB.' },
    { slugs: ['stair-run','physio-ball','figure-8','backing-up'],               week: 14, sets: 4, reps: 15, freq: 2, notes: 'Sport conditioning. Full return if gait normal.' },
  ],

  // ── TTA ───────────────────────────────────────────────────────────────
  'tta-weeks-0-2':   [
    { slugs: ['prom-stifle','cold-therapy','effleurage','massage-thera'], week: 1, sets: 3, reps: 10, freq: 3, notes: 'Passive therapy only. Ice 15 min after every session.' },
    { slugs: ['prom-stifle','prom-hip','weight-shift','cold-therapy'],   week: 2, sets: 3, reps: 10, freq: 3, notes: 'Introduce gentle weight shifting end of week 2.' },
  ],
  'tta-weeks-2-6':   [
    { slugs: ['slow-walk','sit-stand','heat-therapy','prom-stifle'],    week: 3, dur: 300, freq: 3, notes: 'Begin 5 min leash walks. Heat before exercise.' },
    { slugs: ['curb-walk','cavaletti-rails','sit-stand','figure-8'],    week: 5, sets: 3, reps: 12, freq: 2, notes: 'Add obstacle work when full weight bearing.' },
  ],
  'tta-weeks-6-10':  [
    { slugs: ['three-leg-stand','hill-climb','cavaletti-rails','stair-climb','wobble-board'], week: 7, sets: 3, reps: 12, freq: 2, notes: 'Strengthen quadriceps with hill and step work.' },
    { slugs: ['slow-trot','balance-pad','resist-walk','figure-8'],                            week: 9, sets: 3, reps: 12, freq: 2, notes: 'Begin trot work. Watch for compensatory movement.' },
  ],
  'tta-weeks-10-16': [
    { slugs: ['stair-run','slow-trot','resist-walk','hill-climb','physio-ball'], week: 11, sets: 4, reps: 15, freq: 2, notes: 'Advanced sport conditioning phase.' },
    { slugs: ['stair-run','backing-up','down-stand','figure-8'],                 week: 14, sets: 4, reps: 15, freq: 2, notes: 'Full return to activity if gait symmetric.' },
  ],

  // ── FHO ───────────────────────────────────────────────────────────────
  'fho-weeks-0-4':   [
    { slugs: ['prom-hip','cold-therapy','effleurage','massage-thera'], week: 1, sets: 3, reps: 10, freq: 3, notes: 'Focus on hip flexion/extension ROM. Minimize atrophy.' },
    { slugs: ['prom-hip','weight-shift','slow-walk','cold-therapy'],   week: 3, dur: 180, freq: 3, notes: 'Short leash walks. Encourage use of limb immediately.' },
  ],
  'fho-weeks-4-8':   [
    { slugs: ['slow-walk','sit-stand','heat-therapy','cavaletti-rails'], week: 5, dur: 300, freq: 3, notes: 'Extend walks. Pseudarthrosis formation phase.' },
    { slugs: ['sit-stand','figure-8','curb-walk','balance-pad'],         week: 7, sets: 3, reps: 12, freq: 2, notes: 'Muscle sling development critical — maximize hip use.' },
  ],
  'fho-weeks-8-12':  [
    { slugs: ['hill-climb','three-leg-stand','wobble-board','cavaletti-rails','prom-hip'], week: 9,  sets: 3, reps: 12, freq: 2, notes: 'Strengthen glutes and hip stabilizers aggressively.' },
    { slugs: ['slow-trot','balance-pad','figure-8','resist-walk'],                         week: 11, sets: 3, reps: 12, freq: 2, notes: 'Increase cardiovascular load. Check for lameness.' },
  ],
  'fho-weeks-12-20': [
    { slugs: ['hill-climb','physio-ball','slow-trot','resist-walk','down-stand'], week: 13, sets: 4, reps: 15, freq: 2, notes: 'Long-term strengthening. Outcomes improve up to 6 months.' },
    { slugs: ['underwater-tread','wobble-board','stair-run','backing-up'],         week: 17, sets: 4, reps: 15, freq: 2, notes: 'Hydrotherapy ideal for long-term FHO maintenance.' },
  ],

  // ── IVDD ──────────────────────────────────────────────────────────────
  'ivdd-weeks-0-2':   [
    { slugs: ['cold-therapy','massage-thera','effleurage','prom-stifle'],       week: 1, sets: 3, reps: 8,  freq: 3, notes: 'Strict crate rest. Passive therapy only. No jumping.' },
    { slugs: ['cold-therapy','heat-therapy','massage-thera','weight-shift'],    week: 2, sets: 2, reps: 8,  freq: 3, notes: 'Add gentle weight shifting only if neurologically stable.' },
  ],
  'ivdd-weeks-2-6':   [
    { slugs: ['slow-walk','surface-change','cavaletti-rails','heat-therapy'],   week: 3, dur: 180, freq: 3, notes: 'Short controlled walks on varied surfaces for proprio.' },
    { slugs: ['slow-walk','balance-pad','sit-stand','wobble-board'],            week: 5, sets: 3, reps: 10, freq: 2, notes: 'Begin proprioceptive training. Assess neurological status weekly.' },
  ],
  'ivdd-weeks-6-10':  [
    { slugs: ['cavaletti-rails','three-leg-stand','figure-8','balance-pad','sit-stand-wall'], week: 7,  sets: 3, reps: 12, freq: 2, notes: 'Core and spinal stabilizer strengthening.' },
    { slugs: ['slow-trot','wobble-board','uneven-terrain','backing-up'],                      week: 9,  sets: 3, reps: 12, freq: 2, notes: 'Neurological retraining on challenging surfaces.' },
  ],
  'ivdd-weeks-10-16': [
    { slugs: ['hill-climb','physio-ball','slow-trot','resist-walk','cavaletti-rails'], week: 11, sets: 4, reps: 12, freq: 2, notes: 'Full rehabilitation. Monitor for recurrence signs.' },
    { slugs: ['underwater-tread','balance-pad','figure-8','backing-up'],               week: 14, sets: 4, reps: 12, freq: 2, notes: 'Hydrotherapy excellent for IVDD long-term management.' },
  ],

  // ── HIP DYSPLASIA ─────────────────────────────────────────────────────
  'hd-phase-1': [
    { slugs: ['cold-therapy','heat-therapy','massage-thera','prom-hip'],         week: 1, sets: 3, reps: 8,  freq: 3, notes: 'Pain relief priority. Ice after exercise 15 min.' },
    { slugs: ['slow-walk','weight-shift','prom-hip','effleurage'],               week: 2, dur: 300, freq: 3, notes: 'Short walks on soft surfaces. Avoid stairs and jumping.' },
  ],
  'hd-phase-2': [
    { slugs: ['hill-climb','sit-stand','cavaletti-rails','three-leg-stand'],      week: 3, sets: 3, reps: 12, freq: 2, notes: 'Build gluteal and hip stabilizer strength.' },
    { slugs: ['underwater-tread','balance-pad','sit-stand-wall','figure-8'],      week: 5, sets: 3, reps: 12, freq: 2, notes: 'Hydrotherapy ideal — reduces load while strengthening.' },
  ],
  'hd-phase-3': [
    { slugs: ['hill-climb','wobble-board','slow-trot','physio-ball','resist-walk'], week: 7, sets: 3, reps: 12, freq: 2, notes: 'Maximize functional capacity. Lifelong management.' },
    { slugs: ['underwater-tread','pool-swim','cavaletti-rails','balance-pad'],       week: 9, sets: 3, reps: 12, freq: 2, notes: 'Swimming excellent for HD — non-weight bearing cardio.' },
  ],
  'hd-phase-4': [
    { slugs: ['slow-walk','underwater-tread','heat-therapy','massage-thera','gentle-prom'], week: 11, sets: 3, reps: 10, freq: 3, notes: 'Maintenance protocol. Adjust frequency per pain levels.' },
    { slugs: ['pool-swim','balance-pad','hill-climb','cavaletti-rails'],                     week: 14, sets: 3, reps: 10, freq: 2, notes: 'Lifelong hydrotherapy + strengthening for best outcomes.' },
  ],

  // ── ELBOW DYSPLASIA ───────────────────────────────────────────────────
  'ed-weeks-0-2':   [
    { slugs: ['cold-therapy','effleurage','massage-thera','prom-stifle'],         week: 1, sets: 3, reps: 8,  freq: 3, notes: 'Forelimb rest. Cold therapy 3x daily. Passive ROM only.' },
    { slugs: ['cold-therapy','heat-therapy','weight-shift','massage-thera'],      week: 2, sets: 2, reps: 8,  freq: 3, notes: 'Gentle forelimb weight shifting if pain controlled.' },
  ],
  'ed-weeks-2-6':   [
    { slugs: ['slow-walk','curb-walk','heat-therapy','stretch-quad'],             week: 3, dur: 300, freq: 3, notes: 'Short leash walks. Heat before exercise, ice after.' },
    { slugs: ['cavaletti-rails','figure-8','sit-stand','balance-pad'],            week: 5, sets: 3, reps: 12, freq: 2, notes: 'Proprioception training for forelimb stability.' },
  ],
  'ed-weeks-6-10':  [
    { slugs: ['wobble-board','wheel-barrel','cavaletti-rails','hill-climb','three-leg-stand'], week: 7,  sets: 3, reps: 12, freq: 2, notes: 'Shoulder and elbow strengthening. Wheelbarrow builds forelimb muscle.' },
    { slugs: ['slow-trot','balance-pad','figure-8','uneven-terrain'],                          week: 9,  sets: 3, reps: 12, freq: 2, notes: 'Proprioceptive and gait retraining.' },
  ],
  'ed-weeks-10-16': [
    { slugs: ['resist-walk','slow-trot','physio-ball','hill-climb','wobble-board'], week: 11, sets: 4, reps: 12, freq: 2, notes: 'Advanced forelimb conditioning.' },
    { slugs: ['underwater-tread','figure-8','backing-up','cavaletti-rails'],        week: 14, sets: 4, reps: 12, freq: 2, notes: 'Hydrotherapy maintains elbow ROM long-term.' },
  ],
}

async function seed() {
  // Upsert protocols
  const { data: protos, error: pe } = await supabase
    .from('protocols')
    .upsert(protocols, { onConflict: 'slug' })
    .select('id, slug')
  if (pe) { console.error('Protocol error:', pe.message); process.exit(1) }
  console.log('Protocols upserted:', protos.length)

  const protoMap = {}
  protos.forEach(p => protoMap[p.slug] = p.id)

  // Get exercise slugs → ids
  const { data: exRows } = await supabase.from('exercises').select('id, slug')
  const exMap = {}
  exRows.forEach(e => exMap[e.slug] = e.id)

  // Build protocol_exercises rows
  const rows = []
  for (const [protoSlug, groups] of Object.entries(assignments)) {
    const protoId = protoMap[protoSlug]
    if (!protoId) { console.warn('Missing protocol:', protoSlug); continue }

    for (const g of groups) {
      for (const slug of g.slugs) {
        const exId = exMap[slug]
        if (!exId) { console.warn('Missing exercise slug:', slug); continue }
        rows.push({
          protocol_id:       protoId,
          exercise_id:       exId,
          week_number:       g.week,
          sets:              g.sets  || null,
          reps:              g.reps  || null,
          duration_seconds:  g.dur   || null,
          frequency_per_day: g.freq  || null,
          notes:             g.notes || null,
        })
      }
    }
  }

  // Delete existing protocol_exercises and re-insert fresh
  const protoIds = Object.values(protoMap)
  await supabase.from('protocol_exercises').delete().in('protocol_id', protoIds)

  const batchSize = 50
  let total = 0
  for (let i = 0; i < rows.length; i += batchSize) {
    const { data, error } = await supabase
      .from('protocol_exercises')
      .insert(rows.slice(i, i + batchSize))
      .select('id')
    if (error) { console.error('PE error:', error.message); process.exit(1) }
    total += data.length
  }

  console.log(`Protocol exercises inserted: ${total}`)
  console.log('\nAll conditions seeded:')
  Object.keys(assignments).forEach(s => console.log(' ', s))
}

seed()
