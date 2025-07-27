# Luna Period Tracker - Replit Configuration

## Overview

Luna is a modern period tracking application built with a full-stack TypeScript architecture. The application provides comprehensive menstrual cycle tracking, symptom monitoring, and data visualization through an intuitive mobile-first interface. It uses a clean separation between frontend (React), backend (Express), and shared code for type safety and maintainability.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **State Management**: TanStack Query (React Query) for server state and caching
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Radix UI components with Tailwind CSS styling
- **Design System**: shadcn/ui component library with custom period tracking theme
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Neon serverless database
- **ORM**: Drizzle ORM for type-safe database operations
- **Session Management**: Express sessions with PostgreSQL store
- **API Design**: RESTful endpoints with JSON responses

### Development Architecture
- **Monorepo Structure**: Single repository with client, server, and shared code
- **Code Sharing**: Shared TypeScript schemas and types between frontend and backend
- **Development Server**: Vite dev server with Express API proxy
- **Hot Reload**: Full-stack hot reload during development

## Key Components

### Database Schema
- **Period Entries**: Tracks menstrual periods with start/end dates and flow intensity
- **Symptoms**: Records daily symptoms including mood, energy, physical symptoms, and notes
- **Analytics**: Computed cycle predictions and statistics

### Core Features
1. **Period Logging**: Record period start/end dates with flow intensity tracking
2. **Symptom Tracking**: Daily mood, energy levels, and physical symptoms
3. **Calendar View**: Visual calendar showing periods, symptoms, and cycle phases
4. **Analytics**: Cycle predictions, averages, and trend analysis
5. **Data Export**: JSON export functionality for user data portability

### UI Components
- **Bottom Navigation**: Mobile-first navigation between main app sections
- **Modal Systems**: Period logging and symptom tracking modals
- **Calendar Interface**: Custom calendar with period and symptom visualization
- **Statistics Dashboard**: Charts and metrics for cycle analysis

## Data Flow

### Client-Server Communication
1. **API Requests**: RESTful API calls using fetch with TanStack Query
2. **Real-time Updates**: Optimistic updates with automatic cache invalidation
3. **Error Handling**: Comprehensive error boundaries and user feedback
4. **Data Validation**: Zod schemas for runtime type checking on both ends

### State Management
1. **Server State**: TanStack Query manages all server data with caching
2. **UI State**: React hooks for local component state
3. **Form State**: React Hook Form with Zod validation
4. **Global State**: Minimal global state through React Context

### Storage Strategy
- **Production**: PostgreSQL database via Neon serverless
- **Development**: In-memory storage for rapid development
- **Migrations**: Drizzle Kit for database schema management
- **Backup**: JSON export functionality for user data portability

## External Dependencies

### Database
- **Primary**: Neon PostgreSQL serverless database
- **Connection**: `@neondatabase/serverless` driver for edge compatibility
- **Session Store**: PostgreSQL-backed session storage

### UI Libraries
- **Component System**: Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with CSS custom properties
- **Icons**: Lucide React icon library
- **Date Handling**: date-fns for date manipulation and formatting

### Development Tools
- **Build System**: Vite with React and TypeScript plugins
- **Type Checking**: TypeScript strict mode with path mapping
- **Code Quality**: ESLint configuration (implied by structure)
- **Development**: Replit-specific plugins for enhanced development experience

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite bundles React app to `dist/public`
2. **Backend Build**: esbuild compiles Express server to `dist/index.js`
3. **Shared Code**: TypeScript compilation includes shared schemas
4. **Static Assets**: Frontend build outputs served by Express in production

### Environment Configuration
- **Development**: NODE_ENV=development with hot reload and detailed logging
- **Production**: NODE_ENV=production with optimized builds and error handling
- **Database**: DATABASE_URL environment variable for PostgreSQL connection

### Production Deployment
- **Server**: Single Express server serves both API and static files
- **Database**: Neon PostgreSQL serverless for automatic scaling
- **Session**: PostgreSQL-backed sessions for user state persistence
- **Monitoring**: Request logging and error tracking built into Express middleware

### Development Workflow
- **Local Development**: `npm run dev` starts both frontend and backend with hot reload
- **Database Setup**: `npm run db:push` applies schema changes to database
- **Type Checking**: `npm run check` validates TypeScript across entire codebase
- **Build Verification**: `npm run build` creates production-ready artifacts