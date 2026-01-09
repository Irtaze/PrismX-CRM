const Performance = require('../models/Performance');

exports.createPerformance = async (req, res) => {
  const { userID, totalSales, totalRevenue, targetAchievement, conversionRate, period } = req.body;
  try {
    const newPerformance = new Performance({ userID, totalSales, totalRevenue, targetAchievement, conversionRate, period });
    await newPerformance.save();
    res.status(201).json(newPerformance);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getPerformances = async (req, res) => {
  try {
    const performances = await Performance.find().populate('userID');
    res.json(performances);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getPerformanceById = async (req, res) => {
  try {
    const performance = await Performance.findById(req.params.id).populate('userID');
    if (!performance) return res.status(404).json({ message: 'Performance not found' });
    res.json(performance);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updatePerformance = async (req, res) => {
  const { totalSales, totalRevenue, targetAchievement, conversionRate, period } = req.body;
  try {
    const performance = await Performance.findByIdAndUpdate(
      req.params.id,
      { totalSales, totalRevenue, targetAchievement, conversionRate, period },
      { new: true }
    ).populate('userID');
    if (!performance) return res.status(404).json({ message: 'Performance not found' });
    res.json(performance);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deletePerformance = async (req, res) => {
  try {
    const performance = await Performance.findByIdAndDelete(req.params.id);
    if (!performance) return res.status(404).json({ message: 'Performance not found' });
    res.json({ message: 'Performance deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
