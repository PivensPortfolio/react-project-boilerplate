/**
 * Form validation utilities with common validation rules
 */

import type { ValidationRule, AsyncValidationRule } from '../types/form';

// Common validation rules
export const validationRules = {
  /**
   * Required field validation
   */
  required: (message = 'This field is required'): ValidationRule => {
    return (value: any) => {
      if (value === null || value === undefined || value === '' || 
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === 'object' && Object.keys(value).length === 0)) {
        return message;
      }
      return undefined;
    };
  },

  /**
   * Email validation
   */
  email: (message = 'Please enter a valid email address'): ValidationRule<string> => {
    return (value: string) => {
      if (!value) return undefined; // Let required handle empty values
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) ? undefined : message;
    };
  },

  /**
   * Minimum length validation
   */
  minLength: (min: number, message?: string): ValidationRule<string> => {
    return (value: string) => {
      if (!value) return undefined; // Let required handle empty values
      const actualMessage = message || `Must be at least ${min} characters long`;
      return value.length >= min ? undefined : actualMessage;
    };
  },

  /**
   * Maximum length validation
   */
  maxLength: (max: number, message?: string): ValidationRule<string> => {
    return (value: string) => {
      if (!value) return undefined; // Let required handle empty values
      const actualMessage = message || `Must be no more than ${max} characters long`;
      return value.length <= max ? undefined : actualMessage;
    };
  },

  /**
   * Pattern validation (regex)
   */
  pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule<string> => {
    return (value: string) => {
      if (!value) return undefined; // Let required handle empty values
      return regex.test(value) ? undefined : message;
    };
  },

  /**
   * Minimum value validation
   */
  min: (minValue: number, message?: string): ValidationRule<number> => {
    return (value: number) => {
      if (value === null || value === undefined) return undefined;
      const actualMessage = message || `Must be at least ${minValue}`;
      return value >= minValue ? undefined : actualMessage;
    };
  },

  /**
   * Maximum value validation
   */
  max: (maxValue: number, message?: string): ValidationRule<number> => {
    return (value: number) => {
      if (value === null || value === undefined) return undefined;
      const actualMessage = message || `Must be no more than ${maxValue}`;
      return value <= maxValue ? undefined : actualMessage;
    };
  },

  /**
   * URL validation
   */
  url: (message = 'Please enter a valid URL'): ValidationRule<string> => {
    return (value: string) => {
      if (!value) return undefined; // Let required handle empty values
      try {
        new URL(value);
        return undefined;
      } catch {
        return message;
      }
    };
  },

  /**
   * Phone number validation (basic)
   */
  phone: (message = 'Please enter a valid phone number'): ValidationRule<string> => {
    return (value: string) => {
      if (!value) return undefined; // Let required handle empty values
      const phoneRegex = /^[\+]?[1-9][\d]{3,15}$/; // Require at least 4 digits total
      const cleanValue = value.replace(/[\s\-\(\)]/g, '');
      return phoneRegex.test(cleanValue) ? undefined : message;
    };
  },

  /**
   * Password strength validation
   */
  password: (options: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
  } = {}): ValidationRule<string> => {
    const {
      minLength = 8,
      requireUppercase = true,
      requireLowercase = true,
      requireNumbers = true,
      requireSpecialChars = true,
    } = options;

    return (value: string) => {
      if (!value) return undefined; // Let required handle empty values

      const errors: string[] = [];

      if (value.length < minLength) {
        errors.push(`at least ${minLength} characters`);
      }

      if (requireUppercase && !/[A-Z]/.test(value)) {
        errors.push('one uppercase letter');
      }

      if (requireLowercase && !/[a-z]/.test(value)) {
        errors.push('one lowercase letter');
      }

      if (requireNumbers && !/\d/.test(value)) {
        errors.push('one number');
      }

      if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
        errors.push('one special character');
      }

      if (errors.length > 0) {
        return `Password must contain ${errors.join(', ')}`;
      }

      return undefined;
    };
  },

  /**
   * Confirm password validation
   */
  confirmPassword: (passwordField: string, message = 'Passwords do not match'): ValidationRule => {
    return (value: string, formValues?: Record<string, any>) => {
      if (!value) return undefined; // Let required handle empty values
      if (!formValues || formValues[passwordField] !== value) {
        return message;
      }
      return undefined;
    };
  },

  /**
   * Number validation
   */
  number: (message = 'Must be a valid number'): ValidationRule => {
    return (value: any) => {
      if (value === null || value === undefined || value === '') return undefined;
      const numValue = Number(value);
      return !isNaN(numValue) && isFinite(numValue) ? undefined : message;
    };
  },

  /**
   * Integer validation
   */
  integer: (message = 'Must be a whole number'): ValidationRule => {
    return (value: any) => {
      if (value === null || value === undefined || value === '') return undefined;
      const numValue = Number(value);
      return Number.isInteger(numValue) ? undefined : message;
    };
  },

  /**
   * Date validation
   */
  date: (message = 'Please enter a valid date'): ValidationRule<string> => {
    return (value: string) => {
      if (!value) return undefined; // Let required handle empty values
      const date = new Date(value);
      return !isNaN(date.getTime()) ? undefined : message;
    };
  },

  /**
   * Future date validation
   */
  futureDate: (message = 'Date must be in the future'): ValidationRule<string> => {
    return (value: string) => {
      if (!value) return undefined; // Let required handle empty values
      const date = new Date(value);
      const now = new Date();
      return date > now ? undefined : message;
    };
  },

  /**
   * Past date validation
   */
  pastDate: (message = 'Date must be in the past'): ValidationRule<string> => {
    return (value: string) => {
      if (!value) return undefined; // Let required handle empty values
      const date = new Date(value);
      const now = new Date();
      return date < now ? undefined : message;
    };
  },

  /**
   * Age validation (minimum age)
   */
  minAge: (minAge: number, message?: string): ValidationRule<string> => {
    return (value: string) => {
      if (!value) return undefined; // Let required handle empty values
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
        ? age - 1 
        : age;

      const actualMessage = message || `Must be at least ${minAge} years old`;
      return actualAge >= minAge ? undefined : actualMessage;
    };
  },
};

// Async validation rules
export const asyncValidationRules = {
  /**
   * Check if email is available (example)
   */
  emailAvailable: (message = 'Email is already taken'): AsyncValidationRule<string> => {
    return async (value: string) => {
      if (!value) return undefined;
      
      // Simulate API call
      return new Promise((resolve) => {
        setTimeout(() => {
          // Mock logic - emails ending with 'taken' are considered unavailable
          const isAvailable = !value.toLowerCase().includes('taken');
          resolve(isAvailable ? undefined : message);
        }, 500);
      });
    };
  },

  /**
   * Check if username is available (example)
   */
  usernameAvailable: (message = 'Username is already taken'): AsyncValidationRule<string> => {
    return async (value: string) => {
      if (!value) return undefined;
      
      // Simulate API call
      return new Promise((resolve) => {
        setTimeout(() => {
          // Mock logic - usernames ending with 'taken' are considered unavailable
          const isAvailable = !value.toLowerCase().includes('taken');
          resolve(isAvailable ? undefined : message);
        }, 500);
      });
    };
  },
};

// Validation schema builder
export class ValidationSchemaBuilder<T extends Record<string, any>> {
  private schema: Record<keyof T, ValidationRule<T[keyof T]>[]> = {} as any;

  field<K extends keyof T>(fieldName: K): FieldValidationBuilder<T, K> {
    return new FieldValidationBuilder(this, fieldName);
  }

  build() {
    return this.schema;
  }

  addRule<K extends keyof T>(fieldName: K, rule: ValidationRule<T[K]>) {
    if (!this.schema[fieldName]) {
      this.schema[fieldName] = [];
    }
    this.schema[fieldName].push(rule);
    return this;
  }
}

class FieldValidationBuilder<T extends Record<string, any>, K extends keyof T> {
  constructor(
    private schemaBuilder: ValidationSchemaBuilder<T>,
    private fieldName: K
  ) {}

  required(message?: string) {
    this.schemaBuilder.addRule(this.fieldName, validationRules.required(message) as ValidationRule<T[K]>);
    return this;
  }

  email(message?: string) {
    this.schemaBuilder.addRule(this.fieldName, validationRules.email(message) as ValidationRule<T[K]>);
    return this;
  }

  minLength(min: number, message?: string) {
    this.schemaBuilder.addRule(this.fieldName, validationRules.minLength(min, message) as ValidationRule<T[K]>);
    return this;
  }

  maxLength(max: number, message?: string) {
    this.schemaBuilder.addRule(this.fieldName, validationRules.maxLength(max, message) as ValidationRule<T[K]>);
    return this;
  }

  pattern(regex: RegExp, message?: string) {
    this.schemaBuilder.addRule(this.fieldName, validationRules.pattern(regex, message) as ValidationRule<T[K]>);
    return this;
  }

  min(minValue: number, message?: string) {
    this.schemaBuilder.addRule(this.fieldName, validationRules.min(minValue, message) as ValidationRule<T[K]>);
    return this;
  }

  max(maxValue: number, message?: string) {
    this.schemaBuilder.addRule(this.fieldName, validationRules.max(maxValue, message) as ValidationRule<T[K]>);
    return this;
  }

  custom(rule: ValidationRule<T[K]>) {
    this.schemaBuilder.addRule(this.fieldName, rule);
    return this;
  }

  and() {
    return this.schemaBuilder;
  }
}

// Utility function to create validation schema
export function createValidationSchema<T extends Record<string, any>>(): ValidationSchemaBuilder<T> {
  return new ValidationSchemaBuilder<T>();
}

// Error formatting utilities
export const errorFormatters = {
  /**
   * Format validation errors for display
   */
  formatError: (error: string): string => {
    return error.charAt(0).toUpperCase() + error.slice(1);
  },

  /**
   * Format multiple errors
   */
  formatErrors: (errors: string[]): string => {
    if (errors.length === 0) return '';
    if (errors.length === 1) return errorFormatters.formatError(errors[0]);
    
    const formatted = errors.map(error => errorFormatters.formatError(error));
    const last = formatted.pop();
    return `${formatted.join(', ')} and ${last}`;
  },

  /**
   * Get field display name
   */
  getFieldDisplayName: (fieldName: string): string => {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  },
};