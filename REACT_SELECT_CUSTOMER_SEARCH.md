# React Select Customer Search Feature

## Overview
Replaced the standard HTML dropdown for Customer Name selection with React Select, providing a searchable, user-friendly interface for finding and selecting customers in the Create Work Order page.

## Implementation

### **Package Installed**
```bash
npm install react-select
```

### **Import Added**
```typescript
import Select from "react-select";
```

## Features

### **1. Searchable Dropdown**
- Users can type to search for customers
- Real-time filtering as you type
- Searches across customer name and phone number

### **2. Clear Selection**
- `isClearable` prop allows users to clear the selection
- X button appears when a customer is selected
- Clears all auto-filled fields when cleared

### **3. Custom Styling**
- Matches the application's theme
- Uses CSS variables for consistent colors
- Responsive design
- Proper focus states

### **4. Auto-fill Integration**
- Selecting a customer auto-fills:
  - Phone number
  - Email address
  - Address
  - Site address
  - Billing address

## Code Structure

### **Customer Options Preparation**
```typescript
const customerOptions = customers.map((customer) => ({
  value: customer.id,
  label: `${customer.firstName} ${customer.lastName} — ${customer.mobile || customer.landline}`,
  customer: customer,
}));
```

### **React Select Component**
```typescript
<Select
  options={customerOptions}
  value={customerOptions.find(opt => opt.value === selectedCustomerId) || null}
  onChange={(option) => {
    if (option) {
      handleCustomerSelect(option.value);
    } else {
      // Clear all fields
      setSelectedCustomerId("");
      setValue("customer", "");
      setValue("phone", "");
      setValue("email", "");
      setValue("address", "");
      setValue("siteAddress", "");
      setValue("billingAddress", "");
    }
  }}
  styles={customSelectStyles}
  placeholder="Search or select customer..."
  isClearable
  isSearchable
  noOptionsMessage={() => "No customers found"}
/>
```

### **Custom Styles**
```typescript
const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: 'hsl(var(--secondary))',
    borderColor: state.isFocused ? 'hsl(var(--primary) / 0.2)' : 'hsl(var(--border))',
    borderRadius: '0.5rem',
    minHeight: '38px',
    boxShadow: state.isFocused ? '0 0 0 2px hsl(var(--primary) / 0.2)' : 'none',
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? 'hsl(var(--primary))'
      : state.isFocused
      ? 'hsl(var(--secondary))'
      : 'transparent',
    color: state.isSelected ? 'white' : 'hsl(var(--card-foreground))',
    fontSize: '0.875rem',
    cursor: 'pointer',
  }),
  // ... more style configurations
};
```

## User Experience

### **Before (Standard Dropdown):**
```
Customer Name *
[Select customer...        ▼]
  John Doe — 9876543210
  Jane Smith — 9876543211
  Bob Johnson — 9876543212
  ...
```
- No search functionality
- Must scroll through entire list
- Difficult with many customers

### **After (React Select):**
```
Customer Name *
[Search or select customer...  ×]
  
Type to search:
"john" → Shows only John Doe
"987654" → Shows matching phone numbers
"smith" → Shows Jane Smith
```
- Instant search
- Type-ahead filtering
- Clear button (×)
- Better UX for large customer lists

## Features Breakdown

### **1. Search Functionality**
- **What**: Type to filter customers
- **How**: Searches in label (name + phone)
- **Example**: Type "john" to find "John Doe"

### **2. Clear Selection**
- **What**: Remove selected customer
- **How**: Click X button
- **Result**: All fields cleared

### **3. Keyboard Navigation**
- **Arrow Keys**: Navigate options
- **Enter**: Select highlighted option
- **Escape**: Close dropdown
- **Tab**: Move to next field

### **4. Visual Feedback**
- **Hover**: Option highlights
- **Selected**: Primary color background
- **Focused**: Border color changes
- **Empty**: "No customers found" message

## Styling Details

### **Colors (Using CSS Variables):**
- Control background: `hsl(var(--secondary))`
- Border: `hsl(var(--border))`
- Focus border: `hsl(var(--primary) / 0.2)`
- Selected option: `hsl(var(--primary))`
- Hover option: `hsl(var(--secondary))`
- Text: `hsl(var(--card-foreground))`
- Placeholder: `hsl(var(--muted-foreground))`

### **Dimensions:**
- Min height: 38px (matches other inputs)
- Border radius: 0.5rem
- Font size: 0.875rem (14px)
- Z-index: 9999 (dropdown menu)

## Benefits

✅ **Better UX**: Search instead of scroll
✅ **Faster**: Find customers quickly
✅ **Scalable**: Works with hundreds of customers
✅ **Accessible**: Keyboard navigation support
✅ **Consistent**: Matches app theme
✅ **Clear**: Easy to reset selection
✅ **Responsive**: Works on mobile devices

## Comparison

| Feature | Standard Dropdown | React Select |
|---------|------------------|--------------|
| Search | ❌ No | ✅ Yes |
| Clear | ❌ No | ✅ Yes |
| Keyboard Nav | ⚠️ Limited | ✅ Full |
| Large Lists | ❌ Difficult | ✅ Easy |
| Custom Styling | ⚠️ Limited | ✅ Full |
| Type-ahead | ❌ No | ✅ Yes |

## Use Cases

### **Scenario 1: Many Customers**
- Company has 500+ customers
- Standard dropdown requires scrolling
- React Select: Type "acme" → Find "Acme Corp" instantly

### **Scenario 2: Similar Names**
- Multiple "John" customers
- React Select: Type phone number to differentiate
- Example: "9876" → Shows all Johns with that number

### **Scenario 3: Quick Entry**
- Sales executive creating work order
- Knows customer name
- Types first few letters → Select → Auto-fills all fields

### **Scenario 4: Correction**
- Selected wrong customer
- Click X to clear
- Search for correct customer

## Files Modified

1. `src/pages/CreateWorkOrderPage.tsx`
   - Added React Select import
   - Created `customerOptions` array
   - Added `customSelectStyles` object
   - Replaced HTML select with React Select component
   - Updated onChange handler for clear functionality

2. `package.json`
   - Added `react-select` dependency

## Testing Checklist

✅ Search functionality works
✅ Customer selection auto-fills fields
✅ Clear button resets all fields
✅ Keyboard navigation works
✅ Styling matches theme
✅ Dropdown appears above other elements
✅ "No customers found" message displays
✅ Form validation still works
✅ Mobile responsive
✅ Accessible with screen readers

## Future Enhancements (Optional)

1. **Group by Category**
   - Group customers by type or region
   - Use `react-select` grouping feature

2. **Custom Option Rendering**
   - Show customer avatar
   - Display additional info (address, last order)

3. **Async Loading**
   - Load customers from API
   - Implement pagination for large datasets

4. **Recent Customers**
   - Show recently selected customers at top
   - Quick access to frequent customers

5. **Create New Customer**
   - Add "+ Create New Customer" option
   - Open customer form modal directly
