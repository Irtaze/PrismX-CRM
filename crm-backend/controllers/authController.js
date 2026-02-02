const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  const { firstName, lastName, name, email, password, role } = req.body;

  try {
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle both name formats: single 'name' field or separate firstName/lastName
    let finalFirstName = firstName || '';
    let finalLastName = lastName || '';
    let finalName = name || '';
    
    if (name && !firstName && !lastName) {
      const nameParts = name.trim().split(' ');
      finalFirstName = nameParts[0] || 'User';
      finalLastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'User';
    } else if (firstName || lastName) {
      finalName = `${firstName || ''} ${lastName || ''}`.trim();
    }
    
    // Ensure both names have values (required by User model)
    if (!finalFirstName) finalFirstName = 'User';
    if (!finalLastName) finalLastName = 'User';
    if (!finalName) finalName = `${finalFirstName} ${finalLastName}`.trim();

    // Allow admin role for bootstrap. After initial setup, admin users should be created via admin API
    const userRole = (role && ['admin', 'manager', 'agent'].includes(role)) ? role : 'agent';

    const newUser = new User({
      firstName: finalFirstName,
      lastName: finalLastName,
      name: finalName,
      email,
      password: hashedPassword,
      role: userRole,
    });

    await newUser.save();
    const payload = { userId: newUser._id, role: newUser.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({ 
      token,
      user: {
        id: newUser._id,
        name: newUser.name || `${newUser.firstName} ${newUser.lastName}`.trim(),
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error('Register error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const payload = { userId: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({ 
      token,
      user: {
        id: user._id,
        name: user.name || `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
