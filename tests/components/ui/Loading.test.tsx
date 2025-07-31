import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Loading, Skeleton } from '@/components/ui/Loading';
import styles from '@/components/ui/Loading.module.css';

describe('Loading', () => {
  it('renders with default props', () => {
    render(<Loading />);
    
    const loading = screen.getByRole('status');
    expect(loading).toBeInTheDocument();
    expect(loading).toHaveClass(styles.container);
    
    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toHaveClass(styles.spinner, styles.medium, styles.primary);
  });

  it('renders different sizes', () => {
    const { rerender } = render(<Loading size="small" />);
    expect(screen.getByLabelText('Loading')).toHaveClass(styles.small);

    rerender(<Loading size="large" />);
    expect(screen.getByLabelText('Loading')).toHaveClass(styles.large);

    rerender(<Loading size="xlarge" />);
    expect(screen.getByLabelText('Loading')).toHaveClass(styles.xlarge);
  });

  it('renders different variants', () => {
    const { rerender } = render(<Loading variant="spinner" />);
    expect(screen.getByLabelText('Loading')).toHaveClass(styles.spinner);

    rerender(<Loading variant="dots" />);
    const dotsContainer = screen.getByLabelText('Loading');
    expect(dotsContainer).toHaveClass(styles.dots);

    rerender(<Loading variant="pulse" />);
    expect(screen.getByLabelText('Loading')).toHaveClass(styles.pulse);
  });

  it('renders different colors', () => {
    const { rerender } = render(<Loading color="secondary" />);
    expect(screen.getByLabelText('Loading')).toHaveClass(styles.secondary);

    rerender(<Loading color="white" />);
    expect(screen.getByLabelText('Loading')).toHaveClass(styles.white);

    rerender(<Loading color="dark" />);
    expect(screen.getByLabelText('Loading')).toHaveClass(styles.dark);
  });

  it('renders with text', () => {
    render(<Loading text="Loading data..." />);
    
    const text = screen.getByText('Loading data...');
    expect(text).toBeInTheDocument();
    expect(text).toHaveClass(styles.text, styles.medium);
    expect(text).toHaveAttribute('aria-label', 'Loading data...');
  });

  it('renders fullscreen', () => {
    render(<Loading fullscreen />);
    
    expect(screen.getByRole('status')).toHaveClass(styles.fullscreen);
  });

  it('renders with overlay', () => {
    render(<Loading overlay />);
    
    expect(screen.getByRole('status')).toHaveClass(styles.overlay);
  });

  it('applies custom className', () => {
    render(<Loading className="custom-loading" />);
    
    expect(screen.getByRole('status')).toHaveClass('custom-loading');
  });

  it('has proper accessibility attributes', () => {
    render(<Loading text="Please wait" />);
    
    const container = screen.getByRole('status');
    expect(container).toHaveAttribute('aria-live', 'polite');
    
    const indicator = screen.getByLabelText('Loading');
    expect(indicator).toBeInTheDocument();
  });

  it('renders dots variant correctly', () => {
    render(<Loading variant="dots" />);
    
    const dotsContainer = screen.getByLabelText('Loading');
    expect(dotsContainer).toHaveClass(styles.dots);
    
    // Check that dots are rendered (they should be div elements with dot class)
    const dots = dotsContainer.querySelectorAll(`.${styles.dot}`);
    expect(dots).toHaveLength(3);
  });
});

describe('Skeleton', () => {
  it('renders with default props', () => {
    render(<Skeleton />);
    
    const skeleton = screen.getByLabelText('Loading content');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass(styles.skeleton);
  });

  it('applies custom width and height', () => {
    render(<Skeleton width="200px" height="50px" />);
    
    const skeleton = screen.getByLabelText('Loading content');
    expect(skeleton).toHaveStyle({
      width: '200px',
      height: '50px',
    });
  });

  it('applies numeric width and height', () => {
    render(<Skeleton width={150} height={30} />);
    
    const skeleton = screen.getByLabelText('Loading content');
    expect(skeleton).toHaveStyle({
      width: '150px',
      height: '30px',
    });
  });

  it('renders different variants', () => {
    const { rerender } = render(<Skeleton variant="text" />);
    let skeleton = screen.getByLabelText('Loading content');
    expect(skeleton).toHaveStyle({ borderRadius: '0.25rem' });

    rerender(<Skeleton variant="rectangular" />);
    skeleton = screen.getByLabelText('Loading content');
    expect(skeleton).toHaveStyle({ borderRadius: '0.375rem' });

    rerender(<Skeleton variant="circular" />);
    skeleton = screen.getByLabelText('Loading content');
    expect(skeleton).toHaveStyle({ borderRadius: '50%' });
  });

  it('applies custom className', () => {
    render(<Skeleton className="custom-skeleton" />);
    
    expect(screen.getByLabelText('Loading content')).toHaveClass('custom-skeleton');
  });

  it('has proper accessibility attributes', () => {
    render(<Skeleton />);
    
    const skeleton = screen.getByLabelText('Loading content');
    expect(skeleton).toBeInTheDocument();
  });
});