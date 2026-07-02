const express = require('express');
const auth = require('../middlewares/auth');
const CustomerService = require('../models/CustomerService');

const router = express.Router();

// Get all customer services
router.get('/', auth, async (req, res) => {
  try {
    const customerServices = await CustomerService.find()
      .populate('customerID')
      .populate('serviceID');
    res.json(customerServices);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get customer services by customer ID
router.get('/customer/:customerId', auth, async (req, res) => {
  try {
    const customerServices = await CustomerService.find({ customerID: req.params.customerId })
      .populate('customerID')
      .populate('serviceID');
    res.json(customerServices);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create customer service
router.post('/', auth, async (req, res) => {
  try {
    const { customerID, serviceID, amount, startDate, endDate, notes } = req.body;
    const customerService = new CustomerService({
      customerID, serviceID, amount, startDate, endDate, notes,
    });
    await customerService.save();
    const populated = await customerService.populate(['customerID', 'serviceID']);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update customer service
router.put('/:id', auth, async (req, res) => {
  try {
    const { customerID, serviceID, amount, startDate, endDate, notes, status } = req.body;
    const customerService = await CustomerService.findByIdAndUpdate(
      req.params.id,
      { customerID, serviceID, amount, startDate, endDate, notes, status },
      { new: true }
    ).populate('customerID').populate('serviceID');
    if (!customerService) return res.status(404).json({ message: 'Customer service not found' });
    res.json(customerService);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete customer service
router.delete('/:id', auth, async (req, res) => {
  try {
    const customerService = await CustomerService.findByIdAndDelete(req.params.id);
    if (!customerService) return res.status(404).json({ message: 'Customer service not found' });
    res.json({ message: 'Customer service deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
