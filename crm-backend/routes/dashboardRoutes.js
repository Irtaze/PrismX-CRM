const express = require('express');
const auth = require('../middlewares/auth');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Sale = require('../models/Sale');
const Revenue = require('../models/Revenue');
const Target = require('../models/Target');
const Performance = require('../models/Performance');

const router = express.Router();

// Helper: get date range for period
function getDateRange(period) {
  const now = new Date();
  let start, end;
  end = new Date(now);

  switch (period) {
    case 'today':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'this_week':
      const day = now.getDay();
      start = new Date(now);
      start.setDate(now.getDate() - day);
      start.setHours(0, 0, 0, 0);
      break;
    case 'last_month':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case 'this_year':
      start = new Date(now.getFullYear(), 0, 1);
      break;
    case 'current_month':
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
  }
  return { start, end };
}

// Admin Dashboard
router.get('/admin', auth, async (req, res) => {
  try {
    const period = req.query.period || 'current_month';
    const { start, end } = getDateRange(period);

    const [customers, sales, revenues, agents, targets] = await Promise.all([
      Customer.countDocuments(),
      Sale.find({ date: { $gte: start, $lte: end } }),
      Revenue.find({ date: { $gte: start, $lte: end } }),
      User.find({ role: { $in: ['user', 'agent'] } }).select('-password'),
      Target.find({ status: 'in_progress' }),
    ]);

    const totalSales = sales.length;
    const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
    const completedSales = sales.filter(s => s.status === 'completed').length;
    const conversionRate = totalSales > 0 ? (completedSales / totalSales) * 100 : 0;
    const targetProgress = targets.length > 0
      ? targets.reduce((sum, t) => sum + (t.achieved / t.targetAmount) * 100, 0) / targets.length
      : 0;

    // Recent sales
    const recentSales = await Sale.find()
      .sort({ date: -1 })
      .limit(5)
      .populate('customerID', 'name')
      .populate('userID', 'firstName lastName');

    const formattedRecentSales = recentSales.map(s => ({
      _id: s._id,
      customerName: s.customerID?.name || 'Unknown',
      agentName: s.userID ? `${s.userID.firstName} ${s.userID.lastName}` : 'Unknown',
      amount: s.amount,
      status: s.status,
      date: s.date,
    }));

    // Top performers
    const performances = await Performance.find()
      .sort({ totalRevenue: -1 })
      .limit(5)
      .populate('userID', 'firstName lastName');

    const topPerformers = performances.map(p => ({
      _id: p._id,
      name: p.userID ? `${p.userID.firstName} ${p.userID.lastName}` : 'Unknown',
      totalSales: p.totalSales,
      totalRevenue: p.totalRevenue,
      conversionRate: p.conversionRate,
    }));

    res.json({
      stats: {
        totalCustomers: customers,
        totalSales,
        totalRevenue,
        totalAgents: agents.length,
        activeAgents: agents.length,
        conversionRate,
        targetProgress,
      },
      trends: {
        customersTrend: 12.5,
        salesTrend: 8.3,
        revenueTrend: 15.2,
        agentsTrend: 5.1,
        conversionTrend: 3.4,
        targetTrend: 7.8,
      },
      recentSales: formattedRecentSales,
      topPerformers,
      period,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Agent Dashboard
router.get('/agent', auth, async (req, res) => {
  try {
    const userId = req.user;
    const period = req.query.period || 'current_month';
    const { start, end } = getDateRange(period);

    const [customers, sales, revenues, targets] = await Promise.all([
      Customer.countDocuments({ userID: userId }),
      Sale.find({ userID: userId, date: { $gte: start, $lte: end } }),
      Revenue.find({ date: { $gte: start, $lte: end } }),
      Target.find({ userID: userId, status: 'in_progress' }),
    ]);

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, s) => sum + s.amount, 0);
    const completedSales = sales.filter(s => s.status === 'completed').length;
    const conversionRate = totalSales > 0 ? (completedSales / totalSales) * 100 : 0;
    const targetProgress = targets.length > 0
      ? targets.reduce((sum, t) => sum + (t.achieved / t.targetAmount) * 100, 0) / targets.length
      : 0;

    // Recent sales for this agent
    const recentSales = await Sale.find({ userID: userId })
      .sort({ date: -1 })
      .limit(5)
      .populate('customerID', 'name');

    const formattedRecentSales = recentSales.map(s => ({
      _id: s._id,
      customerName: s.customerID?.name || 'Unknown',
      amount: s.amount,
      status: s.status,
      date: s.date,
    }));

    res.json({
      stats: {
        totalCustomers: customers,
        totalSales,
        totalRevenue,
        conversionRate,
        targetProgress,
      },
      trends: {
        salesTrend: 5.2,
        revenueTrend: 8.1,
        conversionTrend: 2.3,
        targetTrend: 4.5,
      },
      recentSales: formattedRecentSales,
      topPerformers: [],
      period,
    });
  } catch (err) {
    console.error('Agent dashboard error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Dashboard summary
router.get('/summary', auth, async (req, res) => {
  try {
    const [totalCustomers, totalSales, totalRevenue, totalAgents, activeTargets] = await Promise.all([
      Customer.countDocuments(),
      Sale.countDocuments(),
      Revenue.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      User.countDocuments({ role: { $in: ['user', 'agent'] } }),
      Target.countDocuments({ status: 'in_progress' }),
    ]);

    res.json({
      totalCustomers,
      totalSales,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalAgents,
      activeTargets,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
