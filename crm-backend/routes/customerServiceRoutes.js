const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const {
  getCustomerServices,
  getServicesByCustomer,
  addServiceToCustomer,
  updateCustomerService,
  removeServiceFromCustomer,
} = require('../controllers/customerServiceController');

router.get('/', auth, getCustomerServices);
router.get('/customer/:customerId', auth, getServicesByCustomer);
router.post('/', auth, addServiceToCustomer);
router.put('/:id', auth, updateCustomerService);
router.delete('/:id', auth, removeServiceFromCustomer);

module.exports = router;
