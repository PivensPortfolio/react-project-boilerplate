# Deployment script for React Project Boilerplate (PowerShell)
# Usage: .\scripts\deploy.ps1 -Environment staging -Version latest

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("staging", "production", "local")]
    [string]$Environment = "staging",
    
    [Parameter(Mandatory=$false)]
    [string]$Version = "latest"
)

$ImageName = "react-project-boilerplate"
$Registry = "ghcr.io"

Write-Host "🚀 Deploying $ImageName`:$Version to $Environment environment" -ForegroundColor Green

try {
    # Build Docker image
    Write-Host "📦 Building Docker image..." -ForegroundColor Yellow
    docker build -t "$ImageName`:$Version" .
    
    if ($LASTEXITCODE -ne 0) {
        throw "Docker build failed"
    }

    # Tag for registry
    docker tag "$ImageName`:$Version" "$Registry/$ImageName`:$Version"

    # Push to registry (if not local deployment)
    if ($Environment -ne "local") {
        Write-Host "📤 Pushing to registry..." -ForegroundColor Yellow
        docker push "$Registry/$ImageName`:$Version"
        
        if ($LASTEXITCODE -ne 0) {
            throw "Docker push failed"
        }
    }

    # Deploy based on environment
    switch ($Environment) {
        "staging" {
            Write-Host "🔄 Deploying to staging..." -ForegroundColor Yellow
            # Add staging deployment commands here
            # Example: kubectl set image deployment/app app=$Registry/$ImageName:$Version -n staging
        }
        "production" {
            Write-Host "🔄 Deploying to production..." -ForegroundColor Yellow
            # Add production deployment commands here
            # Example: kubectl set image deployment/app app=$Registry/$ImageName:$Version -n production
        }
        "local" {
            Write-Host "🏠 Starting local deployment..." -ForegroundColor Yellow
            docker-compose -f docker-compose.yml --profile production up -d app-prod
        }
    }

    Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
    Write-Host "🌐 Application should be available at:" -ForegroundColor Cyan
    
    switch ($Environment) {
        "staging" { Write-Host "   https://staging.example.com" -ForegroundColor Cyan }
        "production" { Write-Host "   https://example.com" -ForegroundColor Cyan }
        "local" { Write-Host "   http://localhost:8080" -ForegroundColor Cyan }
    }
}
catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}