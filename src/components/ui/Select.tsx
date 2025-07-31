import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from './Select.module.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  size?: 'small' | 'medium' | 'large';
  error?: string;
  success?: string;
  helperText?: string;
  placeholder?: string;
  options: SelectOption[];
  fullWidth?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  onClear?: () => void;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      size = 'medium',
      error,
      success,
      helperText,
      placeholder = 'Select an option...',
      options,
      fullWidth = false,
      searchable = false,
      clearable = false,
      onClear,
      className = '',
      required,
      value,
      onChange,
      onFocus,
      onBlur,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const filteredOptions = searchable
      ? options.filter(option =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options;

    const selectedOption = options.find(option => option.value === value);

    const handleToggle = useCallback(() => {
      if (disabled) return;
      setIsOpen(!isOpen);
      setSearchTerm('');
      setFocusedIndex(-1);
    }, [isOpen, disabled]);

    const handleOptionSelect = useCallback(
      (option: SelectOption) => {
        if (option.disabled) return;
        
        const syntheticEvent = {
          target: { value: option.value },
          currentTarget: { value: option.value },
        } as React.ChangeEvent<HTMLSelectElement>;
        
        onChange?.(syntheticEvent);
        setIsOpen(false);
        setSearchTerm('');
        setFocusedIndex(-1);
      },
      [onChange]
    );

    const handleClear = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        const syntheticEvent = {
          target: { value: '' },
          currentTarget: { value: '' },
        } as React.ChangeEvent<HTMLSelectElement>;
        
        onChange?.(syntheticEvent);
        onClear?.();
      },
      [onChange, onClear]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        switch (e.key) {
          case 'Enter':
          case ' ':
            if (!isOpen) {
              e.preventDefault();
              setIsOpen(true);
            } else if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
              e.preventDefault();
              handleOptionSelect(filteredOptions[focusedIndex]);
            }
            break;
          case 'Escape':
            if (isOpen) {
              e.preventDefault();
              setIsOpen(false);
              setSearchTerm('');
              setFocusedIndex(-1);
            }
            break;
          case 'ArrowDown':
            e.preventDefault();
            if (!isOpen) {
              setIsOpen(true);
            } else {
              setFocusedIndex(prev => 
                prev < filteredOptions.length - 1 ? prev + 1 : 0
              );
            }
            break;
          case 'ArrowUp':
            e.preventDefault();
            if (isOpen) {
              setFocusedIndex(prev => 
                prev > 0 ? prev - 1 : filteredOptions.length - 1
              );
            }
            break;
          case 'Tab':
            if (isOpen) {
              setIsOpen(false);
              setSearchTerm('');
              setFocusedIndex(-1);
            }
            break;
        }
      },
      [isOpen, focusedIndex, filteredOptions, handleOptionSelect]
    );

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSearchTerm('');
          setFocusedIndex(-1);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);

    // Focus search input when dropdown opens
    useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen, searchable]);

    const selectClasses = [
      styles.select,
      styles[size],
      error && styles.error,
      success && !error && styles.success,
      isOpen && styles.open,
      disabled && styles.disabled,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const wrapperClasses = [
      styles.selectWrapper,
      fullWidth && styles.fullWidth,
    ]
      .filter(Boolean)
      .join(' ');

    const displayError = error;
    const showSuccess = success && !displayError;

    return (
      <div className={wrapperClasses}>
        {label && (
          <label className={`${styles.label} ${required ? styles.required : ''}`}>
            {label}
          </label>
        )}
        
        <div className={styles.selectContainer} ref={containerRef}>
          {/* Hidden native select for form submission */}
          <select
            ref={ref}
            value={value || ''}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            required={required}
            disabled={disabled}
            className={styles.hiddenSelect}
            aria-hidden="true"
            tabIndex={-1}
            {...props}
          >
            <option value="">{placeholder}</option>
            {options.map(option => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Custom select display */}
          <div
            className={selectClasses}
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            tabIndex={disabled ? -1 : 0}
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-invalid={!!displayError}
            aria-describedby={
              displayError
                ? `${props.id || 'select'}-error`
                : showSuccess
                ? `${props.id || 'select'}-success`
                : helperText
                ? `${props.id || 'select'}-helper`
                : undefined
            }
          >
            <span className={styles.selectedValue}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            
            <div className={styles.selectActions}>
              {clearable && value && (
                <button
                  type="button"
                  className={styles.clearButton}
                  onClick={handleClear}
                  aria-label="Clear selection"
                >
                  ×
                </button>
              )}
              <span className={styles.chevron} aria-hidden="true">
                ▼
              </span>
            </div>
          </div>

          {/* Dropdown */}
          {isOpen && (
            <div className={styles.dropdown} role="listbox">
              {searchable && (
                <div className={styles.searchContainer}>
                  <input
                    ref={searchInputRef}
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search options..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
              
              <div className={styles.optionsList}>
                {filteredOptions.length === 0 ? (
                  <div className={styles.noOptions}>No options found</div>
                ) : (
                  filteredOptions.map((option, index) => (
                    <div
                      key={option.value}
                      className={`${styles.option} ${
                        option.value === value ? styles.selected : ''
                      } ${
                        index === focusedIndex ? styles.focused : ''
                      } ${
                        option.disabled ? styles.optionDisabled : ''
                      }`}
                      onClick={() => handleOptionSelect(option)}
                      role="option"
                      aria-selected={option.value === value}
                      aria-disabled={option.disabled}
                    >
                      {option.label}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {displayError && (
          <div
            id={`${props.id || 'select'}-error`}
            className={styles.errorMessage}
            role="alert"
          >
            <span>⚠</span>
            {displayError}
          </div>
        )}

        {showSuccess && (
          <div
            id={`${props.id || 'select'}-success`}
            className={styles.successMessage}
          >
            <span>✓</span>
            {success}
          </div>
        )}

        {helperText && !displayError && !showSuccess && (
          <div
            id={`${props.id || 'select'}-helper`}
            className={styles.helperText}
          >
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';