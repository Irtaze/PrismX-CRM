const express = require('express');
const { createTarget, getTargets, getTargetById, updateTarget, deleteTarget } = require('../controllers/targetController');
const auth = require('../middlewares/auth');

const router = express.Router();

router.post('/', auth, createTarget);
router.get('/', auth, getTargets);
router.get('/:id', auth, getTargetById);
router.put('/:id', auth, updateTarget);
router.delete('/:id', auth, deleteTarget);

module.exports = router;
