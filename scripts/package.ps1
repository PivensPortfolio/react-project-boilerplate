#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Package the React boilerplate for distribution

.DESCRIPTION
    Creates a distributable zip archive of the React project boilerplate with
    customizable project name and template variables.

.PARAMETER ProjectName
    The name for the new project (default: my-react-app)

.PARAMETER OutputName
    Custom output directory name

.PARAMETER AuthorName
    Author name to replace in templates

.PARAMETER AuthorEmail
    Author email to replace in templates

.PARAMETER Description
    Project description to replace in templates

.EXAMPLE
    .\package.ps1 -ProjectName "my-awesome-app" -AuthorName "John Doe"

.EXAMPLE
    .\package.ps1 -ProjectName "todo-app" -Description "A simple todo application"
#>

param(
    [string]$ProjectName = "my-react-app",
    [string]$OutputName = "",
    [string]$AuthorName = "",
    [string]$AuthorEmail = "",
    [string]$Description = ""
)

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

# Build arguments for Node.js script
$NodeArgs = @()

if ($ProjectName) {
    $NodeArgs += "--name", $ProjectName
}

if ($OutputName) {
    $NodeArgs += "--output", $OutputName
}

if ($AuthorName) {
    $NodeArgs += "--author", $AuthorName
}

if ($AuthorEmail) {
    $NodeArgs += "--email", $AuthorEmail
}

if ($Description) {
    $NodeArgs += "--description", $Description
}

# Check if Node.js is available
try {
    $NodeVersion = node --version
    Write-Host "✅ Node.js version: $NodeVersion" -ForegroundColor Green
} catch {
    Write-Error "❌ Node.js is not installed or not in PATH"
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Run the Node.js packaging script
Write-Host "🚀 Running packaging script..." -ForegroundColor Cyan

try {
    $PackageScript = Join-Path $ScriptDir "package.js"
    
    if ($NodeArgs.Count -gt 0) {
        & node $PackageScript @NodeArgs
    } else {
        & node $PackageScript
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Packaging completed successfully!" -ForegroundColor Green
    } else {
        Write-Error "❌ Packaging failed with exit code $LASTEXITCODE"
        exit $LASTEXITCODE
    }
} catch {
    Write-Error "❌ Failed to run packaging script: $($_.Exception.Message)"
    exit 1
}