# Project Structure

## Directory Organization

```
src/
├── pages/              # Full-page components (route views)
│   ├── Dashboard.tsx
│   ├── LeadsPage.tsx
│   ├── CustomersPage.tsx
│   ├── EmployeesPage.tsx
│   ├── ProjectsPage.tsx
│   ├── ServicesPage.tsx
│   ├── PaymentsPage.tsx
│   ├── InventoryPage.tsx
│   ├── ReportsPage.tsx
│   ├── LoginPage.tsx
│   ├── Index.tsx
│   └── NotFound.tsx
│
├── components/         # Reusable components
│   ├── ui/            # shadcn-ui components (auto-generated)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   └── ... (40+ UI components)
│   │
│   ├── AppHeader.tsx           # Main header component
│   ├── AppSidebar.tsx          # Navigation sidebar
│   ├── DashboardLayout.tsx     # Layout wrapper
│   ├── KPICard.tsx             # KPI display component
│   ├── StatusBadge.tsx         # Status indicator
│   ├── OdometerStrip.tsx       # Metric display
│   ├── NavLink.tsx             # Navigation link
│   ├── CustomerFormModal.tsx   # Customer form
│   └── EmployeeFormModal.tsx   # Employee form
│
├── store/              # Zustand state stores (domain-based)
│   ├── leadsStore.ts
│   ├── customersStore.ts
│   ├── employeesStore.ts
│   ├── projectsStore.ts
│   └── servicesStore.ts
│
├── hooks/              # Custom React hooks
│   ├── use-mobile.tsx  # Mobile detection hook
│   └── use-toast.ts    # Toast notification hook
│
├── lib/                # Utility functions
│   └── utils.ts        # Helper functions (cn for class merging, etc.)
│
├── test/               # Test files
│   ├── setup.ts        # Test configuration
│   └── example.test.ts # Example test
│
├── App.tsx             # Root component with routing
├── App.css             # Global styles
├── main.tsx            # Entry point
├── index.css           # Base styles
└── vite-env.d.ts       # Vite type definitions
```

## Key Architectural Patterns

### Pages
- Located in `src/pages/`
- Represent full-page views/routes
- Import components and stores as needed
- Handle page-level logic and data fetching

### Components
- Located in `src/components/`
- Reusable, focused, single-responsibility
- UI components in `src/components/ui/` (shadcn-ui)
- Custom components for business logic

### State Management
- **Global State**: Zustand stores in `src/store/`
- One store per domain (leads, customers, employees, etc.)
- **Local State**: React hooks for component-level state
- **Server State**: React Query for API data

### Forms
- Use React Hook Form + Zod validation
- Modal-based forms (CustomerFormModal, EmployeeFormModal)
- Validation schemas defined with Zod

## File Naming Conventions

- **Components**: PascalCase (e.g., `CustomerFormModal.tsx`)
- **Hooks**: camelCase with `use-` prefix (e.g., `use-mobile.tsx`)
- **Pages**: PascalCase (e.g., `CustomersPage.tsx`)
- **Stores**: camelCase with `Store` suffix (e.g., `customersStore.ts`)
- **Utilities**: camelCase (e.g., `utils.ts`)

## Import Patterns

- Use `@/` alias for absolute imports: `import { Button } from '@/components/ui/button'`
- Group imports: React → external libraries → local files
- Keep imports organized and remove unused ones
