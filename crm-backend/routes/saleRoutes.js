const express = require('express');
const { createSale, getSales, getSaleById, updateSale, deleteSale } = require('../controllers/saleController');
const { auth } = require('../middlewares/auth');

const router = express.Router();

router.post('/', auth, createSale);      // Protected - Creates sale linked to agent
router.get('/', auth, getSales);         // Protected - Filtered by role
router.get('/:id', auth, getSaleById);   // Protected - Access controlled
router.put('/:id', auth, updateSale);    // Protected - Access controlled
router.delete('/:id', auth, deleteSale); // Protected - Access controlled

module.exports = router;
