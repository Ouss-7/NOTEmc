const Redis = require('redis');
const logger = require('../utils/logger');

let redisClient;

// Mock Redis client for development
class MockRedisClient {
  constructor() {
    this.data = new Map();
    logger.info('Using Mock Redis Client for development');
  }

  async connect() {
    logger.info('Mock Redis connected');
    return this;
  }

  async get(key) {
    return this.data.get(key);
  }

  async set(key, value, options = {}) {
    this.data.set(key, value);
    return 'OK';
  }

  async del(key) {
    this.data.delete(key);
    return 1;
  }

  on(event, callback) {
    if (event === 'connect') {
      callback();
    }
    return this;
  }
}

const connectRedis = async () => {
  try {
    // Use mock Redis client in development mode
    if (process.env.NODE_ENV === 'development') {
      logger.info('Development mode: Using mock Redis client');
      redisClient = new MockRedisClient();
      await redisClient.connect();
      return redisClient;
    }

    // Use real Redis client in production
    if (!process.env.REDIS_URI) {
      throw new Error('REDIS_URI environment variable is required in production');
    }

    redisClient = Redis.createClient({
      url: process.env.REDIS_URI,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis connection failed after 10 retries');
            return new Error('Redis connection failed');
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    redisClient.on('error', (error) => {
      logger.error('Redis Client Error:', error);
    });

    redisClient.on('connect', () => {
      logger.info('Redis Client Connected');
    });

    redisClient.on('ready', () => {
      logger.info('Redis Client Ready');
    });

    redisClient.on('end', () => {
      logger.info('Redis Client Connection Ended');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.error('Redis connection error:', error);
    if (process.env.NODE_ENV === 'development') {
      logger.info('Falling back to mock Redis client');
      redisClient = new MockRedisClient();
      await redisClient.connect();
      return redisClient;
    }
    throw error;
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
};

module.exports = { connectRedis, getRedisClient };
