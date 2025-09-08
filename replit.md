# StatWise Admin Panel

## Overview

The StatWise Admin Panel is a comprehensive web-based dashboard designed to manage and monitor the StatWise AI Sports Prediction PWA. It provides administrators with complete control over users, subscriptions, payments, referrals, prediction content, and system settings through an intuitive interface built with modern web technologies.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built as a Single Page Application (SPA) using vanilla JavaScript with a modular architecture. Key components include:
- **Client-side routing** with hash-based navigation for seamless page transitions
- **Modular JavaScript classes** for each major feature (Dashboard, Users, Subscriptions, Referrals, Predictions, Settings)
- **Bootstrap 5** for responsive UI components and styling
- **Chart.js** for data visualization and analytics charts
- **Theme system** supporting light and dark modes with CSS custom properties

### Backend Architecture
The backend follows a RESTful API design pattern using Node.js and Express:
- **Express.js server** with middleware for CORS, sessions, and static file serving
- **Route-based organization** with separate modules for auth, users, subscriptions, referrals, predictions, and admin management
- **Role-based access control** with middleware for authentication and permission checking
- **Session management** using express-session for admin authentication state

### Database Design
The system uses a PostgreSQL database through Supabase with the following key tables:
- **user_profiles** - Core user information and subscription status
- **subscription_events** - Subscription lifecycle tracking
- **payment_transactions** - Financial transaction records
- **referrals** - Referral tracking and rewards
- **admin_users** - Administrative user management with role-based permissions
- **system_logs** - Audit trail for administrative actions
- **prediction_results** - AI prediction accuracy and performance metrics

### Authentication and Authorization
- **Supabase Authentication** for secure admin login
- **JWT token-based** session management
- **Role-based permissions** system with granular access control
- **Admin-only access** verification middleware on all protected routes

### API Structure
RESTful API endpoints organized by functional domains:
- `/api/auth` - Authentication and session management
- `/api/users` - User management and analytics
- `/api/subscriptions` - Payment and subscription tracking
- `/api/referrals` - Referral system management
- `/api/predictions` - Prediction content and analytics
- `/api/admin` - Administrative functions and system logs

## External Dependencies

### Core Services
- **Supabase** - Primary database (PostgreSQL), authentication, and real-time subscriptions
- **Express.js** - Web application framework for the backend API
- **Bootstrap 5** - Frontend UI framework for responsive design
- **Chart.js** - Data visualization library for analytics dashboards

### Development Tools
- **Node.js** - JavaScript runtime environment
- **npm** - Package management and dependency resolution

### Frontend Libraries
- **Font Awesome** - Icon library for UI elements
- **Vanilla JavaScript** - No additional frontend frameworks, using modern ES6+ features

### Backend Dependencies
- **cors** - Cross-origin resource sharing middleware
- **dotenv** - Environment variable management
- **express-session** - Session management for admin authentication

The system is designed to be self-contained with minimal external dependencies, relying primarily on Supabase for backend services and standard web technologies for the frontend implementation.