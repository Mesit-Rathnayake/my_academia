const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');
const loginLimiter = require('../middlewares/loginLimiter');
const { validateRegistration, validateLogin } = require('../middlewares/validation');

router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login); // Rate limiter temporarily disabled for JMeter testing
router.get('/me', auth, authController.getCurrentUser);

module.exports = router;