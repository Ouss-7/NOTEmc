const { processWithTool } = require('./toolService');
const ProcessingJob = require('../models/ProcessingJob');
const { createQueue } = require('../config/queues');
const { sendJobStatusNotification } = require('./notificationService');
const logger = require('../utils/logger');

// Processing queue
let processingQueue;

// Initialize the processing queue
const initProcessingQueue = async () => {
  processingQueue = createQueue('processing');
  
  // Process jobs from the queue
  processingQueue.process(async (job) => {
    const { jobId } = job.data;
    return await executeJob(jobId);
  });
  
  // Handle completed jobs
  processingQueue.on('completed', (job) => {
    logger.info(`Job ${job.data.jobId} completed successfully`);
  });
  
  // Handle failed jobs
  processingQueue.on('failed', (job, err) => {
    logger.error(`Job ${job.data.jobId} failed with error: ${err.message}`);
    // Update job status in database
    updateJobStatus(job.data.jobId, 'failed', { error: err.message });
  });
};

// Create a new processing job
const createJob = async (noteId, toolIds, noteContent, userId) => {
  try {
    // Create a job record in the database
    const job = new ProcessingJob({
      noteId,
      toolIds,
      status: 'pending',
      progress: 0,
      results: {},
      userId
    });
    
    await job.save();
    
    // Add job to the processing queue
    await processingQueue.add(
      { jobId: job._id, noteContent },
      { 
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000
        },
        removeOnComplete: true
      }
    );
    
    // Send notification that job was created
    await sendJobStatusNotification(
      userId, 
      job._id, 
      'pending', 
      { 
        noteId,
        toolCount: toolIds.length
      }
    );
    
    return job;
  } catch (error) {
    logger.error(`Failed to create processing job: ${error.message}`);
    throw new Error(`Failed to create processing job: ${error.message}`);
  }
};

// Update job status
const updateJobStatus = async (jobId, status, updates = {}) => {
  try {
    const job = await ProcessingJob.findByIdAndUpdate(
      jobId,
      {
        status,
        updatedAt: new Date(),
        ...updates
      },
      { new: true }
    );
    
    if (job) {
      // Send notification about status update
      await sendJobStatusNotification(
        job.userId, 
        job._id, 
        status, 
        { 
          noteId: job.noteId,
          progress: job.progress,
          ...(updates.error ? { error: updates.error } : {})
        }
      );
    }
    
    return job;
  } catch (error) {
    logger.error(`Failed to update job status: ${error.message}`);
    throw error;
  }
};

// Execute a job
const executeJob = async (jobId) => {
  try {
    // Get job from database
    const job = await ProcessingJob.findById(jobId);
    if (!job) {
      throw new Error(`Job with ID ${jobId} not found`);
    }
    
    // Get note content from the queue data
    const queuedJob = await processingQueue.getJob(jobId);
    const { noteContent } = queuedJob.data;
    
    // Update job status
    await updateJobStatus(jobId, 'processing', { progress: 10 });
    
    // Process each tool
    const results = {};
    const totalTools = job.toolIds.length;
    const startTime = Date.now();
    
    for (let i = 0; i < totalTools; i++) {
      const toolId = job.toolIds[i];
      
      try {
        // Process with the tool
        const result = await processWithTool(toolId, noteContent);
        
        // Store result
        results[toolId] = result;
        
        // Update progress
        const progress = Math.floor(((i + 1) / totalTools) * 90) + 10;
        await updateJobStatus(jobId, 'processing', { 
          progress,
          results: { ...job.results, [toolId]: result }
        });
      } catch (error) {
        logger.error(`Error processing with tool ${toolId}: ${error.message}`);
        results[toolId] = { error: error.message };
      }
    }
    
    // Calculate processing time
    const processingTime = Date.now() - startTime;
    
    // Complete the job
    await updateJobStatus(jobId, 'completed', { 
      progress: 100,
      results,
      processingTime
    });
    
    return job;
  } catch (error) {
    // Handle failure
    await updateJobStatus(jobId, 'failed', { error: error.message });
    throw error;
  }
};

// Get all jobs
const getAllJobs = async (filters = {}, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    
    const jobs = await ProcessingJob.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await ProcessingJob.countDocuments(filters);
    
    return {
      jobs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error(`Failed to get jobs: ${error.message}`);
    throw new Error(`Failed to get jobs: ${error.message}`);
  }
};

// Get job status
const getJobStatus = async (jobId) => {
  try {
    return await ProcessingJob.findById(jobId);
  } catch (error) {
    logger.error(`Failed to get job status: ${error.message}`);
    throw new Error(`Failed to get job status: ${error.message}`);
  }
};

// Cancel a job
const cancelJob = async (jobId) => {
  try {
    // Remove job from queue if it's still pending
    const queuedJob = await processingQueue.getJob(jobId);
    if (queuedJob) {
      await queuedJob.remove();
    }
    
    // Update job status in database
    return await updateJobStatus(jobId, 'cancelled');
  } catch (error) {
    logger.error(`Failed to cancel job: ${error.message}`);
    throw new Error(`Failed to cancel job: ${error.message}`);
  }
};

module.exports = {
  createJob,
  getAllJobs,
  getJobStatus,
  cancelJob,
  initProcessingQueue
};