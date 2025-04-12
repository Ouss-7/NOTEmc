const { getQueue } = require('../config/queues');
const logger = require('../utils/logger');

/**
 * Send a notification to a user
 * @param {string} userId - User ID
 * @param {string} type - Notification type (e.g., 'job_completed', 'job_failed')
 * @param {Object} data - Notification data
 * @returns {Promise<Object>} - Job object
 */
const sendNotification = async (userId, type, data) => {
  try {
    // Get the notifications queue
    const notificationsQueue = getQueue('notifications');
    
    // Create notification payload
    const notification = {
      userId,
      type,
      data,
      read: false,
      createdAt: new Date()
    };
    
    // Add to queue
    const job = await notificationsQueue.add(notification, {
      attempts: 3,
      backoff: {
        type: 'fixed',
        delay: 2000
      }
    });
    
    logger.info(`Notification queued for user ${userId}, type: ${type}`);
    return job;
  } catch (error) {
    logger.error(`Failed to send notification to user ${userId}:`, error);
    throw error;
  }
};

/**
 * Send job status notification
 * @param {string} userId - User ID
 * @param {string} jobId - Job ID
 * @param {string} status - Job status
 * @param {Object} details - Additional details
 * @returns {Promise<Object>} - Job object
 */
const sendJobStatusNotification = async (userId, jobId, status, details = {}) => {
  const notificationTypes = {
    'completed': 'job_completed',
    'failed': 'job_failed',
    'processing': 'job_processing',
    'cancelled': 'job_cancelled'
  };
  
  const type = notificationTypes[status] || 'job_status_update';
  
  return await sendNotification(userId, type, {
    jobId,
    status,
    ...details
  });
};

/**
 * Initialize notification processing
 */
const initNotifications = async () => {
  try {
    const notificationsQueue = getQueue('notifications');
    
    // Process notifications
    notificationsQueue.process(async (job) => {
      const { userId, type, data } = job.data;
      
      // In a real implementation, this would send the notification via WebSocket
      // For now, just log it
      logger.info(`Processing notification for user ${userId}, type: ${type}`);
      
      // Return success
      return { success: true };
    });
    
    logger.info('Notification processor initialized');
  } catch (error) {
    logger.error('Failed to initialize notification processor:', error);
    throw error;
  }
};

module.exports = {
  sendNotification,
  sendJobStatusNotification,
  initNotifications
};
