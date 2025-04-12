import { AUTH_CONFIG } from '../config';
import { User } from '../types';

/**
 * Authentication utility functions for managing tokens and user data
 */

/**
 * Store authentication token in localStorage
 * @param token JWT token
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
};

/**
 * Get authentication token from localStorage
 * @returns JWT token or null if not found
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
};

/**
 * Remove authentication token from localStorage
 */
export const removeAuthToken = (): void => {
  localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
};

/**
 * Store user data in localStorage
 * @param user User object
 */
export const setUser = (user: User): void => {
  localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(user));
};

/**
 * Get user data from localStorage
 * @returns User object or null if not found
 */
export const getUser = (): User | null => {
  const userData = localStorage.getItem(AUTH_CONFIG.USER_KEY);
  if (!userData) return null;
  
  try {
    return JSON.parse(userData) as User;
  } catch (error) {
    console.error('Failed to parse user data:', error);
    return null;
  }
};

/**
 * Remove user data from localStorage
 */
export const removeUser = (): void => {
  localStorage.removeItem(AUTH_CONFIG.USER_KEY);
};

/**
 * Check if user is authenticated
 * @returns true if user is authenticated, false otherwise
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

/**
 * Clear all authentication data from localStorage
 */
export const logout = (): void => {
  removeAuthToken();
  removeUser();
};

/**
 * Decode JWT token to get payload
 * @param token JWT token
 * @returns Decoded token payload or null if invalid
 */
export const decodeToken = (token: string): any => {
  try {
    // JWT tokens are split into three parts: header, payload, signature
    // We only need the payload which is the second part
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 * @param token JWT token
 * @returns true if token is expired, false otherwise
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  
  // exp is in seconds, Date.now() is in milliseconds
  return decoded.exp * 1000 < Date.now();
};
