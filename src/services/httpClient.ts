/**
 * HTTP Client Service
 * Centralized HTTP client with Axios, interceptors, and error handling
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse, ApiError, RequestConfig } from './types';
import { errorService } from './errorService';
import { tokenManager } from '../utils/tokenManager';

// Environment configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const DEFAULT_TIMEOUT = 10000;

class HttpClient {
  private client: AxiosInstance;
  private authToken: string | null = null;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: DEFAULT_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Set up request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        // Get current token from token manager
        const currentToken = tokenManager.getAccessToken();
        
        // Check if token needs refresh before making request
        if (currentToken && tokenManager.shouldRefreshToken() && !config.url?.includes('/auth/refresh')) {
          try {
            await this.handleTokenRefresh();
          } catch (error) {
            console.warn('Token refresh failed, proceeding with current token:', error);
          }
        }

        // Add auth token if available and not explicitly skipped
        const token = this.authToken || tokenManager.getAccessToken();
        if (token && !config.headers.skipAuth) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request timestamp for debugging
        (config as any).metadata = { startTime: Date.now() };

        console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
          params: config.params,
          data: config.data,
          hasAuth: !!config.headers.Authorization,
        });

        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        const duration = Date.now() - (response.config as any).metadata?.startTime;
        console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`, {
          status: response.status,
          data: response.data,
        });

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any;
        const duration = originalRequest?.metadata?.startTime 
          ? Date.now() - originalRequest.metadata.startTime 
          : 0;

        console.error(`❌ ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url} (${duration}ms)`, {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
        });

        // Handle 401 errors with token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (originalRequest.url?.includes('/auth/refresh')) {
            // Refresh token itself failed, force logout
            this.handleUnauthorized();
            return Promise.reject(error);
          }

          originalRequest._retry = true;

          try {
            const newToken = await this.handleTokenRefresh();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.handleUnauthorized();
            return Promise.reject(refreshError);
          }
        }

        // Transform error to our standard format
        const apiError: ApiError = {
          message: this.getErrorMessage(error),
          status: error.response?.status || 0,
          code: error.code,
          details: error.response?.data as Record<string, any>,
        };

        // Report to error service (skip for auth refresh failures)
        if (!originalRequest.url?.includes('/auth/refresh')) {
          errorService.handleApiError(apiError, {
            showToast: true,
            context: {
              url: error.config?.url,
              method: error.config?.method,
            },
          });
        }

        return Promise.reject(apiError);
      }
    );
  }

  /**
   * Extract meaningful error message from axios error
   */
  private getErrorMessage(error: AxiosError): string {
    if (error.response?.data && typeof error.response.data === 'object') {
      const data = error.response.data as any;
      return data.message || data.error || 'An error occurred';
    }

    if (error.message) {
      return error.message;
    }

    return 'Network error occurred';
  }

  /**
   * Handle token refresh with queue management
   */
  private async handleTokenRefresh(): Promise<string> {
    if (this.isRefreshing) {
      // If already refreshing, wait for the current refresh to complete
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      // Trigger token refresh event for auth service to handle
      const refreshPromise = new Promise<string>((resolve, reject) => {
        const handleRefresh = (event: CustomEvent) => {
          window.removeEventListener('auth:token-refreshed', handleRefresh as EventListener);
          const newToken = tokenManager.getAccessToken();
          if (newToken) {
            resolve(newToken);
          } else {
            reject(new Error('Token refresh failed'));
          }
        };

        const handleLogout = () => {
          window.removeEventListener('auth:logout', handleLogout);
          window.removeEventListener('auth:token-refreshed', handleRefresh as EventListener);
          reject(new Error('User logged out during refresh'));
        };

        window.addEventListener('auth:token-refreshed', handleRefresh as EventListener);
        window.addEventListener('auth:logout', handleLogout);

        // Trigger refresh
        window.dispatchEvent(new CustomEvent('auth:token-refresh-needed'));
      });

      const newToken = await refreshPromise;
      this.authToken = newToken;

      // Process failed queue
      this.failedQueue.forEach(({ resolve }) => resolve(newToken));
      this.failedQueue = [];

      return newToken;
    } catch (error) {
      // Process failed queue with error
      this.failedQueue.forEach(({ reject }) => reject(error));
      this.failedQueue = [];
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Handle unauthorized responses (401)
   */
  private handleUnauthorized(): void {
    this.clearAuthToken();
    tokenManager.clearTokens();
    // Dispatch logout event or redirect to login
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }

  /**
   * Set authentication token
   */
  public setAuthToken(token: string): void {
    this.authToken = token;
    localStorage.setItem('auth_token', token);
  }

  /**
   * Clear authentication token
   */
  public clearAuthToken(): void {
    this.authToken = null;
    localStorage.removeItem('auth_token');
  }

  /**
   * Initialize auth token from token manager
   */
  public initializeAuth(): void {
    const token = tokenManager.getAccessToken();
    if (token && tokenManager.isTokenValid()) {
      this.authToken = token;
    } else if (token) {
      // Token exists but is invalid, clear it
      tokenManager.clearTokens();
    }
  }

  /**
   * Generic request method with retry logic
   */
  private async makeRequest<T>(
    config: AxiosRequestConfig,
    options: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const { retries = 0, retryDelay = 1000, skipErrorHandling = false } = options;

    let lastError: ApiError | undefined;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.client.request<ApiResponse<T>>(config);
        return response.data;
      } catch (error) {
        lastError = error as ApiError;

        // Don't retry on client errors (4xx) except 408, 429
        if (
          lastError.status >= 400 && 
          lastError.status < 500 && 
          lastError.status !== 408 && 
          lastError.status !== 429
        ) {
          break;
        }

        // Wait before retry
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        }
      }
    }

    if (!skipErrorHandling && lastError) {
      // Additional error handling for retry failures
      errorService.handleError(new Error(`API request failed after ${retries} retries: ${lastError.message}`), {
        severity: 'high',
        showToast: false, // Already shown in interceptor
        context: {
          retries,
          originalError: lastError,
        },
      });
    }

    throw lastError || new Error('Unknown error occurred');
  }

  /**
   * GET request
   */
  public async get<T>(url: string, params?: any, options?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({ method: 'GET', url, params }, options);
  }

  /**
   * POST request
   */
  public async post<T>(url: string, data?: any, options?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({ method: 'POST', url, data }, options);
  }

  /**
   * PUT request
   */
  public async put<T>(url: string, data?: any, options?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({ method: 'PUT', url, data }, options);
  }

  /**
   * PATCH request
   */
  public async patch<T>(url: string, data?: any, options?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({ method: 'PATCH', url, data }, options);
  }

  /**
   * DELETE request
   */
  public async delete<T>(url: string, options?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({ method: 'DELETE', url }, options);
  }

  /**
   * Upload file
   */
  public async upload<T>(
    url: string, 
    file: File, 
    onProgress?: (progress: number) => void,
    options?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.makeRequest<T>({
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    }, options);
  }
}

// Create and export singleton instance
export const httpClient = new HttpClient();

// Initialize auth on app start
httpClient.initializeAuth();

export default httpClient;