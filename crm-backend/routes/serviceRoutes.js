const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} = require('../controllers/serviceController');

router.get('/', auth, getServices);
router.get('/:id', auth, getServiceById);
router.post('/', auth, createService);
router.put('/:id', auth, updateService);
router.delete('/:id', auth, deleteService);

module.exports = router;
