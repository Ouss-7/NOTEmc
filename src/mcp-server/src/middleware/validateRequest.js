/**
 * Request validation middleware
 * This middleware validates request data against the provided schema
 */

/**
 * Create a validation middleware for the specified schema and location
 * @param {Object} schema - Validation schema
 * @param {string} location - Request location to validate (body, params, query)
 * @returns {Function} Express middleware function
 */
const validateRequest = (schema, location = 'body') => {
  return (req, res, next) => {
    try {
      // Simple validation implementation
      const dataToValidate = req[location] || {};
      const errors = [];
      
      // Validate each field in the schema
      Object.keys(schema).forEach(field => {
        const rules = schema[field];
        const value = dataToValidate[field];
        
        // Check if field is required
        if (rules.notEmpty && (!value || value.toString().trim() === '')) {
          errors.push(rules.notEmpty.errorMessage || `${field} is required`);
          return;
        }
        
        // Skip validation if field is optional and not provided
        if (rules.optional && (value === undefined || value === null)) {
          return;
        }
        
        // Type validation
        if (value !== undefined && value !== null) {
          if (rules.isString && typeof value !== 'string') {
            errors.push(rules.isString.errorMessage || `${field} must be a string`);
          }
          
          if (rules.isNumber && typeof value !== 'number') {
            errors.push(rules.isNumber.errorMessage || `${field} must be a number`);
          }
          
          if (rules.isObject && (typeof value !== 'object' || Array.isArray(value))) {
            errors.push(rules.isObject.errorMessage || `${field} must be an object`);
          }
          
          if (rules.isArray && !Array.isArray(value)) {
            errors.push(rules.isArray.errorMessage || `${field} must be an array`);
          }
          
          // Value validation
          if (rules.isIn && rules.isIn.options && !rules.isIn.options[0].includes(value)) {
            errors.push(rules.isIn.errorMessage || `${field} has an invalid value`);
          }
        }
      });
      
      // If validation errors, return 400 with error messages
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          errors
        });
      }
      
      // Validation passed, continue to the next middleware
      next();
    } catch (error) {
      // If validation throws an error, return 500
      res.status(500).json({
        success: false,
        error: 'Validation error occurred'
      });
    }
  };
};

module.exports = validateRequest;