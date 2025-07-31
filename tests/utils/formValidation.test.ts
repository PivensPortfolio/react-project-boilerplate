import { describe, it, expect, vi } from 'vitest';
import {
  validationRules,
  asyncValidationRules,
  createValidationSchema,
  errorFormatters,
} from '../../src/utils/formValidation';

describe('validationRules', () => {
  describe('required', () => {
    const rule = validationRules.required();

    it('should return error for empty values', () => {
      expect(rule('')).toBe('This field is required');
      expect(rule(null)).toBe('This field is required');
      expect(rule(undefined)).toBe('This field is required');
      expect(rule([])).toBe('This field is required');
      expect(rule({})).toBe('This field is required');
    });

    it('should return undefined for valid values', () => {
      expect(rule('test')).toBeUndefined();
      expect(rule(0)).toBeUndefined();
      expect(rule(false)).toBeUndefined();
      expect(rule(['item'])).toBeUndefined();
      expect(rule({ key: 'value' })).toBeUndefined();
    });

    it('should use custom message', () => {
      const customRule = validationRules.required('Custom message');
      expect(customRule('')).toBe('Custom message');
    });
  });

  describe('email', () => {
    const rule = validationRules.email();

    it('should return undefined for empty values', () => {
      expect(rule('')).toBeUndefined();
      expect(rule(null as any)).toBeUndefined();
      expect(rule(undefined as any)).toBeUndefined();
    });

    it('should validate correct email formats', () => {
      expect(rule('test@example.com')).toBeUndefined();
      expect(rule('user.name@domain.co.uk')).toBeUndefined();
      expect(rule('test+tag@example.org')).toBeUndefined();
    });

    it('should return error for invalid email formats', () => {
      expect(rule('invalid-email')).toBe('Please enter a valid email address');
      expect(rule('test@')).toBe('Please enter a valid email address');
      expect(rule('@example.com')).toBe('Please enter a valid email address');
      expect(rule('test@example')).toBe('Please enter a valid email address');
    });

    it('should use custom message', () => {
      const customRule = validationRules.email('Invalid email');
      expect(customRule('invalid')).toBe('Invalid email');
    });
  });

  describe('minLength', () => {
    const rule = validationRules.minLength(5);

    it('should return undefined for empty values', () => {
      expect(rule('')).toBeUndefined();
    });

    it('should validate minimum length', () => {
      expect(rule('12345')).toBeUndefined();
      expect(rule('123456')).toBeUndefined();
    });

    it('should return error for short values', () => {
      expect(rule('1234')).toBe('Must be at least 5 characters long');
    });

    it('should use custom message', () => {
      const customRule = validationRules.minLength(3, 'Too short');
      expect(customRule('12')).toBe('Too short');
    });
  });

  describe('maxLength', () => {
    const rule = validationRules.maxLength(5);

    it('should return undefined for empty values', () => {
      expect(rule('')).toBeUndefined();
    });

    it('should validate maximum length', () => {
      expect(rule('12345')).toBeUndefined();
      expect(rule('1234')).toBeUndefined();
    });

    it('should return error for long values', () => {
      expect(rule('123456')).toBe('Must be no more than 5 characters long');
    });

    it('should use custom message', () => {
      const customRule = validationRules.maxLength(3, 'Too long');
      expect(customRule('1234')).toBe('Too long');
    });
  });

  describe('pattern', () => {
    const rule = validationRules.pattern(/^\d+$/, 'Must be numbers only');

    it('should return undefined for empty values', () => {
      expect(rule('')).toBeUndefined();
    });

    it('should validate pattern match', () => {
      expect(rule('12345')).toBeUndefined();
      expect(rule('0')).toBeUndefined();
    });

    it('should return error for pattern mismatch', () => {
      expect(rule('abc')).toBe('Must be numbers only');
      expect(rule('123abc')).toBe('Must be numbers only');
    });
  });

  describe('min', () => {
    const rule = validationRules.min(18);

    it('should return undefined for null/undefined values', () => {
      expect(rule(null as any)).toBeUndefined();
      expect(rule(undefined as any)).toBeUndefined();
    });

    it('should validate minimum value', () => {
      expect(rule(18)).toBeUndefined();
      expect(rule(25)).toBeUndefined();
    });

    it('should return error for values below minimum', () => {
      expect(rule(17)).toBe('Must be at least 18');
    });

    it('should use custom message', () => {
      const customRule = validationRules.min(21, 'Must be 21 or older');
      expect(customRule(20)).toBe('Must be 21 or older');
    });
  });

  describe('max', () => {
    const rule = validationRules.max(100);

    it('should return undefined for null/undefined values', () => {
      expect(rule(null as any)).toBeUndefined();
      expect(rule(undefined as any)).toBeUndefined();
    });

    it('should validate maximum value', () => {
      expect(rule(100)).toBeUndefined();
      expect(rule(50)).toBeUndefined();
    });

    it('should return error for values above maximum', () => {
      expect(rule(101)).toBe('Must be no more than 100');
    });

    it('should use custom message', () => {
      const customRule = validationRules.max(10, 'Too high');
      expect(customRule(11)).toBe('Too high');
    });
  });

  describe('url', () => {
    const rule = validationRules.url();

    it('should return undefined for empty values', () => {
      expect(rule('')).toBeUndefined();
    });

    it('should validate correct URLs', () => {
      expect(rule('https://example.com')).toBeUndefined();
      expect(rule('http://test.org')).toBeUndefined();
      expect(rule('https://sub.domain.com/path?query=1')).toBeUndefined();
    });

    it('should return error for invalid URLs', () => {
      expect(rule('not-a-url')).toBe('Please enter a valid URL');
      expect(rule('http://')).toBe('Please enter a valid URL');
    });
  });

  describe('phone', () => {
    const rule = validationRules.phone();

    it('should return undefined for empty values', () => {
      expect(rule('')).toBeUndefined();
    });

    it('should validate phone numbers', () => {
      expect(rule('1234567890')).toBeUndefined();
      expect(rule('+1234567890')).toBeUndefined();
      expect(rule('123-456-7890')).toBeUndefined();
      expect(rule('(123) 456-7890')).toBeUndefined();
    });

    it('should return error for invalid phone numbers', () => {
      expect(rule('abc')).toBe('Please enter a valid phone number');
      expect(rule('123')).toBe('Please enter a valid phone number');
    });
  });

  describe('password', () => {
    const rule = validationRules.password();

    it('should return undefined for empty values', () => {
      expect(rule('')).toBeUndefined();
    });

    it('should validate strong passwords', () => {
      expect(rule('Password123!')).toBeUndefined();
      expect(rule('MyStr0ng@Pass')).toBeUndefined();
    });

    it('should return error for weak passwords', () => {
      expect(rule('weak')).toContain('Password must contain');
      expect(rule('password')).toContain('one uppercase letter');
      expect(rule('PASSWORD')).toContain('one lowercase letter');
      expect(rule('Password')).toContain('one number');
      expect(rule('Password123')).toContain('one special character');
    });

    it('should respect custom options', () => {
      const customRule = validationRules.password({
        minLength: 6,
        requireSpecialChars: false,
      });
      expect(customRule('Pass12')).toBeUndefined();
    });
  });

  describe('number', () => {
    const rule = validationRules.number();

    it('should return undefined for empty values', () => {
      expect(rule('')).toBeUndefined();
      expect(rule(null)).toBeUndefined();
      expect(rule(undefined)).toBeUndefined();
    });

    it('should validate numbers', () => {
      expect(rule(123)).toBeUndefined();
      expect(rule('123')).toBeUndefined();
      expect(rule('123.45')).toBeUndefined();
      expect(rule('-123')).toBeUndefined();
    });

    it('should return error for non-numbers', () => {
      expect(rule('abc')).toBe('Must be a valid number');
      expect(rule('123abc')).toBe('Must be a valid number');
    });
  });

  describe('integer', () => {
    const rule = validationRules.integer();

    it('should return undefined for empty values', () => {
      expect(rule('')).toBeUndefined();
      expect(rule(null)).toBeUndefined();
      expect(rule(undefined)).toBeUndefined();
    });

    it('should validate integers', () => {
      expect(rule(123)).toBeUndefined();
      expect(rule('123')).toBeUndefined();
      expect(rule('-123')).toBeUndefined();
    });

    it('should return error for non-integers', () => {
      expect(rule('123.45')).toBe('Must be a whole number');
      expect(rule('abc')).toBe('Must be a whole number');
    });
  });

  describe('date', () => {
    const rule = validationRules.date();

    it('should return undefined for empty values', () => {
      expect(rule('')).toBeUndefined();
    });

    it('should validate dates', () => {
      expect(rule('2023-12-25')).toBeUndefined();
      expect(rule('12/25/2023')).toBeUndefined();
      expect(rule('December 25, 2023')).toBeUndefined();
    });

    it('should return error for invalid dates', () => {
      expect(rule('not-a-date')).toBe('Please enter a valid date');
      expect(rule('2023-13-45')).toBe('Please enter a valid date');
    });
  });

  describe('minAge', () => {
    const rule = validationRules.minAge(18);

    it('should return undefined for empty values', () => {
      expect(rule('')).toBeUndefined();
    });

    it('should validate minimum age', () => {
      const twentyYearsAgo = new Date();
      twentyYearsAgo.setFullYear(twentyYearsAgo.getFullYear() - 20);
      expect(rule(twentyYearsAgo.toISOString().split('T')[0])).toBeUndefined();
    });

    it('should return error for underage', () => {
      const tenYearsAgo = new Date();
      tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
      expect(rule(tenYearsAgo.toISOString().split('T')[0])).toBe('Must be at least 18 years old');
    });
  });
});

describe('asyncValidationRules', () => {
  describe('emailAvailable', () => {
    it('should return undefined for available emails', async () => {
      const rule = asyncValidationRules.emailAvailable();
      const result = await rule('available@example.com');
      expect(result).toBeUndefined();
    });

    it('should return error for taken emails', async () => {
      const rule = asyncValidationRules.emailAvailable();
      const result = await rule('taken@example.com');
      expect(result).toBe('Email is already taken');
    });

    it('should return undefined for empty values', async () => {
      const rule = asyncValidationRules.emailAvailable();
      const result = await rule('');
      expect(result).toBeUndefined();
    });
  });

  describe('usernameAvailable', () => {
    it('should return undefined for available usernames', async () => {
      const rule = asyncValidationRules.usernameAvailable();
      const result = await rule('available');
      expect(result).toBeUndefined();
    });

    it('should return error for taken usernames', async () => {
      const rule = asyncValidationRules.usernameAvailable();
      const result = await rule('taken');
      expect(result).toBe('Username is already taken');
    });
  });
});

describe('createValidationSchema', () => {
  interface TestForm {
    name: string;
    email: string;
    age: number;
  }

  it('should create validation schema using builder pattern', () => {
    const schema = createValidationSchema<TestForm>()
      .field('name')
        .required()
        .minLength(2)
        .and()
      .field('email')
        .required()
        .email()
        .and()
      .field('age')
        .required()
        .min(18)
        .and()
      .build();

    expect(schema.name).toHaveLength(2);
    expect(schema.email).toHaveLength(2);
    expect(schema.age).toHaveLength(2);

    // Test validation rules
    expect(schema.name[0]('')).toBe('This field is required');
    expect(schema.name[1]('a')).toBe('Must be at least 2 characters long');
    expect(schema.email[1]('invalid')).toBe('Please enter a valid email address');
    expect(schema.age[1](17)).toBe('Must be at least 18');
  });

  it('should support custom validation rules', () => {
    const schema = createValidationSchema<TestForm>()
      .field('name')
        .custom((value: string) => value === 'forbidden' ? 'Name is forbidden' : undefined)
        .and()
      .build();

    expect(schema.name[0]('forbidden')).toBe('Name is forbidden');
    expect(schema.name[0]('allowed')).toBeUndefined();
  });
});

describe('errorFormatters', () => {
  describe('formatError', () => {
    it('should capitalize first letter', () => {
      expect(errorFormatters.formatError('this is an error')).toBe('This is an error');
      expect(errorFormatters.formatError('ERROR')).toBe('ERROR');
    });
  });

  describe('formatErrors', () => {
    it('should return empty string for no errors', () => {
      expect(errorFormatters.formatErrors([])).toBe('');
    });

    it('should format single error', () => {
      expect(errorFormatters.formatErrors(['error message'])).toBe('Error message');
    });

    it('should format multiple errors', () => {
      expect(errorFormatters.formatErrors(['first error', 'second error']))
        .toBe('First error and Second error');
      
      expect(errorFormatters.formatErrors(['first', 'second', 'third']))
        .toBe('First, Second and Third');
    });
  });

  describe('getFieldDisplayName', () => {
    it('should convert camelCase to readable format', () => {
      expect(errorFormatters.getFieldDisplayName('firstName')).toBe('First Name');
      expect(errorFormatters.getFieldDisplayName('emailAddress')).toBe('Email Address');
      expect(errorFormatters.getFieldDisplayName('name')).toBe('Name');
    });
  });
});