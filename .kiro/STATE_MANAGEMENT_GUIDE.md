# State Management Implementation Guide

## Overview
This document explains the Zustand-based state management system implemented to fix critical data persistence issues across the application.

## Problem Solved
Previously, the application used `location.state` to pass data between pages, which caused data loss on:
- Page refresh
- Browser back/forward navigation
- Direct URL access

## Solution: Zustand Stores

### Architecture
Three main stores manage application state:

1. **Leads Store** (`src/store/leadsStore.ts`)
   - Manages lead data and lifecycle
   - Persists to localStorage automatically
   - Handles lead status transitions

2. **Projects Store** (`src/store/projectsStore.ts`)
   - Manages work orders
   - Generates unique work order IDs
   - Persists to localStorage automatically

3. **Services Store** (`src/store/servicesStore.ts`)
   - Manages service appointments
   - Links appointments to work orders
   - Persists to localStorage automatically

### Key Features
- **Automatic Persistence**: All stores use Zustand's persist middleware to save data to localStorage
- **Type Safety**: Full TypeScript support with proper types
- **Immutable Updates**: All state updates are immutable
- **Selective Updates**: Only update specific fields without affecting others

## Data Flow

### Lead → Work Order → Service Appointment Flow

```
1. LeadsPage
   - User sends quote to lead
   - Lead status changes to "Quote Sent"
   - Data saved to leadsStore

2. User clicks "Convert to Project"
   - Navigate to /projects?convertLeadId={leadId}
   - ProjectsPage reads leadId from URL
   - Fetches lead data from leadsStore
   - Pre-fills form with lead information
   - User creates work order
   - Work order saved to projectsStore
   - Lead status updated to "Converted"

3. User clicks "Assign Service"
   - Navigate to /services?workOrderId={woId}
   - ServicesPage reads workOrderId from URL
   - Fetches work order from projectsStore
   - Pre-fills form with work order details
   - User assigns service to employee
   - Service appointment saved to servicesStore
```

## URL Parameters vs location.state

### Before (Broken)
```typescript
navigate("/projects", { state: { convertLead: lead } });
// Data lost on refresh or direct URL access
```

### After (Fixed)
```typescript
navigate(`/projects?convertLeadId=${lead.id}`);
// Data persisted in store, retrieved via URL parameter
```

## Usage Examples

### Reading Data
```typescript
import { useLeadsStore } from "@/store/leadsStore";

const { leads, getLead } = useLeadsStore();

// Get all leads
const allLeads = leads;

// Get specific lead
const lead = getLead(123);
```

### Updating Data
```typescript
const { updateLead } = useLeadsStore();

// Update lead status
updateLead(123, { status: "Converted" });

// Update multiple fields
updateLead(123, { 
  status: "Quote Sent",
  quoteAmount: 5000,
  quoteContract: "3 Months"
});
```

### Adding Data
```typescript
const { addLead } = useLeadsStore();

addLead({
  name: "John Doe",
  phone: "9876543210",
  address: "123 Main St",
  services: ["Pest Control"],
  status: "New",
  date: "Mar 13",
  quoteIsViewed: false,
  quoteViewedAt: null
});
```

## Benefits

1. **Data Persistence**: Data survives page refreshes and navigation
2. **No Network Calls**: All data stored locally (ready for backend integration)
3. **Type Safety**: Full TypeScript support prevents runtime errors
4. **Automatic Sync**: localStorage automatically syncs across browser tabs
5. **Easy Testing**: Stores can be easily mocked for unit tests
6. **Scalability**: Easy to add new stores or extend existing ones

## Next Steps

### Phase 1: Backend Integration
- Replace localStorage with API calls
- Add authentication tokens
- Implement error handling for API failures

### Phase 2: Advanced Features
- Add undo/redo functionality
- Implement optimistic updates
- Add real-time sync with WebSockets

### Phase 3: Performance
- Add pagination for large datasets
- Implement data caching strategies
- Add loading states

## Troubleshooting

### Data Not Persisting
- Check browser localStorage is enabled
- Verify store is using persist middleware
- Check browser console for errors

### Data Not Updating
- Ensure using store methods (updateLead, addLead, etc.)
- Don't mutate state directly
- Use proper TypeScript types

### Performance Issues
- Consider pagination for large datasets
- Use selectors to avoid unnecessary re-renders
- Monitor localStorage size (5-10MB limit)

## File Structure
```
src/
├── store/
│   ├── leadsStore.ts
│   ├── projectsStore.ts
│   └── servicesStore.ts
├── pages/
│   ├── LeadsPage.tsx (uses leadsStore)
│   ├── ProjectsPage.tsx (uses projectsStore + leadsStore)
│   └── ServicesPage.tsx (uses servicesStore + projectsStore)
└── App.tsx
```
