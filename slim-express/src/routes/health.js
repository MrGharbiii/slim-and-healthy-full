const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

/**
 * @route   GET /api/health
 * @desc    Basic health check
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Fitness App API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * @route   GET /api/health/detailed
 * @desc    Detailed health check with database status
 * @access  Public
 */
router.get('/detailed', async (req, res) => {
  try {
    // Check database connection
    const dbStatus =
      mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const dbName = mongoose.connection.name || 'unknown';

    // Basic system information
    const healthInfo = {
      success: true,
      message: 'Health check completed',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      database: {
        status: dbStatus,
        name: dbName,
        host: mongoose.connection.host || 'unknown',
      },
      memory: {
        used:
          Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) /
          100,
        total:
          Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) /
          100,
        unit: 'MB',
      },
      uptime: {
        process: Math.floor(process.uptime()),
        unit: 'seconds',
      },
    };

    // If database is not connected, return 503
    if (dbStatus !== 'connected') {
      return res.status(503).json({
        ...healthInfo,
        success: false,
        message: 'Database connection is not available',
      });
    }

    res.status(200).json(healthInfo);
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @route   GET /api/health/database
 * @desc    Database connectivity test
 * @access  Public
 */
router.get('/database', async (req, res) => {
  try {
    // Try to perform a simple database operation
    const adminDb = mongoose.connection.db.admin();
    const serverStatus = await adminDb.serverStatus();

    res.status(200).json({
      success: true,
      message: 'Database is healthy',
      timestamp: new Date().toISOString(),
      database: {
        status: 'connected',
        name: mongoose.connection.name,
        host: serverStatus.host,
        version: serverStatus.version,
        uptime: serverStatus.uptime,
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Database health check failed',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
