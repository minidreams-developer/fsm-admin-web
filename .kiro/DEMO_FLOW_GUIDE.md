# Demo Flow Guide - Complete Lead to Work Order Journey

## The Complete Demo Flow

This guide shows how to demonstrate the full workflow from Lead → Quote Viewed → Convert to Project → Work Order.

---

## Step 1: View the Quote Sent Lead

### Current State (What You See)
```
Leads Table:
┌─────────────────────────────────────────────────────────────┐
│ NAME          │ PHONE      │ ADDRESS    │ SERVICES │ STATUS  │
├─────────────────────────────────────────────────────────────┤
│ Arun Sharma   │ 9876543210 │ 12 MG Road │ 1 Service│ Quote   │
│               │            │ Kochi      │          │ Sent    │
├─────────────────────────────────────────────────────────────┤
│ safeeq        │ 5555555555 │ ffffffffff│ 3 Services│ Quote   │
│               │            │            │          │ Sent    │
└─────────────────────────────────────────────────────────────┘

QUOTE STATUS: Not Viewed
ACTION: Send Reminder
```

---

## Step 2: Mark Quote as Viewed (Simulate Customer Viewing)

### What to Do:
1. In your browser console, run this command:
```javascript
// This simulates the customer viewing the quote
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
        quoteIsViewed: true,  // ← Changed to true
        quoteViewedAt: "Mar 13, 2:30 PM",
        quoteAmount: 5000,
        quoteContract: "3 Months"
      }
    ]
  }
}));
location.reload();
```

### Result After Refresh:
```
Leads Table:
┌─────────────────────────────────────────────────────────────┐
│ NAME          │ QUOTE STATUS    │ ACTION              │
├─────────────────────────────────────────────────────────────┤
│ Arun Sharma   │ ✓ Viewed        │ Convert to Project  │
│               │ (Eye icon)      │ (Button appears)    │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 3: Click "Convert to Project" Button

### What Happens:
1. Click the **"Convert to Project"** button
2. You're taken to **Projects** page
3. A form appears with **PRE-FILLED DATA**

### Pre-filled Form Shows:
```
┌─────────────────────────────────────────────────────────────┐
│ Create New Work Order                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Customer Name: Arun Sharma ✓ (Pre-filled)                  │
│ Phone Number: 9876543210 ✓ (Pre-filled)                    │
│ Service Address: 12 MG Road, Kochi ✓ (Pre-filled)          │
│ Services: Termite Treatment ✓ (Pre-filled)                 │
│ Contract: 3 Months ✓ (Pre-filled)                          │
│ Estimated Value (₹): 5000 ✓ (Pre-filled)                   │
│ Special Notes: (empty)                                      │
│                                                             │
│ [Create Work Order]  [Cancel]                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 4: Create Work Order

### What to Do:
1. Review the pre-filled data
2. Click **"Create Work Order"** button
3. See green message: ✓ "Work Order created successfully!"

### Result:
```
Success Message:
┌─────────────────────────────────────────────────────────────┐
│ ✓ Lead "Arun Sharma" has been converted to a Work Order.   │
│   Now assign a technician to start the service.            │
└─────────────────────────────────────────────────────────────┘

Work Orders Table:
┌─────────────────────────────────────────────────────────────┐
│ WO ID   │ CUSTOMER      │ SERVICE TYPE        │ STATUS      │
├─────────────────────────────────────────────────────────────┤
│ WO-1028 │ Arun Sharma   │ Termite Treatment   │ Open        │
│         │               │ (One-Time)          │ (Not Yet    │
│         │               │                     │ Scheduled)  │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 5: View Work Order Details

### What to Do:
1. Click the **"Edit"** icon (pencil) on the work order row
2. Detail view opens showing all information

### Detail View Shows:
```
┌─────────────────────────────────────────────────────────────┐
│ WO-1028 - Arun Sharma                                       │
│ Quote View Status                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ LEAD INFORMATION                                            │
│ ├─ Company/Name: Arun Sharma                               │
│ ├─ Contact Address: 12 MG Road, Kochi                      │
│ └─ Phone Number: 9876543210                                │
│                                                             │
│ SERVICES                                                    │
│ └─ 1. Termite Treatment                                    │
│                                                             │
│ QUOTE DETAILS                                               │
│ ├─ Quote Amount: ₹5,000                                    │
│ ├─ Contract Duration: 3 Months                             │
│ ├─ Quote Sent Date: Mar 5                                  │
│ └─ Current Status: Viewed                                  │
│                                                             │
│ [Close]  [Assign Service]                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 6: Click "Assign Service" Button

### What Happens:
1. Click **"Assign Service"** button
2. You're taken to **Services** page
3. Form appears with **PRE-FILLED WORK ORDER DATA**

### Pre-filled Form Shows:
```
┌─────────────────────────────────────────────────────────────┐
│ Assign Service Appointment                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ WORK ORDER INFORMATION (Pre-filled)                         │
│ ├─ Work Order: WO-1028 ✓                                   │
│ ├─ Customer: Arun Sharma ✓                                 │
│ ├─ Address: 12 MG Road, Kochi ✓                            │
│ └─ Service Type: Termite Treatment ✓                       │
│                                                             │
│ APPOINTMENT DETAILS (Fill these)                            │
│ ├─ Date: [Select date]                                     │
│ ├─ Time: [Select time]                                     │
│ └─ Technician: [Select employee]                           │
│                                                             │
│ SERVICE INSTRUCTIONS                                        │
│ └─ [Text area for instructions]                            │
│                                                             │
│ TASK CHECKLIST                                              │
│ └─ [Add custom tasks]                                      │
│                                                             │
│ [Cancel]  [Assign Service]                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 7: Complete Service Assignment

### What to Do:
1. Fill appointment details:
   - Date: Select any date
   - Time: Select any time
   - Technician: Select "Safeeq"
2. (Optional) Add service instructions
3. (Optional) Add tasks
4. Click **"Assign Service"**

### Result:
```
Success Message:
┌─────────────────────────────────────────────────────────────┐
│ ✓ Service assigned to Safeeq for Arun Sharma.              │
│   Employee will receive the task in their mobile app.      │
└─────────────────────────────────────────────────────────────┘

Service Appointments Table:
┌─────────────────────────────────────────────────────────────┐
│ SERVICE ID │ WORK ORDER │ CUSTOMER      │ TECHNICIAN │ DATE │
├─────────────────────────────────────────────────────────────┤
│ SA-1       │ WO-1028    │ Arun Sharma   │ Safeeq     │ ...  │
└─────────────────────────────────────────────────────────────┘
```

---

## Complete Flow Summary

```
LEADS PAGE
├─ Lead: Arun Sharma (Quote Sent, Not Viewed)
│  └─ Action: Send Reminder
│
├─ [Simulate: Mark quote as viewed]
│
├─ Lead: Arun Sharma (Quote Sent, Viewed ✓)
│  └─ Action: Convert to Project ← CLICK HERE
│
PROJECTS PAGE
├─ Form Pre-filled with Lead Data ✓
│  └─ Customer: Arun Sharma
│  └─ Phone: 9876543210
│  └─ Address: 12 MG Road, Kochi
│  └─ Service: Termite Treatment
│  └─ Amount: ₹5,000
│  └─ Contract: 3 Months
│
├─ Click "Create Work Order"
│
├─ Work Order Created: WO-1028 ✓
│  └─ Status: Open (Not Yet Scheduled)
│
├─ Click "Edit" → Detail View Opens
│  └─ Shows all work order details
│
├─ Click "Assign Service" ← CLICK HERE
│
SERVICES PAGE
├─ Form Pre-filled with Work Order Data ✓
│  └─ Work Order: WO-1028
│  └─ Customer: Arun Sharma
│  └─ Address: 12 MG Road, Kochi
│  └─ Service: Termite Treatment
│
├─ Fill Appointment Details
│  └─ Date: [Select]
│  └─ Time: [Select]
│  └─ Technician: Safeeq
│
├─ Click "Assign Service"
│
└─ Service Appointment Created: SA-1 ✓
   └─ Status: Scheduled
```

---

## Key Demo Points to Highlight

### 1. **Data Persistence**
- ✅ All data saves automatically
- ✅ Refresh page → Data still there
- ✅ Navigate between pages → Data persists

### 2. **Form Pre-filling**
- ✅ Lead data → Pre-fills in Project form
- ✅ Project data → Pre-fills in Service form
- ✅ No need to re-enter information

### 3. **User Feedback**
- ✅ Success messages appear
- ✅ Clear action buttons
- ✅ Smooth workflow

### 4. **Complete Flow**
- ✅ Lead → Quote Sent → Viewed
- ✅ Convert to Project → Work Order Created
- ✅ Assign Service → Service Appointment Created

---

## Demo Script (What to Say)

### Opening
"Let me show you the complete workflow from Lead to Service Assignment."

### Step 1
"Here we have a lead 'Arun Sharma' with a quote sent. The quote hasn't been viewed yet, so the action is 'Send Reminder'."

### Step 2
"Now let's simulate the customer viewing the quote. After refresh, the action changes to 'Convert to Project'."

### Step 3
"When I click 'Convert to Project', I'm taken to the Projects page with a pre-filled form. Notice all the lead data is already there - customer name, phone, address, service, amount, and contract duration."

### Step 4
"I click 'Create Work Order' and the system creates a new work order. Notice the success message confirming the conversion."

### Step 5
"Now I can see the work order in the table. Let me click 'Edit' to view the details."

### Step 6
"Here's the work order detail view showing all the information. Now I click 'Assign Service' to assign this to a technician."

### Step 7
"I'm taken to the Services page with the work order data pre-filled. I just need to select the date, time, and technician."

### Step 8
"After filling the details and clicking 'Assign Service', the system creates a service appointment. The workflow is complete!"

### Closing
"The key benefits are:
- ✅ Data persists across all pages
- ✅ Forms pre-fill automatically
- ✅ No need to re-enter information
- ✅ Clear feedback at each step
- ✅ Smooth, frictionless workflow"

---

## Quick Demo Checklist

- [ ] Show Leads page with Quote Sent leads
- [ ] Explain "Not Viewed" status
- [ ] Show "Send Reminder" action
- [ ] Simulate quote being viewed
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

---

## That's the Complete Demo! 🎉

This shows the full workflow from Lead → Quote → Project → Service Assignment with all the key features:
- ✅ Data persistence
- ✅ Form pre-filling
- ✅ User feedback
- ✅ Smooth navigation
