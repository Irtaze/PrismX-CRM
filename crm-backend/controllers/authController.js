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
    
    if (name && !firstName && !lastName) {
      const nameParts = name.trim().split(' ');
      finalFirstName = nameParts[0] || 'User';
      finalLastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'User';
    }
    
    // Ensure both names have values (required by User model)
    if (!finalFirstName) finalFirstName = 'User';
    if (!finalLastName) finalLastName = 'User';

    const newUser = new User({
      firstName: finalFirstName,
      lastName: finalLastName,
      email,
      password: hashedPassword,
      role: role || 'user',
    });

    await newUser.save();
    const payload = { userId: newUser._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ 
      token,
      user: {
        id: newUser._id,
        name: `${newUser.firstName} ${newUser.lastName}`.trim(),
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

    const payload = { userId: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ 
      token,
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
