const Payment = require('../models/Payment');

exports.createPayment = async (req, res) => {
  const { saleID, customerID, amount, paymentMethod, status } = req.body;
  try {
    const newPayment = new Payment({ saleID, customerID, amount, paymentMethod, status });
    await newPayment.save();
    res.status(201).json(newPayment);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate('saleID').populate('customerID');
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('saleID').populate('customerID');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updatePayment = async (req, res) => {
  const { amount, paymentMethod, status } = req.body;
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { amount, paymentMethod, status },
      { new: true }
    ).populate('saleID').populate('customerID');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json({ message: 'Payment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
