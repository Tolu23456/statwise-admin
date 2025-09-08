const express = require('express');
const supabase = require('../config/database');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// Get referral overview
router.get('/overview', requireAuth, async (req, res) => {
  try {
    // Total referrals
    const { count: totalReferrals } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true });

    // Total rewards distributed
    const { data: referrals } = await supabase
      .from('referrals')
      .select('reward_amount')
      .eq('reward_claimed', true);

    const totalRewards = referrals?.reduce((sum, referral) => sum + (referral.reward_amount || 0), 0) || 0;

    // Top referrers
    const { data: topReferrers } = await supabase
      .from('user_profiles')
      .select('id, email, display_name, total_referrals, total_referral_rewards')
      .gt('total_referrals', 0)
      .order('total_referrals', { ascending: false })
      .limit(10);

    // Referrals this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: monthlyReferrals } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    // Conversion rate
    const { data: allReferrals } = await supabase
      .from('referrals')
      .select('reward_claimed');

    const claimedCount = allReferrals?.filter(r => r.reward_claimed).length || 0;
    const conversionRate = totalReferrals > 0 ? (claimedCount / totalReferrals) * 100 : 0;

    res.json({
      totalReferrals,
      totalRewards,
      topReferrers,
      monthlyReferrals,
      conversionRate
    });
  } catch (error) {
    console.error('Referral overview error:', error);
    res.status(500).json({ error: 'Failed to fetch referral overview' });
  }
});

// Get all referrals with pagination
router.get('/', requireAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status = '',
      search = ''
    } = req.query;

    const offset = (page - 1) * limit;
    let query = supabase
      .from('referrals')
      .select(`
        *,
        referrer:user_profiles!referrer_id(email, display_name),
        referred:user_profiles!referred_id(email, display_name)
      `, { count: 'exact' });

    if (status === 'claimed') {
      query = query.eq('reward_claimed', true);
    } else if (status === 'unclaimed') {
      query = query.eq('reward_claimed', false);
    }

    if (search) {
      // This would need a more complex query in a real implementation
      // For now, we'll search by referral code
      query = query.ilike('referral_code', `%${search}%`);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({
      referrals: data,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Referrals fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch referrals' });
  }
});

// Get referral analytics
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

    const { data: referrals } = await supabase
      .from('referrals')
      .select('created_at, reward_claimed, reward_amount')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    // Group by date
    const dailyReferrals = {};
    const dailyRewards = {};
    
    referrals?.forEach(referral => {
      const date = new Date(referral.created_at).toISOString().split('T')[0];
      dailyReferrals[date] = (dailyReferrals[date] || 0) + 1;
      
      if (referral.reward_claimed) {
        dailyRewards[date] = (dailyRewards[date] || 0) + (referral.reward_amount || 0);
      }
    });

    res.json({
      dailyReferrals,
      dailyRewards,
      totalReferralsInPeriod: referrals?.length || 0,
      totalRewardsInPeriod: Object.values(dailyRewards).reduce((sum, amount) => sum + amount, 0)
    });
  } catch (error) {
    console.error('Referral analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch referral analytics' });
  }
});

// Update referral reward
router.put('/:id/reward', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { rewardAmount, claimed } = req.body;

    const { data, error } = await supabase
      .from('referrals')
      .update({
        reward_amount: rewardAmount,
        reward_claimed: claimed
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Update referrer's total rewards
    if (claimed) {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          total_referral_rewards: supabase.rpc('increment_rewards', { 
            user_id: data.referrer_id, 
            amount: rewardAmount 
          })
        })
        .eq('id', data.referrer_id);

      if (updateError) {
        console.error('Failed to update referrer rewards:', updateError);
      }
    }

    // Log admin action
    await supabase
      .from('system_logs')
      .insert({
        action: 'referral_reward_updated',
        admin_id: req.admin.id,
        details: JSON.stringify({ referralId: id, rewardAmount, claimed })
      });

    res.json(data);
  } catch (error) {
    console.error('Referral reward update error:', error);
    res.status(500).json({ error: 'Failed to update referral reward' });
  }
});

module.exports = router;
