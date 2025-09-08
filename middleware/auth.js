const supabase = require('../config/database');

const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token || !token.startsWith('dev-token-')) {
      return res.status(401).json({ error: 'No valid token provided' });
    }

    // Check session for simplified auth
    if (!req.session || !req.session.isAuthenticated || !req.session.adminUser) {
      return res.status(401).json({ error: 'Session expired or not authenticated' });
    }

    req.user = { email: req.session.adminUser.email, id: req.session.adminUser.id };
    req.admin = req.session.adminUser;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin || !req.admin.permissions.includes(permission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

module.exports = { requireAuth, requirePermission };
