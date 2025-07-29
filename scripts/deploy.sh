#!/bin/bash

# Deployment script for React Project Boilerplate
# Usage: ./scripts/deploy.sh [environment] [version]

set -e

ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}
IMAGE_NAME="react-project-boilerplate"
REGISTRY="ghcr.io"

echo "🚀 Deploying $IMAGE_NAME:$VERSION to $ENVIRONMENT environment"

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
    echo "❌ Error: Environment must be 'staging' or 'production'"
    exit 1
fi

# Build Docker image
echo "📦 Building Docker image..."
docker build -t $IMAGE_NAME:$VERSION .

# Tag for registry
docker tag $IMAGE_NAME:$VERSION $REGISTRY/$IMAGE_NAME:$VERSION

# Push to registry (if not local deployment)
if [[ "$ENVIRONMENT" != "local" ]]; then
    echo "📤 Pushing to registry..."
    docker push $REGISTRY/$IMAGE_NAME:$VERSION
fi

# Deploy based on environment
case $ENVIRONMENT in
    "staging")
        echo "🔄 Deploying to staging..."
        # Add staging deployment commands here
        # Example: kubectl set image deployment/app app=$REGISTRY/$IMAGE_NAME:$VERSION -n staging
        ;;
    "production")
        echo "🔄 Deploying to production..."
        # Add production deployment commands here
        # Example: kubectl set image deployment/app app=$REGISTRY/$IMAGE_NAME:$VERSION -n production
        ;;
    "local")
        echo "🏠 Starting local deployment..."
        docker-compose -f docker-compose.yml --profile production up -d app-prod
        ;;
esac

echo "✅ Deployment completed successfully!"
echo "🌐 Application should be available at:"
case $ENVIRONMENT in
    "staging") echo "   https://staging.example.com" ;;
    "production") echo "   https://example.com" ;;
    "local") echo "   http://localhost:8080" ;;
esac