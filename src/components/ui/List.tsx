import React from 'react';
import styles from './List.module.css';

export interface ListProps {
  children: React.ReactNode;
  variant?: 'default' | 'bordered' | 'divided';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export interface ListItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  className?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export interface DescriptionListProps {
  items: Array<{
    term: React.ReactNode;
    description: React.ReactNode;
  }>;
  layout?: 'horizontal' | 'vertical';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const List: React.FC<ListProps> = ({
  children,
  variant = 'default',
  size = 'medium',
  className = '',
}) => {
  const listClasses = [
    styles.list,
    styles[variant],
    styles[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <ul className={listClasses}>{children}</ul>;
};

export const ListItem: React.FC<ListItemProps> = ({
  children,
  onClick,
  disabled = false,
  active = false,
  className = '',
  prefix,
  suffix,
}) => {
  const itemClasses = [
    styles.listItem,
    onClick && styles.clickable,
    disabled && styles.disabled,
    active && styles.active,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = () => {
    if (onClick && !disabled) {
      onClick();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onClick && !disabled && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick();
    }
  };

  const itemProps = {
    className: itemClasses,
    onClick: onClick ? handleClick : undefined,
    onKeyDown: onClick ? handleKeyDown : undefined,
    tabIndex: onClick && !disabled ? 0 : undefined,
    role: onClick ? 'button' : undefined,
    'aria-disabled': disabled,
  };

  return (
    <li {...itemProps}>
      <div className={styles.itemContent}>
        {prefix && <div className={styles.prefix}>{prefix}</div>}
        <div className={styles.content}>{children}</div>
        {suffix && <div className={styles.suffix}>{suffix}</div>}
      </div>
    </li>
  );
};

export const DescriptionList: React.FC<DescriptionListProps> = ({
  items,
  layout = 'vertical',
  size = 'medium',
  className = '',
}) => {
  const dlClasses = [
    styles.descriptionList,
    styles[layout],
    styles[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <dl className={dlClasses}>
      {items.map((item, index) => (
        <div key={index} className={styles.descriptionItem}>
          <dt className={styles.term}>{item.term}</dt>
          <dd className={styles.description}>{item.description}</dd>
        </div>
      ))}
    </dl>
  );
};

// Ordered List component
export interface OrderedListProps {
  children: React.ReactNode;
  type?: '1' | 'A' | 'a' | 'I' | 'i';
  start?: number;
  className?: string;
}

export const OrderedList: React.FC<OrderedListProps> = ({
  children,
  type = '1',
  start,
  className = '',
}) => {
  const listClasses = [styles.orderedList, className].filter(Boolean).join(' ');

  return (
    <ol className={listClasses} type={type} start={start}>
      {children}
    </ol>
  );
};

// Simple list item for ordered/unordered lists
export interface SimpleListItemProps {
  children: React.ReactNode;
  className?: string;
}

export const SimpleListItem: React.FC<SimpleListItemProps> = ({
  children,
  className = '',
}) => {
  const itemClasses = [styles.simpleListItem, className].filter(Boolean).join(' ');

  return <li className={itemClasses}>{children}</li>;
};

List.displayName = 'List';
ListItem.displayName = 'ListItem';
DescriptionList.displayName = 'DescriptionList';
OrderedList.displayName = 'OrderedList';
SimpleListItem.displayName = 'SimpleListItem';