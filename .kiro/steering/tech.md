# Technology Stack & Build System

## Build System

- **Build Tool**: Vite (v5.4.19)
- **Development Server**: Runs on port 8080 with HMR enabled
- **Build Output**: Optimized production bundle via `vite build`

## Frontend Framework & Language

- **React**: v18.3.1 with TypeScript (v5.8.3)
- **Rendering**: React with SWC compiler for fast builds

## UI & Styling

- **Component Library**: shadcn-ui (Radix UI components)
- **Styling**: Tailwind CSS (v3.4.17)
- **Icons**: Lucide React (v0.462.0)
- **Animations**: tailwindcss-animate

## State Management & Data

- **Global State**: Zustand (v5.0.11)
- **Server State**: TanStack React Query (v5.83.0)
- **Routing**: React Router v6 (v6.30.1)

## Forms & Validation

- **Form Library**: React Hook Form (v7.61.1)
- **Validation**: Zod (v3.25.76)
- **Form Resolver**: @hookform/resolvers

## Charts & Visualization

- **Charts**: Recharts (v2.15.4)

## Notifications & UI Feedback

- **Toast Notifications**: Sonner (v1.7.4)
- **Toast System**: React Toaster

## Development Tools

- **Linting**: ESLint (v9.32.0) with React hooks plugin
- **Testing**: Vitest (v3.2.4)
- **Testing Library**: @testing-library/react (v16.0.0)
- **Type Checking**: TypeScript strict mode (with some relaxed settings)

## Common Commands

```bash
# Development
npm run dev              # Start dev server on port 8080
npm run preview         # Preview production build locally

# Building
npm run build           # Build for production
npm run build:dev       # Build in development mode

# Code Quality
npm run lint            # Run ESLint

# Testing
npm run test            # Run tests once
npm run test:watch      # Run tests in watch mode
```

## Path Aliases

- `@/` → `./src/` (absolute imports for cleaner code)

## Development Environment

- **Node.js**: Required (use nvm for version management)
- **Package Manager**: npm
- **Component Tagging**: Lovable tagger plugin for development
