// ============================================================================
// K9-REHAB-PRO — SQLite Provider (MODERN V2 ONLY, CLEAN, VALIDATED)
// ============================================================================

const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Import V2 exercise library
const {
  domains,
  phases,
  tiers,
  exercises
} = require("../data/exercise_library");

let db;

// ---------------------------------------------------------------------------
// Promise Helpers
// ---------------------------------------------------------------------------

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

// ---------------------------------------------------------------------------
// Initialize DB
// ---------------------------------------------------------------------------

async function initialize() {
  const dbPath = path.join(__dirname, "..", "k9rehab.db");

  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject(err);

      console.log("✅ Connected to SQLite database");

      db.run("PRAGMA foreign_keys = ON");

      resolve();
    });
  });
}

// ---------------------------------------------------------------------------
// Create ALL Tables (MODERN V2 ONLY)
// ---------------------------------------------------------------------------

async function createTables() {

  // USERS TABLE (AUTH)
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Patients
  await run(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      species TEXT NOT NULL DEFAULT 'canine',
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

  // Conditions
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

  // Clinics
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

  // Sessions
  await run(`
    CREATE TABLE IF NOT EXISTS sessions (
      session_id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      protocol_id TEXT,
      session_date DATE NOT NULL,
      therapist_name TEXT,
      pre_session_pain INTEGER,
      post_session_pain INTEGER,
      pre_session_lameness INTEGER,
      post_session_lameness INTEGER,
      session_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    )
  `);

  // Session Exercises
  await run(`
    CREATE TABLE IF NOT EXISTS session_exercises (
      session_exercise_id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      exercise_id TEXT NOT NULL,
      sets INTEGER,
      repetitions INTEGER,
      duration_seconds INTEGER,
      assistance_level TEXT,
      surface_type TEXT,
      observed_compensations TEXT,
      performance_notes TEXT,
      FOREIGN KEY (session_id) REFERENCES sessions(session_id)
    )
  `);

  // Protocol Exercises
  await run(`
    CREATE TABLE IF NOT EXISTS protocol_exercises (
      assignment_id INTEGER PRIMARY KEY AUTOINCREMENT,
      protocol_id TEXT NOT NULL,
      week_number INTEGER NOT NULL,
      exercise_id TEXT NOT NULL,
      exercise_name TEXT NOT NULL,
      dosage TEXT NOT NULL,
      frequency TEXT,
      notes TEXT
    )
  `);

  // Exercise Logs
  await run(`
    CREATE TABLE IF NOT EXISTS exercise_logs (
      log_id INTEGER PRIMARY KEY AUTOINCREMENT,
      protocol_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      week_number INTEGER,
      completed_date DATE NOT NULL,
      duration_minutes INTEGER,
      repetitions INTEGER,
      pain_level_post INTEGER,
      notes TEXT,
      logged_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Progress Assessments
  await run(`
    CREATE TABLE IF NOT EXISTS progress_assessments (
      assessment_id INTEGER PRIMARY KEY AUTOINCREMENT,
      protocol_id TEXT NOT NULL,
      week_number INTEGER NOT NULL,
      assessment_date DATE NOT NULL,
      pain_level INTEGER,
      mobility_level INTEGER,
      rom_measurement TEXT,
      girth_measurement TEXT,
      weight_bearing TEXT,
      gait_quality TEXT,
      therapist_notes TEXT
    )
  `);

  // B.E.A.U. Chat Sessions
  await run(`
    CREATE TABLE IF NOT EXISTS beau_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL DEFAULT 'New conversation',
      messages TEXT NOT NULL,
      patient_id INTEGER,
      patient_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // V2 Exercise Library Tables
  await run(`
    CREATE TABLE IF NOT EXISTS domains (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS phases (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS tiers (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS exercises_v2 (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      domain TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      video_url TEXT,
      FOREIGN KEY (domain) REFERENCES domains(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS exercise_phases_v2 (
      exercise_id TEXT NOT NULL,
      phase_id INTEGER NOT NULL,
      PRIMARY KEY (exercise_id, phase_id),
      FOREIGN KEY (exercise_id) REFERENCES exercises_v2(id),
      FOREIGN KEY (phase_id) REFERENCES phases(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS exercise_tiers_v2 (
      exercise_id TEXT NOT NULL,
      tier_id INTEGER NOT NULL,
      PRIMARY KEY (exercise_id, tier_id),
      FOREIGN KEY (exercise_id) REFERENCES exercises_v2(id),
      FOREIGN KEY (tier_id) REFERENCES tiers(id)
    )
  `);

  // Migration: add species column to existing patients table
  try {
    await run("ALTER TABLE patients ADD COLUMN species TEXT NOT NULL DEFAULT 'canine'");
    console.log("📦 Migration: added species column to patients");
  } catch { /* column already exists */ }

  // Migration: add dashboard_data, visit_count, last_visit_date for returning patient support
  try {
    await run("ALTER TABLE patients ADD COLUMN dashboard_data TEXT DEFAULT '{}'");
    console.log("📦 Migration: added dashboard_data column to patients");
  } catch { /* column already exists */ }
  try {
    await run("ALTER TABLE patients ADD COLUMN visit_count INTEGER DEFAULT 0");
    console.log("📦 Migration: added visit_count column to patients");
  } catch { /* column already exists */ }
  try {
    await run("ALTER TABLE patients ADD COLUMN last_visit_date TEXT");
    console.log("📦 Migration: added last_visit_date column to patients");
  } catch { /* column already exists */ }

  console.log("📦 All tables created (V2 only)");
}

// ---------------------------------------------------------------------------
// SEEDING — V2 ONLY
// ---------------------------------------------------------------------------

async function seedV2Library() {
  const domainCount = await get("SELECT COUNT(*) AS count FROM domains");
  if (domainCount.count > 0) {
    console.log("🌱 V2 library already seeded");
    return;
  }

  console.log("🌱 Seeding V2 exercise library...");

  // Domains
  for (const d of domains) {
    await run(
      `INSERT INTO domains (id, name, description) VALUES (?, ?, ?)`,
      [d.id, d.name, d.description]
    );
  }

  // Phases
  for (const p of phases) {
    await run(
      `INSERT INTO phases (id, name, description) VALUES (?, ?, ?)`,
      [p.id, p.name, p.description]
    );
  }

  // Tiers
  for (const t of tiers) {
    await run(
      `INSERT INTO tiers (id, name, description) VALUES (?, ?, ?)`,
      [t.id, t.name, t.description]
    );
  }

  // Exercises
  for (const ex of exercises) {
    await run(
      `INSERT INTO exercises_v2 (id, name, domain, category, description, video_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        ex.id,
        ex.name,
        ex.domain,
        ex.category,
        ex.description || null,
        ex.video_url || null
      ]
    );

    // Phases
    for (const ph of ex.phases) {
      await run(
        `INSERT INTO exercise_phases_v2 (exercise_id, phase_id) VALUES (?, ?)`,
        [ex.id, ph]
      );
    }

    // Tiers
    for (const tr of ex.tiers) {
      await run(
        `INSERT INTO exercise_tiers_v2 (exercise_id, tier_id) VALUES (?, ?)`,
        [ex.id, tr]
      );
    }
  }

  console.log("✅ V2 exercise library seeded");
}

// ---------------------------------------------------------------------------
// AUTH HELPERS — USERS
// ---------------------------------------------------------------------------

async function findUserByUsername(username) {
  return await get(
    `SELECT * FROM users WHERE username = ?`,
    [username]
  );
}

async function findUserById(id) {
  return await get(
    `SELECT * FROM users WHERE id = ?`,
    [id]
  );
}

async function createUser(username, passwordHash, role = "user") {
  await run(
    `INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)`,
    [username, passwordHash, role]
  );

  return await findUserByUsername(username);
}

// ---------------------------------------------------------------------------
// EXPORTS
// ---------------------------------------------------------------------------

module.exports = {
  initialize,
  createTables,
  seedV2Library,
  run,
  get,
  all,
  findUserByUsername,
  findUserById,
  createUser
};