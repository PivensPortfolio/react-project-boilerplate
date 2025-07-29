import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ServerError from '../../src/pages/ServerError';

// Mock window.location.reload
const mockReload = vi.fn();
Object.defineProperty(window, 'location', {
  value: { reload: mockReload },
  writable: true,
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ServerError', () => {
  beforeEach(() => {
    mockReload.mockClear();
  });

  it('renders 500 error page', () => {
    renderWithRouter(<ServerError />);

    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('Server Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong on our end. We\'re working to fix it.')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    renderWithRouter(<ServerError />);

    expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reload Page' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to Home' })).toBeInTheDocument();
  });

  it('renders help section', () => {
    renderWithRouter(<ServerError />);

    expect(screen.getByText('What happened?')).toBeInTheDocument();
    expect(screen.getByText('There might be a temporary server issue')).toBeInTheDocument();
    expect(screen.getByText('The service might be under maintenance')).toBeInTheDocument();
    expect(screen.getByText('Your request might have timed out')).toBeInTheDocument();
  });

  it('calls window.location.reload when Reload Page button is clicked', () => {
    renderWithRouter(<ServerError />);

    const reloadButton = screen.getByRole('button', { name: 'Reload Page' });
    fireEvent.click(reloadButton);

    expect(mockReload).toHaveBeenCalledTimes(1);
  });

  it('calls resetError when Try Again button is clicked and resetError is provided', () => {
    const mockResetError = vi.fn();
    renderWithRouter(<ServerError resetError={mockResetError} />);

    const tryAgainButton = screen.getByRole('button', { name: 'Try Again' });
    fireEvent.click(tryAgainButton);

    expect(mockResetError).toHaveBeenCalledTimes(1);
    expect(mockReload).not.toHaveBeenCalled();
  });

  it('calls window.location.reload when Try Again button is clicked and no resetError is provided', () => {
    renderWithRouter(<ServerError />);

    const tryAgainButton = screen.getByRole('button', { name: 'Try Again' });
    fireEvent.click(tryAgainButton);

    expect(mockReload).toHaveBeenCalledTimes(1);
  });

  it('displays error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const testError = new Error('Test server error');
    testError.stack = 'Error: Test server error\n    at test.js:1:1';

    renderWithRouter(<ServerError error={testError} />);

    expect(screen.getByText('Error Details (Development Only)')).toBeInTheDocument();
    expect(screen.getByText('Test server error')).toBeInTheDocument();
    expect(screen.getByText(testError.stack)).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('hides error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const testError = new Error('Test server error');
    renderWithRouter(<ServerError error={testError} />);

    expect(screen.queryByText('Error Details (Development Only)')).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('does not show error details when no error is provided', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    renderWithRouter(<ServerError />);

    expect(screen.queryByText('Error Details (Development Only)')).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('has proper CSS classes applied', () => {
    renderWithRouter(<ServerError />);

    const errorPage = screen.getByText('500').closest('.errorPage');
    expect(errorPage).toBeInTheDocument();

    const errorContainer = screen.getByText('Server Error').closest('.errorContainer');
    expect(errorContainer).toBeInTheDocument();
  });

  it('Go to Home link has correct href', () => {
    renderWithRouter(<ServerError />);

    const homeLink = screen.getByRole('link', { name: 'Go to Home' });
    expect(homeLink).toHaveAttribute('href', '/');
  });
});