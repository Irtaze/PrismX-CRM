const express = require('express');
const { createCustomer, getCustomers, getCustomerById, updateCustomer, deleteCustomer } = require('../controllers/customerController');
const auth = require('../middlewares/auth');

const router = express.Router();

router.post('/', auth, createCustomer);           // Protected route - Create customer
router.get('/', auth, getCustomers);              // Protected route - Get all customers
router.get('/:id', auth, getCustomerById);        // Protected route - Get customer by ID
router.put('/:id', auth, updateCustomer);         // Protected route - Update customer
router.delete('/:id', auth, deleteCustomer);      // Protected route - Delete customer

module.exports = router;
