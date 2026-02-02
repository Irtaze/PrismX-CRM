const express = require('express');
const { createAuditLog, getAuditLogs, getAuditLogById, deleteAuditLog } = require('../controllers/auditLogController');
const { auth } = require('../middlewares/auth');

const router = express.Router();

router.post('/', auth, createAuditLog);
router.get('/', auth, getAuditLogs);
router.get('/:id', auth, getAuditLogById);
router.delete('/:id', auth, deleteAuditLog);

module.exports = router;
