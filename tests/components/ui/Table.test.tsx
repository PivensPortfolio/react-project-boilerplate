import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Table } from '@/components/ui/Table';
import type { TableColumn } from '@/components/ui/Table';
import styles from '@/components/ui/Table.module.css';

interface TestData {
  id: string;
  name: string;
  age: number;
  email: string;
}

const mockData: TestData[] = [
  { id: '1', name: 'John Doe', age: 30, email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', age: 25, email: 'jane@example.com' },
  { id: '3', name: 'Bob Johnson', age: 35, email: 'bob@example.com' },
];

const mockColumns: TableColumn<TestData>[] = [
  {
    key: 'name',
    title: 'Name',
    dataIndex: 'name',
    sortable: true,
  },
  {
    key: 'age',
    title: 'Age',
    dataIndex: 'age',
    sortable: true,
    align: 'center',
  },
  {
    key: 'email',
    title: 'Email',
    dataIndex: 'email',
  },
  {
    key: 'actions',
    title: 'Actions',
    render: (_, record) => (
      <button onClick={() => console.log('Edit', record.id)}>Edit</button>
    ),
  },
];

describe('Table', () => {
  it('renders with basic data', () => {
    render(<Table columns={mockColumns} data={mockData} />);
    
    // Check headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
    
    // Check data
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    render(<Table columns={mockColumns} data={[]} />);
    
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('renders custom empty text', () => {
    render(<Table columns={mockColumns} data={[]} emptyText="No records found" />);
    
    expect(screen.getByText('No records found')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(<Table columns={mockColumns} data={mockData} loading />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('applies size classes', () => {
    const { rerender } = render(<Table columns={mockColumns} data={mockData} size="small" />);
    const table = screen.getByRole('table');
    expect(table).toHaveClass(styles.small);

    rerender(<Table columns={mockColumns} data={mockData} size="large" />);
    expect(table).toHaveClass(styles.large);
  });

  it('applies variant classes', () => {
    const { rerender } = render(<Table columns={mockColumns} data={mockData} bordered />);
    let table = screen.getByRole('table');
    expect(table).toHaveClass(styles.bordered);

    rerender(<Table columns={mockColumns} data={mockData} striped />);
    table = screen.getByRole('table');
    expect(table).toHaveClass(styles.striped);

    rerender(<Table columns={mockColumns} data={mockData} hoverable />);
    table = screen.getByRole('table');
    expect(table).toHaveClass(styles.hoverable);
  });

  it('handles sorting', () => {
    render(<Table columns={mockColumns} data={mockData} />);
    
    const nameHeader = screen.getByText('Name').closest('th');
    expect(nameHeader).toHaveClass(styles.sortableHeader);
    
    // Click to sort ascending
    fireEvent.click(nameHeader!);
    
    // Check if data is sorted (Bob should come first alphabetically)
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Bob Johnson');
    
    // Click again to sort descending
    fireEvent.click(nameHeader!);
    
    // Check if data is sorted descending (John should come first)
    const rowsDesc = screen.getAllByRole('row');
    expect(rowsDesc[1]).toHaveTextContent('John Doe');
  });

  it('handles row clicks', () => {
    const onRowClick = vi.fn();
    const onRow = () => ({ onClick: onRowClick });
    
    render(<Table columns={mockColumns} data={mockData} onRow={onRow} />);
    
    const firstDataRow = screen.getAllByRole('row')[1]; // Skip header row
    fireEvent.click(firstDataRow);
    
    expect(onRowClick).toHaveBeenCalledTimes(1);
  });

  it('renders custom cell content', () => {
    render(<Table columns={mockColumns} data={mockData} />);
    
    // Check that custom render function works
    expect(screen.getAllByText('Edit')).toHaveLength(3);
  });

  it('handles pagination', () => {
    const pagination = {
      current: 1,
      pageSize: 2,
      total: 3,
      onChange: vi.fn(),
    };
    
    render(<Table columns={mockColumns} data={mockData} pagination={pagination} />);
    
    // Check pagination info
    expect(screen.getByText('Showing 1-2 of 3 items')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    
    // Check pagination buttons
    const prevButton = screen.getByText('Previous');
    const nextButton = screen.getByText('Next');
    
    expect(prevButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();
    
    // Click next button
    fireEvent.click(nextButton);
    expect(pagination.onChange).toHaveBeenCalledWith(2, 2);
  });

  it('applies column alignment', () => {
    render(<Table columns={mockColumns} data={mockData} />);
    
    const ageHeader = screen.getByText('Age').closest('th');
    expect(ageHeader).toHaveStyle({ textAlign: 'center' });
  });

  it('uses custom row key function', () => {
    const customRowKey = (record: TestData) => `custom-${record.id}`;
    render(<Table columns={mockColumns} data={mockData} rowKey={customRowKey} />);
    
    // Check that rows are rendered (we can't easily test the key directly)
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Table columns={mockColumns} data={mockData} className="custom-table" />);
    
    const table = screen.getByRole('table');
    expect(table).toHaveClass('custom-table');
  });

  it('handles column width', () => {
    const columnsWithWidth = [
      { ...mockColumns[0], width: '200px' },
      ...mockColumns.slice(1),
    ];
    
    render(<Table columns={columnsWithWidth} data={mockData} />);
    
    const nameHeader = screen.getByText('Name').closest('th');
    expect(nameHeader).toHaveStyle({ width: '200px' });
  });

  it('renders sort icons for sortable columns', () => {
    render(<Table columns={mockColumns} data={mockData} />);
    
    const nameHeader = screen.getByText('Name').closest('th');
    const sortIcon = nameHeader?.querySelector(`.${styles.sortIcon}`);
    expect(sortIcon).toBeInTheDocument();
    
    const emailHeader = screen.getByText('Email').closest('th');
    const emailSortIcon = emailHeader?.querySelector(`.${styles.sortIcon}`);
    expect(emailSortIcon).not.toBeInTheDocument();
  });
});