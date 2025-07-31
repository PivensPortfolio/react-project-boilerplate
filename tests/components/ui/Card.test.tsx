import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import styles from '@/components/ui/Card.module.css';

describe('Card', () => {
  it('renders with default props', () => {
    render(<Card>Card content</Card>);
    
    const card = screen.getByText('Card content');
    expect(card).toBeInTheDocument();
    expect(card.className).toContain('card');
    expect(card.className).toContain('default');
    expect(card.className).toContain('medium');
  });

  it('renders different variants', () => {
    const { rerender } = render(<Card variant="outlined">Outlined</Card>);
    expect(screen.getByText('Outlined').className).toContain('outlined');

    rerender(<Card variant="elevated">Elevated</Card>);
    expect(screen.getByText('Elevated').className).toContain('elevated');

    rerender(<Card variant="filled">Filled</Card>);
    expect(screen.getByText('Filled').className).toContain('filled');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Clickable card</Card>);
    
    const card = screen.getByText('Clickable card');
    expect(card).toHaveAttribute('role', 'button');
    expect(card).toHaveAttribute('tabIndex', '0');
    
    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard events', () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Keyboard card</Card>);
    
    const card = screen.getByText('Keyboard card');
    
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
    
    fireEvent.keyDown(card, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('does not trigger click when disabled', () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick} disabled>Disabled card</Card>);
    
    const card = screen.getByText('Disabled card');
    expect(card).toHaveAttribute('aria-disabled', 'true');
    
    fireEvent.click(card);
    expect(handleClick).not.toHaveBeenCalled();
  });
});

describe('CardHeader', () => {
  it('renders header content', () => {
    render(<CardHeader>Header content</CardHeader>);
    
    const header = screen.getByText('Header content');
    expect(header).toBeInTheDocument();
    expect(header.className).toContain('header');
  });
});

describe('CardBody', () => {
  it('renders body content', () => {
    render(<CardBody>Body content</CardBody>);
    
    const body = screen.getByText('Body content');
    expect(body).toBeInTheDocument();
    expect(body.className).toContain('body');
  });
});

describe('CardFooter', () => {
  it('renders footer content', () => {
    render(<CardFooter>Footer content</CardFooter>);
    
    const footer = screen.getByText('Footer content');
    expect(footer).toBeInTheDocument();
    expect(footer.className).toContain('footer');
  });

  it('applies alignment classes', () => {
    const { rerender } = render(<CardFooter alignment="center">Center</CardFooter>);
    expect(screen.getByText('Center').className).toContain(styles.center);

    rerender(<CardFooter alignment="right">Right</CardFooter>);
    expect(screen.getByText('Right').className).toContain(styles.right);

    rerender(<CardFooter alignment="space-between">Space</CardFooter>);
    expect(screen.getByText('Space').className).toContain(styles.spaceBetween);
  });
});