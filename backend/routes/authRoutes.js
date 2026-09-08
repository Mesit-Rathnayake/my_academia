const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const auth = require('../middlewares/auth'); // 🔒 SECURITY: JWT token verification middleware
const loginLimiter = require('../middlewares/loginLimiter'); // 🔒 SECURITY: Rate limiting protection
const { validateRegistration, validateLogin } = require('../middlewares/validation'); // 🔒 SECURITY: Input validation

// 🔒 SECURITY MEASURE: User registration with input validation
router.post('/register', validateRegistration, authController.register);

// 🔒 SECURITY MEASURE: Login with input validation and rate limiting
router.post('/login', loginLimiter, validateLogin, authController.login);

// 🔒 SECURITY MEASURE: Protected route with JWT authentication
router.get('/me', auth, authController.getCurrentUser);

module.exports = router;