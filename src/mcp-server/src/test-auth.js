const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const logger = require('./utils/logger');

// Create a simple Express app for testing
const app = express();
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// JWT Secret
const JWT_SECRET = 'test-secret-key-for-authentication';

// Simple User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
  role: { type: String, default: 'user' }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create User model
const User = mongoose.model('User', userSchema);

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// Register route
app.post('/api/auth/register', async (req, res) => {
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

// Login route
app.post('/api/auth/login', async (req, res) => {
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
    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if (user && (await user.comparePassword(password))) {
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

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test server is running!' });
});

// Start MongoDB and server
async function startServer() {
  try {
    // Start MongoDB Memory Server
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    logger.info(`MongoDB Memory Server URI: ${mongoUri}`);
    
    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB Memory Server successfully');
    
    // Create a test user
    const testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    });
    
    logger.info(`Created test user: ${testUser.email}`);
    
    // Start the server
    const PORT = 3005;
    app.listen(PORT, () => {
      logger.info(`Test authentication server running on port ${PORT}`);
      logger.info(`Server available at http://localhost:${PORT}`);
      logger.info('');
      logger.info('Test credentials:');
      logger.info('Email: test@example.com');
      logger.info('Password: password123');
      logger.info('');
      logger.info('Available endpoints:');
      logger.info('POST /api/auth/register - Register a new user');
      logger.info('POST /api/auth/login - Login with email and password');
      logger.info('GET /api/test - Test if server is running');
    });
  } catch (error) {
    logger.error(`Server startup error: ${error.message}`);
    process.exit(1);
  }
}

startServer();
