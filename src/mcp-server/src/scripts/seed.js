require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/dbConfig');
const Tool = require('../models/Tool');
const User = require('../models/User');
const logger = require('../utils/logger');

// Default tools to seed
const defaultTools = [
  {
    name: 'Text Summarizer',
    description: 'Creates a concise summary of the text content.',
    type: 'summary',
    endpoint: '/api/process/summary',
    apiKey: 'default-api-key',
    parameters: {
      sentenceCount: {
        type: 'number',
        required: false,
        default: 3,
        description: 'Number of sentences to include in the summary'
      }
    },
    status: 'active',
    rateLimit: {
      requests: 100,
      period: 60
    },
    cacheConfig: {
      enabled: true,
      ttl: 3600
    }
  },
  {
    name: 'Sentiment Analysis',
    description: 'Analyzes the sentiment of the text and provides a score.',
    type: 'sentiment',
    endpoint: '/api/process/sentiment',
    apiKey: 'default-api-key',
    parameters: {},
    status: 'active',
    rateLimit: {
      requests: 100,
      period: 60
    },
    cacheConfig: {
      enabled: true,
      ttl: 3600
    }
  },
  {
    name: 'Grammar Check',
    description: 'Analyzes text for grammatical errors and suggests corrections.',
    type: 'grammar',
    endpoint: '/api/process/grammar',
    apiKey: 'default-api-key',
    parameters: {
      checkSpelling: {
        type: 'boolean',
        required: false,
        default: true,
        description: 'Whether to check spelling'
      },
      checkGrammar: {
        type: 'boolean',
        required: false,
        default: true,
        description: 'Whether to check grammar'
      }
    },
    status: 'active',
    rateLimit: {
      requests: 100,
      period: 60
    },
    cacheConfig: {
      enabled: true,
      ttl: 3600
    }
  }
];

// Default admin user
const adminUser = {
  username: 'admin',
  email: 'admin@example.com',
  password: 'admin123',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin'
};

async function seedDatabase() {
  try {
    // Connect to database
    await connectDB();
    
    // Seed tools
    const toolCount = await Tool.countDocuments();
    if (toolCount === 0) {
      logger.info('Seeding tools...');
      await Tool.insertMany(defaultTools);
      logger.info('Tools seeded successfully');
    } else {
      logger.info('Tools already exist, skipping seeding');
    }
    
    // Seed admin user
    const adminExists = await User.findOne({ email: adminUser.email });
    if (!adminExists) {
      logger.info('Seeding admin user...');
      await User.create(adminUser);
      logger.info('Admin user seeded successfully');
    } else {
      logger.info('Admin user already exists, skipping seeding');
    }
    
    // Disconnect from database
    await mongoose.disconnect();
    logger.info('Database seeding completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 