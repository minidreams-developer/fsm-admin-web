# Pagination Implementation Guide

## Overview
This guide explains the pagination system in the FSM admin application, including how it works, how to use it correctly, and common patterns.

---

## How the Pagination System Works

### usePagination Hook
The hook manages all pagination state and logic:

```typescript
import { usePagination } from "@/hooks/usePagination";

const pagination = usePagination({
  items: filteredArray,        // Array of items to paginate
  itemsPerPage: 10,            // Items per page (optional, default 10)
});

// Returns:
// - currentPage: current page number (1-based)
// - itemsPerPage: items per page
// - totalPages: total number of pages
// - startIndex: start index of current page items
// - endIndex: end index of current page items
// - paginatedItems: sliced array for current page
// - setCurrentPage: function to change page
// - setItemsPerPage: function to change items per page
// - resetPage: function to reset to page 1
```

### PaginationControls Component
The component renders the pagination UI:

```typescript
<PaginationControls
  currentPage={pagination.currentPage}
  totalPages={pagination.totalPages}
  itemsPerPage={pagination.itemsPerPage}
  totalItems={filtered.length}
  onPageChange={pagination.setCurrentPage}
  onItemsPerPageChange={pagination.setItemsPerPage}
  startIndex={pagination.startIndex}
  endIndex={pagination.endIndex}
/>
```

---

## Common Usage Pattern

### Basic Implementation

```typescript
import { useState } from 'react';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/PaginationControls';

export const MyPage = () => {
  const [items, setItems] = useState([...]);
  const [search, setSearch] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Step 1: Filter items based on search/filters
  const filtered = items.filter(item => 
    item.name.includes(search)
  );

  // Step 2: Initialize pagination with filtered items
  const pagination = usePagination({
    items: filtered,
    itemsPerPage,
  });

  // Step 3: Use paginatedItems in rendering
  return (
    <div>
      {/* Search input */}
      <input 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Table with paginated items */}
      <table>
        <tbody>
          {pagination.paginatedItems.map((item, idx) => (
            <tr key={item.id}>
              <td>{pagination.startIndex + idx + 1}</td>
              <td>{item.name}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Step 4: Render pagination controls */}
      <PaginationControls
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        itemsPerPage={pagination.itemsPerPage}
        totalItems={filtered.length}
        onPageChange={pagination.setCurrentPage}
        onItemsPerPageChange={(newSize) => {
          setItemsPerPage(newSize);
          pagination.setItemsPerPage(newSize);
        }}
        startIndex={pagination.startIndex}
        endIndex={pagination.endIndex}
      />
    </div>
  );
};
```

---

## Important Rules

### ✅ DO:

1. **Pass filtered array to hook**
   ```typescript
   // Correct: Hook will reset page when filtered array changes
   const pagination = usePagination({
     items: filtered,  // This should change when filters change
   });
   ```

2. **Update itemsPerPage through both state and hook**
   ```typescript
   const handleItemsPerPageChange = (newSize: number) => {
     setItemsPerPage(newSize);           // Update component state
     pagination.setItemsPerPage(newSize); // Update hook
   };
   ```

3. **Use paginatedItems in rendering**
   ```typescript
   {pagination.paginatedItems.map((item) => (
     <Item key={item.id} item={item} />
   ))}
   ```

4. **Reset page on filter changes**
   ```typescript
   const handleFilterChange = (newFilter: string) => {
     setFilter(newFilter);
     pagination.resetPage();  // Ensure we start at page 1
   };
   ```

5. **Sync filtered.length with total items**
   ```typescript
   <PaginationControls
     totalItems={filtered.length}  // Should be filtered count, not all items
   />
   ```

### ❌ DON'T:

1. **Don't pass unfiltered array**
   ```typescript
   // Wrong: This defeats the purpose of filtering
   const pagination = usePagination({
     items: allItems,  // This is wrong, should be filtered
   });
   ```

2. **Don't forget to update hook when itemsPerPage changes**
   ```typescript
   // Wrong: Only updates component state
   setItemsPerPage(newSize);
   
   // Correct: Update both
   setItemsPerPage(newSize);
   pagination.setItemsPerPage(newSize);
   ```

3. **Don't render full array**
   ```typescript
   // Wrong: Renders all items, ignoring pagination
   {items.map((item) => (...))}
   
   // Correct: Render only paginated items
   {pagination.paginatedItems.map((item) => (...))}
   ```

4. **Don't forget totalItems prop**
   ```typescript
   // Wrong: Missing totalItems
   <PaginationControls {...props} />
   
   // Correct: Include totalItems
   <PaginationControls
     {...props}
     totalItems={filtered.length}
   />
   ```

---

## LeadsPage Example (Correct Implementation)

```typescript
const LeadsPage = () => {
  const [filter, setFilter] = useState<LeadStatus | "All">("All");
  const [search, setSearch] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [branchFilter, setBranchFilter] = useState("All");

  // Create filtered array based on all filters
  const filtered = leads.filter((l) => {
    const matchStatus = filter === "All" || l.status === filter;
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase());
    const matchBranch = branchFilter === "All" || l.branch === branchFilter;
    return matchStatus && matchSearch && matchBranch;
  });

  // Initialize pagination with filtered array
  const pagination = usePagination({
    items: filtered,
    itemsPerPage,
  });

  // When filters change, page resets automatically due to filtered array change
  const handleFilterChange = (newFilter: LeadStatus | "All") => {
    setFilter(newFilter);
    // Page resets automatically when filtered array changes
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    pagination.setItemsPerPage(newItemsPerPage);
  };

  return (
    <div>
      {/* Filters */}
      <select value={filter} onChange={(e) => handleFilterChange(e.target.value)}>
        <option value="All">All</option>
        <option value="New">New</option>
      </select>

      <input 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
      />

      {/* Table */}
      <table>
        <tbody>
          {pagination.paginatedItems.map((lead, idx) => (
            <tr key={lead.id}>
              <td>{pagination.startIndex + idx + 1}</td>
              <td>{lead.name}</td>
              <td>{lead.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <PaginationControls
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        itemsPerPage={pagination.itemsPerPage}
        totalItems={filtered.length}
        onPageChange={pagination.setCurrentPage}
        onItemsPerPageChange={handleItemsPerPageChange}
        startIndex={pagination.startIndex}
        endIndex={pagination.endIndex}
      />
    </div>
  );
};
```

---

## Advanced Patterns

### Pattern 1: Multiple Filters with State Management

```typescript
interface Filters {
  status: string;
  branch: string;
  employee: string;
  dateRange: [string, string];
  search: string;
}

const Page = () => {
  const [filters, setFilters] = useState<Filters>({...});
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filtered = items.filter(item => {
    return (
      (filters.status === "All" || item.status === filters.status) &&
      (filters.branch === "All" || item.branch === filters.branch) &&
      (filters.employee === "All" || item.employee === filters.employee) &&
      item.name.includes(filters.search)
    );
  });

  const pagination = usePagination({
    items: filtered,
    itemsPerPage,
  });

  // When any filter changes, pagination automatically resets
  const updateFilter = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    // No need to call resetPage - it happens automatically
  };

  return (
    // ...
  );
};
```

### Pattern 2: Pagination with Local Search

```typescript
const Page = () => {
  const [search, setSearch] = useState("");
  
  // Debounce search for performance
  const debouncedSearch = useDebounce(search, 300);

  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const pagination = usePagination({
    items: filtered,
    itemsPerPage: 10,
  });

  return (
    <>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
      />
      {/* Pagination will reset when debouncedSearch changes */}
    </>
  );
};
```

### Pattern 3: Dynamic Items Per Page based on Device

```typescript
const Page = () => {
  const isMobile = useIsMobile();
  
  // Different page sizes for mobile vs desktop
  const defaultItemsPerPage = isMobile ? 5 : 10;
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);

  const pagination = usePagination({
    items: filtered,
    itemsPerPage,
  });

  return (
    <PaginationControls
      {...paginationProps}
      onItemsPerPageChange={(size) => {
        setItemsPerPage(size);
        pagination.setItemsPerPage(size);
      }}
    />
  );
};
```

---

## Troubleshooting

### Issue: Page doesn't reset when filters change
**Cause:** Filtered array is not being passed to usePagination
**Solution:** Make sure you pass the filtered array as `items`:
```typescript
const pagination = usePagination({
  items: filtered,  // Must be the filtered array
  itemsPerPage,
});
```

### Issue: Items per page change doesn't work
**Cause:** Not updating the hook's itemsPerPage
**Solution:** Update both component state and hook:
```typescript
const handleItemsPerPageChange = (newSize: number) => {
  setItemsPerPage(newSize);
  pagination.setItemsPerPage(newSize);  // Don't forget this
};
```

### Issue: Shows wrong item count
**Cause:** totalItems prop using wrong array length
**Solution:** Use filtered.length:
```typescript
<PaginationControls
  totalItems={filtered.length}  // Not items.length
/>
```

### Issue: "Cannot read property of undefined"
**Cause:** Using `items` directly instead of `paginatedItems`
**Solution:** Always render paginatedItems:
```typescript
{pagination.paginatedItems.map((item) => (...))}
```

### Issue: Page number exceeds totalPages
**Cause:** Manual setCurrentPage without bounds checking
**Solution:** Hook validates bounds automatically:
```typescript
pagination.setCurrentPage(page);  // This handles validation
```

---

## Performance Tips

1. **Memoize filtered array** if it's expensive to compute
   ```typescript
   const filtered = useMemo(() => {
     return items.filter(item => matches(item, filters));
   }, [items, filters]);
   ```

2. **Use pagination for large lists** (100+ items)
   ```typescript
   // Good: Prevents rendering hundreds of items
   {pagination.paginatedItems.map((item) => (...))}
   
   // Bad: Renders everything
   {filtered.map((item) => (...))}
   ```

3. **Debounce search input** to reduce filter recalculations
   ```typescript
   const debouncedSearch = useDebounce(search, 300);
   const filtered = items.filter(i => i.name.includes(debouncedSearch));
   ```

---

## Summary

The pagination system automatically handles:
- ✅ Resetting page when filters change
- ✅ Resetting page when items per page changes
- ✅ Validating page boundaries
- ✅ Calculating indices correctly
- ✅ Handling empty results
- ✅ Performance optimization with memoization

Just follow these rules:
1. Pass filtered array to hook
2. Render paginatedItems, not full array
3. Update hook when itemsPerPage changes
4. Include totalItems in PaginationControls
