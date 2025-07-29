# GitHub Setup Script for Windows PowerShell
# Run this script to set up your GitHub repository

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubUsername,
    
    [Parameter(Mandatory=$false)]
    [string]$RepositoryName = "react-project-boilerplate"
)

Write-Host "Setting up GitHub repository for React Project Boilerplate" -ForegroundColor Green
Write-Host ""

# Check if git is installed
try {
    git --version | Out-Null
    Write-Host "Git is installed" -ForegroundColor Green
} catch {
    Write-Host "Git is not installed. Please install Git first." -ForegroundColor Red
    exit 1
}

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "Git repository initialized" -ForegroundColor Green
} else {
    Write-Host "Git repository already exists" -ForegroundColor Green
}

# Add all files
Write-Host "Adding files to Git..." -ForegroundColor Yellow
git add .

# Create initial commit
Write-Host "Creating initial commit..." -ForegroundColor Yellow
git commit -m "Initial commit: React Project Boilerplate v1.0"

# Set up remote
$remoteUrl = "https://github.com/$GitHubUsername/$RepositoryName.git"
Write-Host "Setting up remote: $remoteUrl" -ForegroundColor Yellow

try {
    git remote add origin $remoteUrl
    Write-Host "Remote added successfully" -ForegroundColor Green
} catch {
    Write-Host "Remote might already exist, updating..." -ForegroundColor Yellow
    git remote set-url origin $remoteUrl
}

# Set main branch
git branch -M main

Write-Host ""
Write-Host "Local setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to GitHub.com and create a new repository named '$RepositoryName'" -ForegroundColor White
Write-Host "2. Make sure it's PUBLIC and DON'T initialize with README/gitignore/license" -ForegroundColor White
Write-Host "3. Run this command to push your code:" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. After pushing, enable template repository:" -ForegroundColor White
Write-Host "   - Go to repository Settings" -ForegroundColor White
Write-Host "   - Check 'Template repository'" -ForegroundColor White
Write-Host "   - Save changes" -ForegroundColor White
Write-Host ""
Write-Host "5. Create your first release:" -ForegroundColor White
Write-Host "   - Go to Releases and Create new release" -ForegroundColor White
Write-Host "   - Tag: v1.0.0" -ForegroundColor White
Write-Host "   - Title: React Project Boilerplate v1.0.0" -ForegroundColor White
Write-Host ""
Write-Host "Repository URL: https://github.com/$GitHubUsername/$RepositoryName" -ForegroundColor Green