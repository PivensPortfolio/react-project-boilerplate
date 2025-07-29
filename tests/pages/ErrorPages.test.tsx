import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import NotFound from '../../src/pages/NotFound';
import ServerError from '../../src/pages/ServerError';

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Error Pages', () => {
  it('renders NotFound page correctly', () => {
    renderWithRouter(<NotFound />);
    
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    expect(screen.getByText('Go to Home')).toBeInTheDocument();
  });

  it('renders ServerError page correctly', () => {
    renderWithRouter(<ServerError />);
    
    expect(screen.getByText('Server Error')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Reload Page')).toBeInTheDocument();
  });

  it('renders ServerError with custom error in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    const testError = new Error('Test server error');
    renderWithRouter(<ServerError error={testError} />);
    
    expect(screen.getByText('Server Error')).toBeInTheDocument();
    
    process.env.NODE_ENV = originalEnv;
  });
});