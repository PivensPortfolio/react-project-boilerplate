/**
 * Authentication Service
 * Handles user authentication, login, logout, and token management
 */

import { httpClient } from './httpClient';
import { tokenManager } from '../utils/tokenManager';
import { 
  LoginRequest, 
  LoginResponse, 
  RefreshTokenRequest, 
  User
} from './types';

class AuthService {
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize auth service with token refresh handling
   */
  private initialize(): void {
    if (this.isInitialized) {
      return;
    }

    // Listen for token refresh events
    window.addEventListener('auth:token-refresh-needed', this.handleTokenRefresh.bind(this));
    
    // Initialize existing token if valid
    const existingToken = tokenManager.getAccessToken();
    if (existingToken && tokenManager.isTokenValid()) {
      httpClient.setAuthToken(existingToken);
    } else if (existingToken) {
      // Token exists but is invalid, try to refresh
      this.handleTokenRefresh();
    }

    this.isInitialized = true;
  }

  /**
   * Handle automatic token refresh
   */
  private async handleTokenRefresh(): Promise<void> {
    try {
      // Prevent multiple simultaneous refresh attempts
      if (tokenManager.isRefreshInProgress()) {
        await tokenManager.getRefreshPromise();
        return;
      }

      const refreshPromise = this.refreshToken().then(response => response.token);
      tokenManager.setRefreshPromise(refreshPromise);
      
      await refreshPromise;
    } catch (error) {
      console.error('❌ Automatic token refresh failed:', error);
      // Force logout on refresh failure
      await this.logout();
    }
  }

  /**
   * Login user with email and password
   */
  public async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await httpClient.post<LoginResponse>('/auth/login', credentials);
    
    if (response.success && response.data.token) {
      // Store tokens using token manager
      tokenManager.setAccessToken(response.data.token);
      tokenManager.setRefreshToken(response.data.refreshToken);
      
      // Set token in HTTP client
      httpClient.setAuthToken(response.data.token);
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Dispatch login event
      window.dispatchEvent(new CustomEvent('auth:login', { 
        detail: { user: response.data.user } 
      }));
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
      // Clear tokens using token manager
      tokenManager.clearTokens();
      httpClient.clearAuthToken();
      
      // Clear user data
      localStorage.removeItem('user');
      
      // Dispatch logout event
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
  }

  /**
   * Refresh authentication token
   */
  public async refreshToken(): Promise<LoginResponse> {
    const refreshToken = tokenManager.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const request: RefreshTokenRequest = { refreshToken };
    const response = await httpClient.post<LoginResponse>('/auth/refresh', request, {
      skipErrorHandling: false, // We want to handle refresh errors
    });
    
    if (response.success && response.data.token) {
      // Update tokens using token manager
      tokenManager.setAccessToken(response.data.token);
      
      // Update refresh token if provided
      if (response.data.refreshToken) {
        tokenManager.setRefreshToken(response.data.refreshToken);
      }
      
      // Update HTTP client token
      httpClient.setAuthToken(response.data.token);
      
      // Update user data
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Dispatch token refresh event
      window.dispatchEvent(new CustomEvent('auth:token-refreshed', {
        detail: { user: response.data.user }
      }));
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
      // Store tokens using token manager
      tokenManager.setAccessToken(response.data.token);
      tokenManager.setRefreshToken(response.data.refreshToken);
      
      // Set token in HTTP client
      httpClient.setAuthToken(response.data.token);
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Dispatch registration event
      window.dispatchEvent(new CustomEvent('auth:register', {
        detail: { user: response.data.user }
      }));
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
    return tokenManager.isTokenValid();
  }

  /**
   * Get stored user data
   */
  public getStoredUser(): User | null {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Get current user from token (more reliable than localStorage)
   */
  public getCurrentUserFromToken(): User | null {
    const tokenPayload = tokenManager.getCurrentUserFromToken();
    if (!tokenPayload) {
      return null;
    }

    // Convert token payload to User object
    return {
      id: tokenPayload.sub,
      email: tokenPayload.email,
      role: tokenPayload.role as 'admin' | 'user' | 'moderator',
      name: '', // Will be filled from stored user data or API call
      avatar: undefined,
      isActive: true,
      emailVerified: true,
      createdAt: '',
      updatedAt: '',
    };
  }

  /**
   * Check if current user has specific role
   */
  public hasRole(role: string): boolean {
    const tokenPayload = tokenManager.getCurrentUserFromToken();
    return tokenPayload?.role === role;
  }

  /**
   * Check if current user has any of the specified roles
   */
  public hasAnyRole(roles: string[]): boolean {
    const tokenPayload = tokenManager.getCurrentUserFromToken();
    return tokenPayload ? roles.includes(tokenPayload.role) : false;
  }

  /**
   * Check if current user is admin
   */
  public isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Get current access token
   */
  public getAccessToken(): string | null {
    return tokenManager.getAccessToken();
  }

  /**
   * Check if token needs refresh
   */
  public shouldRefreshToken(): boolean {
    return tokenManager.shouldRefreshToken();
  }

  /**
   * Get token debug information
   */
  public getTokenDebugInfo(): Record<string, any> | null {
    return tokenManager.getTokenDebugInfo();
  }

  /**
   * Force token refresh (for testing or manual refresh)
   */
  public async forceTokenRefresh(): Promise<LoginResponse> {
    return this.refreshToken();
  }
}

// Create and export singleton instance
export const authService = new AuthService();
export default authService;