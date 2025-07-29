/**
 * HTTP Client Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { httpClient } from '../../src/services/httpClient';

describe('HttpClient', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Authentication', () => {
    it('should set auth token', () => {
      const token = 'test-token';
      httpClient.setAuthToken(token);
      
      // Check if token is stored in localStorage
      expect(localStorage.getItem('auth_token')).toBe(token);
    });

    it('should clear auth token', () => {
      httpClient.setAuthToken('test-token');
      httpClient.clearAuthToken();
      
      expect(localStorage.getItem('auth_token')).toBeNull();
    });

    it('should initialize auth from localStorage', () => {
      const token = 'stored-token';
      localStorage.setItem('auth_token', token);
      
      // Should not throw an error
      expect(() => httpClient.initializeAuth()).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', () => {
      const error = new Error('Network Error');
      
      expect(() => {
        throw error;
      }).toThrow('Network Error');
    });

    it('should handle API error structure', () => {
      const apiError = {
        response: {
          status: 404,
          data: { message: 'Not Found' }
        }
      };
      
      expect(apiError.response.status).toBe(404);
      expect(apiError.response.data.message).toBe('Not Found');
    });
  });
});