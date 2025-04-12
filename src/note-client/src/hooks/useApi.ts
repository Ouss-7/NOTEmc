import { useState, useCallback } from 'react';
import { ApiErrorResponse } from '../types';
import { handleApiError, logError, normalizeError } from '../utils/errorHandling';

/**
 * Custom hook for handling API requests with loading, error, and success states
 */
export function useApi<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiErrorResponse | null>(null);

  /**
   * Execute an API request with proper error handling
   * @param apiCall The API function to call
   * @param onSuccess Optional callback on success
   * @param onError Optional callback on error
   * @returns The result of the API call
   */
  const execute = useCallback(
    async <R>(apiCall: () => Promise<{ data: R }>, onSuccess?: (data: R) => void, onError?: (error: ApiErrorResponse) => void) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiCall();
        setData(response.data as unknown as T);
        if (onSuccess) {
          onSuccess(response.data);
        }
        return response.data;
      } catch (err) {
        const normalizedError = normalizeError(err);
        setError(normalizedError);
        logError(normalizedError, 'useApi');
        if (onError) {
          onError(normalizedError);
        }
        throw normalizedError;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Reset the hook state
   */
  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  /**
   * Get a user-friendly error message
   */
  const errorMessage = error ? handleApiError(error) : '';

  return {
    data,
    loading,
    error,
    errorMessage,
    execute,
    reset,
  };
}

export default useApi;
