#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."

# Maximum number of retries
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker-compose -f "$PROJECT_ROOT/docker-compose.yml" exec -T postgres pg_isready -U xevon_user -d xevon_dev > /dev/null 2>&1; then
        echo "PostgreSQL is ready!"
        exit 0
    fi
    
    echo "PostgreSQL is not ready yet. Waiting... ($((RETRY_COUNT + 1))/$MAX_RETRIES)"
    sleep 2
    RETRY_COUNT=$((RETRY_COUNT + 1))
done

echo "ERROR: PostgreSQL did not become ready within the expected time"
exit 1