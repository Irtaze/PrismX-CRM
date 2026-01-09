const express = require('express');
const { createRevenue, getRevenues, getRevenueById, updateRevenue, deleteRevenue } = require('../controllers/revenueController');
const auth = require('../middlewares/auth');

const router = express.Router();

router.post('/', auth, createRevenue);
router.get('/', auth, getRevenues);
router.get('/:id', auth, getRevenueById);
router.put('/:id', auth, updateRevenue);
router.delete('/:id', auth, deleteRevenue);

module.exports = router;
