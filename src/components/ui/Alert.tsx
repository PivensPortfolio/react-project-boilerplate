import React from 'react';
import styles from './Alert.module.css';

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  closable?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

const defaultIcons = {
  info: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  ),
  success: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22,4 12,14.01 9,11.01"></polyline>
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="15" y1="9" x2="9" y2="15"></line>
      <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>
  ),
};

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  size = 'medium',
  title,
  children,
  onClose,
  closable = false,
  icon,
  className = '',
}) => {
  const alertClasses = [
    styles.alert,
    styles[variant],
    styles[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const displayIcon = icon !== undefined ? icon : defaultIcons[variant];

  return (
    <div className={alertClasses} role="alert">
      <div className={styles.content}>
        {displayIcon && (
          <div className={styles.icon} aria-hidden="true">
            {displayIcon}
          </div>
        )}
        
        <div className={styles.message}>
          {title && (
            <div className={styles.title}>
              {title}
            </div>
          )}
          <div className={styles.description}>
            {children}
          </div>
        </div>
      </div>

      {(closable || onClose) && (
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close alert"
          type="button"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
    </div>
  );
};

Alert.displayName = 'Alert';