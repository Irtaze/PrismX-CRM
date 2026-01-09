const AuditLog = require('../models/AuditLog');

exports.createAuditLog = async (req, res) => {
  const { userID, action, entityType, entityID, changes, ipAddress } = req.body;
  try {
    const newAuditLog = new AuditLog({ userID, action, entityType, entityID, changes, ipAddress });
    await newAuditLog.save();
    res.status(201).json(newAuditLog);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const auditLogs = await AuditLog.find().populate('userID');
    res.json(auditLogs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAuditLogById = async (req, res) => {
  try {
    const auditLog = await AuditLog.findById(req.params.id).populate('userID');
    if (!auditLog) return res.status(404).json({ message: 'Audit log not found' });
    res.json(auditLog);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteAuditLog = async (req, res) => {
  try {
    const auditLog = await AuditLog.findByIdAndDelete(req.params.id);
    if (!auditLog) return res.status(404).json({ message: 'Audit log not found' });
    res.json({ message: 'Audit log deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
