/**
 * API Service Types
 * Type definitions for API requests, responses, and data models
 */

/**
 * Generic API Response wrapper
 */
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message: string;
  timestamp: string;
}

/**
 * API Error structure
 */
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, any>;
}

/**
 * Request configuration options
 */
export interface RequestConfig {
  retries?: number;
  retryDelay?: number;
  skipErrorHandling?: boolean;
  timeout?: number;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

/**
 * User data model
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  avatar?: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create user request
 */
export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'user' | 'moderator';
}

/**
 * Update user request
 */
export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: 'admin' | 'user' | 'moderator';
  isActive?: boolean;
}

/**
 * Login request
 */
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Login response
 */
export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Refresh token request
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * File upload progress callback
 */
export type UploadProgressCallback = (progress: number) => void;

/**
 * Common filter parameters
 */
export interface FilterParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
  [key: string]: any;
}

/**
 * Bulk operation request
 */
export interface BulkOperationRequest<T = any> {
  ids: string[];
  data?: T;
}

/**
 * Bulk operation response
 */
export interface BulkOperationResponse {
  success: number;
  failed: number;
  errors: string[];
}