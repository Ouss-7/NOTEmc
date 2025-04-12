const Redis = require('redis');
const logger = require('../utils/logger');

let redisClient;

// Mock Redis client for development
class MockRedisClient {
  constructor() {
    this.data = new Map();
    logger.info('Using Mock Redis Client');
  }

  async connect() {
    logger.info('Mock Redis connected');
    return this;
  }

  async get(key) {
    return this.data.get(key);
  }

  async set(key, value) {
    this.data.set(key, value);
    return 'OK';
  }

  async del(key) {
    this.data.delete(key);
    return 1;
  }

  on(event, callback) {
    // Do nothing for events in mock
    return this;
  }
}

const connectRedis = async () => {
  try {
    // Use mock Redis client if REDIS_URI is not provided
    if (!process.env.REDIS_URI) {
      logger.warn('REDIS_URI not provided. Using mock Redis client.');
      redisClient = new MockRedisClient();
      await redisClient.connect();
      return redisClient;
    }

    // Use real Redis client if REDIS_URI is provided
    redisClient = Redis.createClient({
      url: process.env.REDIS_URI
    });

    redisClient.on('error', (error) => {
      logger.error('Redis Client Error:', error);
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.error('Redis connection error:', error);
    logger.warn('Falling back to mock Redis client');
    redisClient = new MockRedisClient();
    await redisClient.connect();
    return redisClient;
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
};

module.exports = { connectRedis, getRedisClient };
