const express = require('express');
const supabase = require('../config/database');
const router = express.Router();

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    // Check if user is admin
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();

    if (adminError || !adminUser) {
      await supabase.auth.signOut();
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Update last login
    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', adminUser.id);

    res.json({
      user: data.user,
      admin: adminUser,
      session: data.session
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Admin logout
router.post('/logout', async (req, res) => {
  try {
    await supabase.auth.signOut();
    req.session.destroy();
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Check auth status
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', user.email)
      .single();

    if (adminError || !adminUser) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    res.json({ user, admin: adminUser });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ error: 'Authentication check failed' });
  }
});

module.exports = router;
