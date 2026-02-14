// ============================================================================
// K9-REHAB-PRO DATABASE SCHEMA v1.0
// SQLite Database Implementation
// ============================================================================

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const DB_PATH = path.join(__dirname, 'k9_rehab_pro.db');

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
        else {
          console.log('✅ Database schema initialized successfully');
          resolve();
        }
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
// EXPORTS
// ============================================================================

module.exports = {
  db,
  initializeDatabase,
  PatientDB,
  ProtocolDB,
  ExerciseLogDB,
  ProgressDB
};
