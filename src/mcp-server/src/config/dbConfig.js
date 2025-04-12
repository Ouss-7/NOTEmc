const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const logger = require('../utils/logger');

let mongoServer;

/**
 * Connect to MongoDB Memory Server for development and testing
 */
async function connectDB() {
  try {
    // Always use MongoDB Memory Server for simplicity and reliability
    logger.info('Starting MongoDB Memory Server...');
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    logger.info(`MongoDB Memory Server URI: ${mongoUri}`);
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    logger.info('Connected to MongoDB Memory Server successfully');
    
    // Create a test document to verify connection
    const testSchema = new mongoose.Schema({
      name: String,
      createdAt: { type: Date, default: Date.now }
    });
    
    // Only create the model if it doesn't exist
    const TestModel = mongoose.models.Test || mongoose.model('Test', testSchema);
    
    // Create a test document
    const testDoc = await TestModel.create({ name: 'Connection Test' });
    logger.info(`Created test document with ID: ${testDoc._id}`);
    
    return mongoUri;
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Disconnect from MongoDB and close Memory Server if applicable
 */
async function disconnectDB() {
  try {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
    
    if (mongoServer) {
      await mongoServer.stop();
      logger.info('MongoDB Memory Server stopped');
    }
  } catch (error) {
    logger.error(`Error disconnecting from MongoDB: ${error.message}`);
  }
}

module.exports = { connectDB, disconnectDB };
