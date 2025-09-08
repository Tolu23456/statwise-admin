const express = require('express');
const supabase = require('../config/database');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// Get subscription overview - Mock data for demo
router.get('/overview', requireAuth, async (req, res) => {
  try {
    // Mock subscription data
    res.json({
      totalRevenue: 45780.50,
      monthlyRevenue: 8950.25,
      subscriptionStats: {
        free_active: 523,
        premium_active: 421,
        vip_active: 248,
        vvip_active: 55,
        premium_inactive: 12,
        vip_inactive: 8
      },
      successRate: 94.2,
      totalTransactions: 2847,
      successfulTransactions: 2683
    });
  } catch (error) {
    console.error('Subscription overview error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription overview' });
  }
});

// Get payment transactions - Mock data for demo
router.get('/transactions', requireAuth, async (req, res) => {
  try {
    const mockTransactions = [
      {
        id: '1',
        amount: '29.99',
        currency: 'USD',
        status: 'successful',
        tier: 'premium',
        created_at: '2024-09-08T10:30:00Z',
        user_profiles: { email: 'user1@example.com', display_name: 'John Doe' }
      },
      {
        id: '2',
        amount: '49.99',
        currency: 'USD',
        status: 'successful',
        tier: 'vip',
        created_at: '2024-09-07T15:22:00Z',
        user_profiles: { email: 'user2@example.com', display_name: 'Jane Smith' }
      },
      {
        id: '3',
        amount: '29.99',
        currency: 'USD',
        status: 'failed',
        tier: 'premium',
        created_at: '2024-09-06T09:15:00Z',
        user_profiles: { email: 'user3@example.com', display_name: 'Bob Wilson' }
      }
    ];

    const { page = 1, limit = 20 } = req.query;
    const total = mockTransactions.length;
    const totalPages = Math.ceil(total / limit);

    res.json({
      transactions: mockTransactions,
      total,
      page: parseInt(page),
      totalPages
    });
  } catch (error) {
    console.error('Transactions fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get subscription events
router.get('/events', requireAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      eventType = '',
      userId = ''
    } = req.query;

    const offset = (page - 1) * limit;
    let query = supabase
      .from('subscription_events')
      .select(`
        *,
        user_profiles!inner(email, display_name)
      `, { count: 'exact' });

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({
      events: data,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Subscription events fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription events' });
  }
});

// Get revenue analytics
router.get('/analytics/revenue', requireAuth, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const { data: transactions } = await supabase
      .from('payment_transactions')
      .select('amount, created_at, tier')
      .eq('status', 'successful')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    // Group by date
    const dailyRevenue = {};
    const tierRevenue = {};
    
    transactions?.forEach(transaction => {
      const date = new Date(transaction.created_at).toISOString().split('T')[0];
      dailyRevenue[date] = (dailyRevenue[date] || 0) + parseFloat(transaction.amount);
      tierRevenue[transaction.tier] = (tierRevenue[transaction.tier] || 0) + parseFloat(transaction.amount);
    });

    res.json({
      dailyRevenue,
      tierRevenue,
      totalRevenue: Object.values(dailyRevenue).reduce((sum, amount) => sum + amount, 0)
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue analytics' });
  }
});

module.exports = router;
