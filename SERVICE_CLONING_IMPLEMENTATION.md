# Service Cloning Implementation - Multi-Assignment Feature

## ⚠️ CRITICAL FIXES APPLIED

### Problem
Services were being hidden after first assignment, preventing cloning.

### Root Causes Fixed
1. **Services Panel Filter**: Removed `.filter()` that hid already-scheduled services
2. **Work Order Filter**: Removed logic that hid work orders when all services were scheduled
3. **Drag Logic**: Ensured services are never removed from source (only scheduled jobs are)

### Result
✅ Services now remain visible and draggable after assignment
✅ Same service can be dragged unlimited times
✅ Each drag creates a new independent instance

---

## Overview
Services can now be assigned to multiple employees by dragging them repeatedly from the Services panel. Each drag creates a new cloned instance without removing the original service from the panel.

## How It Works

### 1. Cloning Behavior (Services from Panel)
When you drag a service from the Services panel:
- ✅ Original service **remains in the panel**
- ✅ Each drop creates a **new independent instance**
- ✅ Same service can be dragged **unlimited times**
- ✅ Each assignment is to **one employee + one time slot**
- ✅ No "already assigned" restrictions

### 2. Moving Behavior (Scheduled Jobs)
When you drag an already scheduled job from the calendar:
- ✅ Job is **removed from original location**
- ✅ Job is **moved to new location**
- ✅ This is re-scheduling, not cloning

## Technical Implementation

### Key Changes in `QuantCalendarPage.tsx`

#### 1. Removed Service Filtering (CRITICAL FIX)

**Before (Blocked Cloning):**
```typescript
// Services panel - WRONG: Hides already scheduled services
{getTasksByWorkOrder(selectedWorkOrder.id)
  .filter(service => {
    // Only show services that are not yet scheduled
    return !filteredSchedule.some(s => 
      s.workOrderId === selectedWorkOrder.id && s.serviceId === service.id
    );
  })
  .map(service => <DraggableServiceCard ... />)
}
```

**After (Enables Cloning):**
```typescript
// Services panel - CORRECT: Shows all services always
{getTasksByWorkOrder(selectedWorkOrder.id)
  .map(service => (
    <DraggableServiceCard
      key={service.id}
      service={service}
      workOrder={selectedWorkOrder}
    />
  ))
}
```

#### 2. Removed Work Order Filtering (CRITICAL FIX)

**Before (Hid Work Orders):**
```typescript
// Check if ALL services are scheduled
const allServicesScheduled = services.every(service => 
  filteredSchedule.some(s => s.workOrderId === wo.id && s.serviceId === service.id)
);

// Only hide if ALL services are scheduled
const hasUnscheduledServices = !allServicesScheduled;

return matchesSearch && hasUnscheduledServices && matchesService;
```

**After (Always Shows Work Orders):**
```typescript
// Service type filter only
const matchesService = selectedService === "all" || 
                      wo.serviceType.split('(')[0].trim() === selectedService;

return matchesSearch && matchesService;
```

#### 3. Updated Scheduled Count Logic

**Before (Counted per service):**
```typescript
const scheduledCount = services.filter(service => 
  filteredSchedule.some(s => s.workOrderId === wo.id && s.serviceId === service.id)
).length;
```

**After (Counts unique services with assignments):**
```typescript
// Count how many unique services have been scheduled at least once
const scheduledServiceIds = new Set(
  filteredSchedule
    .filter(s => s.workOrderId === wo.id)
    .map(s => s.serviceId)
);
const scheduledCount = scheduledServiceIds.size;
```

This correctly shows "2/3 scheduled" even if those 2 services have been assigned multiple times.

#### 4. `handleDragStart` Function
```typescript
const handleDragStart = (event: DragStartEvent) => {
  const dragData = event.active.data.current as DragData;
  
  // Only allow services to be dragged, not work orders
  if (dragData?.type === 'workOrder' && !dragData.service) {
    return; // Reject work orders without services
  }
  
  setActiveDragData(dragData);
  
  // Only remove from schedule if dragging a scheduled job (re-dragging)
  // Do NOT remove if dragging a service from the service panel (cloning behavior)
  if (dragData?.type === 'scheduledJob' && dragData.scheduledJob) {
    setSchedule(prev => prev.filter(s => s.id !== dragData.scheduledJob!.id));
  }
  // For 'service' type, we don't remove anything - this enables cloning
};
```

**Key Points:**
- Services (`type: 'service'`) are NOT removed from source
- Scheduled jobs (`type: 'scheduledJob'`) ARE removed for moving
- This distinction enables cloning for services and moving for scheduled jobs

#### 5. `handleDragEnd` Function
```typescript
const handleDragEnd = (event: DragEndEvent) => {
  // ... validation logic ...
  
  // Create new scheduled job (always creates a new instance - cloning behavior)
  // Use timestamp to ensure unique IDs even for the same service
  const newJob: ScheduledJob = {
    id: `job-${workOrder.id}-${service.id}-${employeeId}-${timeSlot}-${Date.now()}`,
    workOrderId: workOrder.id,
    serviceId: service.id,
    employeeId,
    startTime: timeSlot,
    duration,
    date,
    selectedTimeSlot: formatTimeSlot(timeSlot),
  };

  // Always add the new job (cloning behavior for services, moving behavior for scheduled jobs)
  setSchedule(prev => [...prev, newJob]);
  setActiveDragData(null);
  setActiveDropZone(null);
};
```

**Key Points:**
- Always creates a new job instance
- Uses `Date.now()` timestamp for unique IDs
- Supports multiple instances of the same service
- No removal of source service

### Data Structure

#### DragData Type
```typescript
type DragData = {
  type: 'workOrder' | 'service' | 'scheduledJob';
  workOrder: any;
  service?: any;
  scheduledJob?: ScheduledJob;
};
```

#### ScheduledJob Type
```typescript
type ScheduledJob = {
  id: string;                    // Unique ID with timestamp
  workOrderId: string;           // Parent work order
  serviceId: string;             // Service being assigned
  employeeId: string;            // Assigned employee
  startTime: number;             // Start hour (e.g., 9 for 9 AM)
  duration: number;              // Duration in hours
  date: string;                  // Date (YYYY-MM-DD)
  selectedTimeSlot: string;      // Formatted time (e.g., "9AM")
};
```

## User Workflow

### Assigning a Service Multiple Times

1. **Click a work order** with services (shows "Click to expand" badge)
2. **Services panel appears** in the middle showing all services
3. **Drag a service** from the panel to an employee's time slot
4. **Drop the service** - it gets assigned
5. **Service remains in panel** - ready to drag again
6. **Repeat steps 3-4** to assign the same service to:
   - Different employees
   - Different time slots
   - Same employee at different times

### Example Scenario
```
Service: "Pest Control"

Drag 1: Assign to Employee A at 9 AM → Creates job-1
Drag 2: Assign to Employee B at 10 AM → Creates job-2
Drag 3: Assign to Employee A at 2 PM → Creates job-3

Result: 3 independent scheduled jobs, all for "Pest Control"
Service "Pest Control" still visible in panel for more assignments
```

## Backend Considerations

### Database Schema
The backend should support multiple records with:
- Same `serviceId`
- Different `employeeId` and/or `timeSlot`
- Unique `id` for each scheduled job

### Example Records
```json
[
  {
    "id": "job-WO-001-SVC-123-EMP-A-9-1234567890",
    "workOrderId": "WO-001",
    "serviceId": "SVC-123",
    "employeeId": "EMP-A",
    "startTime": 9,
    "date": "2026-04-15"
  },
  {
    "id": "job-WO-001-SVC-123-EMP-B-10-1234567891",
    "workOrderId": "WO-001",
    "serviceId": "SVC-123",
    "employeeId": "EMP-B",
    "startTime": 10,
    "date": "2026-04-15"
  }
]
```

## No Restrictions

### Removed Logic
- ❌ No `isAssigned` flag
- ❌ No `disabled` state after first assignment
- ❌ No "already assigned" blocking
- ❌ No single assignment restriction
- ❌ No removal from source list

### What's Allowed
- ✅ Unlimited assignments per service
- ✅ Same service to multiple employees
- ✅ Same service to same employee at different times
- ✅ Drag the same service card repeatedly

## Conflict Detection

The system still prevents:
- ⚠️ Time slot conflicts (overlapping schedules for same employee)
- ⚠️ Invalid drops (outside drop zones)

But allows:
- ✅ Same service assigned multiple times
- ✅ Multiple employees working on same service
- ✅ Parallel service execution

## Visual Feedback

### During Drag
- Service card shows 50% opacity while dragging
- Drop zones highlight in blue when hovering
- Drag overlay follows cursor

### After Drop
- New scheduled job appears in calendar
- Original service remains in panel (unchanged)
- Toast notification confirms assignment
- Service card returns to normal state

## Testing Checklist

- [x] Drag service from panel → drops successfully
- [x] Service remains in panel after drop
- [x] Drag same service again → creates second instance
- [x] Both instances appear in calendar
- [x] Each instance has unique ID
- [x] Can assign to different employees
- [x] Can assign to different time slots
- [x] Can assign to same employee at different times
- [x] Conflict detection still works
- [x] Re-dragging scheduled jobs moves them (not clone)
- [x] Remove button works for scheduled jobs
- [x] No disabled states on service cards

## Summary

The service cloning feature enables flexible multi-assignment by:
1. **Never removing** services from the source panel
2. **Always creating** new instances on drop
3. **Using timestamps** for unique IDs
4. **Distinguishing** between cloning (services) and moving (scheduled jobs)

This allows the same service to be assigned to multiple employees and time slots without any restrictions, while maintaining conflict detection and data integrity.
