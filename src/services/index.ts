/**
 * Services Index
 * Central export point for all API services
 */

// HTTP Client
export { default as httpClient } from './httpClient';

// Services
export { default as authService } from './authService';
export { default as userService } from './userService';
export { default as ApiService, postService, ApiUtils } from './apiService';
export { default as errorService } from './errorService';

// Types
export type {
  ApiResponse,
  ApiError,
  PaginationMeta,
  PaginatedResponse,
  RequestConfig,
  User,
  CreateUserRequest,
  UpdateUserRequest,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
} from './types';

export type {
  BaseEntity,
  PaginationParams,
} from './apiService';

// Re-export everything for convenience
export * from './types';
export * from './httpClient';
export * from './authService';
export * from './userService';
export * from './apiService';
export * from './errorService';