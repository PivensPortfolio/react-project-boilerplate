import { useCallback } from 'react';
import { errorService, ErrorHandlerOptions } from '../services/errorService';

/**
 * Custom hook for error handling
 * Provides convenient methods for handling different types of errors
 */
export const useErrorHandler = () => {
  const handleError = useCallback((error: Error | string, options?: ErrorHandlerOptions) => {
    errorService.handleError(error, options);
  }, []);

  const handleApiError = useCallback((error: any, options?: ErrorHandlerOptions) => {
    errorService.handleApiError(error, options);
  }, []);

  const handleNetworkError = useCallback((error: Error, options?: ErrorHandlerOptions) => {
    errorService.handleNetworkError(error, options);
  }, []);

  const handleValidationError = useCallback((message: string, field?: string, options?: ErrorHandlerOptions) => {
    errorService.handleValidationError(message, field, options);
  }, []);

  const reportError = useCallback((error: Error | string, context?: Record<string, any>) => {
    errorService.handleError(error, {
      showToast: true,
      reportToService: true,
      context,
    });
  }, []);

  const getStoredErrors = useCallback(() => {
    return errorService.getStoredErrors();
  }, []);

  const clearStoredErrors = useCallback(() => {
    errorService.clearStoredErrors();
  }, []);

  return {
    handleError,
    handleApiError,
    handleNetworkError,
    handleValidationError,
    reportError,
    getStoredErrors,
    clearStoredErrors,
  };
};

export default useErrorHandler;