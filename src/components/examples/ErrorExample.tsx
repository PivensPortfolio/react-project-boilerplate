import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import styles from './ErrorExample.module.css';

const ErrorExample: React.FC = () => {
  const [errorReports, setErrorReports] = useState<any[]>([]);
  const { 
    handleError, 
    handleApiError, 
    handleNetworkError, 
    handleValidationError,
    getStoredErrors,
    clearStoredErrors 
  } = useErrorHandler();

  const triggerRuntimeError = () => {
    handleError(new Error('This is a test runtime error'), {
      severity: 'medium',
      showToast: true,
      context: { component: 'ErrorExample', action: 'triggerRuntimeError' },
    });
  };

  const triggerApiError = () => {
    handleApiError({
      message: 'Failed to fetch user data',
      status: 404,
      code: 'USER_NOT_FOUND',
      details: { userId: '123' },
    }, {
      showToast: true,
      context: { endpoint: '/api/users/123' },
    });
  };

  const triggerNetworkError = () => {
    handleNetworkError(new Error('Network connection failed'), {
      showToast: true,
      context: { timeout: 5000 },
    });
  };

  const triggerValidationError = () => {
    handleValidationError('Email address is required', 'email', {
      showToast: true,
      context: { form: 'registration' },
    });
  };

  const triggerReactError = () => {
    // This will be caught by the ErrorBoundary
    throw new Error('This is a React component error for testing ErrorBoundary');
  };

  const loadErrorReports = () => {
    const reports = getStoredErrors();
    setErrorReports(reports);
  };

  const clearAllErrors = () => {
    clearStoredErrors();
    setErrorReports([]);
  };

  return (
    <div className={styles.errorExample}>
      <h2>Error Handling Examples</h2>
      <p>Test different types of error handling and reporting:</p>

      <div className={styles.buttonGrid}>
        <Button onClick={triggerRuntimeError} variant="secondary">
          Trigger Runtime Error
        </Button>
        
        <Button onClick={triggerApiError} variant="secondary">
          Trigger API Error
        </Button>
        
        <Button onClick={triggerNetworkError} variant="secondary">
          Trigger Network Error
        </Button>
        
        <Button onClick={triggerValidationError} variant="secondary">
          Trigger Validation Error
        </Button>
        
        <Button onClick={triggerReactError} variant="danger">
          Trigger React Error (ErrorBoundary)
        </Button>
      </div>

      <div className={styles.errorReports}>
        <div className={styles.reportActions}>
          <Button onClick={loadErrorReports} variant="outline">
            Load Error Reports
          </Button>
          <Button onClick={clearAllErrors} variant="outline">
            Clear All Errors
          </Button>
        </div>

        {errorReports.length > 0 && (
          <div className={styles.reportsList}>
            <h3>Stored Error Reports ({errorReports.length})</h3>
            {errorReports.map((report, index) => (
              <div key={report.id || index} className={styles.reportItem}>
                <div className={styles.reportHeader}>
                  <span className={`${styles.reportType} ${styles[report.type]}`}>
                    {report.type.toUpperCase()}
                  </span>
                  <span className={`${styles.reportSeverity} ${styles[report.severity]}`}>
                    {report.severity.toUpperCase()}
                  </span>
                  <span className={styles.reportTime}>
                    {new Date(report.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className={styles.reportMessage}>
                  {report.message}
                </div>
                {report.context && (
                  <details className={styles.reportContext}>
                    <summary>Context</summary>
                    <pre>{JSON.stringify(report.context, null, 2)}</pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorExample;