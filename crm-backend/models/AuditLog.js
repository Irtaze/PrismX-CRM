const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  entityType: { type: String, required: true },
  entityID: { type: mongoose.Schema.Types.ObjectId },
  timestamp: { type: Date, default: Date.now },
  changes: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
