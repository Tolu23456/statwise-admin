const express = require('express');
const supabase = require('../config/database');
const router = express.Router();

// Admin login with Supabase authentication
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return res.status(401).json({ error: authError.message });
    }

    // Check if user exists in admin_users table
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();

    if (adminError || !adminUser) {
      // If no admin user found, check if this is the first admin setup
      if (email === 'admin@statwise.com') {
        // Create default admin user
        const { data: newAdmin, error: createError } = await supabase
          .from('admin_users')
          .insert({
            email: email,
            full_name: 'Admin User',
            role: 'super_admin',
            permissions: ['all'],
            is_active: true
          })
          .select()
          .single();

        if (createError) {
          console.error('Failed to create admin user:', createError);
          return res.status(403).json({ error: 'Admin access required' });
        }

        req.session.adminUser = newAdmin;
      } else {
        return res.status(403).json({ error: 'Admin access required' });
      }
    } else {
      // Update last login
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', adminUser.id);

      req.session.adminUser = adminUser;
    }

    req.session.isAuthenticated = true;

    res.json({
      user: authData.user,
      admin: req.session.adminUser,
      session: authData.session
    });
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
