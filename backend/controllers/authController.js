const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register a new user
exports.register = async (req, res) => {
  const { registrationNumber, fullName, password } = req.body;

  try {
    const existingUser = await User.findOne({ registrationNumber });
    if (existingUser) {
      return res.status(400).json({ message: 'Registration number already exists' });
    }

    const user = new User({ registrationNumber, fullName, password });
    await user.save();

    // 🔒 SECURITY ENHANCEMENT: JWT token generation with enhanced security claims
    const token = jwt.sign(
      { _id: user._id }, 
      process.env.JWT_SECRET, 
      { 
        expiresIn: '1d',
        algorithm: 'HS256',          // 🔒 Explicit algorithm specification
        issuer: 'my-academia',       // 🔒 Token issuer claim
        audience: 'my-academia-users' // 🔒 Token audience claim
      }
    );

    res.status(201).json({ 
      token,
      user: {
        _id: user._id,
        registrationNumber: user.registrationNumber,
        fullName: user.fullName
      }
    });
  } catch (error) {
    // 🔒 SECURITY MEASURE: Secure error handling (OWASP A09:2021 - Information Disclosure Fix)
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Something went wrong' }); // 🔒 Generic error message
  }
};

// Login user
exports.login = async (req, res) => {
  const { registrationNumber, password } = req.body;

  try {
    const user = await User.findOne({ registrationNumber });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 🔒 SECURITY ENHANCEMENT: JWT token generation with enhanced security claims
    const token = jwt.sign(
      { _id: user._id }, 
      process.env.JWT_SECRET, 
      { 
        expiresIn: '1d',
        algorithm: 'HS256',          // 🔒 Explicit algorithm specification
        issuer: 'my-academia',       // 🔒 Token issuer claim
        audience: 'my-academia-users' // 🔒 Token audience claim
      }
    );

    res.json({ 
      token,
      user: {
        _id: user._id,
        registrationNumber: user.registrationNumber,
        fullName: user.fullName
      }
    });
  } catch (error) {
    // 🔒 SECURITY MEASURE: Secure error handling (OWASP A09:2021 - Information Disclosure Fix)
    console.error('Login error:', error);
    res.status(500).json({ message: 'Something went wrong' }); // 🔒 Generic error message
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    // Since auth middleware already sets req.user, we can just send it
    res.json({
      _id: req.user._id,
      registrationNumber: req.user.registrationNumber,
      fullName: req.user.fullName,
      createdAt: req.user.createdAt
    });
  } catch (error) {
    // 🔒 SECURITY MEASURE: Secure error handling - no sensitive information exposed
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Something went wrong' }); // 🔒 Generic error message
  }
};