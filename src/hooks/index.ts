/**
 * Custom hooks exports
 */

// Core hooks
export { useLocalStorage } from './useLocalStorage';
export { useApi, useApiService, usePaginatedApi, useMutation } from './useApi';
export { useDebounce, useDebouncedCallback, useDebouncedSearch } from './useDebounce';
export {
  useMediaQuery,
  useBreakpoints,
  useOrientation,
  useUserPreferences,
  useDeviceCapabilities,
} from './useMediaQuery';
export { useErrorHandler } from './useErrorHandler';
export { useTheme } from './useTheme';

// Re-export store hooks for convenience
export {
  useUser,
  useLoading,
  useAppState,
  useAuth,
} from '../store/hooks';

// Re-export theme hook from store for backward compatibility
export { useTheme as useThemeStore } from '../store/hooks';

// Type exports
export type { ApiState, ApiOptions } from './useApi';