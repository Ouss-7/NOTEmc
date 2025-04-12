import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ProcessingJob, ApiErrorResponse } from '../types';
import { processingApi } from '../services/api';
import { normalizeError } from '../utils/errorHandling';

interface ProcessingState {
  jobs: ProcessingJob[];
  currentJob: ProcessingJob | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: ApiErrorResponse | null;
}

const initialState: ProcessingState = {
  jobs: [],
  currentJob: null,
  status: 'idle',
  error: null,
};

export const submitProcessingJob = createAsyncThunk(
  'processing/submitJob',
  async ({ noteId, toolIds, content }: { noteId: string; toolIds: string[]; content: string }, { rejectWithValue }) => {
    try {
      const response = await processingApi.submitJob(noteId, toolIds, content);
      return response.data;
    } catch (error) {
      return rejectWithValue(normalizeError(error));
    }
  }
);

export const fetchProcessingJobs = createAsyncThunk(
  'processing/fetchJobs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await processingApi.getAllJobs();
      return response.data.jobs || []; // Extract jobs array from response
    } catch (error) {
      return rejectWithValue(normalizeError(error));
    }
  }
);

export const fetchJobStatus = createAsyncThunk(
  'processing/fetchJobStatus',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const response = await processingApi.getJobStatus(jobId);
      return response.data;
    } catch (error) {
      return rejectWithValue(normalizeError(error));
    }
  }
);

const processingSlice = createSlice({
  name: 'processing',
  initialState,
  reducers: {
    setCurrentJob(state, action) {
      state.currentJob = action.payload;
    },
    clearProcessingError(state) {
      state.error = null;
    },
    startProcessing(state, action) {
      const noteId = action.payload;
      state.status = 'loading';
      // You could also track which notes are being processed if needed
      // by adding a processingNotes array to your state
    },
    completeProcessing(state, action) {
      const { noteId, results } = action.payload;
      state.status = 'succeeded';
      // Here you could update a specific note's processing results
      // or store the results in a separate part of the state
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit job
      .addCase(submitProcessingJob.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(submitProcessingJob.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentJob = action.payload;
        state.jobs.push(action.payload);
      })
      .addCase(submitProcessingJob.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as ApiErrorResponse || {
          status: 500,
          message: action.error.message || 'Unknown error',
          data: {},
        };
      })
      
      // Fetch jobs
      .addCase(fetchProcessingJobs.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProcessingJobs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.jobs = action.payload;
      })
      .addCase(fetchProcessingJobs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as ApiErrorResponse || {
          status: 500,
          message: action.error.message || 'Unknown error',
          data: {},
        };
      })
      
      // Fetch job status
      .addCase(fetchJobStatus.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchJobStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Update the job in the jobs array
        const index = state.jobs.findIndex(job => job.id === action.payload.id);
        if (index !== -1) {
          state.jobs[index] = action.payload;
        }
        // Update current job if it's the same job
        if (state.currentJob && state.currentJob.id === action.payload.id) {
          state.currentJob = action.payload;
        }
      })
      .addCase(fetchJobStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as ApiErrorResponse || {
          status: 500,
          message: action.error.message || 'Unknown error',
          data: {},
        };
      });
  },
});

export const { setCurrentJob, clearProcessingError, startProcessing, completeProcessing } = processingSlice.actions;
export default processingSlice.reducer;
