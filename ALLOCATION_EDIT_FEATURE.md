# Stock Allocation Edit Feature

## Overview
Added the ability to edit and remove allocated stock on the `/inventory/allocate` page. Users can now modify allocation quantities and manage existing allocations directly.

## Location
**Page:** `/inventory/allocate`
**Section:** "Allocated Stock" (bottom of page)

## Features Added

### 1. Allocated Stock Management Table
Displays all current allocations across all products and employees with:
- Product name
- Employee name
- Branch
- Allocated quantity
- Unit of measurement
- Allocation date
- Edit/Remove action buttons

### 2. Edit Allocation Functionality
**How to Edit:**
1. Click the **Edit** (pencil icon) button on any allocation row
2. Quantity field becomes editable
3. Enter new quantity
4. Click **Save** (checkmark icon) to confirm
5. Click **Cancel** (X icon) to discard changes

**What Happens on Save:**
- New quantity is saved to allocation record
- Inventory stock is adjusted by the difference
- Stock status (OK/Low/Critical) is recalculated
- Allocation date remains unchanged
- Toast notification confirms the update

### 3. Remove Allocation
**How to Remove:**
1. Click the **Remove** (trash icon) button on any allocation row
2. Allocation is immediately deleted
3. Stock is returned to inventory
4. Stock status is recalculated
5. Toast notification confirms removal

### 4. Inline Editing
- Edit and cancel buttons appear only when in edit mode
- All edits are inline without opening a modal
- Quick edit-save workflow

## Table Layout

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Product   Employee   Branch   Allocated Qty  Unit  Date      Actions       │
├────────────────────────────────────────────────────────────────────────────┤
│ Cyperentr Safeeq     Kochi    3              Liter Apr 28, 2026 [✎] [🗑]   │
│ Bifenthr  Mani       Kochi    2              Liter Apr 25, 2026 [✎] [🗑]   │
│ Gel Bait  Safeeq     Kochi    5              Tubes Apr 27, 2026 [✎] [🗑]   │
└────────────────────────────────────────────────────────────────────────────┘
```

**In Edit Mode:**
```
│ Cyperentr Safeeq     Kochi    [_5_____]      Liter Apr 28, 2026 [✓] [✕]   │
```

## State Management

### New State Variables
```typescript
const [editingAllocationId, setEditingAllocationId] = useState<string | null>(null);
const [editingQuantity, setEditingQuantity] = useState<number>(0);
```

### Editing ID Format
- Format: `${itemId}-${employeeId}`
- Example: `1-EMP-1001`
- Used to track which allocation is being edited

## Edit Operations

### handleEditAllocation(itemId, employeeId, currentQty)
- Activates edit mode for specific allocation
- Sets up quantity input field
- Stores current quantity for comparison

### handleSaveEditAllocation(itemId, employeeId, oldQuantity)
- Validates new quantity
- Calculates stock difference
- Updates inventory stock and status
- Updates allocation record
- Shows success toast

**Validation:**
- New stock cannot go negative
- Returns error if insufficient inventory

**Stock Status Recalculation:**
- If new stock ≤ 0: Status = "Critical"
- If new stock < reorder level: Status = "Low"
- If new stock ≥ reorder level: Status = "OK"

### handleRemoveAllocation(itemId, employeeId, quantity)
- Removes allocation from employee
- Returns allocated quantity to inventory
- Recalculates stock status
- Updates inventory record

## Data Changes on Edit

### Before Edit
```json
{
  "id": 1,
  "name": "Cypermethrin 10% EC",
  "stock": 42,
  "allocations": [
    { "employeeId": "EMP-1", "employeeName": "Safeeq", "quantity": 3, "allocatedAt": "..." }
  ]
}
```

### After Editing Allocation from 3 to 5
```json
{
  "id": 1,
  "name": "Cypermethrin 10% EC",
  "stock": 40,                    // Changed from 42 to 40 (-2)
  "allocations": [
    { "employeeId": "EMP-1", "employeeName": "Safeeq", "quantity": 5, "allocatedAt": "..." }
  ]
}
```

### After Removing Allocation
```json
{
  "id": 1,
  "name": "Cypermethrin 10% EC",
  "stock": 45,                    // Stock returned (+5)
  "allocations": []               // Allocation removed
}
```

## User Workflows

### Scenario 1: Edit an Allocation
1. User navigates to `/inventory/allocate`
2. Scrolls to "Allocated Stock" section at bottom
3. Finds the allocation to edit (e.g., "Safeeq" got 3 units of Cypermethrin)
4. Clicks Edit button on that row
5. Quantity field becomes editable: [_3_]
6. Changes to 5: [_5_]
7. Clicks Save (✓) button
8. Success toast: "Allocation updated: 5 Liters for Safeeq"
9. Stock automatically adjusted: inventory stock decreases by 2
10. Allocation shows new quantity: 5

### Scenario 2: Remove an Allocation
1. User sees an allocation they want to cancel
2. Clicks Remove (trash) button
3. Allocation immediately disappears
4. Success toast: "Allocation removed for Safeeq"
5. Stock is returned to available inventory
6. Status recalculated if needed

### Scenario 3: Edit Multiple Allocations
1. Edit first allocation - click Edit, change qty, click Save
2. For second allocation - repeat
3. Can edit multiple allocations in sequence
4. Each operation updates immediately

## Toast Messages

### Success Messages
- **On Edit Save:** `"Allocation updated: 5 Liters for Safeeq"`
- **On Remove:** `"Allocation removed for Safeeq"`

### Error Messages
- **Insufficient Stock:** `"Insufficient stock. Available: 10 Liters"`

## UI Components

### Edit Button
- Icon: Pencil (✎)
- Color: Gray/Primary on hover
- Position: Second to last column

### Remove Button
- Icon: Trash (🗑)
- Color: Gray/Destructive on hover
- Position: Last column

### Cancel Button (in edit mode)
- Icon: X
- Color: Gray/Muted
- Cancels edit without saving

### Save Button (in edit mode)
- Icon: Checkmark (✓)
- Color: Gray/Success
- Saves changes and exits edit mode

## Technical Implementation

### Storage
- Allocations stored in `InventoryItem.allocations` array
- Each allocation includes: employeeId, employeeName, quantity, allocatedAt
- Persistent via Zustand store

### Validation
- Quantity must be non-negative
- New stock cannot go negative
- Error messages prevent invalid operations

### Recalculation
- Stock differences calculated: `editingQuantity - oldQuantity`
- Status automatically updated based on new stock level
- All changes saved to inventory store

## Files Modified

1. `src/pages/StockAllocationPage.tsx`:
   - Added Edit2, Trash2, X icons to imports
   - Added editing state variables
   - Added handleEditAllocation function
   - Added handleSaveEditAllocation function
   - Added handleRemoveAllocation function
   - Added "Allocated Stock" management table
   - Added inline edit UI with input and action buttons

## Benefits

1. **Quick Corrections:** Fix allocation mistakes without deleting/re-adding
2. **Flexible Management:** Increase or decrease allocations as needed
3. **Visibility:** All allocations visible in one place for management
4. **Efficient:** No separate modal or page - all inline
5. **Safe:** Validation prevents negative stock
6. **Traceable:** Allocation dates preserved, history maintained

## Related Features

- Stock allocation (existing) - Initial allocation of stock
- Inventory history - Tracks all changes including allocations
- Stock status management - Automatic OK/Low/Critical calculation
