/**
 * Performance monitoring and optimization utilities
 */

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  bundleSize?: number;
  memoryUsage?: number;
  timestamp: number;
}

export interface ComponentMetrics {
  componentName: string;
  renderCount: number;
  averageRenderTime: number;
  lastRenderTime: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics[]> = new Map();
  private componentMetrics: Map<string, ComponentMetrics> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // Observe navigation timing
    if ('PerformanceObserver' in window) {
      const navObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            this.recordMetric('navigation', {
              loadTime: entry.loadEventEnd - entry.loadEventStart,
              renderTime: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
              timestamp: Date.now(),
            });
          }
        });
      });

      try {
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navObserver);
      } catch (error) {
        console.warn('Navigation timing observer not supported');
      }

      // Observe resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'resource' && entry.name.includes('.js')) {
            this.recordMetric('resource', {
              loadTime: entry.responseEnd - entry.requestStart,
              renderTime: 0,
              bundleSize: entry.transferSize || 0,
              timestamp: Date.now(),
            });
          }
        });
      });

      try {
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (error) {
        console.warn('Resource timing observer not supported');
      }
    }
  }

  recordMetric(key: string, metric: PerformanceMetrics) {
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    this.metrics.get(key)!.push(metric);
  }

  recordComponentRender(componentName: string, renderTime: number) {
    const existing = this.componentMetrics.get(componentName);
    if (existing) {
      const newCount = existing.renderCount + 1;
      const newAverage = (existing.averageRenderTime * existing.renderCount + renderTime) / newCount;
      this.componentMetrics.set(componentName, {
        componentName,
        renderCount: newCount,
        averageRenderTime: newAverage,
        lastRenderTime: renderTime,
      });
    } else {
      this.componentMetrics.set(componentName, {
        componentName,
        renderCount: 1,
        averageRenderTime: renderTime,
        lastRenderTime: renderTime,
      });
    }
  }

  getMetrics(key?: string): PerformanceMetrics[] | Map<string, PerformanceMetrics[]> {
    if (key) {
      return this.metrics.get(key) || [];
    }
    return this.metrics;
  }

  getComponentMetrics(): ComponentMetrics[] {
    return Array.from(this.componentMetrics.values());
  }

  getMemoryUsage(): number | null {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return null;
  }

  clearMetrics() {
    this.metrics.clear();
    this.componentMetrics.clear();
  }

  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Higher-order component for measuring component render performance
 */
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
): React.ComponentType<P> {
  const name = componentName || Component.displayName || Component.name || 'Unknown';
  
  return function PerformanceMonitoredComponent(props: P) {
    const startTime = React.useRef<number>();
    
    React.useLayoutEffect(() => {
      startTime.current = performance.now();
    });
    
    React.useLayoutEffect(() => {
      if (startTime.current) {
        const renderTime = performance.now() - startTime.current;
        performanceMonitor.recordComponentRender(name, renderTime);
      }
    });
    
    return React.createElement(Component, props);
  };
}

/**
 * Hook for measuring render performance
 */
export function usePerformanceMonitoring(componentName: string) {
  const renderStartTime = React.useRef<number>();
  
  React.useLayoutEffect(() => {
    renderStartTime.current = performance.now();
  });
  
  React.useLayoutEffect(() => {
    if (renderStartTime.current) {
      const renderTime = performance.now() - renderStartTime.current;
      performanceMonitor.recordComponentRender(componentName, renderTime);
    }
  });
  
  return {
    recordMetric: (key: string, metric: Omit<PerformanceMetrics, 'timestamp'>) => {
      performanceMonitor.recordMetric(key, { ...metric, timestamp: Date.now() });
    },
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    getComponentMetrics: performanceMonitor.getComponentMetrics.bind(performanceMonitor),
  };
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Memoization utility for expensive computations
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Bundle size analyzer utility
 */
export function analyzeBundleSize(): Promise<{ [key: string]: number }> {
  return new Promise((resolve) => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const bundleSizes: { [key: string]: number } = {};
    
    resources.forEach((resource) => {
      if (resource.name.includes('.js') || resource.name.includes('.css')) {
        const filename = resource.name.split('/').pop() || resource.name;
        bundleSizes[filename] = resource.transferSize || 0;
      }
    });
    
    resolve(bundleSizes);
  });
}

/**
 * Web Vitals measurement
 */
export interface WebVitals {
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
}

export function measureWebVitals(): Promise<WebVitals> {
  return new Promise((resolve) => {
    const vitals: WebVitals = {};
    
    // Measure FCP
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        vitals.FCP = fcpEntry.startTime;
      }
    });
    
    try {
      fcpObserver.observe({ entryTypes: ['paint'] });
    } catch (error) {
      console.warn('FCP measurement not supported');
    }
    
    // Measure LCP
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      vitals.LCP = lastEntry.startTime;
    });
    
    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      console.warn('LCP measurement not supported');
    }
    
    // Return vitals after a delay to collect measurements
    setTimeout(() => {
      fcpObserver.disconnect();
      lcpObserver.disconnect();
      resolve(vitals);
    }, 3000);
  });
}