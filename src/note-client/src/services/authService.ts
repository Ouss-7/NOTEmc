import axios, { AxiosError } from 'axios';
import { User, RegisterUserData, ApiErrorResponse } from '../types';
import { API_CONFIG, AUTH_CONFIG, ERROR_MESSAGES } from '../config';
import api from './api';

// Auth API endpoints
const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  PROFILE: '/auth/profile',
  CHANGE_PASSWORD: '/auth/change-password',
};

// Error handler helper
const handleAuthError = (error: AxiosError): Promise<never> => {
  console.error('Auth API Error:', error);
  
  // Create a standardized error object
  const errorResponse: ApiErrorResponse = {
    status: error.response?.status || 500,
    message: (error.response?.data as any)?.message || error.message || 'Unknown error occurred',
    data: error.response?.data || {},
  };

  // Handle network errors specifically
  if (!error.response) {
    console.error('Network error detected - no response from server');
    errorResponse.status = 0;
    errorResponse.message = 'Network Error';
  }

  // Map status codes to friendly error messages
  let friendlyMessage = ERROR_MESSAGES.SERVER_ERROR;
  switch (errorResponse.status) {
    case 400:
      friendlyMessage = 'Invalid credentials or input data';
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
    console.error('Auth Error:', errorResponse);
  }

  return Promise.reject(errorResponse);
};

// Auth API service
export const authApi = {
  // Login user
  login: async (email: string, password: string) => {
    if (API_CONFIG.USE_MOCK) {
      // Mock login for development
      const mockUser: User = {
        id: 'user-1',
        username: 'testuser',
        email: email,
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const mockToken = 'mock-jwt-token';
      
      // Store token and user in localStorage
      localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, mockToken);
      localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(mockUser));
      
      return Promise.resolve({ 
        data: { 
          user: mockUser, 
          token: mockToken 
        } 
      });
    }
    
    try {
      console.log('Attempting to login user:', email);
      console.log('API endpoint:', API_CONFIG.BASE_URL + AUTH_ENDPOINTS.LOGIN);
      
      // Use direct axios call to avoid potential interceptor issues
      const response = await axios({
        method: 'post',
        url: API_CONFIG.BASE_URL + AUTH_ENDPOINTS.LOGIN,
        data: { email, password },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: API_CONFIG.TIMEOUT
      });
      
      console.log('Login successful:', response.data);
      
      // Store token and user in localStorage
      localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, response.data.token);
      localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(response.data.user));
      
      return response;
    } catch (error) {
      return handleAuthError(error as AxiosError);
    }
  },
  
  // Register new user
  register: async (userData: RegisterUserData) => {
    if (API_CONFIG.USE_MOCK) {
      // Mock registration for development
      const mockUser: User = {
        id: 'user-' + Date.now(),
        username: userData.username || '',
        email: userData.email || '',
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const mockToken = 'mock-jwt-token';
      
      // Store token and user in localStorage
      localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, mockToken);
      localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(mockUser));
      
      return Promise.resolve({ 
        data: { 
          user: mockUser, 
          token: mockToken 
        } 
      });
    }
    
    try {
      console.log('Attempting to register user:', userData.email);
      console.log('API endpoint:', API_CONFIG.BASE_URL + AUTH_ENDPOINTS.REGISTER);
      
      // Use direct axios call to avoid potential interceptor issues
      const response = await axios({
        method: 'post',
        url: API_CONFIG.BASE_URL + AUTH_ENDPOINTS.REGISTER,
        data: userData,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: API_CONFIG.TIMEOUT
      });
      
      console.log('Registration successful:', response.data);
      
      // Store token and user in localStorage
      if (response.data.token) {
        localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, response.data.token);
        localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(response.data));
      }
      
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      return handleAuthError(error as AxiosError);
    }
  },
  
  // Get current user profile
  getProfile: async () => {
    if (API_CONFIG.USE_MOCK) {
      // Get user from localStorage
      const userJson = localStorage.getItem(AUTH_CONFIG.USER_KEY);
      if (!userJson) {
        return Promise.reject({
          status: 401,
          message: 'User not authenticated',
          data: {}
        });
      }
      
      const user = JSON.parse(userJson) as User;
      return Promise.resolve({ data: user });
    }
    
    try {
      return await api.get(`${AUTH_ENDPOINTS.PROFILE}`);
    } catch (error) {
      return handleAuthError(error as AxiosError);
    }
  },
  
  // Update user profile
  updateProfile: async (userData: Partial<User>) => {
    if (API_CONFIG.USE_MOCK) {
      // Get user from localStorage
      const userJson = localStorage.getItem(AUTH_CONFIG.USER_KEY);
      if (!userJson) {
        return Promise.reject({
          status: 401,
          message: 'User not authenticated',
          data: {}
        });
      }
      
      const user = JSON.parse(userJson) as User;
      const updatedUser = {
        ...user,
        ...userData,
        updatedAt: new Date().toISOString()
      };
      
      // Update localStorage
      localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(updatedUser));
      
      return Promise.resolve({ data: updatedUser });
    }
    
    try {
      return await api.patch(`${AUTH_ENDPOINTS.PROFILE}`, userData);
    } catch (error) {
      return handleAuthError(error as AxiosError);
    }
  },
  
  // Change password
  changePassword: async (currentPassword: string, newPassword: string) => {
    if (API_CONFIG.USE_MOCK) {
      // Mock password change
      return Promise.resolve({ 
        data: { 
          success: true,
          message: 'Password changed successfully'
        } 
      });
    }
    
    try {
      return await api.post(`${AUTH_ENDPOINTS.CHANGE_PASSWORD}`, {
        currentPassword,
        newPassword
      });
    } catch (error) {
      return handleAuthError(error as AxiosError);
    }
  },
  
  // Logout user
  logout: () => {
    // Clear auth data from localStorage
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
    
    // Redirect to login page
    window.location.href = '/login';
  },
  
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
  },
  
  // Get current user
  getCurrentUser: (): User | null => {
    const userJson = localStorage.getItem(AUTH_CONFIG.USER_KEY);
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson) as User;
    } catch (error) {
      console.error('Failed to parse user data:', error);
      return null;
    }
  },
  
  // Get auth token
  getToken: (): string | null => {
    return localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
  }
};
