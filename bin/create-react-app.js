#!/usr/bin/env node

import { packageBoilerplate } from '../scripts/package.js';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const args = process.argv.slice(2);
const projectName = args[0];

if (!projectName) {
  console.log('Usage: create-react-boilerplate <project-name>');
  process.exit(1);
}

console.log(`Creating React project: ${projectName}`);

try {
  // Package the boilerplate
  const result = packageBoilerplate({
    projectName,
    outputName: projectName,
  });

  // Move to current directory
  const currentDir = process.cwd();
  const targetDir = path.join(currentDir, projectName);
  
  if (fs.existsSync(targetDir)) {
    console.error(`Directory ${projectName} already exists!`);
    process.exit(1);
  }

  // Copy the packaged directory
  fs.renameSync(result.packageDir, targetDir);
  
  console.log(`\n✅ Project created successfully!`);
  console.log(`\nNext steps:`);
  console.log(`  cd ${projectName}`);
  console.log(`  npm install`);
  console.log(`  npm run dev`);
  
} catch (error) {
  console.error('Failed to create project:', error.message);
  process.exit(1);
}