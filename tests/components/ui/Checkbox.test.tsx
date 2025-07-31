import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Checkbox } from '../../../src/components/ui/Checkbox';

describe('Checkbox', () => {
  it('renders without crashing', () => {
    const { container } = render(<Checkbox />);
    expect(container).toBeDefined();
  });
});