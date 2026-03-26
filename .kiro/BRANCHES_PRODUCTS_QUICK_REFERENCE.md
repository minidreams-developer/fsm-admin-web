# Branches & Products - Quick Reference Guide

## Updated Sidebar Navigation

```
Dashboard
├── Leads
├── Work Orders
├── Service Appointments
├── Payments
├── Reports
├── Inventory
├── Employees
├── Customers
├── Branches          ← NEW
├── Products          ← NEW
└── [User Profile]
```

---

## BRANCHES PAGE LAYOUT

```
┌─────────────────────────────────────────────────────────┐
│ Branches                                    [+ Add Branch]│
│ Manage your business locations                          │
└─────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Total        │ Active       │ Total Staff  │ Branch       │
│ Branches: 3  │ Branches: 3  │ Assigned: 12 │ Revenue: ₹X  │
└──────────────┴──────────────┴──────────────┴──────────────┘

[Search Box]

┌─────────────────────────────────────────────────────────┐
│ Branch ID │ Name      │ Location  │ Manager │ Staff │ ... │
├───────────┼───────────┼───────────┼─────────┼───────┼─────┤
│ BR-1001   │ Kochi     │ MG Road   │ Praveen │ 5     │ ... │
│ BR-1002   │ Calicut   │ Beach Rd  │ Rajesh  │ 4     │ ... │
│ BR-1003   │ Ernakulam │ Market Rd │ Anjali  │ 3     │ ... │
└─────────────────────────────────────────────────────────┘
```

### Branch Form Modal Fields
```
Branch ID: BR-1004 (auto-generated, read-only)
Branch Name: [text input]
Branch Type: [dropdown: Main Office, Service Center, Warehouse, Regional Office]
Address: [text input]
City: [text input]
State: [text input]
Postal Code: [text input]
Contact Number: [text input]
Email: [text input]
Manager: [dropdown - linked to Employees]
Operating Hours: [From] [To]
Established Date: [date picker]
Status: [toggle: Active/Inactive]
Notes: [textarea]

[Cancel] [Save/Update]
```

---

## PRODUCTS PAGE LAYOUT

```
┌─────────────────────────────────────────────────────────┐
│ Products                                   [+ Add Product]│
│ Manage product catalog and pricing                      │
└─────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Total        │ Active       │ Low Stock    │ Inventory    │
│ Products: 6  │ Products: 5  │ Items: 2     │ Value: ₹X    │
└──────────────┴──────────────┴──────────────┴──────────────┘

[Category Filters]
[All] [Chemicals] [Equipment] [Supplies] [Services]

[Search Box]

┌─────────────────────────────────────────────────────────┐
│ ID      │ Name          │ Category  │ Price │ Stock │ ... │
├─────────┼───────────────┼───────────┼───────┼───────┼─────┤
│ PROD-1  │ Cypermethrin  │ Chemicals │ ₹450  │ 45    │ ... │
│ PROD-2  │ Bifenthrin    │ Chemicals │ ₹520  │ 12    │ ... │
│ PROD-3  │ Gel Bait      │ Chemicals │ ₹180  │ 8     │ ... │
│ PROD-4  │ Spray Equip   │ Equipment │ ₹2500 │ 5     │ ... │
│ PROD-5  │ Safety Gloves │ Supplies  │ ₹50   │ 100   │ ... │
│ PROD-6  │ Pest Control  │ Services  │ ₹500  │ -     │ ... │
└─────────────────────────────────────────────────────────┘
```

### Product Form Modal Fields
```
Product ID: PROD-1001 (auto-generated, read-only)
Product Name: [text input]
Category: [dropdown: Chemicals, Equipment, Supplies, Services, Other]
Description: [textarea]
Unit of Measurement: [dropdown: Liters, Kg, Pieces, Boxes, Cans, Tubes, Packs, Gallons, Meters]
Unit Price: [number input]
Reorder Level: [number input]
Supplier Name: [text input/dropdown]
Supplier Contact: [text input]
SKU/Code: [text input]
Status: [toggle: Active/Inactive]
Notes: [textarea]

[Cancel] [Save/Update]
```

---

## DATA MODELS

### Branch Object
```typescript
{
  id: "BR-1001",
  name: "Kochi Main Office",
  type: "Main Office",
  address: "12 MG Road",
  city: "Kochi",
  state: "Kerala",
  postalCode: "682001",
  contactNumber: "9876543210",
  email: "kochi@company.com",
  managerId: "EMP-1001",
  managerName: "Praveen Kumar",
  operatingHoursFrom: "09:00 AM",
  operatingHoursTo: "06:00 PM",
  establishedDate: "2020-01-15",
  status: "Active",
  notes: "Main headquarters",
  createdAt: "2024-01-15"
}
```

### Product Object
```typescript
{
  id: "PROD-1001",
  name: "Cypermethrin 10% EC",
  category: "Chemicals",
  description: "Broad spectrum insecticide",
  unitOfMeasurement: "Liters",
  unitPrice: 450,
  reorderLevel: 20,
  supplierName: "ABC Chemicals",
  supplierContact: "9876543210",
  sku: "CHEM-001",
  status: "Active",
  notes: "High demand item",
  createdAt: "2024-01-15"
}
```

---

## ZUSTAND STORES

### branchesStore.ts
```typescript
- branches: Branch[]
- addBranch(branch)
- updateBranch(id, updates)
- deleteBranch(id)
- getBranch(id)
- getNextBranchId()
```

### productsStore.ts
```typescript
- products: Product[]
- addProduct(product)
- updateProduct(id, updates)
- deleteProduct(id)
- getProduct(id)
- getNextProductId()
- getProductsByCategory(category)
```

---

## COMPONENT FILES TO CREATE

### 1. BranchesPage.tsx
- Header with title and add button
- KPI cards (Total, Active, Staff, Revenue)
- Search functionality
- Main table with branches
- Edit/Delete actions
- Modal integration

### 2. BranchFormModal.tsx
- Form with all branch fields
- Validation (name, address, contact required)
- Manager dropdown (linked to employees)
- Create/Edit modes
- Toast notifications

### 3. ProductsPage.tsx
- Header with title and add button
- KPI cards (Total, Active, Low Stock, Inventory Value)
- Category filter tabs
- Search functionality
- Main table with products
- Edit/Delete actions
- Modal integration

### 4. ProductFormModal.tsx
- Form with all product fields
- Validation (name, price, reorder level required)
- Category dropdown
- Unit type dropdown
- Create/Edit modes
- Toast notifications

---

## ROUTING UPDATES

### App.tsx additions
```typescript
import BranchesPage from "./pages/BranchesPage";
import ProductsPage from "./pages/ProductsPage";

// Add routes:
<Route path="/branches" element={<BranchesPage />} />
<Route path="/products" element={<ProductsPage />} />
```

### AppSidebar.tsx updates
```typescript
const menuItems = [
  // ... existing items ...
  { label: "Branches", icon: Building2, path: "/branches" },
  { label: "Products", icon: Package, path: "/products" },
];
```

---

## SAMPLE DATA

### Branches
- BR-1001: Kochi Main Office (Praveen Kumar, Active)
- BR-1002: Calicut Service Center (Rajesh Singh, Active)
- BR-1003: Ernakulam Warehouse (Anjali Nair, Active)

### Products
- PROD-1001: Cypermethrin 10% EC (Chemicals, ₹450/L, Stock: 45)
- PROD-1002: Bifenthrin 2.5% SC (Chemicals, ₹520/L, Stock: 12)
- PROD-1003: Gel Bait (Maxforce) (Chemicals, ₹180/Tube, Stock: 8)
- PROD-1004: Spray Equipment (Equipment, ₹2500/Piece, Stock: 5)
- PROD-1005: Safety Gloves (Supplies, ₹50/Pair, Stock: 100)
- PROD-1006: Pest Control Service (Services, ₹500/Service)

---

## INTEGRATION CHECKLIST

### Branches
- [ ] Link manager to Employees store
- [ ] Show staff count from employees assigned to branch
- [ ] Filter inventory by branch
- [ ] Filter services by branch
- [ ] Show branch revenue in dashboard

### Products
- [ ] Link to inventory stock levels
- [ ] Link to service pricing
- [ ] Show low stock alerts
- [ ] Calculate total inventory value
- [ ] Track product usage in reports

---

## UI CONSISTENCY

✅ Use existing patterns:
- Modal overlay with fade-in animation
- Purple gradient buttons
- Tailwind CSS styling
- Lucide React icons
- Status badges
- Toast notifications
- Responsive grid layouts
- Hover effects on tables
- Search/filter functionality

