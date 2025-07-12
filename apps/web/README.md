# Xevon AI

AI-powered team communication intelligence platform. Transform scattered conversations into structured insights with advanced LLM analysis, real-time monitoring, and predictive analytics.

## 🚀 Features

- **AI-Powered Intelligence**: Advanced LLM models analyze communication patterns to extract meaningful insights
- **Real-Time Monitoring**: Track team health, project momentum, and communication patterns as they happen
- **Smart Automation**: Intelligent workflow automation that learns from your team's patterns
- **Advanced Analytics**: Deep insights into team performance, bottlenecks, and collaboration effectiveness
- **Enterprise Security**: SOC 2 Type II compliant with end-to-end encryption and zero-trust architecture
- **Universal Integration**: Seamlessly connect with 20+ platforms including Slack, Teams, GitHub, and more

## 🛠 Tech Stack

- **Frontend**: Next.js 15 with React 19
- **Authentication**: Clerk for user management
- **Database**: Prisma ORM with PostgreSQL
- **Styling**: Tailwind CSS with Radix UI components
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Real-time**: WebSocket integration

## 📋 Prerequisites

- **Docker Desktop** - For PostgreSQL, Redis, and Ngrok
- **Bun** - Package manager and JavaScript runtime (recommended)
- **Node.js 18+** - Alternative to Bun
- **Clerk Account** - For authentication services

## 🚀 Quick Start

### One-Command Development Setup

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd xevon-ai

# 2. Setup environment
cp .env.example .env
# Update .env with your Clerk keys

# 3. Start everything (PostgreSQL, Ngrok, migrations, dev server)
bun install
bun run dev
```

That's it! The `bun run dev` command automatically:
- 🐳 Starts Docker services (PostgreSQL, Ngrok, Redis)
- 🗄️ Runs database migrations
- 🚀 Starts Next.js development server with Turbopack
- 🌐 Exposes webhooks via Ngrok tunnel

### Available Scripts

```bash
# Development
bun run dev              # Start full development environment
bun run dev:next         # Start only Next.js (if services running)

# Services Management
bun run services:start   # Start Docker services
bun run services:stop    # Stop Docker services
bun run services:status  # Check service status

# Database
bun run db:migrate       # Run database migrations
bun run db:reset        # Reset database
bun run db:studio       # Open Prisma Studio

# Code Quality
bun run typecheck       # TypeScript checking
bun run lint           # ESLint
```

## 📚 Documentation

- **[Development Guide](./docs/development.md)** - Complete development setup
- **[Authentication Guide](./docs/authentication.md)** - Clerk integration and onboarding
- **API Documentation** - Coming soon

## 🏃‍♂️ Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/pacholoamit/xevon-ai.git
   cd xevon-ai
   ```

2. **Install dependencies**:
   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Add your Clerk and database credentials
   ```

4. **Set up the database**:
   ```bash
   bunx prisma generate
   bunx prisma db push
   ```

5. **Run the development server**:
   ```bash
   bun dev
   # or
   npm run dev
   ```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
xevon-ai/
├── app/                    # Next.js app router
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Protected dashboard pages
│   └── api/               # API routes and webhooks
├── components/            # Reusable UI components
├── lib/                   # Utilities and services
│   ├── services/          # Business logic services
│   ├── stores/            # Zustand state management
│   └── types/             # TypeScript type definitions
├── prisma/                # Database schema and migrations
├── docs/                  # Documentation
└── public/                # Static assets
```

## 🔐 Authentication

The application uses a hybrid authentication approach:

- **Clerk**: Handles user authentication, social logins, and security
- **Prisma**: Stores additional user profile data and relationships
- **Webhooks**: Real-time synchronization between Clerk and database

See the [Authentication Guide](./docs/authentication.md) for detailed implementation details.

## 🚀 Deployment

The application is designed for deployment on:

- **Vercel** (recommended for Next.js)
- **Railway** (for full-stack applications)
- **Custom VPS** (with Docker support)

## 📖 Documentation

- [Authentication Guide](./docs/authentication.md) - Complete Clerk + Prisma integration guide
- [API Reference](./docs/api.md) - API endpoints and usage *(Coming Soon)*
- [Database Schema](./docs/database.md) - Prisma models and relationships *(Coming Soon)*

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📄 License

This project is proprietary and confidential. All rights reserved.

## 📞 Support

For technical questions or issues:
- Check the [documentation](./docs/)
- Create an issue in the repository
- Contact the development team

---

Built with ❤️ using Next.js and modern web technologies.