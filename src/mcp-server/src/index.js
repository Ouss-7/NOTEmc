const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { errorHandler } = require('./middleware/errorHandler');
const { protect } = require('./middleware/authMiddleware');
const toolRoutes = require('./routes/toolRoutes');
const processingRoutes = require('./routes/processingRoutes');
const authRoutes = require('./routes/authRoutes');
const logger = require('./utils/logger');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { connectDB } = require('./config/dbConfig');

require('dotenv').config();

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false
}));
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', '*'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
}));

// Add OPTIONS handling for preflight requests
app.options('*', cors());
app.use(express.json());

// Always use MongoDB Memory Server for simplicity and reliability

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'dev-secret-key',
    { expiresIn: '30d' }
  );
};

// Use MongoDB-based authentication routes for both development and production
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/tools', protect, toolRoutes);
app.use('/api/process', protect, processingRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3003;

async function startServer() {
  try {
    // Connect to database (MongoDB Atlas or Memory Server)
    await connectDB();

    app.listen(PORT, () => {
      logger.info(`MCP Server running on port ${PORT}`);
      logger.info(`Server available at http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
