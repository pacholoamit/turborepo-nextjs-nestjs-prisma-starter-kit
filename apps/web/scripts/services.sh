#!/bin/bash

# Docker Services Management Script for Xevon AI
# Manage PostgreSQL, Ngrok, and Redis containers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Function to check if Docker is running
check_docker() {
    if ! command -v docker >/dev/null 2>&1; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to start services
start_services() {
    print_header "Starting Xevon AI Services"
    check_docker
    
    print_status "Starting PostgreSQL, Ngrok, and Redis..."
    docker-compose up -d
    
    print_status "Waiting for services to be ready..."
    sleep 5
    
    # Check service status
    print_status "Service Status:"
    echo "PostgreSQL: $(docker-compose ps postgres | grep -q Up && echo "✅ Running" || echo "❌ Not Running")"
    echo "Ngrok: $(docker-compose ps ngrok | grep -q Up && echo "✅ Running" || echo "❌ Not Running")"
    echo "Redis: $(docker-compose ps redis | grep -q Up && echo "✅ Running" || echo "❌ Not Running")"
    
    # Get ngrok URL
    sleep 3
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o 'https://[^"]*ngrok[^"]*' | head -1 || echo "")
    if [ ! -z "$NGROK_URL" ]; then
        print_status "Ngrok Public URL: $NGROK_URL"
        print_status "Webhook URL: $NGROK_URL/api/webhooks/clerk"
    fi
    
    print_status "All services started successfully!"
    print_status "Access points:"
    print_status "  PostgreSQL: localhost:5432"
    print_status "  Redis: localhost:6379"
    print_status "  Ngrok Dashboard: http://localhost:4040"
}

# Function to stop services
stop_services() {
    print_header "Stopping Xevon AI Services"
    check_docker
    
    print_status "Stopping all services..."
    docker-compose down
    
    print_status "All services stopped successfully!"
}

# Function to restart services
restart_services() {
    print_header "Restarting Xevon AI Services"
    stop_services
    sleep 2
    start_services
}

# Function to show service status
show_status() {
    print_header "Xevon AI Services Status"
    check_docker
    
    docker-compose ps
    
    # Additional status info
    echo ""
    print_status "Service Health:"
    
    # PostgreSQL
    if nc -z localhost 5432 2>/dev/null; then
        echo "PostgreSQL: ✅ Healthy (localhost:5432)"
    else
        echo "PostgreSQL: ❌ Not reachable"
    fi
    
    # Redis
    if nc -z localhost 6379 2>/dev/null; then
        echo "Redis: ✅ Healthy (localhost:6379)"
    else
        echo "Redis: ❌ Not reachable"
    fi
    
    # Ngrok
    if nc -z localhost 4040 2>/dev/null; then
        echo "Ngrok: ✅ Healthy (localhost:4040)"
        NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o 'https://[^"]*ngrok[^"]*' | head -1 || echo "")
        if [ ! -z "$NGROK_URL" ]; then
            echo "Ngrok Public URL: $NGROK_URL"
        fi
    else
        echo "Ngrok: ❌ Not reachable"
    fi
}

# Function to show logs
show_logs() {
    local service=${1:-""}
    
    if [ -z "$service" ]; then
        print_header "All Services Logs"
        docker-compose logs -f
    else
        print_header "$service Logs"
        docker-compose logs -f "$service"
    fi
}

# Function to clean up everything
cleanup() {
    print_header "Cleaning Up Xevon AI Environment"
    print_warning "This will remove all containers and volumes!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Stopping and removing all containers..."
        docker-compose down -v --remove-orphans
        
        print_status "Removing unused Docker resources..."
        docker system prune -f
        
        print_status "Cleanup complete!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Main function
main() {
    case "${1:-}" in
        "start"|"up")
            start_services
            ;;
        "stop"|"down")
            stop_services
            ;;
        "restart")
            restart_services
            ;;
        "status"|"ps")
            show_status
            ;;
        "logs")
            show_logs "${2:-}"
            ;;
        "cleanup"|"clean")
            cleanup
            ;;
        *)
            echo "Usage: $0 {start|stop|restart|status|logs [service]|cleanup}"
            echo ""
            echo "Commands:"
            echo "  start    - Start all services (PostgreSQL, Ngrok, Redis)"
            echo "  stop     - Stop all services"
            echo "  restart  - Restart all services"
            echo "  status   - Show service status"
            echo "  logs     - Show logs (optionally for specific service)"
            echo "  cleanup  - Remove all containers and volumes"
            echo ""
            echo "Examples:"
            echo "  $0 start"
            echo "  $0 logs postgres"
            echo "  $0 status"
            exit 1
            ;;
    esac
}

# Execute main function if script is run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi