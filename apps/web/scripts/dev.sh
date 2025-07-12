#!/bin/bash

# Xevon AI Development Environment Setup Script
# This script starts all necessary services for development

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to wait for service to be ready
wait_for_service() {
    local service=$1
    local port=$2
    local max_attempts=30
    local attempt=1

    print_status "Waiting for $service to be ready on port $port..."
    
    while [ $attempt -le $max_attempts ]; do
        if nc -z localhost $port 2>/dev/null; then
            print_status "$service is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service failed to start within $((max_attempts * 2)) seconds"
    return 1
}

# Function to check if Docker is running
check_docker() {
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi

    print_status "Docker is running"
}

# Function to check if .env file exists
check_env_file() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from .env.example..."
        if [ -f .env.example ]; then
            cp .env.example .env
            print_status "Created .env file. Please update it with your configuration."
        else
            print_error ".env.example file not found. Cannot create .env file."
            exit 1
        fi
    fi
}

# Function to start Docker services
start_docker_services() {
    print_header "Starting Docker Services"
    
    print_status "Starting PostgreSQL and Ngrok containers..."
    docker-compose up -d
    
    # Wait for PostgreSQL to be ready
    wait_for_service "PostgreSQL" 5432
    
    # Wait for Ngrok to be ready
    wait_for_service "Ngrok" 4040
    
    print_status "All Docker services are running"
    print_status "PostgreSQL: localhost:5432"
    print_status "Ngrok Web Interface: http://localhost:4040"
    
    # Get ngrok public URL
    sleep 3  # Give ngrok a moment to establish tunnel
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o 'https://[^"]*ngrok[^"]*' | head -1)
    if [ ! -z "$NGROK_URL" ]; then
        print_status "Ngrok Public URL: $NGROK_URL"
        print_status "Webhook URL: $NGROK_URL/api/webhooks/clerk"
    fi
}

# Function to run database migrations
run_migrations() {
    print_header "Database Setup"
    
    print_status "Generating Prisma client..."
    bun prisma generate
    
    print_status "Checking database connection..."
    if bun prisma db push ; then
        print_status "Database schema is up to date"
    else
        print_status "Applying database migrations..."
        bun prisma migrate dev --name init
    fi
    
    print_status "Database setup complete"
}

# Function to install dependencies
install_dependencies() {
    print_header "Installing Dependencies"
    
    if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
        print_status "Installing/updating dependencies..."
        bun install
    else
        print_status "Dependencies are up to date"
    fi
}

# Function to start the development server
start_dev_server() {
    print_header "Starting Development Server"
    
    print_status "Starting Next.js development server with Turbopack..."
    print_status "Application will be available at: http://localhost:3000"
    
    # Start the Next.js dev server
    bun next dev --turbopack
}

# Function to cleanup on exit
cleanup() {
    print_header "Cleaning Up"
    print_status "Stopping development server..."
    # Docker services will continue running for other dev sessions
    exit 0
}

# Main execution
main() {
    print_header "Xevon AI Development Environment"
    
    # Set up cleanup on script exit
    trap cleanup SIGINT SIGTERM
    
    # Check prerequisites
    check_docker
    check_env_file
    
    # Install dependencies
    install_dependencies
    
    # Start Docker services
    start_docker_services
    
    # Setup database
    run_migrations
    
    # Start development server
    start_dev_server
}

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi