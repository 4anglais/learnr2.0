---
description: Repository Information Overview
alwaysApply: true
---

# Learnr 2.0 Information

## Summary
**Learnr 2.0** is a modern productivity web application designed specifically for students. It provides a comprehensive platform for managing tasks, planning study schedules via a calendar, tracking learning progress with visual charts, and following structured learning roadmaps. The application is built with a focus on ease of use and student-centric features.

## Structure
- **src/components**: Contains reusable UI components, organized by feature (dashboard, layout, planner, tasks, ui).
- **src/contexts**: React context providers, primarily for authentication (`AuthContext`).
- **src/hooks**: Custom React hooks for business logic and data fetching (e.g., `useTasks`, `useRoadmaps`, `useFocusSessions`).
- **src/integrations**: External service configurations, specifically for **Firebase**.
- **src/pages**: Main route components for the application (Dashboard, Tasks, Calendar, Progress, Planner, etc.).
- **src/services**: Service layer for interacting with Firebase (Firestore) for categories and tasks.
- **src/types**: TypeScript interfaces and types, particularly for Firestore document schemas.
- **public**: Static assets like icons and robots.txt.

## Language & Runtime
**Language**: TypeScript  
**Version**: TypeScript 5.8.3  
**Build System**: Vite  
**Package Manager**: npm (also contains `bun.lockb`, suggesting Bun support)

## Dependencies
**Main Dependencies**:
- **React**: ^18.3.1
- **Firebase**: ^10.8.0 (Firestore, Auth, Storage)
- **React Router Dom**: ^6.30.1
- **TanStack React Query**: ^5.83.0
- **Tailwind CSS**: ^3.4.19
- **Shadcn UI (Radix UI)**: Multiple components (accordion, dialog, popover, etc.)
- **Lucide React**: ^0.462.0
- **Recharts**: ^2.15.4 (for progress tracking)
- **Zod**: ^3.25.76 (for schema validation)

**Development Dependencies**:
- **Vite**: ^5.4.19
- **ESLint**: ^9.32.0
- **TypeScript**: ^5.8.3
- **PostCSS / Autoprefixer**: For styling.

## Build & Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Main Files & Resources
**Application Entry Points**:
- `src/main.tsx`: React application entry point.
- `src/App.tsx`: Main application component with routing.

**Configuration Files**:
- `firebase.json` / `.firebaserc`: Firebase hosting and project configuration.
- `tailwind.config.ts`: Tailwind CSS configuration.
- `tsconfig.json`: TypeScript configuration.
- `vite.config.ts`: Vite configuration.
- `components.json`: Shadcn UI configuration.

**Database Schema**:
- `FIRESTORE_SCHEMA.md`: Documentation of Firestore collections (users, tasks, categories, focus_sessions, study_sessions, roadmaps, milestones, steps, user_settings).
- `firestore.rules`: Security rules for Firestore.
- `firestore.indexes.json`: Composite index definitions.

## Testing
No testing framework or test files were found in the current repository structure.

## Deployment
The project is configured for deployment on **Vercel** (as per README) and also contains **Firebase** hosting configuration.
