const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, isAdmin } = require('../middlewares/auth');

// All admin routes require authentication and admin role
router.use(auth);
router.use(isAdmin);

// Agent management routes
router.post('/agents', adminController.createAgent);
router.get('/agents', adminController.getAgents);
router.get('/agents/:id', adminController.getAgentById);
router.put('/agents/:id', adminController.updateAgent);
router.delete('/agents/:id', adminController.deleteAgent);
router.get('/agents/:id/stats', adminController.getAgentStats);

// Get all users
router.get('/users', adminController.getAllUsers);

module.exports = router;
