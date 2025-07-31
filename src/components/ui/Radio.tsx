import React, { useId } from 'react';
import styles from './Radio.module.css';

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
  helperText?: string;
}

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  size?: 'small' | 'medium' | 'large';
  error?: string;
  helperText?: string;
  variant?: 'default' | 'card';
  children?: React.ReactNode;
}

export interface RadioGroupProps {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  options: RadioOption[];
  size?: 'small' | 'medium' | 'large';
  error?: string;
  helperText?: string;
  variant?: 'default' | 'card';
  orientation?: 'horizontal' | 'vertical';
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      label,
      size = 'medium',
      error,
      helperText,
      variant = 'default',
      children,
      className = '',
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const radioId = id || generatedId;

    const radioClasses = [
      styles.radio,
      styles[size],
      styles[variant],
      error && styles.error,
      disabled && styles.disabled,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const wrapperClasses = [
      styles.radioWrapper,
      variant === 'card' && styles.cardWrapper,
    ]
      .filter(Boolean)
      .join(' ');

    const content = children || label;

    return (
      <div className={wrapperClasses}>
        <div className={styles.radioContainer}>
          <input
            ref={ref}
            type="radio"
            id={radioId}
            className={radioClasses}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${radioId}-error`
                : helperText
                ? `${radioId}-helper`
                : undefined
            }
            {...props}
          />
          
          <div className={styles.radioIndicator} aria-hidden="true">
            <span className={styles.radioInner}></span>
          </div>

          {content && (
            <label
              htmlFor={radioId}
              className={`${styles.label} ${disabled ? styles.labelDisabled : ''}`}
            >
              {content}
            </label>
          )}
        </div>

        {error && (
          <div
            id={`${radioId}-error`}
            className={styles.errorMessage}
            role="alert"
          >
            <span>⚠</span>
            {error}
          </div>
        )}

        {helperText && !error && (
          <div
            id={`${radioId}-helper`}
            className={styles.helperText}
          >
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  value,
  onChange,
  options,
  size = 'medium',
  error,
  helperText,
  variant = 'default',
  orientation = 'vertical',
  label,
  required,
  disabled,
  className = '',
}) => {
  const groupId = useId();

  const handleChange = (optionValue: string) => {
    onChange?.(optionValue);
  };

  const groupClasses = [
    styles.radioGroup,
    styles[orientation],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <fieldset className={styles.fieldset} disabled={disabled}>
      {label && (
        <legend className={`${styles.legend} ${required ? styles.required : ''}`}>
          {label}
        </legend>
      )}
      
      <div className={groupClasses} role="radiogroup" aria-invalid={!!error}>
        {options.map((option, index) => (
          <Radio
            key={option.value}
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => handleChange(option.value)}
            size={size}
            variant={variant}
            disabled={disabled || option.disabled}
            helperText={option.helperText}
            id={`${groupId}-${index}`}
          >
            {option.label}
          </Radio>
        ))}
      </div>

      {error && (
        <div className={styles.groupErrorMessage} role="alert">
          <span>⚠</span>
          {error}
        </div>
      )}

      {helperText && !error && (
        <div className={styles.groupHelperText}>
          {helperText}
        </div>
      )}
    </fieldset>
  );
};