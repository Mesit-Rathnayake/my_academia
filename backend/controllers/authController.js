const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Register a new user
exports.register = async (req, res) => {
  const { registrationNumber, fullName, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { registrationNumber } });
    if (existingUser) {
      return res.status(400).json({ message: 'Registration number already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        registrationNumber,
        fullName,
        password: hashedPassword
      }
    });

    const token = jwt.sign(
      { _id: user.id }, 
      process.env.JWT_SECRET, 
      { 
        expiresIn: '1d',
        algorithm: 'HS256',
        issuer: 'my-academia',
        audience: 'my-academia-users'
      }
    );

    res.status(201).json({ 
      token,
      user: {
        _id: user.id,
        registrationNumber: user.registrationNumber,
        fullName: user.fullName
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Login user
exports.login = async (req, res) => {
  const { registrationNumber, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { registrationNumber } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { _id: user.id }, 
      process.env.JWT_SECRET, 
      { 
        expiresIn: '1d',
        algorithm: 'HS256',
        issuer: 'my-academia',
        audience: 'my-academia-users'
      }
    );

    res.json({ 
      token,
      user: {
        _id: user.id,
        registrationNumber: user.registrationNumber,
        fullName: user.fullName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    res.json({
      _id: req.user.id,
      registrationNumber: req.user.registrationNumber,
      fullName: req.user.fullName,
      createdAt: req.user.createdAt
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};