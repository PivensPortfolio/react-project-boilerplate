# Test Timeout Monitoring and Management

This steering file provides guidelines for monitoring and handling test timeouts during NPM test execution.

## Test Execution Monitoring

### Timeout Detection
- Monitor test execution time and detect when tests are running longer than expected
- Set reasonable timeout thresholds based on test type:
  - Unit tests: 5-10 seconds maximum
  - Integration tests: 15-30 seconds maximum
  - E2E tests: 60 seconds maximum
- Automatically terminate tests that exceed these thresholds

### Test Command Modifications
When running any NPM test command, always include timeout and termination flags:

```bash
# For Vitest (current setup)
npm run test -- --run --reporter=verbose --timeout=10000

# For Jest (if used)
npm test -- --testTimeout=10000 --forceExit

# For Playwright E2E tests
npx playwright test --timeout=30000
```

### Automatic Test Termination
- Use `--run` flag to prevent watch mode from hanging
- Set explicit timeouts using `--timeout` or `--testTimeout` flags
- Use `--forceExit` when available to ensure process termination
- Monitor process execution time and kill hanging processes after reasonable timeout

### Common Timeout Causes and Solutions

#### 1. Async Operations Without Proper Cleanup
```typescript
// Problem: Hanging promises or timers
useEffect(() => {
  const timer = setTimeout(() => {
    // Some operation
  }, 1000);
  // Missing cleanup
}, []);

// Solution: Always cleanup
useEffect(() => {
  const timer = setTimeout(() => {
    // Some operation
  }, 1000);
  return () => clearTimeout(timer);
}, []);
```

#### 2. Unresolved Promises in Tests
```typescript
// Problem: Test doesn't wait for async operations
test('async operation', () => {
  fetchData(); // Promise not awaited
  expect(result).toBe(expected);
});

// Solution: Properly await async operations
test('async operation', async () => {
  await fetchData();
  expect(result).toBe(expected);
});
```

#### 3. Event Listeners Not Cleaned Up
```typescript
// Problem: Event listeners causing memory leaks
beforeEach(() => {
  window.addEventListener('resize', handler);
});

// Solution: Clean up in afterEach
afterEach(() => {
  window.removeEventListener('resize', handler);
});
```

#### 4. Mock Timers Not Restored
```typescript
// Problem: Fake timers not restored
beforeEach(() => {
  vi.useFakeTimers();
});

// Solution: Always restore timers
afterEach(() => {
  vi.useRealTimers();
});
```

### Test Execution Strategy

#### Pre-execution Checks
Before running tests, verify:
- No hanging processes from previous test runs
- Test files exist and are accessible
- Dependencies are properly installed
- Test configuration is valid

#### During Execution
- Monitor console output for hanging indicators
- Watch for tests that don't produce output for extended periods
- Track memory usage to detect leaks
- Log test execution times

#### Post-execution Cleanup
- Ensure all test processes are terminated
- Clean up temporary files and resources
- Reset any global state modifications
- Report timeout incidents for investigation

### Timeout Prevention Best Practices

#### Test Structure
```typescript
// Use proper test timeouts
test('component renders correctly', async () => {
  // Test implementation
}, 5000); // 5 second timeout

// Use waitFor with timeouts
await waitFor(() => {
  expect(element).toBeInTheDocument();
}, { timeout: 3000 });

// Use proper cleanup
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.clearAllTimers();
});
```

#### Mock Management
```typescript
// Properly mock async operations
vi.mock('./api', () => ({
  fetchData: vi.fn().mockResolvedValue(mockData),
}));

// Mock timers when needed
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});
```

### Emergency Test Termination

If tests are hanging during execution:

1. **Immediate Termination**: Use Ctrl+C or process kill
2. **Process Cleanup**: Kill any remaining Node.js processes
3. **Resource Cleanup**: Clear temporary files and reset state
4. **Investigation**: Review test logs for hanging causes
5. **Prevention**: Add appropriate timeouts and cleanup

### Monitoring Commands

Use these commands to monitor and manage test execution:

```bash
# Run tests with strict timeout
npm run test -- --run --timeout=10000 --reporter=verbose

# Monitor test processes
ps aux | grep node
ps aux | grep vitest

# Kill hanging test processes (if needed)
pkill -f vitest
pkill -f node.*test
```

### Configuration Updates

Ensure test configuration includes proper timeout settings:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    testTimeout: 10000, // 10 second timeout
    hookTimeout: 5000,  // 5 second hook timeout
    teardownTimeout: 5000,
    // Force exit after tests complete
    forceRerunTriggers: [],
  },
});
```

## Implementation Guidelines

When executing any test command:

1. **Always use `--run` flag** to prevent watch mode
2. **Set explicit timeouts** appropriate for test type
3. **Monitor execution time** and terminate if exceeded
4. **Use verbose reporting** to track progress
5. **Clean up resources** after test completion
6. **Log timeout incidents** for analysis

This approach ensures tests complete in reasonable time and prevents endless hanging that wastes development time and resources.