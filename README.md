# TurboRepo Boilerplate

This is a monorepo boilerplate using TurboRepo with the following structure:

## Apps Directory

### `/apps/web`
- Next.js 14 application
- Features:
  - App router architecture
  - Tailwind CSS styling
  - Authentication pages
  - Dashboard layout
  - API routes
- Key files:
  - `app/` - Next.js app directory
  - `components/` - Reusable UI components
  - `lib/` - Shared utilities and hooks
  - `styles/` - Global styles and theme

### `/apps/server`
- NestJS backend application
- Features:
  - REST API endpoints
  - Modular architecture
  - Prisma integration
- Key files:
  - `src/` - Application source code
  - `test/` - E2E tests
  - `nest-cli.json` - NestJS configuration

## Packages Directory

### `/packages/database`
- Prisma database package
- Features:
  - Database schema definition
  - Prisma client generation
  - Shared database access
- Key files:
  - `prisma/schema.prisma` - Database schema
  - `src/client.ts` - Prisma client instance

### `/packages/services`
- Docker services configuration
- Features:
  - PostgreSQL database
  - Redis cache
  - Managed via docker-compose

### `/packages/eslint-config`
- Shared ESLint configurations
- Configurations for:
  - Base JavaScript/TypeScript
  - React
  - Next.js

### `/packages/typescript-config`
- Shared TypeScript configurations
- Configurations for:
  - Base TypeScript
  - Next.js
  - React libraries

## Development Workflow

1. Run `bun run initialize` to set up environment files
2. Start services: `bun run services:start`
3. Run development servers: `bun run dev`

## Key Commands

- `bun dev` - Start all apps in development mode
- `bun build` - Build all packages and apps
- `bun lint` - Run linting across all packages
- `bun format` - Format all code
