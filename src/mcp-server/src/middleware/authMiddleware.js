const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const logger = require('../utils/logger');
const User = require('../models/User');

// Mock user for development
const mockUser = {
  id: 'mock-user-123',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user'
};

/**
 * Middleware to protect routes
 * In development mode, it will use a mock user
 * In production, it will verify the JWT token
 */
const protect = asyncHandler(async (req, res, next) => {
  try {
    // We're now using MongoDB for authentication in all environments
    // No need for mock authentication

    let token;
    
    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        // Get token from header
        token = req.headers.authorization.split(' ')[1];
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key', {
          algorithms: ['HS256'], // Explicitly specify algorithm
          maxAge: process.env.JWT_EXPIRES_IN || '1d' // Enforce token expiration
        });
        
        // Get user from database to ensure they still exist and are active
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
          throw new Error('User no longer exists');
        }
        
        if (!user.isActive) {
          throw new Error('User account is deactivated');
        }
        
        // Update last activity timestamp
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });
        
        // Set user in request
        req.user = user;
        
        // Add token to response for token rotation (optional)
        // This helps mitigate token theft by regularly rotating tokens
        if (decoded.iat < Date.now() / 1000 - 3600) { // If token is older than 1 hour
          const newToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'dev-secret-key',
            { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
          );
          res.setHeader('X-New-Token', newToken);
        }
        
        next();
      } catch (error) {
        logger.error('Invalid token:', error);
        res.status(401);
        throw new Error('Not authorized, token failed');
      }
    } else if (req.cookies && req.cookies.token) {
      // Alternative: Check for token in cookies (more secure against XSS)
      try {
        token = req.cookies.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key', {
          algorithms: ['HS256'],
          maxAge: process.env.JWT_EXPIRES_IN || '1d'
        });
        
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user || !user.isActive) {
          throw new Error('User not found or inactive');
        }
        
        req.user = user;
        next();
      } catch (error) {
        logger.error('Invalid cookie token:', error);
        res.status(401);
        throw new Error('Not authorized, token failed');
      }
    }
    
    if (!token) {
      res.status(401);
      throw new Error('Not authorized, no token');
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(401).json({ message: error.message || 'Not authorized' });
  }
});

/**
 * Middleware to restrict access to admin users
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
};

/**
 * Middleware to restrict access to certain roles
 * @param  {...String} roles - Allowed roles
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array e.g. ['admin', 'lead-guide']
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

/**
 * Rate limiting middleware to prevent brute force attacks
 * This is a simple implementation. For production, use a more robust solution like express-rate-limit
 */
const rateLimit = asyncHandler(async (req, res, next) => {
  // This would be implemented with Redis in a production environment
  // For now, we'll just pass through
  next();
});

module.exports = { protect, admin, restrictTo, rateLimit };
