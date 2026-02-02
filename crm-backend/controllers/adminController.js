const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Create a new agent (Admin only)
exports.createAgent = async (req, res) => {
  const { name, firstName, lastName, email, password, phoneNumber } = req.body;
  
  // Validation
  let finalFirstName = firstName || '';
  let finalLastName = lastName || '';
  let finalName = name || '';
  
  // Parse name if provided as single field
  if (name && !firstName && !lastName) {
    const nameParts = name.trim().split(' ');
    finalFirstName = nameParts[0] || 'Agent';
    finalLastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'User';
  } else if (firstName || lastName) {
    finalName = `${firstName || ''} ${lastName || ''}`.trim();
  }
  
  // Ensure both names have values
  if (!finalFirstName) finalFirstName = 'Agent';
  if (!finalLastName) finalLastName = 'User';
  if (!finalName) finalName = `${finalFirstName} ${finalLastName}`.trim();
  
  // Validation
  if (!email || email.trim() === '') {
    return res.status(400).json({ message: 'Validation error: email is required' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Validation error: password must be at least 6 characters' });
  }
  
  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Validation error: please provide a valid email address' });
  }
  
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new agent
    const newAgent = new User({
      firstName: finalFirstName,
      lastName: finalLastName,
      name: finalName,
      email,
      password: hashedPassword,
      phoneNumber,
      role: 'agent'  // Always create as agent
    });
    
    await newAgent.save();
    
    // Return agent without password
    const agentResponse = {
      _id: newAgent._id,
      firstName: newAgent.firstName,
      lastName: newAgent.lastName,
      name: newAgent.name,
      email: newAgent.email,
      phoneNumber: newAgent.phoneNumber,
      role: newAgent.role,
      createdAt: newAgent.createdAt
    };
    
    res.status(201).json({ message: 'Agent created successfully', agent: agentResponse });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all agents (Admin only)
exports.getAgents = async (req, res) => {
  try {
    const agents = await User.find({ role: 'agent' }).select('-password');
    res.json(agents);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get agent by ID (Admin only)
exports.getAgentById = async (req, res) => {
  try {
    const agent = await User.findById(req.params.id).select('-password');
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    res.json(agent);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update agent (Admin only)
exports.updateAgent = async (req, res) => {
  const { name, email, phoneNumber, password } = req.body;
  
  try {
    const agent = await User.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    
    // Don't allow modifying admin users through this endpoint
    if (agent.role === 'admin') {
      return res.status(403).json({ message: 'Cannot modify admin users through this endpoint' });
    }
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    
    // If password is being updated, hash it
    if (password && password.length >= 6) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    
    const updatedAgent = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');
    
    res.json({ message: 'Agent updated successfully', agent: updatedAgent });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete agent (Admin only)
exports.deleteAgent = async (req, res) => {
  try {
    const agent = await User.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    
    // Don't allow deleting admin users
    if (agent.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Agent deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get agent statistics (Admin only)
exports.getAgentStats = async (req, res) => {
  const Sale = require('../models/Sale');
  const Customer = require('../models/Customer');
  
  try {
    const agentId = req.params.id;
    
    // Get agent info
    const agent = await User.findById(agentId).select('-password');
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    
    // Get agent's sales count and total
    const salesStats = await Sale.aggregate([
      { $match: { agentID: agent._id } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$amount' },
          completedSales: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);
    
    // Get agent's customer count
    const customerCount = await Customer.countDocuments({ agentID: agent._id });
    
    res.json({
      agent,
      stats: {
        totalCustomers: customerCount,
        totalSales: salesStats[0]?.totalSales || 0,
        totalRevenue: salesStats[0]?.totalRevenue || 0,
        completedSales: salesStats[0]?.completedSales || 0
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
