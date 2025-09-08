const express = require('express');
const supabase = require('../config/database');
const router = express.Router();

// Admin login - Simplified for development
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // For development: Simple admin check
    if (email === 'admin@statwise.com' && password === 'admin123') {
      // Get admin user from database
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .single();

      if (adminError || !adminUser) {
        return res.status(403).json({ error: 'Admin user not found in database' });
      }

      // Update last login
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', adminUser.id);

      // Create session
      req.session.adminUser = adminUser;
      req.session.isAuthenticated = true;

      res.json({
        user: { email: adminUser.email, id: adminUser.id },
        admin: adminUser,
        session: { access_token: 'dev-token-' + adminUser.id }
      });
    } else {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Admin logout - Simplified for development
router.post('/logout', async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
      }
      res.json({ message: 'Logged out successfully' });
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Check auth status - Simplified for development
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token || !token.startsWith('dev-token-')) {
      return res.status(401).json({ error: 'No valid token provided' });
    }

    // Check session
    if (!req.session.isAuthenticated || !req.session.adminUser) {
      return res.status(401).json({ error: 'Session expired' });
    }

    const adminUser = req.session.adminUser;

    res.json({
      user: { email: adminUser.email, id: adminUser.id },
      admin: adminUser
    });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ error: 'Authentication check failed' });
  }
});

module.exports = router;
