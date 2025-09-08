const express = require('express');
const supabase = require('../config/database');
const { requireAuth, requirePermission } = require('../middleware/auth');
const router = express.Router();

// Get all users with pagination and filters - Mock data for demo
router.get('/', requireAuth, async (req, res) => {
  try {
    // Mock user data for demonstration
    const mockUsers = [
      {
        id: '1',
        email: 'user1@example.com',
        display_name: 'John Doe',
        current_tier: 'premium',
        subscription_status: 'active',
        created_at: '2024-01-15T10:30:00Z',
        last_login: '2024-09-08T09:15:00Z'
      },
      {
        id: '2',
        email: 'user2@example.com',
        display_name: 'Jane Smith',
        current_tier: 'vip',
        subscription_status: 'active',
        created_at: '2024-02-20T14:22:00Z',
        last_login: '2024-09-07T16:45:00Z'
      },
      {
        id: '3',
        email: 'user3@example.com',
        display_name: 'Bob Wilson',
        current_tier: 'free',
        subscription_status: 'inactive',
        created_at: '2024-03-10T08:11:00Z',
        last_login: '2024-09-05T12:30:00Z'
      }
    ];

    const { page = 1, limit = 20 } = req.query;
    const total = mockUsers.length;
    const totalPages = Math.ceil(total / limit);

    res.json({
      users: mockUsers,
      total,
      page: parseInt(page),
      totalPages
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

// Get user statistics - Mock data for demo
router.get('/stats/overview', requireAuth, async (req, res) => {
  try {
    // Mock statistics for demonstration
    res.json({
      totalUsers: 1247,
      activeUsers: 892,
      tierDistribution: {
        free: 523,
        premium: 421,
        vip: 248,
        vvip: 55
      },
      newUsersThisMonth: 89
    });
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

module.exports = router;
