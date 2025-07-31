import React from 'react';
import { Toast } from './Toast';
import type { Toast as ToastType } from '../../../types/toast';
import './ToastContainer.css';

interface ToastContainerProps {
  toasts: ToastType[];
  onRemoveToast: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemoveToast,
  position = 'top-right',
}) => {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className={`toast-container toast-container--${position}`}
      aria-live="polite"
      aria-label="Notifications"
      role="region"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemoveToast} />
      ))}
    </div>
  );
};