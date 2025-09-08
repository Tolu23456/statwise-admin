const express = require('express');
const { requireAuth } = require('../middleware/auth');
const supabase = require('../config/database');
const router = express.Router();

// Dashboard overview combining all stats
router.get('/overview', requireAuth, async (req, res) => {
  try {
    // Get basic user stats
    const { count: totalUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    // Get active users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: activeUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_login', thirtyDaysAgo.toISOString());

    // Get revenue stats
    const { data: transactions } = await supabase
      .from('payment_transactions')
      .select('amount, created_at, status')
      .eq('status', 'successful');

    const totalRevenue = (transactions || []).reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const monthlyRevenue = (transactions || [])
      .filter(t => new Date(t.created_at) >= startOfMonth)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    // New users this month
    const { count: newUsersThisMonth } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    res.json({
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      totalRevenue,
      monthlyRevenue,
      newUsersThisMonth: newUsersThisMonth || 0
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    // Return zeros if tables don't exist yet
    res.json({
      totalUsers: 0,
      activeUsers: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      newUsersThisMonth: 0
    });
  }
});

// Recent activity from various tables
router.get('/recent-activity', requireAuth, async (req, res) => {
  try {
    const activities = [];

    // Get recent user registrations
    const { data: recentUsers } = await supabase
      .from('user_profiles')
      .select('email, created_at, display_name')
      .order('created_at', { ascending: false })
      .limit(5);

    (recentUsers || []).forEach(user => {
      activities.push({
        id: `user_${user.email}`,
        type: 'user_registration',
        description: `New user registered: ${user.display_name || user.email}`,
        timestamp: user.created_at
      });
    });

    // Get recent payments
    const { data: recentPayments } = await supabase
      .from('payment_transactions')
      .select('amount, currency, created_at, tier')
      .eq('status', 'successful')
      .order('created_at', { ascending: false })
      .limit(5);

    (recentPayments || []).forEach(payment => {
      activities.push({
        id: `payment_${payment.created_at}`,
        type: 'payment_successful',
        description: `Payment received: ${payment.amount} ${payment.currency} for ${payment.tier}`,
        timestamp: payment.created_at
      });
    });

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(activities.slice(0, 10));
  } catch (error) {
    console.error('Recent activity error:', error);
    res.json([]);
  }
});

module.exports = router;