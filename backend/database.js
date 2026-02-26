// ============================================================================
// K9-REHAB-PRO DATABASE SCHEMA v1.0
// SQLite Database Implementation
// ============================================================================

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path — consolidated into single database.db
const DB_PATH = path.join(__dirname, 'database.db');

// Initialize database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
  } else {
    console.log('✅ Connected to K9-REHAB-PRO database');
  }
});

// ============================================================================
// SCHEMA INITIALIZATION
// ============================================================================

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      
      // PATIENTS TABLE
      db.run(`
        CREATE TABLE IF NOT EXISTS patients (
          patient_id INTEGER PRIMARY KEY AUTOINCREMENT,
          client_name TEXT NOT NULL,
          patient_name TEXT NOT NULL,
          species TEXT DEFAULT 'Canine',
          breed TEXT,
          age INTEGER,
          weight REAL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) console.error('Error creating patients table:', err);
      });

      // PROTOCOLS TABLE
      db.run(`
        CREATE TABLE IF NOT EXISTS protocols (
          protocol_id TEXT PRIMARY KEY,
          patient_id INTEGER NOT NULL,
          diagnosis TEXT NOT NULL,
          diagnosis_name TEXT,
          surgery_date DATE,
          pain_level INTEGER,
          mobility_level INTEGER,
          rehab_stage TEXT,
          protocol_length INTEGER,
          status TEXT DEFAULT 'ACTIVE',
          generated_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          completed_date DATETIME,
          notes TEXT,
          FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
        )
      `, (err) => {
        if (err) console.error('Error creating protocols table:', err);
      });

      // PROTOCOL_EXERCISES TABLE (weekly exercise assignments)
      db.run(`
        CREATE TABLE IF NOT EXISTS protocol_exercises (
          assignment_id INTEGER PRIMARY KEY AUTOINCREMENT,
          protocol_id TEXT NOT NULL,
          week_number INTEGER NOT NULL,
          exercise_id TEXT NOT NULL,
          exercise_name TEXT NOT NULL,
          dosage TEXT NOT NULL,
          frequency TEXT,
          notes TEXT,
          FOREIGN KEY (protocol_id) REFERENCES protocols(protocol_id)
        )
      `, (err) => {
        if (err) console.error('Error creating protocol_exercises table:', err);
      });

      // EXERCISE_LOGS TABLE (tracking completed exercises)
      db.run(`
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
          logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (protocol_id) REFERENCES protocols(protocol_id)
        )
      `, (err) => {
        if (err) console.error('Error creating exercise_logs table:', err);
      });

      // PROGRESS_ASSESSMENTS TABLE
      db.run(`
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
          therapist_notes TEXT,
          FOREIGN KEY (protocol_id) REFERENCES protocols(protocol_id)
        )
      `, (err) => {
        if (err) console.error('Error creating progress_assessments table:', err);
      });

      // ========================================================================
      // EXERCISE LIBRARY TABLES - v2.0
      // ========================================================================

      // DOMAINS TABLE
      db.run(`
        CREATE TABLE IF NOT EXISTS domains (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT
        )
      `, (err) => {
        if (err) console.error('Error creating domains table:', err);
      });

      // PHASES TABLE
      db.run(`
        CREATE TABLE IF NOT EXISTS phases (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT
        )
      `, (err) => {
        if (err) console.error('Error creating phases table:', err);
      });

      // TIERS TABLE
      db.run(`
        CREATE TABLE IF NOT EXISTS tiers (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT
        )
      `, (err) => {
        if (err) console.error('Error creating tiers table:', err);
      });

      // EXERCISES_V2 TABLE
      db.run(`
        CREATE TABLE IF NOT EXISTS exercises_v2 (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          domain TEXT NOT NULL,
          category TEXT NOT NULL,
          description TEXT,
          video_url TEXT,
          FOREIGN KEY (domain) REFERENCES domains(id)
        )
      `, (err) => {
        if (err) console.error('Error creating exercises_v2 table:', err);
      });

      // EXERCISE_PHASES_V2 JUNCTION TABLE
      db.run(`
        CREATE TABLE IF NOT EXISTS exercise_phases_v2 (
          exercise_id TEXT NOT NULL,
          phase_id INTEGER NOT NULL,
          PRIMARY KEY (exercise_id, phase_id),
          FOREIGN KEY (exercise_id) REFERENCES exercises_v2(id),
          FOREIGN KEY (phase_id) REFERENCES phases(id)
        )
      `, (err) => {
        if (err) console.error('Error creating exercise_phases_v2 table:', err);
      });

      // EXERCISE_TIERS_V2 JUNCTION TABLE
      db.run(`
        CREATE TABLE IF NOT EXISTS exercise_tiers_v2 (
          exercise_id TEXT NOT NULL,
          tier_id INTEGER NOT NULL,
          PRIMARY KEY (exercise_id, tier_id),
          FOREIGN KEY (exercise_id) REFERENCES exercises_v2(id),
          FOREIGN KEY (tier_id) REFERENCES tiers(id)
        )
      `, (err) => {
        if (err) console.error('Error creating exercise_tiers_v2 table:', err);
      });

      // SESSIONS TABLE
      db.run(`
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
          FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
          FOREIGN KEY (protocol_id) REFERENCES protocols(protocol_id)
        )
      `, (err) => {
        if (err) console.error('Error creating sessions table:', err);
      });

      // SESSION_EXERCISES TABLE
      db.run(`
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
          FOREIGN KEY (session_id) REFERENCES sessions(session_id),
          FOREIGN KEY (exercise_id) REFERENCES exercises_v2(id)
        )
      `, (err) => {
        if (err) console.error('Error creating session_exercises table:', err);

        // AUDIT LOG — required for compliance (Must-Have #8)
        db.run(`
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
        `, (err) => {
          if (err) console.error('Error creating audit_log table:', err);
          else console.log('✅ Audit log table ready');

          console.log('✅ Database schema initialized successfully');
          resolve();
        });
      });

    });
  });
}

// ============================================================================
// DATABASE OPERATIONS - PATIENTS
// ============================================================================

const PatientDB = {
  
  // Create new patient
  create: (patientData) => {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO patients (client_name, patient_name, species, breed, age, weight)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const params = [
        patientData.clientName,
        patientData.patientName,
        patientData.species || 'Canine',
        patientData.breed,
        patientData.age,
        patientData.weight
      ];
      
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ patient_id: this.lastID, ...patientData });
      });
    });
  },

  // Find patient by ID
  findById: (patientId) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM patients WHERE patient_id = ?', [patientId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  // Find all patients
  findAll: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM patients ORDER BY created_at DESC', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // Search patients
  search: (searchTerm) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM patients 
        WHERE patient_name LIKE ? OR client_name LIKE ? OR breed LIKE ?
        ORDER BY created_at DESC
      `;
      const term = `%${searchTerm}%`;
      db.all(sql, [term, term, term], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

// ============================================================================
// DATABASE OPERATIONS - PROTOCOLS
// ============================================================================

const ProtocolDB = {
  
  // Save complete protocol
  save: (protocolData) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        // Start transaction
        db.run('BEGIN TRANSACTION');

        // Insert protocol header
        const protocolSql = `
          INSERT INTO protocols (
            protocol_id, patient_id, diagnosis, diagnosis_name, surgery_date,
            pain_level, mobility_level, rehab_stage, protocol_length, status, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const protocolParams = [
          protocolData.protocolId,
          protocolData.patient_id,
          protocolData.diagnosis,
          protocolData.diagnosisName,
          protocolData.surgeryDate,
          protocolData.painLevel,
          protocolData.mobilityLevel,
          protocolData.rehabStage,
          protocolData.protocolLength,
          'ACTIVE',
          protocolData.notes || ''
        ];

        db.run(protocolSql, protocolParams, function(err) {
          if (err) {
            db.run('ROLLBACK');
            return reject(err);
          }

          // Insert weekly exercises
          const exerciseSql = `
            INSERT INTO protocol_exercises (
              protocol_id, week_number, exercise_id, exercise_name, dosage, frequency, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `;

          let insertedExercises = 0;
          const totalExercises = protocolData.weeklyExercises.length;

          protocolData.weeklyExercises.forEach(ex => {
            db.run(exerciseSql, [
              protocolData.protocolId,
              ex.weekNumber,
              ex.exerciseId,
              ex.exerciseName,
              ex.dosage,
              ex.frequency,
              ex.notes || ''
            ], (err) => {
              if (err) {
                db.run('ROLLBACK');
                return reject(err);
              }
              
              insertedExercises++;
              if (insertedExercises === totalExercises) {
                db.run('COMMIT', (err) => {
                  if (err) reject(err);
                  else resolve({ protocolId: protocolData.protocolId });
                });
              }
            });
          });
        });
      });
    });
  },

  // Find protocol by ID
  findById: (protocolId) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM protocols WHERE protocol_id = ?', [protocolId], (err, protocol) => {
        if (err) return reject(err);
        if (!protocol) return resolve(null);

        // Get associated exercises
        db.all(
          'SELECT * FROM protocol_exercises WHERE protocol_id = ? ORDER BY week_number, assignment_id',
          [protocolId],
          (err, exercises) => {
            if (err) return reject(err);
            resolve({ ...protocol, exercises });
          }
        );
      });
    });
  },

  // Find all protocols for a patient
  findByPatient: (patientId) => {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM protocols WHERE patient_id = ? ORDER BY generated_date DESC',
        [patientId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  },

  // Get all active protocols
  findActive: () => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT p.*, pat.patient_name, pat.client_name, pat.breed
        FROM protocols p
        JOIN patients pat ON p.patient_id = pat.patient_id
        WHERE p.status = 'ACTIVE'
        ORDER BY p.generated_date DESC
      `;
      db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // Update protocol status
  updateStatus: (protocolId, status, completedDate = null) => {
    return new Promise((resolve, reject) => {
      const sql = completedDate 
        ? 'UPDATE protocols SET status = ?, completed_date = ? WHERE protocol_id = ?'
        : 'UPDATE protocols SET status = ? WHERE protocol_id = ?';
      
      const params = completedDate 
        ? [status, completedDate, protocolId]
        : [status, protocolId];

      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }
};

// ============================================================================
// DATABASE OPERATIONS - EXERCISE LOGS
// ============================================================================

const ExerciseLogDB = {
  
  // Log completed exercise
  log: (logData) => {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO exercise_logs (
          protocol_id, exercise_id, week_number, completed_date,
          duration_minutes, repetitions, pain_level_post, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        logData.protocolId,
        logData.exerciseId,
        logData.weekNumber,
        logData.completedDate,
        logData.durationMinutes,
        logData.repetitions,
        logData.painLevelPost,
        logData.notes || ''
      ];

      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ log_id: this.lastID });
      });
    });
  },

  // Get logs for a protocol
  findByProtocol: (protocolId, weekNumber = null) => {
    return new Promise((resolve, reject) => {
      let sql = 'SELECT * FROM exercise_logs WHERE protocol_id = ?';
      const params = [protocolId];
      
      if (weekNumber !== null) {
        sql += ' AND week_number = ?';
        params.push(weekNumber);
      }
      
      sql += ' ORDER BY completed_date DESC, logged_at DESC';
      
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // Get compliance statistics
  getComplianceStats: (protocolId) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          week_number,
          COUNT(DISTINCT exercise_id) as completed_exercises,
          COUNT(*) as total_sessions,
          AVG(pain_level_post) as avg_pain_level
        FROM exercise_logs
        WHERE protocol_id = ?
        GROUP BY week_number
        ORDER BY week_number
      `;
      
      db.all(sql, [protocolId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

// ============================================================================
// DATABASE OPERATIONS - PROGRESS ASSESSMENTS
// ============================================================================

const ProgressDB = {
  
  // Save progress assessment
  save: (assessmentData) => {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO progress_assessments (
          protocol_id, week_number, assessment_date, pain_level, mobility_level,
          rom_measurement, girth_measurement, weight_bearing, gait_quality, therapist_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        assessmentData.protocolId,
        assessmentData.weekNumber,
        assessmentData.assessmentDate,
        assessmentData.painLevel,
        assessmentData.mobilityLevel,
        assessmentData.romMeasurement,
        assessmentData.girthMeasurement,
        assessmentData.weightBearing,
        assessmentData.gaitQuality,
        assessmentData.therapistNotes || ''
      ];

      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ assessment_id: this.lastID });
      });
    });
  },

  // Get assessments for a protocol
  findByProtocol: (protocolId) => {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM progress_assessments WHERE protocol_id = ? ORDER BY week_number, assessment_date',
        [protocolId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }
};

// ============================================================================
// SEED DATA - EXERCISE LIBRARY v2.0
// ============================================================================

function seedExerciseLibrary() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {

      // Check if already seeded
      db.get('SELECT COUNT(*) as count FROM domains', (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        if (row.count > 0) {
          console.log('✅ Exercise library already seeded');
          resolve();
          return;
        }

        console.log('🌱 Seeding exercise library...');

        // SEED DOMAINS
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

        const domainStmt = db.prepare('INSERT INTO domains (id, name) VALUES (?, ?)');
        domains.forEach(d => domainStmt.run(d.id, d.name));
        domainStmt.finalize();

        // SEED PHASES
        const phases = [
          { id: 1, name: 'Protection and Mobility' },
          { id: 2, name: 'Early Strength' },
          { id: 3, name: 'Advanced Strength and Coordination' },
          { id: 4, name: 'Functional Reintegration' },
          { id: 5, name: 'Return to Sport or Maintenance' }
        ];

        const phaseStmt = db.prepare('INSERT INTO phases (id, name) VALUES (?, ?)');
        phases.forEach(p => phaseStmt.run(p.id, p.name));
        phaseStmt.finalize();

        // SEED TIERS
        const tiers = [
          { id: 1, name: 'Passive or Fully Assisted' },
          { id: 2, name: 'Low Load Active' },
          { id: 3, name: 'Moderate Resistance or Coordination' },
          { id: 4, name: 'Advanced Strength or Balance' },
          { id: 5, name: 'Athletic or High Demand' }
        ];

        const tierStmt = db.prepare('INSERT INTO tiers (id, name) VALUES (?, ?)');
        tiers.forEach(t => tierStmt.run(t.id, t.name));
        tierStmt.finalize();

        // SEED EXERCISES - CORE 50
        const exercises = [
          // MOBILITY (MOB)
          { id: 'MOB-P1-01', name: 'Passive Range of Motion', domain: 'MOB', category: 'Passive Mobility', phases: [1], tiers: [1] },
          { id: 'MOB-P1-02', name: 'Passive Cycling', domain: 'MOB', category: 'Passive Mobility', phases: [1], tiers: [1] },
          { id: 'MOB-P1-03', name: 'Joint Approximation', domain: 'MOB', category: 'Passive Mobility', phases: [1], tiers: [1] },
          { id: 'MOB-P1-04', name: 'Passive Stretching', domain: 'MOB', category: 'Passive Mobility', phases: [1,2], tiers: [1,2] },
          { id: 'MOB-P1-05', name: 'Assisted Limb Placement', domain: 'MOB', category: 'Assisted Mobility', phases: [1,2], tiers: [1,2] },
          { id: 'MOB-P1-06', name: 'Neurologic Toe Stimulation', domain: 'MOB', category: 'Assisted Mobility', phases: [1], tiers: [1] },

          // WEIGHT BEARING (WB)
          { id: 'WB-TS-01', name: 'Sit to Stand', domain: 'WB', category: 'Transitional Strength', phases: [2,3,4], tiers: [2,3,4] },
          { id: 'WB-TS-02', name: 'Stand to Sit', domain: 'WB', category: 'Transitional Strength', phases: [2,3,4], tiers: [2,3,4] },
          { id: 'WB-ST-03', name: 'Square Stand', domain: 'WB', category: 'Static Strength', phases: [1,2,3], tiers: [1,2] },
          { id: 'WB-ST-04', name: 'Static Hold Stand', domain: 'WB', category: 'Static Strength', phases: [2,3], tiers: [2,3] },
          { id: 'WB-ST-05', name: 'Three Legged Stand', domain: 'WB', category: 'Static Strength', phases: [3,4], tiers: [3,4] },
          { id: 'WB-AS-06', name: 'Assisted Standing', domain: 'WB', category: 'Supported Stance', phases: [1,2], tiers: [1,2] },
          { id: 'WB-WS-07', name: 'Lateral Weight Shift', domain: 'WB', category: 'Weight Shifting', phases: [2,3], tiers: [2,3] },
          { id: 'WB-WS-08', name: 'Cranial Caudal Weight Shift', domain: 'WB', category: 'Weight Shifting', phases: [2,3], tiers: [2,3] },

          // CORE STABILITY (CORE)
          { id: 'CORE-ST-01', name: 'Peanut Ball Stand', domain: 'CORE', category: 'Static Core', phases: [2,3], tiers: [2,3] },
          { id: 'CORE-ST-02', name: 'Forelimb Elevation', domain: 'CORE', category: 'Static Core', phases: [2,3], tiers: [2,3] },
          { id: 'CORE-ST-03', name: 'Hindlimb Elevation', domain: 'CORE', category: 'Static Core', phases: [3,4], tiers: [3,4] },
          { id: 'CORE-DY-04', name: 'Diagonal Limb Lift', domain: 'CORE', category: 'Dynamic Core', phases: [3,4], tiers: [3,4] },
          { id: 'CORE-DY-05', name: 'Core Bracing Hold', domain: 'CORE', category: 'Dynamic Core', phases: [2,3], tiers: [2,3] },

          // BALANCE (BAL)
          { id: 'BAL-ST-01', name: 'Balance Disc Stand', domain: 'BAL', category: 'Static Balance', phases: [2,3], tiers: [2,3] },
          { id: 'BAL-ST-02', name: 'Wobble Board Stand', domain: 'BAL', category: 'Static Balance', phases: [3,4], tiers: [3,4] },
          { id: 'BAL-DY-03', name: 'Rocking Weight Shift', domain: 'BAL', category: 'Dynamic Balance', phases: [2,3], tiers: [2,3] },
          { id: 'BAL-DY-04', name: 'Unstable Surface Stand', domain: 'BAL', category: 'Dynamic Balance', phases: [3,4], tiers: [3,4] },
          { id: 'BAL-DY-05', name: 'Lateral Platform Step', domain: 'BAL', category: 'Dynamic Balance', phases: [3,4], tiers: [3,4] },

          // GAIT (GAIT)
          { id: 'GAIT-SL-01', name: 'Controlled Leash Walk', domain: 'GAIT', category: 'Straight Line', phases: [1,2,3,4], tiers: [1,2] },
          { id: 'GAIT-SL-02', name: 'Treadmill Walk', domain: 'GAIT', category: 'Straight Line', phases: [2,3,4], tiers: [2,3] },
          { id: 'GAIT-DIR-03', name: 'Figure 8 Walk', domain: 'GAIT', category: 'Directional', phases: [3,4], tiers: [3] },
          { id: 'GAIT-DIR-04', name: 'Circle Walk', domain: 'GAIT', category: 'Directional', phases: [2,3,4], tiers: [2,3] },
          { id: 'GAIT-DIR-05', name: 'Backward Walk', domain: 'GAIT', category: 'Directional', phases: [3,4], tiers: [3,4] },
          { id: 'GAIT-DIR-06', name: 'Side Step', domain: 'GAIT', category: 'Directional', phases: [3,4], tiers: [3,4] },
          { id: 'GAIT-OBS-07', name: 'Low Cavaletti', domain: 'GAIT', category: 'Obstacle', phases: [3,4], tiers: [3] },
          { id: 'GAIT-OBS-08', name: 'Raised Cavaletti', domain: 'GAIT', category: 'Obstacle', phases: [4,5], tiers: [4] },
          { id: 'GAIT-OBS-09', name: 'Obstacle Step', domain: 'GAIT', category: 'Obstacle', phases: [3,4], tiers: [3,4] },

          // ENDURANCE (END)
          { id: 'END-AQ-01', name: 'Underwater Treadmill', domain: 'END', category: 'Aquatic', phases: [2,3,4], tiers: [2,3] },
          { id: 'END-AQ-02', name: 'Swimming', domain: 'END', category: 'Aquatic', phases: [3,4,5], tiers: [3,4] },
          { id: 'END-LD-03', name: 'Hill Walking', domain: 'END', category: 'Land Endurance', phases: [3,4,5], tiers: [3,4] },
          { id: 'END-LD-04', name: 'Incline Treadmill', domain: 'END', category: 'Land Endurance', phases: [3,4], tiers: [3,4] },
          { id: 'END-LD-05', name: 'Stair Climbing', domain: 'END', category: 'Land Endurance', phases: [3,4,5], tiers: [3,4] },
          { id: 'END-LD-06', name: 'Endurance Leash Walking', domain: 'END', category: 'Land Endurance', phases: [2,3,4], tiers: [2,3] },

          // FUNCTIONAL (FUNC)
          { id: 'FUNC-TR-01', name: 'Sit to Beg', domain: 'FUNC', category: 'Transitional Movements', phases: [3,4], tiers: [3,4] },
          { id: 'FUNC-TR-02', name: 'Pivot Exercise', domain: 'FUNC', category: 'Transitional Movements', phases: [3,4], tiers: [3,4] },
          { id: 'FUNC-TR-03', name: 'Tight Turns', domain: 'FUNC', category: 'Environmental Navigation', phases: [3,4], tiers: [3] },
          { id: 'FUNC-TR-04', name: 'Platform Step', domain: 'FUNC', category: 'Environmental Navigation', phases: [3,4,5], tiers: [3,4] },
          { id: 'FUNC-TR-05', name: 'Controlled Fetch', domain: 'FUNC', category: 'Task Specific', phases: [4,5], tiers: [4,5] },

          // ATHLETIC (ATH)
          { id: 'ATH-PL-01', name: 'Low Jump Grid', domain: 'ATH', category: 'Plyometric', phases: [4,5], tiers: [4,5] },
          { id: 'ATH-PL-02', name: 'Sprint Intervals', domain: 'ATH', category: 'Sprint', phases: [5], tiers: [5] },
          { id: 'ATH-PL-03', name: 'Direction Change Drill', domain: 'ATH', category: 'Agility', phases: [4,5], tiers: [4,5] },
          { id: 'ATH-PL-04', name: 'Sport Obstacle Sequence', domain: 'ATH', category: 'Agility', phases: [5], tiers: [5] }
        ];

        const exerciseStmt = db.prepare('INSERT INTO exercises_v2 (id, name, domain, category) VALUES (?, ?, ?, ?)');
        const phaseJunctionStmt = db.prepare('INSERT INTO exercise_phases_v2 (exercise_id, phase_id) VALUES (?, ?)');
        const tierJunctionStmt = db.prepare('INSERT INTO exercise_tiers_v2 (exercise_id, tier_id) VALUES (?, ?)');

        exercises.forEach(ex => {
          exerciseStmt.run(ex.id, ex.name, ex.domain, ex.category);
          ex.phases.forEach(phase => phaseJunctionStmt.run(ex.id, phase));
          ex.tiers.forEach(tier => tierJunctionStmt.run(ex.id, tier));
        });

        exerciseStmt.finalize();
        phaseJunctionStmt.finalize();
        tierJunctionStmt.finalize(() => {
          console.log('✅ Exercise library seeded: 8 domains, 5 phases, 5 tiers, 50 exercises');
          resolve();
        });
      });
    });
  });
}

// ============================================================================
// DATABASE OPERATIONS - EXERCISE LIBRARY v2.0
// ============================================================================

const ExerciseLibraryDB = {

  // Get all exercises with phases and tiers
  getAllExercises: (filters = {}) => {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT DISTINCT
          e.id,
          e.name,
          e.domain,
          e.category,
          d.name as domain_name,
          GROUP_CONCAT(DISTINCT ep.phase_id) as phases,
          GROUP_CONCAT(DISTINCT et.tier_id) as tiers
        FROM exercises_v2 e
        LEFT JOIN domains d ON e.domain = d.id
        LEFT JOIN exercise_phases_v2 ep ON e.id = ep.exercise_id
        LEFT JOIN exercise_tiers_v2 et ON e.id = et.exercise_id
        WHERE 1=1
      `;

      const params = [];

      if (filters.domain) {
        sql += ' AND e.domain = ?';
        params.push(filters.domain);
      }

      if (filters.phase) {
        sql += ' AND e.id IN (SELECT exercise_id FROM exercise_phases_v2 WHERE phase_id = ?)';
        params.push(parseInt(filters.phase));
      }

      if (filters.tier) {
        sql += ' AND e.id IN (SELECT exercise_id FROM exercise_tiers_v2 WHERE tier_id = ?)';
        params.push(parseInt(filters.tier));
      }

      sql += ' GROUP BY e.id ORDER BY e.domain, e.id';

      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Parse comma-separated phases and tiers into arrays
          const exercises = rows.map(row => ({
            ...row,
            phases: row.phases ? row.phases.split(',').map(Number) : [],
            tiers: row.tiers ? row.tiers.split(',').map(Number) : []
          }));
          resolve(exercises);
        }
      });
    });
  },

  // Get single exercise by ID
  getExerciseById: (id) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT
          e.id,
          e.name,
          e.domain,
          e.category,
          d.name as domain_name,
          GROUP_CONCAT(DISTINCT ep.phase_id) as phases,
          GROUP_CONCAT(DISTINCT et.tier_id) as tiers
        FROM exercises_v2 e
        LEFT JOIN domains d ON e.domain = d.id
        LEFT JOIN exercise_phases_v2 ep ON e.id = ep.exercise_id
        LEFT JOIN exercise_tiers_v2 et ON e.id = et.exercise_id
        WHERE e.id = ?
        GROUP BY e.id
      `;

      db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          resolve({
            ...row,
            phases: row.phases ? row.phases.split(',').map(Number) : [],
            tiers: row.tiers ? row.tiers.split(',').map(Number) : []
          });
        }
      });
    });
  },

  // Get all domains
  getDomains: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM domains ORDER BY id', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // Get all phases
  getPhases: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM phases ORDER BY id', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // Get all tiers
  getTiers: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM tiers ORDER BY id', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  db,
  initializeDatabase,
  seedExerciseLibrary,
  PatientDB,
  ProtocolDB,
  ExerciseLogDB,
  ProgressDB,
  ExerciseLibraryDB
};
