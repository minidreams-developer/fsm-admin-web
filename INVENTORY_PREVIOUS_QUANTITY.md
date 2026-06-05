# Inventory Previous Quantity Feature

## Overview
Added "Previous Quantity" field to track the previous stock level of inventory items. This helps maintain a history of quantity changes and provides better visibility into inventory movements.

## Location
**Page:** `/inventory`
**Component:** InventoryFormModal & InventoryPage

## Implementation Details

### Changes Made

#### 1. Store Update (`src/store/inventoryStore.ts`)
- Added `previousQuantity?: number` field to `InventoryItem` type
- Stores the previous stock level for each inventory item
- Optional field (defaults to undefined if not provided)

#### 2. Form Modal (`src/components/InventoryFormModal.tsx`)
- **Create Mode:** Shows two fields:
  - "Previous Quantity" - Input field for previous stock
  - "Stock Quantity" - Current stock quantity
  
- **Edit Mode:** Shows three fields:
  - "Previous Quantity" - Editable previous stock level
  - "Current Stock" - Read-only display of current stock
  - "Add Stock Quantity" - How much to add to current stock
  - "Final Stock" - Read-only calculation of new stock

#### 3. Inventory Table (`src/pages/InventoryPage.tsx`)
- Added "Previous Qty" column between Branch and Stock columns
- Displays previous quantity or "-" if not set
- Table columns now: #, Product, Branch, **Previous Qty**, Stock, Unit, Reorder Level, Status, Actions

### UI Layout

**Inventory Table:**
```
┌─────────────────────────────────────────────────────────────────────┐
│ #  Product            Branch   Prev Qty  Stock  Unit  Reorder  ...  │
├─────────────────────────────────────────────────────────────────────┤
│ 1  Cypermethrin 10%   Kochi    20        45     Liters 20     ...  │
│ 2  Bifenthrin 2.5%    Kochi    5         12     Liters 20     ...  │
│ 3  Gel Bait           Kochi    -         8      Tubes  15     ...  │
└─────────────────────────────────────────────────────────────────────┘
```

**Add Inventory Form:**
```
Product:        [Select product dropdown]
Branch:         [Select branch dropdown]
Previous Qty:   [0___________] (input field)
Stock Qty:      [0___________] (input field)
Unit:           [Liters dropdown]
Reorder Level:  [0___________]
```

**Edit Inventory Form:**
```
Product:        [Readonly: Cypermethrin 10%]
Branch:         [Readonly: Kochi]
Previous Qty:   [20__________] (editable)
Current Stock:  [45] (readonly)
Add Stock Qty:  [0___________] (input)
Final Stock:    [45] (readonly calculation)
Unit:           [Liters dropdown]
Reorder Level:  [20__________]
```

## User Workflow

### Adding New Inventory Item
1. Click "Add Inventory" button
2. Select Product
3. Select Branch
4. Enter **Previous Quantity** (optional - the stock level before this one)
5. Enter current **Stock Quantity**
6. Select Unit
7. Enter Reorder Level
8. Click "Add Item"

### Editing Existing Inventory
1. Click edit icon on an inventory item
2. View/update **Previous Quantity**
3. View current stock (read-only)
4. Add stock to restock the item (updates Current Stock)
5. Final Stock shows the result of current + added quantity
6. Click "Update Item" or "Restock Item"

## Data Storage

### InventoryItem Structure
```typescript
{
  id: number;
  name: string;
  branch: string;
  stock: number;              // Current stock
  unit: string;
  unitPrice?: number;
  reorder: number;
  status: "OK" | "Low" | "Critical";
  previousQuantity?: number;  // NEW - Previous stock level
  allocations?: Array<{...}>;
}
```

### Example Data
```json
{
  "id": 1,
  "name": "Cypermethrin 10% EC",
  "branch": "Kochi",
  "stock": 45,
  "previousQuantity": 20,
  "unit": "Liters",
  "reorder": 20,
  "status": "OK"
}
```

## Display Rules

### In Table
- If `previousQuantity` is set: Shows the number (e.g., "20")
- If `previousQuantity` is not set: Shows "-" (dash)
- Helps identify which items have tracking history

### In History
- Previous Quantity is displayed alongside current stock for reference
- History entries continue to track stock changes separately

## Use Cases

1. **Inventory Audits:** Compare previous vs. current quantities to track movements
2. **Restock Tracking:** Know what the stock was before the current restock
3. **Variance Analysis:** Identify significant stock changes between entries
4. **Historical Reference:** Keep record of stock progression over time

## Technical Notes

- Field is optional to maintain backward compatibility
- Displays "-" when not available to avoid confusion with "0"
- No automatic calculation - user must manually enter previous quantity
- Previous quantity is persisted with the inventory item
- Works seamlessly with existing allocation and history system

## Files Modified

1. `src/store/inventoryStore.ts` - Added previousQuantity to type
2. `src/components/InventoryFormModal.tsx` - Added form fields for previous quantity
3. `src/pages/InventoryPage.tsx` - Added table column for previous quantity
