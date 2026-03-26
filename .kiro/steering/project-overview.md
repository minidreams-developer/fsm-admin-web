# Project Overview

## Project Type
Business Management Dashboard - A comprehensive CRM/ERP-style application for managing leads, customers, employees, projects, services, payments, inventory, and reports.

## Tech Stack
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn-ui (Radix UI components)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router v6
- **Data Fetching**: TanStack React Query
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: Sonner + React Toaster

## Project Structure
```
src/
├── pages/           # Page components (Dashboard, Leads, Customers, etc.)
├── components/      # Reusable components
│   ├── ui/         # shadcn-ui components
│   └── Custom components (AppHeader, AppSidebar, etc.)
├── store/          # Zustand stores for state management
├── hooks/          # Custom React hooks
├── lib/            # Utility functions
└── test/           # Test files
```

## Key Features
- Multi-page dashboard with sidebar navigation
- Lead management
- Customer management with detail pages
- Employee management
- Project tracking
- Service management
- Payment processing
- Inventory management
- Reports and analytics
- User authentication (Login page)

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run preview` - Preview production build

## Important Notes
- This is a Lovable project (AI-assisted development platform)
- Uses TypeScript for type safety
- Component-driven architecture with shadcn-ui
- Zustand for lightweight state management
- Zod for runtime type validation
