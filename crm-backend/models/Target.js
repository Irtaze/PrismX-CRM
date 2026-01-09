const mongoose = require('mongoose');

const targetSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetAmount: { type: Number, required: true },
  period: { type: String, enum: ['monthly', 'quarterly', 'yearly'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  achieved: { type: Number, default: 0 },
  status: { type: String, enum: ['in_progress', 'completed', 'failed'], default: 'in_progress' },
});

module.exports = mongoose.model('Target', targetSchema);
