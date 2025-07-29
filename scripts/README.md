# Packaging and Distribution System

This directory contains scripts for packaging the React boilerplate into a distributable format.

## Overview

The packaging system creates a clean, distributable version of the React boilerplate with:
- Excluded development artifacts (node_modules, build files, etc.)
- Template variable replacement for project customization
- Cross-platform support (Windows, macOS, Linux)
- Automated zip archive creation

## Usage

### Quick Start

```bash
# Package with default settings
npm run package

# Package with custom project name
npm run package:custom my-awesome-app
```

### Advanced Usage

#### Node.js Script (Cross-platform)

```bash
# Basic usage
node scripts/package.js

# With custom project name
node scripts/package.js --name my-awesome-app

# With full customization
node scripts/package.js \
  --name my-todo-app \
  --author "John Doe" \
  --email john@example.com \
  --description "A simple todo application"
```

#### PowerShell Script (Windows)

```powershell
# Basic usage
.\scripts\package.ps1

# With parameters
.\scripts\package.ps1 -ProjectName "my-awesome-app" -AuthorName "John Doe"
```

#### Bash Script (Unix/Linux/macOS)

```bash
# Make executable (first time only)
chmod +x scripts/package.sh

# Basic usage
./scripts/package.sh

# With parameters
./scripts/package.sh --name my-awesome-app --author "John Doe"
```

## Command Line Options

| Option | Description | Default |
|--------|-------------|---------|
| `--name` | Project name | `my-react-app` |
| `--output` | Output directory name | `react-project-boilerplate-{date}` |
| `--author` | Author name | `Your Name` |
| `--email` | Author email | `your.email@example.com` |
| `--description` | Project description | `A React application built with modern tools` |

## Template Variables

The following template variables are automatically replaced in the packaged files:

- `{{PROJECT_NAME}}` - The project name
- `{{PROJECT_DESCRIPTION}}` - Project description
- `{{AUTHOR_NAME}}` - Author name
- `{{AUTHOR_EMAIL}}` - Author email address

### Files with Template Variables

- `package.json` - Project name, description, and author
- `README.md` - Project title and description
- `index.html` - Page title and meta description
- `CONTRIBUTING.md` - Project-specific contribution guidelines
- `DEPLOYMENT.md` - Deployment instructions with project name
- `COMPONENTS.md` - Component documentation

## Exclusion Patterns

The following files and directories are excluded from the package:

- `node_modules/` - Dependencies (will be installed fresh)
- `dist/` - Build artifacts
- `.git/` - Git repository data
- `.vscode/` - Editor settings
- `coverage/` - Test coverage reports
- `*.log` - Log files
- `.env.local`, `.env.*.local` - Local environment files
- `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml` - Lock files

## Output Structure

```
dist-packages/
└── my-awesome-app-2024-01-15/
    ├── src/
    ├── public/
    ├── .kiro/
    ├── scripts/
    ├── package.json
    ├── README.md
    └── ... (other project files)
└── my-awesome-app-2024-01-15.zip
```

## Configuration

You can customize the packaging behavior by modifying `scripts/package.config.js`:

```javascript
export const PACKAGE_CONFIG = {
  templateVariables: {
    // Add custom template variables
  },
  excludePatterns: [
    // Add custom exclusion patterns
  ],
  templateFiles: [
    // Add files that should be processed for template variables
  ]
};
```

## Troubleshooting

### Zip Creation Issues

If zip creation fails:

1. **Windows**: Ensure PowerShell execution policy allows scripts
2. **Unix/Linux**: Ensure `zip` command is installed
3. **Manual**: You can manually zip the created directory

### Permission Issues

On Unix-like systems, make scripts executable:

```bash
chmod +x scripts/package.sh
```

### Node.js Issues

Ensure Node.js 18+ is installed:

```bash
node --version
npm --version
```

## Integration with CI/CD

You can integrate the packaging system into your CI/CD pipeline:

```yaml
# GitHub Actions example
- name: Package boilerplate
  run: |
    npm ci
    npm run package -- --name ${{ github.event.repository.name }}
    
- name: Upload package
  uses: actions/upload-artifact@v3
  with:
    name: react-boilerplate-package
    path: dist-packages/*.zip
```

## Development

To modify the packaging system:

1. Edit `scripts/package.js` for core functionality
2. Update `scripts/package.config.js` for configuration
3. Modify platform-specific scripts (`package.ps1`, `package.sh`) as needed
4. Test across different platforms and scenarios