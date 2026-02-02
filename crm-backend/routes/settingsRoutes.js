const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const {
  getSettings,
  updateSettings,
  resetSettings,
} = require('../controllers/settingsController');

router.get('/', auth, getSettings);
router.put('/', auth, updateSettings);
router.post('/reset', auth, resetSettings);

module.exports = router;
