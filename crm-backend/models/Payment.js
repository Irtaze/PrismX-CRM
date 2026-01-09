const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  saleID: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale', required: true },
  customerID: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  paymentMethod: { type: String, enum: ['credit_card', 'bank_transfer', 'cash', 'check'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
});

module.exports = mongoose.model('Payment', paymentSchema);
