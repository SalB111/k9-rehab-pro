require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

async function verify() {
  const slugs = ['prom-stifle', 'cold-therapy', 'sit-stand', 'underwater-tread', 'laser-iv', 'dachshund-back']
  const { data, error } = await supabase
    .from('exercises')
    .select('name, evidence_grade, evidence_refs')
    .in('slug', slugs)

  if (error) { console.error(error.message); process.exit(1) }
  data.forEach(ex => {
    const refs = ex.evidence_refs || []
    console.log(`\n${ex.name}`)
    console.log(`  Grade: ${ex.evidence_grade}`)
    console.log(`  Refs: ${refs.length}`)
    refs.forEach(r => {
      console.log(`    [${r.type}] ${r.citation ? r.citation.slice(0,70) : '—'}`)
      console.log(`    URL: ${r.url || 'MISSING'}`)
    })
  })
}

verify()
