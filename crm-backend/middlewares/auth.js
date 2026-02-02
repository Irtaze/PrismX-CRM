const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Basic authentication middleware - verifies JWT and attaches user to request
const auth = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Extract token from "Bearer <token>" format
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch the full user object to access role and methods
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;  // Attach full user object
    req.userId = decoded.userId;  // Keep userId for backward compatibility
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

// Admin-only middleware - must be used after auth middleware
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  
  next();
};

// Agent-only middleware - must be used after auth middleware
const isAgent = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== 'agent' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Agent privileges required.' });
  }
  
  next();
};

// Manager or higher middleware
const isManager = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (!['admin', 'manager'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied. Manager privileges required.' });
  }
  
  next();
};

module.exports = { auth, isAdmin, isAgent, isManager };
