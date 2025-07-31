import React from 'react';
import styles from './Card.module.css';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated' | 'filled';
  padding?: 'none' | 'small' | 'medium' | 'large';
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  disabled?: boolean;
}

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  alignment?: 'left' | 'center' | 'right' | 'space-between';
}

export const Card: React.FC<CardProps> = React.memo(({
  children,
  variant = 'default',
  padding = 'medium',
  className = '',
  onClick,
  hoverable = false,
  disabled = false,
}) => {
  const cardClasses = React.useMemo(() => [
    styles.card,
    styles[variant],
    styles[padding],
    hoverable && styles.hoverable,
    disabled && styles.disabled,
    onClick && styles.clickable,
    className,
  ]
    .filter(Boolean)
    .join(' '), [variant, padding, hoverable, disabled, onClick, className]);

  const handleClick = React.useCallback(() => {
    if (onClick && !disabled) {
      onClick();
    }
  }, [onClick, disabled]);

  const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    if (onClick && !disabled && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick();
    }
  }, [onClick, disabled]);

  const cardProps = React.useMemo(() => ({
    className: cardClasses,
    onClick: onClick ? handleClick : undefined,
    onKeyDown: onClick ? handleKeyDown : undefined,
    tabIndex: onClick && !disabled ? 0 : undefined,
    role: onClick ? 'button' : undefined,
    'aria-disabled': disabled,
  }), [cardClasses, onClick, handleClick, handleKeyDown, disabled]);

  return <div {...cardProps}>{children}</div>;
});

export const CardHeader: React.FC<CardHeaderProps> = React.memo(({
  children,
  className = '',
}) => {
  const headerClasses = React.useMemo(() => [styles.header, className].filter(Boolean).join(' '), [className]);

  return <div className={headerClasses}>{children}</div>;
});

export const CardBody: React.FC<CardBodyProps> = React.memo(({
  children,
  className = '',
}) => {
  const bodyClasses = React.useMemo(() => [styles.body, className].filter(Boolean).join(' '), [className]);

  return <div className={bodyClasses}>{children}</div>;
});

export const CardFooter: React.FC<CardFooterProps> = React.memo(({
  children,
  className = '',
  alignment = 'left',
}) => {
  const alignmentClass = alignment === 'space-between' ? styles.spaceBetween : styles[alignment];
  
  const footerClasses = React.useMemo(() => [
    styles.footer,
    alignmentClass,
    className,
  ]
    .filter(Boolean)
    .join(' '), [alignmentClass, className]);

  return <div className={footerClasses}>{children}</div>;
});

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardBody.displayName = 'CardBody';
CardFooter.displayName = 'CardFooter';