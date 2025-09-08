const express = require('express');
const supabase = require('../config/database');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// Get subscription overview
router.get('/overview', requireAuth, async (req, res) => {
  try {
    // Total revenue
    const { data: transactions } = await supabase
      .from('payment_transactions')
      .select('amount, currency, status, created_at')
      .eq('status', 'successful');

    const totalRevenue = (transactions || []).reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);

    // Revenue this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyRevenue = (transactions || []).filter(t => 
      new Date(t.created_at) >= startOfMonth
    ).reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);

    // Subscription distribution
    const { data: subscriptions } = await supabase
      .from('user_profiles')
      .select('current_tier, subscription_status');

    const subscriptionStats = (subscriptions || []).reduce((acc, sub) => {
      const key = `${sub.current_tier || 'Free Tier'}_${sub.subscription_status || 'active'}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    // Payment success rate
    const { data: allTransactions } = await supabase
      .from('payment_transactions')
      .select('status');

    const successfulCount = (allTransactions || []).filter(t => t.status === 'successful').length;
    const totalTransactions = (allTransactions || []).length;
    const successRate = totalTransactions > 0 ? (successfulCount / totalTransactions) * 100 : 0;

    res.json({
      totalRevenue,
      monthlyRevenue,
      subscriptionStats,
      successRate,
      totalTransactions,
      successfulTransactions: successfulCount
    });
  } catch (error) {
    console.error('Subscription overview error:', error);
    // Return default values if tables don't exist yet
    res.json({
      totalRevenue: 0,
      monthlyRevenue: 0,
      subscriptionStats: {},
      successRate: 0,
      totalTransactions: 0,
      successfulTransactions: 0
    });
  }
});

// Get payment transactions
router.get('/transactions', requireAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status = '', 
      tier = '',
      startDate = '',
      endDate = ''
    } = req.query;

    const offset = (page - 1) * limit;
    let query = supabase
      .from('payment_transactions')
      .select(`
        *,
        user_profiles!inner(email, display_name)
      `, { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    
    if (tier) {
      query = query.eq('tier', tier);
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
      console.error('Database error:', error);
      return res.json({ transactions: [], total: 0, page: 1, totalPages: 0 });
    }

    res.json({
      transactions: data || [],
      total: count || 0,
      page: parseInt(page),
      totalPages: Math.ceil((count || 0) / limit)
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
