# Development Guide

This guide provides a comprehensive overview of developing with the **Xevon AI TurboRepo monorepo**.

## 🚀 Quick Start (New Developers)

### Prerequisites

- **Docker Desktop** - For PostgreSQL, Redis, and Ngrok
- **Bun** - Package manager and JavaScript runtime  
- **Git** - Version control

### One-Command Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd xevon-ai

# 2. Setup environment variables (see Environment Setup section below)
cp apps/web/.env.example apps/web/.env
cp .env.example .env

# 3. Install dependencies and start development
bun install
bun dev
```

**That's it!** The `bun dev` command automatically:
- 🐳 Starts Docker services (PostgreSQL, Redis, Ngrok)
- ⏳ Waits for database to be ready
- 🗄️ Generates Prisma client and runs migrations
- 🚀 Starts Next.js web app (localhost:3000)
- 🔌 Starts NestJS API server (localhost:3001)  
- 🌐 Exposes webhooks via Ngrok

## 📁 Monorepo Structure

```
xevon-ai/                      # TurboRepo monorepo root
├── apps/
│   ├── web/                   # Next.js 15 frontend application
│   │   ├── .env               # Web-specific environment variables
│   │   ├── app/               # Next.js 15 app router
│   │   ├── components/        # UI components
│   │   └── lib/               # Utilities and services
│   └── server/                # NestJS backend API server
│       ├── .env               # Server-specific environment variables
│       ├── src/               # Server source code
│       │   ├── users/         # Users module (controllers, services)
│       │   ├── app.module.ts  # Root application module
│       │   └── main.ts        # Application entry point
│       └── test/              # Server tests
├── packages/
│   ├── database/              # Shared Prisma database package
│   │   ├── .env               # Database-specific environment variables
│   │   ├── prisma/            # Schema and migrations
│   │   └── src/               # Database client and utilities
│   ├── services/              # Docker services management
│   ├── typescript-config/     # Shared TypeScript configurations
│   └── eslint-config/         # Shared ESLint configurations
├── scripts/
│   └── wait-for-db.sh         # Database readiness check script
├── docker-compose.yml         # Docker services configuration
├── turbo.json                 # TurboRepo configuration
├── .env                       # Root environment variables
└── docs/                      # Documentation
```

## Architecture Overview

### Services

| Service | Port | Description |
|---------|------|-------------|
| **Next.js Web** | 3000 | Frontend application (apps/web) |
| **NestJS API** | 3001 | Backend API server (apps/server) |
| **PostgreSQL** | 5432 | Primary database (shared via packages/database) |
| **Ngrok** | 4040 | Tunnel dashboard |

#### NestJS API Endpoints

The backend server provides the following endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check endpoint (returns "Hello World!") |
| GET | `/users` | List all users from database |

### Development Flow

```mermaid
graph TB
    A[bun dev] --> B[Start Docker Services]
    B --> C[Wait for PostgreSQL]
    C --> D[Install Dependencies]
    D --> E[Generate Prisma Client]
    E --> F[Run Migrations]
    F --> G[Start Web App & API Server]
    G --> H[Applications Ready]
    
    I[Ngrok Tunnel] --> J[Webhook Endpoints]
    J --> K[Clerk Integration]
```

## Available Commands

### Main Development

```bash
# Start full monorepo development environment (recommended)
bun dev

# Start only the applications (if services already running)
bun run dev:apps

# Start individual applications
cd apps/web && bun run dev:next     # Just Next.js
cd apps/server && bun run dev       # Just NestJS
```

### Docker Services Management

```bash
# Start all services (PostgreSQL, Ngrok)
bun run services:start

# Stop all services
bun run services:stop

# Restart all services
bun run services:restart

# Check service status
bun run services:status

# View service logs
bun run services:logs

# Clean up (remove containers and volumes)
bun run services:clean
```

### Database Management

```bash
# Generate Prisma client (runs for all apps using the database)
bun run db:generate

# Run migrations (from packages/database)
bun run db:migrate

# Deploy migrations to production
bun run db:deploy

# Open Prisma Studio (database browser)
bun run db:studio
```

### Code Quality

```bash
# Type checking (all packages)
bun run check-types

# Linting (all packages)
bun run lint

# Build for production (all packages)
bun run build

# Format code
bun run format
```

## Shared Database Package

The `@xevon/database` package centralizes all database-related code:

### Package Structure
```
packages/database/
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Database migrations
├── src/
│   ├── index.ts         # Main exports
│   └── client.ts        # Prisma client setup
└── package.json         # Package configuration
```

### Usage in Applications

```typescript
// In apps/web or apps/server
import { prisma } from '@xevon/database';

// Use Prisma client normally
const users = await prisma.user.findMany();
const connector = await prisma.connector.create({
  data: { name: 'Slack', type: 'slack', userId: 'user_123' }
});
```

### Benefits
- **Single source of truth** for database schema
- **Shared types** across all applications  
- **Centralized migrations** management
- **Consistent database access** patterns

## 🔧 Environment Configuration

### Overview

The monorepo uses a **hierarchical environment variable strategy**:

1. **Root `.env`** - Shared variables for all packages
2. **Package-specific `.env`** - Override or add package-specific variables

### Required Environment Files

```bash
# Required environment files
.env                    # Root: shared variables (database, auth, ngrok)
apps/web/.env          # Web app: client-side and API routes
apps/server/.env       # Server app: NestJS configuration
packages/database/.env # Database: Prisma-specific settings
```

### Setup Instructions

#### 1. Root Environment (`.env`)

```bash
# Copy and configure root environment
cp .env.example .env
```

**Required variables:**
```bash
# Database Configuration
DATABASE_URL="postgresql://xevon_user:xevon_password@localhost:5432/xevon_dev?schema=public"
SHADOW_DATABASE_URL="postgresql://xevon_user:xevon_password@localhost:5432/xevon_shadow?schema=public"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_here
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Ngrok Configuration
NGROK_AUTHTOKEN=your_ngrok_token_here
NGROK_DOMAIN=legible-elf-internal.ngrok-free.app
NEXT_PUBLIC_WEBHOOK_URL=https://legible-elf-internal.ngrok-free.app

# Application Settings
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
DEBUG=false
SEED_DATABASE=false
```

#### 2. Web App Environment (`apps/web/.env`)

```bash
# Copy web app environment
cp apps/web/.env.example apps/web/.env
```

**Additional variables:**
```bash
# Logging
LOG_LEVEL=info

# Feature Flags
NEXT_PUBLIC_FEATURE_ANALYTICS=true
NEXT_PUBLIC_FEATURE_ONBOARDING=true
```

#### 3. Server App Environment (`apps/server/.env`)

```bash
# Create server environment
touch apps/server/.env
```

**Server-specific variables:**
```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Database (inherits from root, but can override)
# DATABASE_URL is automatically inherited
```

#### 4. Database Package Environment (`packages/database/.env`)

```bash
# Create database environment
touch packages/database/.env
```

**Database-specific variables:**
```bash
# Prisma Configuration
DATABASE_URL="postgresql://xevon_user:xevon_password@localhost:5432/xevon_dev?schema=public"
SHADOW_DATABASE_URL="postgresql://xevon_user:xevon_password@localhost:5432/xevon_shadow?schema=public"

# Prisma Settings
PRISMA_HIDE_UPDATE_MESSAGE=true
```

### External Service Setup

#### Clerk Authentication

1. **Create Clerk Application**
   - Go to [Clerk Dashboard](https://dashboard.clerk.com)
   - Create new application
   - Copy publishable and secret keys to root `.env`

2. **Configure Webhooks**
   - Start development: `bun dev`
   - Note the Ngrok URL from console output
   - In Clerk Dashboard → Webhooks → Add endpoint
   - URL: `https://your-ngrok-url.ngrok-free.app/api/webhooks/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`
   - Copy webhook secret to root `.env`

#### Ngrok Setup

1. **Get Ngrok Auth Token**
   - Sign up at [Ngrok](https://ngrok.com)
   - Go to dashboard → Your Authtoken
   - Copy token to root `.env`

2. **Reserve Domain (Optional)**
   - Go to Ngrok dashboard → Domains
   - Reserve a domain for consistent webhook URLs
   - Update `NGROK_DOMAIN` in root `.env`

### Environment Variable Precedence

The system loads environment variables in this order (later overrides earlier):

1. Root `.env` (shared across all packages)
2. Package-specific `.env` (e.g., `apps/web/.env`)
3. System environment variables
4. Docker Compose environment

### Validation

After setup, verify your configuration:

```bash
# Check environment loading
bun run dev

# Should see:
# ✅ Environment variables loaded
# ✅ Database connection established
# ✅ Clerk authentication configured
# ✅ Ngrok tunnel active
```

## Development Workflow

### Daily Development

```bash
# Start development (starts everything)
bun run dev

# In another terminal - check status
bun run services:status

# View logs if needed
bun run services:logs

# When done, stop services (optional, they persist)
bun run services:stop
```

### Database Changes

```bash
# 1. Modify schema in prisma/schema.prisma
# 2. Create and apply migration
bun run db:migrate

# Or for rapid prototyping
bun run db:push
```

### Debugging

```bash
# Check service health
bun run services:status

# View specific service logs
bun run services:logs postgres
bun run services:logs ngrok

# Reset everything
bun run services:clean
bun run dev
```

## Service Details

### PostgreSQL

- **Image**: `postgres:16-alpine`
- **Database**: `xevon_dev`
- **User**: `xevon_user`
- **Password**: `xevon_password`
- **Access**: `localhost:5432`

### Ngrok

- **Domain**: `legible-elf-internal.ngrok-free.app` (reserved)
- **Dashboard**: `http://localhost:4040`
- **Purpose**: Exposes local webhooks for Clerk integration

### Redis

- **Image**: `redis:7-alpine`
- **Access**: `localhost:6379`
- **Purpose**: Caching, session storage (future use)

## Troubleshooting

### Common Issues

#### Docker Services Won't Start

```bash
# Check Docker is running
docker info

# Check for port conflicts
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :4040  # Ngrok

# Clean and restart
bun run services:clean
bun run services:start
```

#### Database Connection Issues

```bash
# Check PostgreSQL is ready
bun run services:status

# Reset database
bun run db:reset

# Check connection string in .env
echo $DATABASE_URL
```

#### Ngrok Authentication Issues

```bash
# Update ngrok token in .env
NGROK_AUTHTOKEN=your_new_token_here

# Restart ngrok
bun run services:restart
```

#### Migration Failures

```bash
# Reset database and migrations
bun run db:reset

# Or manually reset
bun run services:stop
docker volume rm xevon-ai_postgres_data
bun run services:start
bun run db:migrate
```

### Environment Reset

For a completely fresh start:

```bash
# 1. Stop all services
bun run services:stop

# 2. Clean Docker resources
bun run services:clean

# 3. Remove node modules
rm -rf node_modules

# 4. Fresh install
bun install

# 5. Start fresh
bun run dev
```

## Performance Tips

### Faster Development

1. **Keep services running** between dev sessions:
   ```bash
   # Services persist between sessions
   bun run services:start  # Once
   bun run dev:next        # Each time
   ```

2. **Use Turbopack** (enabled by default):
   ```bash
   # Faster builds and hot reload
   bun run dev:next --turbopack
   ```

3. **Parallel development**:
   ```bash
   # Terminal 1: Services and logs
   bun run services:logs

   # Terminal 2: Development
   bun run dev:next

   # Terminal 3: Database management
   bun run db:studio
   ```

## CI/CD Integration

### GitHub Actions

The development setup integrates with CI/CD:

```yaml
# Example CI step
- name: Setup Development Environment
  run: |
    cp .env.example .env
    bun install
    bun run services:start
    bun run db:migrate
    bun run typecheck
    bun run lint
```

### Production Deployment

For production, services run differently:
- Database: Managed PostgreSQL (AWS RDS, etc.)
- Webhooks: Direct HTTPS endpoints
- Redis: Managed Redis (AWS ElastiCache, etc.)

## Advanced Configuration

### Custom Docker Configuration

Edit `docker-compose.yml` for custom needs:

```yaml
# Add custom environment variables
environment:
  POSTGRES_DB: custom_db_name
  
# Mount custom initialization scripts
volumes:
  - ./custom-init:/docker-entrypoint-initdb.d
```

### Alternative Database

To use different PostgreSQL settings:

```bash
# Update docker-compose.yml
# Update DATABASE_URL in .env
# Restart services
bun run services:restart
```

## Getting Help

### Debug Information

```bash
# Collect debug info
echo "Services Status:"
bun run services:status

echo -e "\nDocker Info:"
docker-compose ps

echo -e "\nEnvironment:"
echo "NODE_ENV: $NODE_ENV"
echo "DATABASE_URL: ${DATABASE_URL:0:50}..."

echo -e "\nApplication Status:"
curl -s http://localhost:3000/api/health || echo "App not running"
```

### Common Commands Quick Reference

```bash
# Full restart
bun run services:restart && bun run dev

# Database reset
bun run db:reset

# View all logs
bun run services:logs

# Check everything
bun run services:status && bun run typecheck
```

## Next Steps

- [Authentication Documentation](./authentication.md)
- [API Documentation](./api.md)
- [Deployment Guide](./deployment.md)