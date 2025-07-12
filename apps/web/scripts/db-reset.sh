#!/bin/bash

# Database Reset Script for Xevon AI
# This script resets the database and applies fresh migrations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

print_status "Resetting Xevon AI Database..."

# Check if PostgreSQL is running
if ! nc -z localhost 5432 2>/dev/null; then
    print_error "PostgreSQL is not running. Please start it first with 'bun run services:start'"
    exit 1
fi

# Reset the database
print_status "Dropping and recreating database..."
bun prisma migrate reset --force

print_status "Generating Prisma client..."
bun prisma generate

print_status "Database reset complete!"
print_status "You can now run 'bun run dev' to start the development server."