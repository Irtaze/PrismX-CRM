const Sale = require('../models/Sale');
const Customer = require('../models/Customer');

// Create sale - Agent can only create sales for their own customers
exports.createSale = async (req, res) => {
  const { customerID, amount, status, description } = req.body;
  
  // Validation
  if (!customerID) {
    return res.status(400).json({ message: 'Validation error: customerID is required' });
  }
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Validation error: amount must be a positive number' });
  }
  
  try {
    // Verify the customer exists and belongs to the agent (unless admin)
    const customer = await Customer.findById(customerID);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Check if agent is trying to create a sale for another agent's customer
    if (req.user.role !== 'admin' && customer.agentID.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only create sales for your own customers.' });
    }
    
    const newSale = new Sale({ 
      agentID: req.user._id,  // Automatically set to the logged-in agent
      customerID, 
      amount, 
      status, 
      description 
    });
    await newSale.save();
    
    // Populate the response
    const populatedSale = await Sale.findById(newSale._id)
      .populate('agentID', 'name email role')
      .populate('customerID', 'name email');
    
    res.status(201).json(populatedSale);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get sales - Admin sees all, Agent sees only their own
exports.getSales = async (req, res) => {
  try {
    let query = {};
    
    // If user is not admin, only return their own sales
    if (req.user.role !== 'admin') {
      query.agentID = req.user._id;
    }
    
    const sales = await Sale.find(query)
      .populate('agentID', 'name email role')
      .populate('customerID', 'name email');
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get sale by ID - Admin can access any, Agent can only access their own
exports.getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('agentID', 'name email role')
      .populate('customerID', 'name email');
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    
    // Check if agent is trying to access another agent's sale
    if (req.user.role !== 'admin' && sale.agentID._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only view your own sales.' });
    }
    
    res.json(sale);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update sale - Admin can update any, Agent can only update their own
exports.updateSale = async (req, res) => {
  const { amount, status, description } = req.body;
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    
    // Check if agent is trying to update another agent's sale
    if (req.user.role !== 'admin' && sale.agentID.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only update your own sales.' });
    }
    
    const updatedSale = await Sale.findByIdAndUpdate(
      req.params.id,
      { amount, status, description },
      { new: true }
    ).populate('agentID', 'name email role').populate('customerID', 'name email');
    
    res.json(updatedSale);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete sale - Admin can delete any, Agent can only delete their own
exports.deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    
    // Check if agent is trying to delete another agent's sale
    if (req.user.role !== 'admin' && sale.agentID.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only delete your own sales.' });
    }
    
    await Sale.findByIdAndDelete(req.params.id);
    res.json({ message: 'Sale deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
