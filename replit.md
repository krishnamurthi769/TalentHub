# Athletic Performance Tracking Platform

## Overview

This is a comprehensive athletic performance tracking platform that combines athlete development, coaching tools, and gamification elements. The application enables athletes to track their progress, submit talent showcases, complete daily tasks, and compete on leaderboards while providing coaches with management tools for their athletes. The platform uses a points-based achievement system with badges (Bronze, Silver, Gold, Platinum) to motivate user engagement.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Shadcn/UI component library built on Radix UI primitives with Tailwind CSS for styling
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Context Providers**: Custom contexts for authentication (AuthContext) and user profile management (UserContext)

### Backend Architecture
- **Server Framework**: Express.js with TypeScript running on Node.js
- **API Design**: RESTful API with conventional HTTP methods and status codes
- **Request Handling**: JSON-based request/response with Express middleware for logging and error handling
- **Database Integration**: Drizzle ORM for type-safe database operations
- **Development Setup**: Vite integration for hot module replacement in development

### Authentication & Authorization
- **Authentication Provider**: Firebase Authentication with support for email/password and Google OAuth
- **Session Management**: Firebase tokens passed via headers for API requests
- **Role-Based Access**: User roles (athlete, coach, admin) determine available features and data access
- **Authorization Pattern**: Firebase UID header validation on protected API endpoints

### Database Architecture
- **Database**: PostgreSQL with Neon Database as the cloud provider
- **ORM**: Drizzle ORM with schema-first approach for type safety
- **Schema Design**: Relational database with tables for users, talents, achievements, daily tasks, performance records, and injury alerts
- **Data Validation**: Zod schemas shared between frontend and backend for consistent validation
- **Migrations**: Drizzle Kit for database schema migrations

### Data Models
- **Users**: Core user profiles with metrics, points, badges, and role-based permissions
- **Talents**: User-submitted skills and achievements requiring approval workflow
- **Achievements**: Gamification system with point thresholds and badge progression
- **Daily Tasks**: Recurring challenges for user engagement with point rewards
- **Performance Records**: Athlete performance tracking over time
- **Leaderboards**: Ranking system with regional, sport-specific, and time-based filtering

### Performance & Caching
- **Client-Side Caching**: TanStack Query with 5-minute stale time for user profiles
- **Query Invalidation**: Strategic cache invalidation on mutations to maintain data consistency
- **Image Optimization**: Lazy loading and optimized asset delivery
- **Bundle Optimization**: Vite-based code splitting and tree shaking

### Development Experience
- **Hot Reload**: Vite HMR for instant development feedback
- **Type Safety**: End-to-end TypeScript with shared types between frontend and backend
- **Code Organization**: Feature-based component structure with reusable UI components
- **Path Aliases**: Configured aliases for clean import statements (@/, @shared/, @assets/)

## External Dependencies

### Core Infrastructure
- **Database**: Neon Database (PostgreSQL cloud provider)
- **Authentication**: Firebase Authentication and Firestore
- **Build Tool**: Vite with React plugin for fast development and optimized builds

### Key Libraries
- **UI Components**: Radix UI primitives with Shadcn/UI component system
- **Styling**: Tailwind CSS with custom design tokens and responsive design
- **Charts**: Chart.js with React wrapper for performance visualization
- **Form Handling**: React Hook Form with Hookform Resolvers for Zod integration
- **Date Handling**: date-fns for date manipulation and formatting

### Development Tools
- **Type Validation**: Zod for runtime type checking and schema validation
- **Database Tools**: Drizzle Kit for migrations and database management
- **Code Quality**: TypeScript strict mode with comprehensive type checking
- **Development Plugins**: Replit-specific plugins for enhanced development experience

### Potential Integrations
- **AI Services**: OpenAI integration for training recommendations and injury risk analysis
- **Email Services**: Potential integration for notifications and user communications
- **File Storage**: Firebase Storage for user-uploaded content and media
- **Analytics**: Potential integration for user behavior tracking and platform analytics