const jwt = require('jsonwebtoken');

/**
 * Verify Supabase JWT token from Authorization header
 * Attaches req.user with { id, email, role } if valid
 */
function verifySupabaseToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Allow unauthenticated requests for read-only routes
    // (products, categories, search, slugs are already mounted above)
    // Protected routes should require auth
    if (req.method !== 'GET') {
      return res.status(401).json({ error: 'Authentication required' });
    }
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify with Supabase JWT secret
    // Fallback to a generic secret if env var is not set
    const secret = process.env.SUPABASE_JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!secret) {
      console.warn('SUPABASE_JWT_SECRET or SUPABASE_SERVICE_ROLE_KEY not set. Skipping JWT verification in development.');
      // In development without secret, decode without verification
      if (process.env.NODE_ENV === 'development') {
        const decoded = jwt.decode(token);
        if (decoded && decoded.sub) {
          req.user = {
            id: decoded.sub,
            email: decoded.email || '',
            role: decoded.user_metadata?.role || 'user',
          };
        }
        return next();
      }
      return res.status(500).json({ error: 'Server authentication misconfigured' });
    }

    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS256'],
    });

    req.user = {
      id: decoded.sub,
      email: decoded.email || '',
      role: decoded.user_metadata?.role || 'user',
    };

    next();
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Require authentication middleware
 */
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

/**
 * Require admin role middleware
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

module.exports = {
  verifySupabaseToken,
  requireAuth,
  requireAdmin,
};
