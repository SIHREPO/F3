# Overview

Swatch Janta is a Progressive Web Application (PWA) for civic issue reporting that enables citizens to report local problems like drainage issues, potholes, naked wires, and garbage accumulation. The application provides a mobile-first experience with photo capture, location services, and real-time reporting capabilities. Citizens can track their reports while authorities can manage and respond to issues.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend uses React 18 with TypeScript in a single-page application (SPA) architecture:

- **Framework**: React with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture

The backend follows a RESTful API pattern with Express.js:

- **Framework**: Express.js with TypeScript running on Node.js
- **Authentication**: Replit Auth integration with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **File Handling**: Multer middleware for photo uploads with 10MB size limits
- **API Structure**: Organized route handlers with middleware for authentication

## Database Architecture

The application uses PostgreSQL with Drizzle ORM for type-safe database operations:

- **ORM**: Drizzle ORM with code-first schema definition
- **Schema Design**: 
  - Users table for authentication and profile data
  - Reports table for civic issues with geolocation data
  - Sessions table for authentication session storage
- **Database Provider**: Neon serverless PostgreSQL
- **Enums**: PostgreSQL enums for issue categories and status tracking

## Authentication System

Implements Replit-based authentication with role-based access:

- **Provider**: Replit OpenID Connect integration
- **Session Storage**: PostgreSQL-backed session store with 7-day TTL
- **User Types**: Citizens (report issues) and authorities (manage issues)
- **Security**: HTTP-only cookies, CSRF protection, secure session handling

## Progressive Web App Features

The application is designed as a PWA for mobile-first civic engagement:

- **Service Worker**: Caching strategy for offline functionality
- **Web App Manifest**: Native app-like installation and appearance
- **Responsive Design**: Mobile-optimized with bottom navigation
- **Photo Capture**: Camera integration with device camera access
- **Geolocation**: HTML5 geolocation with Google Maps reverse geocoding

## File Upload System

Handles civic issue photo evidence with security controls:

- **Upload Middleware**: Multer with file type validation (images only)
- **Storage**: Local file system storage with served static endpoints
- **Security**: File size limits, MIME type validation, secure file serving
- **Integration**: Photo capture flows with camera access and preview

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting for production data
- **Drizzle Kit**: Database migration and schema management tools

## Authentication Services  
- **Replit Auth**: OpenID Connect authentication provider
- **Express Session**: Session management with PostgreSQL store

## Location Services
- **Google Maps API**: Reverse geocoding for address resolution from coordinates
- **HTML5 Geolocation**: Browser-native location services

## UI and Styling
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Radix UI**: Accessible component primitives for complex UI interactions
- **Lucide React**: Icon library for consistent iconography

## Development and Build Tools
- **Vite**: Frontend build tool with hot module replacement
- **TypeScript**: Static typing for both frontend and backend
- **ESBuild**: Fast JavaScript bundler for server-side code

## PWA Infrastructure
- **Web App Manifest**: Native app installation capabilities
- **Service Worker**: Background sync and caching strategies
- **Workbox**: PWA toolkit integration (implied by service worker implementation)