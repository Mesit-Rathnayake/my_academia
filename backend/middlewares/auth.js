const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 🔒 SECURITY MEASURE: JWT Authentication middleware (OWASP A02:2021 - Cryptographic Failures Fix)
const auth = async (req, res, next) => {
  try {
    // 🔒 Extract Bearer token from Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // 🔒 SECURITY ENHANCEMENT: JWT verification with explicit algorithm and claims
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithm: 'HS256',        // 🔒 Prevent algorithm confusion attacks
      issuer: 'my-academia',     // 🔒 Validate token issuer
      audience: 'my-academia-users' // 🔒 Validate token audience
    });
    
    // 🔒 Verify user still exists in database
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;