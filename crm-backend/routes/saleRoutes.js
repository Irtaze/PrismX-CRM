const express = require('express');
const { createSale, getSales, getSaleById, updateSale, deleteSale } = require('../controllers/saleController');
const auth = require('../middlewares/auth');

const router = express.Router();

router.post('/', auth, createSale);
router.get('/', auth, getSales);
router.get('/:id', auth, getSaleById);
router.put('/:id', auth, updateSale);
router.delete('/:id', auth, deleteSale);

module.exports = router;
