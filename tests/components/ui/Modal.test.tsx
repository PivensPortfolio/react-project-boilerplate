import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '@/components/ui/Modal';
import styles from '@/components/ui/Modal.module.css';

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    children: <div>Modal content</div>,
  };

  beforeEach(() => {
    // Reset body styles and clear any existing content
    document.body.style.overflow = '';
    document.body.innerHTML = '';
  });

  afterEach(() => {
    // Clean up React components first
    cleanup();
    // Reset body styles
    document.body.style.overflow = '';
    // Clear any remaining content
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('renders when isOpen is true', () => {
    render(<Modal {...defaultProps} />);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders with title', () => {
    render(<Modal {...defaultProps} title="Test Modal" />);
    
    const title = screen.getByText('Test Modal');
    expect(title).toBeInTheDocument();
    expect(title).toHaveAttribute('id', 'modal-title');
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
  });

  it('renders different sizes', () => {
    const { rerender } = render(<Modal {...defaultProps} size="small" />);
    expect(screen.getByRole('dialog').firstChild).toHaveClass(styles.small);

    rerender(<Modal {...defaultProps} size="large" />);
    expect(screen.getByRole('dialog').firstChild).toHaveClass(styles.large);

    rerender(<Modal {...defaultProps} size="fullscreen" />);
    expect(screen.getByRole('dialog').firstChild).toHaveClass(styles.fullscreen);
  });

  it('renders with footer', () => {
    const footer = <button>Save</button>;
    render(<Modal {...defaultProps} footer={footer} />);
    
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('renders close button by default', () => {
    render(<Modal {...defaultProps} />);
    
    const closeButton = screen.getByRole('button', { name: 'Close modal' });
    expect(closeButton).toBeInTheDocument();
  });

  it('hides close button when showCloseButton is false', () => {
    render(<Modal {...defaultProps} showCloseButton={false} />);
    
    expect(screen.queryByRole('button', { name: 'Close modal' })).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    
    const closeButton = screen.getByRole('button', { name: 'Close modal' });
    await userEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when overlay is clicked', async () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    
    const overlay = screen.getByRole('dialog');
    await userEvent.click(overlay);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when modal content is clicked', async () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    
    const content = screen.getByText('Modal content');
    await userEvent.click(content);
    
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not call onClose when closeOnOverlayClick is false', async () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} closeOnOverlayClick={false} />);
    
    const overlay = screen.getByRole('dialog');
    await userEvent.click(overlay);
    
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when Escape key is pressed', async () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when Escape key is pressed and closeOnEscape is false', async () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} closeOnEscape={false} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(onClose).not.toHaveBeenCalled();
  });

  it('applies noPadding class when noPadding is true', () => {
    render(<Modal {...defaultProps} noPadding />);
    
    const modalBody = screen.getByText('Modal content').parentElement;
    expect(modalBody).toHaveClass(styles.noPadding);
  });

  it('applies different footer alignments', () => {
    const footer = <button>Save</button>;
    const { rerender } = render(
      <Modal {...defaultProps} footer={footer} footerAlignment="center" />
    );
    
    let footerElement = screen.getByRole('button', { name: 'Save' }).parentElement;
    expect(footerElement).toHaveClass(styles.centered);

    rerender(<Modal {...defaultProps} footer={footer} footerAlignment="space-between" />);
    footerElement = screen.getByRole('button', { name: 'Save' }).parentElement;
    expect(footerElement).toHaveClass(styles.spaceBetween);
  });

  it('applies custom className', () => {
    render(<Modal {...defaultProps} className="custom-modal" />);
    
    expect(screen.getByRole('dialog').firstChild).toHaveClass('custom-modal');
  });

  it('applies custom overlayClassName', () => {
    render(<Modal {...defaultProps} overlayClassName="custom-overlay" />);
    
    expect(screen.getByRole('dialog')).toHaveClass('custom-overlay');
  });

  it('has proper accessibility attributes', () => {
    render(<Modal {...defaultProps} title="Accessible Modal" />);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
  });

  it('locks body scroll when open', () => {
    render(<Modal {...defaultProps} />);
    
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body scroll when closed', () => {
    const { rerender } = render(<Modal {...defaultProps} />);
    expect(document.body.style.overflow).toBe('hidden');
    
    rerender(<Modal {...defaultProps} isOpen={false} />);
    expect(document.body.style.overflow).toBe('');
  });

  it('handles focus management', async () => {
    // Create a button to focus initially
    const button = document.createElement('button');
    button.textContent = 'Initial focus';
    document.body.appendChild(button);
    button.focus();
    
    const { rerender } = render(<Modal {...defaultProps} />);
    
    // Modal should be focused when opened
    await waitFor(() => {
      const modal = screen.getByRole('dialog').querySelector('[tabindex="-1"]');
      expect(document.activeElement).toBe(modal);
    });
    
    // Close modal and check focus restoration
    rerender(<Modal {...defaultProps} isOpen={false} />);
    
    await waitFor(() => {
      expect(document.activeElement).toBe(button);
    });
  });

  it('traps focus within modal', async () => {
    render(
      <Modal {...defaultProps} title="Focus Trap Test">
        <button>First button</button>
        <button>Second button</button>
      </Modal>
    );
    
    const firstButton = screen.getByText('First button');
    const secondButton = screen.getByText('Second button');
    const closeButton = screen.getByRole('button', { name: 'Close modal' });
    
    // Focus first button
    firstButton.focus();
    expect(document.activeElement).toBe(firstButton);
    
    // Tab to second button
    await userEvent.tab();
    expect(document.activeElement).toBe(secondButton);
    
    // Tab to close button
    await userEvent.tab();
    expect(document.activeElement).toBe(closeButton);
    
    // Tab should wrap to first button
    await userEvent.tab();
    expect(document.activeElement).toBe(firstButton);
    
    // Shift+Tab should go to close button
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(closeButton);
  });
});