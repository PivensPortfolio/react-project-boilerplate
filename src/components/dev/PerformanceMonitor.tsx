import React, { useState, useEffect } from 'react';
import { performanceMonitor, type ComponentMetrics, type PerformanceMetrics } from '../../utils/performance';

interface PerformanceMonitorProps {
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showDetails?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = process.env.NODE_ENV === 'development',
  position = 'bottom-right',
  showDetails = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<ComponentMetrics[]>([]);
  const [memoryUsage, setMemoryUsage] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getComponentMetrics());
      setMemoryUsage(performanceMonitor.getMemoryUsage());
    }, 1000);

    return () => clearInterval(interval);
  }, [enabled]);

  if (!enabled) return null;

  const positionStyles: Record<string, React.CSSProperties> = {
    'top-left': { top: 10, left: 10 },
    'top-right': { top: 10, right: 10 },
    'bottom-left': { bottom: 10, left: 10 },
    'bottom-right': { bottom: 10, right: 10 },
  };

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    ...positionStyles[position],
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: 'monospace',
    zIndex: 9999,
    minWidth: '200px',
    maxHeight: '400px',
    overflow: 'auto',
  };

  const slowComponents = metrics.filter(m => m.averageRenderTime > 16); // > 16ms

  return (
    <div style={containerStyle}>
      <div
        style={{ cursor: 'pointer', marginBottom: '8px' }}
        onClick={() => setIsVisible(!isVisible)}
      >
        🔍 Performance Monitor {isVisible ? '▼' : '▶'}
      </div>
      
      {isVisible && (
        <div>
          <div style={{ marginBottom: '8px' }}>
            <strong>Memory:</strong> {memoryUsage ? `${(memoryUsage / 1024 / 1024).toFixed(1)}MB` : 'N/A'}
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <strong>Components:</strong> {metrics.length}
          </div>
          
          {slowComponents.length > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <strong style={{ color: '#ff6b6b' }}>Slow Components:</strong>
              {slowComponents.map(component => (
                <div key={component.componentName} style={{ marginLeft: '8px', fontSize: '10px' }}>
                  {component.componentName}: {component.averageRenderTime.toFixed(1)}ms
                </div>
              ))}
            </div>
          )}
          
          {showDetails && (
            <div>
              <strong>All Components:</strong>
              {metrics.slice(0, 10).map(component => (
                <div key={component.componentName} style={{ marginLeft: '8px', fontSize: '10px' }}>
                  {component.componentName}: {component.averageRenderTime.toFixed(1)}ms ({component.renderCount})
                </div>
              ))}
              {metrics.length > 10 && <div style={{ fontSize: '10px' }}>...and {metrics.length - 10} more</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Hook for monitoring component performance
 */
export function usePerformanceMonitor(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      performanceMonitor.recordComponentRender(componentName, endTime - startTime);
    };
  });
}

/**
 * Higher-order component for automatic performance monitoring
 */
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
): React.ComponentType<P> {
  const name = componentName || Component.displayName || Component.name || 'Unknown';
  
  return React.memo(function PerformanceMonitoredComponent(props: P) {
    usePerformanceMonitor(name);
    return <Component {...props} />;
  });
}