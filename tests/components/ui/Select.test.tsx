import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Select } from '../../../src/components/ui/Select';

const mockOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
];

describe('Select', () => {
  it('renders without crashing', () => {
    const { container } = render(<Select options={mockOptions} />);
    expect(container).toBeDefined();
  });
});