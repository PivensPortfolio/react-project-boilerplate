#!/bin/bash

# GitHub Setup Script for Unix/Linux/macOS
# Run this script to set up your GitHub repository

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Get GitHub username
if [ -z "$1" ]; then
    echo -e "${RED}Usage: $0 <github-username> [repository-name]${NC}"
    echo -e "${WHITE}Example: $0 johndoe react-project-boilerplate${NC}"
    exit 1
fi

GITHUB_USERNAME=$1
REPOSITORY_NAME=${2:-"react-project-boilerplate"}

echo -e "${GREEN}🚀 Setting up GitHub repository for React Project Boilerplate${NC}"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git is not installed. Please install Git first.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Git is installed${NC}"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}📁 Initializing Git repository...${NC}"
    git init
    echo -e "${GREEN}✅ Git repository initialized${NC}"
else
    echo -e "${GREEN}✅ Git repository already exists${NC}"
fi

# Add all files
echo -e "${YELLOW}📦 Adding files to Git...${NC}"
git add .

# Create initial commit
echo -e "${YELLOW}💾 Creating initial commit...${NC}"
git commit -m "Initial commit: React Project Boilerplate v1.0"

# Set up remote
REMOTE_URL="https://github.com/$GITHUB_USERNAME/$REPOSITORY_NAME.git"
echo -e "${YELLOW}🔗 Setting up remote: $REMOTE_URL${NC}"

if git remote get-url origin &> /dev/null; then
    echo -e "${YELLOW}⚠️  Remote already exists, updating...${NC}"
    git remote set-url origin $REMOTE_URL
else
    git remote add origin $REMOTE_URL
    echo -e "${GREEN}✅ Remote added successfully${NC}"
fi

# Set main branch
git branch -M main

echo ""
echo -e "${GREEN}🎉 Local setup complete!${NC}"
echo ""
echo -e "${CYAN}Next steps:${NC}"
echo -e "${WHITE}1. Go to GitHub.com and create a new repository named '$REPOSITORY_NAME'${NC}"
echo -e "${WHITE}2. Make sure it's PUBLIC and DON'T initialize with README/gitignore/license${NC}"
echo -e "${WHITE}3. Run this command to push your code:${NC}"
echo -e "${YELLOW}   git push -u origin main${NC}"
echo ""
echo -e "${WHITE}4. After pushing, enable template repository:${NC}"
echo -e "${WHITE}   - Go to repository Settings${NC}"
echo -e "${WHITE}   - Check 'Template repository'${NC}"
echo -e "${WHITE}   - Save changes${NC}"
echo ""
echo -e "${WHITE}5. Create your first release:${NC}"
echo -e "${WHITE}   - Go to Releases → Create new release${NC}"
echo -e "${WHITE}   - Tag: v1.0.0${NC}"
echo -e "${WHITE}   - Title: React Project Boilerplate v1.0.0${NC}"
echo ""
echo -e "${GREEN}Repository URL: https://github.com/$GITHUB_USERNAME/$REPOSITORY_NAME${NC}"