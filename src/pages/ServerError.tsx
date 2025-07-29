import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import styles from './ErrorPages.module.css';

interface ServerErrorProps {
  error?: Error;
  resetError?: () => void;
}

const ServerError: React.FC<ServerErrorProps> = ({ error, resetError }) => {
  const handleReload = () => {
    window.location.reload();
  };

  const handleRetry = () => {
    if (resetError) {
      resetError();
    } else {
      handleReload();
    }
  };

  return (
    <div className={styles.errorPage}>
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>
          <span className={styles.errorNumber}>500</span>
        </div>
        
        <h1 className={styles.errorTitle}>Server Error</h1>
        
        <p className={styles.errorMessage}>
          Something went wrong on our end. We're working to fix it.
        </p>
        
        {error && process.env.NODE_ENV === 'development' && (
          <details className={styles.errorDetails}>
            <summary>Error Details (Development Only)</summary>
            <div className={styles.errorStack}>
              <p><strong>Message:</strong> {error.message}</p>
              {error.stack && (
                <pre>{error.stack}</pre>
              )}
            </div>
          </details>
        )}
        
        <div className={styles.errorActions}>
          <Button onClick={handleRetry} variant="primary">
            Try Again
          </Button>
          <Button onClick={handleReload} variant="secondary">
            Reload Page
          </Button>
          <Link to="/">
            <Button variant="outline">
              Go to Home
            </Button>
          </Link>
        </div>
        
        <div className={styles.helpSection}>
          <h3>What happened?</h3>
          <ul>
            <li>There might be a temporary server issue</li>
            <li>The service might be under maintenance</li>
            <li>Your request might have timed out</li>
          </ul>
          
          <p>
            If the problem persists, please try again later or contact support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServerError;