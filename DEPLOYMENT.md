# Deployment Guide

This guide covers various deployment options for the React Project Boilerplate.

## Quick Start

### Local Development with Docker

```bash
# Start development environment
docker-compose up app

# Start production build locally
docker-compose --profile production up app-prod
```

### Using Deployment Scripts

```bash
# Linux/macOS
./scripts/deploy.sh local

# Windows PowerShell
.\scripts\deploy.ps1 -Environment local
```

## Environment Configuration

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Key variables to configure:

- `VITE_API_BASE_URL`: Your API endpoint
- `VITE_APP_ENVIRONMENT`: Current environment (development/staging/production)
- `VITE_ENABLE_ANALYTICS`: Enable/disable analytics
- `VITE_ENABLE_ERROR_REPORTING`: Enable/disable error reporting

### Environment-Specific Files

- `.env.development`: Development-specific variables
- `.env.production`: Production-specific variables
- `.env.local`: Local overrides (not committed to git)

## Docker Deployment

### Building the Image

```bash
# Build production image
docker build -t react-project-boilerplate .

# Build with specific tag
docker build -t react-project-boilerplate:v1.0.0 .
```

### Running the Container

```bash
# Run production container
docker run -p 8080:80 react-project-boilerplate

# Run with environment variables
docker run -p 8080:80 \
  -e VITE_API_BASE_URL=https://api.example.com \
  react-project-boilerplate
```

### Docker Compose

```bash
# Development environment
docker-compose up

# Production environment
docker-compose --profile production up

# Background mode
docker-compose up -d
```

## CI/CD with GitHub Actions

The project includes a comprehensive GitHub Actions workflow (`.github/workflows/ci.yml`) that:

1. **Code Quality**: Runs linting, formatting, and type checking
2. **Testing**: Executes unit tests and uploads coverage
3. **Security**: Performs vulnerability scanning
4. **Build**: Creates production build and Docker image
5. **Deploy**: Deploys to staging/production environments

### Required Secrets

Configure these secrets in your GitHub repository:

- `CODECOV_TOKEN`: For code coverage reporting
- `LHCI_GITHUB_APP_TOKEN`: For Lighthouse CI
- Additional secrets for your deployment targets

### Workflow Triggers

- **Push to main**: Triggers full pipeline including production deployment
- **Push to develop**: Triggers pipeline with staging deployment
- **Pull requests**: Runs quality checks, tests, and Lighthouse audit

## Platform-Specific Deployments

### Vercel

1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Set environment variables in Vercel dashboard

### Netlify

1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
3. Add environment variables in Netlify dashboard

### AWS S3 + CloudFront

```bash
# Build the application
npm run build

# Sync to S3 bucket
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### Kubernetes

Example Kubernetes deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: react-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: react-app
  template:
    metadata:
      labels:
        app: react-app
    spec:
      containers:
      - name: react-app
        image: ghcr.io/your-username/react-project-boilerplate:latest
        ports:
        - containerPort: 80
        env:
        - name: VITE_API_BASE_URL
          value: "https://api.example.com"
---
apiVersion: v1
kind: Service
metadata:
  name: react-app-service
spec:
  selector:
    app: react-app
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

## Performance Optimization

### Build Optimization

The build process includes:

- **Tree shaking**: Removes unused code
- **Code splitting**: Splits code into smaller chunks
- **Asset optimization**: Compresses images and other assets
- **Gzip compression**: Enabled in nginx configuration

### Caching Strategy

The nginx configuration includes:

- **Static assets**: Cached for 1 year
- **HTML files**: Cached for 1 hour
- **API responses**: No caching (configurable)

## Monitoring and Logging

### Health Checks

The Docker container includes a health check endpoint:

```bash
curl http://localhost:8080/health
```

### Logging

Nginx access and error logs are available:

```bash
# View logs in Docker container
docker logs <container-id>

# Follow logs
docker logs -f <container-id>
```

### Performance Monitoring

The project is configured for:

- **Lighthouse CI**: Automated performance audits
- **Web Vitals**: Core web vitals tracking
- **Error tracking**: Ready for Sentry integration

## Troubleshooting

### Common Issues

1. **Build failures**: Check Node.js version (requires 18+)
2. **Docker build issues**: Ensure Docker is running and has sufficient resources
3. **Environment variables**: Verify all required variables are set
4. **Port conflicts**: Ensure ports 5173, 3001, and 8080 are available

### Debug Mode

Enable debug mode for troubleshooting:

```bash
# Set debug environment variable
VITE_ENABLE_DEBUG_MODE=true npm run dev
```

### Container Debugging

```bash
# Access running container
docker exec -it <container-id> sh

# Check nginx configuration
docker exec <container-id> nginx -t

# View nginx logs
docker exec <container-id> cat /var/log/nginx/error.log
```

## Security Considerations

### Container Security

- Runs as non-root user
- Minimal base image (Alpine Linux)
- Security headers configured in nginx
- Regular security scanning in CI/CD

### Environment Variables

- Never commit sensitive data to git
- Use secrets management for production
- Validate all environment variables

### Content Security Policy

Configure CSP headers in nginx.conf for additional security:

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

## Scaling Considerations

### Horizontal Scaling

- Stateless application design
- Load balancer configuration
- Database connection pooling (if applicable)

### Vertical Scaling

- Monitor resource usage
- Adjust container resource limits
- Optimize bundle size

For more detailed information, refer to the main README.md file.