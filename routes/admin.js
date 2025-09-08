const express = require('express');
const supabase = require('../config/database');
const { requireAuth, requirePermission } = require('../middleware/auth');
const router = express.Router();

// Get all admin users
router.get('/users', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, email, full_name, role, permissions, created_at, last_login')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return res.json([]);
    }

    res.json(data || []);
  } catch (error) {
    console.error('Admin users fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch admin users' });
  }
});

// Create new admin user
router.post('/users', requireAuth, requirePermission('admin_management'), async (req, res) => {
  try {
    const { email, role, permissions } = req.body;

    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        email,
        role,
        permissions: permissions || []
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Log admin action
    await supabase
      .from('system_logs')
      .insert({
        action: 'admin_user_created',
        admin_id: req.admin.id,
        details: JSON.stringify({ email, role, permissions })
      });

    res.json(data);
  } catch (error) {
    console.error('Admin user creation error:', error);
    res.status(500).json({ error: 'Failed to create admin user' });
  }
});

// Update admin user
router.put('/users/:id', requireAuth, requirePermission('admin_management'), async (req, res) => {
  try {
    const { id } = req.params;
    const { role, permissions } = req.body;

    const { data, error } = await supabase
      .from('admin_users')
      .update({
        role,
        permissions
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Log admin action
    await supabase
      .from('system_logs')
      .insert({
        action: 'admin_user_updated',
        admin_id: req.admin.id,
        target_user_id: id,
        details: JSON.stringify({ role, permissions })
      });

    res.json(data);
  } catch (error) {
    console.error('Admin user update error:', error);
    res.status(500).json({ error: 'Failed to update admin user' });
  }
});

// Get system logs
router.get('/logs', requireAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      action = '',
      adminId = '',
      startDate = '',
      endDate = ''
    } = req.query;

    const offset = (page - 1) * limit;
    let query = supabase
      .from('system_logs')
      .select(`
        *,
        admin_users!inner(email)
      `, { count: 'exact' });

    if (action) {
      query = query.eq('action', action);
    }

    if (adminId) {
      query = query.eq('admin_id', adminId);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({
      logs: data,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('System logs fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch system logs' });
  }
});

// Get app settings
router.get('/settings', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .order('key', { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('App settings fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch app settings' });
  }
});

// Update app setting
router.put('/settings/:key', requireAuth, requirePermission('system_management'), async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;

    const { data, error } = await supabase
      .from('app_settings')
      .upsert({
        key,
        value,
        description,
        updated_at: new Date().toISOString(),
        updated_by: req.admin.id
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Log admin action
    await supabase
      .from('system_logs')
      .insert({
        action: 'app_setting_updated',
        admin_id: req.admin.id,
        details: JSON.stringify({ key, value, description })
      });

    res.json(data);
  } catch (error) {
    console.error('App setting update error:', error);
    res.status(500).json({ error: 'Failed to update app setting' });
  }
});

module.exports = router;
