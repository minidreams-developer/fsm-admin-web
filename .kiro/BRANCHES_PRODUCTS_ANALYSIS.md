# Branches & Products Management - Feature Analysis

## Project Analysis Summary

### Current Architecture
- **Routing**: React Router v6 with nested routes under DashboardLayout
- **State Management**: Zustand stores (one per domain: customers, employees, leads, projects, services)
- **UI Pattern**: Modal-based forms with table views
- **Styling**: Tailwind CSS with shadcn-ui components
- **Data Persistence**: Zustand with localStorage persistence

### Current Menu Items (AppSidebar)
1. Dashboard
2. Leads
3. Work Orders (Projects)
4. Service Appointments (Services)
5. Payments
6. Reports
7. Inventory
8. Employees
9. Customers

---

## Feature 1: BRANCHES MANAGEMENT

### Purpose
Manage multiple business branches/locations with their details, staff assignments, and operational metrics.

### Sidebar Menu Item
- **Label**: "Branches"
- **Icon**: Building2 or MapPin (from lucide-react)
- **Path**: `/branches`
- **Position**: After "Customers" (before logout)

### Page Structure: BranchesPage.tsx

#### Key Sections

**1. Header Section**
- Title: "Branches"
- Subtitle: "Manage your business locations and branch operations"
- Add Branch Button (opens modal)
- Search/Filter functionality

**2. KPI Cards (Top Section)**
```
- Total Branches: Count of all branches
- Active Branches: Count of active branches
- Total Staff: Sum of employees across all branches
- Branch Revenue: Total revenue by branch (if applicable)
```

**3. Main Table**
Columns:
- Branch ID (auto-generated: BR-1001, BR-1002, etc.)
- Branch Name
- Location/Address
- Manager Name
- Staff Count
- Status (Active/Inactive)
- Contact Number
- Actions (Edit, View Details, Delete)

**4. Branch Details Modal**
Fields:
- Branch ID (auto-generated, read-only)
- Branch Name (required)
- Branch Type (Dropdown: Main Office, Service Center, Warehouse, Regional Office)
- Address (required)
- City
- State
- Postal Code
- Contact Number (required)
- Email Address
- Manager Name (Dropdown - linked to Employees)
- Manager Contact
- Operating Hours (From - To)
- Established Date
- Status (Active/Inactive toggle)
- Notes/Description

**5. Branch Details Page** (Optional - `/branches/:id`)
- Branch information card
- Staff assigned to this branch (table)
- Services handled by this branch
- Inventory at this branch
- Recent transactions/orders
- Performance metrics

### Zustand Store: branchesStore.ts

```typescript
export type Branch = {
  id: string;
  name: string;
  type: "Main Office" | "Service Center" | "Warehouse" | "Regional Office";
  address: string;
  city: string;
  state: string;
  postalCode: string;
  contactNumber: string;
  email: string;
  managerId: string;
  managerName: string;
  operatingHoursFrom: string;
  operatingHoursTo: string;
  establishedDate: string;
  status: "Active" | "Inactive";
  notes: string;
  createdAt: string;
};

interface BranchesStore {
  branches: Branch[];
  addBranch: (branch: Branch) => void;
  updateBranch: (id: string, updates: Partial<Branch>) => void;
  deleteBranch: (id: string) => void;
  getBranch: (id: string) => Branch | undefined;
  getNextBranchId: () => string;
}
```

### Initial Sample Data
```
- BR-1001: Kochi Main Office (Manager: Praveen Kumar)
- BR-1002: Calicut Service Center (Manager: Rajesh Singh)
- BR-1003: Ernakulam Warehouse (Manager: Anjali Nair)
```

---

## Feature 2: PRODUCTS MANAGEMENT

### Purpose
Manage product catalog including chemicals, equipment, and services offered. Track product details, pricing, and availability.

### Sidebar Menu Item
- **Label**: "Products"
- **Icon**: Package or Boxes (from lucide-react)
- **Path**: `/products`
- **Position**: After "Branches"

### Page Structure: ProductsPage.tsx

#### Key Sections

**1. Header Section**
- Title: "Products"
- Subtitle: "Manage product catalog and pricing"
- Add Product Button (opens modal)
- Filter by Category
- Search functionality

**2. KPI Cards (Top Section)**
```
- Total Products: Count of all products
- Active Products: Count of active products
- Low Stock Items: Count of products below reorder level
- Total Inventory Value: Sum of (quantity × unit price)
```

**3. Main Table**
Columns:
- Product ID (auto-generated: PROD-1001, PROD-1002, etc.)
- Product Name
- Category
- Unit Price
- Stock Quantity
- Reorder Level
- Supplier
- Status (Active/Inactive)
- Actions (Edit, View Details, Delete)

**4. Product Form Modal**
Fields:
- Product ID (auto-generated, read-only)
- Product Name (required)
- Category (Dropdown: Chemicals, Equipment, Supplies, Services, Other)
- Description
- Unit of Measurement (Dropdown: Liters, Kg, Pieces, Boxes, Cans, Tubes, Packs, etc.)
- Unit Price (required)
- Reorder Level (required)
- Supplier Name (Dropdown or text)
- Supplier Contact
- SKU/Code (optional)
- Status (Active/Inactive toggle)
- Notes

**5. Product Details Page** (Optional - `/products/:id`)
- Product information card
- Stock levels by branch (table)
- Pricing history (if applicable)
- Supplier information
- Usage statistics
- Recent transactions

**6. Category Filter Section**
- Buttons/Tabs for quick filtering:
  - All Products
  - Chemicals
  - Equipment
  - Supplies
  - Services

### Zustand Store: productsStore.ts

```typescript
export type ProductCategory = "Chemicals" | "Equipment" | "Supplies" | "Services" | "Other";
export type UnitType = "Liters" | "Kg" | "Pieces" | "Boxes" | "Cans" | "Tubes" | "Packs" | "Gallons" | "Meters";

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  unitOfMeasurement: UnitType;
  unitPrice: number;
  reorderLevel: number;
  supplierName: string;
  supplierContact: string;
  sku: string;
  status: "Active" | "Inactive";
  notes: string;
  createdAt: string;
};

interface ProductsStore {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
  getNextProductId: () => string;
  getProductsByCategory: (category: ProductCategory) => Product[];
}
```

### Initial Sample Data
```
- PROD-1001: Cypermethrin 10% EC (Chemicals, ₹450/Liter)
- PROD-1002: Bifenthrin 2.5% SC (Chemicals, ₹520/Liter)
- PROD-1003: Gel Bait (Maxforce) (Chemicals, ₹180/Tube)
- PROD-1004: Spray Equipment (Equipment, ₹2500/Piece)
- PROD-1005: Safety Gloves (Supplies, ₹50/Pair)
- PROD-1006: Pest Control Service (Services, ₹500/Service)
```

---

## Implementation Roadmap

### Phase 1: Branches Management
1. Create `branchesStore.ts` with Zustand
2. Create `BranchFormModal.tsx` component
3. Create `BranchesPage.tsx` with table and CRUD
4. Update `AppSidebar.tsx` to add Branches menu item
5. Update `App.tsx` routing

### Phase 2: Products Management
1. Create `productsStore.ts` with Zustand
2. Create `ProductFormModal.tsx` component
3. Create `ProductsPage.tsx` with table, filters, and CRUD
4. Update `AppSidebar.tsx` to add Products menu item
5. Update `App.tsx` routing

### Phase 3: Integration & Enhancement
1. Link branches to employees (manager assignment)
2. Link products to inventory (stock tracking by branch)
3. Link products to services (service pricing)
4. Add branch-wise product availability
5. Add product usage reports

---

## UI/UX Patterns to Follow

### From Existing Code
1. **Modal Pattern**: Use fixed overlay with fade-in animation
2. **Form Validation**: Toast notifications for errors
3. **Table Design**: Hover effects, status badges, action buttons
4. **Color Scheme**: Purple gradient buttons, secondary backgrounds
5. **Icons**: Lucide React icons throughout
6. **Responsive**: Mobile-first with grid layouts

### Consistent Elements
- Header with title and subtitle
- KPI cards at top
- Search/Filter bar
- Main content table
- Modal forms for CRUD
- Status badges for states
- Action buttons (Edit, Delete, View)

---

## File Structure to Create

```
src/
├── pages/
│   ├── BranchesPage.tsx          # Main branches management page
│   └── ProductsPage.tsx          # Main products management page
│
├── components/
│   ├── BranchFormModal.tsx       # Form modal for branches
│   └── ProductFormModal.tsx      # Form modal for products
│
└── store/
    ├── branchesStore.ts          # Zustand store for branches
    └── productsStore.ts          # Zustand store for products
```

---

## Key Features Summary

### Branches
- ✅ Multi-location management
- ✅ Manager assignment
- ✅ Operating hours tracking
- ✅ Status management
- ✅ Contact information
- ✅ Branch type classification

### Products
- ✅ Product catalog management
- ✅ Category-based organization
- ✅ Pricing management
- ✅ Stock level tracking
- ✅ Supplier information
- ✅ Reorder level alerts
- ✅ Multiple unit types support

---

## Integration Points

### Branches Integration
- Link to Employees (manager assignment)
- Link to Inventory (branch-wise stock)
- Link to Services (branch service availability)
- Link to Customers (branch service area)

### Products Integration
- Link to Inventory (stock tracking)
- Link to Services (service pricing)
- Link to Payments (product pricing)
- Link to Reports (product usage analytics)

