const supabase = require('../config/database');

const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // For dev tokens, check session
    if (token.startsWith('dev-token-')) {
      if (!req.session || !req.session.isAuthenticated || !req.session.adminUser) {
        return res.status(401).json({ error: 'Session expired or not authenticated' });
      }
      req.user = { email: req.session.adminUser.email, id: req.session.adminUser.id };
      req.admin = req.session.adminUser;
    } else {
      // For real Supabase tokens
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      // Check if user is admin
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', user.email)
        .single();

      if (adminError || !adminUser) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      req.user = user;
      req.admin = adminUser;
    }
    
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
