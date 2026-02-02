const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  customerID: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  agentID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Link to agent who created the sale
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sale', saleSchema);
