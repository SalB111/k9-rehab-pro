// ============================================================================
// ENHANCED SERVER - K9-REHAB-PRO
// Supporting futuristic frontend with grouped conditions and full exercises
// ============================================================================

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { selectExercisesForWeek, PROTOCOL_DEFINITIONS, validateIntake, getExcludedCodes } = require('./protocol-generator'); // ✅ ACVSMR-aligned 4-protocol system
const { ALL_EXERCISES, getExerciseByCode, searchExercises } = require('./all-exercises');
const { INTERVENTION_TYPES, REHAB_PHASES, PRIMARY_INDICATIONS } = require('./exercise-taxonomy');
const {
  VIDEO_LIBRARY,
  INSTRUCTORS,
  getVideosByExerciseCode,
  getInstructorById,
  getExercisesWithVideos,
  getVideosByInstructor,
  getVideoStats
} = require('./video-references');
const {
  getStoryboardByCode,
  getStoryboardFrames,
  getStoryboardScript,
  getExercisesWithStoryboards,
  getStoryboardStats
} = require('./storyboard-references');
const {
  initializeDatabase: initDB,
  seedExerciseLibrary,
  ExerciseLibraryDB
} = require('./database');
const {
  getExerciseSlugsForPhase,
  getAvailableConditions,
  getPhasesForCondition
} = require('./protocol-rules');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================================================
// AUDIT LOG — Must-Have #8: Compliance audit trail
// ============================================================================

function logAudit(db, entry) {
  const { action, resource_type, resource_id, user_label, ip_address,
          request_method, request_path, status_code, detail } = entry;
  db.run(
    `INSERT INTO audit_log (action, resource_type, resource_id, user_label,
      ip_address, request_method, request_path, status_code, detail)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [action, resource_type || null, resource_id || null, user_label || 'system',
     ip_address || null, request_method || null, request_path || null,
     status_code || null, detail || null],
    (err) => { if (err) console.error('Audit log write error:', err); }
  );
}

// Audit middleware — logs all mutating API requests (POST, PUT, DELETE)
app.use('/api', (req, res, next) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    const originalJson = res.json.bind(res);
    res.json = function(body) {
      // Only access db if it's initialized (declared below)
      if (typeof db !== 'undefined') {
        logAudit(db, {
          action: `${req.method} ${req.path}`,
          resource_type: req.path.split('/').filter(Boolean)[1] || 'unknown',
          user_label: req.headers['x-user-label'] || 'clinician',
          ip_address: req.ip,
          request_method: req.method,
          request_path: req.originalUrl,
          status_code: res.statusCode,
          detail: body?.error ? `Error: ${body.error}` : (body?.message || 'OK')
        });
      }
      return originalJson(body);
    };
  }
  next();
});

// Database setup
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ Connected to SQLite database');
    initializeDatabase();
    // Initialize new exercise library v2.0
    initDB().then(() => seedExerciseLibrary()).catch(err => console.error('❌ Exercise library initialization error:', err));
  }
});

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

function initializeDatabase() {
  // Create tables
  db.serialize(() => {
    // Patients table
    db.run(`
      CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        breed TEXT NOT NULL,
        age REAL NOT NULL,
        weight REAL NOT NULL,
        sex TEXT,
        condition TEXT NOT NULL,
        affected_region TEXT,
        surgery_date TEXT,
        lameness_grade INTEGER DEFAULT 0,
        body_condition_score INTEGER DEFAULT 5,
        pain_level INTEGER DEFAULT 5,
        mobility_level INTEGER DEFAULT 5,
        current_medications TEXT,
        medical_history TEXT,
        special_instructions TEXT,
        client_name TEXT,
        client_email TEXT,
        client_phone TEXT,
        referring_vet TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Exercises table (enhanced)
    db.run(`
      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        equipment TEXT,
        setup TEXT,
        steps TEXT,
        good_form TEXT,
        common_mistakes TEXT,
        red_flags TEXT,
        progression TEXT,
        contraindications TEXT,
        difficulty_level TEXT DEFAULT 'Moderate',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Conditions table (enhanced with grouping)
    db.run(`
      CREATE TABLE IF NOT EXISTS conditions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        severity TEXT,
        description TEXT,
        typical_recovery_weeks INTEGER DEFAULT 8,
        recommended_exercises TEXT,
        contraindicated_exercises TEXT,
        special_considerations TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Protocols table
    db.run(`
      CREATE TABLE IF NOT EXISTS protocols (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER,
        protocol_data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id)
      )
    `);

    console.log('✅ Database tables initialized');
    seedInitialData();
  });
}

// ============================================================================
// SEED INITIAL DATA
// ============================================================================

function seedInitialData() {
  // Check if conditions exist
  db.get('SELECT COUNT(*) as count FROM conditions', (err, row) => {
    if (row && row.count === 0) {
      console.log('🌱 Seeding initial conditions...');
      seedConditions();
    }
  });

  // Check if exercises exist
  db.get('SELECT COUNT(*) as count FROM exercises', (err, row) => {
    if (row && row.count === 0) {
      console.log('🌱 Seeding initial exercises...');
      seedExercises();
    }
  });
}

function seedConditions() {
  const conditions = [
    // Stifle (Knee)
    { code: 'CCL_CONSERV', name: 'CCL Rupture - Conservative', category: 'Stifle (Knee)', severity: 'Moderate', recovery: 12 },
    { code: 'POST_TPLO', name: 'Post-Op TPLO', category: 'Stifle (Knee)', severity: 'Surgical', recovery: 12 },
    { code: 'POST_TTA', name: 'Post-Op TTA', category: 'Stifle (Knee)', severity: 'Surgical', recovery: 12 },
    { code: 'POST_LATERAL', name: 'Post-Op Lateral Suture', category: 'Stifle (Knee)', severity: 'Surgical', recovery: 10 },
    { code: 'PATELLA_LUX', name: 'Patellar Luxation (Grade 1-2)', category: 'Stifle (Knee)', severity: 'Mild-Moderate', recovery: 8 },
    { code: 'POST_PATELLA', name: 'Post-Op Patellar Repair', category: 'Stifle (Knee)', severity: 'Surgical', recovery: 10 },
    
    // Hip
    { code: 'HIP_DYSPLASIA', name: 'Hip Dysplasia', category: 'Hip', severity: 'Moderate-Severe', recovery: 12 },
    { code: 'POST_FHO', name: 'Post-Op FHO', category: 'Hip', severity: 'Surgical', recovery: 10 },
    { code: 'POST_THR', name: 'Post-Op Total Hip Replacement', category: 'Hip', severity: 'Surgical', recovery: 12 },
    { code: 'HIP_OA', name: 'Hip Osteoarthritis', category: 'Hip', severity: 'Chronic', recovery: 16 },
    
    // Elbow & Shoulder
    { code: 'ELBOW_DYSPLASIA', name: 'Elbow Dysplasia', category: 'Elbow & Shoulder', severity: 'Moderate', recovery: 12 },
    { code: 'OCD_SHOULDER', name: 'OCD - Shoulder', category: 'Elbow & Shoulder', severity: 'Moderate', recovery: 10 },
    { code: 'BICEPS_TENDON', name: 'Bicipital Tenosynovitis', category: 'Elbow & Shoulder', severity: 'Mild-Moderate', recovery: 8 },
    { code: 'SHOULDER_INSTAB', name: 'Shoulder Instability', category: 'Elbow & Shoulder', severity: 'Moderate', recovery: 10 },
    
    // Spine & Neuro
    { code: 'IVDD_CONSERV', name: 'IVDD - Conservative Management', category: 'Spine & Neuro', severity: 'Moderate-Severe', recovery: 8 },
    { code: 'IVDD_POSTOP', name: 'IVDD - Post-Op Hemilaminectomy', category: 'Spine & Neuro', severity: 'Surgical', recovery: 12 },
    { code: 'FCE', name: 'FCE (Fibrocartilaginous Embolism)', category: 'Spine & Neuro', severity: 'Acute-Severe', recovery: 12 },
    { code: 'DM', name: 'Degenerative Myelopathy', category: 'Spine & Neuro', severity: 'Progressive', recovery: 16 },
    { code: 'WOBBLER', name: 'Wobbler Syndrome', category: 'Spine & Neuro', severity: 'Moderate-Severe', recovery: 12 },
    
    // Multi-Joint OA
    { code: 'OA_MULTI', name: 'Osteoarthritis - Multiple Joints', category: 'Multi-Joint OA', severity: 'Chronic', recovery: 16 },
    { code: 'GERIATRIC', name: 'Geriatric Mobility', category: 'Multi-Joint OA', severity: 'Age-Related', recovery: 12 },
    { code: 'CHRONIC_PAIN', name: 'Chronic Pain Management', category: 'Multi-Joint OA', severity: 'Chronic', recovery: 16 }
  ];

  const stmt = db.prepare(`
    INSERT INTO conditions (code, name, category, severity, typical_recovery_weeks)
    VALUES (?, ?, ?, ?, ?)
  `);

  conditions.forEach(c => {
    stmt.run(c.code, c.name, c.category, c.severity, c.recovery);
  });

  stmt.finalize(() => {
    console.log(`✅ Seeded ${conditions.length} conditions`);
  });
}

function seedExercises() {
  // Import complete exercise library
  const ALL_EXERCISES = require('./all-exercises');
  
  const stmt = db.prepare(`
    INSERT INTO exercises (code, name, category, description, equipment, setup, steps, good_form, common_mistakes, red_flags, progression, contraindications, difficulty_level)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  ALL_EXERCISES.forEach(ex => {
    stmt.run(
      ex.code,
      ex.name,
      ex.category,
      ex.description || '',
      JSON.stringify(ex.equipment || []),
      ex.setup || '',
      JSON.stringify(ex.steps || []),
      JSON.stringify(ex.good_form || []),
      JSON.stringify(ex.common_mistakes || []),
      JSON.stringify(ex.red_flags || []),
      ex.progression || '',
      ex.contraindications || '',
      ex.difficulty_level || 'Moderate'
    );
  });

  stmt.finalize(() => {
    console.log(`✅ Seeded ${ALL_EXERCISES.length} complete professional exercises!`);
    console.log('   📚 Categories: Passive Therapy, Active Assisted, Strengthening,');
    console.log('      Balance & Proprioception, Aquatic Therapy, Functional Training');
  });
}

// OLD CODE BELOW - KEEPING FOR REFERENCE
function seedExercisesOLD() {
  const exercises = [
    // PASSIVE THERAPY (8 exercises)
    {
      code: 'PROM_STIFLE',
      name: 'Passive Range of Motion - Stifle',
      category: 'Passive Therapy',
      equipment: JSON.stringify(['Cushioned surface', 'Treat rewards']),
      setup: 'Position dog in lateral recumbency on soft surface. Support affected limb.',
      steps: JSON.stringify([
        'Gently flex stifle joint to comfortable end range',
        'Hold for 5 seconds',
        'Slowly extend to neutral position',
        'Repeat in controlled, smooth motion',
        'Reward calm behavior'
      ]),
      good_form: JSON.stringify([
        'Smooth, controlled movements',
        'No force or quick jerks',
        'Dog remains relaxed',
        'Consistent range maintained'
      ]),
      common_mistakes: JSON.stringify([
        'Moving too quickly',
        'Forcing beyond comfortable range',
        'Not supporting limb properly',
        'Inconsistent repetitions'
      ]),
      red_flags: JSON.stringify([
        'Vocalization or pain response',
        'Muscle spasm or resistance',
        'Increased swelling after session',
        'Loss of previously gained range'
      ]),
      progression: 'Increase repetitions from 10 to 20. Add gentle resistance once pain-free range established.',
      difficulty_level: 'Easy'
    },
    {
      code: 'MASSAGE_THERA',
      name: 'Therapeutic Massage',
      category: 'Passive Therapy',
      equipment: JSON.stringify(['Massage oil (optional)', 'Warm towel']),
      setup: 'Dog in comfortable position. Warm muscles with towel if tolerated.',
      steps: JSON.stringify([
        'Use gentle effleurage strokes toward heart',
        'Apply petrissage to major muscle groups',
        'Focus on affected limb musculature',
        'Use fingertip pressure on trigger points',
        'End with soothing strokes'
      ]),
      good_form: JSON.stringify([
        'Consistent pressure maintained',
        'Dog shows relaxation signs',
        'Stroking follows muscle fiber direction',
        'Session lasts 10-15 minutes'
      ]),
      common_mistakes: JSON.stringify([
        'Too much pressure causing discomfort',
        'Rushing through session',
        'Missing affected muscle groups',
        'Not reading dog\'s stress signals'
      ]),
      red_flags: JSON.stringify([
        'Dog tries to escape or bite',
        'Increased muscle tension',
        'Visible discomfort or guarding',
        'Swelling increases post-massage'
      ]),
      progression: 'Increase session duration. Add trigger point therapy. Include stretching.',
      difficulty_level: 'Easy'
    },
    {
      code: 'COLD_THERAPY',
      name: 'Cryotherapy (Cold Therapy)',
      category: 'Passive Therapy',
      equipment: JSON.stringify(['Ice pack', 'Thin towel', 'Timer']),
      setup: 'Wrap ice pack in towel. Position over affected area.',
      steps: JSON.stringify([
        'Apply wrapped ice pack to joint',
        'Leave in place for 10-15 minutes',
        'Remove and check skin condition',
        'Repeat 3-4 times daily as needed',
        'Always use barrier between ice and skin'
      ]),
      good_form: JSON.stringify([
        'Consistent 10-15 minute application',
        'Towel barrier prevents frostbite',
        'Dog remains calm during treatment',
        'Skin returns to normal color after'
      ]),
      common_mistakes: JSON.stringify([
        'Direct ice contact with skin',
        'Leaving ice on too long',
        'Using on cold/stiff muscles',
        'Skipping post-exercise cooling'
      ]),
      red_flags: JSON.stringify([
        'Skin discoloration (white, purple)',
        'Excessive shivering or distress',
        'Skin irritation or burns',
        'Numbness that persists'
      ]),
      progression: 'Use as needed for inflammation control. Reduce frequency as inflammation subsides.',
      difficulty_level: 'Easy'
    },

    // ACTIVE ASSISTED (10 exercises)
    {
      code: 'SIT_STAND',
      name: 'Sit-to-Stand Transitions',
      category: 'Active Assisted',
      equipment: JSON.stringify(['Treats', 'Non-slip surface']),
      setup: 'Position dog on non-slip flooring. Have treats ready.',
      steps: JSON.stringify([
        'Command dog to sit with proper form',
        'Use treat to lure into standing position',
        'Ensure weight distributed evenly on all limbs',
        'Return to sit position',
        'Repeat controlled transitions'
      ]),
      good_form: JSON.stringify([
        'Square sitting position maintained',
        'Smooth transitions without rushing',
        'Equal weight bearing on hindlimbs',
        'Controlled eccentric lowering to sit'
      ]),
      common_mistakes: JSON.stringify([
        'Allowing crooked sits',
        'Moving too quickly through reps',
        'Not ensuring full weight bearing',
        'Using slippery surfaces'
      ]),
      red_flags: JSON.stringify([
        'Unwillingness to bear weight',
        'Obvious lameness during transition',
        'Collapsing or loss of balance',
        'Pain vocalization'
      ]),
      progression: 'Increase reps from 5 to 15. Add duration holds in standing. Progress to uneven surfaces.',
      difficulty_level: 'Easy'
    },
    {
      code: 'WEIGHT_SHIFT',
      name: 'Weight Shifting Exercises',
      category: 'Active Assisted',
      equipment: JSON.stringify(['Treats', 'Your hands for support']),
      setup: 'Dog standing square on level surface.',
      steps: JSON.stringify([
        'Gently shift dog\'s weight to one side using treat lure',
        'Hold position for 5 seconds',
        'Return to center',
        'Shift to opposite side',
        'Encourage weight onto affected limb'
      ]),
      good_form: JSON.stringify([
        'Controlled weight transfers',
        'Dog maintains balance',
        'All four feet remain planted',
        'Smooth return to center'
      ]),
      common_mistakes: JSON.stringify([
        'Shifting too far causing loss of balance',
        'Moving too quickly',
        'Not holding shifted position',
        'Allowing foot lifting'
      ]),
      red_flags: JSON.stringify([
        'Unable to maintain balance',
        'Extreme reluctance to load affected limb',
        'Trembling or weakness',
        'Joint collapse under load'
      ]),
      progression: 'Increase hold duration to 10 seconds. Add unstable surface. Increase weight shift degree.',
      difficulty_level: 'Easy'
    }
  ];

  const stmt = db.prepare(`
    INSERT INTO exercises (code, name, category, equipment, setup, steps, good_form, common_mistakes, red_flags, progression, difficulty_level)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  exercises.forEach(ex => {
    stmt.run(
      ex.code,
      ex.name,
      ex.category,
      ex.equipment,
      ex.setup,
      ex.steps,
      ex.good_form,
      ex.common_mistakes,
      ex.red_flags,
      ex.progression,
      ex.difficulty_level
    );
  });

  stmt.finalize(() => {
    console.log(`✅ Seeded ${exercises.length} exercises (more will be added)`);
  });
}

// ============================================================================
// API ROUTES
// ============================================================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'K9-REHAB-PRO Backend Online' });
});

// Get all conditions (grouped)
app.get('/api/conditions', (req, res) => {
  db.all('SELECT * FROM conditions ORDER BY category, name', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Get conditions grouped by category
app.get('/api/conditions/grouped', (req, res) => {
  db.all('SELECT * FROM conditions ORDER BY category, name', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      // Group by category
      const grouped = rows.reduce((acc, condition) => {
        if (!acc[condition.category]) {
          acc[condition.category] = [];
        }
        acc[condition.category].push(condition);
        return acc;
      }, {});
      res.json(grouped);
    }
  });
});

// Get all exercises (ENHANCED - now returns medical-grade exercises with full clinical metadata)
app.get('/api/exercises', (req, res) => {
  try {
    // Return enhanced exercises from all-exercises.js with full clinical metadata
    res.json(ALL_EXERCISES);
  } catch (error) {
    console.error('❌ Error fetching exercises:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// NEW CLINICAL QUERY ENDPOINTS
// ============================================================================

// Get exercises by intervention type
app.get('/api/exercises/by-intervention/:type', (req, res) => {
  try {
    const interventionType = req.params.type.toUpperCase();
    const filtered = ALL_EXERCISES.filter(ex =>
      ex.clinical_classification &&
      ex.clinical_classification.intervention_type === interventionType
    );
    res.json(filtered);
  } catch (error) {
    console.error('❌ Error filtering by intervention type:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get exercises by rehabilitation phase
app.get('/api/exercises/by-phase/:phase', (req, res) => {
  try {
    const phase = req.params.phase.toUpperCase();
    const filtered = ALL_EXERCISES.filter(ex =>
      ex.clinical_classification &&
      ex.clinical_classification.rehab_phases &&
      ex.clinical_classification.rehab_phases.includes(phase)
    );
    res.json(filtered);
  } catch (error) {
    console.error('❌ Error filtering by phase:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get exercises by primary indication (condition)
app.get('/api/exercises/by-indication/:indication', (req, res) => {
  try {
    const indication = req.params.indication;
    const filtered = ALL_EXERCISES.filter(ex =>
      ex.clinical_classification &&
      ex.clinical_classification.primary_indications &&
      ex.clinical_classification.primary_indications.includes(indication)
    );
    res.json(filtered);
  } catch (error) {
    console.error('❌ Error filtering by indication:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get exercises by evidence grade
app.get('/api/exercises/by-evidence-grade/:grade', (req, res) => {
  try {
    const grade = req.params.grade.toUpperCase();
    const filtered = ALL_EXERCISES.filter(ex =>
      ex.evidence_base &&
      ex.evidence_base.grade === grade
    );
    res.json(filtered);
  } catch (error) {
    console.error('❌ Error filtering by evidence grade:', error);
    res.status(500).json({ error: error.message });
  }
});

// Advanced search with multiple filters
app.get('/api/exercises/search', (req, res) => {
  try {
    const {
      intervention_type,
      phase,
      indication,
      evidence_grade,
      difficulty,
      category,
      keyword
    } = req.query;

    let filtered = [...ALL_EXERCISES];

    // Filter by intervention type
    if (intervention_type) {
      filtered = filtered.filter(ex =>
        ex.clinical_classification &&
        ex.clinical_classification.intervention_type === intervention_type.toUpperCase()
      );
    }

    // Filter by rehabilitation phase
    if (phase) {
      filtered = filtered.filter(ex =>
        ex.clinical_classification &&
        ex.clinical_classification.rehab_phases &&
        ex.clinical_classification.rehab_phases.includes(phase.toUpperCase())
      );
    }

    // Filter by primary indication
    if (indication) {
      filtered = filtered.filter(ex =>
        ex.clinical_classification &&
        ex.clinical_classification.primary_indications &&
        ex.clinical_classification.primary_indications.includes(indication)
      );
    }

    // Filter by evidence grade
    if (evidence_grade) {
      filtered = filtered.filter(ex =>
        ex.evidence_base &&
        ex.evidence_base.grade === evidence_grade.toUpperCase()
      );
    }

    // Filter by difficulty level
    if (difficulty) {
      filtered = filtered.filter(ex =>
        ex.difficulty_level &&
        ex.difficulty_level.toLowerCase() === difficulty.toLowerCase()
      );
    }

    // Filter by category
    if (category) {
      filtered = filtered.filter(ex =>
        ex.category &&
        ex.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    // Keyword search (name, description, code)
    if (keyword) {
      const term = keyword.toLowerCase();
      filtered = filtered.filter(ex =>
        (ex.name && ex.name.toLowerCase().includes(term)) ||
        (ex.description && ex.description.toLowerCase().includes(term)) ||
        (ex.code && ex.code.toLowerCase().includes(term))
      );
    }

    res.json(filtered);
  } catch (error) {
    console.error('❌ Error in advanced search:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get exercise by code (single exercise with full metadata)
app.get('/api/exercises/:code', (req, res) => {
  try {
    const exercise = getExerciseByCode(req.params.code);
    if (exercise) {
      res.json(exercise);
    } else {
      res.status(404).json({ error: 'Exercise not found' });
    }
  } catch (error) {
    console.error('❌ Error fetching exercise:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get available taxonomy values
app.get('/api/taxonomy', (req, res) => {
  try {
    res.json({
      intervention_types: Object.values(INTERVENTION_TYPES).map(t => ({
        code: t.code,
        name: t.name,
        description: t.description
      })),
      rehab_phases: Object.values(REHAB_PHASES).map(p => ({
        code: p.code,
        name: p.name,
        description: p.description,
        timeframe: p.timeframe
      })),
      primary_indications: PRIMARY_INDICATIONS,
      evidence_grades: ['A', 'B', 'C', 'EO'],
      difficulty_levels: ['Easy', 'Moderate', 'Advanced']
    });
  } catch (error) {
    console.error('❌ Error fetching taxonomy:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all patients
app.get('/api/patients', (req, res) => {
  db.all('SELECT * FROM patients ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Create new patient
app.post('/api/patients', (req, res) => {
  const {
    name, breed, age, weight, sex, condition, affected_region,
    surgery_date, lameness_grade, body_condition_score,
    pain_level, mobility_level, current_medications,
    medical_history, special_instructions, client_name,
    client_email, client_phone, referring_vet
  } = req.body;

  db.run(
    `INSERT INTO patients (
      name, breed, age, weight, sex, condition, affected_region,
      surgery_date, lameness_grade, body_condition_score,
      pain_level, mobility_level, current_medications,
      medical_history, special_instructions, client_name,
      client_email, client_phone, referring_vet
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name, breed, age, weight, sex, condition, affected_region,
      surgery_date, lameness_grade, body_condition_score,
      pain_level, mobility_level, current_medications,
      medical_history, special_instructions, client_name,
      client_email, client_phone, referring_vet
    ],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: this.lastID, message: 'Patient created successfully' });
      }
    }
  );
});

// Delete a single patient
app.delete('/api/patients/:id', (req, res) => {
  db.run('DELETE FROM patients WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Patient not found' });
    } else {
      res.json({ message: 'Patient deleted', id: req.params.id });
    }
  });
});

// Delete multiple patients
app.post('/api/patients/delete-batch', (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'No patient IDs provided' });
  }
  const placeholders = ids.map(() => '?').join(',');
  db.run(`DELETE FROM patients WHERE id IN (${placeholders})`, ids, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: `${this.changes} patient(s) deleted`, deleted: this.changes });
    }
  });
});

// GENERATE PROTOCOL - THE MAIN ENDPOINT
app.post('/api/generate-protocol', (req, res) => {
  const formData = req.body;

  // Validate intake before proceeding
  const validation = validateIntake(formData);
  if (!validation.valid) {
    return res.status(400).json({ error: 'Intake validation failed', details: validation.errors });
  }

  // First, create the patient
  db.run(
    `INSERT INTO patients (
      name, breed, age, weight, sex, condition, affected_region,
      surgery_date, lameness_grade, body_condition_score,
      pain_level, mobility_level, current_medications,
      medical_history, special_instructions, client_name,
      client_email, client_phone, referring_vet
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      formData.patientName,
      formData.breed,
      formData.age,
      formData.weight,
      formData.sex,
      formData.diagnosis,
      formData.affectedRegion,
      formData.surgeryDate,
      formData.lamenessGrade,
      formData.bodyConditionScore,
      formData.painLevel,
      formData.mobilityLevel,
      formData.currentMedications,
      formData.medicalHistory,
      formData.specialInstructions,
      formData.clientName,
      formData.clientEmail,
      formData.clientPhone,
      formData.referringVet
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const patientId = this.lastID;

      // Generate protocol based on condition
      generateProtocol(formData, patientId, (protocol) => {
        // Attach red-flag warnings if any
        if (validation.warnings && validation.warnings.length > 0) {
          protocol.red_flag_warnings = validation.warnings;
        }

        // Save protocol
        db.run(
          'INSERT INTO protocols (patient_id, protocol_data) VALUES (?, ?)',
          [patientId, JSON.stringify(protocol)],
          (err) => {
            if (err) {
              console.error('Error saving protocol:', err);
            }
          }
        );

        res.json(protocol);
      });
    }
  );
});

// ============================================================================
// VIDEO DEMONSTRATION API ENDPOINTS
// Medical-grade video library for exercise demonstrations
// ============================================================================

// Get video metadata for specific exercise
app.get('/api/videos/:exerciseCode', (req, res) => {
  try {
    const { exerciseCode } = req.params;
    console.log(`📹 Fetching video for exercise: ${exerciseCode}`);

    const videoData = getVideosByExerciseCode(exerciseCode);

    if (!videoData) {
      return res.status(404).json({
        success: false,
        error: 'No video demonstration available for this exercise',
        exerciseCode
      });
    }

    res.json({
      success: true,
      data: videoData
    });
  } catch (error) {
    console.error('❌ Error fetching video metadata:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all instructors
app.get('/api/instructors', (req, res) => {
  try {
    console.log('👨‍⚕️ Fetching all instructors');
    res.json({
      success: true,
      count: Object.keys(INSTRUCTORS).length,
      data: Object.values(INSTRUCTORS)
    });
  } catch (error) {
    console.error('❌ Error fetching instructors:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get specific instructor by ID
app.get('/api/instructors/:instructorId', (req, res) => {
  try {
    const { instructorId } = req.params;
    console.log(`👨‍⚕️ Fetching instructor: ${instructorId}`);

    const instructor = getInstructorById(instructorId);

    if (!instructor) {
      return res.status(404).json({
        success: false,
        error: 'Instructor not found',
        instructorId
      });
    }

    res.json({
      success: true,
      data: instructor
    });
  } catch (error) {
    console.error('❌ Error fetching instructor:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get transcript for exercise video
app.get('/api/video-transcripts/:exerciseCode', (req, res) => {
  try {
    const { exerciseCode } = req.params;
    const { mode } = req.query; // 'professional' or 'client'

    console.log(`📝 Fetching transcript for ${exerciseCode}, mode: ${mode || 'professional'}`);

    const videoData = getVideosByExerciseCode(exerciseCode);

    if (!videoData || !videoData.transcript) {
      return res.status(404).json({
        success: false,
        error: 'No transcript available for this exercise'
      });
    }

    const transcript = mode === 'client'
      ? videoData.transcript.client
      : videoData.transcript.professional;

    if (!transcript) {
      return res.status(404).json({
        success: false,
        error: `No ${mode || 'professional'} transcript available`
      });
    }

    res.json({
      success: true,
      data: {
        exerciseCode,
        mode: mode || 'professional',
        transcript,
        instructor: videoData.instructor.name
      }
    });
  } catch (error) {
    console.error('❌ Error fetching transcript:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all exercises with video availability
app.get('/api/exercises/with-videos', (req, res) => {
  try {
    console.log('📹 Fetching all exercises with video demonstrations');

    const exerciseCodes = getExercisesWithVideos();
    const exercisesWithVideos = exerciseCodes.map(code => {
      const videoData = getVideosByExerciseCode(code);
      const exercise = getExerciseByCode(code);

      return {
        exercise_code: code,
        exercise_name: exercise ? exercise.name : 'Unknown',
        video_count: videoData.angles ? videoData.angles.length : 0,
        instructor: videoData.instructor.name,
        certification_status: videoData.certification_status,
        version: videoData.version,
        ce_eligible: videoData.ce_credit_eligible || false,
        ce_hours: videoData.ce_credit_hours || 0
      };
    });

    res.json({
      success: true,
      count: exercisesWithVideos.length,
      data: exercisesWithVideos
    });
  } catch (error) {
    console.error('❌ Error fetching exercises with videos:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get videos by instructor
app.get('/api/videos/by-instructor/:instructorId', (req, res) => {
  try {
    const { instructorId } = req.params;
    console.log(`📹 Fetching videos by instructor: ${instructorId}`);

    const videos = getVideosByInstructor(instructorId);

    if (!videos || videos.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No videos found for this instructor',
        instructorId
      });
    }

    res.json({
      success: true,
      count: videos.length,
      data: videos
    });
  } catch (error) {
    console.error('❌ Error fetching videos by instructor:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get video library statistics
app.get('/api/videos/stats', (req, res) => {
  try {
    console.log('📊 Fetching video library statistics');

    const stats = getVideoStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error fetching video stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// STORYBOARD ENDPOINTS — Frame-by-frame exercise demonstrations
// ============================================================================

// GET /api/storyboards — list all exercises with storyboards
app.get('/api/storyboards', (req, res) => {
  try {
    res.json({ success: true, data: getExercisesWithStoryboards() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/storyboards/stats — storyboard library statistics
app.get('/api/storyboards/stats', (req, res) => {
  try {
    res.json({ success: true, data: getStoryboardStats() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/storyboards/:exerciseCode — full storyboard data for one exercise
app.get('/api/storyboards/:exerciseCode', (req, res) => {
  try {
    const data = getStoryboardByCode(req.params.exerciseCode);
    if (!data) return res.status(404).json({ success: false, error: 'Storyboard not found for this exercise code' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/storyboards/:exerciseCode/frames — frames array only
app.get('/api/storyboards/:exerciseCode/frames', (req, res) => {
  try {
    const frames = getStoryboardFrames(req.params.exerciseCode);
    if (!frames) return res.status(404).json({ success: false, error: 'Storyboard not found for this exercise code' });
    res.json({ success: true, data: frames });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/storyboards/:exerciseCode/script — script by ?mode=client|clinician
app.get('/api/storyboards/:exerciseCode/script', (req, res) => {
  try {
    const mode = req.query.mode || 'client';
    const script = getStoryboardScript(req.params.exerciseCode, mode);
    if (!script) return res.status(404).json({ success: false, error: 'Storyboard not found for this exercise code' });
    res.json({ success: true, mode, data: script });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// PROTOCOL GENERATION LOGIC
// ============================================================================

function generateProtocol(formData, patientId, callback) {
  // Get exercises from database
  db.all('SELECT * FROM exercises', (err, exercises) => {
    if (err) {
      console.error('Error fetching exercises:', err);
      exercises = [];
    }

    // Parse exercises
    const parsedExercises = exercises.map(ex => ({
      ...ex,
      equipment: JSON.parse(ex.equipment || '[]'),
      steps: JSON.parse(ex.steps || '[]'),
      good_form: JSON.parse(ex.good_form || '[]'),
      common_mistakes: JSON.parse(ex.common_mistakes || '[]'),
      red_flags: JSON.parse(ex.red_flags || '[]')
    }));

    // Generate weekly breakdown
    const numWeeks = formData.protocolLength || 8;
    const weeks = [];

    for (let i = 1; i <= numWeeks; i++) {
      const weekExercises = selectExercisesForWeek(i, numWeeks, parsedExercises, formData);
      weeks.push({
        week_number: i,
        exercises: weekExercises
      });
    }

    // Get protocol metadata
    const { getProtocolType } = require('./protocol-generator');
    const protocolType = getProtocolType(formData.diagnosis, formData.affectedRegion, formData.treatmentApproach);
    const protocolDef = PROTOCOL_DEFINITIONS[protocolType];

    const protocol = {
      patient_id: patientId,
      patient_name: formData.patientName,
      condition: formData.diagnosis,
      affected_region: formData.affectedRegion,
      protocol_type: protocolType,
      protocol_name: protocolDef ? protocolDef.name : 'General Protocol',
      protocol_length_weeks: numWeeks,
      total_exercises: parsedExercises.length,
      weeks: weeks,
      generated_at: new Date().toISOString()
    };

    callback(protocol);
  });
}

// ============================================================================
// API v1 - EXERCISE LIBRARY ENDPOINTS
// ============================================================================

// GET /api/v1/exercises - Get all exercises with optional filters
app.get('/api/v1/exercises', async (req, res) => {
  try {
    const { domain, phase, tier } = req.query;
    const filters = {};

    if (domain) filters.domain = domain;
    if (phase) filters.phase = phase;
    if (tier) filters.tier = tier;

    const exercises = await ExerciseLibraryDB.getAllExercises(filters);
    res.json({
      success: true,
      count: exercises.length,
      filters: filters,
      data: exercises
    });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/exercises/:id - Get single exercise by ID
app.get('/api/v1/exercises/:id', async (req, res) => {
  try {
    const exercise = await ExerciseLibraryDB.getExerciseById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ success: false, error: 'Exercise not found' });
    }
    res.json({ success: true, data: exercise });
  } catch (error) {
    console.error('Error fetching exercise:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/domains - Get all therapeutic domains
app.get('/api/v1/domains', async (req, res) => {
  try {
    const domains = await ExerciseLibraryDB.getDomains();
    res.json({ success: true, count: domains.length, data: domains });
  } catch (error) {
    console.error('Error fetching domains:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/phases - Get all rehabilitation phases
app.get('/api/v1/phases', async (req, res) => {
  try {
    const phases = await ExerciseLibraryDB.getPhases();
    res.json({ success: true, count: phases.length, data: phases });
  } catch (error) {
    console.error('Error fetching phases:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/tiers - Get all difficulty tiers
app.get('/api/v1/tiers', async (req, res) => {
  try {
    const tiers = await ExerciseLibraryDB.getTiers();
    res.json({ success: true, count: tiers.length, data: tiers });
  } catch (error) {
    console.error('Error fetching tiers:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/programs/generate - Generate rehabilitation program
// Body: { condition: "TPLO", phase: "early" | "mid" | "late" }
app.post('/api/v1/programs/generate', async (req, res) => {
  try {
    const { condition, phase } = req.body;

    if (!condition || !phase) {
      return res.status(400).json({ success: false, error: 'condition and phase are required' });
    }

    // Look up exercise slugs from protocol rules
    const ruleResult = getExerciseSlugsForPhase(condition, phase);
    if (!ruleResult) {
      return res.status(404).json({
        success: false,
        error: `No protocol rules found for condition="${condition}" phase="${phase}"`,
        available_conditions: getAvailableConditions()
      });
    }

    res.json({
      success: true,
      data: {
        id: `PROG-${Date.now()}`,
        condition: ruleResult.condition,
        phase: ruleResult.phase,
        phase_label: ruleResult.label,
        goals: ruleResult.goals,
        exercise_slugs: ruleResult.slugs,
        generated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating program:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/programs/conditions - List all available conditions
app.get('/api/v1/programs/conditions', (_req, res) => {
  res.json({ success: true, data: getAvailableConditions() });
});

// GET /api/v1/programs/conditions/:condition/phases - List phases for a condition
app.get('/api/v1/programs/conditions/:condition/phases', (req, res) => {
  const phases = getPhasesForCondition(req.params.condition);
  if (!phases) {
    return res.status(404).json({ success: false, error: 'Condition not found' });
  }
  res.json({ success: true, data: phases });
});


// ============================================================================
// AUDIT LOG ENDPOINTS — Must-Have #8
// ============================================================================

// GET /api/audit-log — retrieve audit entries (newest first, limit 200)
app.get('/api/audit-log', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 200, 1000);
  const offset = parseInt(req.query.offset) || 0;
  db.all(
    `SELECT * FROM audit_log ORDER BY id DESC LIMIT ? OFFSET ?`,
    [limit, offset],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      db.get('SELECT COUNT(*) as total FROM audit_log', (err2, countRow) => {
        res.json({ total: countRow?.total || 0, limit, offset, entries: rows || [] });
      });
    }
  );
});

// GET /api/audit-log/stats — summary counts by action
app.get('/api/audit-log/stats', (req, res) => {
  db.all(
    `SELECT action, COUNT(*) as count, MAX(timestamp) as last_occurrence
     FROM audit_log GROUP BY action ORDER BY count DESC`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ stats: rows || [] });
    }
  );
});

// GET /api/audit-log/export — CSV export for board investigations (Must-Have #1.6)
app.get('/api/audit-log/export', (req, res) => {
  db.all('SELECT * FROM audit_log ORDER BY id DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const headers = ['id','timestamp','action','resource_type','resource_id','user_label','ip_address','request_method','request_path','status_code','detail'];
    const csvRows = [headers.join(',')];
    for (const row of (rows || [])) {
      csvRows.push(headers.map(h => {
        const val = row[h] != null ? String(row[h]).replace(/"/g, '""') : '';
        return `"${val}"`;
      }).join(','));
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=k9_rehab_audit_log_${new Date().toISOString().slice(0,10)}.csv`);
    res.send(csvRows.join('\n'));
  });
});

// DELETE /api/audit-log/purge — retention enforcement (keeps entries within retention period)
app.delete('/api/audit-log/purge', (req, res) => {
  const retentionYears = parseInt(req.query.years) || 7;
  db.run(
    `DELETE FROM audit_log WHERE timestamp < datetime('now', '-${retentionYears} years')`,
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ purged: this.changes, retentionYears });
    }
  );
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 K9-REHAB-PRO Backend Server Running`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 API: http://localhost:${PORT}/api`);
  console.log(`✅ Status: http://localhost:${PORT}/api/health`);
  console.log(`${'='.repeat(60)}\n`);
});
