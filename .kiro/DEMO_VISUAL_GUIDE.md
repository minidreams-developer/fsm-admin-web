# Visual Demo Guide - Show the Flow

## The Demo in Pictures

### Screen 1: Leads Page - Quote Not Viewed
```
┌─────────────────────────────────────────────────────────────┐
│ LEADS                                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [All] [New] [Contacted] [Quote Sent] [Converted] [Lost]   │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ NAME          │ PHONE      │ QUOTE STATUS │ ACTION      ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ Arun Sharma   │ 9876543210 │ ⊘ Not Viewed │ Send        ││
│ │               │            │              │ Reminder    ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ Say: "This lead has a quote that hasn't been viewed yet." │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Screen 2: Leads Page - Quote Viewed ✓
```
┌─────────────────────────────────────────────────────────────┐
│ LEADS                                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [All] [New] [Contacted] [Quote Sent] [Converted] [Lost]   │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ NAME          │ PHONE      │ QUOTE STATUS │ ACTION      ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ Arun Sharma   │ 9876543210 │ ✓ Viewed     │ Convert to  ││
│ │               │            │ (Eye icon)   │ Project     ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ Say: "Now the quote is viewed. The action changed to      │
│      'Convert to Project'. Let me click it."              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Screen 3: Projects Page - Pre-filled Form
```
┌─────────────────────────────────────────────────────────────┐
│ PROJECTS                                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Create New Work Order                                   ││
│ ├─────────────────────────────────────────────────────────┤│
│ │                                                         ││
│ │ Customer Name: Arun Sharma ✓ (Pre-filled)              ││
│ │ Phone: 9876543210 ✓ (Pre-filled)                       ││
│ │ Address: 12 MG Road, Kochi ✓ (Pre-filled)              ││
│ │ Service: Termite Treatment ✓ (Pre-filled)              ││
│ │ Contract: 3 Months ✓ (Pre-filled)                      ││
│ │ Amount: 5000 ✓ (Pre-filled)                            ││
│ │                                                         ││
│ │ [Create Work Order]  [Cancel]                          ││
│ │                                                         ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ Say: "The form is automatically pre-filled with all the   │
│      lead data. I just click 'Create Work Order'."        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Screen 4: Projects Page - Work Order Created
```
┌─────────────────────────────────────────────────────────────┐
│ PROJECTS                                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ✓ Lead "Arun Sharma" has been converted to a Work Order.  │
│   Now assign a technician to start the service.           │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ WO ID   │ CUSTOMER      │ SERVICE TYPE    │ STATUS      ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ WO-1028 │ Arun Sharma   │ Termite         │ Open        ││
│ │         │               │ Treatment       │ (Not Yet    ││
│ │         │               │ (One-Time)      │ Scheduled)  ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ Say: "The work order is created. Now I'll click 'Edit'    │
│      to view the details and assign a service."           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Screen 5: Work Order Detail View
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
│ └─ Current Status: Viewed ✓                                │
│                                                             │
│ [Close]  [Assign Service]                                  │
│                                                             │
│ Say: "Here's the complete work order detail. Now I'll     │
│      click 'Assign Service' to assign this to a tech."    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Screen 6: Services Page - Pre-filled Form
```
┌─────────────────────────────────────────────────────────────┐
│ SERVICES                                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Assign Service Appointment                              ││
│ ├─────────────────────────────────────────────────────────┤│
│ │                                                         ││
│ │ WORK ORDER INFORMATION (Pre-filled)                     ││
│ │ ├─ Work Order: WO-1028 ✓                               ││
│ │ ├─ Customer: Arun Sharma ✓                             ││
│ │ ├─ Address: 12 MG Road, Kochi ✓                        ││
│ │ └─ Service: Termite Treatment ✓                        ││
│ │                                                         ││
│ │ APPOINTMENT DETAILS (Fill these)                        ││
│ │ ├─ Date: [Select date]                                 ││
│ │ ├─ Time: [Select time]                                 ││
│ │ └─ Technician: [Select employee]                       ││
│ │                                                         ││
│ │ [Cancel]  [Assign Service]                             ││
│ │                                                         ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ Say: "Again, the form is pre-filled. I just need to      │
│      select the date, time, and technician."             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Screen 7: Services Page - Appointment Created
```
┌─────────────────────────────────────────────────────────────┐
│ SERVICES                                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ✓ Service assigned to Safeeq for Arun Sharma.             │
│   Employee will receive the task in their mobile app.     │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ SERVICE ID │ WORK ORDER │ CUSTOMER      │ TECHNICIAN   ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ SA-1       │ WO-1028    │ Arun Sharma   │ Safeeq       ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ Say: "The service appointment is created and assigned.    │
│      The workflow is complete!"                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Complete Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    COMPLETE DEMO FLOW                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  SCREEN 1: Leads Page                                        │
│  ├─ Lead: Arun Sharma                                        │
│  ├─ Status: Quote Sent                                       │
│  ├─ Quote Status: ⊘ Not Viewed                               │
│  └─ Action: Send Reminder                                    │
│                                                              │
│  ↓ [Simulate: Quote Viewed]                                  │
│                                                              │
│  SCREEN 2: Leads Page (Updated)                              │
│  ├─ Lead: Arun Sharma                                        │
│  ├─ Status: Quote Sent                                       │
│  ├─ Quote Status: ✓ Viewed                                   │
│  └─ Action: Convert to Project ← CLICK                       │
│                                                              │
│  ↓ [Click: Convert to Project]                               │
│                                                              │
│  SCREEN 3: Projects Page                                     │
│  ├─ Form Pre-filled ✓                                        │
│  ├─ Customer: Arun Sharma                                    │
│  ├─ Phone: 9876543210                                        │
│  ├─ Address: 12 MG Road, Kochi                               │
│  ├─ Service: Termite Treatment                               │
│  ├─ Amount: ₹5,000                                           │
│  └─ Contract: 3 Months                                       │
│                                                              │
│  ↓ [Click: Create Work Order]                                │
│                                                              │
│  SCREEN 4: Projects Page (Updated)                           │
│  ├─ Success Message ✓                                        │
│  ├─ Work Order: WO-1028                                      │
│  ├─ Status: Open                                             │
│  └─ Action: Edit ← CLICK                                     │
│                                                              │
│  ↓ [Click: Edit]                                             │
│                                                              │
│  SCREEN 5: Work Order Detail View                            │
│  ├─ All Information Displayed                                │
│  ├─ Lead Info                                                │
│  ├─ Services                                                 │
│  ├─ Quote Details                                            │
│  └─ Action: Assign Service ← CLICK                           │
│                                                              │
│  ↓ [Click: Assign Service]                                   │
│                                                              │
│  SCREEN 6: Services Page                                     │
│  ├─ Form Pre-filled ✓                                        │
│  ├─ Work Order: WO-1028                                      │
│  ├─ Customer: Arun Sharma                                    │
│  ├─ Address: 12 MG Road, Kochi                               │
│  ├─ Service: Termite Treatment                               │
│  ├─ Date: [Select]                                           │
│  ├─ Time: [Select]                                           │
│  └─ Technician: [Select]                                     │
│                                                              │
│  ↓ [Fill Details → Click: Assign Service]                    │
│                                                              │
│  SCREEN 7: Services Page (Updated)                           │
│  ├─ Success Message ✓                                        │
│  ├─ Service Appointment: SA-1                                │
│  ├─ Status: Scheduled                                        │
│  └─ Workflow Complete! ✓                                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Key Features to Highlight

### Feature 1: Status-Based Actions
```
Quote Not Viewed → Action: Send Reminder
Quote Viewed ✓   → Action: Convert to Project
```

### Feature 2: Form Pre-filling
```
Lead Data → Projects Form (Pre-filled)
Project Data → Services Form (Pre-filled)
```

### Feature 3: Data Persistence
```
All data saves automatically
Refresh page → Data still there
Navigate between pages → Data persists
```

### Feature 4: User Feedback
```
✓ Success messages appear
✓ Clear action buttons
✓ Smooth workflow
```

---

## Demo Talking Points

**Opening:**
"Let me show you the complete workflow from Lead to Service Assignment."

**At Screen 2:**
"Notice the action button changed from 'Send Reminder' to 'Convert to Project'. 
This only appears when the quote is viewed."

**At Screen 3:**
"When I click 'Convert to Project', the form is automatically pre-filled with all the lead data. 
No need to re-enter anything."

**At Screen 4:**
"The work order is created and saved automatically. 
Notice the success message confirming the conversion."

**At Screen 5:**
"Here's the complete work order detail showing all the information. 
Now I'll assign this to a technician."

**At Screen 6:**
"Again, the form is pre-filled with the work order data. 
I just need to select the date, time, and technician."

**At Screen 7:**
"The service appointment is created and assigned. 
The entire workflow is complete!"

**Closing:**
"The key benefits are:
- ✓ Data persists across all pages
- ✓ Forms pre-fill automatically
- ✓ No need to re-enter information
- ✓ Clear feedback at each step
- ✓ Smooth, frictionless workflow"

---

## That's the Complete Visual Demo! 🎉

This shows all the key features and the complete workflow from Lead to Service Assignment.
