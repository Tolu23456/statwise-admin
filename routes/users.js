const express = require('express');
const supabase = require('../config/database');
const { requireAuth, requirePermission } = require('../middleware/auth');
const router = express.Router();

// Get all users with pagination and filters
router.get('/', requireAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      tier = '', 
      status = '',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;
    let query = supabase
      .from('user_profiles')
      .select('*', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`email.ilike.%${search}%,display_name.ilike.%${search}%`);
    }
    
    if (tier) {
      query = query.eq('current_tier', tier);
    }
    
    if (status) {
      query = query.eq('subscription_status', status);
    }

    // Apply sorting and pagination
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      // Return empty data if table doesn't exist yet
      return res.json({ users: [], total: 0, page: 1, totalPages: 0 });
    }

    res.json({
      users: data || [],
      total: count || 0,
      page: parseInt(page),
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's subscription events
    const { data: subscriptionEvents } = await supabase
      .from('subscription_events')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false });

    // Get user's payment transactions
    const { data: transactions } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false });

    // Get user's referrals
    const { data: referrals } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', id);

    res.json({
      user,
      subscriptionEvents,
      transactions,
      referrals
    });
  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user
router.put('/:id', requireAuth, requirePermission('user_management'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove non-updatable fields
    delete updates.id;
    delete updates.created_at;

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
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
        action: 'user_updated',
        admin_id: req.admin.id,
        target_user_id: id,
        details: JSON.stringify(updates)
      });

    res.json(data);
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Suspend/unsuspend user
router.post('/:id/suspend', requireAuth, requirePermission('user_management'), async (req, res) => {
  try {
    const { id } = req.params;
    const { suspended, reason } = req.body;

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        subscription_status: suspended ? 'suspended' : 'active',
        updated_at: new Date().toISOString()
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
        action: suspended ? 'user_suspended' : 'user_unsuspended',
        admin_id: req.admin.id,
        target_user_id: id,
        details: JSON.stringify({ reason })
      });

    res.json(data);
  } catch (error) {
    console.error('User suspend error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Get user statistics
router.get('/stats/overview', requireAuth, async (req, res) => {
  try {
    // Total users
    const { count: totalUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    // Active users (logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: activeUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_login', thirtyDaysAgo.toISOString());

    // Subscription tiers distribution
    const { data: tierStats } = await supabase
      .from('user_profiles')
      .select('current_tier')
      .not('current_tier', 'is', null);

    const tierDistribution = (tierStats || []).reduce((acc, user) => {
      const tier = user.current_tier || 'Free Tier';
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {});

    // New users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: newUsersThisMonth } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    res.json({
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      tierDistribution,
      newUsersThisMonth: newUsersThisMonth || 0
    });
  } catch (error) {
    console.error('User stats error:', error);
    // Return default values if database tables don't exist yet
    res.json({
      totalUsers: 0,
      activeUsers: 0,
      tierDistribution: {},
      newUsersThisMonth: 0
    });
  }
});

module.exports = router;
