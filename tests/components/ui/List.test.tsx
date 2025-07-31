import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { 
  List, 
  ListItem, 
  DescriptionList, 
  OrderedList, 
  SimpleListItem 
} from '@/components/ui/List';
import styles from '@/components/ui/List.module.css';

describe('List', () => {
  it('renders with default props', () => {
    render(
      <List>
        <ListItem>Item 1</ListItem>
        <ListItem>Item 2</ListItem>
      </List>
    );
    
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    expect(list).toHaveClass(styles.list, styles.default, styles.medium);
    
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('renders different variants', () => {
    const { rerender } = render(
      <List variant="bordered">
        <ListItem>Item</ListItem>
      </List>
    );
    expect(screen.getByRole('list')).toHaveClass(styles.bordered);

    rerender(
      <List variant="divided">
        <ListItem>Item</ListItem>
      </List>
    );
    expect(screen.getByRole('list')).toHaveClass(styles.divided);
  });

  it('renders different sizes', () => {
    const { rerender } = render(
      <List size="small">
        <ListItem>Item</ListItem>
      </List>
    );
    expect(screen.getByRole('list')).toHaveClass(styles.small);

    rerender(
      <List size="large">
        <ListItem>Item</ListItem>
      </List>
    );
    expect(screen.getByRole('list')).toHaveClass(styles.large);
  });

  it('applies custom className', () => {
    render(
      <List className="custom-list">
        <ListItem>Item</ListItem>
      </List>
    );
    
    expect(screen.getByRole('list')).toHaveClass('custom-list');
  });
});

describe('ListItem', () => {
  it('renders basic list item', () => {
    render(<ListItem>Basic item</ListItem>);
    
    const item = screen.getByRole('listitem');
    expect(item).toBeInTheDocument();
    expect(item).toHaveClass(styles.listItem);
    expect(screen.getByText('Basic item')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<ListItem onClick={handleClick}>Clickable item</ListItem>);
    
    const item = screen.getByRole('button'); // Changed from 'listitem' to 'button' since clickable items have role="button"
    expect(item).toHaveClass(styles.clickable);
    expect(item).toHaveAttribute('role', 'button');
    expect(item).toHaveAttribute('tabIndex', '0');
    
    fireEvent.click(item);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard events', () => {
    const handleClick = vi.fn();
    render(<ListItem onClick={handleClick}>Keyboard item</ListItem>);
    
    const item = screen.getByRole('button'); // Changed from 'listitem' to 'button'
    
    fireEvent.keyDown(item, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
    
    fireEvent.keyDown(item, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
    
    fireEvent.keyDown(item, { key: 'Escape' });
    expect(handleClick).toHaveBeenCalledTimes(2); // Should not trigger
  });

  it('renders disabled state', () => {
    const handleClick = vi.fn();
    render(<ListItem onClick={handleClick} disabled>Disabled item</ListItem>);
    
    const item = screen.getByRole('button'); // Changed from 'listitem' to 'button'
    expect(item).toHaveClass(styles.disabled);
    expect(item).toHaveAttribute('aria-disabled', 'true');
    
    fireEvent.click(item);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders active state', () => {
    render(<ListItem active>Active item</ListItem>);
    
    const item = screen.getByRole('listitem');
    expect(item).toHaveClass(styles.active);
  });

  it('renders with prefix and suffix', () => {
    render(
      <ListItem 
        prefix={<span data-testid="prefix">👤</span>}
        suffix={<span data-testid="suffix">→</span>}
      >
        Item with icons
      </ListItem>
    );
    
    expect(screen.getByTestId('prefix')).toBeInTheDocument();
    expect(screen.getByTestId('suffix')).toBeInTheDocument();
    expect(screen.getByText('Item with icons')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ListItem className="custom-item">Custom item</ListItem>);
    
    expect(screen.getByRole('listitem')).toHaveClass('custom-item');
  });
});

describe('DescriptionList', () => {
  const mockItems = [
    { term: 'Name', description: 'John Doe' },
    { term: 'Email', description: 'john@example.com' },
    { term: 'Age', description: '30 years old' },
  ];

  it('renders with vertical layout (default)', () => {
    render(<DescriptionList items={mockItems} />);
    
    const dl = document.querySelector('dl'); // Use direct DOM query since dl doesn't have role="list"
    expect(dl).toBeInTheDocument();
    expect(dl).toHaveClass(styles.descriptionList, styles.vertical, styles.medium);
    
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('renders with horizontal layout', () => {
    render(<DescriptionList items={mockItems} layout="horizontal" />);
    
    const dl = document.querySelector('dl');
    expect(dl).toBeInTheDocument();
    expect(dl).toHaveClass(styles.horizontal);
  });

  it('renders different sizes', () => {
    const { rerender } = render(<DescriptionList items={mockItems} size="small" />);
    expect(document.querySelector('dl')).toHaveClass(styles.small);

    rerender(<DescriptionList items={mockItems} size="large" />);
    expect(document.querySelector('dl')).toHaveClass(styles.large);
  });

  it('applies custom className', () => {
    render(<DescriptionList items={mockItems} className="custom-dl" />);
    
    expect(document.querySelector('dl')).toHaveClass('custom-dl');
  });

  it('renders complex term and description content', () => {
    const complexItems = [
      { 
        term: <strong>Important</strong>, 
        description: <em>This is emphasized</em> 
      },
    ];
    
    render(<DescriptionList items={complexItems} />);
    
    expect(screen.getByText('Important')).toBeInTheDocument();
    expect(screen.getByText('This is emphasized')).toBeInTheDocument();
  });
});

describe('OrderedList', () => {
  it('renders with default props', () => {
    render(
      <OrderedList>
        <SimpleListItem>First item</SimpleListItem>
        <SimpleListItem>Second item</SimpleListItem>
      </OrderedList>
    );
    
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    expect(list).toHaveClass(styles.orderedList);
    expect(list).toHaveAttribute('type', '1');
    
    expect(screen.getByText('First item')).toBeInTheDocument();
    expect(screen.getByText('Second item')).toBeInTheDocument();
  });

  it('renders different list types', () => {
    const { rerender } = render(
      <OrderedList type="A">
        <SimpleListItem>Item</SimpleListItem>
      </OrderedList>
    );
    expect(screen.getByRole('list')).toHaveAttribute('type', 'A');

    rerender(
      <OrderedList type="i">
        <SimpleListItem>Item</SimpleListItem>
      </OrderedList>
    );
    expect(screen.getByRole('list')).toHaveAttribute('type', 'i');
  });

  it('renders with custom start number', () => {
    render(
      <OrderedList start={5}>
        <SimpleListItem>Item</SimpleListItem>
      </OrderedList>
    );
    
    expect(screen.getByRole('list')).toHaveAttribute('start', '5');
  });

  it('applies custom className', () => {
    render(
      <OrderedList className="custom-ol">
        <SimpleListItem>Item</SimpleListItem>
      </OrderedList>
    );
    
    expect(screen.getByRole('list')).toHaveClass('custom-ol');
  });
});

describe('SimpleListItem', () => {
  it('renders basic list item', () => {
    render(<SimpleListItem>Simple item</SimpleListItem>);
    
    const item = screen.getByRole('listitem');
    expect(item).toBeInTheDocument();
    expect(item).toHaveClass(styles.simpleListItem);
    expect(screen.getByText('Simple item')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<SimpleListItem className="custom-simple-item">Custom item</SimpleListItem>);
    
    expect(screen.getByRole('listitem')).toHaveClass('custom-simple-item');
  });

  it('renders complex content', () => {
    render(
      <SimpleListItem>
        <strong>Bold text</strong> and <em>italic text</em>
      </SimpleListItem>
    );
    
    expect(screen.getByText('Bold text')).toBeInTheDocument();
    expect(screen.getByText('italic text')).toBeInTheDocument();
  });
});