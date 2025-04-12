const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// In-memory storage for processing jobs
const jobs = new Map();

// Submit a new processing job
const submitJob = asyncHandler(async (req, res) => {
  try {
    const { noteId, toolIds, content } = req.body;
    const userId = req.user ? req.user.id : 'anonymous';

    // Validate request
    if (!noteId || !toolIds || !toolIds.length || !content) {
      res.status(400);
      throw new Error('Please provide noteId, toolIds, and content');
    }

    // Create a new job
    const jobId = uuidv4();
    const job = {
      id: jobId,
      userId,
      noteId,
      toolIds,
      content,
      status: 'queued',
      progress: 0,
      results: {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store job in memory
    jobs.set(jobId, job);

    // Simulate processing in background
    setTimeout(() => processJob(jobId), 1000);

    logger.info(`Job submitted: ${jobId}`);
    res.status(201).json(job);
  } catch (error) {
    logger.error(`Error submitting job: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
});

// Get a specific job by ID
const getJobById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const job = jobs.get(id);

    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }

    res.status(200).json(job);
  } catch (error) {
    logger.error(`Error getting job: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
});

// Get all jobs for the authenticated user
const getAllJobs = asyncHandler(async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 'anonymous';
    
    // Filter jobs by user ID
    const userJobs = Array.from(jobs.values())
      .filter(job => job.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);

    res.status(200).json({
      jobs: userJobs,
      total: userJobs.length,
      page: 1,
      limit: userJobs.length
    });
  } catch (error) {
    logger.error(`Error getting all jobs: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
});

// Process a job (simulated)
const processJob = async (jobId) => {
  try {
    const job = jobs.get(jobId);
    if (!job) {
      logger.error(`Job not found: ${jobId}`);
      return;
    }

    // Update job status to processing
    job.status = 'processing';
    job.updatedAt = new Date();
    jobs.set(jobId, job);

    // Simulate processing for each tool
    for (const toolId of job.toolIds) {
      // Update progress
      job.progress = Math.floor((job.toolIds.indexOf(toolId) / job.toolIds.length) * 100);
      jobs.set(jobId, job);

      // Simulate tool processing
      await simulateToolProcessing(job, toolId);
    }

    // Complete the job
    job.status = 'completed';
    job.progress = 100;
    job.updatedAt = new Date();
    jobs.set(jobId, job);

    logger.info(`Job completed: ${jobId}`);
  } catch (error) {
    logger.error(`Error processing job: ${error.message}`);
    
    // Update job status to failed
    const job = jobs.get(jobId);
    if (job) {
      job.status = 'failed';
      job.error = error.message;
      job.updatedAt = new Date();
      jobs.set(jobId, job);
    }
  }
};

// Simulate tool processing
const simulateToolProcessing = async (job, toolId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate mock results based on tool ID
      if (toolId === 'summary' || toolId === 'text-summarizer') {
        job.results[toolId] = generateSummary(job.content);
      } else if (toolId === 'sentiment' || toolId === 'sentiment-analysis') {
        job.results[toolId] = analyzeSentiment(job.content);
      } else if (toolId === 'grammar' || toolId === 'grammar-check') {
        job.results[toolId] = checkGrammar(job.content);
      } else {
        job.results[toolId] = `Processed content with tool: ${toolId}`;
      }
      
      // Update job in memory
      jobs.set(job.id, job);
      resolve();
    }, 2000); // Simulate 2 seconds of processing time
  });
};

// Generate a simple summary
const generateSummary = (content) => {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  let summary = '';
  
  if (sentences.length > 3) {
    // Take the first and last sentences for a simple summary
    summary = `${sentences[0]}. ${sentences[sentences.length - 1]}.`;
  } else {
    summary = sentences.join('. ') + '.';
  }
  
  return summary;
};

// Analyze sentiment
const analyzeSentiment = (content) => {
  // Simple sentiment analysis based on positive and negative words
  const positiveWords = ['good', 'great', 'excellent', 'positive', 'happy', 'joy', 'love', 'nice', 'wonderful', 'amazing', 'success', 'beautiful'];
  const negativeWords = ['bad', 'terrible', 'awful', 'negative', 'sad', 'hate', 'poor', 'horrible', 'failure', 'ugly', 'wrong'];
  
  const words = content.toLowerCase().split(/\W+/);
  let positiveCount = 0;
  let negativeCount = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) positiveCount++;
    if (negativeWords.includes(word)) negativeCount++;
  });
  
  const totalSentimentWords = positiveCount + negativeCount;
  if (totalSentimentWords === 0) return { score: 0.5, category: 'neutral' };
  
  const score = positiveCount / totalSentimentWords;
  let category = 'neutral';
  
  if (score > 0.6) category = 'positive';
  else if (score < 0.4) category = 'negative';
  
  return { score, category };
};

// Check grammar
const checkGrammar = (content) => {
  // Simple grammar check for common errors
  const errors = [];
  
  // Check for double spaces
  if (content.includes('  ')) {
    errors.push({ type: 'spacing', message: 'Double spaces detected' });
  }
  
  // Check for missing periods at the end of sentences
  const sentences = content.split(/[.!?]+/);
  if (sentences[sentences.length - 1].trim().length > 0) {
    errors.push({ type: 'punctuation', message: 'Missing period at the end of the text' });
  }
  
  // Check for common typos
  const commonTypos = {
    'teh': 'the',
    'adn': 'and',
    'waht': 'what',
    'thier': 'their',
    'recieve': 'receive',
    'sucess': 'success'
  };
  
  Object.keys(commonTypos).forEach(typo => {
    if (content.toLowerCase().includes(typo)) {
      errors.push({ 
        type: 'typo', 
        message: `"${typo}" should be "${commonTypos[typo]}"`,
        suggestion: commonTypos[typo]
      });
    }
  });
  
  return {
    errors,
    correctedText: errors.length > 0 ? 'Corrections needed' : 'No corrections needed'
  };
};

module.exports = {
  submitJob,
  getJobById,
  getAllJobs
};