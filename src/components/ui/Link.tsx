import React from 'react';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';
import styles from './Link.module.css';

export interface LinkProps extends Omit<RouterLinkProps, 'to'> {
  to?: string;
  href?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'muted' | 'danger';
  size?: 'small' | 'medium' | 'large';
  underline?: 'none' | 'hover' | 'always';
  external?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      to,
      href,
      variant = 'default',
      size = 'medium',
      underline = 'hover',
      external = false,
      disabled = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const linkClasses = [
      styles.link,
      styles[variant],
      styles[size],
      styles[underline],
      disabled && styles.disabled,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // Determine the actual URL to use
    const url = to || href;
    
    // Check if it's an external link
    const isExternal = external || (url && (url.startsWith('http') || url.startsWith('mailto:') || url.startsWith('tel:')));

    if (disabled) {
      return (
        <span
          className={linkClasses}
          aria-disabled="true"
          role="link"
        >
          {children}
        </span>
      );
    }

    if (isExternal && url) {
      return (
        <a
          ref={ref}
          href={url}
          className={linkClasses}
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
          <svg
            className={styles.externalIcon}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15,3 21,3 21,9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>
      );
    }

    if (url) {
      return (
        <RouterLink
          ref={ref}
          to={url}
          className={linkClasses}
          {...props}
        >
          {children}
        </RouterLink>
      );
    }

    // Fallback to regular anchor if no URL is provided
    return (
      <a
        ref={ref}
        className={linkClasses}
        {...props}
      >
        {children}
      </a>
    );
  }
);

Link.displayName = 'Link';