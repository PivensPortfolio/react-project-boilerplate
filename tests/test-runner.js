#!/usr/bin/env node

import { execSync } from 'child_process';
import { glob } from 'glob';
import path from 'path';

const testFiles = glob.sync('tests/**/*.test.{ts,tsx}', { 
  cwd: process.cwd(),
  ignore: ['node_modules/**']
});

console.log(`Found ${testFiles.length} test files`);

let passed = 0;
let failed = 0;

for (const testFile of testFiles) {
  try {
    console.log(`\n🧪 Running ${testFile}...`);
    execSync(`npx vitest run ${testFile}`, { 
      stdio: 'inherit',
      timeout: 30000
    });
    console.log(`✅ ${testFile} passed`);
    passed++;
  } catch (error) {
    console.log(`❌ ${testFile} failed`);
    failed++;
  }
}

console.log(`\n📊 Test Results:`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📁 Total: ${testFiles.length}`);

process.exit(failed > 0 ? 1 : 0);