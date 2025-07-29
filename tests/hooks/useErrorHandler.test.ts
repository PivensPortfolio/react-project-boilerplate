import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useErrorHandler } from '../../src/hooks/useErrorHandler';
import { errorService } from '../../src/services/errorService';

// Mock the error service
vi.mock('../../src/services/errorService', () => ({
  errorService: {
    handleError: vi.fn(),
    handleApiError: vi.fn(),
    handleNetworkError: vi.fn(),
    handleValidationError: vi.fn(),
    getStoredErrors: vi.fn(),
    clearStoredErrors: vi.fn(),
  },
}));

const mockErrorService = errorService as any;

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.resetAllMocks();
});

describe('useErrorHandler', () => {
  it('provides handleError function', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    expect(typeof result.current.handleError).toBe('function');
  });

  it('calls errorService.handleError with correct parameters', () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = new Error('Test error');
    const options = { severity: 'high' as const, showToast: true };

    act(() => {
      result.current.handleError(error, options);
    });

    expect(mockErrorService.handleError).toHaveBeenCalledWith(error, options);
  });

  it('handles string errors', () => {
    const { result } = renderHook(() => useErrorHandler());
    const errorMessage = 'String error message';

    act(() => {
      result.current.handleError(errorMessage);
    });

    expect(mockErrorService.handleError).toHaveBeenCalledWith(errorMessage, undefined);
  });

  it('provides handleApiError function', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    expect(typeof result.current.handleApiError).toBe('function');
  });

  it('calls errorService.handleApiError with correct parameters', () => {
    const { result } = renderHook(() => useErrorHandler());
    const apiError = {
      message: 'API Error',
      status: 404,
      code: 'NOT_FOUND',
    };
    const options = { showToast: true };

    act(() => {
      result.current.handleApiError(apiError, options);
    });

    expect(mockErrorService.handleApiError).toHaveBeenCalledWith(apiError, options);
  });

  it('provides handleNetworkError function', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    expect(typeof result.current.handleNetworkError).toBe('function');
  });

  it('calls errorService.handleNetworkError with correct parameters', () => {
    const { result } = renderHook(() => useErrorHandler());
    const networkError = new Error('Network timeout');
    const options = { context: { timeout: 5000 } };

    act(() => {
      result.current.handleNetworkError(networkError, options);
    });

    expect(mockErrorService.handleNetworkError).toHaveBeenCalledWith(networkError, options);
  });

  it('provides handleValidationError function', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    expect(typeof result.current.handleValidationError).toBe('function');
  });

  it('calls errorService.handleValidationError with correct parameters', () => {
    const { result } = renderHook(() => useErrorHandler());
    const message = 'Email is required';
    const field = 'email';
    const options = { context: { form: 'registration' } };

    act(() => {
      result.current.handleValidationError(message, field, options);
    });

    expect(mockErrorService.handleValidationError).toHaveBeenCalledWith(message, field, options);
  });

  it('provides reportError function with default options', () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = new Error('Error to report');
    const context = { component: 'TestComponent' };

    act(() => {
      result.current.reportError(error, context);
    });

    expect(mockErrorService.handleError).toHaveBeenCalledWith(error, {
      showToast: true,
      reportToService: true,
      context,
    });
  });

  it('handles string errors in reportError', () => {
    const { result } = renderHook(() => useErrorHandler());
    const errorMessage = 'String error to report';

    act(() => {
      result.current.reportError(errorMessage);
    });

    expect(mockErrorService.handleError).toHaveBeenCalledWith(errorMessage, {
      showToast: true,
      reportToService: true,
      context: undefined,
    });
  });

  it('provides getStoredErrors function', () => {
    const { result } = renderHook(() => useErrorHandler());
    const mockErrors = [
      { id: '1', message: 'Error 1', type: 'runtime' },
      { id: '2', message: 'Error 2', type: 'api' },
    ];
    
    mockErrorService.getStoredErrors.mockReturnValue(mockErrors);

    act(() => {
      const errors = result.current.getStoredErrors();
      expect(errors).toEqual(mockErrors);
    });

    expect(mockErrorService.getStoredErrors).toHaveBeenCalled();
  });

  it('provides clearStoredErrors function', () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.clearStoredErrors();
    });

    expect(mockErrorService.clearStoredErrors).toHaveBeenCalled();
  });

  it('memoizes functions correctly', () => {
    const { result, rerender } = renderHook(() => useErrorHandler());
    
    const firstRender = {
      handleError: result.current.handleError,
      handleApiError: result.current.handleApiError,
      handleNetworkError: result.current.handleNetworkError,
      handleValidationError: result.current.handleValidationError,
      reportError: result.current.reportError,
      getStoredErrors: result.current.getStoredErrors,
      clearStoredErrors: result.current.clearStoredErrors,
    };

    rerender();

    // Functions should be the same reference (memoized)
    expect(result.current.handleError).toBe(firstRender.handleError);
    expect(result.current.handleApiError).toBe(firstRender.handleApiError);
    expect(result.current.handleNetworkError).toBe(firstRender.handleNetworkError);
    expect(result.current.handleValidationError).toBe(firstRender.handleValidationError);
    expect(result.current.reportError).toBe(firstRender.reportError);
    expect(result.current.getStoredErrors).toBe(firstRender.getStoredErrors);
    expect(result.current.clearStoredErrors).toBe(firstRender.clearStoredErrors);
  });

  it('works with no options provided', () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handleError('Simple error');
      result.current.handleApiError({ message: 'API error', status: 500 });
      result.current.handleNetworkError(new Error('Network error'));
      result.current.handleValidationError('Validation error');
    });

    expect(mockErrorService.handleError).toHaveBeenCalledWith('Simple error', undefined);
    expect(mockErrorService.handleApiError).toHaveBeenCalledWith(
      { message: 'API error', status: 500 }, 
      undefined
    );
    expect(mockErrorService.handleNetworkError).toHaveBeenCalledWith(
      new Error('Network error'), 
      undefined
    );
    expect(mockErrorService.handleValidationError).toHaveBeenCalledWith(
      'Validation error', 
      undefined, 
      undefined
    );
  });
});