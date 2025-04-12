/**
 * In-memory data store for development
 * This file is now a compatibility layer for MongoDB integration
 * It provides references to MongoDB models instead of in-memory arrays
 */

const User = require('../models/User');
const Note = require('../models/Note');
const Tool = require('../models/Tool');
const ProcessingJob = require('../models/ProcessingJob');

// These are now just empty placeholders for compatibility
// The actual data is stored in MongoDB
const users = [];
const notes = [];
const tools = [];
const processingJobs = [];

module.exports = {
  users,
  notes,
  tools,
  processingJobs,
  // Add MongoDB model references for direct access
  models: {
    User,
    Note,
    Tool,
    ProcessingJob
  }
};
