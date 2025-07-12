# Setup Guide

Complete step-by-step setup guide for the Xevon AI TurboRepo monorepo.

## 🎯 Overview

This guide will help you set up the Xevon AI development environment from scratch. Follow these steps in order for a smooth setup experience.

## 📋 Prerequisites

### Required Software

Install these tools before proceeding:

1. **Docker Desktop** - For running PostgreSQL, Redis, and Ngrok
   - [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)
   - Start Docker Desktop and ensure it's running

2. **Bun** - Fast package manager and JavaScript runtime
   ```bash
   # Install Bun
   curl -fsSL https://bun.sh/install | bash
   
   # Verify installation
   bun --version
   ```

3. **Git** - Version control
   ```bash
   # Verify Git is installed
   git --version
   ```

### Optional but Recommended

- **Visual Studio Code** - IDE with great TypeScript support
- **Postman** or **Insomnia** - API testing
- **TablePlus** or **pgAdmin** - Database management GUI

## 🚀 Step-by-Step Setup

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone <repository-url>
cd xevon-ai

# Check the current branch
git branch
```

### Step 2: Environment Configuration

The monorepo requires multiple environment files. Set them up in the correct order:

#### 2.1 Root Environment (`.env`)

```bash
# Copy the root environment template
cp .env.example .env
```

Edit `.env` with your specific values:

```bash
# Database Configuration (use defaults for local development)
DATABASE_URL="postgresql://xevon_user:xevon_password@localhost:5432/xevon_dev?schema=public"
SHADOW_DATABASE_URL="postgresql://xevon_user:xevon_password@localhost:5432/xevon_shadow?schema=public"

# Clerk Authentication (get from Clerk Dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_here
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Ngrok Configuration (get from Ngrok Dashboard)
NGROK_AUTHTOKEN=your_ngrok_token_here
NGROK_DOMAIN=your-reserved-domain.ngrok-free.app
NEXT_PUBLIC_WEBHOOK_URL=https://your-reserved-domain.ngrok-free.app

# Application Settings
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
DEBUG=false
SEED_DATABASE=true
```

#### 2.2 Web App Environment (`apps/web/.env`)

```bash
# Copy the web app environment template
cp apps/web/.env.example apps/web/.env
```

Edit `apps/web/.env`:

```bash
# Logging Configuration
LOG_LEVEL=info

# Feature Flags
NEXT_PUBLIC_FEATURE_ANALYTICS=true
NEXT_PUBLIC_FEATURE_ONBOARDING=true

# Development Settings
NEXT_PUBLIC_DEBUG_MODE=true
```

#### 2.3 Server Environment (`apps/server/.env`)

```bash
# Create server environment file
cat > apps/server/.env << EOF
# Server Configuration
PORT=3001
NODE_ENV=development

# Database URL (inherits from root .env)
# DATABASE_URL will be inherited from root

# Logging
LOG_LEVEL=debug
EOF
```

#### 2.4 Database Environment (`packages/database/.env`)

```bash
# Create database environment file
cat > packages/database/.env << EOF
# Prisma Configuration
DATABASE_URL="postgresql://xevon_user:xevon_password@localhost:5432/xevon_dev?schema=public"
SHADOW_DATABASE_URL="postgresql://xevon_user:xevon_password@localhost:5432/xevon_shadow?schema=public"

# Prisma Settings
PRISMA_HIDE_UPDATE_MESSAGE=true
EOF
```

### Step 3: External Service Setup

#### 3.1 Clerk Authentication Setup

1. **Create Clerk Account**
   - Go to [Clerk Dashboard](https://dashboard.clerk.com)
   - Sign up for a free account
   - Create a new application

2. **Get API Keys**
   - In your Clerk application dashboard
   - Go to **API Keys** section
   - Copy the **Publishable Key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Copy the **Secret Key** → `CLERK_SECRET_KEY`

3. **Configure Authentication**
   - In Clerk dashboard, go to **User & Authentication**
   - Enable **Email** and **Google** (optional) authentication
   - Configure **Redirect URLs**:
     - Sign-in: `http://localhost:3000/sign-in`
     - Sign-up: `http://localhost:3000/sign-up`
     - After sign-in: `http://localhost:3000/dashboard`
     - After sign-up: `http://localhost:3000/onboarding`

#### 3.2 Ngrok Setup

1. **Create Ngrok Account**
   - Go to [Ngrok](https://ngrok.com)
   - Sign up for a free account

2. **Get Auth Token**
   - In your Ngrok dashboard
   - Go to **Your Authtoken**
   - Copy the authtoken → `NGROK_AUTHTOKEN`

3. **Reserve Domain (Optional but Recommended)**
   - In Ngrok dashboard, go to **Cloud Edge** → **Domains**
   - Click **Create Domain** or **New Domain**
   - Choose a domain name (e.g., `your-app-name.ngrok-free.app`)
   - Copy the domain → `NGROK_DOMAIN`

### Step 4: Install Dependencies

```bash
# Install all dependencies for the monorepo
bun install

# Verify installation
bun run --version
```

### Step 5: Start Development Environment

```bash
# Start the complete development environment
bun dev
```

This command will:
1. 🐳 **Start Docker services** (PostgreSQL, Redis, Ngrok)
2. ⏳ **Wait for database** to be ready
3. 🔄 **Generate Prisma client** for type safety
4. 🗄️ **Run database migrations** to set up schema
5. 🚀 **Start applications**:
   - Web app at `http://localhost:3000`
   - API server at `http://localhost:3001`
6. 🌐 **Expose webhooks** via Ngrok

### Step 6: Verify Setup

#### 6.1 Check Services

```bash
# Check all services are running
bun run services:status

# Expected output:
# NAME               IMAGE                COMMAND             SERVICE      STATUS        PORTS
# xevon-postgres     postgres:16-alpine   "docker-entrypoint.s…"   postgres   running       0.0.0.0:5432->5432/tcp
# xevon-redis        redis:7-alpine       "docker-entrypoint.s…"   redis      running       0.0.0.0:6379->6379/tcp
# xevon-ngrok        ngrok/ngrok:3-alpine "ngrok http host.doc…"   ngrok      running       0.0.0.0:4040->4040/tcp
```

#### 6.2 Test Applications

```bash
# Test web application
curl http://localhost:3000

# Test API server
curl http://localhost:3001

# Test API endpoint
curl http://localhost:3001/users
```

#### 6.3 Check Database Connection

```bash
# Open Prisma Studio to verify database
bun run db:studio

# Opens http://localhost:5555
```

### Step 7: Complete Clerk Integration

1. **Start your application** (should be running from Step 5)

2. **Get Ngrok URL**
   - Check the console output from `bun dev`
   - Look for: `Ngrok tunnel: https://your-domain.ngrok-free.app`
   - Or visit `http://localhost:4040` to see Ngrok dashboard

3. **Configure Clerk Webhooks**
   - In Clerk dashboard, go to **Webhooks**
   - Click **Add Endpoint**
   - Enter URL: `https://your-ngrok-url.ngrok-free.app/api/webhooks/clerk`
   - Select events: `user.created`, `user.updated`, `user.deleted`
   - Click **Create**
   - Copy the **Signing Secret** → `CLERK_WEBHOOK_SECRET` in your `.env`

4. **Restart Development** (if you updated environment variables)
   ```bash
   # Stop services
   Ctrl+C
   
   # Restart with new environment
   bun dev
   ```

## 🎉 Success!

Your development environment is now ready! You should see:

- ✅ Web application running at `http://localhost:3000`
- ✅ API server running at `http://localhost:3001`
- ✅ Database accessible at `localhost:5432`
- ✅ Ngrok tunnel active for webhooks
- ✅ All services healthy and connected

## 🔧 Development Workflow

### Daily Development

```bash
# Start development (single command)
bun dev

# In a new terminal - check status
bun run services:status

# Run tests
bun run test

# Check types
bun run check-types

# Lint code
bun run lint
```

### Making Changes

```bash
# Database changes
# 1. Edit packages/database/prisma/schema.prisma
# 2. Run migration
bun run db:migrate

# Add new dependencies
bun add <package-name>

# Add dev dependencies
bun add -D <package-name>
```

## 🆘 Troubleshooting

### Common Issues

#### Docker Services Won't Start

```bash
# Check if Docker is running
docker info

# Check for port conflicts
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :4040  # Ngrok

# Reset Docker
bun run services:clean
bun run services:start
```

#### Environment Variables Not Loading

```bash
# Check if all .env files exist
ls -la .env apps/web/.env apps/server/.env packages/database/.env

# Verify environment variables
echo $DATABASE_URL
echo $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
```

#### Database Connection Failed

```bash
# Check database status
bun run services:status

# Reset database
bun run services:stop
docker volume rm xevon-ai_postgres_data
bun run services:start
bun run db:migrate
```

#### Ngrok Issues

```bash
# Verify ngrok token
echo $NGROK_AUTHTOKEN

# Check ngrok status
curl http://localhost:4040/api/tunnels

# Restart ngrok
bun run services:restart
```

### Getting Help

If you encounter issues:

1. **Check the logs**:
   ```bash
   bun run services:logs
   ```

2. **Verify all prerequisites** are installed

3. **Check environment variables** are correctly set

4. **Try a complete reset**:
   ```bash
   bun run services:clean
   rm -rf node_modules
   bun install
   bun dev
   ```

## 📚 Next Steps

After successful setup:

- 📖 Read the [Development Guide](./development.md) for detailed workflows
- 🔐 Review [Authentication Documentation](./authentication.md) for user management
- 🌐 Check [API Documentation](./api.md) for available endpoints
- 🚀 Explore [Deployment Guide](./deployment.md) for production setup

## 🎯 Quick Commands Reference

```bash
# Development
bun dev                    # Start everything
bun run dev:apps          # Start only apps (if services running)

# Services
bun run services:start    # Start Docker services
bun run services:stop     # Stop Docker services
bun run services:status   # Check service status
bun run services:logs     # View service logs

# Database
bun run db:migrate        # Run migrations
bun run db:studio         # Open Prisma Studio
bun run db:generate       # Generate Prisma client

# Code Quality
bun run lint              # Run ESLint
bun run check-types       # TypeScript type checking
bun run build             # Build for production
```

Happy coding! 🚀