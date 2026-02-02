const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'agent'],
    default: 'agent',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Custom methods for role checking
userSchema.methods.isAdmin = function () {
  return this.role === 'admin';
};

userSchema.methods.isAgent = function () {
  return this.role === 'agent';
};

userSchema.methods.isManager = function () {
  return this.role === 'manager';
};

module.exports = mongoose.model('User', userSchema);
