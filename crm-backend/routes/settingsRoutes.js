const express = require('express');
const auth = require('../middlewares/auth');
const Settings = require('../models/Settings');

const router = express.Router();

// Default settings
const defaultSettings = {
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    salesAlerts: true,
    targetAlerts: true,
    systemUpdates: true,
  },
  privacy: {
    showEmail: true,
    showPhone: true,
    showPerformance: true,
  },
  display: {
    theme: 'light',
    language: 'en',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
  },
};

// Get user settings
router.get('/', auth, async (req, res) => {
  try {
    let settings = await Settings.findOne({ userID: req.user });
    if (!settings) {
      settings = new Settings({ userID: req.user, ...defaultSettings });
      await settings.save();
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update settings
router.put('/', auth, async (req, res) => {
  try {
    const updateData = { ...req.body, updatedAt: new Date() };
    let settings = await Settings.findOneAndUpdate(
      { userID: req.user },
      { $set: updateData },
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Reset settings to default
router.post('/reset', auth, async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      { userID: req.user },
      { $set: { ...defaultSettings, updatedAt: new Date() } },
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
