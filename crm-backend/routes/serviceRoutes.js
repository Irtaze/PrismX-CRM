const express = require('express');
const auth = require('../middlewares/auth');
const Service = require('../models/Service');

const router = express.Router();

// Get all services
router.get('/', auth, async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get service by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create service
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const service = new Service({ name, description, price, category });
    await service.save();
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update service
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, price, category, isActive } = req.body;
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { name, description, price, category, isActive },
      { new: true }
    );
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete service
router.delete('/:id', auth, async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
