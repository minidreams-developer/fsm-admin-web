# Visual Testing Guide - Step by Step with Pictures

## The Complete Flow (What Should Happen)

---

## STEP 1: Create a Lead

```
┌─────────────────────────────────────┐
│         LEADS PAGE                  │
├─────────────────────────────────────┤
│                                     │
│  [+ Add New Lead]  [Search...]      │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Quick Add Lead              │   │
│  ├─────────────────────────────┤   │
│  │ Name: [Test Lead        ]   │   │
│  │ Phone: [9999999999     ]    │   │
│  │ Address: [Test Address ]    │   │
│  │ Services: [Select...   ]    │   │
│  │                             │   │
│  │ [Save Lead]  [Cancel]       │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### What to Do:
1. Fill all fields
2. Click "Save Lead"
3. **See green message**: ✓ "Lead created successfully!"

---

## STEP 2: Refresh Page (F5)

```
BEFORE REFRESH:
┌─────────────────────────────────────┐
│  ✓ "Lead created successfully!"     │
│                                     │
│  Table shows:                       │
│  Test Lead | 9999999999 | New      │
└─────────────────────────────────────┘
         ↓ PRESS F5 ↓
AFTER REFRESH:
┌─────────────────────────────────────┐
│  (no message, but...)               │
│                                     │
│  Table STILL shows:                 │
│  Test Lead | 9999999999 | New ✓    │
│                                     │
│  DATA IS SAVED! 🎉                  │
└─────────────────────────────────────┘
```

### What Should Happen:
- ✅ Lead is **STILL THERE**
- ✅ No data lost
- ✅ Status is still "New"

---

## STEP 3: Mark as Contacted

```
┌─────────────────────────────────────┐
│         LEADS PAGE                  │
├─────────────────────────────────────┤
│                                     │
│  NEW LEADS:                         │
│  Test Lead | 9999999999 | [Mark Contacted] │
│                                     │
│  Click [Mark Contacted]             │
│         ↓                           │
│  ✓ "Lead marked as contacted"       │
│         ↓                           │
│  Lead moves to CONTACTED section    │
│                                     │
│  CONTACTED LEADS:                   │
│  Test Lead | 9999999999 | [Send Quote] │
│                                     │
└─────────────────────────────────────┘
```

### What to Do:
1. Click "Mark Contacted" button
2. See green message
3. **Refresh page (F5)**

### What Should Happen:
- ✅ Lead **STILL in "Contacted"** section
- ✅ Status change is saved
- ✅ Button changed to "Send Quote"

---

## STEP 4: Send Quote

```
┌─────────────────────────────────────┐
│         LEADS PAGE                  │
├─────────────────────────────────────┤
│                                     │
│  CONTACTED LEADS:                   │
│  Test Lead | 9999999999 | [Send Quote] │
│                                     │
│  Click [Send Quote]                 │
│         ↓                           │
│  ┌─────────────────────────────┐   │
│  │ Send Quote                  │   │
│  ├─────────────────────────────┤   │
│  │ Amount (₹): [5000      ]    │   │
│  │ Contract: [3 Months    ]    │   │
│  │ Details: [Test quote   ]    │   │
│  │                             │   │
│  │ [Send Quote]  [Cancel]      │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### What to Do:
1. Fill the form
2. Click "Send Quote"
3. See green message
4. **Refresh page (F5)**

### What Should Happen:
- ✅ Lead moves to **"Quote Sent"** section
- ✅ Quote data is saved
- ✅ Button changed to "Convert to Project"

---

## STEP 5: Convert to Project

```
┌─────────────────────────────────────┐
│         LEADS PAGE                  │
├─────────────────────────────────────┤
│                                     │
│  QUOTE SENT LEADS:                  │
│  Test Lead | 9999999999 | [Convert to Project] │
│                                     │
│  Click [Convert to Project]         │
│         ↓                           │
│  REDIRECTED TO PROJECTS PAGE        │
│         ↓                           │
│  ┌─────────────────────────────┐   │
│  │ Create New Work Order       │   │
│  ├─────────────────────────────┤   │
│  │ Customer: [Test Lead    ] ✓ │   │
│  │ Phone: [9999999999     ] ✓  │   │
│  │ Address: [Test Address ] ✓  │   │
│  │ Service: [Selected     ] ✓  │   │
│  │ Contract: [3 Months    ] ✓  │   │
│  │ Amount: [5000          ] ✓  │   │
│  │                             │   │
│  │ [Create Work Order]         │   │
│  └─────────────────────────────┘   │
│                                     │
│  ✓ Form is PRE-FILLED!              │
│                                     │
└─────────────────────────────────────┘
```

### What to Do:
1. Click "Convert to Project"
2. See form pre-filled with lead data
3. **Refresh page (F5)**

### What Should Happen:
- ✅ Form **STILL PRE-FILLED**
- ✅ All data is there
- ✅ No need to re-enter anything

---

## STEP 6: Create Work Order

```
┌─────────────────────────────────────┐
│         PROJECTS PAGE               │
├─────────────────────────────────────┤
│                                     │
│  Form is pre-filled                 │
│  Click [Create Work Order]          │
│         ↓                           │
│  ✓ "Work Order created successfully!"│
│         ↓                           │
│  New work order appears in table:   │
│  WO-1028 | Test Lead | Open | ...  │
│                                     │
│  **Refresh page (F5)**              │
│         ↓                           │
│  Work order STILL in table! ✓       │
│                                     │
└─────────────────────────────────────┘
```

### What to Do:
1. Click "Create Work Order"
2. See success message
3. **Refresh page (F5)**

### What Should Happen:
- ✅ Work order **STILL IN TABLE**
- ✅ All data is saved
- ✅ Status is "Open"

---

## STEP 7: Assign Service

```
┌─────────────────────────────────────┐
│         PROJECTS PAGE               │
├─────────────────────────────────────┤
│                                     │
│  Work order in table:               │
│  WO-1028 | Test Lead | [Edit]       │
│                                     │
│  Click [Edit] icon                  │
│         ↓                           │
│  Detail view opens                  │
│  Click [Assign Service]             │
│         ↓                           │
│  REDIRECTED TO SERVICES PAGE        │
│         ↓                           │
│  ┌─────────────────────────────┐   │
│  │ Assign Service Appointment  │   │
│  ├─────────────────────────────┤   │
│  │ Work Order: [WO-1028    ] ✓ │   │
│  │ Customer: [Test Lead    ] ✓ │   │
│  │ Address: [Test Address  ] ✓ │   │
│  │ Service: [Selected      ] ✓ │   │
│  │                             │   │
│  │ Date: [Select date     ]    │   │
│  │ Time: [Select time     ]    │   │
│  │ Technician: [Safeeq    ]    │   │
│  │                             │   │
│  │ [Assign Service]            │   │
│  └─────────────────────────────┘   │
│                                     │
│  ✓ Form is PRE-FILLED!              │
│                                     │
└─────────────────────────────────────┘
```

### What to Do:
1. Click "Edit" on work order
2. Click "Assign Service"
3. See form pre-filled
4. Fill date, time, technician
5. Click "Assign Service"
6. **Refresh page (F5)**

### What Should Happen:
- ✅ Service appointment **STILL IN TABLE**
- ✅ All data is saved
- ✅ Status is "Scheduled"

---

## Complete Success Scenario

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  LEADS PAGE                                          │
│  ├─ Create Lead ✓                                    │
│  ├─ Refresh → Data Still There ✓                     │
│  ├─ Mark Contacted ✓                                 │
│  ├─ Refresh → Status Still Changed ✓                 │
│  ├─ Send Quote ✓                                     │
│  ├─ Refresh → Quote Still There ✓                    │
│  └─ Convert to Project ✓                             │
│                                                      │
│  PROJECTS PAGE                                       │
│  ├─ Form Pre-filled ✓                                │
│  ├─ Refresh → Form Still Pre-filled ✓                │
│  ├─ Create Work Order ✓                              │
│  ├─ Refresh → Work Order Still There ✓               │
│  └─ Assign Service ✓                                 │
│                                                      │
│  SERVICES PAGE                                       │
│  ├─ Form Pre-filled ✓                                │
│  ├─ Refresh → Form Still Pre-filled ✓                │
│  ├─ Create Appointment ✓                             │
│  └─ Refresh → Appointment Still There ✓              │
│                                                      │
│  🎉 ALL DATA PERSISTS! 🎉                            │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## What You Should See (Success Messages)

### Green Success Messages:
```
✓ Lead created successfully!
✓ Lead marked as contacted
✓ Quote sent successfully!
✓ Work Order created successfully!
✓ Service appointment created successfully!
```

### Data Persistence:
```
✓ Leads stay in their sections after refresh
✓ Forms pre-fill with previous data
✓ Work orders appear in table after refresh
✓ Service appointments appear in table after refresh
```

---

## Quick Visual Checklist

```
Test 1: Create Lead
┌─────────────────────────────────────┐
│ Create → Refresh → Still There? ✓   │
└─────────────────────────────────────┘

Test 2: Mark Contacted
┌─────────────────────────────────────┐
│ Mark → Refresh → Status Changed? ✓  │
└─────────────────────────────────────┘

Test 3: Send Quote
┌─────────────────────────────────────┐
│ Send → Refresh → Quote Saved? ✓     │
└─────────────────────────────────────┘

Test 4: Convert to Project
┌─────────────────────────────────────┐
│ Convert → Refresh → Form Filled? ✓  │
└─────────────────────────────────────┘

Test 5: Create Work Order
┌─────────────────────────────────────┐
│ Create → Refresh → WO Saved? ✓      │
└─────────────────────────────────────┘

Test 6: Assign Service
┌─────────────────────────────────────┐
│ Assign → Refresh → Service Saved? ✓ │
└─────────────────────────────────────┘
```

---

## If All Tests Pass ✓

**Congratulations!** Your app is working correctly:
- ✅ Data saves automatically
- ✅ Data persists after refresh
- ✅ Forms pre-fill correctly
- ✅ Users see success messages
- ✅ No data loss

**The app is ready to use!** 🎉
