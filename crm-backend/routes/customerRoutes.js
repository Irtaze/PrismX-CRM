const express = require('express');
const { createCustomer, getCustomers, getCustomerById, updateCustomer, deleteCustomer } = require('../controllers/customerController');
const { auth } = require('../middlewares/auth');

const router = express.Router();

router.post('/', auth, createCustomer);           // Protected route - Create customer (agent links automatically)
router.get('/', auth, getCustomers);              // Protected route - Get all customers (filtered by role)
router.get('/:id', auth, getCustomerById);        // Protected route - Get customer by ID (access controlled)
router.put('/:id', auth, updateCustomer);         // Protected route - Update customer (access controlled)
router.delete('/:id', auth, deleteCustomer);      // Protected route - Delete customer (access controlled)

module.exports = router;
