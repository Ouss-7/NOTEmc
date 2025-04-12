/**
 * Health controller
 * Provides endpoints for checking the health of the application
 */

/**
 * Get basic health status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getHealth = (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
};

/**
 * Get detailed health status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getDetailedHealth = (req, res) => {
  // In a real application, this would check various dependencies
  // like database connections, external services, etc.
  const healthDetails = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: {
        status: 'ok',
        type: 'mongodb'
      },
      cache: {
        status: 'ok',
        type: 'redis'
      },
      queue: {
        status: 'ok',
        type: 'bull'
      }
    },
    system: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    }
  };
  
  res.status(200).json(healthDetails);
};