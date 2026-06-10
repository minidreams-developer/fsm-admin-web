# Multiple Service Cards Based on Required Employees

**Date**: June 10, 2026
**Status**: ✅ **IMPLEMENTED**

---

## Feature Overview

When creating a work order with Service Appointments Schedule, you can specify how many employees are required for each service. This number now determines how many service cards are displayed in the `/quant-calendar` page.

**Example**: If a service requires 4 employees, 4 identical service cards will appear in the calendar for easy assignment.

---

## How It Works

### Step 1: Create Work Order with Service Appointments
In `/create-work-order`:
1. Add services to the work order
2. For each service, specify **Required Employees** count
3. Example: Service "Cockroach Control" with 4 required employees

### Step 2: View in QuantCalendar
In `/quant-calendar`:
- The service will appear as **4 separate cards** in the left panel
- Each card is labeled with employee number (E1/4, E2/4, E3/4, E4/4)
- Each card can be independently dragged and assigned

---

## Implementation Details

### Changes Made

#### 1. QuantCalendarPage - Left Panel Service Rendering
**File**: `src/pages/QuantCalendarPage.tsx`

**Before**:
```typescript
services.map(service => (
  <DraggableServiceCard
    key={service.id}
    service={service}
    workOrder={wo}
    onEdit={(id: string) => navigate(`/edit-work-order/${id}`)}
  />
))
```

**After**:
```typescript
services.map(service => {
  // Find the service schedule to get requiredEmployees count
  const serviceSchedule = wo.serviceSchedules?.find(
    (ss: any) => ss.service === service.title || ss.service === service.id
  );
  
  // Get the required employees count (default to 1 if not specified)
  const requiredEmployees = serviceSchedule?.requiredEmployees || 1;
  
  // Create multiple cards based on requiredEmployees count
  return Array.from({ length: requiredEmployees }, (_, index) => (
    <DraggableServiceCard
      key={`${service.id}-emp-${index + 1}`}
      service={service}
      workOrder={wo}
      employeeNumber={index + 1}
      totalEmployees={requiredEmployees}
      onEdit={(id: string) => navigate(`/edit-work-order/${id}`)}
    />
  ));
})
```

**What Changed**:
- Reads `requiredEmployees` from service schedule
- Creates multiple cards using `Array.from()`
- Each card has unique key with employee number
- Passes employee number and total count as props

#### 2. DraggableServiceCard - Component Props
**Before**:
```typescript
const DraggableServiceCard = ({ service, workOrder, onEdit }: any)
```

**After**:
```typescript
const DraggableServiceCard = ({ service, workOrder, onEdit, employeeNumber = 1, totalEmployees = 1 }: any)
```

**New Props**:
- `employeeNumber`: Current employee index (1-based)
- `totalEmployees`: Total number of cards for this service

#### 3. Draggable ID Generation
**Before**:
```typescript
id: `service-${service.id}`,
```

**After**:
```typescript
id: `service-${service.id}-emp-${employeeNumber}`,
```

**Why**: Each card needs a unique ID for drag-and-drop to work independently

#### 4. Employee Badge Display
**New Badge Added to Card**:
```typescript
{totalEmployees > 1 && (
  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">E{employeeNumber}/{totalEmployees}</span>
)}
```

**Example Badges**:
- E1/4 (first employee of 4 needed)
- E2/4 (second employee of 4 needed)
- E3/4 (third employee of 4 needed)
- E4/4 (fourth employee of 4 needed)

---

## Example Scenarios

### Scenario 1: Single Employee Service
```
Service: "Cockroach Control"
Required Employees: 1

/quant-calendar shows:
  ✓ 1 card
```

### Scenario 2: Four Employee Service
```
Service: "Cockroach Control"
Required Employees: 4

/quant-calendar shows:
  ✓ 4 identical cards
  ✓ E1/4, E2/4, E3/4, E4/4 badges
  ✓ Each can be dragged independently
  ✓ Each can be assigned to different employee
```

### Scenario 3: Mixed Requirements
```
Work Order has 2 services:
  - Service A: 2 required employees
  - Service B: 3 required employees

/quant-calendar shows:
  ✓ 2 cards for Service A (E1/2, E2/2)
  ✓ 3 cards for Service B (E1/3, E2/3, E3/3)
  ✓ Total: 5 cards in left panel
```

---

## Data Flow

```
/create-work-order
    ↓
Service Appointment Schedule
    ├─ Service: "Cockroach Control"
    ├─ Date: Jun 15, 2026
    ├─ Time: 09:00 - 17:00
    └─ Required Employees: 4 ← This value
    ↓
Save to Work Order → serviceSchedules array
    ↓
/quant-calendar loads work order
    ↓
Reads serviceSchedules.requiredEmployees
    ↓
Generates 4 service cards
    ↓
Each card E1/4, E2/4, E3/4, E4/4
    ↓
Drag and assign each to different employee
```

---

## Card Display

### Without Multiple Employees
```
┌─────────────────────────┐
│ WO-1001  SA-1      [✎]  │
├─────────────────────────┤
│ Cockroach Control  Done │
│ 📍 45 Park Ave, Trivn   │
├─────────────────────────┤
│ 📅 Jun 15, 2026         │
│ ⏰ 09:00 AM - 05:00 PM  │
│ 👥 1 employee           │
└─────────────────────────┘
```

### With Multiple Employees (E2/4 example)
```
┌────────────────────────────┐
│ WO-1001  SA-1  E2/4   [✎]  │
├────────────────────────────┤
│ Cockroach Control      Done │
│ 📍 45 Park Ave, Trivn      │
├────────────────────────────┤
│ 📅 Jun 15, 2026            │
│ ⏰ 09:00 AM - 05:00 PM     │
│ 👥 4 employees             │
└────────────────────────────┘
```

---

## Benefits

✅ **Easy Assignment**: Quickly assign multiple employees to same service
✅ **Visual Clarity**: Each employee gets their own card to work with
✅ **Flexibility**: Each card can be dragged to different time slots/employees
✅ **Scalability**: Works with any number of employees (1, 5, 10, etc.)
✅ **No Changes to API**: Uses existing serviceSchedules data structure
✅ **Backward Compatible**: Works with existing work orders without required employees

---

## Testing Checklist

- ✅ Create work order with 1 required employee → Shows 1 card
- ✅ Create work order with 4 required employees → Shows 4 cards  
- ✅ Cards show correct E1/4, E2/4, E3/4, E4/4 badges
- ✅ Can drag first card independently
- ✅ Can drag second card independently
- ✅ Can drag all 4 cards to different time slots
- ✅ All 4 cards show same service name
- ✅ All 4 cards show same service schedule info
- ✅ Editing work order updates all 4 cards
- ✅ Non-required-employees services still show 1 card
- ✅ Multiple services with different requirements work together

---

## Files Modified

- `src/pages/QuantCalendarPage.tsx`
  - Modified service rendering logic (line ~1450)
  - Updated DraggableServiceCard component signature (line ~243)
  - Added employee badge display (line ~335)

---

## Related Features

- Service Appointment Schedule (CreateWorkOrderPage, EditWorkOrderPage)
- Drag and drop in QuantCalendarPage
- Service assignment to employees

---

## Future Enhancements

- Color coding for different employee positions
- Summary showing all employees assigned
- Quick assign to fill all slots
- Auto-assign to available employees
- Employee availability checking

---

**Last Updated**: June 10, 2026
**Status**: ✅ COMPLETE - Ready to Use
