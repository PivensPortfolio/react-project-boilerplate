import React from 'react';
import styles from './Loading.module.css';

export interface LoadingProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  variant?: 'spinner' | 'dots' | 'pulse';
  color?: 'primary' | 'secondary' | 'white' | 'dark';
  text?: string;
  fullscreen?: boolean;
  overlay?: boolean;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = React.memo(({
  size = 'medium',
  variant = 'spinner',
  color = 'primary',
  text,
  fullscreen = false,
  overlay = false,
  className = '',
}) => {
  const containerClasses = React.useMemo(() => [
    styles.container,
    fullscreen && styles.fullscreen,
    overlay && styles.overlay,
    className,
  ]
    .filter(Boolean)
    .join(' '), [fullscreen, overlay, className]);

  const textClasses = React.useMemo(() => [
    styles.text,
    styles[size],
  ]
    .filter(Boolean)
    .join(' '), [size]);

  const renderSpinner = React.useCallback(() => {
    const spinnerClasses = [
      styles.spinner,
      styles[size],
      styles[color],
    ]
      .filter(Boolean)
      .join(' ');

    return <div className={spinnerClasses} aria-label="Loading" />;
  }, [size, color]);

  const renderDots = React.useCallback(() => (
    <div className={styles.dots} aria-label="Loading">
      <div className={`${styles.dot} ${styles[color]}`} />
      <div className={`${styles.dot} ${styles[color]}`} />
      <div className={`${styles.dot} ${styles[color]}`} />
    </div>
  ), [color]);

  const renderPulse = React.useCallback(() => {
    const pulseClasses = [
      styles.spinner,
      styles[size],
      styles[color],
      styles.pulse,
    ]
      .filter(Boolean)
      .join(' ');

    return <div className={pulseClasses} aria-label="Loading" />;
  }, [size, color]);

  const renderLoadingIndicator = React.useCallback(() => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'spinner':
      default:
        return renderSpinner();
    }
  }, [variant, renderDots, renderPulse, renderSpinner]);

  return (
    <div className={containerClasses} role="status" aria-live="polite">
      {renderLoadingIndicator()}
      {text && (
        <span className={textClasses} aria-label={text}>
          {text}
        </span>
      )}
    </div>
  );
});

// Skeleton component for content loading states
export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
}

export const Skeleton: React.FC<SkeletonProps> = React.memo(({
  width = '100%',
  height = '1rem',
  className = '',
  variant = 'text',
}) => {
  const skeletonStyles: React.CSSProperties = React.useMemo(() => ({
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: variant === 'circular' ? '50%' : variant === 'text' ? '0.25rem' : '0.375rem',
  }), [width, height, variant]);

  const skeletonClasses = React.useMemo(() => [
    styles.skeleton,
    className,
  ]
    .filter(Boolean)
    .join(' '), [className]);

  return (
    <div
      className={skeletonClasses}
      style={skeletonStyles}
      aria-label="Loading content"
    />
  );
});

Loading.displayName = 'Loading';
Skeleton.displayName = 'Skeleton';