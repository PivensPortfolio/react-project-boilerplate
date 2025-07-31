import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { debounce, throttle, memoize } from '../utils/performance';

/**
 * Hook for creating optimized event handlers
 */
export function useOptimizedHandlers() {
  const handlersRef = useRef<Map<string, any>>(new Map());

  const createDebounced = useCallback(<T extends (...args: any[]) => any>(
    fn: T,
    delay: number,
    key?: string
  ): T => {
    const cacheKey = key || fn.toString();
    
    if (!handlersRef.current.has(cacheKey)) {
      handlersRef.current.set(cacheKey, debounce(fn, delay));
    }
    
    return handlersRef.current.get(cacheKey);
  }, []);

  const createThrottled = useCallback(<T extends (...args: any[]) => any>(
    fn: T,
    limit: number,
    key?: string
  ): T => {
    const cacheKey = key || fn.toString();
    
    if (!handlersRef.current.has(cacheKey)) {
      handlersRef.current.set(cacheKey, throttle(fn, limit));
    }
    
    return handlersRef.current.get(cacheKey);
  }, []);

  const createMemoized = useCallback(<T extends (...args: any[]) => any>(
    fn: T,
    getKey?: (...args: Parameters<T>) => string,
    cacheKey?: string
  ): T => {
    const key = cacheKey || fn.toString();
    
    if (!handlersRef.current.has(key)) {
      handlersRef.current.set(key, memoize(fn, getKey));
    }
    
    return handlersRef.current.get(key);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      handlersRef.current.clear();
    };
  }, []);

  return {
    createDebounced,
    createThrottled,
    createMemoized,
  };
}

/**
 * Hook for optimizing expensive computations
 */
export function useExpensiveComputation<T>(
  computeFn: () => T,
  dependencies: React.DependencyList,
  options: {
    enabled?: boolean;
    fallback?: T;
  } = {}
): T | undefined {
  const { enabled = true, fallback } = options;
  
  return useMemo(() => {
    if (!enabled) return fallback;
    
    try {
      return computeFn();
    } catch (error) {
      console.warn('Expensive computation failed:', error);
      return fallback;
    }
  }, dependencies);
}

/**
 * Hook for optimizing list rendering with virtualization hints
 */
export function useVirtualizedList<T>(
  items: T[],
  options: {
    itemHeight?: number;
    containerHeight?: number;
    overscan?: number;
  } = {}
) {
  const { itemHeight = 50, containerHeight = 400, overscan = 5 } = options;
  
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const totalHeight = items.length * itemHeight;
  
  const getVisibleItems = useCallback((scrollTop: number) => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + visibleCount + overscan,
      items.length - 1
    );
    
    const visibleItems = items.slice(
      Math.max(0, startIndex - overscan),
      endIndex + 1
    );
    
    return {
      items: visibleItems,
      startIndex: Math.max(0, startIndex - overscan),
      endIndex,
      offsetY: Math.max(0, startIndex - overscan) * itemHeight,
    };
  }, [items, itemHeight, visibleCount, overscan]);
  
  return {
    totalHeight,
    itemHeight,
    getVisibleItems,
  };
}

/**
 * Hook for optimizing image loading
 */
export function useOptimizedImage(src: string, options: {
  lazy?: boolean;
  placeholder?: string;
  quality?: number;
} = {}) {
  const { lazy = true, placeholder, quality = 75 } = options;
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [error, setError] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, [lazy, isInView]);
  
  // Optimize image URL
  const optimizedSrc = useMemo(() => {
    if (!src) return '';
    
    // Add quality parameter if supported
    const url = new URL(src, window.location.origin);
    if (quality < 100) {
      url.searchParams.set('q', quality.toString());
    }
    
    return url.toString();
  }, [src, quality]);
  
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setError(null);
  }, []);
  
  const handleError = useCallback(() => {
    setError('Failed to load image');
    setIsLoaded(false);
  }, []);
  
  return {
    ref: imgRef,
    src: isInView ? optimizedSrc : placeholder,
    isLoaded,
    isInView,
    error,
    onLoad: handleLoad,
    onError: handleError,
  };
}

/**
 * Hook for performance-aware state updates
 */
export function useOptimizedState<T>(
  initialValue: T,
  options: {
    debounceMs?: number;
    throttleMs?: number;
    batchUpdates?: boolean;
  } = {}
) {
  const { debounceMs, throttleMs, batchUpdates = false } = options;
  const [state, setState] = useState(initialValue);
  const pendingUpdatesRef = useRef<T[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const flushUpdates = useCallback(() => {
    if (pendingUpdatesRef.current.length > 0) {
      const latestUpdate = pendingUpdatesRef.current[pendingUpdatesRef.current.length - 1];
      setState(latestUpdate);
      pendingUpdatesRef.current = [];
    }
  }, []);
  
  const optimizedSetState = useMemo(() => {
    let handler = (newValue: T | ((prev: T) => T)) => {
      const value = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(state)
        : newValue;
      
      if (batchUpdates) {
        pendingUpdatesRef.current.push(value);
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(flushUpdates, 0);
      } else {
        setState(value);
      }
    };
    
    if (debounceMs) {
      handler = debounce(handler, debounceMs);
    } else if (throttleMs) {
      handler = throttle(handler, throttleMs);
    }
    
    return handler;
  }, [state, batchUpdates, debounceMs, throttleMs, flushUpdates]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return [state, optimizedSetState] as const;
}

/**
 * Hook for measuring and optimizing render performance
 */
export function useRenderPerformance(componentName: string, enabled = process.env.NODE_ENV === 'development') {
  const renderStartTime = useRef<number>();
  const renderCount = useRef(0);
  const totalRenderTime = useRef(0);
  
  // Start timing
  if (enabled) {
    renderStartTime.current = performance.now();
    renderCount.current += 1;
  }
  
  // End timing and log results
  useEffect(() => {
    if (enabled && renderStartTime.current) {
      const renderTime = performance.now() - renderStartTime.current;
      totalRenderTime.current += renderTime;
      
      const averageRenderTime = totalRenderTime.current / renderCount.current;
      
      // Log slow renders
      if (renderTime > 16) { // > 16ms is potentially problematic
        console.warn(
          `Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms ` +
          `(avg: ${averageRenderTime.toFixed(2)}ms, count: ${renderCount.current})`
        );
      }
    }
  });
  
  return {
    renderCount: renderCount.current,
    averageRenderTime: renderCount.current > 0 ? totalRenderTime.current / renderCount.current : 0,
  };
}