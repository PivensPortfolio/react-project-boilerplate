import {
  delay,
  generateId,
  capitalize,
  toKebabCase,
  toCamelCase,
  truncate,
  removeDuplicates,
  groupBy,
  sortBy,
  isEmpty,
  deepClone,
  deepMerge,
} from '../../src/utils/common';

describe('Common Utilities', () => {
  describe('delay', () => {
    it('should delay execution', async () => {
      const start = Date.now();
      await delay(100);
      const end = Date.now();
      expect(end - start).toBeGreaterThanOrEqual(100);
    });
  });

  describe('generateId', () => {
    it('should generate an ID of default length', () => {
      const id = generateId();
      expect(id).toHaveLength(8);
      expect(typeof id).toBe('string');
    });

    it('should generate an ID of specified length', () => {
      const id = generateId(12);
      expect(id).toHaveLength(12);
    });

    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('HELLO')).toBe('Hello');
      expect(capitalize('hELLO')).toBe('Hello');
    });

    it('should handle empty string', () => {
      expect(capitalize('')).toBe('');
    });
  });

  describe('toKebabCase', () => {
    it('should convert to kebab-case', () => {
      expect(toKebabCase('HelloWorld')).toBe('hello-world');
      expect(toKebabCase('hello world')).toBe('hello-world');
      expect(toKebabCase('hello_world')).toBe('hello-world');
    });
  });

  describe('toCamelCase', () => {
    it('should convert to camelCase', () => {
      expect(toCamelCase('hello world')).toBe('helloWorld');
      expect(toCamelCase('hello-world')).toBe('helloWorld');
      expect(toCamelCase('Hello World')).toBe('helloWorld');
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      expect(truncate('Hello World', 5)).toBe('He...');
      expect(truncate('Hello World', 5, '---')).toBe('He---');
    });

    it('should not truncate short strings', () => {
      expect(truncate('Hi', 5)).toBe('Hi');
    });
  });

  describe('removeDuplicates', () => {
    it('should remove duplicates from primitive array', () => {
      expect(removeDuplicates([1, 2, 2, 3, 3, 4])).toEqual([1, 2, 3, 4]);
    });

    it('should remove duplicates from object array with key function', () => {
      const items = [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
        { id: 1, name: 'John Doe' },
      ];
      const result = removeDuplicates(items, item => item.id);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });
  });

  describe('groupBy', () => {
    it('should group array by key function', () => {
      const items = [
        { category: 'A', value: 1 },
        { category: 'B', value: 2 },
        { category: 'A', value: 3 },
      ];
      const result = groupBy(items, item => item.category);
      expect(result.A).toHaveLength(2);
      expect(result.B).toHaveLength(1);
    });

    it('should group array by property name', () => {
      const items = [
        { category: 'A', value: 1 },
        { category: 'B', value: 2 },
        { category: 'A', value: 3 },
      ];
      const result = groupBy(items, 'category');
      expect(result.A).toHaveLength(2);
      expect(result.B).toHaveLength(1);
    });
  });

  describe('sortBy', () => {
    it('should sort array by key ascending', () => {
      const items = [
        { name: 'Charlie', age: 30 },
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 35 },
      ];
      const result = sortBy(items, 'age');
      expect(result[0].age).toBe(25);
      expect(result[2].age).toBe(35);
    });

    it('should sort array by key descending', () => {
      const items = [
        { name: 'Charlie', age: 30 },
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 35 },
      ];
      const result = sortBy(items, 'age', 'desc');
      expect(result[0].age).toBe(35);
      expect(result[2].age).toBe(25);
    });
  });

  describe('isEmpty', () => {
    it('should detect empty values', () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('   ')).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
    });

    it('should detect non-empty values', () => {
      expect(isEmpty('hello')).toBe(false);
      expect(isEmpty([1])).toBe(false);
      expect(isEmpty({ a: 1 })).toBe(false);
      expect(isEmpty(0)).toBe(false);
      expect(isEmpty(false)).toBe(false);
    });
  });

  describe('deepClone', () => {
    it('should deep clone objects', () => {
      const original = {
        a: 1,
        b: {
          c: 2,
          d: [3, 4, { e: 5 }],
        },
      };
      const cloned = deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.b).not.toBe(original.b);
      expect(cloned.b.d).not.toBe(original.b.d);
    });

    it('should handle primitive values', () => {
      expect(deepClone(42)).toBe(42);
      expect(deepClone('hello')).toBe('hello');
      expect(deepClone(null)).toBe(null);
    });

    it('should handle dates', () => {
      const date = new Date();
      const cloned = deepClone(date);
      expect(cloned).toEqual(date);
      expect(cloned).not.toBe(date);
    });
  });

  describe('deepMerge', () => {
    it('should merge objects deeply', () => {
      const target = {
        a: 1,
        b: {
          c: 2,
          d: 3,
        },
      };
      const source = {
        b: {
          d: 4,
          e: 5,
        },
        f: 6,
      };
      
      const result = deepMerge(target, source);
      
      expect(result).toEqual({
        a: 1,
        b: {
          c: 2,
          d: 4,
          e: 5,
        },
        f: 6,
      });
    });
  });
});