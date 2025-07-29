#!/bin/bash

echo "🚀 Setting up distribution for React Project Boilerplate"

# 1. Create GitHub repository (manual step)
echo "1. Create a GitHub repository and push your code"
echo "   git remote add origin https://github.com/yourusername/react-project-boilerplate.git"
echo "   git push -u origin main"
echo ""

# 2. Enable GitHub template
echo "2. Enable GitHub template repository in repository settings"
echo ""

# 3. Prepare NPM package
echo "3. Publishing to NPM..."
echo "   Make sure you're logged in: npm login"
echo "   Then run: npm publish"
echo ""

# 4. Create release packages
echo "4. Creating release packages..."
npm run package -- --name react-boilerplate-v1.0 --author "Your Name"
echo ""

# 5. Docker setup
echo "5. To build Docker image:"
echo "   docker build -f Dockerfile.template -t yourusername/react-boilerplate ."
echo "   docker push yourusername/react-boilerplate"
echo ""

echo "✅ Distribution setup complete!"
echo ""
echo "Users can now:"
echo "  • Use GitHub template: Click 'Use this template' on GitHub"
echo "  • NPM: npx create-react-boilerplate my-project"
echo "  • Download: Get zip from releases"
echo "  • Docker: docker run --rm -v \$(pwd):/output yourusername/react-boilerplate my-project"