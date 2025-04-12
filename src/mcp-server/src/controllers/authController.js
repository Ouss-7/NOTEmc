const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const User = require('../models/User');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'dev-secret-key',
    { expiresIn: '30d' }
  );
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    
    logger.info(`Login attempt for email: ${email}`);

    // Validate email and password
    if (!email || !password) {
      logger.error('Login failed: Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email
    const user = await User.findOne({ email }).select('+password');

    // Check if user exists and password matches
    if (user && (await user.comparePassword(password))) {
      // Update last login
      user.lastLogin = Date.now();
      await user.save();

      logger.info(`User logged in successfully: ${email}`);
      return res.status(200).json({
        success: true,
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      logger.error(`Login failed: Invalid credentials for email: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    
    logger.info(`Registration attempt for email: ${email}`);

    // Validate input
    if (!username || !email || !password) {
      logger.error('Registration failed: Missing required fields');
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      logger.error(`Registration failed: User already exists with email: ${email}`);
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      firstName: firstName || '',
      lastName: lastName || '',
      role: 'user'
    });

    if (user) {
      logger.info(`User registered successfully: ${email}`);
      return res.status(201).json({
        success: true,
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      logger.error(`Registration failed: Invalid user data for email: ${email}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid user data'
      });
    }
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  // Find user
  const user = await User.findById(req.user.id);

  if (user) {
    // Update user data
    const { username, email, password, firstName, lastName } = req.body;
    
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = password;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;

    // Save updated user
    const updatedUser = await user.save();

    // Return updated user
    res.status(200).json({
      id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = { login, register, getUserProfile, updateProfile };
