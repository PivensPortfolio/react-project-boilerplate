/**
 * Generic API Service
 * Base service class with common CRUD operations that can be extended
 */

import { httpClient } from './httpClient';
import { PaginatedResponse, RequestConfig } from './types';

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any; // Allow additional parameters
}

/**
 * Generic API Service class
 * Can be extended for specific entity services
 */
export class ApiService<T extends BaseEntity, CreateT = Omit<T, keyof BaseEntity>, UpdateT = Partial<CreateT>> {
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  /**
   * Get all entities with pagination
   */
  public async getAll(params?: PaginationParams, options?: RequestConfig): Promise<PaginatedResponse<T>> {
    const response = await httpClient.get<T[]>(this.endpoint, params, options);
    return response as PaginatedResponse<T>;
  }

  /**
   * Get entity by ID
   */
  public async getById(id: string, options?: RequestConfig): Promise<T> {
    const response = await httpClient.get<T>(`${this.endpoint}/${id}`, undefined, options);
    return response.data;
  }

  /**
   * Create new entity
   */
  public async create(data: CreateT, options?: RequestConfig): Promise<T> {
    const response = await httpClient.post<T>(this.endpoint, data, options);
    return response.data;
  }

  /**
   * Update existing entity
   */
  public async update(id: string, data: UpdateT, options?: RequestConfig): Promise<T> {
    const response = await httpClient.put<T>(`${this.endpoint}/${id}`, data, options);
    return response.data;
  }

  /**
   * Partially update entity
   */
  public async patch(id: string, data: Partial<UpdateT>, options?: RequestConfig): Promise<T> {
    const response = await httpClient.patch<T>(`${this.endpoint}/${id}`, data, options);
    return response.data;
  }

  /**
   * Delete entity
   */
  public async delete(id: string, options?: RequestConfig): Promise<void> {
    await httpClient.delete(`${this.endpoint}/${id}`, options);
  }

  /**
   * Search entities
   */
  public async search(query: string, filters?: Record<string, any>, options?: RequestConfig): Promise<T[]> {
    const params = { search: query, ...filters };
    const response = await httpClient.get<T[]>(`${this.endpoint}/search`, params, options);
    return response.data;
  }

  /**
   * Bulk create entities
   */
  public async bulkCreate(data: CreateT[], options?: RequestConfig): Promise<T[]> {
    const response = await httpClient.post<T[]>(`${this.endpoint}/bulk`, data, options);
    return response.data;
  }

  /**
   * Bulk update entities
   */
  public async bulkUpdate(
    ids: string[], 
    updates: Partial<UpdateT>, 
    options?: RequestConfig
  ): Promise<T[]> {
    const response = await httpClient.post<T[]>(`${this.endpoint}/bulk-update`, {
      ids,
      updates,
    }, options);
    return response.data;
  }

  /**
   * Bulk delete entities
   */
  public async bulkDelete(ids: string[], options?: RequestConfig): Promise<void> {
    await httpClient.post(`${this.endpoint}/bulk-delete`, { ids }, options);
  }

  /**
   * Get entity count
   */
  public async count(filters?: Record<string, any>, options?: RequestConfig): Promise<number> {
    const response = await httpClient.get<{ count: number }>(`${this.endpoint}/count`, filters, options);
    return response.data.count;
  }

  /**
   * Check if entity exists
   */
  public async exists(id: string, options?: RequestConfig): Promise<boolean> {
    try {
      await httpClient.get(`${this.endpoint}/${id}/exists`, undefined, options);
      return true;
    } catch (error: any) {
      if (error.status === 404) {
        return false;
      }
      throw error;
    }
  }
}

/**
 * Example usage: Create a specific service by extending ApiService
 */

// Example: Posts service
export interface Post extends BaseEntity {
  title: string;
  content: string;
  authorId: string;
  published: boolean;
  tags: string[];
}

export interface CreatePostRequest {
  title: string;
  content: string;
  published?: boolean;
  tags?: string[];
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  published?: boolean;
  tags?: string[];
}

class PostService extends ApiService<Post, CreatePostRequest, UpdatePostRequest> {
  constructor() {
    super('/posts');
  }

  /**
   * Get published posts only
   */
  public async getPublished(params?: PaginationParams): Promise<PaginatedResponse<Post>> {
    return this.getAll({ ...params, published: true });
  }

  /**
   * Get posts by author
   */
  public async getByAuthor(authorId: string, params?: PaginationParams): Promise<PaginatedResponse<Post>> {
    return this.getAll({ ...params, authorId });
  }

  /**
   * Publish post
   */
  public async publish(id: string): Promise<Post> {
    const response = await httpClient.post<Post>(`${this.endpoint}/${id}/publish`);
    return response.data;
  }

  /**
   * Unpublish post
   */
  public async unpublish(id: string): Promise<Post> {
    const response = await httpClient.post<Post>(`${this.endpoint}/${id}/unpublish`);
    return response.data;
  }

  /**
   * Get posts by tag
   */
  public async getByTag(tag: string, params?: PaginationParams): Promise<PaginatedResponse<Post>> {
    return this.getAll({ ...params, tag });
  }
}

// Export example service instance
export const postService = new PostService();

/**
 * Utility functions for common API operations
 */
export class ApiUtils {
  /**
   * Handle API errors with user-friendly messages
   */
  public static getErrorMessage(error: any): string {
    if (error?.message) {
      return error.message;
    }
    
    if (error?.status) {
      switch (error.status) {
        case 400:
          return 'Invalid request. Please check your input.';
        case 401:
          return 'You are not authorized. Please log in.';
        case 403:
          return 'You do not have permission to perform this action.';
        case 404:
          return 'The requested resource was not found.';
        case 409:
          return 'This resource already exists.';
        case 422:
          return 'The provided data is invalid.';
        case 429:
          return 'Too many requests. Please try again later.';
        case 500:
          return 'Server error. Please try again later.';
        default:
          return 'An unexpected error occurred.';
      }
    }
    
    return 'Network error. Please check your connection.';
  }

  /**
   * Retry function with exponential backoff
   */
  public static async retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * Debounce function for API calls
   */
  public static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => Promise<ReturnType<T>> {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    return (...args: Parameters<T>): Promise<ReturnType<T>> => {
      return new Promise((resolve, reject) => {
        clearTimeout(timeoutId);
        
        timeoutId = setTimeout(async () => {
          try {
            const result = await func(...args);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }, delay);
      });
    };
  }
}

export default ApiService;