const Customer = require('../models/Customer');

exports.createCustomer = async (req, res) => {
  const { userID, name, email, phoneNumber, cardReference } = req.body;
  
  // Validation
  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'Validation error: name is required' });
  }
  if (!email || email.trim() === '') {
    return res.status(400).json({ message: 'Validation error: email is required' });
  }
  
  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Validation error: please provide a valid email address' });
  }
  
  try {
    const newCustomer = new Customer({
      userID,
      name,
      email,
      phoneNumber,
      cardReference,
    });
    await newCustomer.save();
    res.status(201).json(newCustomer);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Validation error: email already exists' });
    }
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().populate('userID');
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate('userID');
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateCustomer = async (req, res) => {
  const { name, email, phoneNumber, cardReference } = req.body;
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { name, email, phoneNumber, cardReference },
      { new: true }
    );
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
