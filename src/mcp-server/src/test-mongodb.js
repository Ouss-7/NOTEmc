const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const logger = require('./utils/logger');

async function testMongoDBConnection() {
  logger.info('Starting MongoDB connection test...');
  
  try {
    // Create an in-memory MongoDB server
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    logger.info(`MongoDB Memory Server URI: ${mongoUri}`);
    
    // Connect to the in-memory database
    await mongoose.connect(mongoUri);
    
    logger.info('Successfully connected to MongoDB Memory Server');
    
    // Create a simple test schema and model
    const testSchema = new mongoose.Schema({
      name: String,
      createdAt: { type: Date, default: Date.now }
    });
    
    const TestModel = mongoose.model('Test', testSchema);
    
    // Create a test document
    const testDoc = await TestModel.create({ name: 'Test Document' });
    logger.info(`Created test document with ID: ${testDoc._id}`);
    
    // Retrieve the test document
    const retrievedDoc = await TestModel.findById(testDoc._id);
    logger.info(`Retrieved test document: ${retrievedDoc.name}`);
    
    // Clean up
    await mongoose.disconnect();
    await mongoServer.stop();
    
    logger.info('MongoDB connection test completed successfully');
    return true;
  } catch (error) {
    logger.error(`MongoDB connection test failed: ${error.message}`);
    return false;
  }
}

// Run the test
testMongoDBConnection()
  .then(success => {
    if (success) {
      logger.info('✅ MongoDB test passed - MongoDB is working correctly');
    } else {
      logger.error('❌ MongoDB test failed - Please check your MongoDB configuration');
    }
    process.exit(success ? 0 : 1);
  });
