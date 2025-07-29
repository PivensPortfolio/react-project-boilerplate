/**
 * HTTP Client Service
 * Centralized HTTP client with Axios, interceptors, and error handling
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse, ApiError, RequestConfig } from './types';
import { errorService } from './errorService';

// Environment configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const DEFAULT_TIMEOUT = 10000;

class HttpClient {
  private client: AxiosInstance;
  private authToken: string | null = null;

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
      (config) => {
        // Add auth token if available
        if (this.authToken && !config.headers.skipAuth) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }

        // Add request timestamp for debugging
        (config as any).metadata = { startTime: Date.now() };

        console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
          params: config.params,
          data: config.data,
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
        const duration = (error.config as any)?.metadata?.startTime 
          ? Date.now() - (error.config as any).metadata.startTime 
          : 0;

        console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} (${duration}ms)`, {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
        });

        // Handle specific error cases
        if (error.response?.status === 401) {
          this.handleUnauthorized();
        }

        // Transform error to our standard format
        const apiError: ApiError = {
          message: this.getErrorMessage(error),
          status: error.response?.status || 0,
          code: error.code,
          details: error.response?.data as Record<string, any>,
        };

        // Report to error service
        errorService.handleApiError(apiError, {
          showToast: true,
          context: {
            url: error.config?.url,
            method: error.config?.method,
          },
        });

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
   * Handle unauthorized responses (401)
   */
  private handleUnauthorized(): void {
    this.clearAuthToken();
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
   * Initialize auth token from localStorage
   */
  public initializeAuth(): void {
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.authToken = token;
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