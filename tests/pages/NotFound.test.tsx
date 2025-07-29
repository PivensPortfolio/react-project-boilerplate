import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import NotFound from '../../src/pages/NotFound';

// Mock window.history.back
const mockHistoryBack = vi.fn();
Object.defineProperty(window, 'history', {
  value: { back: mockHistoryBack },
  writable: true,
});

const renderWithRouter = (component: React.ReactElement, initialPath = '/unknown-path') => {
  window.history.pushState({}, 'Test page', initialPath);
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('NotFound', () => {
  beforeEach(() => {
    mockHistoryBack.mockClear();
  });

  it('renders 404 error page', () => {
    renderWithRouter(<NotFound />);

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    expect(screen.getByText('Sorry, we couldn\'t find the page you\'re looking for.')).toBeInTheDocument();
  });

  it('displays the requested path', () => {
    renderWithRouter(<NotFound />, '/some/unknown/path');

    expect(screen.getByText('/some/unknown/path')).toBeInTheDocument();
  });

  it('renders Go Back button', () => {
    renderWithRouter(<NotFound />);

    const goBackButton = screen.getByRole('button', { name: 'Go Back' });
    expect(goBackButton).toBeInTheDocument();
  });

  it('renders Go to Home link', () => {
    renderWithRouter(<NotFound />);

    const homeLink = screen.getByRole('link', { name: 'Go to Home' });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('calls window.history.back when Go Back button is clicked', () => {
    renderWithRouter(<NotFound />);

    const goBackButton = screen.getByRole('button', { name: 'Go Back' });
    fireEvent.click(goBackButton);

    expect(mockHistoryBack).toHaveBeenCalledTimes(1);
  });

  it('renders help section with suggestions', () => {
    renderWithRouter(<NotFound />);

    expect(screen.getByText('What can you do?')).toBeInTheDocument();
    expect(screen.getByText('Check the URL for typos')).toBeInTheDocument();
    expect(screen.getByText('Use the navigation menu to find what you\'re looking for')).toBeInTheDocument();
    expect(screen.getByText('Go back to the previous page')).toBeInTheDocument();
    
    const homepageLink = screen.getByRole('link', { name: 'homepage' });
    expect(homepageLink).toBeInTheDocument();
    expect(homepageLink).toHaveAttribute('href', '/');
  });

  it('has proper CSS classes applied', () => {
    renderWithRouter(<NotFound />);

    const errorPage = screen.getByText('404').closest('.errorPage');
    expect(errorPage).toBeInTheDocument();

    const errorContainer = screen.getByText('Page Not Found').closest('.errorContainer');
    expect(errorContainer).toBeInTheDocument();
  });
});