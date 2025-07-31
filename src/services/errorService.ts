/**
 * Error Service
 * Centralized error handling, logging, and reporting
 */

import { ApiError } from './types';
import { useToastStore } from '../store/toastStore';
import type { ToastType } from '../types/toast';

export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  type: 'api' | 'runtime' | 'network' | 'validation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string;
  context?: Record<string, any>;
}

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  reportToService?: boolean;
  severity?: ErrorReport['severity'];
  context?: Record<string, any>;
  toastDuration?: number;
}

class ErrorService {
  private errorQueue: ErrorReport[] = [];
  private maxQueueSize = 50;
  private isOnline = navigator.onLine;
  private listenersSetup = false;

  constructor() {
    // Only setup listeners in browser environment, not in tests
    if (this.shouldSetupListeners()) {
      this.setupEventListeners();
    }
  }

  private shouldSetupListeners(): boolean {
    // Don't setup in test environment
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
      return false;
    }
    
    // Don't setup in vitest environment
    if (typeof globalThis !== 'undefined' && (globalThis as any).__vitest__) {
      return false;
    }
    
    // Don't setup if window is not available
    if (typeof window === 'undefined') {
      return false;
    }
    
    return true;
  }

  /**
   * Set up global error event listeners
   */
  private setupEventListeners(): void {
    if (this.listenersSetup) return;
    this.listenersSetup = true;

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.handleError(event.reason, {
        severity: 'high',
        context: { type: 'unhandledrejection' },
      });
    });

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      this.handleError(event.error, {
        severity: 'high',
        context: { 
          type: 'global',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Track online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushErrorQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * Clean up event listeners (for testing)
   */
  public cleanup(): void {
    if (typeof window !== 'undefined' && this.listenersSetup) {
      // Note: In a real implementation, you'd store references to the handlers
      // and remove them here. For simplicity, we're just marking as cleaned up.
      this.listenersSetup = false;
    }
  }

  /**
   * Handle API errors specifically
   */
  public handleApiError(error: ApiError, options: ErrorHandlerOptions = {}): void {
    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      message: error.message,
      type: 'api',
      severity: this.getApiErrorSeverity(error.status),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      context: {
        status: error.status,
        code: error.code,
        details: error.details,
        ...options.context,
      },
    };

    this.processError(errorReport, options);
  }

  /**
   * Handle general errors
   */
  public handleError(error: Error | string, options: ErrorHandlerOptions = {}): void {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'object' && error.stack ? error.stack : undefined;

    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      message: errorMessage,
      stack: errorStack,
      type: 'runtime',
      severity: options.severity || 'medium',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      context: options.context,
    };

    this.processError(errorReport, options);
  }

  /**
   * Handle network errors
   */
  public handleNetworkError(error: Error, options: ErrorHandlerOptions = {}): void {
    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      message: error.message,
      stack: error.stack,
      type: 'network',
      severity: 'medium',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      context: {
        isOnline: this.isOnline,
        ...options.context,
      },
    };

    this.processError(errorReport, options);
  }

  /**
   * Handle validation errors
   */
  public handleValidationError(message: string, field?: string, options: ErrorHandlerOptions = {}): void {
    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      message,
      type: 'validation',
      severity: 'low',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      context: {
        field,
        ...options.context,
      },
    };

    this.processError(errorReport, options);
  }

  /**
   * Process error report
   */
  private processError(errorReport: ErrorReport, options: ErrorHandlerOptions): void {
    // Log to console if enabled (default: true)
    if (options.logToConsole !== false) {
      this.logToConsole(errorReport);
    }

    // Show toast notification if enabled (default: true for user-facing errors)
    const shouldShowToast = options.showToast !== false && this.shouldShowToastForError(errorReport);
    if (shouldShowToast) {
      this.showErrorToast(errorReport, options);
    }

    // Store locally for debugging
    this.storeErrorLocally(errorReport);

    // Add to queue for reporting to service
    if (options.reportToService !== false) {
      this.queueForReporting(errorReport);
    }
  }

  /**
   * Log error to console with formatting
   */
  private logToConsole(errorReport: ErrorReport): void {
    const style = this.getConsoleStyle(errorReport.severity);
    console.group(`%c🚨 ${errorReport.type.toUpperCase()} ERROR [${errorReport.severity.toUpperCase()}]`, style);
    console.error('Message:', errorReport.message);
    console.error('ID:', errorReport.id);
    console.error('Timestamp:', errorReport.timestamp);
    
    if (errorReport.stack) {
      console.error('Stack:', errorReport.stack);
    }
    
    if (errorReport.context) {
      console.error('Context:', errorReport.context);
    }
    
    console.groupEnd();
  }

  /**
   * Show error toast notification using toast system
   */
  private showErrorToast(errorReport: ErrorReport, options: ErrorHandlerOptions = {}): void {
    const userFriendlyMessage = this.getUserFriendlyMessage(errorReport);
    const toastType = this.getToastTypeFromError(errorReport);
    const duration = options.toastDuration || this.getDefaultDurationForSeverity(errorReport.severity);
    
    // Use the toast store to add a toast
    const { addToast } = useToastStore.getState();
    addToast({
      message: userFriendlyMessage,
      type: toastType,
      duration,
      dismissible: true,
    });
  }

  /**
   * Store error locally for debugging
   */
  private storeErrorLocally(errorReport: ErrorReport): void {
    try {
      const existingErrors = JSON.parse(localStorage.getItem('error_reports') || '[]');
      existingErrors.push(errorReport);
      
      // Keep only last 20 errors to prevent localStorage bloat
      if (existingErrors.length > 20) {
        existingErrors.splice(0, existingErrors.length - 20);
      }
      
      localStorage.setItem('error_reports', JSON.stringify(existingErrors));
    } catch (e) {
      console.warn('Failed to store error report locally:', e);
    }
  }

  /**
   * Queue error for reporting to external service
   */
  private queueForReporting(errorReport: ErrorReport): void {
    this.errorQueue.push(errorReport);
    
    // Limit queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
    
    // Try to flush queue if online
    if (this.isOnline) {
      this.flushErrorQueue();
    }
  }

  /**
   * Flush error queue to reporting service
   */
  private async flushErrorQueue(): Promise<void> {
    if (this.errorQueue.length === 0 || !this.isOnline) {
      return;
    }

    const errorsToReport = [...this.errorQueue];
    this.errorQueue = [];

    try {
      // In a real application, send to your error reporting service
      // Example: await this.sendToErrorService(errorsToReport);
      console.log('Would send to error reporting service:', errorsToReport);
      
      // For now, just log that we would send these errors
      console.info(`📊 Queued ${errorsToReport.length} error reports for external service`);
    } catch (error) {
      console.warn('Failed to send error reports to service:', error);
      // Re-queue the errors for retry
      this.errorQueue.unshift(...errorsToReport);
    }
  }

  /**
   * Get user-friendly error message
   */
  private getUserFriendlyMessage(errorReport: ErrorReport): string {
    switch (errorReport.type) {
      case 'api':
        if (errorReport.context?.status === 404) {
          return 'The requested resource was not found.';
        }
        if (errorReport.context?.status === 401) {
          return 'You need to log in to access this resource.';
        }
        if (errorReport.context?.status === 403) {
          return 'You don\'t have permission to access this resource.';
        }
        if (errorReport.context?.status >= 500) {
          return 'Server error occurred. Please try again later.';
        }
        return 'A network error occurred. Please check your connection.';
      
      case 'network':
        return 'Network connection error. Please check your internet connection.';
      
      case 'validation':
        return errorReport.message;
      
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Get API error severity based on status code
   */
  private getApiErrorSeverity(status: number): ErrorReport['severity'] {
    if (status >= 500) return 'critical';
    if (status >= 400) return 'medium';
    return 'low';
  }

  /**
   * Get console style for error severity
   */
  private getConsoleStyle(severity: ErrorReport['severity']): string {
    const styles = {
      low: 'color: #3182ce; font-weight: bold;',
      medium: 'color: #d69e2e; font-weight: bold;',
      high: 'color: #e53e3e; font-weight: bold;',
      critical: 'color: #e53e3e; font-weight: bold; background: #fed7d7; padding: 2px 4px;',
    };
    return styles[severity];
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get stored error reports for debugging
   */
  public getStoredErrors(): ErrorReport[] {
    try {
      return JSON.parse(localStorage.getItem('error_reports') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Clear stored error reports
   */
  public clearStoredErrors(): void {
    localStorage.removeItem('error_reports');
  }

  /**
   * Determine if toast should be shown for error type
   */
  private shouldShowToastForError(errorReport: ErrorReport): boolean {
    // Don't show toasts for validation errors (they should be shown inline)
    if (errorReport.type === 'validation') {
      return false;
    }
    
    // Don't show toasts for low severity runtime errors
    if (errorReport.type === 'runtime' && errorReport.severity === 'low') {
      return false;
    }
    
    return true;
  }

  /**
   * Get toast type based on error report
   */
  private getToastTypeFromError(errorReport: ErrorReport): ToastType {
    switch (errorReport.severity) {
      case 'critical':
      case 'high':
        return 'error';
      case 'medium':
        return errorReport.type === 'network' ? 'warning' : 'error';
      case 'low':
        return 'info';
      default:
        return 'error';
    }
  }

  /**
   * Get default toast duration based on error severity
   */
  private getDefaultDurationForSeverity(severity: ErrorReport['severity']): number {
    switch (severity) {
      case 'critical':
        return 10000; // 10 seconds for critical errors
      case 'high':
        return 8000;  // 8 seconds for high severity
      case 'medium':
        return 6000;  // 6 seconds for medium severity
      case 'low':
        return 4000;  // 4 seconds for low severity
      default:
        return 6000;
    }
  }

  /**
   * Show success toast (convenience method)
   */
  public showSuccess(message: string, options: { duration?: number } = {}): void {
    const { addToast } = useToastStore.getState();
    addToast({
      message,
      type: 'success',
      duration: options.duration || 4000,
      dismissible: true,
    });
  }

  /**
   * Show info toast (convenience method)
   */
  public showInfo(message: string, options: { duration?: number } = {}): void {
    const { addToast } = useToastStore.getState();
    addToast({
      message,
      type: 'info',
      duration: options.duration || 5000,
      dismissible: true,
    });
  }

  /**
   * Show warning toast (convenience method)
   */
  public showWarning(message: string, options: { duration?: number } = {}): void {
    const { addToast } = useToastStore.getState();
    addToast({
      message,
      type: 'warning',
      duration: options.duration || 6000,
      dismissible: true,
    });
  }

  /**
   * Show error toast (convenience method)
   */
  public showError(message: string, options: { duration?: number } = {}): void {
    const { addToast } = useToastStore.getState();
    addToast({
      message,
      type: 'error',
      duration: options.duration || 7000,
      dismissible: true,
    });
  }
}

// Create and export singleton instance
export const errorService = new ErrorService();

export default errorService;