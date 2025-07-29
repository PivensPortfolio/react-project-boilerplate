/**
 * Configuration file for the packaging system
 * This file defines the default settings and can be customized per project
 */

export const PACKAGE_CONFIG = {
  // Default template variables
  templateVariables: {
    '{{PROJECT_NAME}}': 'my-react-app',
    '{{PROJECT_DESCRIPTION}}': 'A React application built with modern tools',
    '{{AUTHOR_NAME}}': 'Your Name',
    '{{AUTHOR_EMAIL}}': 'your.email@example.com'
  },

  // Files and directories to exclude from the package
  excludePatterns: [
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
    'pnpm-lock.yaml',
    // Exclude the dist-packages directory to avoid recursive packaging
    'dist-packages'
  ],

  // Files that should have template variables processed
  templateFiles: [
    'package.json',
    'README.md',
    'index.html',
    'CONTRIBUTING.md',
    'DEPLOYMENT.md',
    'COMPONENTS.md',
    'src/App.tsx',
    'public/manifest.json'
  ],

  // Output configuration
  output: {
    directory: '../dist-packages',
    nameFormat: 'react-project-boilerplate-{date}', // {date} will be replaced with current date
    includeTimestamp: true
  },

  // Archive settings
  archive: {
    format: 'zip', // Currently only zip is supported
    compression: 'default'
  }
};

export default PACKAGE_CONFIG;