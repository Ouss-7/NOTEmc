const Queue = require('bull');
const Redis = require('ioredis');
const logger = require('../utils/logger');

// Queue registry to keep track of all queues
const queues = {};

// In-memory queue for development mode
class InMemoryQueue {
  constructor(name) {
    this.name = name;
    this.jobs = [];
    this.handlers = new Map();
    this.events = new Map();
    logger.info(`Created in-memory queue: ${name}`);
  }

  async add(data, options = {}) {
    const job = {
      id: Date.now().toString(),
      data,
      options,
      timestamp: new Date()
    };
    this.jobs.push(job);
    
    // Process job immediately in development
    if (this.handlers.has('process')) {
      try {
        const result = await this.handlers.get('process')(job);
        this.emit('completed', job);
        return result;
      } catch (error) {
        this.emit('failed', job, error);
        throw error;
      }
    }
    
    return job;
  }

  process(handler) {
    this.handlers.set('process', handler);
  }

  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(callback);
  }

  emit(event, ...args) {
    if (this.events.has(event)) {
      this.events.get(event).forEach(callback => callback(...args));
    }
  }

  async clean() {
    this.jobs = [];
  }
}

/**
 * Create a new queue or return existing one
 * @param {string} name - Queue name
 * @param {Object} options - Queue options
 * @returns {Queue|InMemoryQueue} Queue instance
 */
const createQueue = (name, options = {}) => {
  if (queues[name]) {
    return queues[name];
  }

  // Use in-memory queue in development mode
  if (process.env.NODE_ENV === 'development') {
    const queue = new InMemoryQueue(name);
    queues[name] = queue;
    return queue;
  }

  // Use Bull queue in production
  const defaultOptions = {
    createClient: (type) => {
      const client = new Redis(process.env.REDIS_URI, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        retryStrategy: (times) => {
          if (times > 10) {
            return new Error('Redis connection failed');
          }
          return Math.min(times * 100, 3000);
        }
      });
      return client;
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
 * @returns {Queue|InMemoryQueue} Queue instance
 */
const getQueue = (name) => {
  if (!queues[name]) {
    throw new Error(`Queue ${name} not initialized`);
  }
  return queues[name];
};

/**
 * Clean all queues
 * @returns {Promise<void>}
 */
const cleanQueues = async () => {
  try {
    const cleanPromises = Object.values(queues).map(queue => 
      queue.clean ? queue.clean(24 * 60 * 60 * 1000) : Promise.resolve()
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
