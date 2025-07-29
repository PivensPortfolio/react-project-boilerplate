import { useAppStore } from './appStore';
import type { User } from './types';

// User-related hooks
export const useUser = () => {
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);
  
  return {
    user,
    setUser,
    isAuthenticated: user !== null,
    isAdmin: user?.role === 'admin',
  };
};

// Theme-related hooks
export const useTheme = () => {
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  
  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };
};

// Loading state hooks
export const useLoading = () => {
  const loading = useAppStore((state) => state.loading);
  const setLoading = useAppStore((state) => state.setLoading);
  
  return {
    loading,
    setLoading,
    isLoading: loading,
  };
};

// Combined app state hook
export const useAppState = () => {
  const user = useAppStore((state) => state.user);
  const theme = useAppStore((state) => state.theme);
  const loading = useAppStore((state) => state.loading);
  const reset = useAppStore((state) => state.reset);
  
  return {
    user,
    theme,
    loading,
    reset,
    isAuthenticated: user !== null,
    isDark: theme === 'dark',
    isLoading: loading,
  };
};

// Utility hooks for common operations
export const useAuth = () => {
  const { user, setUser, isAuthenticated, isAdmin } = useUser();
  
  const login = (userData: User) => {
    setUser(userData);
  };
  
  const logout = () => {
    setUser(null);
  };
  
  return {
    user,
    isAuthenticated,
    isAdmin,
    login,
    logout,
  };
};