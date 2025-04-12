/**
 * Validation schemas for tool-related routes
 */

// Validation for tool ID parameter
exports.params = {
  id: {
    in: ['params'],
    isString: {
      errorMessage: 'Tool ID must be a string'
    },
    notEmpty: {
      errorMessage: 'Tool ID is required'
    }
  }
};

// Validation for creating a new tool
exports.create = {
  name: {
    in: ['body'],
    isString: {
      errorMessage: 'Name must be a string'
    },
    notEmpty: {
      errorMessage: 'Name is required'
    }
  },
  description: {
    in: ['body'],
    isString: {
      errorMessage: 'Description must be a string'
    },
    notEmpty: {
      errorMessage: 'Description is required'
    }
  },
  type: {
    in: ['body'],
    isString: {
      errorMessage: 'Type must be a string'
    },
    isIn: {
      options: [['grammar', 'summary', 'sentiment', 'semantic']],
      errorMessage: 'Type must be one of: grammar, summary, sentiment, semantic'
    }
  },
  status: {
    in: ['body'],
    isString: {
      errorMessage: 'Status must be a string'
    },
    isIn: {
      options: [['active', 'inactive', 'deprecated']],
      errorMessage: 'Status must be one of: active, inactive, deprecated'
    }
  },
  parameters: {
    in: ['body'],
    isObject: {
      errorMessage: 'Parameters must be an object'
    },
    optional: true
  }
};

// Validation for updating a tool
exports.update = {
  ...exports.params,
  name: {
    in: ['body'],
    isString: {
      errorMessage: 'Name must be a string'
    },
    optional: true
  },
  description: {
    in: ['body'],
    isString: {
      errorMessage: 'Description must be a string'
    },
    optional: true
  },
  type: {
    in: ['body'],
    isString: {
      errorMessage: 'Type must be a string'
    },
    isIn: {
      options: [['grammar', 'summary', 'sentiment', 'semantic']],
      errorMessage: 'Type must be one of: grammar, summary, sentiment, semantic'
    },
    optional: true
  },
  status: {
    in: ['body'],
    isString: {
      errorMessage: 'Status must be a string'
    },
    isIn: {
      options: [['active', 'inactive', 'deprecated']],
      errorMessage: 'Status must be one of: active, inactive, deprecated'
    },
    optional: true
  },
  parameters: {
    in: ['body'],
    isObject: {
      errorMessage: 'Parameters must be an object'
    },
    optional: true
  }
};

// Validation for processing with a tool
exports.process = {
  ...exports.params,
  text: {
    in: ['body'],
    isString: {
      errorMessage: 'Text must be a string'
    },
    notEmpty: {
      errorMessage: 'Text is required'
    }
  },
  parameters: {
    in: ['body'],
    isObject: {
      errorMessage: 'Parameters must be an object'
    },
    optional: true
  }
};