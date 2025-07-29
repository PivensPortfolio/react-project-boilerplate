/**
 * Error Service
 * Centralized error handling, logging, and reporting
 */

import { ApiError } from './types';

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

    // Show toast notification if enabled
    if (options.showToast) {
      this.showErrorToast(errorReport);
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
   * Show error toast notification
   */
  private showErrorToast(errorReport: ErrorReport): void {
    // Create a simple toast notification
    // In a real app, you might use a toast library like react-hot-toast
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f56565;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      max-width: 400px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      line-height: 1.4;
    `;
    
    const userFriendlyMessage = this.getUserFriendlyMessage(errorReport);
    toast.textContent = userFriendlyMessage;
    
    document.body.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 5000);
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
}

// Create and export singleton instance
export const errorService = new ErrorService();

export default errorService;