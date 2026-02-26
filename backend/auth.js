// ============================================================================
// K9-REHAB-PRO — AUTHENTICATION & AUTHORIZATION MODULE
// JWT-based auth with bcrypt password hashing, role-based access control
// ============================================================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db-provider');

// ============================================================================
// PASSWORD OPERATIONS
// ============================================================================

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

function requireAuth() {
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
        const user = await db.findUserById(decoded.id);
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
  verifyPassword,
  generateToken,
  verifyToken,
  requireAuth,
  requireRole,
  PUBLIC_ROUTES,
};
