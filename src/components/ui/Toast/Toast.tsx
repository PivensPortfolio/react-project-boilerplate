import React, { useEffect, useState } from 'react';
import type { Toast as ToastType } from '../../../types/toast';
import './Toast.css';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleRemove();
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.duration]);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300); // Match CSS animation duration
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && toast.dismissible !== false) {
      handleRemove();
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  };

  const getAriaLabel = () => {
    return `${toast.type} notification: ${toast.message}`;
  };

  return (
    <div
      className={`toast toast--${toast.type} ${isVisible ? 'toast--visible' : ''} ${
        isRemoving ? 'toast--removing' : ''
      }`}
      role="alert"
      aria-live="polite"
      aria-label={getAriaLabel()}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      data-testid={`toast-${toast.type}`}
    >
      <div className="toast__icon" aria-hidden="true">
        {getIcon()}
      </div>
      <div className="toast__content">
        <p className="toast__message">{toast.message}</p>
      </div>
      {toast.dismissible !== false && (
        <button
          className="toast__close"
          onClick={handleRemove}
          aria-label="Close notification"
          type="button"
        >
          ✕
        </button>
      )}
    </div>
  );
};