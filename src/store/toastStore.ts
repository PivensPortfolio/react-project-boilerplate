import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Toast } from '../types/toast';

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const generateId = (): string => {
  return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const storeImplementation = (set: any) => ({
  toasts: [],

  addToast: (toast: Omit<Toast, 'id'>) => {
    const newToast: Toast = {
      id: generateId(),
      duration: 5000, // Default 5 seconds
      dismissible: true, // Default dismissible
      ...toast,
    };

    set(
      (state: ToastStore) => ({
        toasts: [...state.toasts, newToast],
      }),
      false,
      'addToast'
    );
  },

  removeToast: (id: string) => {
    set(
      (state: ToastStore) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id),
      }),
      false,
      'removeToast'
    );
  },

  clearToasts: () => {
    set({ toasts: [] }, false, 'clearToasts');
  },
});

// Conditionally apply devtools middleware only in non-test environments
const isTestEnvironment = 
  typeof process !== 'undefined' && process.env.NODE_ENV === 'test' ||
  typeof globalThis !== 'undefined' && (globalThis as any).__vitest__;

export const useToastStore = create<ToastStore>()(
  isTestEnvironment
    ? storeImplementation
    : devtools(storeImplementation, {
        name: 'ToastStore',
      })
);