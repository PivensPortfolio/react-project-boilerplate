import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import Navigation from '@/components/common/Navigation';

// Helper to render Navigation with router
const renderWithRouter = (initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Navigation />
    </MemoryRouter>
  );
};

describe('Navigation', () => {
  it('renders all navigation links', () => {
    renderWithRouter();
    
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Components' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'API Examples' })).toBeInTheDocument();
  });

  it('has correct href attributes', () => {
    renderWithRouter();
    
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about');
    expect(screen.getByRole('link', { name: 'Components' })).toHaveAttribute('href', '/components');
    expect(screen.getByRole('link', { name: 'API Examples' })).toHaveAttribute('href', '/api-examples');
  });

  it('highlights active link on home page', () => {
    renderWithRouter(['/']);
    
    const homeLink = screen.getByRole('link', { name: 'Home' });
    const aboutLink = screen.getByRole('link', { name: 'About' });
    
    // Home link should be active (bold and blue)
    expect(homeLink).toHaveStyle({ color: '#007acc', fontWeight: 'bold' });
    
    // Other links should not be active
    expect(aboutLink).toHaveStyle({ color: '#333', fontWeight: 'normal' });
  });

  it('highlights active link on about page', () => {
    renderWithRouter(['/about']);
    
    const homeLink = screen.getByRole('link', { name: 'Home' });
    const aboutLink = screen.getByRole('link', { name: 'About' });
    
    // About link should be active
    expect(aboutLink).toHaveStyle({ color: '#007acc', fontWeight: 'bold' });
    
    // Home link should not be active
    expect(homeLink).toHaveStyle({ color: '#333', fontWeight: 'normal' });
  });

  it('highlights active link on components page', () => {
    renderWithRouter(['/components']);
    
    const componentsLink = screen.getByRole('link', { name: 'Components' });
    const homeLink = screen.getByRole('link', { name: 'Home' });
    
    // Components link should be active
    expect(componentsLink).toHaveStyle({ color: '#007acc', fontWeight: 'bold' });
    
    // Other links should not be active
    expect(homeLink).toHaveStyle({ color: '#333', fontWeight: 'normal' });
  });

  it('highlights active link on api-examples page', () => {
    renderWithRouter(['/api-examples']);
    
    const apiExamplesLink = screen.getByRole('link', { name: 'API Examples' });
    const homeLink = screen.getByRole('link', { name: 'Home' });
    
    // API Examples link should be active
    expect(apiExamplesLink).toHaveStyle({ color: '#007acc', fontWeight: 'bold' });
    
    // Other links should not be active
    expect(homeLink).toHaveStyle({ color: '#333', fontWeight: 'normal' });
  });

  it('renders as a nav element', () => {
    renderWithRouter();
    
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders links in a list structure', () => {
    renderWithRouter();
    
    const nav = screen.getByRole('navigation');
    const list = nav.querySelector('ul');
    const listItems = nav.querySelectorAll('li');
    
    expect(list).toBeInTheDocument();
    expect(listItems).toHaveLength(4);
  });

  it('no link is active on unknown route', () => {
    renderWithRouter(['/unknown-route']);
    
    const homeLink = screen.getByRole('link', { name: 'Home' });
    const aboutLink = screen.getByRole('link', { name: 'About' });
    const componentsLink = screen.getByRole('link', { name: 'Components' });
    const apiExamplesLink = screen.getByRole('link', { name: 'API Examples' });
    
    // All links should be inactive
    expect(homeLink).toHaveStyle({ color: '#333', fontWeight: 'normal' });
    expect(aboutLink).toHaveStyle({ color: '#333', fontWeight: 'normal' });
    expect(componentsLink).toHaveStyle({ color: '#333', fontWeight: 'normal' });
    expect(apiExamplesLink).toHaveStyle({ color: '#333', fontWeight: 'normal' });
  });
});