// ============================================================================
// K9-REHAB-PRO — AUTHENTICATION & AUTHORIZATION MODULE
// JWT-based auth with bcrypt password hashing, role-based access control
// ============================================================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ============================================================================
// USERS TABLE INITIALIZATION
// ============================================================================

function initializeUsersTable(db) {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'clinician',
        display_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) reject(err);
      else {
        console.log('  \u2705 Users table ready');
        resolve();
      }
    });
  });
}

// ============================================================================
// USER OPERATIONS
// ============================================================================

function getUserCount(db) {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
      if (err) reject(err);
      else resolve(row.count);
    });
  });
}

function findUserByUsername(db, username) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function findUserById(db, id) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT id, username, role, display_name, created_at FROM users WHERE id = ?',
      [id],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
}

async function createUser(db, { username, password, role, display_name }) {
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO users (username, password_hash, role, display_name) VALUES (?, ?, ?, ?)',
      [username, password_hash, role || 'clinician', display_name || username],
      function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, username, role: role || 'clinician' });
      }
    );
  });
}

async function verifyPassword(plaintext, hash) {
  return bcrypt.compare(plaintext, hash);
}

// ============================================================================
// JWT OPERATIONS
// ============================================================================

function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Routes that skip authentication
const PUBLIC_ROUTES = [
  '/api/health',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/status',
];

function requireAuth(db) {
  return async (req, res, next) => {
    const fullPath = req.baseUrl + req.path;
    const isPublicRoute = PUBLIC_ROUTES.some(route => fullPath === route);

    const authHeader = req.headers.authorization;
    const hasToken = authHeader && authHeader.startsWith('Bearer ');

    // If token is present, always try to authenticate (even on public routes)
    if (hasToken) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        const user = await findUserById(db, decoded.id);
        if (user) {
          req.user = user;
        }
      } catch (err) {
        // On public routes, token failure is not an error — just proceed without user
        if (!isPublicRoute) {
          if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
          }
          return res.status(401).json({ error: 'Invalid token' });
        }
      }
    }

    // Public routes pass through regardless of auth status
    if (isPublicRoute) {
      return next();
    }

    // Protected routes require valid authentication
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    next();
  };
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  initializeUsersTable,
  getUserCount,
  findUserByUsername,
  findUserById,
  createUser,
  verifyPassword,
  generateToken,
  verifyToken,
  requireAuth,
  requireRole,
  PUBLIC_ROUTES,
};
