require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

// Load all 195 exercises from old backend
const path = require('path')
const all = require(path.join(__dirname, '../backend/all-exercises'))
let exercises = Array.isArray(all) ? all : (all.COMPLETE_EXERCISES || Object.values(all)[0] || [])

const toSlug = (code) => String(code).toLowerCase().replace(/_/g, '-')
const toArr  = (v) => Array.isArray(v) ? v : (v ? [String(v)] : [])

const rows = exercises.map(ex => ({
  slug:              toSlug(ex.code || ex.slug || ex.name),
  name:              ex.name,
  category:          ex.category,
  description:       ex.description || '',
  difficulty:        ex.difficulty_level || ex.difficulty || 'Moderate',
  body_region:       ex.clinical_classification?.body_region || 'multi',
  equipment:         toArr(ex.equipment),
  setup:             ex.setup            || null,
  steps:             toArr(ex.steps),
  good_form:         toArr(ex.good_form),
  common_mistakes:   toArr(ex.common_mistakes),
  red_flags:         toArr(ex.red_flags),
  progression:       ex.progression      || null,
  contraindications: typeof ex.contraindications === 'string'
                       ? ex.contraindications.split(',').map(s => s.trim()).filter(Boolean)
                       : Array.isArray(ex.contraindications)
                         ? ex.contraindications
                         : [],
  evidence_grade: ex.evidence_base?.grade || null,
  evidence_refs:  Array.isArray(ex.evidence_base?.references)
                    ? ex.evidence_base.references.map(r => ({
                        id:             r.id            || null,
                        citation:       r.citation      || null,
                        type:           r.type          || 'Journal',
                        evidence_grade: r.evidence_grade|| null,
                        key_findings:   r.key_findings  || null,
                        topics:         r.topics        || [],
                        url:            r.url           || null,
                      }))
                    : [],
}))

async function migrate() {
  console.log(`Migrating ${rows.length} exercises...`)

  // Upsert in batches of 50 to avoid request size limits
  const batchSize = 50
  let total = 0

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    const { data, error } = await supabase
      .from('exercises')
      .upsert(batch, { onConflict: 'slug' })
      .select('slug')

    if (error) {
      console.error(`Batch ${i / batchSize + 1} error:`, error.message)
      process.exit(1)
    }
    total += data.length
    console.log(`  Batch ${i / batchSize + 1}: ${data.length} exercises ✓`)
  }

  console.log(`\nDone! ${total} exercises migrated with full clinical data.`)

  // Quick verify
  const { data: sample } = await supabase
    .from('exercises')
    .select('name, steps, red_flags, contraindications')
    .limit(1)
    .single()

  console.log('\nSample exercise verify:')
  console.log('  Name:', sample.name)
  console.log('  Steps:', sample.steps?.length, 'steps')
  console.log('  Red flags:', sample.red_flags?.length, 'flags')
  console.log('  Contraindications:', sample.contraindications?.slice(0, 60))
}

migrate()
