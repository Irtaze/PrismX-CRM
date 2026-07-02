const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String },
  dateAdded: { type: Date, default: Date.now },
  cardReference: { type: String },
});

const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;
