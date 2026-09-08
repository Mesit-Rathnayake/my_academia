const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const helmet = require('helmet');

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
  : ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:4721', 'http://127.0.0.1:8080', 'http://127.0.0.1:4721', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Middleware
app.use(bodyParser.json());

const timetableRoutes = require('./routes/timetableRoutes');
const examRoutes = require('./routes/examRoutes');
const examSeriesRoutes = require('./routes/examSeriesRoutes');
const gpaRoutes = require('./routes/gpaRoutes');

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/modules', require('./routes/moduleRoutes'));
app.use('/api/timetable', timetableRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/exam-series', examSeriesRoutes);
app.use('/api/gpa', gpaRoutes);
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running with PostgreSQL' });
});

// Export for testing
module.exports = app;

// Don't start server in test environment
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}