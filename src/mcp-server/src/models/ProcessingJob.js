const mongoose = require('mongoose');

const processingJobSchema = new mongoose.Schema({
  noteId: {
    type: String,
    required: true,
    index: true
  },
  toolIds: [{
    type: String,
    required: true
  }],
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  results: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  error: {
    type: String,
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  priority: {
    type: Number,
    default: 1,
    min: 0,
    max: 10
  },
  processingTime: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
processingJobSchema.index({ status: 1, createdAt: -1 });
processingJobSchema.index({ userId: 1, status: 1 });
processingJobSchema.index({ noteId: 1, status: 1 });

const ProcessingJob = mongoose.model('ProcessingJob', processingJobSchema);

module.exports = ProcessingJob;
