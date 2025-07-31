import React, { Suspense, ComponentType } from 'react';
import { Loading } from '../components/ui';

/**
 * Lazy loading utility for components with loading fallback
 */
export interface LazyLoadOptions {
  fallback?: React.ComponentType;
  delay?: number;
  minLoadingTime?: number;
}

/**
 * Creates a lazy-loaded component with loading fallback
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): React.ComponentType<React.ComponentProps<T>> {
  const {
    fallback: Fallback = () => <Loading text="Loading..." />,
    delay = 0,
    minLoadingTime = 200,
  } = options;

  // Create lazy component
  const LazyComponent = React.lazy(() => {
    const startTime = Date.now();
    
    return Promise.all([
      importFn(),
      // Ensure minimum loading time for better UX
      new Promise(resolve => setTimeout(resolve, Math.max(0, delay))),
    ]).then(([moduleExports]) => {
      const loadTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - loadTime);
      
      if (remainingTime > 0) {
        return new Promise(resolve => 
          setTimeout(() => resolve(moduleExports), remainingTime)
        );
      }
      
      return moduleExports;
    });
  });

  // Return wrapped component with Suspense
  return function LazyLoadedComponent(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={<Fallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Higher-order component for lazy loading with custom fallback
 */
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ComponentType
): ComponentType<P> {
  const Fallback = fallback || (() => <Loading text="Loading component..." />);
  
  return function LazyWrappedComponent(props: P) {
    return (
      <Suspense fallback={<Fallback />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

/**
 * Preload a lazy component
 */
export function preloadComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): Promise<{ default: T }> {
  return importFn();
}

/**
 * Create a lazy image component with loading states
 */
export interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder,
  onLoad,
  onError,
  className,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [isInView, setIsInView] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  React.useEffect(() => {
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
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div ref={imgRef} className={className} style={{ position: 'relative' }}>
      {!isLoaded && !hasError && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {placeholder || <Loading size="small" />}
        </div>
      )}
      
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
          {...props}
        />
      )}
      
      {hasError && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#f5f5f5',
            color: '#666',
            textAlign: 'center',
          }}
        >
          Failed to load image
        </div>
      )}
    </div>
  );
};