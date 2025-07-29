import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive design using media queries
 * @param query - The media query string
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);

    // Create event listener
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

/**
 * Predefined breakpoint hooks for common responsive design patterns
 */
export const useBreakpoints = () => {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isLargeDesktop = useMediaQuery('(min-width: 1440px)');
  
  // Additional utility breakpoints
  const isSmallScreen = useMediaQuery('(max-width: 1023px)'); // mobile + tablet
  const isLargeScreen = useMediaQuery('(min-width: 1024px)'); // desktop + large desktop
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isSmallScreen,
    isLargeScreen,
  };
};

/**
 * Hook for detecting device orientation
 */
export const useOrientation = () => {
  const isPortrait = useMediaQuery('(orientation: portrait)');
  const isLandscape = useMediaQuery('(orientation: landscape)');
  
  return {
    isPortrait,
    isLandscape,
  };
};

/**
 * Hook for detecting user preferences
 */
export const useUserPreferences = () => {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const prefersHighContrast = useMediaQuery('(prefers-contrast: high)');
  
  return {
    prefersReducedMotion,
    prefersDarkMode,
    prefersHighContrast,
  };
};

/**
 * Hook for detecting device capabilities
 */
export const useDeviceCapabilities = () => {
  const canHover = useMediaQuery('(hover: hover)');
  const hasFinePointer = useMediaQuery('(pointer: fine)');
  const hasCoarsePointer = useMediaQuery('(pointer: coarse)');
  
  return {
    canHover,
    hasFinePointer,
    hasCoarsePointer,
    isTouchDevice: hasCoarsePointer && !hasFinePointer,
  };
};