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
const { connectRedis } = require('./config/redis');
const { setupQueues } = require('./config/queues');
const { initProcessingQueue } = require('./services/processingService');
const path = require('path');

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
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001', '*'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
}));

// Add OPTIONS handling for preflight requests
app.options('*', cors());
app.use(express.json());

// Root route handler
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the MCP Server API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      tools: '/api/tools',
      process: '/api/process'
    },
    documentation: '/api-docs'
  });
});

// API Documentation route
app.get('/api-docs', (req, res) => {
  res.json({
    openapi: '3.0.0',
    info: {
      title: 'MCP Server API',
      version: '1.0.0',
      description: 'API documentation for the Note Check-in MCP Server'
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3005}`,
        description: 'Development server'
      }
    ],
    paths: {
      '/api/auth/register': {
        post: {
          summary: 'Register a new user',
          tags: ['Auth']
        }
      },
      '/api/auth/login': {
        post: {
          summary: 'Login user',
          tags: ['Auth']
        }
      },
      '/api/tools': {
        get: {
          summary: 'Get all available tools',
          tags: ['Tools']
        }
      },
      '/api/process': {
        post: {
          summary: 'Process a note with selected tools',
          tags: ['Processing']
        }
      }
    }
  });
});

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'dev-secret-key',
    { expiresIn: '30d' }
  );
};

// Auth routes are defined above

// Public auth routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/tools', toolRoutes);
app.use('/api/process', processingRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3005;

async function startServer() {
  try {
    // Connect to database
    await connectDB();
    
    // Connect to Redis
    await connectRedis();
    
    // Set up job queues
    await setupQueues();
    
    // Initialize processing queue
    await initProcessingQueue();
    
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
