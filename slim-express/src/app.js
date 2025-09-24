const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import database connection
const { connectDB } = require('./config/database');
const {
  handleAuthError,
  handleValidationError,
  handleDuplicateKeyError,
  handleCastError,
  handleRateLimitError,
  errorHandler,
  notFoundHandler,
} = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Remove direct call to connectDB. We'll await it before starting the server below.

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes default
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP',
    message: 'Please try again later',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// CORS: Allow only origins listed in ALLOWED_ORIGINS (including Vercel admin dashboard)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.log(`CORS blocked origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow cross-origin resource sharing
    crossOriginEmbedderPolicy: false, // Disable crossOriginEmbedderPolicy which can block resources
  })
); // Security headers with CORS-friendly config

app.use(limiter); // Apply rate limiting
app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies with size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Slim Backend API',
    version: '1.0.0',
    status: 'running',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/onboarding', require('./routes/onboarding'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/health', require('./routes/health'));
app.use('/api/ai', require('./routes/ai'));

// Error handling middleware (order matters!)
app.use(handleAuthError);
app.use(handleValidationError);
app.use(handleDuplicateKeyError);
app.use(handleCastError);
app.use(handleRateLimitError);

// 404 handler
app.use(notFoundHandler);

// Final error handler
app.use(errorHandler);

// Start server only after MongoDB is connected
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(
        `🌐 CORS enabled for: ${
          process.env.ALLOWED_ORIGINS || 'default origins'
        }`
      );
    });
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
