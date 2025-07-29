import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ErrorExample from '../../../src/components/examples/ErrorExample';
import { useErrorHandler } from '../../../src/hooks/useErrorHandler';

// Mock the useErrorHandler hook
vi.mock('../../../src/hooks/useErrorHandler');

const mockUseErrorHandler = useErrorHandler as any;

const mockErrorHandlers = {
  handleError: vi.fn(),
  handleApiError: vi.fn(),
  handleNetworkError: vi.fn(),
  handleValidationError: vi.fn(),
  reportError: vi.fn(),
  getStoredErrors: vi.fn(() => []),
  clearStoredErrors: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockUseErrorHandler.mockReturnValue(mockErrorHandlers);
});

describe('ErrorExample', () => {
  it('renders error handling examples section', () => {
    render(<ErrorExample />);

    expect(screen.getByText('Error Handling Examples')).toBeInTheDocument();
    expect(screen.getByText('Test different types of error handling and reporting:')).toBeInTheDocument();
  });

  it('renders all error trigger buttons', () => {
    render(<ErrorExample />);

    expect(screen.getByRole('button', { name: 'Trigger Runtime Error' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Trigger API Error' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Trigger Network Error' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Trigger Validation Error' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Trigger React Error (ErrorBoundary)' })).toBeInTheDocument();
  });

  it('renders error report management buttons', () => {
    render(<ErrorExample />);

    expect(screen.getByRole('button', { name: 'Load Error Reports' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear All Errors' })).toBeInTheDocument();
  });

  it('triggers runtime error when button is clicked', () => {
    render(<ErrorExample />);

    const button = screen.getByRole('button', { name: 'Trigger Runtime Error' });
    fireEvent.click(button);

    expect(mockErrorHandlers.handleError).toHaveBeenCalledWith(
      expect.any(Error),
      {
        severity: 'medium',
        showToast: true,
        context: { component: 'ErrorExample', action: 'triggerRuntimeError' },
      }
    );

    const calledError = mockErrorHandlers.handleError.mock.calls[0][0];
    expect(calledError.message).toBe('This is a test runtime error');
  });

  it('triggers API error when button is clicked', () => {
    render(<ErrorExample />);

    const button = screen.getByRole('button', { name: 'Trigger API Error' });
    fireEvent.click(button);

    expect(mockErrorHandlers.handleApiError).toHaveBeenCalledWith(
      {
        message: 'Failed to fetch user data',
        status: 404,
        code: 'USER_NOT_FOUND',
        details: { userId: '123' },
      },
      {
        showToast: true,
        context: { endpoint: '/api/users/123' },
      }
    );
  });

  it('triggers network error when button is clicked', () => {
    render(<ErrorExample />);

    const button = screen.getByRole('button', { name: 'Trigger Network Error' });
    fireEvent.click(button);

    expect(mockErrorHandlers.handleNetworkError).toHaveBeenCalledWith(
      expect.any(Error),
      {
        showToast: true,
        context: { timeout: 5000 },
      }
    );

    const calledError = mockErrorHandlers.handleNetworkError.mock.calls[0][0];
    expect(calledError.message).toBe('Network connection failed');
  });

  it('triggers validation error when button is clicked', () => {
    render(<ErrorExample />);

    const button = screen.getByRole('button', { name: 'Trigger Validation Error' });
    fireEvent.click(button);

    expect(mockErrorHandlers.handleValidationError).toHaveBeenCalledWith(
      'Email address is required',
      'email',
      {
        showToast: true,
        context: { form: 'registration' },
      }
    );
  });

  it('throws React error when button is clicked', () => {
    // Mock console.error to avoid noise in test output
    const originalConsoleError = console.error;
    console.error = vi.fn();

    // We need to wrap the component in an error boundary to catch the error
    const TestWrapper = () => {
      try {
        return <ErrorExample />;
      } catch (error) {
        return <div>Error caught: {(error as Error).message}</div>;
      }
    };

    render(<TestWrapper />);

    const button = screen.getByRole('button', { name: 'Trigger React Error (ErrorBoundary)' });
    
    // This should throw an error that would be caught by ErrorBoundary in real usage
    expect(() => fireEvent.click(button)).toThrow('This is a React component error for testing ErrorBoundary');

    console.error = originalConsoleError;
  });

  it('loads error reports when button is clicked', () => {
    const mockErrors = [
      {
        id: 'err_1',
        message: 'Test error 1',
        type: 'runtime',
        severity: 'medium',
        timestamp: '2023-01-01T00:00:00.000Z',
      },
      {
        id: 'err_2',
        message: 'Test error 2',
        type: 'api',
        severity: 'high',
        timestamp: '2023-01-01T01:00:00.000Z',
        context: { status: 500 },
      },
    ];

    mockErrorHandlers.getStoredErrors.mockReturnValue(mockErrors);

    render(<ErrorExample />);

    const button = screen.getByRole('button', { name: 'Load Error Reports' });
    fireEvent.click(button);

    expect(mockErrorHandlers.getStoredErrors).toHaveBeenCalled();
    expect(screen.getByText('Stored Error Reports (2)')).toBeInTheDocument();
    expect(screen.getByText('Test error 1')).toBeInTheDocument();
    expect(screen.getByText('Test error 2')).toBeInTheDocument();
  });

  it('displays error report details correctly', () => {
    const mockErrors = [
      {
        id: 'err_1',
        message: 'API Error',
        type: 'api',
        severity: 'high',
        timestamp: '2023-01-01T12:00:00.000Z',
        context: { status: 500, endpoint: '/api/test' },
      },
    ];

    mockErrorHandlers.getStoredErrors.mockReturnValue(mockErrors);

    render(<ErrorExample />);

    const button = screen.getByRole('button', { name: 'Load Error Reports' });
    fireEvent.click(button);

    expect(screen.getByText('API')).toBeInTheDocument();
    expect(screen.getByText('HIGH')).toBeInTheDocument();
    expect(screen.getByText('API Error')).toBeInTheDocument();
    
    // Check if context details are available
    const contextSummary = screen.getByText('Context');
    expect(contextSummary).toBeInTheDocument();
  });

  it('clears error reports when button is clicked', () => {
    const mockErrors = [
      {
        id: 'err_1',
        message: 'Test error',
        type: 'runtime',
        severity: 'medium',
        timestamp: '2023-01-01T00:00:00.000Z',
      },
    ];

    mockErrorHandlers.getStoredErrors.mockReturnValue(mockErrors);

    render(<ErrorExample />);

    // First load errors
    const loadButton = screen.getByRole('button', { name: 'Load Error Reports' });
    fireEvent.click(loadButton);
    expect(screen.getByText('Stored Error Reports (1)')).toBeInTheDocument();

    // Then clear errors
    const clearButton = screen.getByRole('button', { name: 'Clear All Errors' });
    fireEvent.click(clearButton);

    expect(mockErrorHandlers.clearStoredErrors).toHaveBeenCalled();
    expect(screen.queryByText('Stored Error Reports')).not.toBeInTheDocument();
  });

  it('shows no error reports when list is empty', () => {
    mockErrorHandlers.getStoredErrors.mockReturnValue([]);

    render(<ErrorExample />);

    const button = screen.getByRole('button', { name: 'Load Error Reports' });
    fireEvent.click(button);

    expect(screen.queryByText('Stored Error Reports')).not.toBeInTheDocument();
  });

  it('formats timestamps correctly', () => {
    const mockErrors = [
      {
        id: 'err_1',
        message: 'Test error',
        type: 'runtime',
        severity: 'medium',
        timestamp: '2023-01-01T12:30:45.000Z',
      },
    ];

    mockErrorHandlers.getStoredErrors.mockReturnValue(mockErrors);

    render(<ErrorExample />);

    const button = screen.getByRole('button', { name: 'Load Error Reports' });
    fireEvent.click(button);

    // The exact format depends on locale, but should contain date/time elements
    const timestampElement = screen.getByText(/2023|12|30|45/);
    expect(timestampElement).toBeInTheDocument();
  });
});