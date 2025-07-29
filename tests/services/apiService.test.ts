/**
 * API Service Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ApiService, ApiUtils } from '../../src/services/apiService';

interface TestEntity {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateTestEntity {
  name: string;
}

describe('ApiService', () => {
  let apiService: ApiService<TestEntity, CreateTestEntity>;

  beforeEach(() => {
    apiService = new ApiService<TestEntity, CreateTestEntity>('/test-entities');
  });

  describe('Constructor', () => {
    it('should set endpoint correctly', () => {
      expect((apiService as any).endpoint).toBe('/test-entities');
    });
  });

  describe('ApiUtils', () => {
    it('should return correct error message for 400 status', () => {
      const error = { status: 400 };
      const message = ApiUtils.getErrorMessage(error);
      expect(message).toBe('Invalid request. Please check your input.');
    });

    it('should return correct error message for 401 status', () => {
      const error = { status: 401 };
      const message = ApiUtils.getErrorMessage(error);
      expect(message).toBe('You are not authorized. Please log in.');
    });

    it('should return correct error message for 404 status', () => {
      const error = { status: 404 };
      const message = ApiUtils.getErrorMessage(error);
      expect(message).toBe('The requested resource was not found.');
    });

    it('should return correct error message for 500 status', () => {
      const error = { status: 500 };
      const message = ApiUtils.getErrorMessage(error);
      expect(message).toBe('Server error. Please try again later.');
    });

    it('should return custom message when available', () => {
      const error = { message: 'Custom error message' };
      const message = ApiUtils.getErrorMessage(error);
      expect(message).toBe('Custom error message');
    });

    it('should return default message for unknown errors', () => {
      const error = {};
      const message = ApiUtils.getErrorMessage(error);
      expect(message).toBe('Network error. Please check your connection.');
    });
  });

  describe('Debounce', () => {
    it('should create a debounced function', () => {
      const mockFn = () => Promise.resolve('test');
      const debouncedFn = ApiUtils.debounce(mockFn, 100);
      
      expect(typeof debouncedFn).toBe('function');
    });
  });
});