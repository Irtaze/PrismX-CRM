const express = require('express');
const auth = require('../middlewares/auth');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Sale = require('../models/Sale');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Get all users (admin)
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create user (admin)
router.post('/users', auth, async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, name } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName: firstName || (name ? name.split(' ')[0] : ''),
      lastName: lastName || (name ? name.split(' ').slice(1).join(' ') : ''),
      email,
      password: hashedPassword,
      role: role || 'user',
    });
    await newUser.save();
    const userResponse = newUser.toObject();
    delete userResponse.password;
    res.status(201).json({ message: 'User created', user: userResponse });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update user (admin)
router.put('/users/:id', auth, async (req, res) => {
  try {
    const { firstName, lastName, email, role, name } = req.body;
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (name) {
      updateData.firstName = name.split(' ')[0];
      updateData.lastName = name.split(' ').slice(1).join(' ');
    }
    if (email) updateData.email = email;
    if (role) updateData.role = role;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete user (admin)
router.delete('/users/:id', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all agents
router.get('/agents', auth, async (req, res) => {
  try {
    const agents = await User.find({ role: { $in: ['user', 'agent'] } }).select('-password');
    res.json(agents);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create agent
router.post('/agents', auth, async (req, res) => {
  try {
    const { name, email, password, phoneNumber, role } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Agent with this email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const nameParts = name ? name.trim().split(' ') : ['User'];
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || nameParts[0];
    
    const newAgent = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber: phoneNumber || '',
      role: role || 'user',
    });
    await newAgent.save();
    const agentResponse = newAgent.toObject();
    delete agentResponse.password;
    res.status(201).json({ message: 'Agent created', agent: agentResponse });
  } catch (err) {
    console.error('Agent creation error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get agent by ID
router.get('/agents/:id', auth, async (req, res) => {
  try {
    const agent = await User.findById(req.params.id).select('-password');
    if (!agent) return res.status(404).json({ message: 'Agent not found' });
    res.json(agent);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update agent
router.put('/agents/:id', auth, async (req, res) => {
  try {
    const { name, email, phoneNumber } = req.body;
    const updateData = {};
    if (name) {
      updateData.firstName = name.split(' ')[0];
      updateData.lastName = name.split(' ').slice(1).join(' ');
    }
    if (email) updateData.email = email;

    const agent = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    if (!agent) return res.status(404).json({ message: 'Agent not found' });
    res.json({ message: 'Agent updated', agent });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete agent
router.delete('/agents/:id', auth, async (req, res) => {
  try {
    const agent = await User.findByIdAndDelete(req.params.id);
    if (!agent) return res.status(404).json({ message: 'Agent not found' });
    res.json({ message: 'Agent deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get agent stats
router.get('/agents/:id/stats', auth, async (req, res) => {
  try {
    const agent = await User.findById(req.params.id).select('-password');
    if (!agent) return res.status(404).json({ message: 'Agent not found' });

    const [totalCustomers, sales] = await Promise.all([
      Customer.countDocuments({ userID: req.params.id }),
      Sale.find({ userID: req.params.id }),
    ]);

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, s) => sum + s.amount, 0);
    const completedSales = sales.filter(s => s.status === 'completed').length;

    res.json({
      agent,
      stats: {
        totalCustomers,
        totalSales,
        totalRevenue,
        completedSales,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
