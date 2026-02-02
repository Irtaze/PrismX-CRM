const CustomerService = require('../models/CustomerService');

// Get all customer services
exports.getCustomerServices = async (req, res) => {
  try {
    const customerServices = await CustomerService.find()
      .populate('customerID')
      .populate('serviceID');
    res.json(customerServices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customer services', error: error.message });
  }
};

// Get services for a specific customer
exports.getServicesByCustomer = async (req, res) => {
  try {
    const services = await CustomerService.find({ customerID: req.params.customerId })
      .populate('serviceID');
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customer services', error: error.message });
  }
};

// Add service to customer
exports.addServiceToCustomer = async (req, res) => {
  try {
    const { customerID, serviceID, amount, startDate, endDate, notes } = req.body;
    const customerService = new CustomerService({
      customerID,
      serviceID,
      amount,
      startDate,
      endDate,
      notes,
    });
    await customerService.save();
    const populated = await CustomerService.findById(customerService._id)
      .populate('customerID')
      .populate('serviceID');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Error adding service to customer', error: error.message });
  }
};

// Update customer service
exports.updateCustomerService = async (req, res) => {
  try {
    const customerService = await CustomerService.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('customerID').populate('serviceID');
    if (!customerService) {
      return res.status(404).json({ message: 'Customer service not found' });
    }
    res.json(customerService);
  } catch (error) {
    res.status(500).json({ message: 'Error updating customer service', error: error.message });
  }
};

// Remove service from customer
exports.removeServiceFromCustomer = async (req, res) => {
  try {
    const customerService = await CustomerService.findByIdAndDelete(req.params.id);
    if (!customerService) {
      return res.status(404).json({ message: 'Customer service not found' });
    }
    res.json({ message: 'Service removed from customer' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing service from customer', error: error.message });
  }
};
