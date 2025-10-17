const rateLimit = require('express-rate-limit');

// 🔒 SECURITY MEASURE: Rate limiting to prevent brute force attacks (OWASP A07:2021 - Authentication Failures)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 🔒 15 minutes window
  max: 10, // 🔒 Limit each IP to 10 login requests per window
  message: {
    message: 'Too many login attempts from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = loginLimiter;
