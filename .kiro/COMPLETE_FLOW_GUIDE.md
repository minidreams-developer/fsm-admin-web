# Complete Application Flow Guide

## End-to-End User Journey

### 1. Lead Management (LeadsPage)

#### Step 1: Create New Lead
```
User clicks "Add New Lead" button
→ Form appears with fields:
  - Name
  - Phone
  - Address
  - Services (multi-select)
  - Notes
→ User fills form and clicks "Save Lead"
→ Lead added to leadsStore
→ Toast: "Lead created successfully!"
→ Lead appears in table with "New" status
```

#### Step 2: Mark Lead as Contacted
```
User sees lead with "New" status
→ Clicks "Mark Contacted" button
→ leadsStore.updateLead(leadId, { status: "Contacted" })
→ Toast: "Lead marked as contacted"
→ Lead moves to "Contacted" section
→ Action button changes to "Send Quote"
```

#### Step 3: Send Quote
```
User clicks "Send Quote" button
→ Modal opens with form:
  - Services (pre-filled from lead)
  - Quote Amount (₹)
  - Contract Duration (One-Time, 3 Months, 4 Months, 1 Year)
  - Quote Details (notes)
→ User fills form and clicks "Send Quote"
→ leadsStore.updateLead(leadId, {
    status: "Quote Sent",
    quoteAmount: 5000,
    quoteContract: "3 Months",
    quoteNotes: "..."
  })
→ Toast: "Quote sent successfully!"
→ Lead moves to "Quote Sent" section
→ Action button changes to "Convert to Project" or "Send Reminder"
```

#### Step 4: Convert Quote to Work Order
```
User sees quote with "Viewed" status
→ Clicks "Convert to Project" button
→ Navigate to /projects?convertLeadId={leadId}
→ ProjectsPage loads
→ Reads leadId from URL
→ Fetches lead from leadsStore
→ Pre-fills form with lead data:
  - Customer Name: lead.name
  - Phone: lead.phone
  - Address: lead.address
  - Service: lead.services[0]
  - Contract: lead.quoteContract
  - Estimated Value: lead.quoteAmount
  - Notes: lead.quoteNotes
→ Form appears ready for submission
```

---

### 2. Work Order Management (ProjectsPage)

#### Step 1: Create Work Order from Lead
```
Form is pre-filled from lead data
→ User reviews/modifies fields
→ Clicks "Create Work Order"
→ Validation checks:
  - All required fields filled
  - Valid phone number
  - Valid amount
→ If valid:
  - projectsStore.addWorkOrder({
      id: "WO-1028",
      customer: "Hotel Sunrise",
      address: "Beach Road, Calicut",
      status: "Open",
      ...
    })
  - leadsStore.updateLead(leadId, { status: "Converted" })
  - Toast: "Work Order created successfully!"
  - Success message: "Lead 'Hotel Sunrise' converted to Work Order"
→ Work order appears in table with "Open" status
```

#### Step 2: View Work Order Details
```
User clicks "Edit" icon on work order row
→ Detail view opens showing:
  - Work Order ID
  - Customer details
  - Service information
  - Payment status with progress bar
  - Contract period
  - Special notes
→ User can see "Assign Service" button
```

#### Step 3: Assign Service to Employee
```
User clicks "Assign Service" button
→ Navigate to /services?workOrderId={woId}
→ ServicesPage loads
→ Reads workOrderId from URL
→ Fetches work order from projectsStore
→ Pre-fills form with work order data:
  - Work Order ID: WO-1028
  - Customer: Hotel Sunrise
  - Address: Beach Road, Calicut
  - Service Type: Bed Bug Treatment
→ Form appears ready for appointment details
```

---

### 3. Service Appointment Management (ServicesPage)

#### Step 1: Assign Service Appointment
```
Form is pre-filled with work order data
→ User fills appointment details:
  - Date: Mar 15, 2026
  - Time: 10:30 AM
  - Technician: Safeeq
  - Instructions: "Check all rooms"
  - Tasks: [
      "Inspect equipment",
      "Collect payment",
      "Document findings"
    ]
→ Clicks "Assign Service"
→ Validation checks:
  - Date selected
  - Time selected
  - Technician selected
→ If valid:
  - servicesStore.addAppointment({
      id: "SA-1",
      workOrderId: "WO-1028",
      date: "Mar 15, 2026",
      time: "10:30 AM",
      employeeName: "Safeeq",
      tasks: [...],
      status: "Scheduled"
    })
  - Toast: "Service appointment created successfully!"
  - Success message: "Service assigned to Safeeq for Hotel Sunrise"
→ Appointment appears in table
```

#### Step 2: View Assigned Services
```
User sees table of all assigned services:
- Service ID: SA-1
- Work Order: WO-1028
- Customer: Hotel Sunrise
- Technician: Safeeq
- Date & Time: Mar 15, 2026 10:30 AM
- Status: Scheduled
→ User can filter by customer name
→ User can see all appointment details
```

---

## Data Persistence Examples

### Example 1: Page Refresh
```
1. User on LeadsPage, viewing "Quote Sent" leads
2. User refreshes page (Ctrl+R)
3. LeadsPage loads
4. useLeadsStore() hook loads data from localStorage
5. All leads still visible with correct status
6. No data loss
```

### Example 2: Direct URL Access
```
1. User has URL: /projects?convertLeadId=3
2. User opens URL directly in new tab
3. ProjectsPage loads
4. Reads convertLeadId=3 from URL
5. Fetches lead #3 from leadsStore (from localStorage)
6. Pre-fills form with lead data
7. Works perfectly
```

### Example 3: Browser Back Button
```
1. User on ServicesPage
2. Clicks browser back button
3. Goes to ProjectsPage
4. ProjectsPage loads
5. useProjectsStore() loads data from localStorage
6. All work orders still visible
7. No data loss
```

---

## Store Data Structure

### LeadsStore Example
```typescript
{
  leads: [
    {
      id: 1,
      name: "Hotel Sunrise",
      phone: "9876543212",
      address: "Beach Road, Calicut",
      services: ["Commercial Pest Control", "Kitchen Deep Clean"],
      status: "Quote Sent",
      date: "Mar 3",
      quoteIsViewed: true,
      quoteViewedAt: "Mar 4, 2:30 PM",
      quoteAmount: 45000,
      quoteContract: "3 Months",
      quoteNotes: "Bulk discount applied"
    }
  ]
}
```

### ProjectsStore Example
```typescript
{
  workOrders: [
    {
      id: "WO-1028",
      customer: "Hotel Sunrise",
      address: "Beach Road, Calicut",
      status: "Open",
      phone: "9876543212",
      serviceType: "Bed Bug Treatment",
      frequency: "3 Months",
      totalValue: "₹ 45,000",
      paidAmount: "₹ 0",
      nextService: "Unassigned",
      assignedTech: "Unassigned",
      notes: "Full hotel treatment"
    }
  ]
}
```

### ServicesStore Example
```typescript
{
  appointments: [
    {
      id: "SA-1",
      workOrderId: "WO-1028",
      date: "Mar 15, 2026",
      time: "10:30 AM",
      employeeId: "Safeeq",
      employeeName: "Safeeq",
      instructions: "Check all rooms",
      tasks: [
        { id: "TSK-1", title: "Inspect equipment", completed: false },
        { id: "TSK-2", title: "Collect payment", completed: false }
      ],
      status: "Scheduled"
    }
  ]
}
```

---

## URL Parameter Conventions

### Lead Conversion
```
Before (Broken):
navigate("/projects", { state: { convertLead: lead } })
// Data lost on refresh

After (Fixed):
navigate(`/projects?convertLeadId=${lead.id}`)
// Data retrieved from store using URL parameter
```

### Service Assignment
```
Before (Broken):
navigate("/services", { state: { selectedProject } })
// Data lost on refresh

After (Fixed):
navigate(`/services?workOrderId=${workOrder.id}`)
// Data retrieved from store using URL parameter
```

---

## Error Handling

### Current Implementation
```typescript
// LeadsPage - Send Quote
const handleSendQuote = () => {
  if (selectedLeadForQuote && quoteFormData.amount && quoteFormData.contract) {
    updateLead(selectedLeadForQuote.id, {
      status: "Quote Sent",
      quoteAmount: parseInt(quoteFormData.amount),
      quoteContract: quoteFormData.contract,
      quoteNotes: quoteFormData.notes,
    });
    toast.success("Quote sent successfully!");
    // ... reset form
  } else {
    toast.error("Please fill in all required fields");
  }
};
```

### Future Enhancement
```typescript
// With proper validation
const handleSendQuote = async () => {
  try {
    const validated = quoteSchema.parse(quoteFormData);
    updateLead(selectedLeadForQuote.id, {
      status: "Quote Sent",
      ...validated
    });
    toast.success("Quote sent successfully!");
  } catch (error) {
    if (error instanceof ZodError) {
      error.errors.forEach(err => {
        toast.error(`${err.path.join('.')}: ${err.message}`);
      });
    } else {
      toast.error("An unexpected error occurred");
    }
  }
};
```

---

## Testing the Flow

### Manual Testing Checklist
- [ ] Create lead → Mark contacted → Send quote → Convert to project
- [ ] Refresh page at each step → Data persists
- [ ] Use browser back button → Data persists
- [ ] Open URL directly → Data loads correctly
- [ ] Create work order → Assign service → Check table
- [ ] Filter leads by status → All statuses work
- [ ] Search functionality → Works across all pages
- [ ] Toast notifications → Appear for all actions
- [ ] Form validation → Shows errors for empty fields
- [ ] Mobile view → Forms and tables responsive

---

## Performance Considerations

### Current
- All data in memory (fast)
- localStorage persistence (automatic)
- No network calls (instant)

### Future Optimizations
- Add pagination for large datasets
- Implement data caching strategies
- Add loading states for API calls
- Implement optimistic updates
- Add real-time sync with WebSockets

---

## Troubleshooting

### Issue: Data not persisting after refresh
**Solution**: Check browser localStorage is enabled
```javascript
// In browser console
localStorage.getItem('leads-store')
localStorage.getItem('projects-store')
localStorage.getItem('services-store')
```

### Issue: Pre-filled form not showing
**Solution**: Check URL parameters
```javascript
// In browser console
new URLSearchParams(window.location.search).get('convertLeadId')
```

### Issue: Store not updating
**Solution**: Ensure using store methods, not direct mutation
```typescript
// ❌ Wrong
lead.status = "Contacted";

// ✅ Correct
updateLead(lead.id, { status: "Contacted" });
```

---

## Next Steps

1. **Add Form Validation** - Use React Hook Form + Zod
2. **Add Authentication** - Implement JWT tokens
3. **Add Error Boundaries** - Catch and display errors
4. **Add Mobile Support** - Responsive tables and forms
5. **Add Accessibility** - ARIA labels and keyboard navigation
