/**
 * Application configuration
 * This file centralizes all configuration settings for the application
 */

// API Configuration
export const API_CONFIG = {
  // Base URL for API requests
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3005/api',
  
  // Request timeout in milliseconds
  TIMEOUT: 10000,
  
  // Whether to use mock data (true in development, false in production)
  USE_MOCK: false, // Set to false to use the real MongoDB backend
  
  // API version
  VERSION: 'v1',
};

// Authentication Configuration
export const AUTH_CONFIG = {
  // Local storage keys
  TOKEN_KEY: 'authToken',
  USER_KEY: 'user',
  
  // Token expiration time in milliseconds (default: 1 day)
  TOKEN_EXPIRATION: 24 * 60 * 60 * 1000,
};

// UI Configuration
export const UI_CONFIG = {
  // Theme settings
  THEME: {
    PRIMARY_COLOR: '#1976d2',
    SECONDARY_COLOR: '#dc004e',
    BACKGROUND_COLOR: '#f5f5f5',
  },
  
  // Pagination settings
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 25, 50],
  },
  
  // Animation settings
  ANIMATION: {
    DEFAULT_DURATION: 300, // ms
  },
};

// Feature flags
export const FEATURES = {
  ENABLE_ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS === 'true' || false,
  ENABLE_NOTIFICATIONS: process.env.REACT_APP_ENABLE_NOTIFICATIONS === 'true' || true,
  ENABLE_OFFLINE_MODE: process.env.REACT_APP_ENABLE_OFFLINE_MODE === 'true' || false,
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action. Please log in again.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'An unexpected server error occurred. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
};

// Default export for convenience
const config = {
  API: API_CONFIG,
  AUTH: AUTH_CONFIG,
  UI: UI_CONFIG,
  FEATURES,
  ERROR_MESSAGES,
};

export default config;
