import axios, { AxiosError } from 'axios';
import { Note, Tool, ProcessingJob, ApiErrorResponse } from '../types';
import { mockNotes, mockTools, mockProcessingJobs } from './mockData';
import { API_CONFIG, AUTH_CONFIG, ERROR_MESSAGES } from '../config';

// Create axios instance with configuration
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Set to false for cross-origin requests without credentials
});

// Add request interceptor to attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error cases
    if (error.response) {
      // Server responded with non-2xx status
      if (error.response.status === 401) {
        // Handle unauthorized (e.g., token expired)
        localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
        localStorage.removeItem(AUTH_CONFIG.USER_KEY);
        // Redirect to login if needed
      }
    }
    return Promise.reject(error);
  }
);

// Error handler helper
const handleApiError = (error: AxiosError): Promise<never> => {
  // Create a standardized error object
  const errorResponse: ApiErrorResponse = {
    status: error.response?.status || 500,
    message: (error.response?.data as any)?.message || error.message || 'Unknown error occurred',
    data: error.response?.data || {},
  };

  // Map status codes to friendly error messages
  let friendlyMessage = ERROR_MESSAGES.SERVER_ERROR;
  switch (errorResponse.status) {
    case 400:
      friendlyMessage = ERROR_MESSAGES.VALIDATION_ERROR;
      break;
    case 401:
    case 403:
      friendlyMessage = ERROR_MESSAGES.UNAUTHORIZED;
      break;
    case 404:
      friendlyMessage = ERROR_MESSAGES.NOT_FOUND;
      break;
    case 0: // Network error
      friendlyMessage = ERROR_MESSAGES.NETWORK_ERROR;
      break;
  }

  // Add friendly message to error response
  errorResponse.friendlyMessage = friendlyMessage;

  // Log the error (in development)
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', errorResponse);
  }

  return Promise.reject(errorResponse);
};

// Notes API
export const notesApi = {
  getAllNotes: async () => {
    if (API_CONFIG.USE_MOCK) {
      return Promise.resolve({ data: mockNotes });
    }
    
    try {
      return await api.get<Note[]>('/notes');
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },
  
  getNoteById: async (id: string) => {
    if (API_CONFIG.USE_MOCK) {
      const note = mockNotes.find(n => n.id === id);
      return Promise.resolve({ data: note });
    }
    
    try {
      return await api.get<Note>(`/notes/${id}`);
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },
  
  createNote: async (note: Partial<Note>) => {
    if (API_CONFIG.USE_MOCK) {
      const newNote: Note = {
        id: Date.now().toString(),
        title: note.title || '',
        content: note.content || '',
        tags: note.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'draft',
      };
      mockNotes.push(newNote);
      return Promise.resolve({ data: newNote });
    }
    
    try {
      return await api.post<Note>('/notes', note);
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },
  
  updateNote: async (id: string, note: Partial<Note>) => {
    if (API_CONFIG.USE_MOCK) {
      const index = mockNotes.findIndex(n => n.id === id);
      if (index !== -1) {
        const updatedNote = {
          ...mockNotes[index],
          ...note,
          updatedAt: new Date().toISOString(),
        };
        mockNotes[index] = updatedNote;
        return Promise.resolve({ data: updatedNote });
      }
      return Promise.reject({
        status: 404,
        message: 'Note not found',
        data: {}
      });
    }
    
    try {
      return await api.put<Note>(`/notes/${id}`, note);
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },
  
  deleteNote: async (id: string) => {
    if (API_CONFIG.USE_MOCK) {
      const index = mockNotes.findIndex(n => n.id === id);
      if (index !== -1) {
        mockNotes.splice(index, 1);
        return Promise.resolve({ data: { success: true } });
      }
      return Promise.reject({
        status: 404,
        message: 'Note not found',
        data: {}
      });
    }
    
    try {
      return await api.delete(`/notes/${id}`);
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },
};

// Tools API
export const toolsApi = {
  getAllTools: async () => {
    if (API_CONFIG.USE_MOCK) {
      return Promise.resolve({ data: mockTools });
    }
    
    try {
      return await api.get('/tools');
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },
  
  getToolById: async (id: string) => {
    if (API_CONFIG.USE_MOCK) {
      const tool = mockTools.find(t => t.id === id);
      return Promise.resolve({ data: tool });
    }
    
    try {
      return await api.get(`/tools/${id}`);
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },
};

// Processing API
export const processingApi = {
  // Submit a new processing job
  submitJob: async (noteId: string, toolIds: string[], content: string): Promise<{ data: ProcessingJob }> => {
    if (API_CONFIG.USE_MOCK) {
      // Create a mock processing job
      const mockJob: ProcessingJob = {
        id: `job-${Date.now()}`,
        noteId,
        toolIds,
        status: 'pending',
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      mockProcessingJobs.push(mockJob);
      
      // Simulate processing progress
      setTimeout(() => {
        const index = mockProcessingJobs.findIndex((job: ProcessingJob) => job.id === mockJob.id);
        if (index !== -1) {
          mockProcessingJobs[index].status = 'processing';
          mockProcessingJobs[index].progress = 50;
        }
      }, 2000);
      
      // Simulate job completion
      setTimeout(() => {
        const index = mockProcessingJobs.findIndex((job: ProcessingJob) => job.id === mockJob.id);
        if (index !== -1) {
          mockProcessingJobs[index].status = 'completed';
          mockProcessingJobs[index].progress = 100;
          mockProcessingJobs[index].results = {
            'summary': 'This is a mock summary of the note content.',
            'sentiment': {
              score: 0.75,
              category: 'positive'
            }
          };
        }
      }, 5000);
      
      return Promise.resolve({ data: mockJob });
    }
    
    try {
      return await api.post('/process', { 
        noteId, 
        toolIds, 
        content 
      });
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },
  
  // Get all processing jobs
  getAllJobs: async (status?: string, page: number = 1, limit: number = 10): Promise<{ data: { jobs: ProcessingJob[], pagination: any } }> => {
    if (API_CONFIG.USE_MOCK) {
      return Promise.resolve({ data: { 
        jobs: mockProcessingJobs,
        pagination: {
          total: mockProcessingJobs.length,
          page: 1,
          limit: 10,
          pages: 1
        }
      }});
    }
    
    try {
      const queryParams = new URLSearchParams();
      if (status) queryParams.append('status', status);
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      
      return await api.get(`/process?${queryParams.toString()}`);
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },
  
  // Get status of a specific job
  getJobStatus: async (jobId: string): Promise<{ data: ProcessingJob }> => {
    if (API_CONFIG.USE_MOCK) {
      const job = mockProcessingJobs.find((job: ProcessingJob) => job.id === jobId);
      
      if (!job) {
        return Promise.reject({
          status: 404,
          message: 'Processing job not found',
          data: {}
        });
      }
      
      return Promise.resolve({ data: job });
    }
    
    try {
      return await api.get(`/process/${jobId}`);
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },
  
  // Cancel a processing job
  cancelJob: async (jobId: string): Promise<{ data: ProcessingJob }> => {
    if (API_CONFIG.USE_MOCK) {
      const index = mockProcessingJobs.findIndex((job: ProcessingJob) => job.id === jobId);
      
      if (index === -1) {
        return Promise.reject({
          status: 404,
          message: 'Processing job not found',
          data: {}
        });
      }
      
      mockProcessingJobs[index].status = 'failed';
      mockProcessingJobs[index].error = 'Job cancelled by user';
      
      return Promise.resolve({ data: mockProcessingJobs[index] });
    }
    
    try {
      return await api.post(`/process/${jobId}/cancel`);
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },
};

export default api;
