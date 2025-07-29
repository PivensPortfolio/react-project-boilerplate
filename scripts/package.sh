#!/bin/bash

# Package the React boilerplate for distribution
# Creates a distributable zip archive with customizable project name and template variables

set -e

# Default values
PROJECT_NAME="my-react-app"
OUTPUT_NAME=""
AUTHOR_NAME=""
AUTHOR_EMAIL=""
DESCRIPTION=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Help function
show_help() {
    cat << EOF
Usage: $0 [OPTIONS]

Package the React boilerplate for distribution

OPTIONS:
    -n, --name NAME         Project name (default: my-react-app)
    -o, --output NAME       Output directory name
    -a, --author NAME       Author name to replace in templates
    -e, --email EMAIL       Author email to replace in templates
    -d, --description DESC  Project description to replace in templates
    -h, --help             Show this help message

EXAMPLES:
    $0 --name my-awesome-app --author "John Doe"
    $0 --name todo-app --description "A simple todo application"
EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--name)
            PROJECT_NAME="$2"
            shift 2
            ;;
        -o|--output)
            OUTPUT_NAME="$2"
            shift 2
            ;;
        -a|--author)
            AUTHOR_NAME="$2"
            shift 2
            ;;
        -e|--email)
            AUTHOR_EMAIL="$2"
            shift 2
            ;;
        -d|--description)
            DESCRIPTION="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Unknown option: $1${NC}" >&2
            show_help
            exit 1
            ;;
    esac
done

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed or not in PATH${NC}" >&2
    echo -e "${YELLOW}Please install Node.js from https://nodejs.org/${NC}"
    exit 1
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js version: $NODE_VERSION${NC}"

# Build arguments for Node.js script
NODE_ARGS=()

if [[ -n "$PROJECT_NAME" ]]; then
    NODE_ARGS+=("--name" "$PROJECT_NAME")
fi

if [[ -n "$OUTPUT_NAME" ]]; then
    NODE_ARGS+=("--output" "$OUTPUT_NAME")
fi

if [[ -n "$AUTHOR_NAME" ]]; then
    NODE_ARGS+=("--author" "$AUTHOR_NAME")
fi

if [[ -n "$AUTHOR_EMAIL" ]]; then
    NODE_ARGS+=("--email" "$AUTHOR_EMAIL")
fi

if [[ -n "$DESCRIPTION" ]]; then
    NODE_ARGS+=("--description" "$DESCRIPTION")
fi

# Run the Node.js packaging script
echo -e "${CYAN}🚀 Running packaging script...${NC}"

PACKAGE_SCRIPT="$SCRIPT_DIR/package.js"

if [[ ${#NODE_ARGS[@]} -gt 0 ]]; then
    node "$PACKAGE_SCRIPT" "${NODE_ARGS[@]}"
else
    node "$PACKAGE_SCRIPT"
fi

if [[ $? -eq 0 ]]; then
    echo -e "${GREEN}✅ Packaging completed successfully!${NC}"
else
    echo -e "${RED}❌ Packaging failed${NC}" >&2
    exit 1
fi