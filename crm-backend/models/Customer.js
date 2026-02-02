const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  agentID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Link to agent who created the customer
  name: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String },
  dateAdded: { type: Date, default: Date.now },
  cardReference: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;
