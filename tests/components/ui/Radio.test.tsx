import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Radio, RadioGroup } from '../../../src/components/ui/Radio';

const mockOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
];

describe('Radio', () => {
  it('renders without crashing', () => {
    const { container } = render(<Radio name="test" value="test" />);
    expect(container).toBeDefined();
  });
});

describe('RadioGroup', () => {
  it('renders without crashing', () => {
    const { container } = render(<RadioGroup name="test-group" options={mockOptions} />);
    expect(container).toBeDefined();
  });
});