const mongoose = require('mongoose');

const revenueSchema = new mongoose.Schema({
  saleID: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  source: { type: String, required: true },
  category: { type: String },
});

module.exports = mongoose.model('Revenue', revenueSchema);
