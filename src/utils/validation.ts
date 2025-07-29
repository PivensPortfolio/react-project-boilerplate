/**
 * Validation utility functions
 */

/**
 * Validates an email address
 * @param email - Email to validate
 * @returns True if valid email, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a URL
 * @param url - URL to validate
 * @returns True if valid URL, false otherwise
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validates a phone number (basic validation)
 * @param phone - Phone number to validate
 * @returns True if valid phone, false otherwise
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns Object with validation results
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  if (!/\d/.test(password)) {
    feedback.push('Password must contain at least one number');
  } else {
    score += 1;
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push('Password must contain at least one special character');
  } else {
    score += 1;
  }

  return {
    isValid: score >= 4,
    score,
    feedback,
  };
};

/**
 * Validates required fields in an object
 * @param data - Object to validate
 * @param requiredFields - Array of required field names
 * @returns Object with validation results
 */
export const validateRequired = <T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): {
  isValid: boolean;
  errors: Record<keyof T, string>;
} => {
  const errors = {} as Record<keyof T, string>;

  requiredFields.forEach(field => {
    const value = data[field];
    if (value === null || value === undefined || value === '') {
      errors[field] = `${String(field)} is required`;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates string length
 * @param value - String to validate
 * @param min - Minimum length
 * @param max - Maximum length
 * @returns Validation result
 */
export const validateLength = (
  value: string,
  min: number,
  max?: number
): {
  isValid: boolean;
  error?: string;
} => {
  if (value.length < min) {
    return {
      isValid: false,
      error: `Must be at least ${min} characters long`,
    };
  }

  if (max && value.length > max) {
    return {
      isValid: false,
      error: `Must be no more than ${max} characters long`,
    };
  }

  return { isValid: true };
};

/**
 * Validates numeric range
 * @param value - Number to validate
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Validation result
 */
export const validateRange = (
  value: number,
  min?: number,
  max?: number
): {
  isValid: boolean;
  error?: string;
} => {
  if (min !== undefined && value < min) {
    return {
      isValid: false,
      error: `Must be at least ${min}`,
    };
  }

  if (max !== undefined && value > max) {
    return {
      isValid: false,
      error: `Must be no more than ${max}`,
    };
  }

  return { isValid: true };
};