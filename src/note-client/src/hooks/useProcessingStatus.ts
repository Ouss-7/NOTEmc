import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchJobStatus } from '../store/processingSlice';
import { ProcessingJob } from '../types';

interface UseProcessingStatusProps {
  jobId: string;
  pollingInterval?: number; // in milliseconds
  autoStart?: boolean;
}

interface UseProcessingStatusResult {
  job: ProcessingJob | null;
  loading: boolean;
  error: any;
  isCompleted: boolean;
  progress: number;
  startPolling: () => void;
  stopPolling: () => void;
}

/**
 * Custom hook for real-time processing status updates using polling
 */
const useProcessingStatus = ({
  jobId,
  pollingInterval = 3000, // Default to 3 seconds
  autoStart = true,
}: UseProcessingStatusProps): UseProcessingStatusResult => {
  const dispatch = useDispatch<AppDispatch>();
  const { jobs, status, error } = useSelector((state: RootState) => state.processing);
  
  const [isPolling, setIsPolling] = useState(autoStart);
  const [progress, setProgress] = useState(0);
  
  // Find the job in the store
  const job = jobs.find(j => j.id === jobId) || null;
  
  // Calculate if the job is completed
  const isCompleted = job?.status === 'completed' || job?.status === 'failed';
  
  // Calculate progress based on job status
  useEffect(() => {
    if (!job) return;
    
    switch (job.status) {
      case 'queued':
        setProgress(10);
        break;
      case 'processing':
        // If the job has a progress field, use it; otherwise use 50%
        setProgress(job.progress ? job.progress : 50);
        break;
      case 'completed':
        setProgress(100);
        break;
      case 'failed':
        setProgress(0);
        break;
      default:
        setProgress(0);
    }
  }, [job]);
  
  // Fetch job status
  const fetchStatus = useCallback(() => {
    if (jobId) {
      dispatch(fetchJobStatus(jobId));
    }
  }, [dispatch, jobId]);
  
  // Start polling
  const startPolling = useCallback(() => {
    setIsPolling(true);
  }, []);
  
  // Stop polling
  const stopPolling = useCallback(() => {
    setIsPolling(false);
  }, []);
  
  // Set up polling interval
  useEffect(() => {
    // Initial fetch
    fetchStatus();
    
    // Only continue polling if not completed and polling is enabled
    if (isPolling && !isCompleted) {
      const intervalId = setInterval(() => {
        fetchStatus();
      }, pollingInterval);
      
      // Clean up interval on unmount or when polling stops
      return () => clearInterval(intervalId);
    }
    
    // If job is completed, stop polling
    if (isCompleted && isPolling) {
      stopPolling();
    }
  }, [fetchStatus, isPolling, isCompleted, pollingInterval, stopPolling]);
  
  return {
    job,
    loading: status === 'loading',
    error,
    isCompleted,
    progress,
    startPolling,
    stopPolling,
  };
};

export default useProcessingStatus;
