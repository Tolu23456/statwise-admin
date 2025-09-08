const express = require('express');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// Dashboard overview
router.get('/overview', requireAuth, async (req, res) => {
  res.json({
    totalUsers: 1247,
    activeUsers: 892,
    totalRevenue: 45780.50,
    monthlyRevenue: 8950.25,
    newUsersThisMonth: 89,
    successRate: 94.2
  });
});

// Recent activity
router.get('/recent-activity', requireAuth, async (req, res) => {
  res.json([
    {
      id: '1',
      type: 'user_registration',
      description: 'New user registered',
      user_email: 'newuser@example.com',
      timestamp: '2024-09-08T10:30:00Z'
    },
    {
      id: '2',
      type: 'payment_successful',
      description: 'Payment received',
      amount: '$29.99',
      timestamp: '2024-09-08T09:15:00Z'
    },
    {
      id: '3',
      type: 'prediction_made',
      description: 'AI prediction generated',
      accuracy: '92%',
      timestamp: '2024-09-08T08:45:00Z'
    }
  ]);
});

module.exports = router;