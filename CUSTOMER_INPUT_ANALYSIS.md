# Customer Name Input Analysis: /leads/new vs Create Work Order

## Summary
The **Customer Name input in `/leads/new` (CreateLeadPage) has an Edit button**, but the **Create Work Order page (CreateWorkOrderPage) does NOT have this Edit button**. Both use the same React Select component with customer search functionality, but they differ in the edit capability.

---

## Detailed Comparison

### 1. **CreateLeadPage** (`/leads/new`) - WITH Edit Button ✅

**Location:** Lines 313-360 in `CreateLeadPage.tsx`

```tsx
<div>
  <label className="text-xs font-medium text-muted-foreground mb-2 block">Customer Name *</label>
  <div className="flex gap-2">
    <div className="flex-1">
      <Select
        options={customerOptions}
        value={customerOptions.find((opt) => opt.value === selectedCustomerId) || null}
        onChange={(option) => {
          if (option) {
            handleCustomerSelect(option.value);
          } else {
            setSelectedCustomerId("");
            setCustomerAddressOptions([]);
            setAddresses([{ id: crypto.randomUUID(), address: "", city: "", pincode: "" }]);
            setField("name", "");
            setField("phone", "");
          }
        }}
        onInputChange={(inputValue) => {
          // Allow typing a new name not in the list
          if (!selectedCustomerId) setField("name", inputValue);
        }}
        inputValue={selectedCustomerId ? undefined : form.name}
        styles={customSelectStyles}
        placeholder="Search existing customer or type new name..."
        isClearable
        isSearchable
        noOptionsMessage={() => "No customers found — type to enter a new name"}
      />
    </div>
    {selectedCustomerId && (
      <button
        type="button"
        onClick={() => navigate(`/customers/${selectedCustomerId}?edit=true`)}
        className="h-[38px] px-3 inline-flex items-center gap-1.5 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-xs font-semibold text-card-foreground flex-shrink-0"
        title="Edit customer"
      >
        <Edit2 className="w-3.5 h-3.5" />
        Edit
      </button>
    )}
  </div>
</div>
```

**Key Features:**
- ✅ **Edit Button Present** - Shows when a customer is selected
- ✅ **Conditional Rendering** - `{selectedCustomerId && (...)}`
- ✅ **Navigation** - Navigates to `/customers/{customerId}?edit=true`
- ✅ **Icon** - Uses `Edit2` icon from lucide-react
- ✅ **Styling** - Matches the app theme with consistent button styling
- ✅ **Flex Layout** - Select input takes flex-1, Edit button is flex-shrink-0

---

### 2. **CreateWorkOrderPage** - WITHOUT Edit Button ❌

**Location:** Lines 425-450 in `CreateWorkOrderPage.tsx`

```tsx
<div>
  <label className="text-xs font-medium text-muted-foreground mb-2 block">Customer Name *</label>
  <Select
    options={customerOptions}
    value={customerOptions.find(opt => opt.value === selectedCustomerId) || null}
    onChange={(option) => {
      if (option) {
        handleCustomerSelect(option.value);
      } else {
        setSelectedCustomerId("");
        setCustomerState("");
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
  {/* Hidden input for form validation */}
  <input type="hidden" {...register("customer")} />
  {errors.customer && <p className="text-xs text-red-500 mt-1">{errors.customer.message}</p>}
</div>
```

**Key Differences:**
- ❌ **No Edit Button** - Missing the conditional Edit button
- ❌ **No Flex Layout** - Select takes full width
- ✅ **Form Validation** - Uses react-hook-form with hidden input and error display
- ✅ **More Fields Reset** - Clears more fields on deselect (email, siteAddress, billingAddress)

---

## Implementation Method Comparison

| Feature | CreateLeadPage | CreateWorkOrderPage |
|---------|---|---|
| **Component** | React Select | React Select |
| **Customer Search** | ✅ Yes | ✅ Yes |
| **Edit Button** | ✅ Yes | ❌ No |
| **Edit Navigation** | `/customers/{id}?edit=true` | N/A |
| **Flex Layout** | ✅ Yes (gap-2) | ❌ No |
| **Form Library** | useState | react-hook-form |
| **Validation** | Manual | Zod schema |
| **Custom Input** | ✅ Allows typing new name | ❌ No |
| **onInputChange** | ✅ Yes | ❌ No |

---

## Recommendation: Add Edit Button to CreateWorkOrderPage

To make both pages consistent, add the Edit button to CreateWorkOrderPage:

### Changes Required:

1. **Wrap Select in a flex container**
2. **Add conditional Edit button** (same as CreateLeadPage)
3. **Import Edit2 icon** (already imported)

### Code to Add:

```tsx
<div>
  <label className="text-xs font-medium text-muted-foreground mb-2 block">Customer Name *</label>
  <div className="flex gap-2">
    <div className="flex-1">
      <Select
        options={customerOptions}
        value={customerOptions.find(opt => opt.value === selectedCustomerId) || null}
        onChange={(option) => {
          if (option) {
            handleCustomerSelect(option.value);
          } else {
            setSelectedCustomerId("");
            setCustomerState("");
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
      {/* Hidden input for form validation */}
      <input type="hidden" {...register("customer")} />
      {errors.customer && <p className="text-xs text-red-500 mt-1">{errors.customer.message}</p>}
    </div>
    {selectedCustomerId && (
      <button
        type="button"
        onClick={() => navigate(`/customers/${selectedCustomerId}?edit=true`)}
        className="h-[38px] px-3 inline-flex items-center gap-1.5 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-xs font-semibold text-card-foreground flex-shrink-0"
        title="Edit customer"
      >
        <Edit2 className="w-3.5 h-3.5" />
        Edit
      </button>
    )}
  </div>
</div>
```

---

## Summary of Findings

| Aspect | Finding |
|--------|---------|
| **Same Method Used?** | ✅ Yes - Both use React Select with customer search |
| **Edit Option Present?** | ❌ No - Only CreateLeadPage has Edit button |
| **Should Be Consistent?** | ✅ Yes - Both should have Edit button for UX consistency |
| **Implementation Complexity** | 🟢 Low - Simple wrapper div + conditional button |

