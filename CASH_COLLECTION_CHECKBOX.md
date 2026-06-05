# Cash Collection Checkbox Feature

## Overview
Added a "Cash Not Needed" checkbox for each employee assigned to a work order. This checkbox defaults to **ON (checked)** for all newly assigned employees.

## Location
**Page:** `/create-work-order`
**Section:** Sales Executives Assignment

## Implementation Details

### UI Component
- **Type:** Standard HTML checkbox input
- **Label:** "Cash Not Needed"
- **Default State:** Checked (ON) for all employees
- **Position:** Next to each assigned employee name

### Behavior
1. When an employee is added to a work order, the checkbox automatically defaults to **ON (checked)**
2. Users can click the checkbox to toggle the cash collection status
3. When checked: "Cash Not Needed" - no cash collection expected from this employee
4. When unchecked: Cash collection is expected from this employee

### Storage
- The checkbox state is stored in `cashCollectionMap`
- Format: `{ "employeeName": boolean }`
- Example: `{ "John Doe": true, "Jane Smith": false }`
- The data is saved with the work order for future reference

### Code Changes
**File:** `src/pages/CreateWorkOrderPage.tsx`

**Changes:**
1. Replaced button-based UI ("Collect Cash" / "No Cash" buttons) with a standard checkbox
2. Updated variable naming for clarity: `willCollectCash` → `cashNotNeeded`
3. Added proper checkbox styling with accent colors
4. Simplified the toggle logic to match checkbox behavior

### Default Behavior
```typescript
const cashNotNeeded = cashCollectionMap[empName] ?? true;
// Defaults to true (checked) when employee is first added
```

### UI Appearance
```
┌─ Sales Executive Name (Role)                  [☑ Cash Not Needed] [X] ─┐
```

When unchecked:
```
┌─ Sales Executive Name (Role)                  [☐ Cash Not Needed] [X] ─┐
```

## User Journey
1. Navigate to `/create-work-order`
2. Select one or more sales executives
3. Each assigned employee appears with:
   - Employee name and role
   - **"Cash Not Needed" checkbox - automatically checked**
   - Remove button (X)
4. Uncheck the box if cash collection IS needed for that employee
5. Create the work order with the cash collection preferences saved

## Technical Notes
- The checkbox state is persisted in the `cashCollectionMap` state variable
- The initial value defaults to `true` (checked) for all employees via the nullish coalescing operator: `?? true`
- The checkbox input uses the `accent-primary` class for consistent branding
- No additional dependencies required

## Related Features
- Sales Executive assignment (already existed)
- Work order creation flow
- Work order details display (references cash collection settings)
