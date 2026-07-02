const express = require('express');
const { createPayment, getPayments, getPaymentById, updatePayment, deletePayment } = require('../controllers/paymentController');
const auth = require('../middlewares/auth');

const router = express.Router();

router.post('/', auth, createPayment);
router.get('/', auth, getPayments);
router.get('/:id', auth, getPaymentById);
router.put('/:id', auth, updatePayment);
router.delete('/:id', auth, deletePayment);

module.exports = router;
