import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { 
  useMediaQuery, 
  useBreakpoints, 
  useOrientation, 
  useUserPreferences, 
  useDeviceCapabilities 
} from '@/hooks/useMediaQuery';

// Mock matchMedia
const mockMatchMedia = vi.fn();

beforeEach(() => {
  // Reset the mock before each test
  mockMatchMedia.mockClear();
  
  // Set up the default mock implementation
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });
  }
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useMediaQuery', () => {
  it('returns false when not in browser environment', () => {
    // Mock window as undefined
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;

    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
    
    expect(result.current).toBe(false);

    // Restore window
    global.window = originalWindow;
  });

  it('returns initial match state', () => {
    const mockMediaQueryList = {
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    mockMatchMedia.mockReturnValue(mockMediaQueryList);

    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
    
    expect(result.current).toBe(true);
    expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 768px)');
  });

  it('updates when media query changes', () => {
    let changeHandler: (event: MediaQueryListEvent) => void;
    
    const mockMediaQueryList = {
      matches: false,
      addEventListener: vi.fn((event, handler) => {
        if (event === 'change') {
          changeHandler = handler;
        }
      }),
      removeEventListener: vi.fn(),
    };

    mockMatchMedia.mockReturnValue(mockMediaQueryList);

    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
    
    expect(result.current).toBe(false);

    // Simulate media query change
    act(() => {
      changeHandler({ matches: true } as MediaQueryListEvent);
    });

    expect(result.current).toBe(true);
  });

  it('cleans up event listener on unmount', () => {
    const mockMediaQueryList = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    mockMatchMedia.mockReturnValue(mockMediaQueryList);

    const { unmount } = renderHook(() => useMediaQuery('(max-width: 768px)'));
    
    expect(mockMediaQueryList.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    
    unmount();
    
    expect(mockMediaQueryList.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('updates listener when query changes', () => {
    const mockMediaQueryList1 = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    const mockMediaQueryList2 = {
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    mockMatchMedia
      .mockReturnValueOnce(mockMediaQueryList1)
      .mockReturnValueOnce(mockMediaQueryList2);

    const { result, rerender } = renderHook(
      ({ query }) => useMediaQuery(query),
      { initialProps: { query: '(max-width: 768px)' } }
    );
    
    expect(result.current).toBe(false);
    expect(mockMediaQueryList1.addEventListener).toHaveBeenCalled();

    // Change the query
    rerender({ query: '(min-width: 1024px)' });

    expect(result.current).toBe(true);
    expect(mockMediaQueryList1.removeEventListener).toHaveBeenCalled();
    expect(mockMediaQueryList2.addEventListener).toHaveBeenCalled();
  });
});

describe('useBreakpoints', () => {
  it('returns correct breakpoint states', () => {
    // Mock different media queries
    mockMatchMedia.mockImplementation((query: string) => ({
      matches: query === '(max-width: 767px)', // Only mobile matches
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useBreakpoints());
    
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isLargeDesktop).toBe(false);
    expect(result.current.isSmallScreen).toBe(false);
    expect(result.current.isLargeScreen).toBe(false);
  });

  it('correctly identifies tablet breakpoint', () => {
    mockMatchMedia.mockImplementation((query: string) => ({
      matches: query === '(min-width: 768px) and (max-width: 1023px)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useBreakpoints());
    
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isDesktop).toBe(false);
  });

  it('correctly identifies desktop breakpoint', () => {
    mockMatchMedia.mockImplementation((query: string) => ({
      matches: query.includes('(min-width: 1024px)'),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useBreakpoints());
    
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isLargeScreen).toBe(true);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
  });
});

describe('useOrientation', () => {
  it('returns correct orientation states', () => {
    mockMatchMedia.mockImplementation((query: string) => ({
      matches: query === '(orientation: portrait)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useOrientation());
    
    expect(result.current.isPortrait).toBe(true);
    expect(result.current.isLandscape).toBe(false);
  });

  it('detects landscape orientation', () => {
    mockMatchMedia.mockImplementation((query: string) => ({
      matches: query === '(orientation: landscape)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useOrientation());
    
    expect(result.current.isLandscape).toBe(true);
    expect(result.current.isPortrait).toBe(false);
  });
});

describe('useUserPreferences', () => {
  it('returns correct user preference states', () => {
    mockMatchMedia.mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useUserPreferences());
    
    expect(result.current.prefersDarkMode).toBe(true);
    expect(result.current.prefersReducedMotion).toBe(false);
    expect(result.current.prefersHighContrast).toBe(false);
  });

  it('detects reduced motion preference', () => {
    mockMatchMedia.mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useUserPreferences());
    
    expect(result.current.prefersReducedMotion).toBe(true);
    expect(result.current.prefersDarkMode).toBe(false);
  });

  it('detects high contrast preference', () => {
    mockMatchMedia.mockImplementation((query: string) => ({
      matches: query === '(prefers-contrast: high)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useUserPreferences());
    
    expect(result.current.prefersHighContrast).toBe(true);
    expect(result.current.prefersDarkMode).toBe(false);
    expect(result.current.prefersReducedMotion).toBe(false);
  });
});

describe('useDeviceCapabilities', () => {
  it('returns correct device capability states', () => {
    mockMatchMedia.mockImplementation((query: string) => ({
      matches: query === '(hover: hover)' || query === '(pointer: fine)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useDeviceCapabilities());
    
    expect(result.current.canHover).toBe(true);
    expect(result.current.hasFinePointer).toBe(true);
    expect(result.current.hasCoarsePointer).toBe(false);
    expect(result.current.isTouchDevice).toBe(false);
  });

  it('detects touch device correctly', () => {
    mockMatchMedia.mockImplementation((query: string) => ({
      matches: query === '(pointer: coarse)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useDeviceCapabilities());
    
    expect(result.current.hasCoarsePointer).toBe(true);
    expect(result.current.hasFinePointer).toBe(false);
    expect(result.current.isTouchDevice).toBe(true);
    expect(result.current.canHover).toBe(false);
  });

  it('detects device with both fine and coarse pointer', () => {
    mockMatchMedia.mockImplementation((query: string) => ({
      matches: query === '(pointer: coarse)' || query === '(pointer: fine)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useDeviceCapabilities());
    
    expect(result.current.hasCoarsePointer).toBe(true);
    expect(result.current.hasFinePointer).toBe(true);
    expect(result.current.isTouchDevice).toBe(false); // Not a touch device if it has fine pointer too
  });
});