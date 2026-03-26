# Client Demo - Prototype Flow (Designer Friendly)

## Simple Demo for Your Client

This is a **5-minute prototype demo** showing the complete flow from Lead → Quote Viewed → Work Order.

---

## What Your Client Will See

### Screen 1: Leads Page
```
LEADS
├─ Lead: "Arun Sharma"
├─ Phone: "9876543210"
├─ Address: "12 MG Road, Kochi"
├─ Status: "Quote Sent"
├─ Quote Status: "✓ Viewed" (Eye icon)
└─ Action: "Convert to Project" (Button)
```

**What to say:**
"This is a lead with a quote that the customer has already viewed. 
Now we can convert it to a work order."

---

### Screen 2: Click "Convert to Project"
```
PROJECTS PAGE
├─ Form appears with PRE-FILLED DATA:
│  ├─ Customer Name: "Arun Sharma" ✓
│  ├─ Phone: "9876543210" ✓
│  ├─ Address: "12 MG Road, Kochi" ✓
│  ├─ Service: "Termite Treatment" ✓
│  ├─ Contract: "3 Months" ✓
│  ├─ Amount: "₹5,000" ✓
│  └─ [Create Work Order] Button
```

**What to say:**
"When we click 'Convert to Project', we're taken to the work order page. 
Notice the form is already filled with all the lead information. 
No need to re-enter anything!"

---

### Screen 3: Click "Create Work Order"
```
SUCCESS MESSAGE:
✓ "Lead 'Arun Sharma' has been converted to a Work Order"

WORK ORDERS TABLE:
├─ WO-1028 | Arun Sharma | Termite Treatment | Open
```

**What to say:**
"The work order is created instantly. 
We can see it in the table with status 'Open'."

---

### Screen 4: Click "Edit" on Work Order
```
WORK ORDER DETAIL VIEW:
├─ WO-1028 - Arun Sharma
├─ Lead Information
│  ├─ Name: Arun Sharma
│  ├─ Phone: 9876543210
│  └─ Address: 12 MG Road, Kochi
├─ Services
│  └─ 1. Termite Treatment
├─ Quote Details
│  ├─ Amount: ₹5,000
│  ├─ Contract: 3 Months
│  └─ Status: Viewed ✓
└─ [Assign Service] Button
```

**What to say:**
"Here's the complete work order detail. 
All the information is organized and easy to see. 
Now we can assign this service to a technician."

---

### Screen 5: Click "Assign Service"
```
SERVICES PAGE
├─ Form appears with PRE-FILLED DATA:
│  ├─ Work Order: "WO-1028" ✓
│  ├─ Customer: "Arun Sharma" ✓
│  ├─ Address: "12 MG Road, Kochi" ✓
│  ├─ Service: "Termite Treatment" ✓
│  ├─ Date: [Select date]
│  ├─ Time: [Select time]
│  ├─ Technician: [Select employee]
│  └─ [Assign Service] Button
```

**What to say:**
"Again, the form is pre-filled with the work order data. 
We just need to select the date, time, and which technician will do the work."

---

### Screen 6: Fill Details & Click "Assign Service"
```
SUCCESS MESSAGE:
✓ "Service assigned to Safeeq for Arun Sharma"

SERVICE APPOINTMENTS TABLE:
├─ SA-1 | WO-1028 | Arun Sharma | Safeeq | Scheduled
```

**What to say:**
"The service appointment is created and assigned to Safeeq. 
The entire workflow is complete!"

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  LEADS PAGE                                         │
│  Lead: Arun Sharma                                  │
│  Status: Quote Sent                                 │
│  Quote Status: ✓ Viewed                             │
│  Action: "Convert to Project" ← CLICK               │
│                                                     │
│  ↓                                                  │
│                                                     │
│  PROJECTS PAGE                                      │
│  Form PRE-FILLED with Lead Data ✓                   │
│  Customer: Arun Sharma                              │
│  Phone: 9876543210                                  │
│  Address: 12 MG Road, Kochi                         │
│  Service: Termite Treatment                         │
│  Amount: ₹5,000                                     │
│  Contract: 3 Months                                 │
│  [Create Work Order] ← CLICK                        │
│                                                     │
│  ↓                                                  │
│                                                     │
│  WORK ORDER CREATED                                 │
│  WO-1028 | Arun Sharma | Open                       │
│  [Edit] ← CLICK                                     │
│                                                     │
│  ↓                                                  │
│                                                     │
│  WORK ORDER DETAIL VIEW                             │
│  All information displayed                          │
│  [Assign Service] ← CLICK                           │
│                                                     │
│  ↓                                                  │
│                                                     │
│  SERVICES PAGE                                      │
│  Form PRE-FILLED with Work Order Data ✓             │
│  Work Order: WO-1028                                │
│  Customer: Arun Sharma                              │
│  Address: 12 MG Road, Kochi                         │
│  Service: Termite Treatment                         │
│  Date: [Select]                                     │
│  Time: [Select]                                     │
│  Technician: [Select]                               │
│  [Assign Service] ← CLICK                           │
│                                                     │
│  ↓                                                  │
│                                                     │
│  SERVICE APPOINTMENT CREATED                        │
│  SA-1 | WO-1028 | Arun Sharma | Safeeq | Scheduled │
│                                                     │
│  ✓ WORKFLOW COMPLETE!                               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Demo Script (What to Say to Client)

### Opening (30 seconds)
"Let me show you how the system works. 
We have a lead with a quote that the customer has viewed. 
Now we'll convert it to a work order and assign it to a technician."

### At Leads Page (30 seconds)
"Here's the lead 'Arun Sharma'. 
The quote status shows 'Viewed' with an eye icon. 
The action button is 'Convert to Project'."

### At Pre-filled Form (1 minute)
"When we click 'Convert to Project', we go to the work order page. 
Notice the form is already filled with all the lead information. 
This saves time and reduces errors."

### At Work Order Created (30 seconds)
"The work order is created instantly. 
We can see it in the table with status 'Open'."

### At Work Order Details (30 seconds)
"Here's the complete work order detail. 
All the information is organized and easy to see."

### At Service Assignment (1 minute)
"Now we assign this to a technician. 
Again, the form is pre-filled with the work order data. 
We just select the date, time, and technician."

### At Service Created (30 seconds)
"The service appointment is created and assigned. 
The workflow is complete!"

### Closing (30 seconds)
"Key benefits:
- Forms pre-fill automatically
- No need to re-enter information
- Clear workflow from lead to service
- Everything saves automatically"

---

## How to Give the Demo

### Before Demo
1. Open the app
2. Go to Leads page
3. Have the lead "Arun Sharma" visible with "Quote Sent" status

### During Demo
1. **Point and Click** - Use your mouse to show what you're clicking
2. **Pause Between Steps** - Let client see each screen
3. **Explain Each Step** - Tell them what's happening
4. **Highlight Pre-filled Data** - Show how data flows between pages
5. **Show Success Messages** - Confirm actions worked

### After Demo
1. Ask if they have questions
2. Explain the benefits
3. Show how it saves time
4. Discuss next steps

---

## Key Points to Highlight

### Point 1: Status-Based Actions
"The action button changes based on the quote status. 
When viewed, it shows 'Convert to Project'."

### Point 2: Form Pre-filling
"All the data is automatically pre-filled. 
No need to re-enter information."

### Point 3: Data Flow
"Data flows smoothly from Lead → Project → Service."

### Point 4: Time Saving
"This workflow saves time and reduces errors."

### Point 5: User Friendly
"The interface is clean and easy to use."

---

## Demo Timing

- **Opening**: 30 seconds
- **Leads Page**: 30 seconds
- **Pre-filled Form**: 1 minute
- **Work Order Created**: 30 seconds
- **Work Order Details**: 30 seconds
- **Service Assignment**: 1 minute
- **Service Created**: 30 seconds
- **Closing**: 30 seconds

**Total: 5 minutes**

---

## What Client Will See

✅ **Lead with viewed quote**  
✅ **Convert to Project button**  
✅ **Pre-filled work order form**  
✅ **Work order created**  
✅ **Work order details**  
✅ **Pre-filled service form**  
✅ **Service appointment created**  

---

## Client Questions & Answers

**Q: Why is the form pre-filled?**
A: "The system automatically retrieves the previous data and fills the form. This saves time and reduces errors."

**Q: What if I need to change the data?**
A: "You can edit any field before submitting."

**Q: Does the data save automatically?**
A: "Yes, all data saves automatically."

**Q: Can I go back?**
A: "Yes, you can navigate back and the data will still be there."

---

## That's It! 🎉

You now have a simple 5-minute prototype demo to show your client:
- ✓ Lead with viewed quote
- ✓ Convert to Project (pre-filled form)
- ✓ Create Work Order
- ✓ Assign Service (pre-filled form)
- ✓ Service Appointment Created

**Ready to demo!** 🚀
