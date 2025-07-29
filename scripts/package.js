#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '..');
const PACKAGE_NAME = 'react-project-boilerplate';
const OUTPUT_DIR = path.resolve(PROJECT_ROOT, '..', 'dist-packages');

// Files and directories to exclude from the package
const EXCLUDE_PATTERNS = [
  'node_modules',
  'dist',
  '.git',
  '.vscode',
  'coverage',
  '*.log',
  '.DS_Store',
  'Thumbs.db',
  '.env.local',
  '.env.development.local',
  '.env.test.local',
  '.env.production.local',
  'package-lock.json', // Will be regenerated
  'yarn.lock',
  'pnpm-lock.yaml'
];

// Template variables that can be replaced
const TEMPLATE_VARIABLES = {
  '{{PROJECT_NAME}}': 'my-react-app',
  '{{PROJECT_DESCRIPTION}}': 'A React application built with modern tools',
  '{{AUTHOR_NAME}}': 'Your Name',
  '{{AUTHOR_EMAIL}}': 'your.email@example.com'
};

/**
 * Check if a file/directory should be excluded
 */
function shouldExclude(filePath, basePath) {
  const relativePath = path.relative(basePath, filePath);
  
  return EXCLUDE_PATTERNS.some(pattern => {
    if (pattern.includes('*')) {
      // Handle glob patterns
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(relativePath) || regex.test(path.basename(filePath));
    }
    
    // Handle exact matches and directory names
    return relativePath === pattern || 
           relativePath.startsWith(pattern + path.sep) ||
           path.basename(filePath) === pattern;
  });
}

/**
 * Copy files recursively with exclusions
 */
function copyFiles(src, dest, basePath = src) {
  if (shouldExclude(src, basePath)) {
    console.log(`Excluding: ${path.relative(basePath, src)}`);
    return;
  }

  const stat = fs.statSync(src);
  
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const files = fs.readdirSync(src);
    files.forEach(file => {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);
      copyFiles(srcPath, destPath, basePath);
    });
  } else {
    fs.copyFileSync(src, dest);
    console.log(`Copied: ${path.relative(basePath, src)}`);
  }
}

/**
 * Replace template variables in file content
 */
function replaceTemplateVariables(content, customVariables = {}) {
  const variables = { ...TEMPLATE_VARIABLES, ...customVariables };
  
  let result = content;
  Object.entries(variables).forEach(([placeholder, value]) => {
    const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g');
    result = result.replace(regex, value);
  });
  
  return result;
}

/**
 * Process template files and replace variables
 */
function processTemplateFiles(packageDir, customVariables = {}) {
  const filesToProcess = [
    'package.json',
    'README.md',
    'index.html',
    'CONTRIBUTING.md',
    'DEPLOYMENT.md',
    'COMPONENTS.md'
  ];

  filesToProcess.forEach(fileName => {
    const filePath = path.join(packageDir, fileName);
    
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const processedContent = replaceTemplateVariables(content, customVariables);
      fs.writeFileSync(filePath, processedContent);
      console.log(`Processed template variables in: ${fileName}`);
    }
  });
}

/**
 * Create a zip archive
 */
function createZipArchive(sourceDir, outputPath) {
  try {
    // Try using PowerShell Compress-Archive on Windows
    if (process.platform === 'win32') {
      const command = `powershell -Command "Compress-Archive -Path '${sourceDir}\\*' -DestinationPath '${outputPath}' -Force"`;
      execSync(command, { stdio: 'inherit' });
    } else {
      // Use zip command on Unix-like systems
      const command = `cd "${path.dirname(sourceDir)}" && zip -r "${outputPath}" "${path.basename(sourceDir)}"`;
      execSync(command, { stdio: 'inherit' });
    }
    console.log(`✅ Created zip archive: ${outputPath}`);
  } catch (error) {
    console.error('❌ Failed to create zip archive:', error.message);
    console.log('💡 You can manually zip the directory:', sourceDir);
  }
}

/**
 * Main packaging function
 */
function packageBoilerplate(options = {}) {
  const {
    projectName = 'my-react-app',
    outputName = `${PACKAGE_NAME}-${new Date().toISOString().split('T')[0]}`,
    customVariables = {}
  } = options;

  console.log('🚀 Starting packaging process...');
  console.log(`📦 Project: ${projectName}`);
  console.log(`📁 Output: ${outputName}`);

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const packageDir = path.join(OUTPUT_DIR, outputName);
  const zipPath = `${packageDir}.zip`;

  // Remove existing package directory
  if (fs.existsSync(packageDir)) {
    fs.rmSync(packageDir, { recursive: true, force: true });
  }

  // Copy files
  console.log('\n📋 Copying files...');
  copyFiles(PROJECT_ROOT, packageDir);

  // Process template variables
  console.log('\n🔄 Processing template variables...');
  const allCustomVariables = {
    '{{PROJECT_NAME}}': projectName,
    ...customVariables
  };
  processTemplateFiles(packageDir, allCustomVariables);

  // Create package.json with correct name
  const packageJsonPath = path.join(packageDir, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.name = projectName;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`Updated package.json name to: ${projectName}`);
  }

  // Create zip archive
  console.log('\n📦 Creating zip archive...');
  createZipArchive(packageDir, zipPath);

  console.log('\n✅ Packaging complete!');
  console.log(`📁 Package directory: ${packageDir}`);
  console.log(`📦 Zip archive: ${zipPath}`);
  
  return {
    packageDir,
    zipPath,
    success: true
  };
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];

    switch (key) {
      case '--config':
        // Load configuration from JSON file
        try {
          const configPath = path.resolve(value);
          const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
          
          // Map config file properties to options
          if (configData.projectName) options.projectName = configData.projectName;
          if (configData.outputName) options.outputName = configData.outputName;
          
          // Handle custom variables
          options.customVariables = options.customVariables || {};
          if (configData.description) {
            options.customVariables['{{PROJECT_DESCRIPTION}}'] = configData.description;
          }
          if (configData.author) {
            options.customVariables['{{AUTHOR_NAME}}'] = configData.author;
          }
          if (configData.email) {
            options.customVariables['{{AUTHOR_EMAIL}}'] = configData.email;
          }
          
          // Merge any additional custom variables
          if (configData.customVariables) {
            Object.assign(options.customVariables, configData.customVariables);
          }
        } catch (error) {
          console.error(`❌ Failed to load config file: ${error.message}`);
          process.exit(1);
        }
        break;
      case '--name':
        options.projectName = value;
        break;
      case '--output':
        options.outputName = value;
        break;
      case '--author':
        options.customVariables = options.customVariables || {};
        options.customVariables['{{AUTHOR_NAME}}'] = value;
        break;
      case '--email':
        options.customVariables = options.customVariables || {};
        options.customVariables['{{AUTHOR_EMAIL}}'] = value;
        break;
      case '--description':
        options.customVariables = options.customVariables || {};
        options.customVariables['{{PROJECT_DESCRIPTION}}'] = value;
        break;
      case '--help':
        console.log(`
Usage: node package.js [options]

Options:
  --config <file>         Load configuration from JSON file
  --name <name>           Project name (default: my-react-app)
  --output <name>         Output directory name
  --author <name>         Author name
  --email <email>         Author email
  --description <desc>    Project description
  --help                  Show this help message

Examples:
  node package.js --name my-awesome-app --author "John Doe" --email john@example.com
  node package.js --name todo-app --description "A simple todo application"
  node package.js --config scripts/package.example.json
        `);
        process.exit(0);
        break;
    }
  }

  try {
    packageBoilerplate(options);
  } catch (error) {
    console.error('❌ Packaging failed:', error.message);
    process.exit(1);
  }
}

export { packageBoilerplate, TEMPLATE_VARIABLES, EXCLUDE_PATTERNS };