# Demo Quick Start - 5 Minute Demo

## The Demo in 5 Minutes

### Setup (Before Demo)
1. Open Leads page
2. You should see leads with "Quote Sent" status

---

## Demo Script

### Minute 1: Show Current State
```
"Here's the Leads page. We have a lead 'Arun Sharma' 
with a quote that hasn't been viewed yet. 
The action is 'Send Reminder'."

Point to: Quote Status = "Not Viewed"
Point to: Action = "Send Reminder"
```

### Minute 2: Simulate Quote Viewed
```
"Let's simulate the customer viewing the quote."

Open browser console (F12)
Paste this code:

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

Press Enter
Wait for page to reload

"Notice the action changed to 'Convert to Project'."

Point to: Quote Status = "✓ Viewed"
Point to: Action = "Convert to Project"
```

### Minute 3: Convert to Project
```
"Now I'll click 'Convert to Project'."

Click "Convert to Project" button

"Notice the form is automatically pre-filled with all the lead data."

Point to: Customer Name = "Arun Sharma"
Point to: Phone = "9876543210"
Point to: Address = "12 MG Road, Kochi"
Point to: Service = "Termite Treatment"
Point to: Amount = "5000"
Point to: Contract = "3 Months"

"I just click 'Create Work Order'."

Click "Create Work Order" button

"The work order is created."

Point to: Success message
Point to: New work order in table
```

### Minute 4: View Details & Assign Service
```
"Let me click 'Edit' to view the details."

Click Edit icon

"Here's the complete work order information. 
Now I'll click 'Assign Service'."

Click "Assign Service" button

"Again, the form is pre-filled with the work order data."

Point to: Work Order = "WO-1028"
Point to: Customer = "Arun Sharma"
Point to: Address = "12 MG Road, Kochi"
Point to: Service = "Termite Treatment"

"I just need to select the date, time, and technician."

Select Date
Select Time
Select Technician "Safeeq"

Click "Assign Service" button

"The service appointment is created."

Point to: Success message
Point to: New appointment in table
```

### Minute 5: Summary
```
"The entire workflow is complete! 

Key features:
✓ Data persists across all pages
✓ Forms pre-fill automatically
✓ No need to re-enter information
✓ Clear feedback at each step
✓ Smooth, frictionless workflow

From Lead to Service Assignment in just a few clicks!"
```

---

## Demo Checklist

- [ ] Show Leads page with Quote Sent lead
- [ ] Explain "Not Viewed" status
- [ ] Show "Send Reminder" action
- [ ] Simulate quote being viewed (console code)
- [ ] Show "Convert to Project" action appears
- [ ] Click "Convert to Project"
- [ ] Show pre-filled form on Projects page
- [ ] Click "Create Work Order"
- [ ] Show success message
- [ ] Show new work order in table
- [ ] Click "Edit" to view details
- [ ] Click "Assign Service"
- [ ] Show pre-filled form on Services page
- [ ] Fill appointment details
- [ ] Click "Assign Service"
- [ ] Show success message
- [ ] Show new service appointment in table
- [ ] Summarize key features

---

## Key Points

### Point 1: Status-Based Actions
"The action button changes based on the quote status."

### Point 2: Form Pre-filling
"All the data is automatically pre-filled. No need to re-enter."

### Point 3: Data Persistence
"All data saves automatically and persists across pages."

### Point 4: User Feedback
"Clear success messages confirm each action."

### Point 5: Complete Flow
"From Lead to Service Assignment in just a few clicks."

---

## Console Code (Copy-Paste)

```javascript
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
```

---

## That's It! 🎉

5-minute demo showing:
✓ Lead with viewed quote
✓ Convert to Project (pre-filled form)
✓ Create Work Order
✓ Assign Service (pre-filled form)
✓ Complete workflow

Perfect for showing stakeholders!
