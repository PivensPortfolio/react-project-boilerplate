/**
 * Authentication Service
 * Handles user authentication, login, logout, and token management
 */

import { httpClient } from './httpClient';
import { 
  LoginRequest, 
  LoginResponse, 
  RefreshTokenRequest, 
  User
} from './types';

class AuthService {
  /**
   * Login user with email and password
   */
  public async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await httpClient.post<LoginResponse>('/auth/login', credentials);
    
    if (response.success && response.data.token) {
      // Store auth token
      httpClient.setAuthToken(response.data.token);
      
      // Store refresh token
      localStorage.setItem('refresh_token', response.data.refreshToken);
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  /**
   * Logout current user
   */
  public async logout(): Promise<void> {
    try {
      await httpClient.post('/auth/logout', {}, { skipErrorHandling: true });
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      // Clear local storage
      httpClient.clearAuthToken();
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      // Dispatch logout event
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
  }

  /**
   * Refresh authentication token
   */
  public async refreshToken(): Promise<LoginResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const request: RefreshTokenRequest = { refreshToken };
    const response = await httpClient.post<LoginResponse>('/auth/refresh', request);
    
    if (response.success && response.data.token) {
      // Update auth token
      httpClient.setAuthToken(response.data.token);
      
      // Update refresh token if provided
      if (response.data.refreshToken) {
        localStorage.setItem('refresh_token', response.data.refreshToken);
      }
      
      // Update user data
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  /**
   * Get current user profile
   */
  public async getCurrentUser(): Promise<User> {
    const response = await httpClient.get<User>('/auth/me');
    
    if (response.success) {
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  }

  /**
   * Register new user
   */
  public async register(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<LoginResponse> {
    const response = await httpClient.post<LoginResponse>('/auth/register', userData);
    
    if (response.success && response.data.token) {
      // Store auth token
      httpClient.setAuthToken(response.data.token);
      
      // Store refresh token
      localStorage.setItem('refresh_token', response.data.refreshToken);
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  /**
   * Request password reset
   */
  public async requestPasswordReset(email: string): Promise<void> {
    await httpClient.post('/auth/password-reset', { email });
  }

  /**
   * Reset password with token
   */
  public async resetPassword(token: string, newPassword: string): Promise<void> {
    await httpClient.post('/auth/password-reset/confirm', {
      token,
      password: newPassword,
    });
  }

  /**
   * Change current user's password
   */
  public async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await httpClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  /**
   * Verify email address
   */
  public async verifyEmail(token: string): Promise<void> {
    await httpClient.post('/auth/verify-email', { token });
  }

  /**
   * Resend email verification
   */
  public async resendEmailVerification(): Promise<void> {
    await httpClient.post('/auth/verify-email/resend');
  }

  /**
   * Check if user is authenticated (has valid token)
   */
  public isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    return !!token;
  }

  /**
   * Get stored user data
   */
  public getStoredUser(): User | null {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Check if current user has specific role
   */
  public hasRole(role: string): boolean {
    const user = this.getStoredUser();
    return user?.role === role;
  }

  /**
   * Check if current user is admin
   */
  public isAdmin(): boolean {
    return this.hasRole('admin');
  }
}

// Create and export singleton instance
export const authService = new AuthService();
export default authService;