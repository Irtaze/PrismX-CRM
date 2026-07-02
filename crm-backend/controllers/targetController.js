const Target = require('../models/Target');

exports.createTarget = async (req, res) => {
  const { userID, targetAmount, period, startDate, endDate, status } = req.body;
  try {
    const newTarget = new Target({ userID, targetAmount, period, startDate, endDate, status });
    await newTarget.save();
    res.status(201).json(newTarget);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getTargets = async (req, res) => {
  try {
    const targets = await Target.find().populate('userID');
    res.json(targets);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getTargetById = async (req, res) => {
  try {
    const target = await Target.findById(req.params.id).populate('userID');
    if (!target) return res.status(404).json({ message: 'Target not found' });
    res.json(target);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateTarget = async (req, res) => {
  const { targetAmount, period, startDate, endDate, achieved, status } = req.body;
  try {
    const target = await Target.findByIdAndUpdate(
      req.params.id,
      { targetAmount, period, startDate, endDate, achieved, status },
      { new: true }
    ).populate('userID');
    if (!target) return res.status(404).json({ message: 'Target not found' });
    res.json(target);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteTarget = async (req, res) => {
  try {
    const target = await Target.findByIdAndDelete(req.params.id);
    if (!target) return res.status(404).json({ message: 'Target not found' });
    res.json({ message: 'Target deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
