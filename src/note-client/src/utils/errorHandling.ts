import { ApiErrorResponse } from '../types';
import { ERROR_MESSAGES } from '../config';

/**
 * Handles API errors and returns appropriate user-friendly messages
 * @param error The error object from API call
 * @param fallbackMessage Optional fallback message if error doesn't have a message
 * @returns A user-friendly error message
 */
export const handleApiError = (error: any, fallbackMessage = ERROR_MESSAGES.SERVER_ERROR): string => {
  // If it's our standard API error response
  if (error && 'status' in error && 'message' in error) {
    const apiError = error as ApiErrorResponse;
    return apiError.friendlyMessage || apiError.message || fallbackMessage;
  }
  
  // If it's a string
  if (typeof error === 'string') {
    return error;
  }
  
  // If it has a message property
  if (error && error.message) {
    return error.message;
  }
  
  // Default fallback
  return fallbackMessage;
};

/**
 * Determines if an error is a network connectivity issue
 * @param error The error object from API call
 * @returns Boolean indicating if it's a network error
 */
export const isNetworkError = (error: any): boolean => {
  return (
    (error && 'status' in error && error.status === 0) || // Our API error with status 0
    (error && error.message === 'Network Error') || // Axios network error
    !navigator.onLine // Browser offline
  );
};

/**
 * Determines if an error is an authentication error (401 Unauthorized)
 * @param error The error object from API call
 * @returns Boolean indicating if it's an auth error
 */
export const isAuthError = (error: any): boolean => {
  return error && 'status' in error && error.status === 401;
};

/**
 * Creates a standardized error object from any error
 * @param error The original error
 * @returns A standardized error object
 */
export const normalizeError = (error: any): ApiErrorResponse => {
  if (error && 'status' in error && 'message' in error) {
    return error as ApiErrorResponse;
  }
  
  return {
    status: 500,
    message: typeof error === 'string' ? error : (error?.message || ERROR_MESSAGES.SERVER_ERROR),
    data: error || {},
    friendlyMessage: ERROR_MESSAGES.SERVER_ERROR
  };
};

/**
 * Logs errors to console in development mode
 * @param error The error to log
 * @param context Optional context information
 */
export const logError = (error: any, context?: string): void => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(`Error${context ? ` in ${context}` : ''}:`, error);
  }
  
  // Here you could also implement error reporting to a service like Sentry
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error);
  // }
};
