const { body, validationResult } = require('express-validator');

// 🔒 SECURITY MEASURE: Validation middleware to handle input validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// 🔒 SECURITY MEASURE: Registration validation rules (OWASP A03:2021 - Injection Prevention)
const validateRegistration = [
  // 🔒 Registration number format validation
  body('registrationNumber')
    .isLength({ min: 5, max: 20 })
    .matches(/^[A-Z]{2}\/[0-9]{4}\/[0-9]{4}$/)
    .withMessage('Registration number must be in format: EG/2020/1234'),
  // 🔒 Full name sanitization
  body('fullName')
    .isLength({ min: 2, max: 100 })
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Full name must contain only letters and spaces'),
  // 🔒 Strong password requirements
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  handleValidationErrors
];

// Login validation rules
const validateLogin = [
  body('registrationNumber')
    .notEmpty()
    .matches(/^[A-Z]{2}\/[0-9]{4}\/[0-9]{4}$/)
    .withMessage('Invalid registration number format'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin
};