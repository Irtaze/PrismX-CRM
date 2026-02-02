const Settings = require('../models/Settings');

// Get settings for user
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ userID: req.user.id });
    if (!settings) {
      // Create default settings if none exist
      settings = new Settings({ userID: req.user.id });
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
};

// Update settings
exports.updateSettings = async (req, res) => {
  try {
    const { notifications, privacy, display } = req.body;
    
    let settings = await Settings.findOne({ userID: req.user.id });
    if (!settings) {
      settings = new Settings({ userID: req.user.id });
    }
    
    if (notifications) {
      settings.notifications = { ...settings.notifications, ...notifications };
    }
    if (privacy) {
      settings.privacy = { ...settings.privacy, ...privacy };
    }
    if (display) {
      settings.display = { ...settings.display, ...display };
    }
    settings.updatedAt = Date.now();
    
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings', error: error.message });
  }
};

// Reset settings to default
exports.resetSettings = async (req, res) => {
  try {
    await Settings.findOneAndDelete({ userID: req.user.id });
    const settings = new Settings({ userID: req.user.id });
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error resetting settings', error: error.message });
  }
};
