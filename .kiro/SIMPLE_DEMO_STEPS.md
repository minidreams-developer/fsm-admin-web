# Simple Demo Steps - Show the Complete Flow

## What to Demo

Show how a lead with a viewed quote converts to a work order with a pre-filled form.

---

## Demo Steps (5 Minutes)

### Step 1: Show Leads Page
```
What you see:
- Leads table with "Arun Sharma"
- Status: "Quote Sent"
- Quote Status: "Not Viewed"
- Action: "Send Reminder"

Say: "This is a lead with a quote that hasn't been viewed yet."
```

### Step 2: Simulate Quote Being Viewed
```
What to do:
- Open browser console (F12)
- Paste this code:

localStorage.setItem('leads-store', JSON.stringify({
  state: {
    leads: [
      {
        id: 1,
        name: "Arun Sharma",
        phone: "9876543210",
        address: "12 MG Road, Kochi",
        services: ["Termite Treatment"],
        status: "Quote Sent",
        date: "Mar 5",
        quoteIsViewed: true,
        quoteViewedAt: "Mar 13, 2:30 PM",
        quoteAmount: 5000,
        quoteContract: "3 Months"
      }
    ]
  }
}));
location.reload();

- Press Enter
- Page refreshes

Say: "Now the customer has viewed the quote."
```

### Step 3: Show Updated Lead
```
What you see:
- Same lead "Arun Sharma"
- Status: "Quote Sent"
- Quote Status: "✓ Viewed" (with eye icon)
- Action: "Convert to Project" (NEW BUTTON!)

Say: "Notice the action changed to 'Convert to Project'. 
      This button only appears when the quote is viewed."
```

### Step 4: Click "Convert to Project"
```
What to do:
- Click "Convert to Project" button

What happens:
- You're taken to Projects page
- A form appears with pre-filled data

Say: "When I click 'Convert to Project', 
      I'm taken to the Projects page with a pre-filled form."
```

### Step 5: Show Pre-filled Form
```
What you see:
┌─────────────────────────────────────────┐
│ Create New Work Order                   │
├─────────────────────────────────────────┤
│ Customer Name: Arun Sharma ✓            │
│ Phone: 9876543210 ✓                     │
│ Address: 12 MG Road, Kochi ✓            │
│ Service: Termite Treatment ✓            │
│ Contract: 3 Months ✓                    │
│ Amount: 5000 ✓                          │
│                                         │
│ [Create Work Order]  [Cancel]           │
└─────────────────────────────────────────┘

Say: "All the lead data is automatically pre-filled.
      No need to re-enter anything!
      I just click 'Create Work Order'."
```

### Step 6: Click "Create Work Order"
```
What to do:
- Click "Create Work Order" button

What happens:
- Green message: ✓ "Work Order created successfully!"
- New work order appears in table

Say: "The work order is created and saved automatically."
```

### Step 7: Show Work Order in Table
```
What you see:
┌──────────────────────────────────────────┐
│ WO-1028 │ Arun Sharma │ Termite... │ Open │
└──────────────────────────────────────────┘

Say: "Here's the new work order in the table.
      Status is 'Open' (not yet scheduled)."
```

### Step 8: Click "Edit" on Work Order
```
What to do:
- Click the pencil icon on the work order row

What happens:
- Detail view opens showing all information

Say: "Let me click 'Edit' to see the full details."
```

### Step 9: Show Work Order Details
```
What you see:
┌─────────────────────────────────────────┐
│ WO-1028 - Arun Sharma                   │
├─────────────────────────────────────────┤
│ Lead Information                        │
│ - Name: Arun Sharma                     │
│ - Address: 12 MG Road, Kochi            │
│ - Phone: 9876543210                     │
│                                         │
│ Services                                │
│ - 1. Termite Treatment                  │
│                                         │
│ Quote Details                           │
│ - Amount: ₹5,000                        │
│ - Contract: 3 Months                    │
│ - Status: Viewed                        │
│                                         │
│ [Close]  [Assign Service]               │
└─────────────────────────────────────────┘

Say: "Here's all the work order information.
      Now I'll click 'Assign Service' to assign this to a technician."
```

### Step 10: Click "Assign Service"
```
What to do:
- Click "Assign Service" button

What happens:
- You're taken to Services page
- Form appears with pre-filled work order data

Say: "When I click 'Assign Service',
      I'm taken to the Services page with another pre-filled form."
```

### Step 11: Show Pre-filled Service Form
```
What you see:
┌─────────────────────────────────────────┐
│ Assign Service Appointment              │
├─────────────────────────────────────────┤
│ Work Order: WO-1028 ✓                   │
│ Customer: Arun Sharma ✓                 │
│ Address: 12 MG Road, Kochi ✓            │
│ Service: Termite Treatment ✓            │
│                                         │
│ Date: [Select date]                     │
│ Time: [Select time]                     │
│ Technician: [Select employee]           │
│                                         │
│ [Cancel]  [Assign Service]              │
└─────────────────────────────────────────┘

Say: "Again, all the work order data is pre-filled.
      I just need to select the date, time, and technician."
```

### Step 12: Fill Appointment Details
```
What to do:
- Click Date field → Select any date
- Click Time field → Select any time
- Click Technician → Select "Safeeq"

Say: "I'll select a date, time, and assign it to Safeeq."
```

### Step 13: Click "Assign Service"
```
What to do:
- Click "Assign Service" button

What happens:
- Green message: ✓ "Service appointment created successfully!"
- New appointment appears in table

Say: "The service appointment is created and assigned."
```

### Step 14: Show Service Appointment in Table
```
What you see:
┌──────────────────────────────────────────┐
│ SA-1 │ WO-1028 │ Arun Sharma │ Safeeq │ ...│
└──────────────────────────────────────────┘

Say: "Here's the new service appointment in the table.
      The workflow is complete!"
```

---

## Demo Summary

```
LEAD (Quote Sent, Not Viewed)
    ↓
[Simulate: Quote Viewed]
    ↓
LEAD (Quote Sent, Viewed ✓)
    ↓
[Click: Convert to Project]
    ↓
PROJECTS PAGE (Form Pre-filled)
    ↓
[Click: Create Work Order]
    ↓
WORK ORDER (Open)
    ↓
[Click: Edit → Assign Service]
    ↓
SERVICES PAGE (Form Pre-filled)
    ↓
[Fill Details → Click: Assign Service]
    ↓
SERVICE APPOINTMENT (Scheduled) ✓
```

---

## Key Points to Highlight

### 1. **Data Persistence**
"Notice how all the data is saved and persists through the workflow."

### 2. **Form Pre-filling**
"The forms automatically pre-fill with previous data. 
No need to re-enter information."

### 3. **User Feedback**
"Green success messages confirm each action."

### 4. **Smooth Workflow**
"The entire process is smooth and frictionless."

### 5. **Complete Flow**
"From lead to service assignment in just a few clicks."

---

## Demo Talking Points

**Opening:**
"Let me show you the complete workflow from Lead to Service Assignment."

**After Step 3:**
"The action button changes based on the quote status. 
When viewed, it shows 'Convert to Project'."

**After Step 5:**
"Notice all the data is pre-filled. This saves time and reduces errors."

**After Step 8:**
"The work order is created and saved automatically."

**After Step 11:**
"Again, the form is pre-filled with work order data."

**Closing:**
"The entire workflow is smooth, data persists, and forms pre-fill automatically. 
This makes the process fast and error-free."

---

## That's the Complete Demo! 🎉

This demonstrates:
✅ Lead to Project conversion  
✅ Form pre-filling  
✅ Data persistence  
✅ User feedback  
✅ Complete workflow  
