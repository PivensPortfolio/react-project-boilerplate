import { useCallback } from 'react';
import { useToastStore } from '../store/toastStore';
import type { Toast, ToastOptions, ToastType } from '../types/toast';

export interface UseToastReturn {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, options?: ToastOptions) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
}

export const useToast = (): UseToastReturn => {
  const { toasts, addToast: addToastToStore, removeToast, clearToasts } = useToastStore();

  const addToast = useCallback(
    (message: string, type: ToastType, options?: ToastOptions) => {
      addToastToStore({
        message,
        type,
        ...options,
      });
    },
    [addToastToStore]
  );

  const success = useCallback(
    (message: string, options?: ToastOptions) => {
      addToast(message, 'success', options);
    },
    [addToast]
  );

  const error = useCallback(
    (message: string, options?: ToastOptions) => {
      addToast(message, 'error', {
        duration: 7000, // Errors stay longer by default
        ...options,
      });
    },
    [addToast]
  );

  const warning = useCallback(
    (message: string, options?: ToastOptions) => {
      addToast(message, 'warning', options);
    },
    [addToast]
  );

  const info = useCallback(
    (message: string, options?: ToastOptions) => {
      addToast(message, 'info', options);
    },
    [addToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
  };
};