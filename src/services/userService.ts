/**
 * User Service
 * Handles user-related API operations (CRUD operations for users)
 */

import { httpClient } from './httpClient';
import { 
  User, 
  CreateUserRequest, 
  UpdateUserRequest, 
  PaginatedResponse
} from './types';

class UserService {
  /**
   * Get all users with pagination
   */
  public async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<User>> {
    const response = await httpClient.get<User[]>('/users', params);
    return response as PaginatedResponse<User>;
  }

  /**
   * Get user by ID
   */
  public async getUserById(id: string): Promise<User> {
    const response = await httpClient.get<User>(`/users/${id}`);
    return response.data;
  }

  /**
   * Create new user
   */
  public async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await httpClient.post<User>('/users', userData);
    return response.data;
  }

  /**
   * Update existing user
   */
  public async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    const response = await httpClient.put<User>(`/users/${id}`, userData);
    return response.data;
  }

  /**
   * Partially update user
   */
  public async patchUser(id: string, userData: Partial<UpdateUserRequest>): Promise<User> {
    const response = await httpClient.patch<User>(`/users/${id}`, userData);
    return response.data;
  }

  /**
   * Delete user
   */
  public async deleteUser(id: string): Promise<void> {
    await httpClient.delete(`/users/${id}`);
  }

  /**
   * Search users by query
   */
  public async searchUsers(query: string, filters?: {
    role?: string;
    limit?: number;
  }): Promise<User[]> {
    const params = { search: query, ...filters };
    const response = await httpClient.get<User[]>('/users/search', params);
    return response.data;
  }

  /**
   * Get users by role
   */
  public async getUsersByRole(role: string): Promise<User[]> {
    const response = await httpClient.get<User[]>(`/users/role/${role}`);
    return response.data;
  }

  /**
   * Update user avatar
   */
  public async updateUserAvatar(
    id: string, 
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<User> {
    const response = await httpClient.upload<User>(`/users/${id}/avatar`, file, onProgress);
    return response.data;
  }

  /**
   * Activate user account
   */
  public async activateUser(id: string): Promise<User> {
    const response = await httpClient.post<User>(`/users/${id}/activate`);
    return response.data;
  }

  /**
   * Deactivate user account
   */
  public async deactivateUser(id: string): Promise<User> {
    const response = await httpClient.post<User>(`/users/${id}/deactivate`);
    return response.data;
  }

  /**
   * Get user statistics
   */
  public async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: Record<string, number>;
  }> {
    const response = await httpClient.get<any>('/users/stats');
    return response.data;
  }

  /**
   * Bulk update users
   */
  public async bulkUpdateUsers(
    userIds: string[], 
    updates: Partial<UpdateUserRequest>
  ): Promise<User[]> {
    const response = await httpClient.post<User[]>('/users/bulk-update', {
      userIds,
      updates,
    });
    return response.data;
  }

  /**
   * Bulk delete users
   */
  public async bulkDeleteUsers(userIds: string[]): Promise<void> {
    await httpClient.post('/users/bulk-delete', { userIds });
  }

  /**
   * Export users to CSV
   */
  public async exportUsers(filters?: {
    role?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Blob> {
    const response = await httpClient.get('/users/export', filters);
    return new Blob([response.data as string], { type: 'text/csv' });
  }

  /**
   * Import users from CSV
   */
  public async importUsers(
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<{
    imported: number;
    failed: number;
    errors: string[];
  }> {
    const response = await httpClient.upload<any>('/users/import', file, onProgress);
    return response.data;
  }
}

// Create and export singleton instance
export const userService = new UserService();
export default userService;