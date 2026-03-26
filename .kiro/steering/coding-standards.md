# Coding Standards & Best Practices

## TypeScript
- Always use TypeScript for type safety
- Define interfaces/types for props and data structures
- Avoid `any` type - use proper typing
- Use strict mode in tsconfig

## React Components
- Use functional components with hooks
- Keep components focused and single-responsibility
- Extract reusable logic into custom hooks
- Use React.memo for performance optimization when needed
- Prefer composition over inheritance

## File Naming
- Components: PascalCase (e.g., `CustomerFormModal.tsx`)
- Utilities/hooks: camelCase (e.g., `use-mobile.tsx`)
- Pages: PascalCase (e.g., `CustomersPage.tsx`)

## Styling
- Use Tailwind CSS utility classes
- Leverage shadcn-ui components for consistency
- Avoid inline styles
- Use CSS modules only when necessary
- Follow the existing color and spacing conventions

## State Management
- Use Zustand for global state (see `src/store/`)
- Keep store files focused on single domains
- Use React hooks for local component state
- Use React Query for server state

## Forms
- Use React Hook Form with Zod validation
- Define Zod schemas for validation
- Keep form logic in custom hooks when complex
- Use shadcn-ui form components

## Code Organization
- Group related functionality together
- Keep utility functions in `src/lib/`
- Custom hooks in `src/hooks/`
- UI components in `src/components/ui/`
- Page-specific components in their respective page folders

## Imports
- Use absolute imports with `@/` alias
- Group imports: React → external libraries → local files
- Keep imports organized and remove unused ones

## Error Handling
- Use try-catch for async operations
- Provide user-friendly error messages
- Log errors appropriately
- Use toast notifications for user feedback

## Testing
- Write tests for critical business logic
- Use Vitest for unit tests
- Keep tests focused and readable
- Test behavior, not implementation details

## Performance
- Lazy load pages with React.lazy
- Memoize expensive computations
- Optimize re-renders with proper dependency arrays
- Use React Query for efficient data fetching

## Accessibility
- Use semantic HTML
- Include proper ARIA labels
- Ensure keyboard navigation works
- Test with screen readers
- Use shadcn-ui components which have built-in a11y

## Git Commits
- Write clear, descriptive commit messages
- Keep commits focused on single features/fixes
- Reference issues when applicable
