import React from 'react';
import { Checkbox, CheckboxProps } from './Checkbox';
import type { FormFieldProps } from '../../types/form';

export interface FormCheckboxProps extends Omit<CheckboxProps, 'checked' | 'onChange' | 'onBlur' | 'error'>, FormFieldProps<boolean> {
  showError?: boolean;
}

/**
 * Form-integrated Checkbox component that works with useForm hook
 */
export const FormCheckbox = React.forwardRef<HTMLInputElement, FormCheckboxProps>(
  (
    {
      name,
      value,
      error,
      touched,
      dirty,
      onChange,
      onBlur,
      disabled,
      required,
      showError = true,
      ...props
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.checked);
    };

    const handleBlur = () => {
      onBlur();
    };

    // Only show error if field has been touched and showError is true
    const displayError = showError && touched && error ? error : undefined;

    return (
      <Checkbox
        ref={ref}
        checked={value || false}
        onChange={handleChange}
        onBlur={handleBlur}
        error={displayError}
        disabled={disabled}
        required={required}
        {...props}
      />
    );
  }
);

FormCheckbox.displayName = 'FormCheckbox';