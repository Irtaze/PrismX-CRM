const express = require('express');
const { createPerformance, getPerformances, getPerformanceById, updatePerformance, deletePerformance } = require('../controllers/performanceController');
const auth = require('../middlewares/auth');

const router = express.Router();

router.post('/', auth, createPerformance);
router.get('/', auth, getPerformances);
router.get('/:id', auth, getPerformanceById);
router.put('/:id', auth, updatePerformance);
router.delete('/:id', auth, deletePerformance);

module.exports = router;
