const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  notifications: {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    salesAlerts: { type: Boolean, default: true },
    targetAlerts: { type: Boolean, default: true },
    systemUpdates: { type: Boolean, default: true },
  },
  privacy: {
    showEmail: { type: Boolean, default: true },
    showPhone: { type: Boolean, default: false },
    showPerformance: { type: Boolean, default: true },
  },
  display: {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
    language: { type: String, default: 'en' },
    currency: { type: String, default: 'USD' },
    dateFormat: { type: String, default: 'MM/DD/YYYY' },
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Settings', settingsSchema);
