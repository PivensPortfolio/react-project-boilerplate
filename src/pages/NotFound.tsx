import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import styles from './ErrorPages.module.css';

const NotFound: React.FC = () => {
  const location = useLocation();

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className={styles.errorPage}>
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>
          <span className={styles.errorNumber}>404</span>
        </div>
        
        <h1 className={styles.errorTitle}>Page Not Found</h1>
        
        <p className={styles.errorMessage}>
          Sorry, we couldn't find the page you're looking for.
        </p>
        
        <p className={styles.errorPath}>
          Requested path: <code>{location.pathname}</code>
        </p>
        
        <div className={styles.errorActions}>
          <Button onClick={handleGoBack} variant="secondary">
            Go Back
          </Button>
          <Link to="/">
            <Button variant="primary">
              Go to Home
            </Button>
          </Link>
        </div>
        
        <div className={styles.helpSection}>
          <h3>What can you do?</h3>
          <ul>
            <li>Check the URL for typos</li>
            <li>Use the navigation menu to find what you're looking for</li>
            <li>Go back to the previous page</li>
            <li>Visit our <Link to="/">homepage</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotFound;