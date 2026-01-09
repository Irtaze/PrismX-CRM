const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalSales: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  targetAchievement: { type: Number, default: 0 },
  conversionRate: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
  period: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
});

module.exports = mongoose.model('Performance', performanceSchema);
