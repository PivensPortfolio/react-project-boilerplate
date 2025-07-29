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

export const Loading: React.FC<LoadingProps> = ({
  size = 'medium',
  variant = 'spinner',
  color = 'primary',
  text,
  fullscreen = false,
  overlay = false,
  className = '',
}) => {
  const containerClasses = [
    styles.container,
    fullscreen && styles.fullscreen,
    overlay && styles.overlay,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const textClasses = [
    styles.text,
    styles[size],
  ]
    .filter(Boolean)
    .join(' ');

  const renderSpinner = () => {
    const spinnerClasses = [
      styles.spinner,
      styles[size],
      styles[color],
    ]
      .filter(Boolean)
      .join(' ');

    return <div className={spinnerClasses} aria-label="Loading" />;
  };

  const renderDots = () => (
    <div className={styles.dots} aria-label="Loading">
      <div className={`${styles.dot} ${styles[color]}`} />
      <div className={`${styles.dot} ${styles[color]}`} />
      <div className={`${styles.dot} ${styles[color]}`} />
    </div>
  );

  const renderPulse = () => {
    const pulseClasses = [
      styles.spinner,
      styles[size],
      styles[color],
      styles.pulse,
    ]
      .filter(Boolean)
      .join(' ');

    return <div className={pulseClasses} aria-label="Loading" />;
  };

  const renderLoadingIndicator = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'spinner':
      default:
        return renderSpinner();
    }
  };

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
};

// Skeleton component for content loading states
export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  className = '',
  variant = 'text',
}) => {
  const skeletonStyles: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: variant === 'circular' ? '50%' : variant === 'text' ? '0.25rem' : '0.375rem',
  };

  const skeletonClasses = [
    styles.skeleton,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={skeletonClasses}
      style={skeletonStyles}
      aria-label="Loading content"
    />
  );
};

Loading.displayName = 'Loading';
Skeleton.displayName = 'Skeleton';