/**
 * MongoDB Atlas Setup Script
 * 
 * This script helps set up a secure MongoDB Atlas configuration for the Note application.
 * It creates the necessary database, collections, indexes, and user roles.
 * 
 * Usage:
 * 1. Create a MongoDB Atlas account and cluster
 * 2. Set the MONGODB_ATLAS_URI environment variable
 * 3. Run this script: node setup-mongodb-atlas.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('../src/utils/logger');

// Models
const User = require('../src/models/User');
const Tool = require('../src/models/Tool');
const ProcessingJob = require('../src/models/ProcessingJob');

async function setupMongoDB() {
  try {
    // Check for MongoDB URI
    if (!process.env.MONGODB_URI) {
      logger.error('MONGODB_URI environment variable is required');
      process.exit(1);
    }

    logger.info('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: true,
      sslValidate: true,
    });

    logger.info('Connected to MongoDB Atlas');

    // Create indexes for better performance
    logger.info('Setting up indexes...');
    
    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ username: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    
    // Tool indexes
    await Tool.collection.createIndex({ name: 1 }, { unique: true });
    await Tool.collection.createIndex({ category: 1 });
    
    // ProcessingJob indexes
    await ProcessingJob.collection.createIndex({ userId: 1 });
    await ProcessingJob.collection.createIndex({ status: 1 });
    await ProcessingJob.collection.createIndex({ createdAt: 1 });
    await ProcessingJob.collection.createIndex({ toolId: 1 });
    
    logger.info('Indexes created successfully');

    // Create admin user if it doesn't exist
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      logger.info('Creating admin user...');
      
      const adminUser = new User({
        username: 'admin',
        email: 'admin@noteapp.com',
        password: process.env.ADMIN_INITIAL_PASSWORD || 'ChangeMe123!',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true
      });
      
      await adminUser.save();
      logger.info('Admin user created successfully');
    }

    logger.info('MongoDB Atlas setup completed successfully');
  } catch (error) {
    logger.error('Error setting up MongoDB Atlas:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB Atlas');
  }
}

setupMongoDB();
