// ============================================================================
// K9-REHAB-PRO — SQLite Provider
// Promise-wrapped extraction of all active SQLite queries from server.js,
// auth.js, and database.js. Drop-in replacement interface for Supabase provider.
// ============================================================================

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let db;

// ── Helpers ─────────────────────────────────────────────────────────────────

function run(sql, params = []) {
  if (!db) throw new Error('Database not initialized — call initialize() first');
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  if (!db) throw new Error('Database not initialized — call initialize() first');
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  if (!db) throw new Error('Database not initialized — call initialize() first');
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

function serialize(fn) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      try { fn(); resolve(); }
      catch (e) { reject(e); }
    });
  });
}

// ── Initialize ──────────────────────────────────────────────────────────────

async function initialize() {
  const IS_PKG = typeof process.pkg !== 'undefined';
  const defaultDbPath = IS_PKG
    ? path.join(path.dirname(process.execPath), 'data', 'database.db')
    : path.join(__dirname, '..', 'database.db');
  const dbPath = process.env.DB_PATH || defaultDbPath;
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject(err);
      console.log('✅ Connected to SQLite database');
      db.run('PRAGMA foreign_keys = ON', (pragmaErr) => {
        if (pragmaErr) console.error('Foreign keys pragma failed:', pragmaErr.message);
        resolve();
      });
    });
  });
}

async function createTables() {
  // server.js tables (the active schema)
  await run(`
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
      rom_joint TEXT,
      rom_flexion TEXT,
      rom_extension TEXT,
      rom_flexion_contralateral TEXT,
      rom_extension_contralateral TEXT,
      hcpi_score TEXT,
      cbpi_pss TEXT,
      cbpi_pis TEXT,
      load_score TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ── ROM column migrations — safe no-op if columns already exist ──
  const romCols = [
    'rom_joint TEXT',
    'rom_flexion TEXT',
    'rom_extension TEXT',
    'rom_flexion_contralateral TEXT',
    'rom_extension_contralateral TEXT',
    'hcpi_score TEXT',
    'cbpi_pss TEXT',
    'cbpi_pis TEXT',
    'load_score TEXT'
  ];
  for (const col of romCols) {
    try { await run(`ALTER TABLE patients ADD COLUMN ${col}`); } catch (e) {
      if (!e.message.includes('duplicate column')) console.error(`Migration error for column ${col}:`, e.message);
    }
  }

  await run(`
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

  await run(`
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

  await run(`
    CREATE TABLE IF NOT EXISTS protocols (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER,
      protocol_data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    )
  `);

  // auth.js table
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'clinician',
      display_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add tos_accepted_at column if not present
  try { await run('ALTER TABLE users ADD COLUMN tos_accepted_at TEXT'); } catch (e) {
    if (!e.message.includes('duplicate column')) console.error('TOS column migration error:', e.message);
  }

  // audit_log table
  await run(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      action TEXT NOT NULL,
      resource_type TEXT,
      resource_id TEXT,
      user_label TEXT DEFAULT 'system',
      ip_address TEXT,
      request_method TEXT,
      request_path TEXT,
      status_code INTEGER,
      detail TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // B.E.A.U. session storage
  await run(`
    CREATE TABLE IF NOT EXISTS beau_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      patient_id INTEGER,
      title TEXT,
      messages TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    )
  `);

  // Clinic profiles
  await run(`
    CREATE TABLE IF NOT EXISTS clinics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clinic_name TEXT NOT NULL DEFAULT '',
      contact_email TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      address TEXT DEFAULT '',
      website TEXT DEFAULT '',
      license_number TEXT DEFAULT '',
      dea_number TEXT DEFAULT '',
      clinic_type TEXT DEFAULT 'general_practice',
      logo_url TEXT DEFAULT '',
      primary_color TEXT DEFAULT '#0F4C81',
      secondary_color TEXT DEFAULT '#0EA5E9',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Exercise Library v2 tables (database.js)
  await run(`CREATE TABLE IF NOT EXISTS domains (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT)`);
  await run(`CREATE TABLE IF NOT EXISTS phases (id INTEGER PRIMARY KEY, name TEXT NOT NULL, description TEXT)`);
  await run(`CREATE TABLE IF NOT EXISTS tiers (id INTEGER PRIMARY KEY, name TEXT NOT NULL, description TEXT)`);
  await run(`
    CREATE TABLE IF NOT EXISTS exercises_v2 (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, domain TEXT NOT NULL,
      category TEXT NOT NULL, description TEXT, video_url TEXT,
      FOREIGN KEY (domain) REFERENCES domains(id)
    )
  `);
  await run(`
    CREATE TABLE IF NOT EXISTS exercise_phases_v2 (
      exercise_id TEXT NOT NULL, phase_id INTEGER NOT NULL,
      PRIMARY KEY (exercise_id, phase_id),
      FOREIGN KEY (exercise_id) REFERENCES exercises_v2(id),
      FOREIGN KEY (phase_id) REFERENCES phases(id)
    )
  `);
  await run(`
    CREATE TABLE IF NOT EXISTS exercise_tiers_v2 (
      exercise_id TEXT NOT NULL, tier_id INTEGER NOT NULL,
      PRIMARY KEY (exercise_id, tier_id),
      FOREIGN KEY (exercise_id) REFERENCES exercises_v2(id),
      FOREIGN KEY (tier_id) REFERENCES tiers(id)
    )
  `);

  // Session tables
  await run(`
    CREATE TABLE IF NOT EXISTS sessions (
      session_id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL, protocol_id TEXT, session_date DATE NOT NULL,
      therapist_name TEXT, pre_session_pain INTEGER, post_session_pain INTEGER,
      pre_session_lameness INTEGER, post_session_lameness INTEGER, session_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    )
  `);
  await run(`
    CREATE TABLE IF NOT EXISTS session_exercises (
      session_exercise_id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL, exercise_id TEXT NOT NULL,
      sets INTEGER, repetitions INTEGER, duration_seconds INTEGER,
      assistance_level TEXT, surface_type TEXT, observed_compensations TEXT,
      performance_notes TEXT,
      FOREIGN KEY (session_id) REFERENCES sessions(session_id)
    )
  `);
  await run(`
    CREATE TABLE IF NOT EXISTS protocol_exercises (
      assignment_id INTEGER PRIMARY KEY AUTOINCREMENT,
      protocol_id TEXT NOT NULL, week_number INTEGER NOT NULL,
      exercise_id TEXT NOT NULL, exercise_name TEXT NOT NULL,
      dosage TEXT NOT NULL, frequency TEXT, notes TEXT
    )
  `);
  await run(`
    CREATE TABLE IF NOT EXISTS exercise_logs (
      log_id INTEGER PRIMARY KEY AUTOINCREMENT,
      protocol_id TEXT NOT NULL, exercise_id TEXT NOT NULL, week_number INTEGER,
      completed_date DATE NOT NULL, duration_minutes INTEGER, repetitions INTEGER,
      pain_level_post INTEGER, notes TEXT, logged_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await run(`
    CREATE TABLE IF NOT EXISTS progress_assessments (
      assessment_id INTEGER PRIMARY KEY AUTOINCREMENT,
      protocol_id TEXT NOT NULL, week_number INTEGER NOT NULL,
      assessment_date DATE NOT NULL, pain_level INTEGER, mobility_level INTEGER,
      rom_measurement TEXT, girth_measurement TEXT, weight_bearing TEXT,
      gait_quality TEXT, therapist_notes TEXT
    )
  `);

  console.log('✅ Database tables initialized');
}

// ── Seed Data ───────────────────────────────────────────────────────────────

async function seedConditions(conditionsList) {
  const existing = await get('SELECT COUNT(*) as count FROM conditions');
  if (existing.count > 0) return;
  const stmt = db.prepare(
    `INSERT OR IGNORE INTO conditions (code, name, category, severity, description,
      typical_recovery_weeks, recommended_exercises, contraindicated_exercises, special_considerations)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const c of conditionsList) {
    stmt.run(c.code, c.name, c.category, c.severity || null, c.description || null,
      c.typical_recovery_weeks || 8, c.recommended_exercises || null,
      c.contraindicated_exercises || null, c.special_considerations || null);
  }
  return new Promise((resolve) => stmt.finalize(() => resolve()));
}

async function seedExercises(exercisesList) {
  const existing = await get('SELECT COUNT(*) as count FROM exercises');
  const masterCount = exercisesList.length;

  // Always upsert so the DB matches the master exercise list (all-exercises.js).
  // This handles new exercises being added, stale duplicates being removed, and
  // metadata corrections (name, category, description changes) being picked up on every restart.
  const countChanged = existing.count !== masterCount;
  console.log(countChanged
    ? `🔄 Syncing exercises table: DB has ${existing.count}, master has ${masterCount}`
    : `🔄 Refreshing exercises table (${masterCount} exercises)`);

  // 1. Upsert every exercise from the master list
  const stmt = db.prepare(
    `INSERT OR REPLACE INTO exercises (code, name, category, description, equipment, setup,
      steps, good_form, common_mistakes, red_flags, progression, contraindications, difficulty_level)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const ex of exercisesList) {
    stmt.run(
      ex.code, ex.name, ex.category || 'General', ex.description || null,
      JSON.stringify(ex.equipment || []), ex.setup || null,
      JSON.stringify(ex.steps || []), JSON.stringify(ex.good_form || []),
      JSON.stringify(ex.common_mistakes || []), JSON.stringify(ex.red_flags || []),
      ex.progression || null, ex.contraindications || null, ex.difficulty_level || 'Moderate'
    );
  }
  await new Promise((resolve) => stmt.finalize(() => resolve()));

  // 2. Remove stale rows whose codes no longer appear in the master list
  const masterCodes = new Set(exercisesList.map(ex => ex.code));
  const dbRows = await all('SELECT code FROM exercises');
  const staleCodes = dbRows.filter(row => !masterCodes.has(row.code)).map(row => row.code);
  if (staleCodes.length > 0) {
    const placeholders = staleCodes.map(() => '?').join(',');
    await run(`DELETE FROM exercises WHERE code IN (${placeholders})`, staleCodes);
    console.log(`🗑️  Removed ${staleCodes.length} stale exercises: ${staleCodes.join(', ')}`);
  }

  const final = await get('SELECT COUNT(*) as count FROM exercises');
  console.log(`✅ Exercises table synced: ${final.count} rows`);
}

// ── Patients ────────────────────────────────────────────────────────────────

async function getAllPatients() {
  return all('SELECT * FROM patients ORDER BY created_at DESC');
}

async function createPatient(data) {
  const result = await run(
    `INSERT INTO patients (name, breed, age, weight, sex, condition, affected_region,
      surgery_date, lameness_grade, body_condition_score, pain_level, mobility_level,
      current_medications, medical_history, special_instructions, client_name,
      client_email, client_phone, referring_vet,
      rom_joint, rom_flexion, rom_extension, rom_flexion_contralateral, rom_extension_contralateral,
      hcpi_score, cbpi_pss, cbpi_pis, load_score)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.name, data.breed, data.age, data.weight, data.sex, data.condition,
     data.affected_region, data.surgery_date, data.lameness_grade, data.body_condition_score,
     data.pain_level, data.mobility_level, data.current_medications, data.medical_history,
     data.special_instructions, data.client_name, data.client_email, data.client_phone,
     data.referring_vet,
     data.rom_joint || null, data.rom_flexion || null, data.rom_extension || null,
     data.rom_flexion_contralateral || null, data.rom_extension_contralateral || null,
     data.hcpi_score || null, data.cbpi_pss || null, data.cbpi_pis || null, data.load_score || null]
  );
  return { id: result.lastID };
}

async function updatePatientMeasures(id, data) {
  const result = await run(
    `UPDATE patients SET
      rom_joint = ?, rom_flexion = ?, rom_extension = ?,
      rom_flexion_contralateral = ?, rom_extension_contralateral = ?,
      hcpi_score = ?, cbpi_pss = ?, cbpi_pis = ?, load_score = ?
     WHERE id = ?`,
    [data.rom_joint || null, data.rom_flexion || null, data.rom_extension || null,
     data.rom_flexion_contralateral || null, data.rom_extension_contralateral || null,
     data.hcpi_score || null, data.cbpi_pss || null, data.cbpi_pis || null,
     data.load_score || null, id]
  );
  return { changes: result.changes };
}

async function deletePatient(id) {
  await run('DELETE FROM protocols WHERE patient_id = ?', [id]);
  const result = await run('DELETE FROM patients WHERE id = ?', [id]);
  return { changes: result.changes };
}

async function deletePatientsById(ids) {
  const placeholders = ids.map(() => '?').join(',');
  const result = await run(`DELETE FROM patients WHERE id IN (${placeholders})`, ids);
  return { changes: result.changes };
}

// ── Protocols ───────────────────────────────────────────────────────────────

async function createProtocol(patientId, protocolData) {
  await run(
    'INSERT INTO protocols (patient_id, protocol_data) VALUES (?, ?)',
    [patientId, JSON.stringify(protocolData)]
  );
}

async function deleteProtocolsByPatient(patientId) {
  return run('DELETE FROM protocols WHERE patient_id = ?', [patientId]);
}

async function getProtocolsByPatient(patientId) {
  const rows = await all(
    'SELECT * FROM protocols WHERE patient_id = ? ORDER BY created_at DESC',
    [patientId]
  );
  return rows.map(r => ({
    ...r,
    protocol_data: r.protocol_data ? JSON.parse(r.protocol_data) : null,
  }));
}

// ── Conditions ──────────────────────────────────────────────────────────────

async function getAllConditions() {
  return all('SELECT * FROM conditions ORDER BY category, name');
}

// ── Exercises (DB-stored, used by generateProtocol) ─────────────────────────

async function getAllExercisesFromDb() {
  return all('SELECT * FROM exercises');
}

// ── Health Check Counts ─────────────────────────────────────────────────────

async function acceptTos(userId) {
  return run('UPDATE users SET tos_accepted_at = ? WHERE id = ?', [new Date().toISOString(), userId]);
}

async function getPatientCount() {
  const row = await get('SELECT COUNT(*) as patientCount FROM patients');
  return row ? row.patientCount : 0;
}

async function getProtocolCount() {
  const row = await get('SELECT COUNT(*) as protocolCount FROM protocols');
  return row ? row.protocolCount : 0;
}

// ── Audit Log ───────────────────────────────────────────────────────────────

async function insertAuditLog(entry) {
  const { action, resource_type, resource_id, user_label, ip_address,
    request_method, request_path, status_code, detail } = entry;
  return run(
    `INSERT INTO audit_log (action, resource_type, resource_id, user_label,
      ip_address, request_method, request_path, status_code, detail)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [action, resource_type || null, resource_id || null, user_label || 'system',
     ip_address || null, request_method || null, request_path || null,
     status_code || null, detail || null]
  );
}

async function getAuditLog(limit = 200, offset = 0) {
  const rows = await all(
    'SELECT * FROM audit_log ORDER BY id DESC LIMIT ? OFFSET ?',
    [limit, offset]
  );
  const countRow = await get('SELECT COUNT(*) as total FROM audit_log');
  return { rows, total: countRow?.total || 0 };
}

async function getAuditLogStats() {
  return all(
    `SELECT action, COUNT(*) as count, MAX(timestamp) as last_occurrence
     FROM audit_log GROUP BY action ORDER BY count DESC`
  );
}

async function getAuditLogExport() {
  return all('SELECT * FROM audit_log ORDER BY id DESC');
}

async function purgeAuditLog(cutoffDate) {
  const result = await run('DELETE FROM audit_log WHERE timestamp < ?', [cutoffDate]);
  return { changes: result.changes };
}

// ── Users (auth) ────────────────────────────────────────────────────────────

async function getUserCount() {
  const row = await get('SELECT COUNT(*) as count FROM users');
  return row.count;
}

async function findUserByUsername(username) {
  return get('SELECT * FROM users WHERE username = ?', [username]);
}

async function findUserById(id) {
  return get(
    'SELECT id, username, role, display_name, created_at FROM users WHERE id = ?',
    [id]
  );
}

async function createUser({ username, password_hash, role, display_name }) {
  const result = await run(
    'INSERT INTO users (username, password_hash, role, display_name) VALUES (?, ?, ?, ?)',
    [username, password_hash, role || 'clinician', display_name || username]
  );
  return { id: result.lastID, username, role: role || 'clinician' };
}

// ── Exercise Library v2 (database.js) ───────────────────────────────────────

const exerciseLibrary = {
  getAllExercises: async (filters = {}) => {
    let sql = `
      SELECT DISTINCT e.id, e.name, e.domain, e.category, d.name as domain_name,
        GROUP_CONCAT(DISTINCT ep.phase_id) as phases,
        GROUP_CONCAT(DISTINCT et.tier_id) as tiers
      FROM exercises_v2 e
      LEFT JOIN domains d ON e.domain = d.id
      LEFT JOIN exercise_phases_v2 ep ON e.id = ep.exercise_id
      LEFT JOIN exercise_tiers_v2 et ON e.id = et.exercise_id
      WHERE 1=1
    `;
    const params = [];
    if (filters.domain) { sql += ' AND e.domain = ?'; params.push(filters.domain); }
    if (filters.phase) { sql += ' AND e.id IN (SELECT exercise_id FROM exercise_phases_v2 WHERE phase_id = ?)'; params.push(parseInt(filters.phase)); }
    if (filters.tier) { sql += ' AND e.id IN (SELECT exercise_id FROM exercise_tiers_v2 WHERE tier_id = ?)'; params.push(parseInt(filters.tier)); }
    sql += ' GROUP BY e.id ORDER BY e.domain, e.id';

    const rows = await all(sql, params);
    return rows.map(row => ({
      ...row,
      phases: row.phases ? row.phases.split(',').map(Number) : [],
      tiers: row.tiers ? row.tiers.split(',').map(Number) : []
    }));
  },

  getExerciseById: async (id) => {
    const row = await get(`
      SELECT e.id, e.name, e.domain, e.category, d.name as domain_name,
        GROUP_CONCAT(DISTINCT ep.phase_id) as phases,
        GROUP_CONCAT(DISTINCT et.tier_id) as tiers
      FROM exercises_v2 e
      LEFT JOIN domains d ON e.domain = d.id
      LEFT JOIN exercise_phases_v2 ep ON e.id = ep.exercise_id
      LEFT JOIN exercise_tiers_v2 et ON e.id = et.exercise_id
      WHERE e.id = ?
      GROUP BY e.id
    `, [id]);
    if (!row) return null;
    return {
      ...row,
      phases: row.phases ? row.phases.split(',').map(Number) : [],
      tiers: row.tiers ? row.tiers.split(',').map(Number) : []
    };
  },

  getDomains: () => all('SELECT * FROM domains ORDER BY id'),
  getPhases: () => all('SELECT * FROM phases ORDER BY id'),
  getTiers: () => all('SELECT * FROM tiers ORDER BY id'),
};

// ── Exercise Library v2 Seeding (database.js) ──────────────────────────────

async function seedExerciseLibrary() {
  const existing = await get('SELECT COUNT(*) as count FROM domains');
  if (existing.count > 0) {
    console.log('✅ Exercise library already seeded');
    return;
  }

  console.log('🌱 Seeding exercise library...');

  const domains = [
    { id: 'MOB', name: 'Mobility and Range of Motion' },
    { id: 'WB', name: 'Weight Bearing and Foundational Strength' },
    { id: 'CORE', name: 'Core Stability and Postural Control' },
    { id: 'BAL', name: 'Balance and Proprioception' },
    { id: 'GAIT', name: 'Gait Retraining' },
    { id: 'END', name: 'Endurance and Cardiovascular Conditioning' },
    { id: 'FUNC', name: 'Functional Strength and Task Training' },
    { id: 'ATH', name: 'Athletic Performance and Return to Sport' }
  ];

  const phases = [
    { id: 1, name: 'Protection and Mobility' },
    { id: 2, name: 'Early Strength' },
    { id: 3, name: 'Advanced Strength and Coordination' },
    { id: 4, name: 'Functional Reintegration' },
    { id: 5, name: 'Return to Sport or Maintenance' }
  ];

  const tiers = [
    { id: 1, name: 'Passive or Fully Assisted' },
    { id: 2, name: 'Low Load Active' },
    { id: 3, name: 'Moderate Resistance or Coordination' },
    { id: 4, name: 'Advanced Strength or Balance' },
    { id: 5, name: 'Athletic or High Demand' }
  ];

  const exercises = [
    { id: 'MOB-P1-01', name: 'Passive Range of Motion', domain: 'MOB', category: 'Passive Mobility', phases: [1], tiers: [1] },
    { id: 'MOB-P1-02', name: 'Passive Cycling', domain: 'MOB', category: 'Passive Mobility', phases: [1], tiers: [1] },
    { id: 'MOB-P1-03', name: 'Joint Approximation', domain: 'MOB', category: 'Passive Mobility', phases: [1], tiers: [1] },
    { id: 'MOB-P1-04', name: 'Passive Stretching', domain: 'MOB', category: 'Passive Mobility', phases: [1,2], tiers: [1,2] },
    { id: 'MOB-P1-05', name: 'Assisted Limb Placement', domain: 'MOB', category: 'Assisted Mobility', phases: [1,2], tiers: [1,2] },
    { id: 'MOB-P1-06', name: 'Neurologic Toe Stimulation', domain: 'MOB', category: 'Assisted Mobility', phases: [1], tiers: [1] },
    { id: 'WB-TS-01', name: 'Sit to Stand', domain: 'WB', category: 'Transitional Strength', phases: [2,3,4], tiers: [2,3,4] },
    { id: 'WB-TS-02', name: 'Stand to Sit', domain: 'WB', category: 'Transitional Strength', phases: [2,3,4], tiers: [2,3,4] },
    { id: 'WB-ST-03', name: 'Square Stand', domain: 'WB', category: 'Static Strength', phases: [1,2,3], tiers: [1,2] },
    { id: 'WB-ST-04', name: 'Static Hold Stand', domain: 'WB', category: 'Static Strength', phases: [2,3], tiers: [2,3] },
    { id: 'WB-ST-05', name: 'Three Legged Stand', domain: 'WB', category: 'Static Strength', phases: [3,4], tiers: [3,4] },
    { id: 'WB-AS-06', name: 'Assisted Standing', domain: 'WB', category: 'Supported Stance', phases: [1,2], tiers: [1,2] },
    { id: 'WB-WS-07', name: 'Lateral Weight Shift', domain: 'WB', category: 'Weight Shifting', phases: [2,3], tiers: [2,3] },
    { id: 'WB-WS-08', name: 'Cranial Caudal Weight Shift', domain: 'WB', category: 'Weight Shifting', phases: [2,3], tiers: [2,3] },
    { id: 'CORE-ST-01', name: 'Peanut Ball Stand', domain: 'CORE', category: 'Static Core', phases: [2,3], tiers: [2,3] },
    { id: 'CORE-ST-02', name: 'Forelimb Elevation', domain: 'CORE', category: 'Static Core', phases: [2,3], tiers: [2,3] },
    { id: 'CORE-ST-03', name: 'Hindlimb Elevation', domain: 'CORE', category: 'Static Core', phases: [3,4], tiers: [3,4] },
    { id: 'CORE-DY-04', name: 'Diagonal Limb Lift', domain: 'CORE', category: 'Dynamic Core', phases: [3,4], tiers: [3,4] },
    { id: 'CORE-DY-05', name: 'Core Bracing Hold', domain: 'CORE', category: 'Dynamic Core', phases: [2,3], tiers: [2,3] },
    { id: 'BAL-ST-01', name: 'Balance Disc Stand', domain: 'BAL', category: 'Static Balance', phases: [2,3], tiers: [2,3] },
    { id: 'BAL-ST-02', name: 'Wobble Board Stand', domain: 'BAL', category: 'Static Balance', phases: [3,4], tiers: [3,4] },
    { id: 'BAL-DY-03', name: 'Rocking Weight Shift', domain: 'BAL', category: 'Dynamic Balance', phases: [2,3], tiers: [2,3] },
    { id: 'BAL-DY-04', name: 'Unstable Surface Stand', domain: 'BAL', category: 'Dynamic Balance', phases: [3,4], tiers: [3,4] },
    { id: 'BAL-DY-05', name: 'Lateral Platform Step', domain: 'BAL', category: 'Dynamic Balance', phases: [3,4], tiers: [3,4] },
    { id: 'GAIT-SL-01', name: 'Controlled Leash Walk', domain: 'GAIT', category: 'Straight Line', phases: [1,2,3,4], tiers: [1,2] },
    { id: 'GAIT-SL-02', name: 'Treadmill Walk', domain: 'GAIT', category: 'Straight Line', phases: [2,3,4], tiers: [2,3] },
    { id: 'GAIT-DIR-03', name: 'Figure 8 Walk', domain: 'GAIT', category: 'Directional', phases: [3,4], tiers: [3] },
    { id: 'GAIT-DIR-04', name: 'Circle Walk', domain: 'GAIT', category: 'Directional', phases: [2,3,4], tiers: [2,3] },
    { id: 'GAIT-DIR-05', name: 'Backward Walk', domain: 'GAIT', category: 'Directional', phases: [3,4], tiers: [3,4] },
    { id: 'GAIT-DIR-06', name: 'Side Step', domain: 'GAIT', category: 'Directional', phases: [3,4], tiers: [3,4] },
    { id: 'GAIT-OBS-07', name: 'Low Cavaletti', domain: 'GAIT', category: 'Obstacle', phases: [3,4], tiers: [3] },
    { id: 'GAIT-OBS-08', name: 'Raised Cavaletti', domain: 'GAIT', category: 'Obstacle', phases: [4,5], tiers: [4] },
    { id: 'GAIT-OBS-09', name: 'Obstacle Step', domain: 'GAIT', category: 'Obstacle', phases: [3,4], tiers: [3,4] },
    { id: 'END-AQ-01', name: 'Underwater Treadmill', domain: 'END', category: 'Aquatic', phases: [2,3,4], tiers: [2,3] },
    { id: 'END-AQ-02', name: 'Swimming', domain: 'END', category: 'Aquatic', phases: [3,4,5], tiers: [3,4] },
    { id: 'END-LD-03', name: 'Hill Walking', domain: 'END', category: 'Land Endurance', phases: [3,4,5], tiers: [3,4] },
    { id: 'END-LD-04', name: 'Incline Treadmill', domain: 'END', category: 'Land Endurance', phases: [3,4], tiers: [3,4] },
    { id: 'END-LD-05', name: 'Stair Climbing', domain: 'END', category: 'Land Endurance', phases: [3,4,5], tiers: [3,4] },
    { id: 'END-LD-06', name: 'Endurance Leash Walking', domain: 'END', category: 'Land Endurance', phases: [2,3,4], tiers: [2,3] },
    { id: 'FUNC-TR-01', name: 'Sit to Beg', domain: 'FUNC', category: 'Transitional Movements', phases: [3,4], tiers: [3,4] },
    { id: 'FUNC-TR-02', name: 'Pivot Exercise', domain: 'FUNC', category: 'Transitional Movements', phases: [3,4], tiers: [3,4] },
    { id: 'FUNC-TR-03', name: 'Tight Turns', domain: 'FUNC', category: 'Environmental Navigation', phases: [3,4], tiers: [3] },
    { id: 'FUNC-TR-04', name: 'Platform Step', domain: 'FUNC', category: 'Environmental Navigation', phases: [3,4,5], tiers: [3,4] },
    { id: 'FUNC-TR-05', name: 'Controlled Fetch', domain: 'FUNC', category: 'Task Specific', phases: [4,5], tiers: [4,5] },
    { id: 'ATH-PL-01', name: 'Low Jump Grid', domain: 'ATH', category: 'Plyometric', phases: [4,5], tiers: [4,5] },
    { id: 'ATH-PL-02', name: 'Sprint Intervals', domain: 'ATH', category: 'Sprint', phases: [5], tiers: [5] },
    { id: 'ATH-PL-03', name: 'Direction Change Drill', domain: 'ATH', category: 'Agility', phases: [4,5], tiers: [4,5] },
    { id: 'ATH-PL-04', name: 'Sport Obstacle Sequence', domain: 'ATH', category: 'Agility', phases: [5], tiers: [5] }
  ];

  const domainStmt = db.prepare('INSERT INTO domains (id, name) VALUES (?, ?)');
  domains.forEach(d => domainStmt.run(d.id, d.name));
  await new Promise(r => domainStmt.finalize(r));

  const phaseStmt = db.prepare('INSERT INTO phases (id, name) VALUES (?, ?)');
  phases.forEach(p => phaseStmt.run(p.id, p.name));
  await new Promise(r => phaseStmt.finalize(r));

  const tierStmt = db.prepare('INSERT INTO tiers (id, name) VALUES (?, ?)');
  tiers.forEach(t => tierStmt.run(t.id, t.name));
  await new Promise(r => tierStmt.finalize(r));

  const exerciseStmt = db.prepare('INSERT INTO exercises_v2 (id, name, domain, category) VALUES (?, ?, ?, ?)');
  const phaseJunctionStmt = db.prepare('INSERT INTO exercise_phases_v2 (exercise_id, phase_id) VALUES (?, ?)');
  const tierJunctionStmt = db.prepare('INSERT INTO exercise_tiers_v2 (exercise_id, tier_id) VALUES (?, ?)');

  exercises.forEach(ex => {
    exerciseStmt.run(ex.id, ex.name, ex.domain, ex.category);
    ex.phases.forEach(phase => phaseJunctionStmt.run(ex.id, phase));
    ex.tiers.forEach(tier => tierJunctionStmt.run(ex.id, tier));
  });

  await new Promise(r => exerciseStmt.finalize(r));
  await new Promise(r => phaseJunctionStmt.finalize(r));
  await new Promise(r => tierJunctionStmt.finalize(() => r()));

  console.log('✅ Exercise library seeded: 8 domains, 5 phases, 5 tiers, 50 exercises');
}

// ── B.E.A.U. Sessions ──────────────────────────────────────────────────────

async function createBeauSession({ user_id, patient_id, title, messages }) {
  const result = await run(
    `INSERT INTO beau_sessions (user_id, patient_id, title, messages) VALUES (?, ?, ?, ?)`,
    [user_id, patient_id || null, title || null, JSON.stringify(messages)]
  );
  return { id: result.lastID };
}

async function updateBeauSession(id, user_id, { title, messages }) {
  await run(
    `UPDATE beau_sessions SET title = ?, messages = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?`,
    [title || null, JSON.stringify(messages), id, user_id]
  );
  return { id };
}

async function getBeauSessionsByUser(user_id) {
  return all(
    `SELECT bs.*, p.name as patient_name
     FROM beau_sessions bs
     LEFT JOIN patients p ON bs.patient_id = p.id
     WHERE bs.user_id = ?
     ORDER BY bs.updated_at DESC`,
    [user_id]
  );
}

async function getBeauSessionsByPatient(patient_id, user_id) {
  return all(
    `SELECT bs.*, p.name as patient_name
     FROM beau_sessions bs
     LEFT JOIN patients p ON bs.patient_id = p.id
     WHERE bs.patient_id = ? AND bs.user_id = ?
     ORDER BY bs.updated_at DESC`,
    [patient_id, user_id]
  );
}

async function getAllBeauSessions() {
  return all(
    `SELECT bs.*, p.name as patient_name
     FROM beau_sessions bs
     LEFT JOIN patients p ON bs.patient_id = p.id
     ORDER BY bs.updated_at DESC`
  );
}

// ── Clinics ─────────────────────────────────────────────────────────────────

async function getAllClinics() {
  return all('SELECT * FROM clinics ORDER BY id');
}

async function createClinic(data) {
  const result = await run(
    `INSERT INTO clinics (clinic_name, contact_email, phone, address, website, license_number, dea_number, clinic_type, logo_url, primary_color, secondary_color)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.clinic_name || '', data.contact_email || '', data.phone || '', data.address || '',
     data.website || '', data.license_number || '', data.dea_number || '', data.clinic_type || 'general_practice',
     data.logo_url || '', data.primary_color || '#0F4C81', data.secondary_color || '#0EA5E9']
  );
  return { id: result.lastID, ...data };
}

async function updateClinic(id, data) {
  await run(
    `UPDATE clinics SET clinic_name = ?, contact_email = ?, phone = ?, address = ?, website = ?,
     license_number = ?, dea_number = ?, clinic_type = ?, logo_url = ?, primary_color = ?, secondary_color = ?,
     updated_at = datetime('now') WHERE id = ?`,
    [data.clinic_name || '', data.contact_email || '', data.phone || '', data.address || '',
     data.website || '', data.license_number || '', data.dea_number || '', data.clinic_type || 'general_practice',
     data.logo_url || '', data.primary_color || '#0F4C81', data.secondary_color || '#0EA5E9', id]
  );
  return { id, ...data };
}

// ── Close ───────────────────────────────────────────────────────────────────

async function close() {
  return new Promise((resolve) => {
    if (db) db.close(() => resolve());
    else resolve();
  });
}

// ── Export ───────────────────────────────────────────────────────────────────

module.exports = {
  initialize,
  createTables,
  seedConditions,
  seedExercises,
  seedExerciseLibrary,
  close,

  // Patients
  getAllPatients,
  createPatient,
  updatePatientMeasures,
  deletePatient,
  deletePatientsById,

  // Protocols
  createProtocol,
  deleteProtocolsByPatient,
  getProtocolsByPatient,

  // Conditions
  getAllConditions,

  // Exercises
  getAllExercisesFromDb,

  // Users
  acceptTos,

  // Health
  getPatientCount,
  getProtocolCount,

  // Audit
  insertAuditLog,
  getAuditLog,
  getAuditLogStats,
  getAuditLogExport,
  purgeAuditLog,

  // Users
  getUserCount,
  findUserByUsername,
  findUserById,
  createUser,

  // B.E.A.U. Sessions
  createBeauSession,
  updateBeauSession,
  getBeauSessionsByUser,
  getBeauSessionsByPatient,
  getAllBeauSessions,

  // Clinics
  getAllClinics,
  createClinic,
  updateClinic,

  // Exercise Library v2
  exerciseLibrary,
};
