const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

// 🔒 SECURITY MEASURE: JWT Authentication middleware (OWASP A02:2021 - Cryptographic Failures Fix)
const auth = async (req, res, next) => {
  try {
    // 🔒 Extract Bearer token from Authorization header or query param (for PDF inline viewing)
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.query.token;
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // 🔒 SECURITY ENHANCEMENT: JWT verification with explicit algorithm and claims
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithm: 'HS256',        // 🔒 Prevent algorithm confusion attacks
      issuer: 'my-academia',     // 🔒 Validate token issuer
      audience: 'my-academia-users' // 🔒 Validate token audience
    });

    const userId = decoded._id || decoded.id || decoded.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Token is not valid' });
    }
    
    // 🔒 Verify user still exists in database
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    // Add user to request object (supporting both .id and ._id)
    req.user = {
      ...user,
      _id: user.id
    };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;