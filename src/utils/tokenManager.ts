/**
 * JWT Token Manager
 * Handles secure token storage, validation, and automatic refresh
 */

import { jwtDecode } from 'jwt-decode';

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: string;
  iat: number; // Issued at
  exp: number; // Expiration time
  aud?: string; // Audience
  iss?: string; // Issuer
}

export interface TokenInfo {
  token: string;
  payload: JwtPayload;
  expiresAt: Date;
  isExpired: boolean;
  timeUntilExpiry: number; // milliseconds
}

class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'auth_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static readonly TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes in ms
  
  private refreshTimer: NodeJS.Timeout | null = null;
  private refreshPromise: Promise<string> | null = null;

  /**
   * Store access token securely
   */
  public setAccessToken(token: string): void {
    if (!token) {
      throw new Error('Token cannot be empty');
    }

    // Validate token format
    if (!this.validateTokenFormat(token)) {
      console.error('❌ Failed to store access token: Invalid token format');
      throw new Error('Invalid token format');
    }
    
    try {
      // Store in localStorage (consider httpOnly cookies for production)
      localStorage.setItem(TokenManager.ACCESS_TOKEN_KEY, token);
      
      // Schedule automatic refresh
      this.scheduleTokenRefresh(token);
      
      console.log('✅ Access token stored successfully');
    } catch (error) {
      console.error('❌ Failed to store access token:', error);
      throw new Error('Failed to store token');
    }
  }

  /**
   * Get stored access token
   */
  public getAccessToken(): string | null {
    return localStorage.getItem(TokenManager.ACCESS_TOKEN_KEY);
  }

  /**
   * Store refresh token securely
   */
  public setRefreshToken(token: string): void {
    if (!token) {
      throw new Error('Refresh token cannot be empty');
    }

    localStorage.setItem(TokenManager.REFRESH_TOKEN_KEY, token);
    console.log('✅ Refresh token stored successfully');
  }

  /**
   * Get stored refresh token
   */
  public getRefreshToken(): string | null {
    return localStorage.getItem(TokenManager.REFRESH_TOKEN_KEY);
  }

  /**
   * Clear all stored tokens
   */
  public clearTokens(): void {
    localStorage.removeItem(TokenManager.ACCESS_TOKEN_KEY);
    localStorage.removeItem(TokenManager.REFRESH_TOKEN_KEY);
    
    // Clear refresh timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    
    // Clear any pending refresh promise
    this.refreshPromise = null;
    
    console.log('✅ All tokens cleared');
  }

  /**
   * Validate token format (basic JWT structure check)
   */
  public validateTokenFormat(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }

    // JWT should have 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    try {
      // Try to decode the payload
      jwtDecode(token);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Parse JWT token and extract information
   */
  public parseToken(token: string): TokenInfo | null {
    try {
      if (!this.validateTokenFormat(token)) {
        return null;
      }

      const payload = jwtDecode<JwtPayload>(token);
      const expiresAt = new Date(payload.exp * 1000);
      const now = new Date();
      const isExpired = expiresAt <= now;
      const timeUntilExpiry = expiresAt.getTime() - now.getTime();

      return {
        token,
        payload,
        expiresAt,
        isExpired,
        timeUntilExpiry,
      };
    } catch (error) {
      console.error('❌ Failed to parse token:', error);
      return null;
    }
  }

  /**
   * Check if current access token is valid and not expired
   */
  public isTokenValid(): boolean {
    const token = this.getAccessToken();
    if (!token) {
      return false;
    }

    const tokenInfo = this.parseToken(token);
    return tokenInfo ? !tokenInfo.isExpired : false;
  }

  /**
   * Check if token needs refresh (within threshold of expiry)
   */
  public shouldRefreshToken(): boolean {
    const token = this.getAccessToken();
    if (!token) {
      return false;
    }

    const tokenInfo = this.parseToken(token);
    if (!tokenInfo) {
      return false;
    }

    // Refresh if token expires within the threshold
    return tokenInfo.timeUntilExpiry <= TokenManager.TOKEN_REFRESH_THRESHOLD;
  }

  /**
   * Get user information from current token
   */
  public getCurrentUserFromToken(): JwtPayload | null {
    const token = this.getAccessToken();
    if (!token) {
      return null;
    }

    const tokenInfo = this.parseToken(token);
    return tokenInfo?.payload || null;
  }

  /**
   * Schedule automatic token refresh
   */
  private scheduleTokenRefresh(token: string): void {
    // Clear existing timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    const tokenInfo = this.parseToken(token);
    if (!tokenInfo) {
      return;
    }

    // Schedule refresh before token expires
    const refreshTime = Math.max(
      tokenInfo.timeUntilExpiry - TokenManager.TOKEN_REFRESH_THRESHOLD,
      0
    );

    this.refreshTimer = setTimeout(() => {
      this.triggerTokenRefresh();
    }, refreshTime);

    console.log(`🔄 Token refresh scheduled in ${Math.round(refreshTime / 1000)} seconds`);
  }

  /**
   * Trigger token refresh (to be called by auth service)
   */
  private triggerTokenRefresh(): void {
    // Dispatch custom event for auth service to handle
    window.dispatchEvent(new CustomEvent('auth:token-refresh-needed'));
  }

  /**
   * Set refresh promise to prevent multiple simultaneous refresh attempts
   */
  public setRefreshPromise(promise: Promise<string>): void {
    this.refreshPromise = promise;
    
    // Clear promise when resolved/rejected
    promise.finally(() => {
      this.refreshPromise = null;
    });
  }

  /**
   * Get current refresh promise if one exists
   */
  public getRefreshPromise(): Promise<string> | null {
    return this.refreshPromise;
  }

  /**
   * Check if a refresh is currently in progress
   */
  public isRefreshInProgress(): boolean {
    return this.refreshPromise !== null;
  }

  /**
   * Get token expiration info for debugging
   */
  public getTokenDebugInfo(): Record<string, any> | null {
    const token = this.getAccessToken();
    if (!token) {
      return null;
    }

    const tokenInfo = this.parseToken(token);
    if (!tokenInfo) {
      return null;
    }

    return {
      isValid: !tokenInfo.isExpired,
      expiresAt: tokenInfo.expiresAt.toISOString(),
      timeUntilExpiry: `${Math.round(tokenInfo.timeUntilExpiry / 1000)}s`,
      shouldRefresh: this.shouldRefreshToken(),
      userInfo: {
        id: tokenInfo.payload.sub,
        email: tokenInfo.payload.email,
        role: tokenInfo.payload.role,
      },
    };
  }
}

// Create and export singleton instance
export const tokenManager = new TokenManager();
export default tokenManager;