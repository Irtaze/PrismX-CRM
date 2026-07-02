const express = require('express');
const { createPerformance, getPerformances, getPerformanceById, updatePerformance, deletePerformance } = require('../controllers/performanceController');
const Performance = require('../models/Performance');
const auth = require('../middlewares/auth');

const router = express.Router();

router.post('/', auth, createPerformance);
router.get('/', auth, getPerformances);

// Get current user's performance - must be before /:id route
router.get('/me', auth, async (req, res) => {
  try {
    const performance = await Performance.findOne({ userID: req.user })
      .sort({ date: -1 })
      .populate('userID');
    if (!performance) {
      return res.json({
        userID: req.user,
        totalSales: 0,
        totalRevenue: 0,
        targetAchievement: 0,
        conversionRate: 0,
        period: 'daily',
      });
    }
    res.json(performance);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:id', auth, getPerformanceById);
router.put('/:id', auth, updatePerformance);
router.delete('/:id', auth, deletePerformance);

module.exports = router;
