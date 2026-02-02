const Customer = require('../models/Customer');

// Create customer - automatically links to the creating agent
exports.createCustomer = async (req, res) => {
  const { name, email, phoneNumber, cardReference } = req.body;
  
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
      agentID: req.user._id,  // Automatically set to the logged-in agent
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

// Get customers - Admin sees all, Agent sees only their own
exports.getCustomers = async (req, res) => {
  try {
    let query = {};
    
    // If user is not admin, only return their own customers
    if (req.user.role !== 'admin') {
      query.agentID = req.user._id;
    }
    
    const customers = await Customer.find(query).populate('agentID', 'name email role');
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get customer by ID - Admin can access any, Agent can only access their own
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate('agentID', 'name email role');
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    
    // Check if agent is trying to access another agent's customer
    if (req.user.role !== 'admin' && customer.agentID._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only view your own customers.' });
    }
    
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update customer - Admin can update any, Agent can only update their own
exports.updateCustomer = async (req, res) => {
  const { name, email, phoneNumber, cardReference } = req.body;
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    
    // Check if agent is trying to update another agent's customer
    if (req.user.role !== 'admin' && customer.agentID.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only update your own customers.' });
    }
    
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      { name, email, phoneNumber, cardReference },
      { new: true }
    ).populate('agentID', 'name email role');
    
    res.json(updatedCustomer);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete customer - Admin can delete any, Agent can only delete their own
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    
    // Check if agent is trying to delete another agent's customer
    if (req.user.role !== 'admin' && customer.agentID.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only delete your own customers.' });
    }
    
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
