import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { useUserPreferences } from './useMediaQuery';

/**
 * Custom hook for theme management
 * Handles theme application to document and system preference detection
 */
export function useTheme() {
  const { theme, setTheme, toggleTheme } = useAppStore();
  const { prefersDarkMode } = useUserPreferences();

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Initialize theme based on system preference if not already set
  useEffect(() => {
    const storedTheme = localStorage.getItem('app-store');
    if (!storedTheme && prefersDarkMode) {
      setTheme('dark');
    }
  }, [prefersDarkMode, setTheme]);

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };
}