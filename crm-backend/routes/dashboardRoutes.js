const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { auth } = require('../middlewares/auth');

/**
 * Dashboard Routes
 * All routes require authentication
 */

// Get admin dashboard statistics
router.get('/admin', auth, dashboardController.getAdminDashboard);

// Get agent dashboard statistics (user's own performance)
router.get('/agent', auth, dashboardController.getAgentDashboard);

// Get dashboard summary (lightweight)
router.get('/summary', auth, dashboardController.getDashboardSummary);

module.exports = router;
