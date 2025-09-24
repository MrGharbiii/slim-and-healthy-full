/**
 * Enhanced Error Handling Middleware
 * Provides comprehensive error handling with proper status codes and security considerations
 */

// Custom error class for application errors
class AppError extends Error {
  constructor(message, statusCode, code = null, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Handle authentication errors
const handleAuthError = (error, req, res, next) => {
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token',
      code: 'INVALID_TOKEN',
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Authentication token has expired',
      code: 'TOKEN_EXPIRED',
    });
  }

  if (error.name === 'NotBeforeError') {
    return res.status(401).json({
      success: false,
      message: 'Token not active',
      code: 'TOKEN_NOT_ACTIVE',
    });
  }

  next(error);
};

// Handle validation errors
const handleValidationError = (error, req, res, next) => {
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map((err) => ({
      field: err.path,
      message: err.message,
      value: err.value,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors,
    });
  }

  next(error);
};

// Handle duplicate key errors (MongoDB)
const handleDuplicateKeyError = (error, req, res, next) => {
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];

    return res.status(400).json({
      success: false,
      message: `${field} '${value}' already exists`,
      code: 'DUPLICATE_ENTRY',
      details: {
        field,
        value,
      },
    });
  }

  next(error);
};

// Handle cast errors (invalid ObjectId)
const handleCastError = (error, req, res, next) => {
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
      code: 'INVALID_ID',
      details: {
        field: error.path,
        value: error.value,
      },
    });
  }

  next(error);
};

// Rate limiting error handler
const handleRateLimitError = (error, req, res, next) => {
  if (error.status === 429) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: error.retryAfter,
    });
  }

  next(error);
};

// Main error handling middleware
const errorHandler = (error, req, res, next) => {
  // Log error for debugging (but not in production)
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error Stack:', error.stack);
  }

  // Handle operational errors
  if (error.isOperational) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      code: error.code,
      details: error.details,
    });
  }

  // Handle programming errors
  console.error('Programming Error:', error);

  // Don't leak error details in production
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Something went wrong'
      : error.message;

  res.status(500).json({
    success: false,
    message,
    code: 'INTERNAL_SERVER_ERROR',
  });
};

// 404 handler for unmatched routes
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  AppError,
  handleAuthError,
  handleValidationError,
  handleDuplicateKeyError,
  handleCastError,
  handleRateLimitError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
