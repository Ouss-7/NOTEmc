const mongoose = require('mongoose');
const logger = require('../utils/logger');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    // Check if MongoDB URI is provided
    if (!process.env.MONGODB_URI) {
      // Only use in-memory MongoDB for development or testing
      if (process.env.NODE_ENV === 'production') {
        throw new Error('MONGODB_URI must be provided in production environment');
      }
      
      logger.warn('MONGODB_URI not provided. Using in-memory MongoDB.');
      
      // Create an in-memory MongoDB instance
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      
      const conn = await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      
      logger.info('Connected to in-memory MongoDB');
      return conn;
    }
    
    // Connect to the provided MongoDB URI with enhanced security options
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: true,
      sslValidate: true,
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10, // Limit connection pool size
      connectTimeoutMS: 30000, // 30 seconds connection timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
    });

    logger.info(`Connected to MongoDB in ${process.env.NODE_ENV} mode`);
    return conn;
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    
    // Only fall back to in-memory MongoDB in development or testing
    if (process.env.NODE_ENV !== 'production') {
      try {
        logger.warn('Falling back to in-memory MongoDB');
        
        // Create an in-memory MongoDB instance
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        
        const conn = await mongoose.connect(uri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        
        logger.info('Connected to in-memory MongoDB');
        return conn;
      } catch (fallbackError) {
        logger.error('Failed to connect to in-memory MongoDB:', fallbackError);
        throw fallbackError;
      }
    } else {
      // In production, don't fall back to in-memory DB
      logger.error('Failed to connect to MongoDB in production. Exiting...');
      process.exit(1);
    }
  }
};

// Close the connection and stop the in-memory server
const closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

module.exports = { connectDB, closeDatabase };
