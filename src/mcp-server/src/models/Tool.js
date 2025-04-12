const mongoose = require('mongoose');

const toolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['grammar', 'summary', 'sentiment', 'semantic']
  },
  endpoint: {
    type: String,
    required: true
  },
  apiKey: {
    type: String,
    required: true
  },
  parameters: {
    type: Object,
    default: {}
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'deprecated'],
    default: 'active'
  },
  rateLimit: {
    requests: {
      type: Number,
      required: true
    },
    period: {
      type: Number,
      required: true
    }
  },
  cacheConfig: {
    enabled: {
      type: Boolean,
      default: true
    },
    ttl: {
      type: Number,
      default: 3600
    }
  }
}, {
  timestamps: true
});

toolSchema.index({ name: 1, type: 1 });

const Tool = mongoose.model('Tool', toolSchema);

module.exports = Tool;
