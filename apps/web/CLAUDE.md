# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `bun run dev` - Start development server with Turbopack (Next.js 15)
- `bun run build` - Build production application  
- `bun run start` - Start production server
- `bun run lint` - Run ESLint
- `bunx tsc --noEmit` - Run TypeScript type checking

### Package Management
This project uses **Bun** as the package manager (bun.lock present). Always use `bun` commands instead of npm/yarn.

## Architecture Overview

**Xevon AI** is a comprehensive SaaS platform for team communication intelligence that aggregates data from multiple sources (Slack, Teams, GitHub, Discord) and generates actionable AI-powered reports.

### Framework and Stack
- **Next.js 15** with App Router architecture and SSR
- **React 19** with TypeScript (strict mode)
- **Tailwind CSS 4** with custom animations and glass morphism
- **shadcn/ui** component library (New York style)
- **Framer Motion** for animations and micro-interactions
- **Zustand** for state management
- **Date-fns** for date formatting

### Core Architecture Patterns

#### 1. **Smart/Dumb Component Architecture**
- **Smart Components** (`/components/containers/`): Handle data fetching, state management, SSR integration
- **Dumb Components** (`/components/`): Pure presentation components with props
- **Server-Side Rendering**: All data fetched server-side for better performance and SEO

#### 2. **Type-Safe Development**
- **Complete TypeScript Coverage**: Zero compilation errors, strict null checks
- **Centralized Types** (`/lib/types/`): Comprehensive interfaces for all data structures
- **No `any` Types**: Explicit typing throughout the codebase
- **Literal Types**: Used for status, colors, priorities to prevent runtime errors

#### 3. **State Management with Zustand**
- **Domain-Specific Stores**: Separate stores for connectors, groups, reports, messages
- **Optimistic Updates**: Immediate UI feedback with rollback on failure
- **SSR Integration**: Server-rendered data hydrates client stores

### Project Structure

```
app/
├── api/                    # Next.js API routes (App Router)
│   ├── connectors/        # Connector CRUD operations
│   ├── groups/           # Connector group management
│   ├── messages/         # Real-time message streaming
│   └── reports/          # Report generation and PDF export
├── dashboard/            # Protected dashboard pages
│   ├── connectors/       # Connector management page
│   ├── reports/          # Reports listing page
│   ├── report/[id]/      # Individual report view
│   └── page.tsx          # Dashboard home
├── layout.tsx            # Root layout with providers
├── page.tsx              # Landing page
└── globals.css           # Global styles with animations

components/
├── containers/           # Smart components with data logic
│   ├── dashboard-container.tsx
│   ├── connectors-container.tsx
│   ├── reports-container.tsx
│   └── message-activity-container.tsx
├── ui/                   # shadcn/ui base components
├── enhanced-stat-card.tsx    # Professional stat display
├── quick-actions-fab.tsx     # Animated floating action button
├── message-activity-display.tsx  # Real-time message feed
├── connector-card.tsx        # Service connection cards
├── connector-group-card.tsx  # Group management cards
├── create-group-modal.tsx    # Multi-step group creation
├── generate-report-modal.tsx # Report generation workflow
└── glass-card.tsx           # Frosted glass effect cards

lib/
├── services/             # Server-side data operations
│   ├── connectors.ts     # Connector CRUD with file persistence
│   ├── groups.ts         # Group management operations
│   ├── messages.ts       # Message streaming and aggregation
│   └── reports.ts        # AI report generation simulation
├── stores/               # Zustand state management
│   ├── connectors-store.ts
│   ├── groups-store.ts
│   ├── messages-store.ts
│   └── reports-store.ts
├── types/                # TypeScript type definitions
│   ├── connector.ts      # Connector and metrics interfaces
│   ├── group.ts          # Group settings and management
│   ├── message.ts        # Message activity types
│   ├── report.ts         # Report structure and insights
│   └── index.ts          # Common types and utilities
└── utils/
    └── data-fetchers.ts  # SSR data aggregation utilities

data/                     # JSON mock data (file-based persistence)
├── connectors.json       # Service connections
├── connector-groups.json # Group configurations
└── reports.json          # Generated reports
```

### Key Configurations
- **TypeScript**: Strict mode, null checks, comprehensive path aliases
- **ESLint**: Next.js recommended with TypeScript rules
- **Tailwind**: CSS variables for theming, custom animations, no prefix
- **Fonts**: Geist Sans and Geist Mono for clean, modern typography

## Core Features

### 🏠 **Landing Page** (`/`)
- **Hero Section**: Value proposition with gradient animations
- **Feature Showcase**: Glass morphism cards highlighting key capabilities
- **Social Proof**: Customer testimonials and feature highlights
- **Responsive Design**: Mobile-first with smooth animations

### 📊 **Dashboard Application** (`/dashboard`)
#### **Enhanced Dashboard Home**
- **Professional Stat Cards**: Animated metrics with hover effects and trends
- **Quick Actions FAB**: Floating action button with gradient borders
- **Real-Time Activity Feed**: Live message streaming from all connectors
- **Recent Activity Timeline**: AI-powered insights and system updates

#### **Connector Management** (`/dashboard/connectors`)
- **Service Cards**: Professional connector displays with metrics and status
- **Connector Groups**: Organize related services for shared context
- **Multi-Step Setup**: OAuth integration and webhook configuration
- **Real-Time Status**: Live connection monitoring and sync status

#### **Intelligence Reports** (`/dashboard/reports`)
- **AI-Generated Reports**: Automated insights from team communications
- **Tabbed Organization**: Filter by status (All, Completed, Processing, Recent)
- **Auto-Report Settings**: Scheduled daily generation at 8AM Asia/Manila
- **Export Capabilities**: PDF generation and sharing options

#### **Report Details** (`/dashboard/report/[id]`)
- **Comprehensive Analysis**: Summary items, action tasks, and raw message feeds
- **Interactive Elements**: Collapsible sections and progress tracking
- **Export Options**: PDF download, print, and sharing functionality

### 🏗️ **Advanced Architecture**

#### **Smart Component System**
- **Container Components**: Handle data fetching, SSR, and state management
- **Presentation Components**: Pure UI components with optimized props
- **Server-Side Rendering**: All data pre-fetched for optimal performance

#### **State Management**
- **Zustand Stores**: Domain-specific stores (connectors, groups, reports, messages)
- **Optimistic Updates**: Immediate UI feedback with error rollback
- **Real-Time Sync**: Live message streaming with duplicate detection

#### **Type Safety**
- **100% TypeScript Coverage**: Zero compilation errors, strict null checks
- **Literal Types**: Status, color, and priority constraints prevent runtime errors
- **Centralized Types**: Comprehensive interfaces in `/lib/types/`

### 🎨 **Design System**

#### **Visual Design**
- **True Black Dark Mode**: Vercel/Linear-inspired professional theme
- **Glass Morphism**: Backdrop blur effects with subtle transparency
- **Micro-Interactions**: Framer Motion animations throughout
- **Gradient Borders**: Subtle accent colors and hover effects

#### **Component Library**
- **Enhanced Stat Cards**: Professional metrics display with animations
- **Quick Actions FAB**: Floating button with smooth gradient borders
- **Message Activity Display**: Real-time feed with type indicators
- **Connector Cards**: Service management with status and metrics
- **Group Management**: Multi-step modal for connector organization
- **Glass Cards**: Frosted glass effect containers

### 🔌 **API Infrastructure**

#### **RESTful Endpoints**
- **`/api/connectors`**: CRUD operations with file persistence
- **`/api/groups`**: Connector group management and settings
- **`/api/messages`**: Message aggregation with filtering and pagination
- **`/api/messages/stream`**: Real-time message generation for live feed
- **`/api/reports`**: AI report generation and management
- **`/api/reports/[id]/pdf`**: PDF export with custom formatting

#### **Real-Time Features**
- **Message Streaming**: Live activity feed with 5-second polling
- **Duplicate Detection**: Prevents React key collisions
- **Connection Monitoring**: Real-time status updates for all services

### 🛡️ **Data Management**

#### **File-Based Persistence**
- **JSON Storage**: Simple file-based data persistence for development
- **Mock Data**: Realistic sample data for all features
- **Type-Safe Operations**: All CRUD operations properly typed

#### **Data Structure**
- **Connectors**: Service connections with metrics and status
- **Groups**: Organized collections with shared context
- **Reports**: AI-generated insights with summaries and tasks
- **Messages**: Real-time activity with filtering and search

### 🚀 **Performance Optimizations**

#### **Server-Side Rendering**
- **Pre-fetched Data**: All dashboard data loaded server-side
- **SEO Optimized**: Fast initial page loads with hydration
- **Type-Safe SSR**: Full TypeScript integration with data fetchers

#### **Client-Side Performance**
- **Optimistic Updates**: Immediate UI feedback for better UX
- **Memory Management**: Message limits and cleanup utilities
- **Efficient Re-renders**: Zustand selective subscriptions

### 📱 **Responsive Design**
- **Mobile-First**: Optimized for all screen sizes
- **Touch Interactions**: Proper touch targets and gestures
- **Adaptive Layouts**: Grid systems that scale beautifully
- **Progressive Enhancement**: Core functionality works without JavaScript

## Development Guidelines

### **Type Safety Requirements**
- **No `any` Types**: Always use explicit typing
- **Null Safety**: Proper checks for optional properties
- **Literal Types**: Use union types for constrained values
- **Interface Consistency**: Centralized type definitions

### **Component Patterns**
- **Smart/Dumb Separation**: Logic in containers, UI in components
- **Props Interface**: Always define explicit prop interfaces
- **Error Boundaries**: Graceful error handling throughout
- **Accessibility**: ARIA labels and keyboard navigation

### **Performance Standards**
- **SSR First**: Prefer server-side data fetching
- **Optimistic Updates**: Immediate UI feedback patterns
- **Memory Limits**: Implement cleanup for long-running features
- **Bundle Optimization**: Code splitting and lazy loading

This is a production-ready SaaS platform with enterprise-grade architecture, type safety, and user experience optimizations.