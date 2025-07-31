// Simple test to verify basic functionality
console.log('Starting simple test...');

import { execSync } from 'child_process';

try {
  console.log('Running: npx vitest --version');
  const version = execSync('npx vitest --version', { encoding: 'utf8', timeout: 5000 });
  console.log('Vitest version:', version.trim());
  
  console.log('Test completed successfully');
  process.exit(0);
} catch (error) {
  console.error('Test failed:', error.message);
  process.exit(1);
}