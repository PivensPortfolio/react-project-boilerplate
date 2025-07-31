import React, { createContext, useContext } from 'react';
import { ToastContainer } from './ToastContainer';
import { useToast } from '../../../hooks/useToast';
import type { UseToastReturn } from '../../../hooks/useToast';

const ToastContext = createContext<UseToastReturn | null>(null);

interface ToastProviderProps {
  children: React.ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  position = 'top-right' 
}) => {
  const toastMethods = useToast();

  return (
    <ToastContext.Provider value={toastMethods}>
      {children}
      <ToastContainer
        toasts={toastMethods.toasts}
        onRemoveToast={toastMethods.removeToast}
        position={position}
      />
    </ToastContext.Provider>
  );
};

export const useToastContext = (): UseToastReturn => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};