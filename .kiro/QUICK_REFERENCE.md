# Quick Reference Card

## Store Usage Cheat Sheet

### Import Stores
```typescript
import { useLeadsStore } from "@/store/leadsStore";
import { useProjectsStore } from "@/store/projectsStore";
import { useServicesStore } from "@/store/servicesStore";
```

### LeadsStore Methods
```typescript
const { 
  leads,                    // All leads
  addLead,                  // Add new lead
  updateLead,               // Update lead
  deleteLead,               // Delete lead
  getLead,                  // Get single lead
  getLeadsByStatus          // Filter by status
} = useLeadsStore();

// Usage
updateLead(1, { status: "Contacted" });
const lead = getLead(1);
const newLeads = getLeadsByStatus("Quote Sent");
```

### ProjectsStore Methods
```typescript
const {
  workOrders,               // All work orders
  addWorkOrder,             // Add new work order
  updateWorkOrder,          // Update work order
  deleteWorkOrder,          // Delete work order
  getWorkOrder,             // Get single work order
  getWorkOrdersByStatus,    // Filter by status
  getNextWorkOrderId        // Generate next ID
} = useProjectsStore();

// Usage
const newId = getNextWorkOrderId(); // "WO-1028"
addWorkOrder({ id: newId, ... });
```

### ServicesStore Methods
```typescript
const {
  appointments,             // All appointments
  addAppointment,           // Add new appointment
  updateAppointment,        // Update appointment
  deleteAppointment,        // Delete appointment
  getAppointment,           // Get single appointment
  getAppointmentsByWorkOrder, // Filter by work order
  getNextAppointmentId      // Generate next ID
} = useServicesStore();

// Usage
const newId = getNextAppointmentId(); // "SA-1"
addAppointment({ id: newId, workOrderId: "WO-1025", ... });
```

---

## URL Parameter Patterns

### Lead Conversion
```typescript
// Navigate
navigate(`/projects?convertLeadId=${lead.id}`);

// Read
const [searchParams] = useSearchParams();
const leadId = searchParams.get("convertLeadId");
const lead = getLead(parseInt(leadId));
```

### Service Assignment
```typescript
// Navigate
navigate(`/services?workOrderId=${workOrder.id}`);

// Read
const [searchParams] = useSearchParams();
const workOrderId = searchParams.get("workOrderId");
const workOrder = getWorkOrder(workOrderId);
```

---

## Toast Notifications

```typescript
import { toast } from "sonner";

// Success
toast.success("Action completed!");

// Error
toast.error("Something went wrong");

// Info
toast.info("Information message");

// Warning
toast.warning("Warning message");
```

---

## Common Patterns

### Update Lead Status
```typescript
const { updateLead } = useLeadsStore();

updateLead(leadId, { status: "Contacted" });
```

### Create Work Order from Lead
```typescript
const { addWorkOrder, getNextWorkOrderId } = useProjectsStore();
const { updateLead } = useLeadsStore();

const newWO = {
  id: getNextWorkOrderId(),
  customer: lead.name,
  address: lead.address,
  // ... other fields
};

addWorkOrder(newWO);
updateLead(lead.id, { status: "Converted" });
```

### Create Service Appointment
```typescript
const { addAppointment, getNextAppointmentId } = useServicesStore();

const newAppointment = {
  id: getNextAppointmentId(),
  workOrderId: workOrder.id,
  date: formData.date,
  time: formData.time,
  employeeName: formData.employee,
  // ... other fields
};

addAppointment(newAppointment);
```

---

## Data Types

### Lead
```typescript
type Lead = {
  id: number;
  name: string;
  phone: string;
  address: string;
  services: string[];
  status: "New" | "Contacted" | "Quote Sent" | "Converted" | "Lost";
  date: string;
  quoteIsViewed: boolean;
  quoteViewedAt: string | null;
  quoteAmount?: number;
  quoteContract?: string;
  quoteNotes?: string;
  quoteLost?: boolean;
};
```

### WorkOrder
```typescript
type WorkOrder = {
  id: string;
  customer: string;
  address: string;
  start: string;
  end: string;
  status: "Open" | "Scheduled" | "Completed";
  phone: string;
  email: string;
  serviceType: string;
  frequency: string;
  totalValue: string;
  paidAmount: string;
  nextService: string;
  assignedTech: string;
  notes: string;
  leadId?: number;
};
```

### ServiceAppointment
```typescript
type ServiceAppointment = {
  id: string;
  workOrderId: string;
  date: string;
  time: string;
  employeeId: string;
  employeeName: string;
  instructions: string;
  tasks: Task[];
  status: "Scheduled" | "Completed" | "Cancelled";
};

type Task = {
  id: string;
  title: string;
  completed: boolean;
};
```

---

## File Locations

```
src/
├── store/
│   ├── leadsStore.ts          ← Lead management
│   ├── projectsStore.ts       ← Work order management
│   └── servicesStore.ts       ← Service appointment management
├── pages/
│   ├── LeadsPage.tsx          ← Uses leadsStore
│   ├── ProjectsPage.tsx       ← Uses projectsStore + leadsStore
│   └── ServicesPage.tsx       ← Uses servicesStore + projectsStore
└── App.tsx                    ← Route configuration

.kiro/
├── STATE_MANAGEMENT_GUIDE.md  ← Architecture guide
├── IMPLEMENTATION_CHECKLIST.md ← Task tracking
├── COMPLETE_FLOW_GUIDE.md     ← User journey
├── IMPLEMENTATION_SUMMARY.md  ← What was fixed
├── TESTING_GUIDE.md           ← How to test
└── QUICK_REFERENCE.md         ← This file
```

---

## Common Tasks

### Add a New Lead
```typescript
const { addLead } = useLeadsStore();

addLead({
  name: "John Doe",
  phone: "9876543210",
  address: "123 Main St",
  services: ["Pest Control"],
  status: "New",
  date: new Date().toLocaleDateString(),
  quoteIsViewed: false,
  quoteViewedAt: null
});
```

### Send Quote to Lead
```typescript
const { updateLead } = useLeadsStore();

updateLead(leadId, {
  status: "Quote Sent",
  quoteAmount: 5000,
  quoteContract: "3 Months",
  quoteNotes: "Bulk discount applied"
});
```

### Convert Lead to Work Order
```typescript
const { addWorkOrder, getNextWorkOrderId } = useProjectsStore();
const { updateLead } = useLeadsStore();

const lead = getLead(leadId);
const newWO = {
  id: getNextWorkOrderId(),
  customer: lead.name,
  address: lead.address,
  start: new Date().toLocaleDateString(),
  end: new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString(),
  status: "Open",
  phone: lead.phone,
  email: "",
  serviceType: lead.services[0],
  frequency: lead.quoteContract,
  totalValue: `₹ ${lead.quoteAmount}`,
  paidAmount: "₹ 0",
  nextService: "Unassigned",
  assignedTech: "Unassigned",
  notes: lead.quoteNotes || ""
};

addWorkOrder(newWO);
updateLead(leadId, { status: "Converted" });
```

### Assign Service to Work Order
```typescript
const { addAppointment, getNextAppointmentId } = useServicesStore();

const newAppointment = {
  id: getNextAppointmentId(),
  workOrderId: workOrderId,
  date: "2026-03-15",
  time: "10:30",
  employeeId: "Safeeq",
  employeeName: "Safeeq",
  instructions: "Check all rooms",
  tasks: [
    { id: "1", title: "Inspect equipment", completed: false },
    { id: "2", title: "Collect payment", completed: false }
  ],
  status: "Scheduled"
};

addAppointment(newAppointment);
```

---

## Debugging Tips

### Check Store Data
```typescript
// In browser console
localStorage.getItem('leads-store')
localStorage.getItem('projects-store')
localStorage.getItem('services-store')
```

### Parse Store Data
```typescript
// In browser console
JSON.parse(localStorage.getItem('leads-store'))
```

### Clear All Data
```typescript
// In browser console
localStorage.clear()
// Then refresh page
```

### Check URL Parameters
```typescript
// In browser console
new URLSearchParams(window.location.search).get('convertLeadId')
```

---

## Performance Tips

1. **Use selectors** - Only subscribe to needed data
2. **Avoid re-renders** - Use proper component structure
3. **Batch updates** - Update multiple fields at once
4. **Lazy load** - Load data only when needed
5. **Pagination** - For large datasets (future)

---

## Common Errors & Solutions

| Error | Solution |
|-------|----------|
| "Cannot read property 'id' of undefined" | Check if data exists before accessing |
| "Data not persisting" | Check localStorage is enabled |
| "Form not pre-filling" | Check URL parameter is correct |
| "Toast not showing" | Check Sonner provider in App.tsx |
| "Store not updating" | Use store methods, don't mutate directly |

---

## Next Steps

1. **Add Form Validation** - Use React Hook Form + Zod
2. **Add Authentication** - Implement JWT tokens
3. **Add Error Handling** - Create error boundaries
4. **Add Mobile Support** - Make responsive
5. **Add Accessibility** - Add ARIA labels

---

## Resources

- **Zustand Docs**: https://github.com/pmndrs/zustand
- **React Router**: https://reactrouter.com/
- **Sonner Toast**: https://sonner.emilkowal.ski/
- **TypeScript**: https://www.typescriptlang.org/

---

## Support

For issues or questions:
1. Check `.kiro/TESTING_GUIDE.md` for testing procedures
2. Check `.kiro/COMPLETE_FLOW_GUIDE.md` for flow details
3. Check browser console for errors
4. Check localStorage for data
5. Review store implementations in `src/store/`
