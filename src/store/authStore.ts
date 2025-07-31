/**
 * Authentication Store
 * Zustand store for managing authentication state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../services/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lastActivity: number;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  updateLastActivity: () => void;
  checkAuthStatus: () => boolean;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      lastActivity: Date.now(),

      // Actions
      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
          lastActivity: Date.now(),
        });
      },

      clearAuth: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          lastActivity: Date.now(),
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      updateLastActivity: () => {
        set({ lastActivity: Date.now() });
      },

      checkAuthStatus: () => {
        const { user } = get();
        return !!user;
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        lastActivity: state.lastActivity,
      }),
    }
  )
);

// Auth event listeners for cross-tab synchronization
if (typeof window !== 'undefined') {
  // Listen for auth events from other tabs
  window.addEventListener('storage', (event) => {
    if (event.key === 'auth-store') {
      // Sync auth state across tabs
      const authStore = useAuthStore.getState();
      authStore.checkAuthStatus();
    }
  });

  // Listen for auth service events
  window.addEventListener('auth:login', ((event: CustomEvent) => {
    const { user } = event.detail;
    useAuthStore.getState().setUser(user);
  }) as EventListener);

  window.addEventListener('auth:logout', () => {
    useAuthStore.getState().clearAuth();
  });

  window.addEventListener('auth:token-refreshed', ((event: CustomEvent) => {
    const { user } = event.detail;
    useAuthStore.getState().setUser(user);
  }) as EventListener);

  window.addEventListener('auth:register', ((event: CustomEvent) => {
    const { user } = event.detail;
    useAuthStore.getState().setUser(user);
  }) as EventListener);
}

export default useAuthStore;