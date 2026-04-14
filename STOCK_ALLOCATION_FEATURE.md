# Stock Allocation Feature

## Overview
Added a complete stock allocation system that allows admins to allocate inventory items to field employees.

## What's New

### 1. Stock Allocation Page (`/inventory/allocate`)
A dedicated UI for allocating stock to employees with the following features:

- **Employee Selection**: Dropdown to select active employees with their details (ID, role, branch, phone)
- **Smart Filtering**: 
  - Filter by branch (automatically suggests employee's branch)
  - Search products by name
  - Shows only items with available stock
- **Visual Indicators**: 
  - Highlights items from different branches with warning
  - Shows available stock and status badges
  - Real-time calculation of total items being allocated
- **Allocation Input**: Simple quantity input for each inventory item
- **Validation**: 
  - Prevents over-allocation (can't allocate more than available)
  - Ensures employee is selected
  - Validates quantities before processing

### 2. Updated Inventory Store
Enhanced the inventory store with:
- `allocations` field to track who has what stock
- `allocateStock()` method to record allocations
- `getEmployeeAllocations()` to retrieve employee-specific allocations
- Automatic stock deduction and status updates (OK → Low → Critical)

### 3. Enhanced Employee Detail Page
The employee profile now shows:
- **Actual allocated inventory** (not dummy data)
- Allocated quantity per item
- Available stock in warehouse
- Allocation date
- Status badges for each item

### 4. Navigation Updates
- Added "Allocate Stock" link in the Inventory Manage menu
- Added quick access button on the Inventory page
- Route: `/inventory/allocate`

## How It Works

1. **Admin navigates** to Inventory → Allocate Stock
2. **Selects an employee** from the dropdown
3. **System shows** available inventory (filtered by branch if needed)
4. **Admin enters quantities** for items to allocate
5. **System validates** and deducts from warehouse stock
6. **Allocation is recorded** and visible in employee profile
7. **Stock status updates** automatically based on remaining quantity

## Technical Details

### Files Modified
- `src/pages/StockAllocationPage.tsx` (NEW)
- `src/store/inventoryStore.ts` (Enhanced)
- `src/pages/EmployeeDetailPage.tsx` (Updated)
- `src/pages/InventoryPage.tsx` (Added button)
- `src/App.tsx` (Added route)
- `src/components/AppSidebar.tsx` (Added menu item)

### Data Flow
```
Inventory Store (warehouse stock)
    ↓ (allocation)
Employee Profile (allocated items)
    ↓ (tracking)
Allocation History (who, what, when)
```

## Future Enhancements (Optional)
- Return stock functionality (employee returns unused items)
- Allocation history/audit log
- Low stock alerts for employees
- Bulk allocation for multiple employees
- Print allocation receipt
- Mobile app integration for field employees to view their stock
