const Queue = require('bull');
const Redis = require('ioredis');
const logger = require('../utils/logger');

// Queue registry to keep track of all queues
const queues = {};

/**
 * Create a Redis client for Bull queue
 * @returns {Redis} Redis client
 */
const createRedisClient = () => {
  const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: process.env.REDIS_DB || 0,
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  };
  
  return new Redis(redisConfig);
};

/**
 * Create a new queue or return existing one
 * @param {string} name - Queue name
 * @param {Object} options - Queue options
 * @returns {Queue} Bull queue instance
 */
const createQueue = (name, options = {}) => {
  if (queues[name]) {
    return queues[name];
  }
  
  const defaultOptions = {
    createClient: (type) => {
      switch (type) {
        case 'client':
          return createRedisClient();
        case 'subscriber':
          return createRedisClient();
        case 'bclient':
          return createRedisClient();
        default:
          return createRedisClient();
      }
    },
    defaultJobOptions: {
      removeOnComplete: true,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      }
    },
    ...options
  };
  
  const queue = new Queue(name, defaultOptions);
  
  // Set up event listeners
  queue.on('failed', (job, error) => {
    logger.error(`Job ${job.id} in queue ${name} failed:`, error);
  });
  
  queue.on('completed', (job) => {
    logger.info(`Job ${job.id} in queue ${name} completed successfully`);
  });
  
  queue.on('stalled', (job) => {
    logger.warn(`Job ${job.id} in queue ${name} is stalled`);
  });
  
  queue.on('error', (error) => {
    logger.error(`Queue ${name} error:`, error);
  });
  
  // Store in registry
  queues[name] = queue;
  
  return queue;
};

/**
 * Set up all required queues
 * @returns {Promise<void>}
 */
const setupQueues = async () => {
  try {
    // Create processing queue
    createQueue('processing', {
      defaultJobOptions: {
        removeOnComplete: true,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000
        },
        timeout: 180000 // 3 minutes timeout
      }
    });
    
    // Create notification queue
    createQueue('notifications', {
      defaultJobOptions: {
        removeOnComplete: true,
        attempts: 3,
        backoff: {
          type: 'fixed',
          delay: 2000
        },
        timeout: 30000 // 30 seconds timeout
      }
    });
    
    logger.info('Queues initialized successfully');
  } catch (error) {
    logger.error('Queue setup error:', error);
    throw error;
  }
};

/**
 * Get a queue by name
 * @param {string} name - Queue name
 * @returns {Queue} Bull queue instance
 */
const getQueue = (name) => {
  if (!queues[name]) {
    throw new Error(`Queue ${name} not initialized`);
  }
  return queues[name];
};

/**
 * Clean all queues (remove completed, failed, and delayed jobs)
 * @returns {Promise<void>}
 */
const cleanQueues = async () => {
  try {
    const cleanPromises = Object.values(queues).map(queue => 
      Promise.all([
        queue.clean(24 * 60 * 60 * 1000, 'completed'),
        queue.clean(24 * 60 * 60 * 1000, 'failed'),
        queue.clean(24 * 60 * 60 * 1000, 'delayed')
      ])
    );
    
    await Promise.all(cleanPromises);
    logger.info('All queues cleaned successfully');
  } catch (error) {
    logger.error('Queue cleaning error:', error);
    throw error;
  }
};

module.exports = { 
  setupQueues, 
  createQueue, 
  getQueue, 
  cleanQueues 
};
