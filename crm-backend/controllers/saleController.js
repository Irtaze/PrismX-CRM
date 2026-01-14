const Sale = require('../models/Sale');

exports.createSale = async (req, res) => {
  const { userID, customerID, amount, status, description } = req.body;
  
  // Validation
  if (!userID) {
    return res.status(400).json({ message: 'Validation error: userID is required' });
  }
  if (!customerID) {
    return res.status(400).json({ message: 'Validation error: customerID is required' });
  }
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Validation error: amount must be a positive number' });
  }
  
  try {
    const newSale = new Sale({ userID, customerID, amount, status, description });
    await newSale.save();
    res.status(201).json(newSale);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getSales = async (req, res) => {
  try {
    const sales = await Sale.find().populate('userID').populate('customerID');
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id).populate('userID').populate('customerID');
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.json(sale);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateSale = async (req, res) => {
  const { amount, status, description } = req.body;
  try {
    const sale = await Sale.findByIdAndUpdate(
      req.params.id,
      { amount, status, description },
      { new: true }
    ).populate('userID').populate('customerID');
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.json(sale);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findByIdAndDelete(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.json({ message: 'Sale deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
