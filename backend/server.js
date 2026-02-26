// ============================================================================
// ENHANCED SERVER - K9-REHAB-PRO
// Supporting futuristic frontend with grouped conditions and full exercises
// ============================================================================

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { selectExercisesForWeek, PROTOCOL_DEFINITIONS, validateIntake, getExcludedCodes } = require('./protocol-generator'); // ✅ ACVSMR-aligned 4-protocol system
const { ALL_EXERCISES, getExerciseByCode, searchExercises } = require('./all-exercises');
const { CORE_REFERENCES, EXERCISE_EVIDENCE_MAP } = require('./evidence-references');
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
  getOrGenerateStoryboard,
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
const {
  initializeUsersTable,
  getUserCount,
  findUserByUsername,
  createUser,
  verifyPassword,
  generateToken,
  requireAuth,
  requireRole
} = require('./auth');
const mammoth = require('mammoth');

// ── Evidence-Based References → Exercise Enrichment ──
// Links CORE_REFERENCES to every exercise via EXERCISE_EVIDENCE_MAP at startup
let evidenceLinked = 0;
ALL_EXERCISES.forEach(ex => {
  const refKeys = EXERCISE_EVIDENCE_MAP[ex.code];
  if (refKeys) {
    const refs = refKeys
      .map(key => CORE_REFERENCES[key])
      .filter(Boolean);
    // Determine highest evidence grade: A > B > C
    const grades = refs.map(r => r.evidence_grade).filter(Boolean);
    const grade = grades.includes('A') ? 'A' : grades.includes('B') ? 'B' : grades[0] || null;
    ex.evidence_base = { grade, references: refs };
    evidenceLinked++;
  }
});
console.log(`✅ Evidence references linked: ${evidenceLinked}/${ALL_EXERCISES.length} exercises`);

// ── Source-of-Truth Protocol Document ──
// Loaded once at startup, injected into every VetAI prompt
let SOURCE_OF_TRUTH_TEXT = '';
(async () => {
  try {
    const docPath = path.join(__dirname, '..', 'CanineRehabProtocols', 'canine_rehab_protocols.docx');
    const result = await mammoth.extractRawText({ path: docPath });
    SOURCE_OF_TRUTH_TEXT = result.value;
    console.log(`✅ Source-of-truth loaded: canine_rehab_protocols.docx (${SOURCE_OF_TRUTH_TEXT.length} chars)`);
  } catch (err) {
    console.error('⚠️  Failed to load source-of-truth document:', err.message);
  }
})();

// ── JWT Secret Validation ──
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET must be set in .env and be at least 32 characters.');
  console.error('Generate one with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// ── Security Middleware ──
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true,
}));
app.use(express.json({ limit: '1mb' })); // Increased for VetAI chat history

// Rate limiting — general (300 req / 15 min per IP)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});
app.use('/api', generalLimiter);

// Rate limiting — strict for auth endpoints (5 req / 15 min per IP)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

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
          user_label: req.user ? req.user.username : 'anonymous',
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

// ── Error sanitization helper ──
function safeError(err) {
  return process.env.NODE_ENV === 'development' ? err.message : 'Internal server error';
}

// Database setup
const db = new sqlite3.Database(path.join(__dirname, 'database.db'), (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('\u2705 Connected to SQLite database');
    db.run('PRAGMA foreign_keys = ON');
    initializeDatabase();
    // Initialize new exercise library v2.0
    initDB().then(() => seedExerciseLibrary()).catch(err => console.error('Exercise library initialization error:', err));
    // Initialize users table for authentication
    initializeUsersTable(db).catch(err => console.error('Users table error:', err));
  }
});

// Authentication middleware — DISABLED during build (user requested unlock)
// app.use('/api', requireAuth(db));

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
        mobility_level TEXT DEFAULT 'Moderate',
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
// AUTHENTICATION ROUTES
// ============================================================================

// POST /api/auth/register — Create new user (first user = admin, no auth required)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, role, display_name } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const userCount = await getUserCount(db);

    // After first user, self-registration creates clinician accounts
    // Only admins can assign admin role to new users
    const requestedRole = role || 'clinician';
    let userRole;
    if (userCount === 0) {
      userRole = 'admin'; // First user is always admin
    } else if (requestedRole === 'admin' && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({ error: 'Only admins can create admin accounts' });
    } else {
      userRole = requestedRole === 'admin' ? 'admin' : 'clinician';
    }

    const user = await createUser(db, {
      username,
      password,
      role: userRole,
      display_name,
    });

    const token = generateToken(user);

    res.status(201).json({
      message: 'User created successfully',
      user: { id: user.id, username: user.username, role: user.role },
      token,
    });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Username already exists' });
    }
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login — Authenticate user and return JWT
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = await findUserByUsername(db, username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await verifyPassword(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        display_name: user.display_name,
      },
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me — Get current user info
app.get('/api/auth/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user: req.user });
});

// GET /api/auth/status — Check if any users exist (for first-user detection)
app.get('/api/auth/status', async (req, res) => {
  try {
    const count = await getUserCount(db);
    res.json({ has_users: count > 0 });
  } catch (err) {
    res.status(500).json({ error: 'Status check failed' });
  }
});

// ============================================================================
// API ROUTES
// ============================================================================

// Health check
app.get('/api/health', (req, res) => {
  db.get('SELECT COUNT(*) as patientCount FROM patients', (err, pRow) => {
    db.get('SELECT COUNT(*) as protocolCount FROM protocols', (err2, prRow) => {
      res.json({
        status: 'OK',
        message: 'K9-REHAB-PRO Backend Online',
        version: '2.0.0',
        uptime: Math.floor(process.uptime()) + 's',
        database: err ? 'error' : 'connected',
        exerciseCount: ALL_EXERCISES.length,
        patientCount: pRow ? pRow.patientCount : 0,
        protocolCount: prRow ? prRow.protocolCount : 0,
        protocols: ['TPLO (16wk)', 'IVDD (12wk)', 'OA (16wk)', 'Geriatric (16wk)'],
        evidenceCoverage: '50/50 exercise codes'
      });
    });
  });
});

// Get all conditions (grouped)
app.get('/api/conditions', (req, res) => {
  db.all('SELECT * FROM conditions ORDER BY category, name', (err, rows) => {
    if (err) {
      res.status(500).json({ success: false, error: safeError(err) });
    } else {
      res.json({ success: true, count: rows.length, data: rows });
    }
  });
});

// Get conditions grouped by category
app.get('/api/conditions/grouped', (req, res) => {
  db.all('SELECT * FROM conditions ORDER BY category, name', (err, rows) => {
    if (err) {
      res.status(500).json({ success: false, error: safeError(err) });
    } else {
      // Group by category
      const grouped = rows.reduce((acc, condition) => {
        if (!acc[condition.category]) {
          acc[condition.category] = [];
        }
        acc[condition.category].push(condition);
        return acc;
      }, {});
      res.json({ success: true, data: grouped });
    }
  });
});

// Get all exercises (ENHANCED - now returns medical-grade exercises with full clinical metadata)
app.get('/api/exercises', (req, res) => {
  try {
    // Return enhanced exercises from all-exercises.js with full clinical metadata
    res.json({ success: true, count: ALL_EXERCISES.length, data: ALL_EXERCISES });
  } catch (error) {
    console.error('❌ Error fetching exercises:', error);
    res.status(500).json({ success: false, error: safeError(error) });
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
    res.json({ success: true, count: filtered.length, data: filtered });
  } catch (error) {
    console.error('❌ Error filtering by intervention type:', error);
    res.status(500).json({ success: false, error: safeError(error) });
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
    res.json({ success: true, count: filtered.length, data: filtered });
  } catch (error) {
    console.error('❌ Error filtering by phase:', error);
    res.status(500).json({ success: false, error: safeError(error) });
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
    res.json({ success: true, count: filtered.length, data: filtered });
  } catch (error) {
    console.error('❌ Error filtering by indication:', error);
    res.status(500).json({ success: false, error: safeError(error) });
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
    res.json({ success: true, count: filtered.length, data: filtered });
  } catch (error) {
    console.error('❌ Error filtering by evidence grade:', error);
    res.status(500).json({ success: false, error: safeError(error) });
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

    res.json({ success: true, count: filtered.length, data: filtered });
  } catch (error) {
    console.error('❌ Error in advanced search:', error);
    res.status(500).json({ success: false, error: safeError(error) });
  }
});

// Get all exercises with video availability (MUST be before :code route)
app.get('/api/exercises/with-videos', (req, res) => {
  try {
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
    res.json({ success: true, count: exercisesWithVideos.length, data: exercisesWithVideos });
  } catch (error) {
    console.error('Error fetching exercises with videos:', error);
    res.status(500).json({ success: false, error: safeError(error) });
  }
});

// Get exercise by code (single exercise with full metadata)
app.get('/api/exercises/:code', (req, res) => {
  try {
    const exercise = getExerciseByCode(req.params.code);
    if (exercise) {
      res.json({ success: true, data: exercise });
    } else {
      res.status(404).json({ error: 'Exercise not found' });
    }
  } catch (error) {
    console.error('❌ Error fetching exercise:', error);
    res.status(500).json({ error: safeError(error) });
  }
});

// Get available taxonomy values
app.get('/api/taxonomy', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
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
      }
    });
  } catch (error) {
    console.error('❌ Error fetching taxonomy:', error);
    res.status(500).json({ success: false, error: safeError(error) });
  }
});

// Get all patients
app.get('/api/patients', (req, res) => {
  db.all('SELECT * FROM patients ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ success: false, error: safeError(err) });
    } else {
      res.json({ success: true, count: rows.length, data: rows });
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

  // Input validation
  const errors = [];
  if (!name || !name.trim()) errors.push('Patient name is required');
  if (!breed || !breed.trim()) errors.push('Breed is required');
  if (age !== undefined && age !== null && (isNaN(Number(age)) || Number(age) < 0)) errors.push('Age must be a non-negative number');
  if (weight !== undefined && weight !== null && (isNaN(Number(weight)) || Number(weight) <= 0)) errors.push('Weight must be a positive number');
  if (errors.length > 0) return res.status(400).json({ error: 'Validation failed', details: errors });

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
        res.status(500).json({ error: safeError(err) });
      } else {
        res.json({ success: true, data: { id: this.lastID }, message: 'Patient created successfully' });
      }
    }
  );
});

// Delete a single patient
app.delete('/api/patients/:id', (req, res) => {
  const patientId = req.params.id;
  if (isNaN(Number(patientId))) return res.status(400).json({ error: 'Invalid patient ID' });
  // Cascade: delete associated protocols first, then patient
  db.run('DELETE FROM protocols WHERE patient_id = ?', [patientId], function(err) {
    if (err) return res.status(500).json({ error: safeError(err) });
    db.run('DELETE FROM patients WHERE id = ?', [patientId], function(err2) {
      if (err2) {
        res.status(500).json({ error: safeError(err2) });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Patient not found' });
      } else {
        res.json({ success: true, message: 'Patient deleted', data: { id: patientId } });
      }
    });
  });
});

// Delete multiple patients (admin-only)
app.post('/api/patients/delete-batch', requireRole('admin'), (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'No patient IDs provided' });
  }
  const placeholders = ids.map(() => '?').join(',');
  db.run(`DELETE FROM patients WHERE id IN (${placeholders})`, ids, function(err) {
    if (err) {
      res.status(500).json({ error: safeError(err) });
    } else {
      res.json({ success: true, message: `${this.changes} patient(s) deleted`, data: { deleted: this.changes } });
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
        return res.status(500).json({ error: safeError(err) });
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

        res.json({ success: true, data: protocol });
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
      error: safeError(error)
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
      error: safeError(error)
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
      error: safeError(error)
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
      error: safeError(error)
    });
  }
});

// (with-videos route moved above :code route to prevent route shadowing)

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
      error: safeError(error)
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
      error: safeError(error)
    });
  }
});

// ============================================================================
// STORYBOARD ENDPOINTS — Frame-by-frame exercise demonstrations
// ============================================================================

// GET /api/storyboards — list all exercises with storyboards (hand-authored + auto-generated)
app.get('/api/storyboards', (req, res) => {
  try {
    res.json({ success: true, data: getExercisesWithStoryboards(ALL_EXERCISES) });
  } catch (error) {
    res.status(500).json({ success: false, error: safeError(error) });
  }
});

// GET /api/storyboards/stats — storyboard library statistics (all 215)
app.get('/api/storyboards/stats', (req, res) => {
  try {
    res.json({ success: true, data: getStoryboardStats(ALL_EXERCISES) });
  } catch (error) {
    res.status(500).json({ success: false, error: safeError(error) });
  }
});

// GET /api/storyboards/:exerciseCode — full storyboard data for one exercise
app.get('/api/storyboards/:exerciseCode', (req, res) => {
  try {
    const code = req.params.exerciseCode;
    const exercise = getExerciseByCode(code);
    const data = getOrGenerateStoryboard(code, exercise);
    if (!data) return res.status(404).json({ success: false, error: 'Storyboard not found for this exercise code' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: safeError(error) });
  }
});

// GET /api/storyboards/:exerciseCode/frames — frames array only
app.get('/api/storyboards/:exerciseCode/frames', (req, res) => {
  try {
    const code = req.params.exerciseCode;
    const exercise = getExerciseByCode(code);
    const sb = getOrGenerateStoryboard(code, exercise);
    if (!sb) return res.status(404).json({ success: false, error: 'Storyboard not found for this exercise code' });
    res.json({ success: true, data: sb.frames });
  } catch (error) {
    res.status(500).json({ success: false, error: safeError(error) });
  }
});

// GET /api/storyboards/:exerciseCode/script — script by ?mode=client|clinician
app.get('/api/storyboards/:exerciseCode/script', (req, res) => {
  try {
    const code = req.params.exerciseCode;
    const mode = req.query.mode || 'client';
    const exercise = getExerciseByCode(code);
    const sb = getOrGenerateStoryboard(code, exercise);
    if (!sb) return res.status(404).json({ success: false, error: 'Storyboard not found for this exercise code' });
    res.json({ success: true, mode, data: mode === 'clinician' ? sb.clinician_script : sb.client_script });
  } catch (error) {
    res.status(500).json({ success: false, error: safeError(error) });
  }
});

// ============================================================================
// STORYBOARD IMAGE GENERATION — Hugging Face Inference API (free tier)
// ============================================================================
const fs = require('fs');

const STORYBOARD_IMAGE_DIR = path.join(__dirname, 'storyboard-images');
if (!fs.existsSync(STORYBOARD_IMAGE_DIR)) {
  fs.mkdirSync(STORYBOARD_IMAGE_DIR, { recursive: true });
}

// Build an exercise-specific image prompt from storyboard frame data
function buildImagePrompt(storyboard, frameIndex) {
  const frame = storyboard.frames[frameIndex];
  const breed = storyboard.breed_model?.breed || 'medium-sized dog';
  const build = storyboard.breed_model?.build || '';
  const exerciseName = storyboard.exercise_name || '';

  // Detect the dog's position from frame context
  const desc = ((frame.frame_title || '') + ' ' + (frame.frame_description || '') + ' ' + (frame.dog_action || '')).toLowerCase();
  let position = 'standing';
  if (desc.includes('lateral') || desc.includes('lying') || desc.includes('recumb') || desc.includes('side')) position = 'lying on its side';
  else if (desc.includes('sit') || desc.includes('seated')) position = 'sitting';
  else if (desc.includes('walk') || desc.includes('gait') || desc.includes('treadmill') || desc.includes('leash')) position = 'walking';
  else if (desc.includes('stand') || desc.includes('weight shift') || desc.includes('balance')) position = 'standing on all fours';

  // Detect handler/therapist involvement
  let handler = '';
  if (frame.handler_action) {
    const ha = frame.handler_action.toLowerCase();
    if (ha.includes('support') || ha.includes('stabiliz') || ha.includes('hold') || ha.includes('hands')) handler = ', therapist hands gently supporting the dog';
    else if (ha.includes('guide') || ha.includes('lure') || ha.includes('treat')) handler = ', handler guiding the dog with a treat';
    else if (ha.includes('leash')) handler = ', handler holding a leash';
  }

  // Detect equipment
  let equipment = '';
  if (desc.includes('balance board') || desc.includes('wobble')) equipment = ' on a balance board';
  else if (desc.includes('ramp') || desc.includes('incline')) equipment = ' on an incline ramp';
  else if (desc.includes('cavaletti') || desc.includes('pole')) equipment = ' stepping over ground poles';
  else if (desc.includes('underwater') || desc.includes('treadmill') && desc.includes('water')) equipment = ' in an underwater treadmill';
  else if (desc.includes('mat') || desc.includes('pad')) equipment = ' on a therapy mat';
  else if (desc.includes('stair') || desc.includes('step') || desc.includes('curb')) equipment = ' at a low step';

  return `Professional veterinary rehabilitation photograph. A ${breed} (${build}) ${position}${equipment} in a clean modern veterinary rehabilitation clinic${handler}. The dog looks calm and cooperative. Soft clinical lighting, medical-grade equipment visible, non-slip flooring. High quality professional photography, sharp focus, 35mm lens.`;
}

// GET /api/storyboard-images/:exerciseCode/:frameNumber — generate or serve cached exercise image
app.get('/api/storyboard-images/:exerciseCode/:frameNumber', async (req, res) => {
  try {
    const { exerciseCode, frameNumber } = req.params;
    const frameIdx = parseInt(frameNumber, 10) - 1; // 1-indexed from client

    // Check cache first
    const cacheFile = path.join(STORYBOARD_IMAGE_DIR, `${exerciseCode}_frame${frameNumber}.jpg`);
    if (fs.existsSync(cacheFile)) {
      return res.sendFile(cacheFile);
    }

    // Need HF token
    const hfToken = process.env.HF_TOKEN;
    if (!hfToken) {
      return res.status(503).json({ success: false, error: 'HF_TOKEN not configured. Add it to backend/.env' });
    }

    // Get storyboard data
    const exercise = getExerciseByCode(exerciseCode);
    const sb = getOrGenerateStoryboard(exerciseCode, exercise);
    if (!sb || !sb.frames || frameIdx < 0 || frameIdx >= sb.frames.length) {
      return res.status(404).json({ success: false, error: 'Storyboard or frame not found' });
    }

    // Build prompt
    const prompt = buildImagePrompt(sb, frameIdx);
    console.log(`🎨 Generating image for ${exerciseCode} frame ${frameNumber}: ${prompt.substring(0, 100)}...`);

    // Call HF Inference API via router — using SDXL (free tier)
    const response = await fetch('https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: prompt, parameters: { width: 512, height: 512 } }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ HF API error: ${response.status} ${errorText}`);
      // If model is loading, tell client to retry
      if (response.status === 503) {
        return res.status(503).json({ success: false, error: 'Model loading, retry in 20s', retry: true });
      }
      return res.status(502).json({ success: false, error: `Image generation failed: ${response.status}` });
    }

    // Save to cache
    const imageBuffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(cacheFile, imageBuffer);
    console.log(`✅ Cached ${cacheFile} (${(imageBuffer.length / 1024).toFixed(1)} KB)`);

    res.setHeader('Content-Type', 'image/jpeg');
    res.send(imageBuffer);
  } catch (error) {
    console.error('❌ Image generation error:', error.message);
    res.status(500).json({ success: false, error: safeError(error) });
  }
});

// GET /api/storyboard-images/:exerciseCode — list cached images for exercise
app.get('/api/storyboard-images/:exerciseCode', (req, res) => {
  try {
    const code = req.params.exerciseCode;
    const files = fs.readdirSync(STORYBOARD_IMAGE_DIR)
      .filter(f => f.startsWith(code + '_frame'))
      .map(f => {
        const match = f.match(/_frame(\d+)\./);
        return { frame: match ? parseInt(match[1]) : 0, file: f, url: `/api/storyboard-images/${code}/${match ? match[1] : '1'}` };
      })
      .sort((a, b) => a.frame - b.frame);
    res.json({ success: true, exerciseCode: code, cached_frames: files.length, images: files });
  } catch (error) {
    res.status(500).json({ success: false, error: safeError(error) });
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
    res.status(500).json({ success: false, error: safeError(error) });
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
    res.status(500).json({ success: false, error: safeError(error) });
  }
});

// GET /api/v1/domains - Get all therapeutic domains
app.get('/api/v1/domains', async (req, res) => {
  try {
    const domains = await ExerciseLibraryDB.getDomains();
    res.json({ success: true, count: domains.length, data: domains });
  } catch (error) {
    console.error('Error fetching domains:', error);
    res.status(500).json({ success: false, error: safeError(error) });
  }
});

// GET /api/v1/phases - Get all rehabilitation phases
app.get('/api/v1/phases', async (req, res) => {
  try {
    const phases = await ExerciseLibraryDB.getPhases();
    res.json({ success: true, count: phases.length, data: phases });
  } catch (error) {
    console.error('Error fetching phases:', error);
    res.status(500).json({ success: false, error: safeError(error) });
  }
});

// GET /api/v1/tiers - Get all difficulty tiers
app.get('/api/v1/tiers', async (req, res) => {
  try {
    const tiers = await ExerciseLibraryDB.getTiers();
    res.json({ success: true, count: tiers.length, data: tiers });
  } catch (error) {
    console.error('Error fetching tiers:', error);
    res.status(500).json({ success: false, error: safeError(error) });
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
    res.status(500).json({ success: false, error: safeError(error) });
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
      if (err) return res.status(500).json({ error: safeError(err) });
      db.get('SELECT COUNT(*) as total FROM audit_log', (err2, countRow) => {
        res.json({ success: true, total: countRow?.total || 0, limit, offset, data: rows || [] });
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
      if (err) return res.status(500).json({ error: safeError(err) });
      res.json({ success: true, data: rows || [] });
    }
  );
});

// GET /api/audit-log/export — CSV export for board investigations (Must-Have #1.6)
app.get('/api/audit-log/export', (req, res) => {
  db.all('SELECT * FROM audit_log ORDER BY id DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: safeError(err) });
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

// DELETE /api/audit-log/purge — retention enforcement (admin-only)
app.delete('/api/audit-log/purge', requireRole('admin'), (req, res) => {
  const retentionYears = parseInt(req.query.years) || 7;
  if (retentionYears < 1 || retentionYears > 99) {
    return res.status(400).json({ error: 'Retention years must be between 1 and 99' });
  }
  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - retentionYears);
  db.run(
    'DELETE FROM audit_log WHERE timestamp < ?',
    [cutoffDate.toISOString()],
    function(err) {
      if (err) return res.status(500).json({ error: safeError(err) });
      res.json({ success: true, data: { purged: this.changes, retentionYears } });
    }
  );
});

// ============================================================================
// VET-AI CLINICAL ASSISTANT — Streaming AI chat with patient context
// ============================================================================

// ── 4-Block VetAI Agent Prompt Architecture ──
// Block 1: System Identity & Clinical Framework
// Block 2: Structured Intake Data Template
// Block 3: Rehabilitation Phase Definitions
// Block 4: Mandatory Disclaimer

const VET_AI_SYSTEM_PROMPT = `You are VetAI, the clinical intelligence inside K9 Rehab Pro™.

=== BLOCK 1: SYSTEM IDENTITY & CLINICAL FRAMEWORK ===

You are a veterinary rehabilitation specialist AI assistant operating at ACVSMR-level knowledge standards.

Your knowledge aligns with the American College of Veterinary Sports Medicine and Rehabilitation (ACVSMR).

You function as a conservative, safety-prioritized clinical decision support tool for canine rehabilitation.

You do NOT:
- Diagnose new medical conditions
- Replace a licensed veterinarian
- Override veterinary instructions

You DO:
- Analyze structured intake data
- Classify case type
- Assign rehabilitation phase
- Generate structured exercise protocols
- Identify risk flags
- Provide progression criteria
- Provide monitoring guidance
- Translate plan into owner-friendly language

All responses MUST follow this exact structure:

1. Case Classification
2. Risk Flag Analysis
3. Rehabilitation Phase Assignment
4. Structured Exercise Protocol Table
5. Progression Criteria
6. Monitoring & Red Flags
7. Owner-Friendly Summary

Clinical Principles You Must Apply:
- Progressive overload adapted to canine physiology
- Tissue healing timelines
- Neurologic grading logic
- Load management
- Biomechanical compensation awareness
- Conservative progression bias

If required information is missing, request clarification BEFORE generating a plan.

If red flags are identified, explicitly recommend veterinary reassessment.

All exercise outputs must be presented in a structured table format with the following columns:

| Exercise | Sets | Reps | Frequency | Surface | Contraindications | Progression Trigger |

Always prioritize patient safety over performance advancement.

=== BLOCK 2: STRUCTURED INTAKE DATA TEMPLATE ===

When a patient is provided, map their data to this intake structure:

Patient Data: Breed, Age, Weight, Sex, Spay/Neuter Status
Diagnosis: Primary Diagnosis, Surgery Type (if applicable), Surgery Date, Post-Op Day Count
Clinical Status: Neurologic Grade (if applicable), Pain Score (1-10), Weight Bearing Status, Swelling Present (Yes/No), Heat or Discharge Present (Yes/No)
Medications: Current Medications
Goals: Activity Goal, Home Environment (stairs, flooring, yard, etc.)

=== BLOCK 3: REHABILITATION PHASE DEFINITIONS ===

Phase I – Protection / Acute:
0–14 days post-op or acute injury.
Focus: Pain control, passive range of motion, protected weight shifting.

Phase II – Controlled Loading:
Early strengthening, controlled sit-to-stand, basic proprioception.

Phase III – Strength Development:
Increased resistance, dynamic balance, endurance training.

Phase IV – Return to Function:
Sport-specific drills, agility patterns, advanced mobility.

=== BLOCK 4: MANDATORY DISCLAIMER ===

End every rehabilitation plan with:
"This rehabilitation plan is for professional veterinary use only and does not replace licensed veterinary evaluation."

=== EXERCISE DATABASE ===

KNOWLEDGE: ${ALL_EXERCISES.length}+ exercises across ${[...new Set(ALL_EXERCISES.map(e => e.category))].length} categories. Protocols: TPLO (16wk), IVDD (12wk), OA (16wk), Geriatric (16wk) — all 4-phase gated.

EXERCISE DATABASE SUMMARY:
${[...new Set(ALL_EXERCISES.map(e => e.category))].map(cat => {
  const catExercises = ALL_EXERCISES.filter(e => e.category === cat);
  return `- ${cat} (${catExercises.length}): ${catExercises.slice(0, 5).map(e => e.name).join(', ')}${catExercises.length > 5 ? '...' : ''}`;
}).join('\n')}

Use markdown formatting. Be concise but thorough.`;

// POST /api/vet-ai/chat — Streaming AI chat
app.post('/api/vet-ai/chat', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your-anthropic-api-key-here') {
    return res.status(503).json({ error: 'Anthropic API key not configured. Add ANTHROPIC_API_KEY to backend/.env' });
  }

  const { messages, patient } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  // Build system prompt with source-of-truth document injected on every request
  let systemPrompt = VET_AI_SYSTEM_PROMPT;

  // ── Source-of-Truth Injection ──
  // The complete canine_rehab_protocols.docx is the authoritative clinical reference.
  // VetAI MUST cross-reference this document for every response.
  if (SOURCE_OF_TRUTH_TEXT) {
    systemPrompt += `\n\n=== SOURCE OF TRUTH: CANINE REHABILITATION PROTOCOL SYSTEM ===
CRITICAL INSTRUCTION: The following is the authoritative clinical protocol document. You MUST cross-reference this document for EVERY response. Never fabricate exercises, dosages, progression criteria, or phase assignments that contradict this source. If a user asks about a protocol, exercise, or phase not covered here, explicitly state that it is outside the documented protocols.

${SOURCE_OF_TRUTH_TEXT}

=== END SOURCE OF TRUTH ===`;
  }
  if (patient) {
    systemPrompt += `\n\n=== ACTIVE PATIENT INTAKE ===\nPatient Data:\n  Breed: ${patient.breed || 'Not specified'}\n  Age: ${patient.age || 'Not specified'}\n  Weight: ${patient.weight || 'Not specified'}\n  Sex: ${patient.sex || 'Not specified'}\n  Name: ${patient.name || 'Not specified'}\n\nPrimary Diagnosis: ${patient.diagnosis || patient.dx || 'Not specified'}\nSurgery Type: ${patient.surgery_type || 'N/A'}\nSurgery Date: ${patient.surgery_date || 'N/A'}\nPost-Op Day Count: ${patient.post_op_days || 'N/A'}\n\nNeurologic Grade: ${patient.neuro_grade || 'N/A'}\nPain Score: ${patient.pain_level || 'Not assessed'}/10\nWeight Bearing Status: ${patient.weight_bearing || patient.mobility || 'Not assessed'}\nSwelling Present: ${patient.swelling || 'Not assessed'}\n\nCurrent Medications: ${patient.medications || 'None listed'}\nActivity Goal: ${patient.activity_goal || 'Return to normal function'}\nHome Environment: ${patient.home_environment || 'Not specified'}\n\nAdditional Notes: ${patient.notes || 'None'}\n\nAnalyze this intake using Block 1-3 framework. Apply phase assignment, generate protocol table, and include Block 4 disclaimer.`;
  }

  try {
    const Anthropic = require('@anthropic-ai/sdk').default;
    const client = new Anthropic({ apiKey });

    // Set up SSE streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta?.text) {
        res.write(`data: ${JSON.stringify({ type: 'delta', text: event.delta.text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
  } catch (err) {
    console.error('VetAI error:', err.message);
    // If headers already sent (streaming started), end the stream
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ type: 'error', text: safeError(err) })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ error: safeError(err) });
    }
  }
});

// GET /api/vet-ai/status — Check if VetAI is configured
app.get('/api/vet-ai/status', (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const configured = apiKey && apiKey !== 'your-anthropic-api-key-here';
  res.json({
    configured,
    model: 'claude-sonnet-4-20250514',
    exerciseCount: ALL_EXERCISES.length,
    categories: [...new Set(ALL_EXERCISES.map(e => e.category))].length
  });
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
