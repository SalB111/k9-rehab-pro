// ============================================================================
// K9-REHAB-PRO — DATABASE PROVIDER (SQLite)
// Handles user lookup, creation, and password hashing
// ============================================================================

const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");

// ---- Open Database ----
const db = new sqlite3.Database("./k9rehab.db");

// ---- Ensure Users Table Exists ----
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    role TEXT DEFAULT 'clinician'
  )
`);

// ============================================================================
// FIND USER BY USERNAME
// ============================================================================
function findUserByUsername(username) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM users WHERE username = ?",
      [username],
      (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      }
    );
  });
}

// ============================================================================
// FIND USER BY ID
// ============================================================================
function findUserById(id) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM users WHERE id = ?",
      [id],
      (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      }
    );
  });
}

// ============================================================================
// CREATE USER (handles bcrypt hashing)
// ============================================================================
async function createUser({ username, password, display_name, role }) {
  const password_hash = await bcrypt.hash(password, 10);

  return new Promise((resolve, reject) => {
    db.run(
      `
      INSERT INTO users (username, password_hash, display_name, role)
      VALUES (?, ?, ?, ?)
      `,
      [username, password_hash, display_name, role],
      function (err) {
        if (err) return reject(err);

        resolve({
          id: this.lastID,
          username,
          password_hash,
          display_name,
          role
        });
      }
    );
  });
}

// ============================================================================
// EXPORTS
// ============================================================================
module.exports = {
  findUserByUsername,
  findUserById,
  createUser
};