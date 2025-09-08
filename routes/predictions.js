const express = require('express');
const supabase = require('../config/database');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// Get prediction results overview - Mock data for demo
router.get('/overview', requireAuth, async (req, res) => {
  try {
    res.json({
      totalPredictions: 2847,
      averageAccuracy: 87.3,
      averageConfidence: 82.6,
      monthlyPredictions: 284,
      accuracyByConfidence: {
        low: 72.1,
        medium: 85.4,
        high: 92.7
      }
    });
  } catch (error) {
    console.error('Prediction overview error:', error);
    res.status(500).json({ error: 'Failed to fetch prediction overview' });
  }
});

// Get prediction results with pagination
router.get('/results', requireAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      minAccuracy = '',
      minConfidence = '',
      startDate = '',
      endDate = ''
    } = req.query;

    const offset = (page - 1) * limit;
    let query = supabase
      .from('prediction_results')
      .select('*', { count: 'exact' });

    // Apply filters
    if (minAccuracy) {
      query = query.gte('accuracy', parseFloat(minAccuracy));
    }
    
    if (minConfidence) {
      query = query.gte('confidence', parseFloat(minConfidence));
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
      predictions: data,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Prediction results fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch prediction results' });
  }
});

// Get prediction analytics
router.get('/analytics', requireAuth, async (req, res) => {
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
    }

    const { data: predictions } = await supabase
      .from('prediction_results')
      .select('created_at, accuracy, confidence')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    // Group by date
    const dailyAccuracy = {};
    const dailyCount = {};
    
    predictions?.forEach(prediction => {
      const date = new Date(prediction.created_at).toISOString().split('T')[0];
      if (!dailyAccuracy[date]) {
        dailyAccuracy[date] = [];
        dailyCount[date] = 0;
      }
      dailyAccuracy[date].push(prediction.accuracy);
      dailyCount[date]++;
    });

    // Calculate average accuracy per day
    const dailyAverageAccuracy = {};
    Object.keys(dailyAccuracy).forEach(date => {
      const accuracies = dailyAccuracy[date];
      dailyAverageAccuracy[date] = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
    });

    res.json({
      dailyAverageAccuracy,
      dailyCount,
      totalPredictionsInPeriod: predictions?.length || 0
    });
  } catch (error) {
    console.error('Prediction analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch prediction analytics' });
  }
});

// Update prediction result
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { actualResult, accuracy } = req.body;

    const { data, error } = await supabase
      .from('prediction_results')
      .update({
        actual_result: actualResult,
        accuracy: accuracy
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
        action: 'prediction_result_updated',
        admin_id: req.admin.id,
        details: JSON.stringify({ predictionId: id, actualResult, accuracy })
      });

    res.json(data);
  } catch (error) {
    console.error('Prediction update error:', error);
    res.status(500).json({ error: 'Failed to update prediction result' });
  }
});

module.exports = router;
