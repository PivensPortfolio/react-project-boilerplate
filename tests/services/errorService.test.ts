import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { errorService } from '../../src/services/errorService';
import { ApiError } from '../../src/services/types';

// Mock console methods
const originalConsoleError = console.error;
const originalConsoleLog = console.log;
const originalConsoleInfo = console.info;
const originalConsoleGroup = console.group;
const originalConsoleGroupEnd = console.groupEnd;

// Mock DOM methods
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockCreateElement = vi.fn(() => {
  const element = {
    style: {
      cssText: '',
    },
    className: '',
    textContent: '',
    appendChild: vi.fn(),
    remove: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  
  // Make cssText writable
  Object.defineProperty(element.style, 'cssText', {
    writable: true,
    value: '',
  });
  
  return element;
});

beforeEach(() => {
  console.error = vi.fn();
  console.log = vi.fn();
  console.info = vi.fn();
  console.group = vi.fn();
  console.groupEnd = vi.fn();
  
  // Mock DOM
  Object.defineProperty(document, 'createElement', {
    value: mockCreateElement,
    writable: true,
  });
  
  Object.defineProperty(document, 'body', {
    value: {
      appendChild: mockAppendChild,
      removeChild: mockRemoveChild,
    },
    writable: true,
  });

  // Clear localStorage
  localStorage.clear();
  
  // Reset mocks
  mockAppendChild.mockClear();
  mockRemoveChild.mockClear();
  mockCreateElement.mockClear();
});

afterEach(() => {
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
  console.info = originalConsoleInfo;
  console.group = originalConsoleGroup;
  console.groupEnd = originalConsoleGroupEnd;
  
  // Clean up error service
  errorService.cleanup();
});

describe('ErrorService', () => {
  describe('handleError', () => {
    it('handles string errors', () => {
      errorService.handleError('Test error message');
      
      expect(console.group).toHaveBeenCalledWith(
        expect.stringContaining('RUNTIME ERROR'),
        expect.any(String)
      );
      expect(console.error).toHaveBeenCalledWith('Message:', 'Test error message');
    });

    it('handles Error objects', () => {
      const error = new Error('Test error');
      errorService.handleError(error);
      
      expect(console.group).toHaveBeenCalledWith(
        expect.stringContaining('RUNTIME ERROR'),
        expect.any(String)
      );
      expect(console.error).toHaveBeenCalledWith('Message:', 'Test error');
      expect(console.error).toHaveBeenCalledWith('Stack:', error.stack);
    });

    it('stores error in localStorage', () => {
      errorService.handleError('Test error');
      
      const storedErrors = JSON.parse(localStorage.getItem('error_reports') || '[]');
      expect(storedErrors).toHaveLength(1);
      expect(storedErrors[0]).toMatchObject({
        message: 'Test error',
        type: 'runtime',
        severity: 'medium',
        timestamp: expect.any(String),
      });
    });

    it('shows toast when showToast option is true', () => {
      errorService.handleError('Test error', { showToast: true });
      
      expect(mockCreateElement).toHaveBeenCalledWith('div');
      expect(mockAppendChild).toHaveBeenCalled();
    });

    it('respects custom severity', () => {
      errorService.handleError('Critical error', { severity: 'critical' });
      
      const storedErrors = JSON.parse(localStorage.getItem('error_reports') || '[]');
      expect(storedErrors[0].severity).toBe('critical');
    });

    it('includes custom context', () => {
      const context = { component: 'TestComponent', action: 'testAction' };
      errorService.handleError('Test error', { context });
      
      const storedErrors = JSON.parse(localStorage.getItem('error_reports') || '[]');
      expect(storedErrors[0].context).toEqual(context);
    });
  });

  describe('handleApiError', () => {
    it('handles API errors with status codes', () => {
      const apiError: ApiError = {
        message: 'Not found',
        status: 404,
        code: 'NOT_FOUND',
        details: { resource: 'user' },
      };

      errorService.handleApiError(apiError);
      
      const storedErrors = JSON.parse(localStorage.getItem('error_reports') || '[]');
      expect(storedErrors[0]).toMatchObject({
        message: 'Not found',
        type: 'api',
        severity: 'medium',
        context: {
          status: 404,
          code: 'NOT_FOUND',
          details: { resource: 'user' },
        },
      });
    });

    it('assigns correct severity based on status code', () => {
      // Test 500 error (critical)
      errorService.handleApiError({ message: 'Server error', status: 500 });
      let storedErrors = JSON.parse(localStorage.getItem('error_reports') || '[]');
      expect(storedErrors[0].severity).toBe('critical');

      // Clear and test 400 error (medium)
      localStorage.clear();
      errorService.handleApiError({ message: 'Bad request', status: 400 });
      storedErrors = JSON.parse(localStorage.getItem('error_reports') || '[]');
      expect(storedErrors[0].severity).toBe('medium');
    });
  });

  describe('handleNetworkError', () => {
    it('handles network errors', () => {
      const networkError = new Error('Network timeout');
      errorService.handleNetworkError(networkError);
      
      const storedErrors = JSON.parse(localStorage.getItem('error_reports') || '[]');
      expect(storedErrors[0]).toMatchObject({
        message: 'Network timeout',
        type: 'network',
        severity: 'medium',
        context: {
          isOnline: expect.any(Boolean),
        },
      });
    });
  });

  describe('handleValidationError', () => {
    it('handles validation errors', () => {
      errorService.handleValidationError('Email is required', 'email');
      
      const storedErrors = JSON.parse(localStorage.getItem('error_reports') || '[]');
      expect(storedErrors[0]).toMatchObject({
        message: 'Email is required',
        type: 'validation',
        severity: 'low',
        context: {
          field: 'email',
        },
      });
    });
  });

  describe('getStoredErrors', () => {
    it('returns stored errors', () => {
      errorService.handleError('Error 1');
      errorService.handleError('Error 2');
      
      const errors = errorService.getStoredErrors();
      expect(errors).toHaveLength(2);
      expect(errors[0].message).toBe('Error 1');
      expect(errors[1].message).toBe('Error 2');
    });

    it('returns empty array when no errors stored', () => {
      const errors = errorService.getStoredErrors();
      expect(errors).toEqual([]);
    });

    it('handles corrupted localStorage data', () => {
      localStorage.setItem('error_reports', 'invalid json');
      const errors = errorService.getStoredErrors();
      expect(errors).toEqual([]);
    });
  });

  describe('clearStoredErrors', () => {
    it('clears stored errors', () => {
      errorService.handleError('Test error');
      expect(errorService.getStoredErrors()).toHaveLength(1);
      
      errorService.clearStoredErrors();
      expect(errorService.getStoredErrors()).toHaveLength(0);
    });
  });

  describe('error storage limits', () => {
    it('limits stored errors to 20 items', () => {
      // Add 25 errors
      for (let i = 0; i < 25; i++) {
        errorService.handleError(`Error ${i}`);
      }
      
      const storedErrors = errorService.getStoredErrors();
      expect(storedErrors).toHaveLength(20);
      
      // Should keep the most recent errors
      expect(storedErrors[0].message).toBe('Error 5'); // First kept error
      expect(storedErrors[19].message).toBe('Error 24'); // Last error
    });
  });

  describe('user-friendly messages', () => {
    it('provides user-friendly messages for API errors', () => {
      // Mock toast creation to capture message
      const mockElement = { 
        textContent: '',
        style: {
          cssText: '',
        },
        className: '',
        appendChild: vi.fn(),
        remove: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
      
      // Make cssText writable
      Object.defineProperty(mockElement.style, 'cssText', {
        writable: true,
        value: '',
      });
      
      mockCreateElement.mockReturnValue(mockElement);

      // Test 404 error
      errorService.handleApiError({ message: 'Not found', status: 404 }, { showToast: true });
      expect(mockElement.textContent).toBe('The requested resource was not found.');

      // Test 401 error
      errorService.handleApiError({ message: 'Unauthorized', status: 401 }, { showToast: true });
      expect(mockElement.textContent).toBe('You need to log in to access this resource.');

      // Test 403 error
      errorService.handleApiError({ message: 'Forbidden', status: 403 }, { showToast: true });
      expect(mockElement.textContent).toBe('You don\'t have permission to access this resource.');

      // Test 500 error
      errorService.handleApiError({ message: 'Server error', status: 500 }, { showToast: true });
      expect(mockElement.textContent).toBe('Server error occurred. Please try again later.');
    });

    it('provides user-friendly messages for network errors', () => {
      const mockElement = { 
        textContent: '',
        style: {
          cssText: '',
        },
        className: '',
        appendChild: vi.fn(),
        remove: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
      
      // Make cssText writable
      Object.defineProperty(mockElement.style, 'cssText', {
        writable: true,
        value: '',
      });
      
      mockCreateElement.mockReturnValue(mockElement);

      errorService.handleNetworkError(new Error('Network error'), { showToast: true });
      expect(mockElement.textContent).toBe('Network connection error. Please check your internet connection.');
    });
  });
});