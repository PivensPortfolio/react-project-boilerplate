import React from 'react';
import { useToast } from '../../hooks/useToast';
import { errorService } from '../../services/errorService';

export const ToastExample: React.FC = () => {
  const { success, error, warning, info } = useToast();

  const handleSuccessToast = () => {
    success('Operation completed successfully!');
  };

  const handleErrorToast = () => {
    error('Something went wrong. Please try again.');
  };

  const handleWarningToast = () => {
    warning('This action cannot be undone.');
  };

  const handleInfoToast = () => {
    info('Here is some helpful information.');
  };

  const handleApiError = () => {
    // Simulate an API error
    errorService.handleApiError({
      message: 'Failed to fetch user data',
      status: 404,
      code: 'USER_NOT_FOUND',
      details: { userId: '123' },
    });
  };

  const handleNetworkError = () => {
    // Simulate a network error
    errorService.handleNetworkError(new Error('Network connection failed'));
  };

  const handleValidationError = () => {
    // Simulate a validation error (should not show toast by default)
    errorService.handleValidationError('Email is required', 'email');
  };

  const handleRuntimeError = () => {
    // Simulate a runtime error
    errorService.handleError(new Error('Unexpected runtime error'), {
      severity: 'high',
      context: { component: 'ToastExample' },
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h2>Toast Notification Examples</h2>
      <p>Click the buttons below to see different types of toast notifications:</p>
      
      <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <button onClick={handleSuccessToast} style={{ padding: '10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px' }}>
          Show Success Toast
        </button>
        
        <button onClick={handleErrorToast} style={{ padding: '10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px' }}>
          Show Error Toast
        </button>
        
        <button onClick={handleWarningToast} style={{ padding: '10px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px' }}>
          Show Warning Toast
        </button>
        
        <button onClick={handleInfoToast} style={{ padding: '10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px' }}>
          Show Info Toast
        </button>
        
        <button onClick={handleApiError} style={{ padding: '10px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '4px' }}>
          Simulate API Error
        </button>
        
        <button onClick={handleNetworkError} style={{ padding: '10px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '4px' }}>
          Simulate Network Error
        </button>
        
        <button onClick={handleValidationError} style={{ padding: '10px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '4px' }}>
          Simulate Validation Error
        </button>
        
        <button onClick={handleRuntimeError} style={{ padding: '10px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '4px' }}>
          Simulate Runtime Error
        </button>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
        <h3>Toast System Features:</h3>
        <ul>
          <li>✅ Different toast types (success, error, warning, info)</li>
          <li>✅ Automatic dismissal with configurable duration</li>
          <li>✅ Manual dismissal with close button</li>
          <li>✅ Keyboard accessibility (ESC to close)</li>
          <li>✅ ARIA labels for screen readers</li>
          <li>✅ Responsive design</li>
          <li>✅ Dark mode support</li>
          <li>✅ Integration with error service</li>
          <li>✅ Smooth animations</li>
          <li>✅ Positioning options</li>
        </ul>
      </div>
    </div>
  );
};