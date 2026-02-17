require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

const exercises = [
  { slug: 'prom-stifle', name: 'Passive Range of Motion - Stifle', category: 'Passive Therapy', description: 'Gentle manual manipulation of the stifle joint to maintain joint mobility.', difficulty: 'Easy', body_region: 'multi' },
  { slug: 'prom-hip', name: 'Passive Range of Motion - Hip', category: 'Passive Therapy', description: 'Manual hip joint mobilization to maintain flexion/extension and prevent contracture.', difficulty: 'Easy', body_region: 'multi' },
  { slug: 'massage-thera', name: 'Therapeutic Massage', category: 'Passive Therapy', description: 'Manual soft tissue mobilization to reduce muscle tension and improve circulation.', difficulty: 'Easy', body_region: 'multi' },
  { slug: 'cold-therapy', name: 'Cryotherapy (Cold Therapy)', category: 'Passive Therapy', description: 'Application of cold to reduce inflammation, pain, and muscle spasm.', difficulty: 'Easy', body_region: 'multi' },
  { slug: 'heat-therapy', name: 'Thermotherapy (Heat Therapy)', category: 'Passive Therapy', description: 'Application of heat to increase tissue extensibility and reduce pain before activity.', difficulty: 'Easy', body_region: 'multi' },
  { slug: 'stretch-quad', name: 'Quadriceps Stretch', category: 'Passive Therapy', description: 'Passive stretching of quadriceps to maintain stifle flexion range.', difficulty: 'Easy', body_region: 'multi' },
  { slug: 'stretch-hams', name: 'Hamstring Stretch', category: 'Passive Therapy', description: 'Passive stretching of hamstring group to improve hip flexion range.', difficulty: 'Easy', body_region: 'multi' },
  { slug: 'effleurage', name: 'Lymphatic Effleurage', category: 'Passive Therapy', description: 'Light stroking massage to promote lymphatic drainage and reduce swelling.', difficulty: 'Easy', body_region: 'multi' },
  { slug: 'sit-stand', name: 'Sit-to-Stand Transitions', category: 'Active Assisted', description: 'Controlled sitting and standing to strengthen hindlimb muscles and improve weight-bearing.', difficulty: 'Easy', body_region: 'multi' },
  { slug: 'weight-shift', name: 'Weight Shifting Exercises', category: 'Active Assisted', description: 'Dynamic weight transfer exercises to improve balance, proprioception, and limb loading.', difficulty: 'Easy', body_region: 'multi' },
  { slug: 'slow-walk', name: 'Controlled Slow Walking', category: 'Active Assisted', description: 'Deliberate slow-paced walking to promote proper gait mechanics and weight bearing.', difficulty: 'Easy', body_region: 'multi' },
  { slug: 'stand-tall', name: 'Standing Tall (Rear Leg Dance)', category: 'Active Assisted', description: 'Rear limb strengthening with forelimbs elevated on surface.', difficulty: 'Moderate', body_region: 'multi' },
  { slug: 'curb-walk', name: 'Curb/Step Walking', category: 'Active Assisted', description: 'Walking up and down small curbs to improve joint flexion and strength.', difficulty: 'Moderate', body_region: 'multi' },
  { slug: 'figure-8', name: 'Figure-Eight Walking', category: 'Active Assisted', description: 'Walking in figure-eight pattern to promote lateral flexion and proprioception.', difficulty: 'Moderate', body_region: 'multi' },
  { slug: 'backing-up', name: 'Backing Up Exercise', category: 'Active Assisted', description: 'Controlled backward walking to engage different muscle groups.', difficulty: 'Moderate', body_region: 'multi' },
  { slug: 'side-step', name: 'Side-Stepping (Lateral Walking)', category: 'Active Assisted', description: 'Lateral movement to strengthen hip abductors/adductors and improve lateral balance.', difficulty: 'Moderate', body_region: 'multi' },
  { slug: 'slow-trot', name: 'Controlled Slow Trot', category: 'Active Assisted', description: 'Progression to slow trotting gait to increase cardiovascular demand and strength.', difficulty: 'Moderate', body_region: 'multi' },
  { slug: 'stair-climb', name: 'Stair Climbing (Assisted)', category: 'Active Assisted', description: 'Controlled stair ascent/descent to build hindlimb strength and joint ROM.', difficulty: 'Advanced', body_region: 'multi' },
  { slug: 'three-leg-stand', name: 'Three-Legged Standing', category: 'Strengthening', description: 'Isometric strengthening holding weight on three legs while one limb is lifted.', difficulty: 'Moderate', body_region: 'multi' },
  { slug: 'cavaletti-rails', name: 'Cavaletti Rails', category: 'Strengthening', description: 'Walking over raised poles to improve joint flexion, proprioception, and coordination.', difficulty: 'Moderate', body_region: 'multi' },
  { slug: 'sit-stand-wall', name: 'Sit-Stands Against Wall', category: 'Strengthening', description: 'Sit-stand transitions with rear against wall to ensure proper form.', difficulty: 'Moderate', body_region: 'multi' },
  { slug: 'hill-climb', name: 'Hill Walking (Uphill)', category: 'Strengthening', description: 'Walking up inclines to build hindlimb strength and cardiovascular fitness.', difficulty: 'Advanced', body_region: 'multi' },
  { slug: 'down-stand', name: 'Down-to-Stand Transitions', category: 'Strengthening', description: 'Moving from down position to standing to strengthen all limbs and core.', difficulty: 'Advanced', body_region: 'multi' },
  { slug: 'wheel-barrel', name: 'Wheelbarrow Walking', category: 'Strengthening', description: 'Walking on forelimbs only with hindlimbs supported to strengthen shoulders and core.', difficulty: 'Advanced', body_region: 'multi' },
  { slug: 'stair-run', name: 'Stair Running (Advanced)', category: 'Strengthening', description: 'Dynamic stair climbing at faster pace for advanced strengthening and power.', difficulty: 'Advanced', body_region: 'multi' },
  { slug: 'resist-walk', name: 'Resisted Walking', category: 'Strengthening', description: 'Walking against resistance to build muscular strength and endurance.', difficulty: 'Advanced', body_region: 'multi' },
  { slug: 'wobble-board', name: 'Wobble Board Training', category: 'Balance & Proprioception', description: 'Standing on unstable platform to improve balance, proprioception, and core stability.', difficulty: 'Moderate', body_region: 'multi' },
  { slug: 'balance-pad', name: 'Balance Pad Exercises', category: 'Balance & Proprioception', description: 'Exercises on foam pad to challenge balance and proprioception.', difficulty: 'Moderate', body_region: 'multi' },
  { slug: 'physio-ball', name: 'Physioball (Peanut Ball) Exercises', category: 'Balance & Proprioception', description: 'Core strengthening and balance training using inflatable peanut-shaped ball.', difficulty: 'Advanced', body_region: 'multi' },
  { slug: 'uneven-terrain', name: 'Uneven Terrain Walking', category: 'Balance & Proprioception', description: 'Walking on varied surfaces to challenge proprioception and balance reactions.', difficulty: 'Moderate', body_region: 'multi' },
  { slug: 'perturbation', name: 'Perturbation Training', category: 'Balance & Proprioception', description: 'Gentle unexpected balance challenges to improve reactive balance responses.', difficulty: 'Advanced', body_region: 'multi' },
  { slug: 'surface-change', name: 'Surface Transition Exercise', category: 'Balance & Proprioception', description: 'Walking across different surface types to improve proprioceptive adaptation.', difficulty: 'Moderate', body_region: 'multi' },
  { slug: 'slow-pivot', name: 'Slow Pivot Turns', category: 'Balance & Proprioception', description: 'Rotating in place to improve proprioception, balance, and coordination.', difficulty: 'Moderate', body_region: 'multi' },
  { slug: 'underwater-tread', name: 'Underwater Treadmill Walking', category: 'Aquatic Therapy', description: 'Walking on submerged treadmill for low-impact strengthening and range of motion.', difficulty: 'Moderate', body_region: 'multi' },
  { slug: 'pool-swim', name: 'Therapeutic Swimming', category: 'Aquatic Therapy', description: 'Free swimming for cardiovascular fitness and full-body strengthening.', difficulty: 'Moderate', body_region: 'multi' },
  { slug: 'water-walking', name: 'Shallow Water Walking', category: 'Aquatic Therapy', description: 'Walking in shallow water for gentle resistance training.', difficulty: 'Moderate', body_region: 'multi' },
  { slug: 'aqua-jog', name: 'Aqua Jogging', category: 'Aquatic Therapy', description: 'Jogging in chest-deep water for advanced cardiovascular and strengthening work.', difficulty: 'Advanced', body_region: 'multi' },
  { slug: 'car-entry', name: 'Car Entry/Exit Practice', category: 'Functional Training', description: 'Practicing getting in and out of vehicles safely to restore functional independence.', difficulty: 'Moderate', body_region: 'multi' },
  { slug: 'play-bow', name: 'Play Bow Stretch', category: 'Functional Training', description: 'Natural play bow position for shoulder stretching and functional movement.', difficulty: 'Easy', body_region: 'multi' },
  { slug: 'couch-on-off', name: 'Furniture Climbing (Couch/Bed)', category: 'Functional Training', description: 'Getting on and off furniture safely to restore normal household function.', difficulty: 'Moderate', body_region: 'multi' },
  { slug: 'uwtt-forward', name: 'Underwater Treadmill - Forward Walking', category: 'Hydrotherapy', description: 'Controlled forward walking in underwater treadmill for cardiovascular conditioning.', difficulty: 'Moderate', body_region: 'multi' },
  { slug: 'uwtt-backward', name: 'Underwater Treadmill - Backward Walking', category: 'Hydrotherapy', description: 'Backward walking in UWTM to activate hip extensors and increase stifle flexion.', difficulty: 'Advanced', body_region: 'multi' },
  { slug: 'uwtt-lateral', name: 'Underwater Treadmill - Lateral Walking', category: 'Hydrotherapy', description: 'Side-stepping in UWTM to strengthen hip abductors/adductors.', difficulty: 'Advanced', body_region: 'multi' },
  { slug: 'wading-walk', name: 'Shallow Water Wading', category: 'Hydrotherapy', description: 'Walking in shallow water for gentle weight bearing reduction.', difficulty: 'Easy', body_region: 'multi' },
  { slug: 'aqua-cavaletti', name: 'Submerged Cavaletti Walking', category: 'Hydrotherapy', description: 'Walking over submerged poles to enhance limb flexion and proprioception.', difficulty: 'Moderate', body_region: 'multi' },
  { slug: 'tens-therapy', name: 'TENS Therapy', category: 'Therapeutic Modalities', description: 'Electrical current to modulate pain and promote muscle re-education.', difficulty: 'Moderate', body_region: 'multi' },
  { slug: 'laser-iv', name: 'Class IV Laser Therapy', category: 'Therapeutic Modalities', description: 'High-powered laser to reduce pain, inflammation, and accelerate tissue healing.', difficulty: 'Moderate', body_region: 'multi' },
  { slug: 'pemf-therapy', name: 'PEMF Therapy', category: 'Therapeutic Modalities', description: 'Electromagnetic fields to enhance bone healing and reduce inflammation.', difficulty: 'Easy', body_region: 'multi' },
  { slug: 'us-pulsed', name: 'Therapeutic Ultrasound (Pulsed)', category: 'Therapeutic Modalities', description: 'Pulsed ultrasound to promote tissue healing without thermal effects.', difficulty: 'Moderate', body_region: 'multi' },
  { slug: 'joint-mob-g1', name: 'Joint Mobilization - Grade I', category: 'Manual Therapy', description: 'Small amplitude oscillatory movements to reduce pain through mechanoreceptor stimulation.', difficulty: 'Moderate', body_region: 'multi' },
  { slug: 'joint-mob-g2', name: 'Joint Mobilization - Grade II', category: 'Manual Therapy', description: 'Large amplitude oscillations within available range to reduce pain and improve joint play.', difficulty: 'Moderate', body_region: 'multi' },
  { slug: 'myofasc-ilio', name: 'Myofascial Release - Iliopsoas', category: 'Manual Therapy', description: 'Sustained pressure to release hip flexor tension and improve hip extension.', difficulty: 'Advanced', body_region: 'multi' },
  { slug: 'gentle-prom', name: 'Geriatric-Adapted Passive ROM', category: 'Geriatric Care', description: 'Extra gentle passive ROM adapted for geriatric patients with arthritis.', difficulty: 'Easy', body_region: 'multi' },
  { slug: 'senior-walk', name: 'Slow Controlled Leash Walking', category: 'Geriatric Care', description: 'Short, frequent walking sessions tailored to geriatric mobility limitations.', difficulty: 'Easy', body_region: 'multi' },
  { slug: 'ramp-training', name: 'Ramp Training for Mobility', category: 'Geriatric Care', description: 'Teaching safe ramp use to reduce jump stress on joints.', difficulty: 'Easy', body_region: 'multi' },
  { slug: 'heat-therapy-geri', name: 'Therapeutic Heat Application', category: 'Geriatric Care', description: 'Moist heat therapy to reduce muscle tension before exercise.', difficulty: 'Easy', body_region: 'multi' },
  { slug: 'cold-therapy-geri', name: 'Therapeutic Cold Application', category: 'Geriatric Care', description: 'Cryotherapy for managing inflammation in geriatric arthritis flare-ups.', difficulty: 'Easy', body_region: 'multi' },
  { slug: 'bedding-exercise', name: 'Therapeutic Bed Positioning', category: 'Geriatric Care', description: 'Orthopedic bedding and positioning to maintain joint alignment during rest.', difficulty: 'Easy', body_region: 'multi' }
]

async function seed() {
  console.log('Seeding', exercises.length, 'exercises...')
  const { data, error } = await supabase
    .from('exercises')
    .upsert(exercises, { onConflict: 'slug' })
    .select()
  if (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
  console.log('Done! Inserted/updated', data.length, 'exercises')
}

seed()
