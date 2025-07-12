#!/bin/bash

set -e

echo "🚀 Initializing development environment..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js
print_status "Checking Node.js installation..."
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_success "Node.js found: $NODE_VERSION"
    
    # Check if version meets requirements (>=18)
    MAJOR_VERSION=$(echo $NODE_VERSION | sed 's/v//' | cut -d. -f1)
    if [ "$MAJOR_VERSION" -ge 18 ]; then
        print_success "Node.js version meets requirements (>=18)"
    else
        print_error "Node.js version $NODE_VERSION is below required version 18"
        exit 1
    fi
else
    print_error "Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Bun
print_status "Checking Bun installation..."
if command_exists bun; then
    BUN_VERSION=$(bun --version)
    print_success "Bun found: v$BUN_VERSION"
else
    print_error "Bun is not installed. Please install Bun package manager."
    exit 1
fi

# Check Docker
print_status "Checking Docker installation..."
if command_exists docker; then
    if docker info >/dev/null 2>&1; then
        DOCKER_VERSION=$(docker --version)
        print_success "Docker found and running: $DOCKER_VERSION"
        
        # Pull required Docker images
        print_status "Pulling required Docker images..."
        
        # Common images that might be used in the project
        IMAGES=("postgres:15" "redis:7-alpine" "nginx:alpine")
        
        for image in "${IMAGES[@]}"; do
            print_status "Pulling $image..."
            if docker pull "$image" >/dev/null 2>&1; then
                print_success "Successfully pulled $image"
            else
                print_warning "Failed to pull $image (might not be needed)"
            fi
        done
    else
        print_error "Docker is installed but not running. Please start Docker."
        exit 1
    fi
else
    print_warning "Docker is not installed. Some services may not work properly."
fi

# Check Git
print_status "Checking Git installation..."
if command_exists git; then
    GIT_VERSION=$(git --version)
    print_success "Git found: $GIT_VERSION"
else
    print_error "Git is not installed. Please install Git."
    exit 1
fi

# Initialize environment files
print_status "Setting up environment files..."

# Function to copy env file if it doesn't exist
setup_env_file() {
    local example_file="$1"
    local target_file="$2"
    local description="$3"
    
    if [ -f "$example_file" ] && [ ! -f "$target_file" ]; then
        cp "$example_file" "$target_file"
        print_success "Created $description"
    else
        if [ ! -f "$example_file" ]; then
            print_warning "Skipped $description (no example file found)"
        else
            print_warning "Skipped $description (file already exists)"
        fi
    fi
}

# Setup environment files
setup_env_file "apps/web/.env.example" "apps/web/.env" "apps/web/.env"
setup_env_file "apps/server/.env.example" "apps/server/.env" "apps/server/.env"
setup_env_file "packages/database/.env.example" "packages/database/.env" "packages/database/.env"

print_success "Environment initialization completed!"
print_status "You can now run 'bun run dev' to start the development server."