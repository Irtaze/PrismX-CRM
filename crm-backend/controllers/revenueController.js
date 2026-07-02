const Revenue = require('../models/Revenue');

exports.createRevenue = async (req, res) => {
  const { saleID, amount, source, category } = req.body;
  try {
    const newRevenue = new Revenue({ saleID, amount, source, category });
    await newRevenue.save();
    res.status(201).json(newRevenue);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getRevenues = async (req, res) => {
  try {
    const revenues = await Revenue.find().populate('saleID');
    res.json(revenues);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getRevenueById = async (req, res) => {
  try {
    const revenue = await Revenue.findById(req.params.id).populate('saleID');
    if (!revenue) return res.status(404).json({ message: 'Revenue not found' });
    res.json(revenue);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateRevenue = async (req, res) => {
  const { amount, source, category } = req.body;
  try {
    const revenue = await Revenue.findByIdAndUpdate(
      req.params.id,
      { amount, source, category },
      { new: true }
    ).populate('saleID');
    if (!revenue) return res.status(404).json({ message: 'Revenue not found' });
    res.json(revenue);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteRevenue = async (req, res) => {
  try {
    const revenue = await Revenue.findByIdAndDelete(req.params.id);
    if (!revenue) return res.status(404).json({ message: 'Revenue not found' });
    res.json({ message: 'Revenue deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
