import React, { useState, useMemo } from 'react';
import styles from './Table.module.css';

export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  rowKey?: keyof T | ((record: T) => string);
  onRow?: (record: T, index: number) => {
    onClick?: () => void;
    onDoubleClick?: () => void;
  };
  size?: 'small' | 'medium' | 'large';
  bordered?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  className?: string;
  emptyText?: string;
}

type SortOrder = 'asc' | 'desc' | null;

export const Table = <T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  pagination,
  rowKey = 'id',
  onRow,
  size = 'medium',
  bordered = false,
  striped = false,
  hoverable = true,
  className = '',
  emptyText = 'No data',
}: TableProps<T>) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return String(record[rowKey] || index);
  };

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : sortOrder === 'desc' ? null : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortOrder('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortOrder) return data;

    const column = columns.find(col => col.key === sortColumn);
    if (!column || !column.sortable) return data;

    return [...data].sort((a, b) => {
      const aValue = column.dataIndex ? a[column.dataIndex] : a[sortColumn];
      const bValue = column.dataIndex ? b[column.dataIndex] : b[sortColumn];

      if (aValue === bValue) return 0;
      
      const comparison = aValue < bValue ? -1 : 1;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [data, sortColumn, sortOrder, columns]);

  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    
    const start = (pagination.current - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, pagination]);

  const tableClasses = [
    styles.table,
    styles[size],
    bordered && styles.bordered,
    striped && styles.striped,
    hoverable && styles.hoverable,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const renderSortIcon = (column: TableColumn<T>) => {
    if (!column.sortable) return null;

    const isActive = sortColumn === column.key;
    const order = isActive ? sortOrder : null;

    return (
      <span className={styles.sortIcon}>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`${styles.sortArrow} ${order === 'asc' ? styles.active : ''}`}
        >
          <path d="M7 14l5-5 5 5" />
        </svg>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`${styles.sortArrow} ${order === 'desc' ? styles.active : ''}`}
        >
          <path d="M7 10l5 5 5-5" />
        </svg>
      </span>
    );
  };

  const renderCell = (column: TableColumn<T>, record: T, index: number) => {
    const value = column.dataIndex ? record[column.dataIndex] : record[column.key];
    
    if (column.render) {
      return column.render(value, record, index);
    }
    
    return value;
  };

  const renderPagination = () => {
    if (!pagination) return null;

    const { current, pageSize, total, onChange } = pagination;
    const totalPages = Math.ceil(total / pageSize);
    const startItem = (current - 1) * pageSize + 1;
    const endItem = Math.min(current * pageSize, total);

    return (
      <div className={styles.pagination}>
        <div className={styles.paginationInfo}>
          Showing {startItem}-{endItem} of {total} items
        </div>
        <div className={styles.paginationControls}>
          <button
            className={styles.paginationButton}
            disabled={current === 1}
            onClick={() => onChange(current - 1, pageSize)}
          >
            Previous
          </button>
          <span className={styles.paginationCurrent}>
            Page {current} of {totalPages}
          </span>
          <button
            className={styles.paginationButton}
            disabled={current === totalPages}
            onClick={() => onChange(current + 1, pageSize)}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.tableWrapper}>
        <table className={tableClasses}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{
                    width: column.width,
                    textAlign: column.align || 'left',
                  }}
                  className={column.sortable ? styles.sortableHeader : ''}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                >
                  <div className={styles.headerContent}>
                    {column.title}
                    {renderSortIcon(column)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.emptyCell}>
                  {emptyText}
                </td>
              </tr>
            ) : (
              paginatedData.map((record, index) => {
                const key = getRowKey(record, index);
                const rowProps = onRow ? onRow(record, index) : {};
                
                return (
                  <tr
                    key={key}
                    className={styles.row}
                    onClick={rowProps.onClick}
                    onDoubleClick={rowProps.onDoubleClick}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        style={{ textAlign: column.align || 'left' }}
                      >
                        {renderCell(column, record, index)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {renderPagination()}
    </div>
  );
};

Table.displayName = 'Table';